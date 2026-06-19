import type { ReactNode } from "react";
import type { AiClient, AiStatus } from "@/lib/utils/ai";
import type { ConsentUploadDataObject } from "@/types/api/common";
import type { OrderFile } from "@/types/orders";
import type {
  StepKey,
  UploadStatus,
  UploadingInfo,
  WizardIssue,
} from "./wizard/types";

export type GnomateuseisAreaProps = {
  aiMessage: string | null;
  aiStatus: AiStatus;
  aiRunningClient: AiClient | null;
  aiDisabledClients?: AiClient[];
  onRunAiWithClient: (aiclient: AiClient) => void;
  /** Local file list for bulk upload mode. Omit to use Redux draft files. */
  localFiles?: OrderFile[];
  onFilesChange?: (files: OrderFile[]) => void;
  orderUid?: string;
  uploadDisabled?: boolean;
};

export type StepOrderEntry = {
  number: number;
  label: string;
};

export type TouchdownProps = {
  issues?: WizardIssue[];
  onGoToIssue?: (issue: WizardIssue) => void;
  stepOrder?: Map<StepKey, StepOrderEntry>;
};

export type RunAiButtonProps = {
  disabled?: boolean;
  failed?: boolean;
  running?: boolean;
  onClick: () => void;
  label?: string;
  icon?: ReactNode;
};

export type FileUploadButtonProps = {
  orderUid: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  children?: ReactNode;
  position: number;
  endpoint: string;
  document_category?: string;
  setStatus: (status: UploadStatus) => void;
  setMessage: (message: string | null) => void;
  setProgress: (progress: number) => void;
  setUploading: (info: UploadingInfo | null) => void;
  dispatchFileToRedux: (file: OrderFile) => void;
  dispatchResultsToRedux?: (results: ConsentUploadDataObject | null) => void;
};

export type SymmetoxiAreaProps = {
  errors?: Record<string, string | boolean>;
  clearError?: (field: string) => void;
};

export type SyntagiAreaProps = {
  errors?: Record<string, string | boolean>;
  clearError?: (field: string) => void;
};

export type OrderCustomerAreaProps = {
  errors?: Record<string, string | boolean>;
  clearError?: (field: string) => void;
  consentStepShown?: boolean;
};

export type OrderDoctorAreaProps = {
  errors?: Record<string, string | boolean>;
  clearError?: (field: string) => void;
};

export type BarcodeFieldProps = {
  label: string;
  value: string;
  onChange: (next: string) => void;
  name?: string;
  hint?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  disabled?: boolean;
  autoFocus?: boolean;
  scanButtonAriaLabel?: string;
  modalTitle?: string;
};
