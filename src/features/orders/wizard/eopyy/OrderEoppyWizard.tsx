"use client";

import type { OrderEoppyWizardProps } from "./OrderEoppyWizard.types";
import React from "react";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchOrders,
  submitDraftAsync,
  clearDraftSubmitError,
} from "@/store/orders/ordersSlice";
import { isConsentScoreTooLow } from "@/lib/consentUpload";
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
  getSubmitConfirmRecipientAddress,
  getSubmitConfirmRecipientName,
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
  getDraftDateOfSyntagiFieldErrors,
  hasDraftDateOfSyntagiErrors,
} from "./wizard/dateOfSyntagiValidation";
import {
  hasCustomerFieldErrors,
  isCustomerTouchdownOnlyField,
} from "./wizard/customerFieldValidation";
import { isAllowedSymmPercentage } from "./wizard/wizardUtils";
import {
  clearWizardIssue,
  focusWizardField,
  getWizardFieldErrors,
} from "@/features/orders/wizard/validationErrors";
import { shouldShowYpervasiPlafonStep } from "@/lib/utils/plafon";
import { runEoppyAi } from "./wizard/runEoppyAi";
import { EOPPY_AI_TIMEOUT_MS } from "./wizard/runEoppyAiWithFallback";
import {
  buildStepOrderMap,
  prepareTouchdownIssues,
} from "./wizard/sortWizardIssues";
import type { StepOrderEntry } from "./componentProps";

export default function OrderEoppyWizard({
  initialStepKey,
  useOnlyBackendConsentVisibility = false,
}: OrderEoppyWizardProps = {}) {
  const dispatch = useAppDispatch();
  const [step, setStep] = React.useState(0);
  const initialStepAppliedRef = React.useRef(false);
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
  const ylika = useAppSelector((s) => s.orders.draft.ylika);
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
  const isVoiceConsent = draftOrder.isVoiceConsent == 1;
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
  const customerProsEbs = useAppSelector((s) => s.orders.draft.customerProsEbs);
  const lastOrderInfoDateIn = useAppSelector(
    (s) => s.orders.draft.lastOrderInfoDateIn,
  );
  const isNewCustomerBadgeShown =
    customerIsCompletelyNew === true ||
    !String(draftOrder.customer_ErpGID ?? "").trim();
  const showSynainesiPanel =
    useAppSelector((s) => s.orders.draft.showConsentForm) === true ||
    (!useOnlyBackendConsentVisibility && isNewCustomerBadgeShown);
  const synaineseisResults = useAppSelector(
    (s) => s.orders.draft.synaineseisResults,
  );
  const consentScoreTooLow = isConsentScoreTooLow(synaineseisResults);
  const consentBlocksProgress =
    !isVoiceConsent && consentScoreTooLow && hasConsentFormFiles;
  const aiMaterials = useAppSelector((s) => s.orders.draft.ai_ylika);
  const shouldShowWarningPlafon = shouldShowYpervasiPlafonStep(draftOrder);

  const effectiveStepsRef = React.useRef<StepDef[]>([]);
  const stepOrderRef = React.useRef<Map<StepKey, StepOrderEntry>>(new Map());

  const goToStepByKey = React.useCallback((key: StepKey) => {
    const idx = effectiveStepsRef.current.findIndex((s) => s.key === key);
    if (idx >= 0) setStep(idx);
  }, []);

  const clearError = React.useCallback((field: string) => {
    setIssues((prev) => clearWizardIssue(prev, field));
  }, []);

  const amkaErrorsByField = React.useMemo(
    () => getDraftAmkaFieldErrors(draftOrder),
    [draftOrder],
  );

  const barcodeErrorsByField = React.useMemo(
    () => getDraftBarcodeFieldErrors(draftOrder),
    [draftOrder],
  );

  const dateOfSyntagiErrorsByField = React.useMemo(
    () => getDraftDateOfSyntagiFieldErrors(draftOrder),
    [draftOrder],
  );

  const fieldErrorsByField = React.useMemo(() => {
    return {
      ...amkaErrorsByField,
      ...barcodeErrorsByField,
      ...dateOfSyntagiErrorsByField,
      ...getWizardFieldErrors(issues, {
        include: (issue) => !isCustomerTouchdownOnlyField(issue.field),
      }),
    };
  }, [
    amkaErrorsByField,
    barcodeErrorsByField,
    dateOfSyntagiErrorsByField,
    issues,
  ]);

  const hasAmkaErrors = React.useMemo(
    () => hasDraftAmkaErrors(draftOrder),
    [draftOrder],
  );

  const hasDateOfSyntagiErrors = React.useMemo(
    () => hasDraftDateOfSyntagiErrors(draftOrder),
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
        ylika,
        customerIsCompletelyNew,
        customerProsEbs,
        lastOrderInfoDateIn,
        hasFiles,
        hasConsentFormFiles,
        showSynainesiPanel,
        isVoiceConsent,
      }),
    [
      customerIsCompletelyNew,
      customerProsEbs,
      draftOrder,
      hasConsentFormFiles,
      hasFiles,
      isVoiceConsent,
      lastOrderInfoDateIn,
      showSynainesiPanel,
      ylika,
    ],
  );
  const runAi = React.useCallback(
    async (aiclient: AiClient) => {
      setAiStatus("running");
      setAiRunningClient(aiclient);
      setAiMessage(null);

      const controller = new AbortController();
      const t = window.setTimeout(
        () => controller.abort(),
        EOPPY_AI_TIMEOUT_MS,
      );

      try {
        await runEoppyAi({
          dispatch,
          orderUid,
          groupEoppyId: group_EOPPY_id,
          aiclient,
          skipLastPage: draftOrder.lastPageContainsMaterialsGnomateusi !== true,
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
    [
      dispatch,
      draftOrder.lastPageContainsMaterialsGnomateusi,
      group_EOPPY_id,
      orderUid,
    ],
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

  React.useEffect(() => {
    if (!initialStepKey || initialStepAppliedRef.current) return;
    const idx = effectiveSteps.findIndex((s) => s.key === initialStepKey);
    if (idx < 0) return;

    initialStepAppliedRef.current = true;
    setStep(idx);
  }, [effectiveSteps, initialStepKey]);

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

  const submitConfirmRecipientName = React.useMemo(
    () => getSubmitConfirmRecipientName(draftOrder, listAddressesPersons),
    [draftOrder, listAddressesPersons],
  );

  const submitConfirmRecipientAddress = React.useMemo(
    () => getSubmitConfirmRecipientAddress(draftOrder, listAddressesPersons),
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
                    hasDateOfSyntagiErrors ||
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
        recipientName={submitConfirmRecipientName}
        recipientAddress={submitConfirmRecipientAddress}
        barcode={draftOrder.barcode}
        dateOfSyntagi={draftOrder.dateOfSyntagi}
        customerIsCompletelyNew={customerIsCompletelyNew === true}
        suggestedDoctorName={submitConfirmSuggestedDoctorName}
        orderAsSeller={submitConfirmOrderAsSeller}
        isPaid={draftOrder.isPaid == 1}
        showPaymentMethodInfo={
          Number(draftOrder.posoSymmetoxis ?? 0) > 0 &&
          isAllowedSymmPercentage(draftOrder.symmPercentage) &&
          draftOrder.symmPercentage !== 0
        }
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
