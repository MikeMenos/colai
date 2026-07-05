"use client";

import { Button, Modal } from "react-bootstrap";
import type { SymmetoxiPercentageConfirmModalProps } from "./types";

export default function SymmetoxiPercentageConfirmModal({
  show,
  onCancel,
  onConfirm,
}: SymmetoxiPercentageConfirmModalProps) {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      contentClassName="premium-modal"
    >
      <Modal.Body>
        <div className="d-flex align-items-center gap-3">
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
            <div className="fw-semibold">
              Αφορά συμμετοχή στη γνωμάτευση και όχι έκπτωση.
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
          variant="primary"
          onClick={onConfirm}
          style={{ borderRadius: 12 }}
        >
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
