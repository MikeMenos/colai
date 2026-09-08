import { parseProxyJson } from "@/lib/api/client";
import type { SuggestShipMethodItem } from "@/types/api/schemas";

type SuggestShipMethodApiResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  data?: SuggestShipMethodItem | SuggestShipMethodItem[] | null;
};

export function normalizeSuggestShipMethodItems(
  data: SuggestShipMethodApiResponse["data"],
): SuggestShipMethodItem[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        item.id != null &&
        String(item.name ?? "").trim(),
    );
  }
  if (typeof data === "object" && data.id != null && String(data.name ?? "").trim()) {
    return [data];
  }
  return [];
}

export async function suggestShipMethods(
  postalCode: string,
): Promise<SuggestShipMethodItem[]> {
  const res = await fetch("/api/suggest-ship-method", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postal_code: postalCode }),
    cache: "no-store",
  });

  const payload = await parseProxyJson<SuggestShipMethodApiResponse>(
    res,
    "Η πρόταση τρόπου αποστολής απέτυχε",
  );

  return normalizeSuggestShipMethodItems(payload.data);
}
