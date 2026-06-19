import { parseJson } from "@/lib/api/client";
import { buildEoppyRunAiPayload } from "../wizard/runEoppyAi";
import type { RunAiApiResponse } from "@/types/api/responses";
import type { ReadEoppyDoc_Response } from "@/types/api/schemas";
import type { AiClient } from "@/lib/utils/ai";

export type BulkRunAiResult = {
  statusCode: number;
  data: ReadEoppyDoc_Response | null;
  errorMessage: string | null;
};

export function getBulkRunAiErrorMessage(
  statusCode: number,
  data: ReadEoppyDoc_Response | null,
  response: RunAiApiResponse,
): string | null {
  if (statusCode !== 200) {
    return (
      response.detailedMessage ||
      response.message ||
      data?.detailedError ||
      data?.jsonError ||
      data?.errorMessage ||
      "Το αίτημα ΑΙ δεν ήταν επιτυχές."
    );
  }

  if (data && !data.isSuccess) {
    return (
      data.detailedError ||
      data.jsonError ||
      data.errorMessage ||
      data.message ||
      "Το αίτημα ΑΙ δεν ήταν επιτυχές."
    );
  }

  return null;
}

export async function fetchRunAi(
  orderUid: string,
  groupEoppyId: number,
  aiclient: AiClient,
  signal?: AbortSignal,
): Promise<BulkRunAiResult> {
  const res = await fetch("/api/orders/runai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      buildEoppyRunAiPayload(
        { uid: orderUid, group_EOPPY_id: groupEoppyId },
        aiclient,
      ),
    ),
    signal,
  });

  const response = await parseJson<RunAiApiResponse>(res);
  const statusCode = response.statusCode ?? res.status;
  const data = response.data ?? null;

  return {
    statusCode,
    data,
    errorMessage: getBulkRunAiErrorMessage(statusCode, data, response),
  };
}
