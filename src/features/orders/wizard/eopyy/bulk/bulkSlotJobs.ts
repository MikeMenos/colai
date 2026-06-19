import type { AiClient } from "@/lib/utils/ai";
import type { BulkDraftSnapshot } from "@/store/orders/ordersSlice";

export type BulkSlotPhase =
  | "idle"
  | "running-ai"
  | "applying-ai"
  | "saving"
  | "saved"
  | "error";

export type BulkSlotJob = {
  slotId: string;
  orderUid: string;
  runSeq: number;
  phase: BulkSlotPhase;
  aiRunningClient: AiClient | null;
  aiDisabledClients: AiClient[];
  draft: BulkDraftSnapshot | null;
  message: string | null;
  aiErrorMessage: string | null;
  abortController: AbortController | null;
};

const jobs = new Map<string, BulkSlotJob>();

export function getBulkSlotJob(slotId: string): BulkSlotJob | undefined {
  return jobs.get(slotId);
}

export function ensureBulkSlotJob(slotId: string, orderUid: string): BulkSlotJob {
  const existing = jobs.get(slotId);
  if (existing) {
    existing.orderUid = orderUid;
    return existing;
  }
  const job: BulkSlotJob = {
    slotId,
    orderUid,
    runSeq: 0,
    phase: "idle",
    aiRunningClient: null,
    aiDisabledClients: [],
    draft: null,
    message: null,
    aiErrorMessage: null,
    abortController: null,
  };
  jobs.set(slotId, job);
  return job;
}

export function beginSlotRun(
  slotId: string,
  orderUid: string,
  aiclient: AiClient,
): number {
  const job = ensureBulkSlotJob(slotId, orderUid);
  job.abortController?.abort();
  job.runSeq += 1;
  job.orderUid = orderUid;
  job.phase = "running-ai";
  job.aiRunningClient = aiclient;
  job.message = null;
  job.aiErrorMessage = null;
  job.abortController = new AbortController();
  return job.runSeq;
}

export function isStaleSlotRun(slotId: string, runSeq: number): boolean {
  return jobs.get(slotId)?.runSeq !== runSeq;
}

export function patchBulkSlotJob(
  slotId: string,
  patch: Partial<
    Pick<
      BulkSlotJob,
      | "phase"
      | "aiRunningClient"
      | "aiDisabledClients"
      | "draft"
      | "message"
      | "aiErrorMessage"
    >
  >,
): void {
  const job = jobs.get(slotId);
  if (!job) return;
  Object.assign(job, patch);
}

export function removeBulkSlotJob(slotId: string): void {
  const job = jobs.get(slotId);
  job?.abortController?.abort();
  jobs.delete(slotId);
}

export function getSlotAbortSignal(
  slotId: string,
): AbortSignal | undefined {
  return jobs.get(slotId)?.abortController?.signal;
}
