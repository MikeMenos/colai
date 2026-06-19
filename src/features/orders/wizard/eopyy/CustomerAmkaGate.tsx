"use client";

import React from "react";
import { getAmkaInlineFieldError, isValidAmka, normalizeAmka } from "@/lib/utils/amka";
import { CustomerAmkaSearchPanel } from "./CustomerAmkaSearchPanel";

export default function CustomerAmkaGate() {
  const [amka, setAmka] = React.useState("");
  const [resultsOpen, setResultsOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement | null>(null);
  const amkaError = getAmkaInlineFieldError(amka);
  const amkaIsValid = isValidAmka(amka);

  return (
    <div className="app-card p-4">
      <div
        className="rounded-4 border p-4 text-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(var(--bs-primary-rgb), 0.08) 0%, rgba(var(--bs-primary-rgb), 0.02) 100%)",
          borderColor: "rgba(var(--bs-primary-rgb), 0.15)",
        }}
      >
        <div
          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
          style={{
            width: 56,
            height: 56,
            background: "rgba(var(--bs-primary-rgb), 0.12)",
            border: "1px solid rgba(var(--bs-primary-rgb), 0.18)",
          }}
        >
          <i className="bi bi-person-vcard fs-4 text-primary" />
        </div>

        <div className="fw-semibold fs-5 mb-2">Αναζητήστε με ΑΜΚΑ</div>
        <div className="text-secondary small mx-auto mb-4" style={{ maxWidth: 420 }}>
          Πριν συμπληρώσετε τα στοιχεία του ασθενή, εισάγετε τον ΑΜΚΑ για να
          ελέγξουμε αν υπάρχει ήδη στο σύστημα.
        </div>

        <div
          ref={anchorRef}
          className="mx-auto text-start"
          style={{ maxWidth: 360 }}
        >
          <label className="form-label fw-semibold" htmlFor="customer-amka-gate">
            ΑΜΚΑ
          </label>
          <input
            id="customer-amka-gate"
            className={`form-control form-control-lg${amkaError ? " is-invalid" : amkaIsValid ? " is-valid" : ""}`}
            inputMode="numeric"
            autoComplete="off"
            placeholder="11 ψηφία"
            value={amka}
            aria-invalid={!!amkaError}
            aria-expanded={amkaIsValid && resultsOpen}
            aria-haspopup="listbox"
            onChange={(e) => {
              const digits = normalizeAmka(e.target.value);
              const next = digits.startsWith("80") ? digits : digits.slice(0, 11);
              setAmka(next);
              setResultsOpen(isValidAmka(next));
            }}
          />
          {amkaError ? (
            <div className="invalid-feedback d-block">{amkaError}</div>
          ) : (
            <div className="form-text">Η αναζήτηση ξεκινά αυτόματα με έγκυρο ΑΜΚΑ.</div>
          )}
          <CustomerAmkaSearchPanel
            amka={amka}
            completeGate
            open={resultsOpen}
            anchorRef={anchorRef}
            onDismiss={() => setResultsOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
