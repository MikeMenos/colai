import type { AppDispatch } from "@/store/store";
import type { RootState } from "@/store/store";
import type { AiClient } from "@/lib/utils/ai";
import { fetchOrders, fetchPendingOrdersCount } from "@/store/orders/ordersSlice";
import { EOPPY_AI_TIMEOUT_MS } from "../wizard/runEoppyAiWithFallback";
import {
  beginSlotRun,
  getBulkSlotJob,
  getSlotAbortSignal,
  isStaleSlotRun,
  patchBulkSlotJob,
  type BulkSlotJob,
} from "./bulkSlotJobs";
import { loadSlotDraft } from "./loadSlotDraft";
import { fetchRunAi } from "./fetchRunAi";
import { applyAiToSlotDraft } from "./slotDraftReduxBridge";
import { submitSlotDraft } from "./submitSlotDraft";
import {
  BULK_NEW_PERSON_NO_SAVE_MESSAGE,
  isBulkNewPersonFromRunAi,
} from "./bulkSlotUtils";
import type { BulkDraftSnapshot } from "@/store/orders/ordersSlice";

export type BulkSlotJobListener = (job: BulkSlotJob) => void;

type BulkSlotAuth = RootState["auth"];

let pendingCountTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePendingCountRefresh(dispatch: AppDispatch): void {
  if (pendingCountTimer) clearTimeout(pendingCountTimer);
  pendingCountTimer = setTimeout(() => {
    pendingCountTimer = null;
    void dispatch(fetchPendingOrdersCount({ force: true }));
  }, 400);
}

async function refreshOrdersList(dispatch: AppDispatch): Promise<void> {
  await dispatch(fetchOrders({ force: true }));
  schedulePendingCountRefresh(dispatch);
}

function patchAndNotify(
  slotId: string,
  patch: Parameters<typeof patchBulkSlotJob>[1],
  onJobChange?: BulkSlotJobListener,
) {
  patchBulkSlotJob(slotId, patch);
  const job = getBulkSlotJob(slotId);
  if (job && onJobChange) onJobChange(job);
}

async function saveBulkSlotDraft(
  dispatch: AppDispatch,
  slotId: string,
  draft: BulkDraftSnapshot,
  auth: BulkSlotAuth,
  runSeq: number,
  aiErrorMessage: string | null,
  onJobChange?: BulkSlotJobListener,
): Promise<void> {
  draft.order.isRecurringOrder = 1;
  draft.order.isTempSave = 1;

  patchAndNotify(slotId, { draft, phase: "saving" }, onJobChange);

  const save = await submitSlotDraft(draft, auth);
  if (isStaleSlotRun(slotId, runSeq)) return;

  if (save.result) {
    await refreshOrdersList(dispatch);
    patchAndNotify(
      slotId,
      {
        phase: "saved",
        aiRunningClient: null,
        aiErrorMessage,
        message: null,
      },
      onJobChange,
    );
    return;
  }

  patchAndNotify(
    slotId,
    {
      phase: "error",
      aiRunningClient: null,
      aiErrorMessage: null,
      message: save.message || "Αποτυχία αποθήκευσης.",
    },
    onJobChange,
  );
}

export function startBulkSlotPipeline(
  dispatch: AppDispatch,
  slotId: string,
  orderUid: string,
  groupEoppyId: number,
  aiclient: AiClient,
  auth: BulkSlotAuth,
  onJobChange?: BulkSlotJobListener,
): void {
  const runSeq = beginSlotRun(slotId, orderUid, aiclient);
  patchAndNotify(
    slotId,
    { phase: "running-ai", aiRunningClient: aiclient, message: null, aiErrorMessage: null },
    onJobChange,
  );

  void (async () => {
    try {
      const controller = new AbortController();
      const parentSignal = getSlotAbortSignal(slotId);
      const onParentAbort = () => controller.abort();
      parentSignal?.addEventListener("abort", onParentAbort);

      const timeout = window.setTimeout(
        () => controller.abort(),
        EOPPY_AI_TIMEOUT_MS,
      );

      let aiResult;
      try {
        aiResult = await fetchRunAi(
          orderUid,
          groupEoppyId,
          aiclient,
          controller.signal,
        );
      } finally {
        window.clearTimeout(timeout);
        parentSignal?.removeEventListener("abort", onParentAbort);
      }

      if (isStaleSlotRun(slotId, runSeq)) return;

      if (
        aiResult.data?.isSuccess &&
        aiResult.data.jsonDoc &&
        isBulkNewPersonFromRunAi(aiResult.data.jsonDoc)
      ) {
        patchAndNotify(
          slotId,
          {
            phase: "error",
            aiRunningClient: null,
            aiErrorMessage: BULK_NEW_PERSON_NO_SAVE_MESSAGE,
            message: null,
          },
          onJobChange,
        );
        return;
      }

      const draft = await loadSlotDraft(orderUid, auth);
      if (isStaleSlotRun(slotId, runSeq)) return;

      let draftToSave = draft;
      if (aiResult.data?.isSuccess && aiResult.data.jsonDoc) {
        patchAndNotify(slotId, { phase: "applying-ai" }, onJobChange);
        draftToSave = await applyAiToSlotDraft(dispatch, draft, aiResult.data);
        if (isStaleSlotRun(slotId, runSeq)) return;
      }

      await saveBulkSlotDraft(
        dispatch,
        slotId,
        draftToSave,
        auth,
        runSeq,
        aiResult.errorMessage,
        onJobChange,
      );
    } catch (e: unknown) {
      if (isStaleSlotRun(slotId, runSeq)) return;
      if (e instanceof DOMException && e.name === "AbortError") return;

      const message =
        e instanceof Error ? e.message : "Κάτι πήγε στραβά κατά την επεξεργασία.";

      patchAndNotify(
        slotId,
        {
          phase: "error",
          aiRunningClient: null,
          aiErrorMessage: null,
          message,
        },
        onJobChange,
      );
    }
  })();
}
