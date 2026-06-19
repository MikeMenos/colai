import { shouldShowSynainesiStep } from "@/lib/customerUtils";
import { isBlank } from "@/lib/utils/string";
import type { Order } from "@/types/orders";
import { getDraftAmkaWizardIssues } from "./amkaValidation";
import { getDraftBarcodeWizardIssues } from "./barcodeValidation";
import { getCustomerFieldWizardIssues } from "./customerFieldValidation";
import type { StepKey, ValidateEoppyOrderInput, WizardIssue } from "./types";
import { onlyDigits } from "./wizardUtils";

export function validateEoppyOrder({
  draftOrder,
  customerIsCompletelyNew,
  hasFiles,
  hasConsentFormFiles,
}: ValidateEoppyOrderInput): WizardIssue[] {
  const issues: WizardIssue[] = [];
  const add = (
    step: StepKey,
    field: string,
    message: string | boolean,
    error: string | null = null,
    when: boolean,
  ) => {
    if (when) issues.push({ step, field, message, error });
  };

  if (draftOrder.isTempSave != 1) {
    add(
      "gnomateuseis",
      "recipe_file_required",
      true,
      "Ανεβάστε τουλάχιστον ένα αρχείο γνωμάτευσης",
      !hasFiles,
    );

    const otp = onlyDigits(draftOrder.customer_tel_otp ?? "");
    add(
      "customer",
      "customer_tel_otp",
      "Συμπληρώστε ΟΤP (6 ψηφία)",
      "Συμπληρώστε ΟΤP (6 ψηφία)",
      otp.length !== 6,
    );

    if (draftOrder.has_other_recipient == 1) {
      add(
        "customer",
        "recipient_reason_id",
        true,
        "Συμπληρώστε αιτία παραλαβής",
        isBlank(draftOrder.recipient_reason_id),
      );
      add(
        "customer",
        "recipient_relation_id",
        true,
        "Συμπληρώστε τη σχέση με τον παραλήπτη",
        isBlank(draftOrder.recipient_relation_id),
      );
      add(
        "customer",
        "recipient_name",
        true,
        "Συμπληρώστε το όνομα παραλήπτη",
        isBlank(draftOrder.recipient_name),
      );

      add(
        "customer",
        "recipient_afm",
        true,
        "ΑΦΜ παραλήπτη",
        isBlank(draftOrder.recipient_afm),
      );
      add(
        "customer",
        "recipient_mobile",
        true,
        "Κινητό παραλήπτη",
        isBlank(draftOrder.recipient_mobile),
      );
      add(
        "customer",
        "recipient_address",
        true,
        "Διεύθυνση παραλήπτη",
        isBlank(draftOrder.recipient_address),
      );
      add(
        "customer",
        "recipient_city",
        true,
        "Πόλη παραλήπτη",
        isBlank(draftOrder.recipient_city),
      );
      add(
        "customer",
        "recipient_tk",
        true,
        "ΤΚ παραλήπτη",
        isBlank(draftOrder.recipient_tk),
      );
    }

    if (draftOrder.shipTo_other_address == 1) {
      add(
        "customer",
        "customer_other_address",
        true,
        "Διεύθυνση παραδοσης",
        isBlank(draftOrder.customer_other_address),
      );
      add(
        "customer",
        "customer_other_city",
        true,
        "Πόλη παραδοσης",
        isBlank(draftOrder.customer_other_city),
      );
      add(
        "customer",
        "customer_other_tk",
        true,
        "ΤΚ παραδοσης",
        isBlank(draftOrder.customer_other_tk),
      );
    }

    const validateSynainesiPanel = shouldShowSynainesiStep({
      customerIsCompletelyNew,
    });
    if (
      !validateSynainesiPanel &&
      (draftOrder.has_other_recipient != 1 ||
        draftOrder.recipient_from_erp_lookup == 1) &&
      draftOrder.shouldUpdateRecipientInfos == 1 &&
      isBlank(draftOrder.updateRecipient_passport)
    ) {
      add(
        "updateRecipient",
        "updateRecipient_passport",
        "Συμπληρώστε ΑΤ/Διαβατήριο (επικαιροποίηση στοιχείων)",
        "Συμπληρώστε ΑΤ/Διαβατήριο (επικαιροποίηση στοιχείων)",
        true,
      );
    }

    if (
      validateSynainesiPanel &&
      draftOrder.isVoiceConsent != 1 &&
      !hasConsentFormFiles
    ) {
      add(
        "synenaiseis",
        "consent_form",
        true,
        "Νέος πελάτης, δεν έχετε ανεβάσει συναίνεση",
        true,
      );
    }

    add(
      "symmetoxi",
      "eopyyVerifyNoParticipation",
      true,
      "Επιβεβαιώστε μηδενική πληρωμή",
      draftOrder.eopyyVerifyNoParticipation != 1 &&
        !(draftOrder.posoSymmetoxis > 0),
    );

    for (const issue of getCustomerFieldWizardIssues(draftOrder)) {
      issues.push(issue);
    }

    for (const issue of getDraftAmkaWizardIssues(draftOrder)) {
      issues.push(issue);
    }

    for (const issue of getDraftBarcodeWizardIssues(draftOrder)) {
      issues.push(issue);
    }
  }

  return issues;
}
