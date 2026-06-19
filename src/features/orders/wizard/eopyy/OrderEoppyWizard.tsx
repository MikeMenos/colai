"use client";

import React from "react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrders, submitDraftAsync, clearDraftSubmitError } from "@/store/orders/ordersSlice";
import { shouldShowSynainesiStep } from "@/lib/customerUtils";
import { isConsentScoreTooLow, isVoiceConsentOrder } from "@/lib/consentUpload";
import {
  getAiRunErrorMessage,
  type AiClient,
  type AiStatus,
} from "@/lib/utils/ai";
import SubmitOrderConfirmModal from "../modals/SubmitOrderConfirmModal";
import SellerActingSelector from "@/features/orders/components/SellerActingSelector";
import { getActingSellerDisplayLabel } from "@/lib/sellerAccess";
import { useRouter } from "next/navigation";
import { buildStepDefs } from "./wizard/buildStepDefs";
import {
  getSubmitConfirmAmka,
  getSubmitConfirmSuggestedDoctorName,
} from "./wizard/submitConfirmAmka";
import type { StepDef, StepKey, WizardIssue } from "./wizard/types";
import { validateEoppyOrder as validateEoppyOrderDraft } from "./wizard/validateEoppyOrder";
import {
  getDraftAmkaFieldErrors,
  hasDraftAmkaErrors,
} from "./wizard/amkaValidation";
import { getDraftBarcodeFieldErrors } from "./wizard/barcodeValidation";
import {
  hasCustomerFieldErrors,
  isCustomerTouchdownOnlyField,
} from "./wizard/customerFieldValidation";
import { focusWizardField } from "./wizard/wizardUtils";
import { runEoppyAi } from "./wizard/runEoppyAi";
import {
  buildStepOrderMap,
  prepareTouchdownIssues,
} from "./wizard/sortWizardIssues";
import type { StepOrderEntry } from "./componentProps";

