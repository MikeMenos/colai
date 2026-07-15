"use client";

import React from "react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  clearDraftSubmitError,
  fetchOrders,
  submitDraftAsync,
} from "@/store/orders/ordersSlice";
import { isConsentScoreTooLow } from "@/lib/consentUpload";
import { getActingSellerDisplayLabel } from "@/lib/sellerAccess";
import SynenaiseisArea from "@/features/orders/wizard/eopyy/SynenaiseisArea";
import SubmitOrderConfirmModal from "@/features/orders/wizard/modals/SubmitOrderConfirmModal";
import {
  getSubmitConfirmRecipientAddress,
  getSubmitConfirmRecipientName,
} from "@/features/orders/wizard/eopyy/wizard/submitConfirmAmka";
import OrderRetailCustomerArea from "./OrderRetailCustomerArea";
import OrderDoctorArea from "./OrderDoctorArea";
import MaterialsArea from "./MaterialsArea";
import CompletionArea from "./CompletionArea";
import SellerActingSelector from "@/features/orders/components/SellerActingSelector";
import { useRouter } from "next/navigation";
import { getRetailOrderValidationIssues } from "./validateRetailOrder";
import { getAmkaInlineFieldError, normalizeAmka } from "@/lib/utils/amka";
import { isRetailCustomerWithoutPriceBadge } from "./retailCustomerBadge";
import {
  clearWizardFieldError,
  focusWizardField,
  getActiveWizardFieldErrors,
  getWizardFieldErrors,
  hasWizardFieldErrors,
} from "@/features/orders/wizard/validationErrors";

const steps = ["Ασθενής", "Ιατρός", "Υλικά", "Συναίνεση", "Touchdown"] as const;

