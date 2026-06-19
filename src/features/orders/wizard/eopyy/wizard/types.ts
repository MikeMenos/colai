import type { ReactNode } from "react";
import type { AiClient, AiStatus } from "@/lib/utils/ai";
import type { AppDispatch } from "@/store/store";
import type { Order } from "@/types/orders";
import type { StepOrderEntry } from "../componentProps";

export type StepKey =
  | "gnomateuseis"
  | "customer"
  | "updateRecipient"
  | "doctor"
  | "aiMaterials"
  | "materials"
  | "syntagi"
  | "ypervasiPlafon"
  | "symmetoxi"
  | "synenaiseis"
  | "touchdown";

export type WizardIssue = {
  step: StepKey;
  field: string;
  message: string | boolean;
  error: string | null;
};

export type StepDef = {
  key: StepKey;
  label: string;
  show?: boolean;
  render: () => ReactNode;
};

export type UploadStatus = "idle" | "uploading" | "error";

export type UploadingInfo = {
  name: string;
  fileSize: number;
  fileType: string;
};

export type ValidateEoppyOrderInput = {
  draftOrder: Order;
  customerIsCompletelyNew?: boolean;
  hasFiles: boolean;
  hasConsentFormFiles: boolean;
};

export type RunEoppyAiParams = {
  dispatch: AppDispatch;
  orderUid: string | undefined;
  groupEoppyId: number | undefined;
  aiclient: AiClient;
  signal: AbortSignal;
};

export type BuildStepDefsParams = {
  aiMessage: string | null;
  aiStatus: AiStatus;
  aiRunningClient: AiClient | null;
  aiDisabledClients: AiClient[];
  onRunAiWithClient: (client: AiClient) => void;
  errorsByField: Record<string, string | boolean>;
  clearError: (field: string) => void;
  showSynainesiPanel: boolean;
  draftOrder: Order;
  customerIsCompletelyNew: boolean | undefined;
  shouldShowAiMaterials: boolean;
  shouldShowWarningPlafon: boolean;
  touchdownIssues: WizardIssue[];
  goToStepByKey: (key: StepKey) => void;
  stepOrder: Map<StepKey, StepOrderEntry>;
};

export type RecipientSelection = {
  person_ErpGID: string | null;
  address_ErpGID: string | null;
};

export type ResolveSavedRecipientSelectionInput = {
  personErpGID?: string | null;
  addressErpGID?: string | null;
  preselectedPerson?: string | null;
  preselectedAddress?: string | null;
};
