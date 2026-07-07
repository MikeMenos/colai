export type LeaveOrderWizardConfirmModalProps = {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onTempSave?: () => void;
  tempSaveLoading?: boolean;
  tempSaveError?: string | null;
  showTempSave?: boolean;
  title?: string;
  message?: string;
};