export default function OrderEoppyWizard() {
  const dispatch = useAppDispatch();
  const [step, setStep] = React.useState(0);
  const router = useRouter();
  const [aiStatus, setAiStatus] = React.useState<AiStatus>("idle");
  const [aiMessage, setAiMessage] = React.useState<string | null>(null);
  const [aiRunningClient, setAiRunningClient] = React.useState<AiClient | null>(
    null,
  );
  const [aiDisabledClients, setAiDisabledClients] = React.useState<AiClient[]>(
    [],
  );
  const [issues, setIssues] = React.useState<WizardIssue[]>([]);
  const [showSubmitConfirm, setShowSubmitConfirm] = React.useState(false);

  const draftOrder = useAppSelector((s) => s.orders.draft.order);
  const files = useAppSelector((s) => s.orders?.draft?.files) ?? [];
  const hasFiles = files.some((o) => o?.documentCategory === "recipe");
  const recipeFileCount = files.filter(
    (o) => o?.documentCategory === "recipe",
  ).length;

  React.useEffect(() => {
    setAiDisabledClients([]);
  }, [recipeFileCount]);

  const hasConsentFormFiles = files.some(
    (o) => o?.documentCategory === "consent_form",
  );
  const orderUid = useAppSelector((s) => s.orders?.draft?.order?.uid);
  const group_EOPPY_id = useAppSelector(
    (s) => s.orders?.draft?.order?.group_EOPPY_id,
  );
  const submitState = useAppSelector((s) => s.orders.draft.submitState);
  const userInfos = useAppSelector((s) => s.auth.userInfos);
  const actingSellerCode = useAppSelector((s) => s.auth.actingSellerCode);
  const listAddressesPersons = useAppSelector(
    (s) => s.orders.draft.list_AddressesPersons,
  );
  const customerIsCompletelyNew = useAppSelector(
    (s) => s.orders.draft.customerIsCompletelyNew,
  );
  const showSynainesiPanel = shouldShowSynainesiStep({
    customerIsCompletelyNew,
  });
  const synaineseisResults = useAppSelector(
    (s) => s.orders.draft.synaineseisResults,
  );
  const consentScoreTooLow = isConsentScoreTooLow(synaineseisResults);
  const isVoiceConsent = isVoiceConsentOrder(draftOrder);
  const consentBlocksProgress =
    consentScoreTooLow && hasConsentFormFiles && !isVoiceConsent;
  const aiMaterials = useAppSelector((s) => s.orders.draft.ai_ylika);
  const maxPosoKostousGiaSymmetoxi = useAppSelector(
    (s) => s.orders?.draft?.order?.maxPosoKostousGiaSymmetoxi,
  );
  const kostos = useAppSelector((s) => s.orders?.draft?.order?.kostos);
  const ypervasiPlafon = (kostos ?? 0) - (maxPosoKostousGiaSymmetoxi ?? 0);
  const eidosEgkrisis = draftOrder.eidos_Egkrisis;
  const shouldShowWarningPlafon =
    ypervasiPlafon > 6 && Number(eidosEgkrisis) === 1;

  const effectiveStepsRef = React.useRef<StepDef[]>([]);
  const stepOrderRef = React.useRef<Map<StepKey, StepOrderEntry>>(new Map());

  const goToStepByKey = React.useCallback((key: StepKey) => {
    const idx = effectiveStepsRef.current.findIndex((s) => s.key === key);
    if (idx >= 0) setStep(idx);
  }, []);

  const clearError = React.useCallback((field: string) => {
    setIssues((prev) => prev.filter((x) => x.field !== field));
  }, []);

  const errorsByField = React.useMemo(() => {
    const m: Record<string, string | boolean> = {};
    for (const it of issues) if (!m[it.field]) m[it.field] = it.message;
    return m;
  }, [issues]);

  const amkaErrorsByField = React.useMemo(
    () => getDraftAmkaFieldErrors(draftOrder),
    [draftOrder],
  );

  const barcodeErrorsByField = React.useMemo(
    () => getDraftBarcodeFieldErrors(draftOrder),
    [draftOrder],
  );

  const fieldErrorsByField = React.useMemo(() => {
    const m: Record<string, string | boolean> = {
      ...amkaErrorsByField,
      ...barcodeErrorsByField,
    };
    for (const [field, message] of Object.entries(errorsByField)) {
      if (!isCustomerTouchdownOnlyField(field)) {
        m[field] = message;
      }
    }
    return m;
  }, [amkaErrorsByField, barcodeErrorsByField, errorsByField]);

  const hasAmkaErrors = React.useMemo(
    () => hasDraftAmkaErrors(draftOrder),
    [draftOrder],
  );

  const hasEmptyCustomerFields = React.useMemo(
    () => hasCustomerFieldErrors(draftOrder),
    [draftOrder],
  );

  const runValidation = React.useCallback(
    () =>
      validateEoppyOrderDraft({
        draftOrder,
        customerIsCompletelyNew,
        hasFiles,
        hasConsentFormFiles,
      }),
    [customerIsCompletelyNew, draftOrder, hasConsentFormFiles, hasFiles],
  );

  const runAi = React.useCallback(
    async (aiclient: AiClient) => {
      setAiStatus("running");
      setAiRunningClient(aiclient);
      setAiMessage(null);

      const controller = new AbortController();
      const pendingTimeoutMs = 120_000;
      const t = window.setTimeout(() => controller.abort(), pendingTimeoutMs);

      try {
        await runEoppyAi({
          dispatch,
          orderUid,
          groupEoppyId: group_EOPPY_id,
          aiclient,
          signal: controller.signal,
        });
        setAiStatus("done");
        setStep(1);
      } catch (e: unknown) {
        setAiStatus("error");
        setAiMessage(
          getAiRunErrorMessage(
            e as { name?: string; message?: string },
            aiclient,
          ),
        );
        setAiDisabledClients((prev) =>
          prev.includes(aiclient) ? prev : [...prev, aiclient],
        );
      } finally {
        setAiRunningClient(null);
        window.clearTimeout(t);
      }
    },
    [dispatch, group_EOPPY_id, orderUid],
  );

  const currentKey = effectiveStepsRef.current[step]?.key;

  const touchdownIssues = React.useMemo(() => {
    if (currentKey !== "touchdown") return [];
    return runValidation();
  }, [currentKey, runValidation]);

  const hasValidationIssues = React.useMemo(
    () => runValidation().length > 0,
    [runValidation],
  );

  const isTempSave = draftOrder.isTempSave == 1;

  const stepDefs = buildStepDefs({
    aiMessage,
    aiStatus,
    aiRunningClient,
    aiDisabledClients,
    onRunAiWithClient: runAi,
    errorsByField: fieldErrorsByField,
    clearError,
    showSynainesiPanel,
    draftOrder,
    customerIsCompletelyNew,
    shouldShowAiMaterials: aiMaterials.length > 0,
    shouldShowWarningPlafon,
    touchdownIssues,
    goToStepByKey,
    stepOrder: stepOrderRef.current,
  });

  const effectiveSteps = stepDefs.filter((s) => s.show !== false);
  effectiveStepsRef.current = effectiveSteps;
  stepOrderRef.current = buildStepOrderMap(effectiveSteps);

  const labels = effectiveSteps.map((s) => s.label);
  const maxStep = effectiveSteps.length - 1;
  const current = effectiveSteps[step];

  React.useEffect(() => {
    setStep((s) => Math.min(s, Math.max(0, effectiveSteps.length - 1)));
  }, [effectiveSteps.length]);

  function goNext() {
    setStep((s) => Math.min(s + 1, maxStep));
  }
  function goPrev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function onSaveClick() {
    const found = prepareTouchdownIssues(runValidation(), stepOrderRef.current);

    if (found.length > 0) {
      setIssues(found);
      const first = found[0];
      goToStepByKey(first.step);
      focusWizardField(first.field);
      return;
    }

    setIssues([]);
    if (isTempSave) {
      void confirmSave();
      return;
    }

    setShowSubmitConfirm(true);
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

  const submitConfirmAmka = React.useMemo(
    () => getSubmitConfirmAmka(draftOrder, listAddressesPersons),
    [draftOrder, listAddressesPersons],
  );

  const submitConfirmSuggestedDoctorName = React.useMemo(
    () => getSubmitConfirmSuggestedDoctorName(draftOrder),
    [draftOrder],
  );

  const submitConfirmOrderAsSeller = React.useMemo(
    () => getActingSellerDisplayLabel(userInfos, actingSellerCode),
    [userInfos, actingSellerCode],
  );

  const showWizardNav = step > 0;
  const activeStepKey = effectiveSteps[step]?.key;
  console.log(draftOrder);
  return (
    <div
      className={`order-wizard d-flex flex-column gap-2${showWizardNav ? "order-wizard--has-nav" : ""}`}
    >
      <StepIndicator steps={labels} current={step} setStep={setStep} />

      <SellerActingSelector clearError={clearError} />

      {current?.render()}

      {showWizardNav ? (
        <div className="order-wizard-nav">
          {step > 0 && (
            <button
              type="button"
              className="btn btn-outline-secondary flex-fill"
              onClick={goPrev}
              disabled={step === 0}
            >
              <i className="bi bi-chevron-left me-2" />
              Πίσω
            </button>
          )}

          {step < maxStep && step > 0 && (
            <button
              type="button"
              className="btn btn-primary flex-fill"
              onClick={goNext}
              disabled={
                activeStepKey === "synenaiseis" && consentBlocksProgress
              }
            >
              Επόμενο
              <i className="bi bi-chevron-right ms-2" />
            </button>
          )}

          {step == maxStep && (
            <button
              type="button"
              disabled={
                submitState.loading ||
                aiStatus === "running" ||
                (!isTempSave &&
                  (hasValidationIssues ||
                    hasAmkaErrors ||
                    hasEmptyCustomerFields ||
                    consentBlocksProgress))
              }
              className="btn btn-success flex-fill"
              onClick={onSaveClick}
            >
              <i className="bi bi-check2-circle me-2" />
              {submitState.loading ? "Αποθήκευση..." : "Αποθήκευση"}
            </button>
          )}
        </div>
      ) : null}

      <SubmitOrderConfirmModal
        show={showSubmitConfirm}
        loading={submitState.loading}
        error={submitState.error}
        otp={draftOrder.customer_tel_otp}
        amka={submitConfirmAmka}
        barcode={draftOrder.barcode}
        customerIsCompletelyNew={customerIsCompletelyNew === true}
        suggestedDoctorName={submitConfirmSuggestedDoctorName}
        orderAsSeller={submitConfirmOrderAsSeller}
        isVoiceConsent={isVoiceConsentOrder(draftOrder)}
        isPaid={draftOrder.isPaid == 1}
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
