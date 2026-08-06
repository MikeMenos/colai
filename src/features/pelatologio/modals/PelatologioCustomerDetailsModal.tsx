"use client";

import React from "react";
import { Button, Modal } from "react-bootstrap";

import MapDirectionsChooser from "@/components/ui/MapDirectionsChooser";
import TruncatedClickTooltip from "@/components/ui/TruncatedClickTooltip";
import type {
  ColaiSearchAmkaAddress,
  ColaiSearchAmkaCustomer,
  ColaiSearchAmkaRelatedPerson,
} from "@/types/api/sqlData";

function telHref(phone: string): string {
  const digits = phone.trim().replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}

function CopyButton({
  value,
  ariaLabel,
}: {
  value: string;
  ariaLabel: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const text = value.trim();
  if (!text) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className="btn btn-link btn-sm p-0 border-0 d-inline-flex align-items-center"
      style={{ color: "var(--bs-secondary)", lineHeight: 1 }}
      aria-label={copied ? "Αντιγράφηκε" : ariaLabel}
      title={copied ? "Αντιγράφηκε" : "Αντιγραφή"}
      onClick={(event) => {
        event.stopPropagation();
        void handleCopy();
      }}
    >
      <i className={`bi ${copied ? "bi-check2" : "bi-copy"}`} aria-hidden />
    </button>
  );
}

function MetaLine({
  label,
  value,
  copyable = false,
  alwaysShow = false,
}: {
  label: string;
  value?: string | null;
  copyable?: boolean;
  alwaysShow?: boolean;
}) {
  const text = String(value ?? "").trim();
  if (!text && !alwaysShow) return null;
  return (
    <div className="small d-flex align-items-center flex-wrap gap-1">
      <span className="text-secondary">{label}: </span>
      <span className="fw-medium">{text || "—"}</span>
      {copyable && text ? (
        <CopyButton value={text} ariaLabel={`Αντιγραφή ${label}`} />
      ) : null}
    </div>
  );
}

function PhoneLine({ label, phone }: { label: string; phone: string }) {
  const text = phone.trim();
  if (!text) return null;
  const href = telHref(text);

  return (
    <div className="small d-flex align-items-center flex-wrap gap-1">
      <span className="text-secondary">{label}: </span>
      {href ? (
        <a
          href={href}
          className="fw-medium d-inline-flex align-items-center gap-1 text-decoration-none"
          style={{ color: "var(--bs-primary)" }}
        >
          <i className="bi bi-telephone-fill" aria-hidden style={{ fontSize: 12 }} />
          {text}
        </a>
      ) : (
        <span className="fw-medium">{text}</span>
      )}
    </div>
  );
}

function AddressCard({ address }: { address: ColaiSearchAmkaAddress }) {
  const [showMapChooser, setShowMapChooser] = React.useState(false);
  const line = [address.address, address.city, address.postalCode]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
  const telephone = address.telephone.trim();
  const mapQuery = [address.address, address.postalCode, address.city]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
  const canOpenMap = Boolean(mapQuery);

  const mapButtonClassName =
    "btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 flex-shrink-0";
  const mapButtonStyle: React.CSSProperties = {
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
  };

  function renderMapButton() {
    if (!canOpenMap) return null;
    return (
      <button
        type="button"
        className={mapButtonClassName}
        style={mapButtonStyle}
        aria-label="Άνοιγμα επιλογών χάρτη"
        onClick={() => setShowMapChooser(true)}
      >
        <i className="bi bi-box-arrow-up-right" aria-hidden />
        Χάρτης
      </button>
    );
  }

  function renderMainBadge() {
    return address.isMain ? (
      <span className="badge bg-primary-subtle text-primary-emphasis border">
        Κύρια
      </span>
    ) : (
      <span className="badge bg-body-tertiary text-secondary border">
        Επιπλέον
      </span>
    );
  }

  function renderLastDeliveryBadge() {
    if (!address.isLastDelivery) return null;
    return (
      <span className="badge text-bg-warning">
        <i className="bi bi-geo-alt-fill me-1" aria-hidden />
        Τελευταία παράδοση
      </span>
    );
  }

  function renderBadges() {
    return (
      <>
        {renderMainBadge()}
        {renderLastDeliveryBadge()}
      </>
    );
  }

  return (
    <>
      <div
        className={`rounded-3 px-3 py-2 ${
          address.isLastDelivery
            ? "border border-warning-subtle"
            : "border border-translucent"
        }`}
        style={
          address.isLastDelivery
            ? {
                background: "rgba(var(--bs-warning-rgb), 0.12)",
              }
            : {
                background: "rgba(var(--bs-secondary-rgb), 0.04)",
              }
        }
      >
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div className="min-w-0 overflow-hidden flex-grow-1">
            <TruncatedClickTooltip
              text={line || "—"}
              className="fw-semibold"
              style={{ lineHeight: 1.3 }}
              tooltipId={`address-tooltip-${address.key}`}
            />
            {telephone ? (
              <div className="mt-1">
                <PhoneLine label="Τηλ" phone={telephone} />
              </div>
            ) : null}
          </div>
          <div className="d-none d-md-flex flex-column align-items-end gap-1 flex-shrink-0">
            <div className="d-inline-flex align-items-center gap-1">
              {renderMapButton()}
              {renderMainBadge()}
            </div>
            {renderLastDeliveryBadge()}
          </div>
        </div>

        <div className="d-flex d-md-none align-items-center justify-content-between flex-wrap gap-2 mt-2">
          <div className="d-flex align-items-center flex-wrap gap-1">
            {renderBadges()}
          </div>
          {canOpenMap ? renderMapButton() : null}
        </div>
      </div>

      {canOpenMap ? (
        <MapDirectionsChooser
          show={showMapChooser}
          onHide={() => setShowMapChooser(false)}
          query={mapQuery}
          location={line || mapQuery}
        />
      ) : null}
    </>
  );
}

