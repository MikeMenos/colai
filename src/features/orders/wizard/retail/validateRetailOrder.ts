import { isPaymentMethodSelected } from "@/lib/utils/paymentMethod";
import { getAmkaInlineFieldError } from "@/lib/utils/amka";
import {
  getOtherSuggestedDoctorFieldWizardIssues,
  getSuggestedDoctorFieldWizardIssues,
  type SuggestedDoctorValidationContext,
} from "@/features/orders/wizard/eopyy/wizard/doctorFieldValidation";
import type { Order } from "@/types/orders";
import { isRetailCustomerWithoutPriceBadge } from "./retailCustomerBadge";

export type RetailValidationIssue = {
  field: string;
  message: string;
};

export type RetailValidationContext = SuggestedDoctorValidationContext & {
  customerActivityRequired?: boolean;
  customerSelectedFromList?: boolean | null;
};

export function getRetailOrderValidationIssues(
  draftOrder: Order,
  context?: RetailValidationContext,
): RetailValidationIssue[] {
  if (draftOrder.isTempSave == 1) return [];

  const retailCustomerWithoutPriceBadge = isRetailCustomerWithoutPriceBadge(
    draftOrder,
    context?.customerSelectedFromList,
  );
  const doctorIssues: RetailValidationIssue[] = [
    ...getOtherSuggestedDoctorFieldWizardIssues(draftOrder),
    ...(retailCustomerWithoutPriceBadge
      ? []
      : getSuggestedDoctorFieldWizardIssues(draftOrder, context)),
    ...(retailCustomerWithoutPriceBadge &&
    !String(draftOrder.doctorSuggested_name ?? "").trim()
      ? [
          {
            field: "doctorSuggested_name",
            message: "Συμπληρώστε ονοματεπώνυμο",
          },
        ]
      : []),
  ].flatMap((issue) =>
    typeof issue.message === "string"
      ? [{ field: issue.field, message: issue.message }]
      : [],
  );
  if (doctorIssues.length > 0) return doctorIssues;

  const customerAmkaError = retailCustomerWithoutPriceBadge
    ? getAmkaInlineFieldError(draftOrder.customer_amka)
    : null;
  if (customerAmkaError) {
    return [
      {
        field: "customer_amka",
        message: customerAmkaError,
      },
    ];
  }

  if (
    context?.customerActivityRequired &&
    !String(draftOrder.customer_ActivityCode ?? "").trim()
  ) {
    return [
      {
        field: "customer_ActivityCode",
        message: "Επιλέξτε Δραστηριότητα / Τιμοκατάλογο",
      },
    ];
  }

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
