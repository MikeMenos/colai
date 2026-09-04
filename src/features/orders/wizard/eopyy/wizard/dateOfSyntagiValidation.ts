import { parseOrderDate } from "@/lib/utils/date";
import type { Maybe } from "@/types/api/common";

export const DATE_OF_SYNTAGI_FUTURE_WARNING_MESSAGE =
  "Η ημ/νία συνταγής είναι μελλοντική";

export const DATE_OF_SYNTAGI_TOO_OLD_WARNING_MESSAGE =
  "Η ημ/νία συνταγής είναι παλαιότερη από 25 ημέρες";

const DATE_OF_SYNTAGI_MAX_AGE_DAYS = 25;

export type DateOfSyntagiRangeIssue = "future" | "too_old";

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

export function getDateOfSyntagiRangeIssue(
  value: Maybe<string>,
): DateOfSyntagiRangeIssue | null {
  const date = parseUiOrOrderDate(value);
  if (!date) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const compare = new Date(date);
  compare.setHours(0, 0, 0, 0);

  if (compare.getTime() > today.getTime()) return "future";

  const minAllowed = new Date(today);
  minAllowed.setDate(minAllowed.getDate() - DATE_OF_SYNTAGI_MAX_AGE_DAYS);

  if (compare.getTime() < minAllowed.getTime()) return "too_old";

  return null;
}

export function isDateOfSyntagiOutOfAllowedRange(
  value: Maybe<string>,
): boolean {
  return getDateOfSyntagiRangeIssue(value) !== null;
}

export function getDateOfSyntagiRangeWarningMessage(
  issue: DateOfSyntagiRangeIssue,
): string {
  return issue === "future"
    ? DATE_OF_SYNTAGI_FUTURE_WARNING_MESSAGE
    : DATE_OF_SYNTAGI_TOO_OLD_WARNING_MESSAGE;
}

export function getDateOfSyntagiInlineFieldWarning(
  value: Maybe<string>,
): string | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  if (!isCompleteUiDate(raw) && !parseOrderDate(raw)) return null;

  const issue = getDateOfSyntagiRangeIssue(raw);
  return issue ? getDateOfSyntagiRangeWarningMessage(issue) : null;
}
