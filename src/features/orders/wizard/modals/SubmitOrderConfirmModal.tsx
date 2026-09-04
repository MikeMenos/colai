"use client";

import React from "react";
import { Alert, Button, Modal } from "react-bootstrap";
import type {
  SubmitOrderConfirmModalProps,
  SubmitOrderConfirmReviewField,
} from "./types";

const DEFAULT_REVIEW_FIELDS: SubmitOrderConfirmReviewField[] = [
  "otp",
  "recipientName",
  "recipientAddress",
  "amka",
  "dateOfSyntagi",
  "dateIsxyeiApo",
  "dateIsxyeiEos",
  "eidosEgkrisis",
  "barcode",
];

const REVIEW_FIELD_LABELS: Record<SubmitOrderConfirmReviewField, string> = {
  otp: "OTP",
  recipientName: "Παραλήπτης",
  recipientAddress: "Διεύθ. παραλήπτη",
  amka: "ΑΜΚΑ παραλήπτη",
  dateOfSyntagi: "Ημερομηνία συνταγής",
  dateIsxyeiApo: "Ισχύς από",
  dateIsxyeiEos: "Έως",
  eidosEgkrisis: "Είδος έγκρισης",
  barcode: "Barcode",
  suggestedDoctorName: "Συστήνων ιατρός",
};

const PROMINENT_REVIEW_FIELDS = new Set<SubmitOrderConfirmReviewField>([
  "barcode",
  "dateOfSyntagi",
  "eidosEgkrisis",
  "dateIsxyeiApo",
  "dateIsxyeiEos",
]);

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

function PrescriptionReviewHighlight({
  barcode,
  dateOfSyntagi,
  eidosEgkrisis,
  dateIsxyeiApo,
  dateIsxyeiEos,
}: {
  barcode?: string | null;
  dateOfSyntagi?: string | null;
  eidosEgkrisis?: string | null;
  dateIsxyeiApo?: string | null;
  dateIsxyeiEos?: string | null;
}) {
  const displayValue = (value?: string | null) =>
    value?.trim() ? value.trim() : "—";

  return (
    <div
      className="rounded-3 mb-3 p-3"
      style={{
        background: "rgba(var(--bs-primary-rgb), 0.06)",
        border: "1px solid rgba(var(--bs-primary-rgb), 0.18)",
      }}
    >
      <div
        className="text-primary text-uppercase fw-semibold mb-3"
        style={{ fontSize: 11, letterSpacing: "0.04em" }}
      >
        Στοιχεια συνταγης
      </div>

      <div className="d-flex flex-column gap-3">
        <div>
          <div className="small text-secondary mb-1">
            {REVIEW_FIELD_LABELS.barcode}
          </div>
          <div className="fw-bold text-break" style={{ fontSize: "1.1rem" }}>
            {displayValue(barcode)}
          </div>
        </div>

        <div>
          <div className="small text-secondary mb-1">
            {REVIEW_FIELD_LABELS.dateOfSyntagi}
          </div>
          <div className="fw-bold" style={{ fontSize: "1.1rem" }}>
            {displayValue(dateOfSyntagi)}
          </div>
        </div>

        <div>
          <div className="small text-secondary mb-1">
            {REVIEW_FIELD_LABELS.eidosEgkrisis}
          </div>
          <div className="fw-semibold" style={{ fontSize: "1rem" }}>
            {displayValue(eidosEgkrisis)}
          </div>
        </div>

        <div className="row g-3">
          <div className="col-6">
            <div className="small text-secondary mb-1">
              {REVIEW_FIELD_LABELS.dateIsxyeiApo}
            </div>
            <div className="fw-semibold" style={{ fontSize: "1rem" }}>
              {displayValue(dateIsxyeiApo)}
            </div>
          </div>
          <div className="col-6">
            <div className="small text-secondary mb-1">
              {REVIEW_FIELD_LABELS.dateIsxyeiEos}
            </div>
            <div className="fw-semibold" style={{ fontSize: "1rem" }}>
              {displayValue(dateIsxyeiEos)}
            </div>
          </div>
        </div>
      </div>
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

function SubmitConfirmInfoBanner({ label }: { label: string }) {
  return (
    <div
      className="d-flex align-items-center rounded-3 gap-2 px-3 py-2"
      style={{
        background: "rgba(var(--bs-warning-rgb), 0.12)",
        border: "1px solid rgba(var(--bs-warning-rgb), 0.28)",
      }}
    >
      <i className="bi bi-exclamation-triangle-fill text-warning flex-shrink-0" />
      <span className="small fw-semibold">{label}</span>
    </div>
  );
}

function SubmitConfirmToggleWarnings({
  isPaid = false,
  showPaymentMethodInfo = false,
}: {
  isPaid?: boolean;
  showPaymentMethodInfo?: boolean;
}) {
  if (!showPaymentMethodInfo) return null;

  return (
    <div className="d-flex flex-column mb-3 gap-2">
      <SubmitConfirmInfoBanner
        label={isPaid ? "Πληρωμή μέσω κατάθεσης" : "Πληρωμή με αντικαταβολή"}
      />
    </div>
  );
}

export default function SubmitOrderConfirmModal({
  show,
  loading = false,
  error,
  otp,
  amka,
  recipientName,
  recipientAddress,
  barcode,
  dateOfSyntagi,
  dateIsxyeiApo,
  dateIsxyeiEos,
  eidosEgkrisis,
  customerIsCompletelyNew = false,
  suggestedDoctorName,
  orderAsSeller,
  isPaid = false,
  showPaymentMethodInfo = false,
  reviewFields = DEFAULT_REVIEW_FIELDS,
  onClose,
  onConfirm,
}: SubmitOrderConfirmModalProps) {
  const reviewValues: Record<
    SubmitOrderConfirmReviewField,
    string | null | undefined
  > = {
    otp,
    recipientName,
    recipientAddress,
    amka,
    dateOfSyntagi,
    dateIsxyeiApo,
    dateIsxyeiEos,
    eidosEgkrisis,
    barcode,
    suggestedDoctorName,
  };
  const visibleReviewFields =
    customerIsCompletelyNew && !reviewFields.includes("suggestedDoctorName")
      ? [...reviewFields, "suggestedDoctorName" as const]
      : reviewFields;
  const standardReviewFields = visibleReviewFields.filter(
    (field) => !PROMINENT_REVIEW_FIELDS.has(field),
  );
  const showPrescriptionHighlight = visibleReviewFields.some((field) =>
    PROMINENT_REVIEW_FIELDS.has(field),
  );

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
          </div>
        </div>

        <div className="app-card-soft mt-1 p-3">
          {orderAsSeller ? (
            <OrderAsSellerHighlight value={orderAsSeller} />
          ) : null}
          <SubmitConfirmToggleWarnings
            isPaid={isPaid}
            showPaymentMethodInfo={showPaymentMethodInfo}
          />
          {showPrescriptionHighlight ? (
            <PrescriptionReviewHighlight
              barcode={barcode}
              dateOfSyntagi={dateOfSyntagi}
              eidosEgkrisis={eidosEgkrisis}
              dateIsxyeiApo={dateIsxyeiApo}
              dateIsxyeiEos={dateIsxyeiEos}
            />
          ) : null}
          {standardReviewFields.map((field) => (
            <SummaryRow
              key={field}
              label={REVIEW_FIELD_LABELS[field]}
              value={reviewValues[field]}
            />
          ))}
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
