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
import { getSubmitConfirmRecipientAddress, getSubmitConfirmRecipientName } from "@/features/orders/wizard/eopyy/wizard/submitConfirmAmka";
import OrderRetailCustomerArea from "./OrderRetailCustomerArea";
import OrderDoctorArea from "./OrderDoctorArea";
import MaterialsArea from "./MaterialsArea";
import CompletionArea from "./CompletionArea";
import SellerActingSelector from "@/features/orders/components/SellerActingSelector";
import { useRouter } from "next/navigation";
import { getRetailOrderValidationIssues } from "./validateRetailOrder";

const steps = ["Ασθενής", "Ιατρός", "Υλικά", "Συναίνεση", "Touchdown"] as const;

const RETAIL_DOCTOR_STEP_INDEX = 1;
const RETAIL_TOUCHDOWN_STEP_INDEX = 4;

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
  const suggestedDoctorValidationContext = useAppSelector((s) => ({
    customerIsCompletelyNew: s.orders.draft.customerIsCompletelyNew,
    lastOrderInfoDateIn: s.orders.draft.lastOrderInfoDateIn,
  }));
  const hasConsentFormFiles = files.some(
    (file) => file?.documentCategory === "consent_form",
  );
  const consentScoreTooLow = isConsentScoreTooLow(synaineseisResults);
  const consentBlocksProgress = consentScoreTooLow && hasConsentFormFiles;
  const isTempSave = draftOrder.isTempSave == 1;

  const effectiveSteps = React.useMemo(() => {
    return [...steps];
  }, []);

  const maxStep = effectiveSteps.length - 1;
  const currentLabel = effectiveSteps[step];

  const clearError = React.useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!(field in prev)) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  function goNext() {
    setStep((s) => Math.min(s + 1, maxStep));
  }

  function goPrev() {
    setStep((s) => Math.max(s - 1, 0));
  }

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
    const issues = getRetailOrderValidationIssues(
      draftOrder,
      suggestedDoctorValidationContext,
    );
    if (issues.length > 0) {
      const nextErrors = Object.fromEntries(
        issues.map((issue) => [issue.field, issue.message]),
      );
      setFieldErrors(nextErrors);
      const firstIssue = issues[0];
      const doctorStepFields = new Set([
        "otherDoctorSuggested_name",
        "otherDoctorSuggested_mobile",
        "doctorSuggested_name",
        "doctorSuggested_tel",
      ]);
      setStep(
        doctorStepFields.has(firstIssue.field)
          ? RETAIL_DOCTOR_STEP_INDEX
          : RETAIL_TOUCHDOWN_STEP_INDEX,
      );
      window.setTimeout(() => {
        document
          .querySelector<HTMLElement>(`[name="${issues[0].field}"]`)
          ?.focus();
      }, 0);
      return;
    }

    setFieldErrors({});
    if (isTempSave) {
      void confirmSave();
      return;
    }

    setShowSubmitConfirm(true);
  }

  const nextDisabled =
    currentLabel === "Συναίνεση" && consentBlocksProgress;

  const saveDisabled = submitState.loading || consentBlocksProgress;

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

      {currentLabel === "Ασθενής" ? <OrderRetailCustomerArea /> : null}
      {currentLabel === "Ιατρός" ? (
        <OrderDoctorArea errors={fieldErrors} clearError={clearError} />
      ) : null}
      {currentLabel === "Υλικά" ? <MaterialsArea /> : null}
      {currentLabel === "Συναίνεση" ? <SynenaiseisArea /> : null}
      {currentLabel === "Touchdown" ? (
        <CompletionArea errors={fieldErrors} clearError={clearError} />
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
        barcode={draftOrder.barcode}
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
