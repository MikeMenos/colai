export type AiClient = "Claude" | "Gemini";

export type AiStatus = "idle" | "running" | "done" | "error";

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
