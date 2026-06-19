import type { BulkOrderSlot, BulkSlotStatus } from "./types";
import type { BulkSlotJob, BulkSlotPhase } from "./bulkSlotJobs";
import type { AiStatus } from "@/lib/utils/ai";
import { isBlank } from "@/lib/utils/string";
import type { EopyDocument } from "@/types/api/schemas";

export const BULK_NEW_PERSON_NO_SAVE_MESSAGE =
  "Το περιστατικό είναι νέο και δεν μπορεί να αποθηκευτεί η παραγγελία.";

export function isBulkNewPersonFromRunAi(jsonDoc: EopyDocument): boolean {
  return isBlank(jsonDoc.person_erpid);
}

const ACTIVE_PHASES: BulkSlotPhase[] = [
  "running-ai",
  "applying-ai",
  "saving",
];

export function isBulkSlotBusy(phase: BulkSlotPhase): boolean {
  return ACTIVE_PHASES.includes(phase);
}

export function shouldShowBulkAiButtons(slot: BulkOrderSlot): boolean {
  if (!slotHasRecipeFiles(slot)) return false;
  if (slot.status === "saved") return false;
  if (isBulkSlotBusy(slot.phase)) return true;
  return true;
}

export function createBulkSlotId() {
  return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyBulkSlot(): BulkOrderSlot {
  return {
    id: createBulkSlotId(),
    orderUid: null,
    groupEoppyId: null,
    files: [],
    status: "initializing",
    phase: "idle",
    statusMessage: null,
    aiStatus: "idle",
    aiMessage: null,
    aiRunningClient: null,
    aiDisabledClients: [],
  };
}

export function getBulkSlotStatusBadge(
  status: BulkSlotStatus,
): { label: string; variant: string } | null {
  if (status === "saved") {
    return { label: "Σε αναμονή", variant: "warning" };
  }
  return null;
}

export function isBulkSlotUploadDisabled(slot: BulkOrderSlot): boolean {
  return (
    slot.status === "initializing" ||
    slot.phase === "applying-ai" ||
    slot.phase === "saving" ||
    !slot.orderUid
  );
}

export function slotHasRecipeFiles(slot: BulkOrderSlot): boolean {
  return slot.files.some((f) => f.documentCategory === "recipe");
}

export function countSavedBulkSlots(slots: BulkOrderSlot[]): number {
  return slots.filter((slot) => slot.status === "saved").length;
}

export function bulkJobToSlotPatch(job: BulkSlotJob): Partial<BulkOrderSlot> {
  const status: BulkSlotStatus =
    job.phase === "saved"
      ? "saved"
      : job.phase === "error"
        ? "ready"
        : isBulkSlotBusy(job.phase)
          ? "processing"
          : "ready";

  const aiStatus: AiStatus = isBulkSlotBusy(job.phase)
    ? "running"
    : job.phase === "error"
      ? "error"
      : job.phase === "saved"
        ? "done"
        : "idle";

  return {
    status,
    phase: job.phase,
    aiStatus,
    aiRunningClient: job.aiRunningClient,
    aiDisabledClients: job.aiDisabledClients,
    aiMessage: job.aiErrorMessage,
    statusMessage: job.phase === "error" ? job.message : null,
  };
}
