import { isPaymentMethodSelected } from "@/lib/utils/paymentMethod";
import {
  getOtherSuggestedDoctorFieldWizardIssues,
  getSuggestedDoctorFieldWizardIssues,
  type SuggestedDoctorValidationContext,
} from "@/features/orders/wizard/eopyy/wizard/doctorFieldValidation";
import type { Order } from "@/types/orders";

export type RetailValidationIssue = {
  field: string;
  message: string;
};

export function getRetailOrderValidationIssues(
  draftOrder: Order,
  context?: SuggestedDoctorValidationContext,
): RetailValidationIssue[] {
  if (draftOrder.isTempSave == 1) return [];

  const doctorIssues: RetailValidationIssue[] = [
    ...getOtherSuggestedDoctorFieldWizardIssues(draftOrder),
    ...getSuggestedDoctorFieldWizardIssues(draftOrder, context),
  ].flatMap((issue) =>
    typeof issue.message === "string"
      ? [{ field: issue.field, message: issue.message }]
      : [],
  );
  if (doctorIssues.length > 0) return doctorIssues;

  if (!isPaymentMethodSelected(draftOrder.isPaid)) {
    return [
      {
        field: "isPaid",
        message: "Επιλέξτε τρόπο πληρωμής",
      },
    ];
  }

  return [];
}
