"use client";

import { hasText } from "@/lib/utils/string";
import { Button, Modal } from "react-bootstrap";
import { useAppSelector } from "@/store/hooks";
import SavedRecipientFields from "../eopyy/SavedRecipientFields";
import type { NewRecipientConfirmModalProps } from "./types";

function ChoiceCard({
  icon,
  iconClassName,
  iconWrapStyle,
  title,
  description,
  children,
}: {
  icon: string;
  iconClassName: string;
  iconWrapStyle: React.CSSProperties;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="app-card-soft p-3">
      <div className="d-flex align-items-center mb-3 gap-3">
        <div
          className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
          style={iconWrapStyle}
        >
          <i className={`bi ${icon} ${iconClassName}`} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="fw-semibold">{title}</div>
          <div className="text-secondary small mt-1">{description}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function NewRecipientConfirmModal({
  show,
  onConfirmNewRecipient,
  onSelectExisting,
  onCancel,
}: NewRecipientConfirmModalProps) {
  const data = useAppSelector((s) => s.orders.draft.order);
  const hasExistingSelection = hasText(data.person_ErpGID);

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
        <Modal.Title className="fw-semibold h6 mb-0">
          Παραλαβή παραλήπτη
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="text-secondary small mb-3">
          Έχετε ήδη αποθηκευμένους παραλήπτες. Επιλέξτε έναν από τη λίστα ή
          συνεχίστε με νέο πρόσωπο που δεν υπάρχει στο πελατολόγιο.
        </div>

        <ChoiceCard
          icon="bi-people-fill"
          iconClassName="text-primary"
          iconWrapStyle={{
            width: 40,
            height: 40,
            background: "rgba(var(--bs-primary-rgb), .12)",
            border: "1px solid rgba(var(--bs-primary-rgb), .18)",
          }}
          title="Επιλογή από την υπάρχουσα λίστα"
        >
          <SavedRecipientFields />
          <Button
            variant="primary"
            className="w-100"
            style={{ borderRadius: 12 }}
            disabled={!hasExistingSelection}
            onClick={onSelectExisting}
          >
            <i className="bi bi-check2-circle me-2" />
            Επιλογή παραλήπτη
          </Button>
        </ChoiceCard>

        <div
          className="d-flex align-items-center text-secondary small my-3 gap-2 px-1"
          aria-hidden
        >
          <hr className="m-0 flex-grow-1" />
          <span className="text-uppercase fw-semibold">ή</span>
          <hr className="m-0 flex-grow-1" />
        </div>

        <ChoiceCard
          icon="bi-person-plus-fill"
          iconClassName="text-success"
          iconWrapStyle={{
            width: 40,
            height: 40,
            background: "rgba(var(--bs-success-rgb), .12)",
            border: "1px solid rgba(var(--bs-success-rgb), .18)",
          }}
          title="Συνέχεια με νέο πρόσωπο"
          description="Το πρόσωπο δεν βρίσκεται στη λίστα και θα συμπληρώσετε νέα στοιχεία παραλήπτη."
        >
          <Button
            variant="outline-success"
            className="w-100"
            style={{ borderRadius: 12 }}
            onClick={onConfirmNewRecipient}
          >
            <i className="bi bi-person-plus me-2" />
            Προσθήκη νέου παραλήπτη
          </Button>
        </ChoiceCard>
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
      </Modal.Footer>
    </Modal>
  );
}
