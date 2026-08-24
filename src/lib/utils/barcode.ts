import type { Maybe } from "@/types/api/common";
import { onlyDigits } from "./string";

export const BARCODE_LENGTH_MESSAGE = "Συμπληρώστε barcode (15 ψηφία).";

export function normalizeBarcodeDigits(value: Maybe<string>): string {
  return onlyDigits(value);
}

/** Normalize raw scanner output (GS1 prefixes, control chars) to digits only. */
export function normalizeScannedBarcode(raw: Maybe<string>): string {
  const cleaned = String(raw ?? "")
    .replace(/\]C1/gi, "")
    .replace(/[\x00-\x1f\x7f]/g, "");
  return normalizeBarcodeDigits(cleaned);
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
