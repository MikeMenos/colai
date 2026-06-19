import type { Maybe } from "@/types/api/common";
import { onlyDigits } from "./string";

export const BARCODE_LENGTH_MESSAGE = "Συμπληρώστε barcode (15 ψηφία).";

export function normalizeBarcodeDigits(value: Maybe<string>): string {
  return onlyDigits(value);
}

export function getBarcodeInlineFieldError(value: Maybe<string>): string | null {
  const digits = normalizeBarcodeDigits(value);
  if (!digits) return null;
  if (digits.length !== 15) return BARCODE_LENGTH_MESSAGE;
  return null;
}

export function hasInvalidBarcodeValue(value: Maybe<string>): boolean {
  return getBarcodeInlineFieldError(value) != null;
}
