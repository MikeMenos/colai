import { parseJson } from "@/lib/api/client";
import type { AppDispatch } from "@/store/store";
import type { RunAiApiResponse } from "@/types/api/responses";
import type { RunAIFileAnalysisReq } from "@/types/api/schemas";
import type { Order } from "@/types/orders";
import type { AiClient } from "@/lib/utils/ai";
import type { RunEoppyAiParams } from "./types";
import { applyRunAiResponse } from "./applyRunAiResponse";

export function buildEoppyRunAiPayload(
  order: Pick<Order, "uid" | "group_EOPPY_id">,
  aiclient: AiClient,
): RunAIFileAnalysisReq {
  return {
    order_uid: order.uid,
    catid: order.group_EOPPY_id,
    aiclient,
  };
}

export async function runEoppyAi({
  dispatch,
  orderUid,
  groupEoppyId,
  aiclient,
  signal,
}: RunEoppyAiParams): Promise<void> {
  const res = await fetch("/api/orders/runai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      buildEoppyRunAiPayload(
        { uid: orderUid ?? "", group_EOPPY_id: groupEoppyId ?? 0 },
        aiclient,
      ),
    ),
    signal,
  });

  const response = await parseJson<RunAiApiResponse>(res);
  if (!res.ok || response?.ok === false || response?.result === false) {
    throw new Error(
      response?.message ||
        "Το αίτημα ΑΙ δεν ήταν επιτυχές. Εισάγετε τα στοιχεία χειροκίνητα ή προσπαθήστε αργότερα.",
    );
  }

  const data = response.data;
  if (!data?.isSuccess || !data.jsonDoc) {
    throw new Error(
      data?.errorMessage ||
        data?.message ||
        response?.message ||
        "Το αίτημα ΑΙ δεν ήταν επιτυχές. Εισάγετε τα στοιχεία χειροκίνητα ή προσπαθήστε αργότερα.",
    );
  }

  await applyRunAiResponse(dispatch, data);
}
