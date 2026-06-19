"use client";

import { Button, Modal } from "react-bootstrap";
import type { PrepaidOrderConfirmModalProps } from "./types";

export default function PrepaidOrderConfirmModal({
  show,
  onCancel,
  onConfirm,
}: PrepaidOrderConfirmModalProps) {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      contentClassName="premium-modal"
    >
      <Modal.Header
        closeButton
        style={{ borderBottom: "1px solid var(--bs-border-color-translucent)" }}
      >
        <Modal.Title className="fw-semibold h6 mb-0">Προσοχή</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex align-items-start gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 44,
              height: 44,
              background: "rgba(var(--bs-warning-rgb), .12)",
              border: "1px solid rgba(var(--bs-warning-rgb), .18)",
            }}
          >
            <i className="bi bi-exclamation-triangle-fill text-warning" />
          </div>

          <div style={{ minWidth: 0 }}>
            <div className="fw-semibold mb-2">
              Προσοχή η παραγγελιά θα φύγει χωρίς αντικαταβολή.
            </div>
            <div className="text-secondary">
              Είστε σίγουροι ότι έχει ρυθμιστεί η καταβολή;
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer
        style={{ borderTop: "1px solid var(--bs-border-color-translucent)" }}
      >
        <Button
          variant="outline-secondary"
          onClick={onCancel}
          style={{ borderRadius: 12 }}
        >
          Ακύρωση
        </Button>
        <Button
          variant="warning"
          onClick={onConfirm}
          style={{ borderRadius: 12 }}
        >
          Συνέχεια
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
