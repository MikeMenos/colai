import { parseJson } from "@/lib/api/client";
import type { RunAiApiResponse } from "@/types/api/responses";
import type { RunAIFileAnalysisReq } from "@/types/api/schemas";
import type { Order } from "@/types/orders";
import type { AiClient } from "@/lib/utils/ai";
import type { RunEoppyAiParams } from "./types";
import { applyRunAiResponse } from "./applyRunAiResponse";
import { setShowConsentForm } from "@/store/orders/ordersSlice";

function normalizeShowConsentForm(value: unknown): boolean | null {
  if (value === 1 || value === true) return true;
  if (value === 0 || value === false) return false;

  const text = String(value ?? "")
    .trim()
    .toLowerCase();
  if (text === "1" || text === "true") return true;
  if (text === "0" || text === "false") return false;

  return null;
}

export function buildEoppyRunAiPayload(
  order: Pick<Order, "uid" | "group_EOPPY_id">,
  aiclient: AiClient,
  skipLastPage: boolean,
): RunAIFileAnalysisReq {
  return {
    order_uid: order.uid,
    catid: order.group_EOPPY_id,
    aiclient,
    skip_last_page: skipLastPage,
  };
}

export async function runEoppyAi({
  dispatch,
  orderUid,
  groupEoppyId,
  aiclient,
  skipLastPage,
  signal,
}: RunEoppyAiParams): Promise<void> {
  const res = await fetch("/api/orders/runai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      buildEoppyRunAiPayload(
        { uid: orderUid ?? "", group_EOPPY_id: groupEoppyId ?? 0 },
        aiclient,
        skipLastPage,
      ),
    ),
    signal,
  });

  const response = await parseJson<RunAiApiResponse>(res);
  if (!res.ok || response?.ok === false || response?.result === false) {
    throw new Error(
      `Το αίτημα ΑΙ δεν ήταν επιτυχές. Εισάγετε τα στοιχεία χειροκίνητα ή προσπαθήστε με ${aiclient === "Claude" ? "Claude" : "Gemini"}.`,
    );
  }

  const data = response.data;
  if (!data?.isSuccess || !data.jsonDoc) {
    throw new Error(
      data?.errorMessage ||
        data?.message ||
        `Το αίτημα ΑΙ δεν ήταν επιτυχές. Εισάγετε τα στοιχεία χειροκίνητα ή προσπαθήστε με ${aiclient === "Claude" ? "Gemini" : "Claude"}.`,
    );
  }

  const showConsentForm = normalizeShowConsentForm(response.showConsentForm);
  dispatch(setShowConsentForm(showConsentForm === true));

  await applyRunAiResponse(dispatch, data);
}
