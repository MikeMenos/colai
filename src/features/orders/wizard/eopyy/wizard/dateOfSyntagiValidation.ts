import { parseOrderDate } from "@/lib/utils/date";
import type { Maybe } from "@/types/api/common";
import type { Order } from "@/types/orders";
import type { StepKey } from "./types";

export const DATE_OF_SYNTAGI_RANGE_ERROR_MESSAGE =
  "Η ημ/νία συνταγής δεν μπορεί να είναι παλαιότερη από 25 ημέρες ή μελλοντική";

const DATE_OF_SYNTAGI_MAX_AGE_DAYS = 25;

function parseUiOrOrderDate(value: Maybe<string>): Date | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const uiMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (uiMatch) {
    const day = Number(uiMatch[1]);
    const month = Number(uiMatch[2]);
    const year = Number(uiMatch[3]);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }
    return null;
  }

  return parseOrderDate(raw);
}

function isCompleteUiDate(value: Maybe<string>): boolean {
  return /^\d{2}\/\d{2}\/\d{4}$/.test(String(value ?? "").trim());
}

export function isDateOfSyntagiOutOfAllowedRange(
  value: Maybe<string>,
): boolean {
  const date = parseUiOrOrderDate(value);
  if (!date) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const compare = new Date(date);
  compare.setHours(0, 0, 0, 0);

  if (compare.getTime() > today.getTime()) return true;

  const minAllowed = new Date(today);
  minAllowed.setDate(minAllowed.getDate() - DATE_OF_SYNTAGI_MAX_AGE_DAYS);

  return compare.getTime() < minAllowed.getTime();
}

export function getDateOfSyntagiInlineFieldError(
  value: Maybe<string>,
): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (!isCompleteUiDate(raw) && !parseOrderDate(raw)) return null;
  return isDateOfSyntagiOutOfAllowedRange(raw)
    ? DATE_OF_SYNTAGI_RANGE_ERROR_MESSAGE
    : null;
}

export function getDraftDateOfSyntagiFieldErrors(
  draftOrder: Order,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const message = getDateOfSyntagiInlineFieldError(draftOrder.dateOfSyntagi);
  if (message) errors.dateOfSyntagi = message;
  return errors;
}

export function hasDraftDateOfSyntagiErrors(draftOrder: Order): boolean {
  return Object.keys(getDraftDateOfSyntagiFieldErrors(draftOrder)).length > 0;
}

const DATE_OF_SYNTAGI_FIELD_STEPS: Record<string, StepKey> = {
  dateOfSyntagi: "syntagi",
};

export function getDraftDateOfSyntagiWizardIssues(draftOrder: Order) {
  return Object.entries(getDraftDateOfSyntagiFieldErrors(draftOrder)).map(
    ([field, message]) => ({
      step: DATE_OF_SYNTAGI_FIELD_STEPS[field] ?? ("syntagi" as StepKey),
      field,
      message,
      error: message,
    }),
  );
}
