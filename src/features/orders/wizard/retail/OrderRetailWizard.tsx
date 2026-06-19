"use client";

import React from "react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrders, submitDraftAsync } from "@/store/orders/ordersSlice";
import { isConsentScoreTooLow, isVoiceConsentOrder } from "@/lib/consentUpload";
import { getAmkaInlineFieldError } from "@/lib/utils/amka";
import SynenaiseisArea from "@/features/orders/wizard/eopyy/SynenaiseisArea";
import OrderRetailCustomerArea from "./OrderRetailCustomerArea";
import OrderDoctorArea from "./OrderDoctorArea";
import MaterialsArea from "./MaterialsArea";
import CompletionArea from "./CompletionArea";
import SellerActingSelector from "@/features/orders/components/SellerActingSelector";
import { useRouter } from "next/navigation";

const steps = ["Ασθενής", "Ιατρός", "Υλικά", "Συναίνεση", "Touchdown"] as const;

export default function OrderRetailWizard() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [step, setStep] = React.useState(0);
  const submitState = useAppSelector((s) => s.orders.draft.submitState);
  const draftOrder = useAppSelector((s) => s.orders.draft.order);
  const files = useAppSelector((s) => s.orders?.draft?.files) ?? [];
  const synaineseisResults = useAppSelector(
    (s) => s.orders.draft.synaineseisResults,
  );
  const hasAmkaError = Boolean(
    getAmkaInlineFieldError(draftOrder.customer_amka),
  );
  const hasConsentFormFiles = files.some(
    (file) => file?.documentCategory === "consent_form",
  );
  const consentScoreTooLow = isConsentScoreTooLow(synaineseisResults);
  const isVoiceConsent = isVoiceConsentOrder(draftOrder);
  const consentBlocksProgress =
    consentScoreTooLow && hasConsentFormFiles && !isVoiceConsent;

  const effectiveSteps = React.useMemo(() => {
    return [...steps];
  }, []);

  const maxStep = effectiveSteps.length - 1;
  const currentLabel = effectiveSteps[step];

  function goNext() {
    setStep((s) => Math.min(s + 1, maxStep));
  }

  function goPrev() {
    setStep((s) => Math.max(s - 1, 0));
  }
  console.log(draftOrder);

  async function onSave() {
    try {
      const result = await dispatch(submitDraftAsync()).unwrap();
      if (result.result) {
        router.replace("/orders");
        await dispatch(fetchOrders({ force: true }));
      } else {
        console.log(result);
      }
    } catch (e: unknown) {
      console.error(e);
    }
  }

  const nextDisabled =
    (step === 0 && hasAmkaError) ||
    (currentLabel === "Συναίνεση" && consentBlocksProgress);

  const saveDisabled =
    submitState.loading || hasAmkaError || consentBlocksProgress;

  return (
    <div className="order-wizard order-wizard--has-nav d-flex flex-column gap-2">
      <StepIndicator
        steps={effectiveSteps as unknown as string[]}
        current={step}
        setStep={setStep}
      />

      <SellerActingSelector />

      {currentLabel === "Ασθενής" ? <OrderRetailCustomerArea /> : null}
      {currentLabel === "Ιατρός" ? <OrderDoctorArea /> : null}
      {currentLabel === "Υλικά" ? <MaterialsArea /> : null}
      {currentLabel === "Συναίνεση" ? <SynenaiseisArea /> : null}
      {currentLabel === "Touchdown" ? <CompletionArea /> : null}

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
            onClick={onSave}
          >
            <i className="bi bi-check2-circle me-2" />
            {submitState.loading ? "Αποθήκευση..." : "Αποθήκευση"}
          </button>
        )}
      </div>
    </div>
  );
}
