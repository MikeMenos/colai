import { parseJson } from "@/lib/api/client";
import type { AppDispatch } from "@/store/store";
import type { RunAiApiResponse } from "@/types/api/responses";
import type { RunEoppyAiParams } from "./types";
import { applyRunAiResponse } from "./applyRunAiResponse";

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
    body: JSON.stringify({
      order_uid: orderUid,
      catid: groupEoppyId,
      aiclient,
    }),
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
  if (data?.isSuccess && data.jsonDoc) {
    await applyRunAiResponse(dispatch, data);
  }
}
