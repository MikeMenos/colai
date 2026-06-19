"use client";

import { Alert, Button, Modal } from "react-bootstrap";

type LeaveOrderWizardConfirmModalProps = {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onTempSave: () => void;
  tempSaveLoading?: boolean;
  tempSaveError?: string | null;
};

export default function LeaveOrderWizardConfirmModal({
  show,
  onCancel,
  onConfirm,
  onTempSave,
  tempSaveLoading = false,
  tempSaveError = null,
}: LeaveOrderWizardConfirmModalProps) {
  const busy = tempSaveLoading;

  return (
    <Modal
      show={show}
      onHide={busy ? undefined : onCancel}
      centered={false}
      dialogClassName="leave-order-modal"
      contentClassName="premium-modal leave-order-modal__content"
      backdrop={busy ? "static" : true}
      keyboard={!busy}
    >
      <Modal.Body className="leave-order-modal__body">
        <div className="leave-order-modal__handle" aria-hidden />

        <div className="d-flex align-items-start gap-3 mb-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 leave-order-modal__icon"
            aria-hidden
          >
            <i className="bi bi-box-arrow-right" />
          </div>

          <div style={{ minWidth: 0 }}>
            <div className="fw-semibold mb-1">Αποχώρηση από παραγγελία</div>
            <p className="text-secondary small mb-0">
              Είστε σίγουροι ότι θέλετε να αποχωρήσετε; Τα μη αποθηκευμένα
              στοιχεία της παραγγελίας θα χαθούν.
            </p>
          </div>
        </div>

        {tempSaveError ? (
          <Alert variant="danger" className="mb-3 py-2">
            {tempSaveError}
          </Alert>
        ) : null}

        <div className="d-grid gap-2">
          <Button
            variant="primary"
            onClick={onTempSave}
            disabled={busy}
            className="leave-order-modal__btn"
          >
            {busy ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden
                />
                Αποθήκευση…
              </>
            ) : (
              <>
                <i className="bi bi-save me-2" aria-hidden />
                Προσωρινή αποθήκευση
              </>
            )}
          </Button>

          <Button
            variant="outline-danger"
            onClick={onConfirm}
            disabled={busy}
            className="leave-order-modal__btn"
          >
            <i className="bi bi-box-arrow-right me-2" aria-hidden />
            Αποχώρηση
          </Button>
        </div>

        <Button
          variant="outline-secondary"
          onClick={onCancel}
          disabled={busy}
          className="leave-order-modal__btn leave-order-modal__btn-cancel mt-2 w-100"
        >
          Ακύρωση
        </Button>
      </Modal.Body>
    </Modal>
  );
}
