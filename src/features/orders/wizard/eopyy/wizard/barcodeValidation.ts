import {
  BARCODE_LENGTH_MESSAGE,
  getBarcodeInlineFieldError,
  hasInvalidBarcodeValue,
} from "@/lib/utils/barcode";
import type { Order } from "@/types/orders";
import type { StepKey } from "./types";

export function getDraftBarcodeFieldErrors(
  draftOrder: Order,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const barcodeErr = getBarcodeInlineFieldError(draftOrder.barcode);
  if (barcodeErr) errors.barcode = barcodeErr;
  return errors;
}

export function hasDraftBarcodeErrors(draftOrder: Order): boolean {
  return Object.keys(getDraftBarcodeFieldErrors(draftOrder)).length > 0;
}

const BARCODE_FIELD_STEPS: Record<string, StepKey> = {
  barcode: "syntagi",
};

export function getDraftBarcodeWizardIssues(draftOrder: Order) {
  return Object.entries(getDraftBarcodeFieldErrors(draftOrder)).map(
    ([field, message]) => ({
      step: BARCODE_FIELD_STEPS[field] ?? ("syntagi" as StepKey),
      field,
      message,
      error: message,
    }),
  );
}

export { BARCODE_LENGTH_MESSAGE, getBarcodeInlineFieldError, hasInvalidBarcodeValue };
