"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  buildOrderEditParams,
  fetchOrderEdit,
} from "@/lib/api/orderDraft";
import { getAiClientsByPriority } from "@/lib/utils/ai";
import { registerBulkLeaveGuard } from "./bulkLeaveGuard";
import { startBulkSlotPipeline } from "./processBulkOrderSlot";
import {
  abortAllBulkSlotJobs,
  abortBulkSlotJob,
  ensureBulkSlotJob,
  getBulkSlotJob,
  patchBulkSlotJob,
  removeBulkSlotJob,
} from "./bulkSlotJobs";
import {
  bulkJobToSlotPatch,
  countSavedBulkSlots,
  createEmptyBulkSlot,
  hasBulkWizardUploadedContent,
} from "./bulkSlotUtils";
import type { BulkOrderSlot } from "./types";
import { MAX_BULK_SLOTS } from "./types";

function slotsChanged(a: BulkOrderSlot[], b: BulkOrderSlot[]): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export function useBulkOrderSlots() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);
  const [slots, setSlots] = React.useState<BulkOrderSlot[]>([
    createEmptyBulkSlot(),
  ]);
  const slotsRef = React.useRef(slots);
  const initStartedRef = React.useRef(new Set<string>());

  React.useEffect(() => {
    slotsRef.current = slots;
  }, [slots]);

  React.useEffect(() => {
    return registerBulkLeaveGuard({
      hasContent: () => hasBulkWizardUploadedContent(slotsRef.current),
      abortAll: abortAllBulkSlotJobs,
    });
  }, []);

  const syncSlotFromJob = React.useCallback((slotId: string) => {
    return (job: Parameters<typeof bulkJobToSlotPatch>[0]) => {
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, ...bulkJobToSlotPatch(job) } : slot,
        ),
      );
    };
  }, []);

  const updateSlot = React.useCallback(
    (slotId: string, patch: Partial<BulkOrderSlot>) => {
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === slotId ? { ...slot, ...patch } : slot,
        ),
      );
    },
    [],
  );

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      const synced = slotsRef.current.map((slot) => {
        const job = getBulkSlotJob(slot.id);
        if (!job || job.phase === "idle") return slot;
        return { ...slot, ...bulkJobToSlotPatch(job) };
      });
      if (!slotsChanged(slotsRef.current, synced)) return;
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
    setSlots((prev) => {
      if (prev.length >= MAX_BULK_SLOTS) return prev;
      return [...prev, createEmptyBulkSlot()];
    });
  }, []);

  const removeSlot = React.useCallback((slotId: string) => {
    removeBulkSlotJob(slotId);
    setSlots((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((slot) => slot.id !== slotId);
    });
  }, []);

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

  const handleCancelSlot = React.useCallback(
    (slotId: string) => {
      abortBulkSlotJob(slotId);
      updateSlot(slotId, {
        status: "ready",
        phase: "idle",
        aiStatus: "idle",
        aiRunningClient: null,
        aiMessage: null,
        statusMessage: null,
      });
    },
    [updateSlot],
  );

  const hasUploadedContent = hasBulkWizardUploadedContent(slots);

  return {
    slots,
    addSlot,
    removeSlot,
    updateSlot,
    handleFilesChange,
    handleRunAi,
    handleCancelSlot,
    abortAllJobs: abortAllBulkSlotJobs,
    hasUploadedContent,
    canAddMore: slots.length < MAX_BULK_SLOTS,
    savedCount: countSavedBulkSlots(slots),
  };
}
