import AIMaterials from "../AIMaterials";
import GnomateuseisArea from "../GnomateuseisArea";
import MaterialsArea from "../MaterialsArea";
import OrderCustomerArea from "../OrderCustomerArea";
import OrderDoctorArea from "../OrderDoctorArea";
import SyntagiArea from "../SyntagiArea";
import SymmetoxiArea from "../SymmetoxiArea";
import SynenaiseisArea from "../SynenaiseisArea";
import Touchdown from "../Touchdown";
import UpdateRecipientArea from "../UpdateRecipientArea";
import YpervasiPlafonArea from "../YpervasiPlafonArea";
import type { BuildStepDefsParams, StepDef, StepKey } from "./types";
import { focusWizardField } from "./wizardUtils";

export const STEP_LABELS: Record<StepKey, string> = {
  gnomateuseis: "Γνωμάτευση",
  customer: "Ασθενής",
  updateRecipient: "Επικαιροποίηση",
  doctor: "Ιατρός",
  syntagi: "\u03A3\u03C5\u03BD\u03C4\u03B1\u03B3\u03AE",
  aiMaterials: "ΑΙ επιλογές",
  materials: "Υλικά",
  ypervasiPlafon: "Υπέρβαση πλαφόν",
  symmetoxi: "Συμμετοχή",
  synenaiseis: "Συναίνεση",
  touchdown: "Touchdown",
};

export function buildStepDefs({
  aiMessage,
  aiStatus,
  aiRunningClient,
  aiDisabledClients,
  onRunAiWithClient,
  errorsByField,
  clearError,
  showSynainesiPanel,
  draftOrder,
  customerIsCompletelyNew,
  shouldShowAiMaterials,
  shouldShowWarningPlafon,
  touchdownIssues,
  goToStepByKey,
  stepOrder,
}: BuildStepDefsParams): StepDef[] {
  return [
    {
      key: "gnomateuseis",
      label: STEP_LABELS.gnomateuseis,
      render: () => (
        <GnomateuseisArea
          aiMessage={aiMessage}
          aiStatus={aiStatus}
          aiRunningClient={aiRunningClient}
          aiDisabledClients={aiDisabledClients}
          onRunAiWithClient={onRunAiWithClient}
        />
      ),
    },
    {
      key: "customer",
      label: STEP_LABELS.customer,
      render: () => (
        <OrderCustomerArea
          errors={errorsByField}
          clearError={clearError}
          consentStepShown={showSynainesiPanel}
        />
      ),
    },
    {
      key: "updateRecipient",
      label: STEP_LABELS.updateRecipient,
      show:
        !showSynainesiPanel &&
        (draftOrder.has_other_recipient != 1 ||
          draftOrder.recipient_from_erp_lookup == 1),
      render: () => <UpdateRecipientArea />,
    },
    {
      key: "doctor",
      label: STEP_LABELS.doctor,
      render: () => (
        <OrderDoctorArea errors={errorsByField} clearError={clearError} />
      ),
    },
    {
      key: "syntagi",
      label: STEP_LABELS.syntagi,
      render: () => (
        <SyntagiArea errors={errorsByField} clearError={clearError} />
      ),
    },
    {
      key: "aiMaterials",
      label: STEP_LABELS.aiMaterials,
      show: shouldShowAiMaterials,
      render: () => <AIMaterials />,
    },
    {
      key: "materials",
      label: STEP_LABELS.materials,
      render: () => <MaterialsArea />,
    },
    {
      key: "ypervasiPlafon",
      label: STEP_LABELS.ypervasiPlafon,
      show: shouldShowWarningPlafon,
      render: () => <YpervasiPlafonArea />,
    },
    {
      key: "symmetoxi",
      label: STEP_LABELS.symmetoxi,
      render: () => (
        <SymmetoxiArea errors={errorsByField} clearError={clearError} />
      ),
    },
    {
      key: "synenaiseis",
      label: STEP_LABELS.synenaiseis,
      show: showSynainesiPanel,
      render: () => <SynenaiseisArea />,
    },
    {
      key: "touchdown",
      label: STEP_LABELS.touchdown,
      render: () => (
        <Touchdown
          issues={touchdownIssues}
          stepOrder={stepOrder}
          onGoToIssue={(it) => {
            goToStepByKey(it.step);
            focusWizardField(it.field);
          }}
        />
      ),
    },
  ];
}
