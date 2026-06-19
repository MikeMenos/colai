import type { AiClient, AiStatus } from "@/lib/utils/ai";
import type { OrderFile } from "@/types/orders";
import type { BulkSlotPhase } from "./bulkSlotJobs";

export type BulkSlotStatus =
  | "initializing"
  | "ready"
  | "processing"
  | "saved"
  | "error";

export type BulkOrderSlot = {
  id: string;
  orderUid: string | null;
  groupEoppyId: number | null;
  files: OrderFile[];
  status: BulkSlotStatus;
  phase: BulkSlotPhase;
  statusMessage: string | null;
  aiStatus: AiStatus;
  aiMessage: string | null;
  aiRunningClient: AiClient | null;
  aiDisabledClients: AiClient[];
};

export const MAX_BULK_SLOTS = 10;

export const BULK_AI_CLIENTS: AiClient[] = ["Claude", "Gemini"];