function RelatedPersonCard({
  person,
}: {
  person: ColaiSearchAmkaRelatedPerson;
}) {
  return (
    <div className="rounded-3 border px-3 py-2">
      <div className="mb-2">
        <div className="small text-secondary">Σχετιζόμενο πρόσωπο</div>
        <div
          className="fw-semibold text-truncate"
          title={person.personName || undefined}
        >
          {person.personName || "—"}
        </div>
      </div>
      <div className="d-flex flex-column gap-1 mb-2">
        <MetaLine label="ΑΜΚΑ" value={person.personAmka} copyable />
        <MetaLine label="ΑΦΜ" value={person.taxRegistrationNumber} />
        <MetaLine label="ΑΤ/Διαβατήριο" value={person.idCode} alwaysShow />
        <PhoneLine label="Κινητό" phone={person.mobile} />
      </div>
      {person.addresses.length > 0 ? (
        <div className="d-flex flex-column gap-2">
          {person.addresses.map((address) => (
            <AddressCard key={address.key} address={address} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function PelatologioCustomerDetailsModal({
  show,
  customer,
  onClose,
}: {
  show: boolean;
  customer: ColaiSearchAmkaCustomer | null;
  onClose: () => void;
}) {
  const title =
    customer?.traderName || customer?.personName || "Στοιχεία πελάτη";

  return (
    <Modal show={show} onHide={onClose} centered scrollable size="lg">
      <Modal.Header closeButton className="gap-2">
        <Modal.Title
          className="fw-semibold text-truncate me-auto"
          title={title}
          style={{ minWidth: 0, maxWidth: "100%" }}
        >
          {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {customer ? (
          <div className="d-flex flex-column gap-3">
            <div className="d-flex align-items-start justify-content-between gap-2">
              <div className="d-flex flex-column gap-1 min-w-0">
                <MetaLine
                  label="ΑΜΚΑ"
                  value={customer.amka || customer.personAmka}
                  copyable
                />
                <MetaLine label="ΑΦΜ" value={customer.taxRegistrationNumber} />
                <MetaLine label="ΑΤ/Διαβατήριο" value={customer.idCode} alwaysShow />
                {customer.phones.map((phone) => (
                  <PhoneLine key={phone} label="Τηλέφωνο" phone={phone} />
                ))}
              </div>
              {customer.certified ? (
                <span className="badge bg-success-subtle text-success-emphasis border flex-shrink-0">
                  <i className="bi bi-check-lg me-1" aria-hidden />
                  Πιστοποιημένος
                </span>
              ) : null}
            </div>

            <div>
              <div className="small text-secondary fw-semibold mb-2">
                Διευθύνσεις
              </div>
              {customer.addresses.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {customer.addresses.map((address) => (
                    <AddressCard key={address.key} address={address} />
                  ))}
                </div>
              ) : (
                <div className="small text-secondary">
                  Δεν βρέθηκαν διευθύνσεις.
                </div>
              )}
            </div>

            {customer.relatedPersons.length > 0 ? (
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i
                    className="bi bi-people text-primary"
                    aria-hidden
                    style={{ fontSize: "0.95em" }}
                  />
                  <div className="small text-secondary fw-semibold">
                    Σχετιζόμενα πρόσωπα
                  </div>
                  <div
                    className="flex-grow-1"
                    style={{
                      height: 1,
                      background: "var(--bs-border-color-translucent)",
                    }}
                    aria-hidden
                  />
                </div>
                <div className="d-flex flex-column gap-2">
                  {customer.relatedPersons.map((person) => (
                    <RelatedPersonCard key={person.key} person={person} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Κλείσιμο
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
