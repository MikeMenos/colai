"use client";

import React from "react";
import { Alert, Button, Modal } from "react-bootstrap";
import type { SubmitOrderConfirmModalProps } from "./types";

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const displayValue = value?.trim() ? value.trim() : "—";

  return (
    <div className="d-flex justify-content-between border-bottom gap-3 py-2">
      <span className="text-secondary">{label}</span>
      <span className="fw-semibold text-break text-end">{displayValue}</span>
    </div>
  );
}

function OrderAsSellerHighlight({ value }: { value: string }) {
  return (
    <div
      className="d-flex align-items-center rounded-3 mb-3 gap-3 px-3 py-3"
      style={{
        background: "rgba(var(--bs-primary-rgb), 0.08)",
        border: "1px solid rgba(var(--bs-primary-rgb), 0.22)",
      }}
    >
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
        style={{
          width: 40,
          height: 40,
          background: "rgba(var(--bs-primary-rgb), 0.12)",
        }}
      >
        <i className="bi bi-person-badge text-primary" aria-hidden />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          className="text-primary text-uppercase fw-semibold"
          style={{ fontSize: 11, letterSpacing: "0.04em" }}
        >
          Παραγγελια ως
        </div>
        <div
          className="fw-bold text-truncate"
          title={value}
          style={{ fontSize: "1.05rem" }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function SubmitConfirmToggleWarnings({
  isVoiceConsent = false,
  isPaid = false,
}: {
  isVoiceConsent?: boolean;
  isPaid?: boolean;
}) {
  if (!isVoiceConsent && !isPaid) return null;

  return (
    <div className="d-flex flex-column mb-3 gap-2">
      {isVoiceConsent ? (
        <div
          className="d-flex align-items-center rounded-3 gap-2 px-3 py-2"
          style={{
            background: "rgba(var(--bs-warning-rgb), 0.12)",
            border: "1px solid rgba(var(--bs-warning-rgb), 0.28)",
          }}
        >
          <i className="bi bi-exclamation-triangle-fill text-warning flex-shrink-0" />
          <span className="small fw-semibold">
            Τηλ. επικοινωνία για συναίνεση
          </span>
        </div>
      ) : null}
      {isPaid ? (
        <div
          className="d-flex align-items-center rounded-3 gap-2 px-3 py-2"
          style={{
            background: "rgba(var(--bs-warning-rgb), 0.12)",
            border: "1px solid rgba(var(--bs-warning-rgb), 0.28)",
          }}
        >
          <i className="bi bi-exclamation-triangle-fill text-warning flex-shrink-0" />
          <span className="small fw-semibold">Προπληρωμένο</span>
        </div>
      ) : null}
    </div>
  );
}

export default function SubmitOrderConfirmModal({
  show,
  loading = false,
  error,
  otp,
  amka,
  barcode,
  customerIsCompletelyNew = false,
  suggestedDoctorName,
  orderAsSeller,
  isVoiceConsent = false,
  isPaid = false,
  onClose,
  onConfirm,
}: SubmitOrderConfirmModalProps) {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop={loading ? "static" : true}
      keyboard={!loading}
      contentClassName="premium-modal"
    >
      <Modal.Header
        closeButton={!loading}
        style={{ borderBottom: "1px solid var(--bs-border-color-translucent)" }}
      >
        <Modal.Title className="fw-semibold h6 mb-0">
          Επιβεβαίωση αποθήκευσης
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex align-items-start gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 44,
              height: 44,
              background: "rgba(var(--bs-success-rgb), .12)",
              border: "1px solid rgba(var(--bs-success-rgb), .18)",
            }}
          >
            <i className="bi bi-check2-circle text-success" />
          </div>

          <div style={{ minWidth: 0 }}>
            <div className="fw-semibold mb-1">
              Είστε σίγουροι ότι θέλετε να υποβάλετε την παραγγελία;
            </div>
            <div className="text-secondary small">
              Βεβαιωθείτε ότι όλα τα πεδία έχουν συμπληρωθεί σωστά.
            </div>
          </div>
        </div>

        <div className="app-card-soft mt-3 p-3">
          {orderAsSeller ? (
            <OrderAsSellerHighlight value={orderAsSeller} />
          ) : null}
          <SubmitConfirmToggleWarnings
            isVoiceConsent={isVoiceConsent}
            isPaid={isPaid}
          />
          <SummaryRow label="OTP" value={otp} />
          <SummaryRow label="ΑΜΚΑ παραλήπτη" value={amka} />
          <SummaryRow label="Barcode" value={barcode} />
          {customerIsCompletelyNew ? (
            <SummaryRow label="Συστήνων ιατρός" value={suggestedDoctorName} />
          ) : null}
        </div>

        {error ? (
          <Alert className="mt-3 mb-0" variant="danger">
            {error}
          </Alert>
        ) : null}
      </Modal.Body>

      <Modal.Footer
        style={{ borderTop: "1px solid var(--bs-border-color-translucent)" }}
      >
        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={loading}
          style={{ borderRadius: 12 }}
        >
          Ακύρωση
        </Button>
        <Button
          variant="success"
          onClick={onConfirm}
          disabled={loading}
          style={{ borderRadius: 12 }}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden
              />
              Αποθήκευση…
            </>
          ) : (
            "Αποθήκευση"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
