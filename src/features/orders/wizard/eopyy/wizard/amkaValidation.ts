import {
  AMKA_ERROR_MESSAGE,
  AMKA_LENGTH_MESSAGE,
  getAmkaErrorIfPresent,
  getAmkaInlineFieldError,
  getRequiredAmkaError,
  hasInvalidAmkaValue,
} from "@/lib/utils/amka";
import type { Order } from "@/types/orders";
import type { StepKey } from "./types";

const RECIPIENT_AMKA_EMPTY_MESSAGE = "Συμπληρώστε ΑΜΚΑ παραλήπτη";

export function getDraftAmkaFieldErrors(
  draftOrder: Order,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const customerErr = getAmkaInlineFieldError(draftOrder.customer_amka);
  if (customerErr) errors.customer_amka = customerErr;

  if (draftOrder.has_other_recipient == 1) {
    const recipientErr = getAmkaInlineFieldError(draftOrder.recipient_amka);
    if (recipientErr) errors.recipient_amka = recipientErr;
  }

  return errors;
}

export function getDraftAmkaSubmitFieldErrors(
  draftOrder: Order,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const customerErr = getAmkaInlineFieldError(draftOrder.customer_amka);
  if (customerErr) errors.customer_amka = customerErr;

  if (draftOrder.has_other_recipient == 1) {
    const recipientErr = getRequiredAmkaError(
      draftOrder.recipient_amka,
      RECIPIENT_AMKA_EMPTY_MESSAGE,
    );
    if (recipientErr) errors.recipient_amka = recipientErr;
  }

  return errors;
}

export function hasDraftAmkaErrors(draftOrder: Order): boolean {
  return Object.keys(getDraftAmkaSubmitFieldErrors(draftOrder)).length > 0;
}

const AMKA_FIELD_STEPS: Record<string, StepKey> = {
  customer_amka: "customer",
  recipient_amka: "customer",
};

export function getDraftAmkaWizardIssues(draftOrder: Order) {
  return Object.entries(getDraftAmkaSubmitFieldErrors(draftOrder)).map(
    ([field, message]) => ({
      step: AMKA_FIELD_STEPS[field] ?? ("customer" as StepKey),
      field,
      message,
      error: message,
    }),
  );
}

export {
  AMKA_ERROR_MESSAGE,
  AMKA_LENGTH_MESSAGE,
  getAmkaErrorIfPresent,
  getAmkaInlineFieldError,
  getRequiredAmkaError,
  hasInvalidAmkaValue,
};
