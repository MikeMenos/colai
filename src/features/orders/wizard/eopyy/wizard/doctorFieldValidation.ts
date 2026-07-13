import { isSuggestedDoctorChoiceLocked } from "@/lib/customerUtils";
import { isBlank } from "@/lib/utils/string";
import type { DraftState } from "@/store/orders/ordersSlice";
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
] as const satisfies ReadonlyArray<RequiredOtherSuggestedDoctorField>;

const REQUIRED_SUGGESTED_DOCTOR_FIELDS = [
  {
    field: "doctorSuggested_name",
    message: "Συμπληρώστε ονοματεπώνυμο",
  },
  {
    field: "doctorSuggested_tel",
    message: "Συμπληρώστε κινητό",
  },
] as const satisfies ReadonlyArray<RequiredOtherSuggestedDoctorField>;

export const OTHER_SUGGESTED_DOCTOR_FIELD_ORDER =
  REQUIRED_OTHER_SUGGESTED_DOCTOR_FIELDS.map(({ field }) => field);

export const SUGGESTED_DOCTOR_FIELD_ORDER =
  REQUIRED_SUGGESTED_DOCTOR_FIELDS.map(({ field }) => field);

export type SuggestedDoctorValidationContext = Pick<
  DraftState,
  "customerIsCompletelyNew" | "lastOrderInfoDateIn"
> & { customerProsEbs?: DraftState["customerProsEbs"] };

function isSuggestedDoctorFieldsDisabled(
  context?: SuggestedDoctorValidationContext,
): boolean {
  return context ? isSuggestedDoctorChoiceLocked(context) : false;
}

function mapRequiredDoctorFieldIssues(
  fields: ReadonlyArray<RequiredOtherSuggestedDoctorField>,
  draftOrder: Order,
): WizardIssue[] {
  return fields
    .filter(({ field }) =>
      isBlank(draftOrder[field] as string | null | undefined),
    )
    .map(({ field, message }) => ({
      step: "doctor" as StepKey,
      field,
      message,
      error: message,
    }));
}

export function getOtherSuggestedDoctorFieldWizardIssues(
  draftOrder: Order,
): WizardIssue[] {
  if (draftOrder.propose_other_suggested_doctor != 1) return [];

  return mapRequiredDoctorFieldIssues(
    REQUIRED_OTHER_SUGGESTED_DOCTOR_FIELDS,
    draftOrder,
  );
}

export function getSuggestedDoctorFieldWizardIssues(
  draftOrder: Order,
  context?: SuggestedDoctorValidationContext,
): WizardIssue[] {
  if (draftOrder.has_suggested_doctor != 2) return [];
  if (draftOrder.propose_other_suggested_doctor == 1) return [];
  if (isSuggestedDoctorFieldsDisabled(context)) return [];

  return mapRequiredDoctorFieldIssues(
    REQUIRED_SUGGESTED_DOCTOR_FIELDS,
    draftOrder,
  );
}

export function hasOtherSuggestedDoctorFieldErrors(draftOrder: Order): boolean {
  return getOtherSuggestedDoctorFieldWizardIssues(draftOrder).length > 0;
}

export function hasSuggestedDoctorFieldErrors(
  draftOrder: Order,
  context?: SuggestedDoctorValidationContext,
): boolean {
  return getSuggestedDoctorFieldWizardIssues(draftOrder, context).length > 0;
}
