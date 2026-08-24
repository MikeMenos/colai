import greeceAmka from "greece-amka";

import type { Maybe } from "@/types/api/common";
import { onlyDigits } from "./string";

export const AMKA_ERROR_MESSAGE = "Μη έγκυρος ΑΜΚΑ";
export const AMKA_LENGTH_MESSAGE = "Συμπληρώστε ΑΜΚΑ (11 ψηφία).";

export function normalizeAmka(value: Maybe<string>): string {
  return onlyDigits(value);
}

function getAmkaRaw(value: Maybe<string>): string {
  return String(value ?? "").trim();
}

const AMKA_R_PREFIX_COMPLETE_PATTERN = /^R\d{10}$/;
const AMKA_R_PREFIX_PARTIAL_PATTERN = /^R\d*$/;

function isRPrefixAmka(value: string): boolean {
  return value.startsWith("R");
}

function hasInvalidAmkaCharacters(value: string): boolean {
  if (isRPrefixAmka(value)) {
    return !AMKA_R_PREFIX_PARTIAL_PATTERN.test(value);
  }
  return /\D/.test(value);
}

/** AMKAs starting with 80 or R skip greece-amka checksum validation. */
export function isAmkaValidationExempt(value: Maybe<string>): boolean {
  const raw = getAmkaRaw(value);
  if (!raw || raw.length !== 11) return false;
  if (/^\d+$/.test(raw) && raw.startsWith("80")) return true;
  return AMKA_R_PREFIX_COMPLETE_PATTERN.test(raw);
}

export function isValidAmka(value: Maybe<string>): boolean {
  const raw = getAmkaRaw(value);
  if (!raw || hasInvalidAmkaCharacters(raw)) return false;
  if (raw.length !== 11) return false;
  if (isAmkaValidationExempt(raw)) return true;
  if (!/^\d+$/.test(raw)) return false;
  return greeceAmka.validate(raw);
}

export function getAmkaInlineFieldError(value: Maybe<string>): string | null {
  const raw = getAmkaRaw(value);
  if (!raw) return null;
  if (hasInvalidAmkaCharacters(raw)) return AMKA_ERROR_MESSAGE;
  if (raw.length !== 11) return AMKA_LENGTH_MESSAGE;
  if (isAmkaValidationExempt(raw)) return null;
  return isValidAmka(raw) ? null : AMKA_ERROR_MESSAGE;
}

export function getRequiredAmkaError(
  value: Maybe<string>,
  emptyMessage: string | null = AMKA_LENGTH_MESSAGE,
): string | null {
  const raw = getAmkaRaw(value);
  if (!raw) return emptyMessage;
  if (hasInvalidAmkaCharacters(raw)) return AMKA_ERROR_MESSAGE;
  if (raw.length !== 11) return AMKA_LENGTH_MESSAGE;
  if (isAmkaValidationExempt(raw)) return null;
  return isValidAmka(raw) ? null : AMKA_ERROR_MESSAGE;
}

export function getAmkaErrorIfPresent(value: Maybe<string>): string | null {
  return getAmkaInlineFieldError(value);
}

export function hasInvalidAmkaValue(
  value: Maybe<string>,
  required = false,
): boolean {
  if (required) return getRequiredAmkaError(value) != null;
  return getAmkaErrorIfPresent(value) != null;
}
