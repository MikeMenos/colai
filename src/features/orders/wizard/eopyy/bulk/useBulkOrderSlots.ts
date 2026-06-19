"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  buildOrderEditParams,
  fetchOrderEdit,
} from "@/lib/api/orderDraft";
import { getAiClientsByPriority } from "@/lib/utils/ai";
import { startBulkSlotPipeline } from "./processBulkOrderSlot";
import {
  bulkJobToSlotPatch,
  countSavedBulkSlots,
  createEmptyBulkSlot,
} from "./bulkSlotUtils";
import {
  ensureBulkSlotJob,
  getBulkSlotJob,
  patchBulkSlotJob,
  removeBulkSlotJob,
} from "./bulkSlotJobs";
import {
  getInitialBulkSlots,
  mergePersistedBulkSlotsWithJobs,
  persistBulkSlotsToStorage,
} from "./bulkStorage";
import type { BulkOrderSlot } from "./types";
import { MAX_BULK_SLOTS } from "./types";

function slotsChanged(a: BulkOrderSlot[], b: BulkOrderSlot[]): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export function useBulkOrderSlots() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const [slots, setSlots] = React.useState<BulkOrderSlot[]>(getInitialBulkSlots);
  const slotsRef = React.useRef(slots);
  const initStartedRef = React.useRef(new Set<string>());
  const jobsHydratedRef = React.useRef(false);

  React.useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  const commitSlots = React.useCallback(
    (updater: (prev: BulkOrderSlot[]) => BulkOrderSlot[]) => {
      setSlots((prev) => {
        const next = updater(prev);
        if (next === prev) return prev;
        slotsRef.current = next;
        persistBulkSlotsToStorage(next);
        return next;
      });
    },
    [],
  );

  const syncSlotFromJob = React.useCallback((slotId: string) => {
    return (job: Parameters<typeof bulkJobToSlotPatch>[0]) => {
      const patch = bulkJobToSlotPatch(job);
      const next = slotsRef.current.map((slot) =>
        slot.id === slotId ? { ...slot, ...patch } : slot,
      );
      slotsRef.current = next;
      persistBulkSlotsToStorage(next);
      setSlots(next);
    };
  }, []);

  const updateSlot = React.useCallback(
    (slotId: string, patch: Partial<BulkOrderSlot>) => {
      commitSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, ...patch } : slot,
        ),
      );
    },
    [commitSlots],
  );

  React.useEffect(() => {
    if (jobsHydratedRef.current) return;
    jobsHydratedRef.current = true;

    for (const slot of slotsRef.current) {
      if (slot.orderUid) {
        initStartedRef.current.add(slot.id);
        ensureBulkSlotJob(slot.id, slot.orderUid);
      }
    }

    const synced = mergePersistedBulkSlotsWithJobs(
      slotsRef.current,
      getBulkSlotJob,
    );
    if (slotsChanged(slotsRef.current, synced)) {
      slotsRef.current = synced;
      persistBulkSlotsToStorage(synced);
      setSlots(synced);
    }
  }, []);

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      const synced = mergePersistedBulkSlotsWithJobs(
        slotsRef.current,
        getBulkSlotJob,
      );
      if (!slotsChanged(slotsRef.current, synced)) return;
      slotsRef.current = synced;
      persistBulkSlotsToStorage(synced);
      setSlots(synced);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const initializeSlot = React.useCallback(
    async (slotId: string) => {
      try {
        const params = buildOrderEditParams("eopyy", 4, auth);
        const response = await fetchOrderEdit(params);
        const order = response.data?.order;

        if (!response.ok || !order?.uid) {
          throw new Error("Αποτυχία δημιουργίας.");
        }

        const orderUid = String(order.uid);
        const groupEoppyId = order.group_EOPPY_id ?? 4;
        ensureBulkSlotJob(slotId, orderUid);

        updateSlot(slotId, {
          orderUid,
          groupEoppyId,
          status: "ready",
          phase: "idle",
          statusMessage: null,
        });
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Αποτυχία δημιουργίας.";
        updateSlot(slotId, { status: "error", statusMessage: message });
      }
    },
    [auth, updateSlot],
  );

  React.useEffect(() => {
    for (const slot of slots) {
      if (
        slot.status === "initializing" &&
        !initStartedRef.current.has(slot.id)
      ) {
        initStartedRef.current.add(slot.id);
        void initializeSlot(slot.id);
      }
    }
  }, [slots, initializeSlot]);

  const addSlot = React.useCallback(() => {
    commitSlots((prev) => {
      if (prev.length >= MAX_BULK_SLOTS) return prev;
      return [...prev, createEmptyBulkSlot()];
    });
  }, [commitSlots]);

  const removeSlot = React.useCallback(
    (slotId: string) => {
      removeBulkSlotJob(slotId);
      commitSlots((prev) => {
        if (prev.length <= 1) return prev;
        return prev.filter((slot) => slot.id !== slotId);
      });
    },
    [commitSlots],
  );

  const handleFilesChange = React.useCallback(
    (slotId: string, files: BulkOrderSlot["files"]) => {
      const slot = slotsRef.current.find((s) => s.id === slotId);
      const wasSaved = slot?.status === "saved";

      if (wasSaved) {
        patchBulkSlotJob(slotId, {
          phase: "idle",
          aiDisabledClients: [],
          message: null,
          aiRunningClient: null,
        });
      }

      updateSlot(slotId, {
        files,
        ...(wasSaved
          ? {
              status: "ready" as const,
              phase: "idle" as const,
              aiStatus: "idle" as const,
              aiMessage: null,
              statusMessage: null,
              aiDisabledClients: [],
            }
          : {}),
      });
    },
    [updateSlot],
  );

  const handleRunAi = React.useCallback(
    (slotId: string) => {
      const slot = slotsRef.current.find((s) => s.id === slotId);
      if (!slot?.orderUid || slot.groupEoppyId == null) return;

      const aiclients = getAiClientsByPriority(auth.availableAiClients);

      startBulkSlotPipeline(
        dispatch,
        slotId,
        slot.orderUid,
        slot.groupEoppyId,
        aiclients,
        auth,
        syncSlotFromJob(slotId),
      );
    },
    [auth, dispatch, syncSlotFromJob],
  );

  return {
    slots,
    addSlot,
    removeSlot,
    updateSlot,
    handleFilesChange,
    handleRunAi,
    canAddMore: slots.length < MAX_BULK_SLOTS,
    savedCount: countSavedBulkSlots(slots),
  };
}
