import type { AppDispatch } from "@/store/store";
import type { AiClient } from "@/lib/utils/ai";
import { DEFAULT_AI_CLIENTS } from "@/lib/utils/ai";
import { runEoppyAi } from "./runEoppyAi";

export const EOPPY_AI_TIMEOUT_MS = 120_000;

export const EOPPY_AI_CLIENTS: AiClient[] = DEFAULT_AI_CLIENTS;

export async function runEoppyAiWithFallback({
  dispatch,
  orderUid,
  groupEoppyId,
  skipLastPage = true,
  timeoutMs = EOPPY_AI_TIMEOUT_MS,
  clients = EOPPY_AI_CLIENTS,
}: {
  dispatch: AppDispatch;
  orderUid: string;
  groupEoppyId: number;
  skipLastPage?: boolean;
  timeoutMs?: number;
  clients?: AiClient[];
}): Promise<boolean> {
  for (const aiclient of clients) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      await runEoppyAi({
        dispatch,
        orderUid,
        groupEoppyId,
        aiclient,
        skipLastPage,
        signal: controller.signal,
      });
      return true;
    } catch {
      // Try the next AI client.
    } finally {
      window.clearTimeout(timeout);
    }
  }

  return false;
}
