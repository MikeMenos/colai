import { applyRunAiResponse } from "../wizard/applyRunAiResponse";
import {
  captureBulkDraftSnapshot,
  replaceDraftSnapshot,
  type BulkDraftSnapshot,
} from "@/store/orders/ordersSlice";
import type { AppDispatch } from "@/store/store";
import { store } from "@/store/store";
import type { ReadEoppyDoc_Response } from "@/types/api/schemas";

let applyMutex: Promise<void> = Promise.resolve();

function withApplyMutex<T>(task: () => Promise<T>): Promise<T> {
  const run = applyMutex.then(task);
  applyMutex = run.then(() => undefined).catch(() => undefined);
  return run;
}

/** Apply run-ai response to an isolated slot draft (uses Redux briefly under a mutex). */
export async function applyAiToSlotDraft(
  dispatch: AppDispatch,
  snapshot: BulkDraftSnapshot,
  data: ReadEoppyDoc_Response,
): Promise<BulkDraftSnapshot> {
  return withApplyMutex(async () => {
    dispatch(replaceDraftSnapshot(snapshot));
    await applyRunAiResponse(dispatch, data);
    return captureBulkDraftSnapshot(store.getState());
  });
}
