import type { BulkSlotJob } from "./bulkSlotJobs";
import { getBulkSlotJob } from "./bulkSlotJobs";
import type { BulkOrderSlot } from "./types";
import {
  bulkJobToSlotPatch,
  createEmptyBulkSlot,
  hasBulkSlotsPendingRunAi,
  hasPersistedBulkSession,
  isBulkSlotBusy,
} from "./bulkSlotUtils";

export const EOPPY_BULK_LS_KEY = "eopyyBulk";

type BulkJobLookup = (slotId: string) => BulkSlotJob | undefined;

function hydrateBulkSlotFromStorage(slot: BulkOrderSlot): BulkOrderSlot {
  if (slot.status === "saved") {
    return {
      ...slot,
      phase: "saved",
      aiStatus: "done",
      aiRunningClient: null,
    };
  }

  if (isBulkSlotBusy(slot.phase) || slot.status === "processing") {
    return {
      ...slot,
      status: "ready",
      phase: "idle",
      aiStatus: "idle",
      aiRunningClient: null,
    };
  }

  if (slot.status === "initializing" && slot.orderUid) {
    return { ...slot, status: "ready" };
  }

  return slot;
}

export function loadBulkSlotsFromStorage(): BulkOrderSlot[] | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(EOPPY_BULK_LS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length === 0) return null;

    return parsed
      .filter((slot): slot is BulkOrderSlot => slot != null && typeof slot === "object")
      .map(hydrateBulkSlotFromStorage);
  } catch {
    return null;
  }
}

export function clearBulkSlotsStorage(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(EOPPY_BULK_LS_KEY);
  } catch {
    // ignore quota / private mode issues
  }
}

export function mergePersistedBulkSlotsWithJobs(
  slots: BulkOrderSlot[],
  getJob: BulkJobLookup,
): BulkOrderSlot[] {
  return slots.map((slot) => {
    const job = getJob(slot.id);
    if (!job || job.phase === "idle") return slot;
    return { ...slot, ...bulkJobToSlotPatch(job) };
  });
}

export function persistBulkSlotsToStorage(
  slots: BulkOrderSlot[],
  getJob: BulkJobLookup = getBulkSlotJob,
): void {
  if (typeof window === "undefined") return;

  const effective = mergePersistedBulkSlotsWithJobs(slots, getJob);
  if (!hasPersistedBulkSession(effective)) {
    clearBulkSlotsStorage();
    return;
  }

  try {
    window.localStorage.setItem(EOPPY_BULK_LS_KEY, JSON.stringify(effective));
  } catch {
    // ignore quota / private mode issues
  }
}

/** Clears storage when leaving the bulk page unless a run-AI pipeline is still active. */
export function clearBulkSlotsStorageIfNothingPending(
  getJob: BulkJobLookup = getBulkSlotJob,
): void {
  const slots = loadBulkSlotsFromStorage();
  if (!slots?.length) return;

  const effective = mergePersistedBulkSlotsWithJobs(slots, getJob);
  if (!hasBulkSlotsPendingRunAi(effective)) {
    clearBulkSlotsStorage();
  }
}

export function getInitialBulkSlots(): BulkOrderSlot[] {
  const stored = loadBulkSlotsFromStorage();
  if (!stored?.length) return [createEmptyBulkSlot()];

  const effective = mergePersistedBulkSlotsWithJobs(stored, getBulkSlotJob);
  if (!hasPersistedBulkSession(effective)) {
    clearBulkSlotsStorage();
    return [createEmptyBulkSlot()];
  }

  return effective;
}

/** Keeps localStorage in sync when the pipeline updates a slot in the background. */
export function patchPersistedBulkSlotFromJob(job: BulkSlotJob): void {
  const slots = loadBulkSlotsFromStorage();
  if (!slots?.length) return;

  const patch = bulkJobToSlotPatch(job);
  const next = slots.map((slot) =>
    slot.id === job.slotId ? { ...slot, ...patch } : slot,
  );

  persistBulkSlotsToStorage(next);
}
