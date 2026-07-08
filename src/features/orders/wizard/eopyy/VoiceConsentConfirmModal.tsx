"use client";

import { Button, Modal } from "react-bootstrap";

type VoiceConsentConfirmModalProps = {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function VoiceConsentConfirmModal({
  show,
  onClose,
  onConfirm,
}: VoiceConsentConfirmModalProps) {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      contentClassName="premium-modal"
    >
      <Modal.Header
        closeButton
        style={{ borderBottom: "1px solid rgba(var(--bs-warning-rgb), .45)" }}
      >
        <Modal.Title className="fw-semibold h6 mb-0">
          Ηχητική συναίνεση
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex align-items-start gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 44,
              height: 44,
              background: "rgba(var(--bs-warning-rgb), .12)",
              border: "1px solid rgba(var(--bs-warning-rgb), .22)",
            }}
          >
            <i className="bi bi-exclamation-triangle-fill text-warning" />
          </div>

          <div className="text-secondary">
            Η δυνατότητα αυτή ισχύει ΜΟΝΟ για ιδιαιτέρως σημαντικές και
            δυσπρόσιτες περιπτώσεις και εφόσον το υποστηρίζει το γραφείο των
            πωλήσεων και πάντα θα πρέπει να γίνεται σε επικοινωνία με τον
            προϊστάμενός σας.
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer
        style={{ borderTop: "1px solid rgba(var(--bs-warning-rgb), .45)" }}
      >
        <Button
          variant="outline-secondary"
          onClick={onClose}
          style={{ borderRadius: 12, minWidth: 138 }}
        >
          Ακύρωση
        </Button>
        <Button
          variant="warning"
          onClick={onConfirm}
          style={{ borderRadius: 12, minWidth: 164 }}
        >
          Επιβεβαίωση
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
