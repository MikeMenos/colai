import { isBlank } from "@/lib/utils/string";
import type { Order } from "@/types/orders";
import type { StepKey, WizardIssue } from "./types";

type RequiredOtherSuggestedDoctorField = {
  field: keyof Order;
  message: string;
};

const REQUIRED_OTHER_SUGGESTED_DOCTOR_FIELDS = [
  {
    field: "otherDoctorSuggested_name",
    message: "Συμπληρώστε ονοματεπώνυμο",
  },
  {
    field: "otherDoctorSuggested_mobile",
    message: "Συμπληρώστε κινητό",
  },
] as const satisfies ReadonlyArray<RequiredOtherSuggestedDoctorField>;

export const OTHER_SUGGESTED_DOCTOR_FIELD_ORDER =
  REQUIRED_OTHER_SUGGESTED_DOCTOR_FIELDS.map(({ field }) => field);

export function getOtherSuggestedDoctorFieldWizardIssues(
  draftOrder: Order,
): WizardIssue[] {
  if (draftOrder.propose_other_suggested_doctor != 1) return [];

  return REQUIRED_OTHER_SUGGESTED_DOCTOR_FIELDS.filter(({ field }) =>
    isBlank(draftOrder[field] as string | null | undefined),
  ).map(({ field, message }) => ({
    step: "doctor" as StepKey,
    field,
    message,
    error: message,
  }));
}

export function hasOtherSuggestedDoctorFieldErrors(draftOrder: Order): boolean {
  return getOtherSuggestedDoctorFieldWizardIssues(draftOrder).length > 0;
}
