"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  buildOrderEditParams,
  fetchOrderEdit,
} from "@/lib/api/orderDraft";
import type { AiClient } from "@/lib/utils/ai";
import { startBulkSlotPipeline } from "./processBulkOrderSlot";
import {
  bulkJobToSlotPatch,
  createEmptyBulkSlot,
  countSavedBulkSlots,
} from "./bulkSlotUtils";
import {
  ensureBulkSlotJob,
  patchBulkSlotJob,
  removeBulkSlotJob,
} from "./bulkSlotJobs";
import type { BulkOrderSlot } from "./types";
import { MAX_BULK_SLOTS } from "./types";

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
    (slotId: string, aiclient: AiClient) => {
      const slot = slotsRef.current.find((s) => s.id === slotId);
      if (!slot?.orderUid || slot.groupEoppyId == null) return;

      startBulkSlotPipeline(
        dispatch,
        slotId,
        slot.orderUid,
        slot.groupEoppyId,
        aiclient,
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
