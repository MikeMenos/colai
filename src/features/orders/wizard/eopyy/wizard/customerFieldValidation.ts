import { isBlank } from "@/lib/utils/string";
import type { Order } from "@/types/orders";
import type { StepKey, WizardIssue } from "./types";

type RequiredCustomerField = {
  field: keyof Order;
  message: string;
};

const REQUIRED_CUSTOMER_FIELDS_WITHOUT_PASSPORT = [
  { field: "customer_name", message: "Συμπληρώστε ονοματεπώνυμο" },
  { field: "customer_amka", message: "Συμπληρώστε ΑΜΚΑ" },
  { field: "customer_mobile", message: "Συμπληρώστε κινητό" },
  { field: "customer_address", message: "Συμπληρώστε διεύθυνση" },
  { field: "customer_city", message: "Συμπληρώστε πόλη" },
  { field: "customer_tk", message: "Συμπληρώστε ΤΚ" },
] as const satisfies ReadonlyArray<RequiredCustomerField>;

export const CUSTOMER_TOUCHDOWN_ONLY_FIELDS = new Set<string>([
  "customer_name",
  "customer_passport",
  "recipient_passport",
  ...REQUIRED_CUSTOMER_FIELDS_WITHOUT_PASSPORT.slice(1).map(({ field }) => field),
]);

export function getRequiredCustomerFields(
  draftOrder: Order,
): RequiredCustomerField[] {
  const passportField: RequiredCustomerField =
    draftOrder.has_other_recipient == 1
      ? {
          field: "recipient_passport",
          message: "Συμπληρώστε ΑΤ/Διαβατήριο παραλήπτη",
        }
      : {
          field: "customer_passport",
          message: "Συμπληρώστε ΑΤ/Διαβατήριο",
        };

  return [
    REQUIRED_CUSTOMER_FIELDS_WITHOUT_PASSPORT[0],
    passportField,
    ...REQUIRED_CUSTOMER_FIELDS_WITHOUT_PASSPORT.slice(1),
  ];
}

export function isCustomerTouchdownOnlyField(field: string): boolean {
  return CUSTOMER_TOUCHDOWN_ONLY_FIELDS.has(field);
}

export function getCustomerFieldWizardIssues(draftOrder: Order): WizardIssue[] {
  return getRequiredCustomerFields(draftOrder)
    .filter(({ field }) =>
      isBlank(draftOrder[field] as string | null | undefined),
    )
    .map(({ field, message }) => ({
      step: "customer" as StepKey,
      field,
      message,
      error: message,
    }));
}

export function hasCustomerFieldErrors(draftOrder: Order): boolean {
  return getCustomerFieldWizardIssues(draftOrder).length > 0;
}