export default function OrderRetailWizard() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [step, setStep] = React.useState(0);
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string | boolean>
  >({});
  const [showSubmitConfirm, setShowSubmitConfirm] = React.useState(false);
  const submitState = useAppSelector((s) => s.orders.draft.submitState);
  const draftOrder = useAppSelector((s) => s.orders.draft.order);
  const files = useAppSelector((s) => s.orders?.draft?.files) ?? [];
  const synaineseisResults = useAppSelector(
    (s) => s.orders.draft.synaineseisResults,
  );
  const userInfos = useAppSelector((s) => s.auth.userInfos);
  const actingSellerCode = useAppSelector((s) => s.auth.actingSellerCode);
  const listAddressesPersons = useAppSelector(
    (s) => s.orders.draft.list_AddressesPersons,
  );
  const customerActivityRequired = useAppSelector(
    (s) =>
      s.orders.draft.customerSelectedFromList !== true &&
      s.orders.draft.list_CustomerActivities.length > 0,
  );
  const customerSelectedFromList = useAppSelector(
    (s) => s.orders.draft.customerSelectedFromList,
  );
  const suggestedDoctorValidationContext = useAppSelector((s) => ({
    customerIsCompletelyNew: s.orders.draft.customerIsCompletelyNew,
    lastOrderInfoDateIn: s.orders.draft.lastOrderInfoDateIn,
  }));
  const hasConsentFormFiles = files.some(
    (file) => file?.documentCategory === "consent_form",
  );
  const isVoiceConsent = draftOrder.isVoiceConsent == 1;
  const consentScoreTooLow = isConsentScoreTooLow(synaineseisResults);
  const consentBlocksProgress =
    !isVoiceConsent && consentScoreTooLow && hasConsentFormFiles;
  const isTempSave = draftOrder.isTempSave == 1;

  const retailCustomerWithoutPriceBadge = isRetailCustomerWithoutPriceBadge(
    draftOrder,
    customerSelectedFromList,
  );
  const customerAmkaDigits = normalizeAmka(draftOrder.customer_amka);
  const customerAmkaError = retailCustomerWithoutPriceBadge
    ? getAmkaInlineFieldError(draftOrder.customer_amka)
    : null;
  const shouldShowConsentStep =
    retailCustomerWithoutPriceBadge &&
    !!customerAmkaDigits &&
    !customerAmkaError;
  const consentError = shouldShowConsentStep
    ? isVoiceConsent
      ? null
      : !hasConsentFormFiles
        ? "Νέος πελάτης, δεν έχετε ανεβάσει συναίνεση"
        : consentBlocksProgress
          ? "Το score δεν είναι αρκετά υψηλό. Παρακαλώ ανεβάστε νέο αρχείο."
          : null
    : null;

  const effectiveSteps = React.useMemo(() => {
    return shouldShowConsentStep
      ? [...steps]
      : steps.filter((label) => label !== "Συναίνεση");
  }, [shouldShowConsentStep]);

  const maxStep = effectiveSteps.length - 1;
  const currentLabel = effectiveSteps[step];

  React.useEffect(() => {
    setStep((current) => Math.min(current, maxStep));
  }, [maxStep]);

  const clearError = React.useCallback((field: string) => {
    setFieldErrors((prev) => clearWizardFieldError(prev, field));
  }, []);

  const goToCustomerActivityField = React.useCallback(() => {
    setStep(0);
    focusWizardField("customer_ActivityCode");
  }, []);

  const goToCustomerAmkaField = React.useCallback(() => {
    setStep(0);
    focusWizardField("customer_amka");
  }, []);

  const goToDoctorNameField = React.useCallback(() => {
    setStep(Math.max(0, effectiveSteps.indexOf("Ιατρός")));
    focusWizardField("doctorSuggested_name");
  }, [effectiveSteps]);

  const goToConsentStep = React.useCallback(() => {
    setStep(Math.max(0, effectiveSteps.indexOf("Συναίνεση")));
  }, [effectiveSteps]);

  function goNext() {
    setStep((s) => Math.min(s + 1, maxStep));
  }

  function goPrev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const currentValidationIssues = React.useMemo(
    () =>
      getRetailOrderValidationIssues(draftOrder, {
        ...suggestedDoctorValidationContext,
        customerActivityRequired,
        customerSelectedFromList,
      }),
    [
      customerActivityRequired,
      customerSelectedFromList,
      draftOrder,
      suggestedDoctorValidationContext,
    ],
  );
  const visibleFieldErrors = React.useMemo(
    () => (isTempSave ? {} : fieldErrors),
    [fieldErrors, isTempSave],
  );

  async function confirmSave() {
    try {
      const result = await dispatch(submitDraftAsync()).unwrap();
      if (result.result) {
        setShowSubmitConfirm(false);
        router.replace("/orders");
        await dispatch(fetchOrders({ force: true }));
      } else {
        console.log(result);
      }
    } catch (e: unknown) {
      console.error(e);
    }
  }

  function onSaveClick() {
    const issues = currentValidationIssues;
    if (issues.length > 0) {
      setFieldErrors(getWizardFieldErrors(issues));
      const firstIssue = issues[0];
      const doctorStepFields = new Set([
        "otherDoctorSuggested_name",
        "otherDoctorSuggested_mobile",
        "doctorSuggested_name",
      ]);
      const shouldShowOnTouchdown =
        retailCustomerWithoutPriceBadge &&
        firstIssue.field === "doctorSuggested_name";
      let targetLabel: (typeof steps)[number] = "Touchdown";
      if (!shouldShowOnTouchdown && doctorStepFields.has(firstIssue.field)) {
        targetLabel = "Ιατρός";
      }
      setStep(Math.max(0, effectiveSteps.indexOf(targetLabel)));
      if (!shouldShowOnTouchdown) {
        focusWizardField(firstIssue.field);
      }
      return;
    }

    setFieldErrors({});
    if (isTempSave) {
      void confirmSave();
      return;
    }

    setShowSubmitConfirm(true);
  }

  const nextDisabled = currentLabel === "Συναίνεση" && consentBlocksProgress;

  const hasMissingCustomerActivity =
    customerActivityRequired &&
    !String(draftOrder.customer_ActivityCode ?? "").trim();
  const hasMissingRequiredDoctorName =
    !isTempSave &&
    retailCustomerWithoutPriceBadge &&
    draftOrder.has_suggested_doctor != 0 &&
    !String(draftOrder.doctorSuggested_name ?? "").trim();
  const hasInvalidCustomerAmka = !!customerAmkaError;
  const activeFieldErrors = React.useMemo(
    () =>
      getActiveWizardFieldErrors(visibleFieldErrors, (field) => {
        if (field === "customer_ActivityCode") {
          return hasMissingCustomerActivity;
        }
        if (field === "customer_amka") {
          return hasInvalidCustomerAmka;
        }
        if (field === "doctorSuggested_name") {
          return hasMissingRequiredDoctorName;
        }
        return true;
      }),
    [
      hasInvalidCustomerAmka,
      hasMissingCustomerActivity,
      hasMissingRequiredDoctorName,
      visibleFieldErrors,
    ],
  );
  const hasFieldErrors =
    !isTempSave &&
    (hasWizardFieldErrors(activeFieldErrors) ||
      hasMissingCustomerActivity ||
      hasMissingRequiredDoctorName);
  const saveDisabled =
    submitState.loading || (!isTempSave && (!!consentError || hasFieldErrors));

  const submitConfirmOrderAsSeller = getActingSellerDisplayLabel(
    userInfos,
    actingSellerCode,
  );

  const submitConfirmRecipientName = React.useMemo(
    () => getSubmitConfirmRecipientName(draftOrder, listAddressesPersons),
    [draftOrder, listAddressesPersons],
  );

  const submitConfirmRecipientAddress = React.useMemo(
    () => getSubmitConfirmRecipientAddress(draftOrder, listAddressesPersons),
    [draftOrder, listAddressesPersons],
  );

  return (
    <div className="order-wizard order-wizard--has-nav d-flex flex-column gap-2">
      <StepIndicator
        steps={effectiveSteps as unknown as string[]}
        current={step}
        setStep={setStep}
      />

      <SellerActingSelector />

      {currentLabel === "Ασθενής" ? (
        <OrderRetailCustomerArea clearError={clearError} />
      ) : null}
      {currentLabel === "Ιατρός" ? (
        <OrderDoctorArea errors={visibleFieldErrors} clearError={clearError} />
      ) : null}
      {currentLabel === "Υλικά" ? <MaterialsArea /> : null}
      {currentLabel === "Συναίνεση" ? <SynenaiseisArea /> : null}
      {currentLabel === "Touchdown" ? (
        <CompletionArea
          errors={visibleFieldErrors}
          clearError={clearError}
          onGoToCustomerActivity={goToCustomerActivityField}
          onGoToCustomerAmka={goToCustomerAmkaField}
          onGoToDoctorName={goToDoctorNameField}
          onGoToConsent={goToConsentStep}
          consentError={consentError}
        />
      ) : null}

      <div className="order-wizard-nav">
        <button
          type="button"
          className="btn btn-outline-secondary flex-fill"
          onClick={goPrev}
          disabled={step === 0}
        >
          <i className="bi bi-chevron-left me-2" />
          Πίσω
        </button>

        {step < maxStep ? (
          <button
            type="button"
            className="btn btn-primary flex-fill"
            onClick={goNext}
            disabled={nextDisabled}
          >
            Επόμενο
            <i className="bi bi-chevron-right ms-2" />
          </button>
        ) : (
          <button
            type="button"
            disabled={saveDisabled}
            className="btn btn-success flex-fill"
            onClick={onSaveClick}
          >
            <i className="bi bi-check2-circle me-2" />
            {submitState.loading ? "Αποθήκευση..." : "Αποθήκευση"}
          </button>
        )}
      </div>

      <SubmitOrderConfirmModal
        show={showSubmitConfirm}
        loading={submitState.loading}
        error={submitState.error}
        otp={draftOrder.customer_tel_otp}
        amka={draftOrder.customer_amka}
        recipientName={submitConfirmRecipientName}
        recipientAddress={submitConfirmRecipientAddress}
        reviewFields={["recipientName", "recipientAddress", "amka"]}
        orderAsSeller={submitConfirmOrderAsSeller}
        isPaid={draftOrder.isPaid == 1}
        showPaymentMethodInfo
        onClose={() => {
          if (!submitState.loading) {
            setShowSubmitConfirm(false);
            dispatch(clearDraftSubmitError());
          }
        }}
        onConfirm={confirmSave}
      />
    </div>
  );
}
