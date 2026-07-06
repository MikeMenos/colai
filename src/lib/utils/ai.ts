import type { ApiAvailableAiClient } from "@/types/api/schemas";

export type AiClient = "Claude" | "Gemini";

export type AiStatus = "idle" | "running" | "done" | "error";

export const DEFAULT_AI_CLIENTS: AiClient[] = ["Claude", "Gemini"];

export function getAiClientsByPriority(
  clients?: ApiAvailableAiClient[] | null,
): AiClient[] {
  if (!clients?.length) return DEFAULT_AI_CLIENTS;

  return [...clients]
    .sort((a, b) => a.priority - b.priority)
    .map((client) => (client.code?.trim() || client.name?.trim() || "") as AiClient)
    .filter(Boolean);
}

export function getAiRunErrorMessage(
  e: { name?: string; message?: string },
  aiclient: AiClient,
): string {
  const timedOut = e?.name === "AbortError";
  const tryLaterOrManual =
    "Δοκιμάστε ξανά αργότερα ή συμπληρώστε τα στοιχεία χειροκίνητα.";
  const clientLabel = aiclient === "Gemini" ? "Gemini" : "Claude";

  if (timedOut) {
    return `Το αίτημα AI με ${clientLabel} έληξε. ${tryLaterOrManual}`;
  }
  return (
    e?.message ||
    `Η εκτέλεση AI με ${clientLabel} δεν ήταν επιτυχής. ${tryLaterOrManual}`
  );
}
