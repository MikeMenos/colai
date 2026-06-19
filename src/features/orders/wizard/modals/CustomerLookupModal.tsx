"use client";

import React from "react";
import { Modal } from "react-bootstrap";
import { useAppDispatch } from "@/store/hooks";
import { formatLastCustomerWebOrderRow } from "@/lib/customerUtils";
import type { CustomerSearchResult } from "@/types/api/responses";
import AppLoader from "@/components/ui/AppLoader";
import {
  applyCustomerFromSearch,
  applyLastCustomerWebOrderFromSearch,
  searchCustomersByQuery,
} from "./customerSearchActions";

export type { CustomerSearchResult };

export default function CustomerLookupModal({
  show,
  onClose,
  resetWizardOnDifferentAmka = false,
  baselineCustomerAmkaRef,
}: {
  show: boolean;
  onClose: () => void;
  resetWizardOnDifferentAmka?: boolean;
  baselineCustomerAmkaRef?: React.RefObject<string | null>;
}) {
  const dispatch = useAppDispatch();
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [applying, setApplying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<CustomerSearchResult[]>([]);
  const [lastCustomerWebOrder, setLastCustomerWebOrder] = React.useState<Record<
    string,
    unknown
  > | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setQ("");
    setResults([]);
    setLastCustomerWebOrder(null);
    setError(null);
    setHasSearched(false);
    setLoading(false);
    setApplying(false);
  }, [show]);

  async function search() {
    inputRef.current?.blur();
    const query = q.trim();
    if (query.length < 2) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const outcome = await searchCustomersByQuery(query);
      setResults(outcome.results);
      setLastCustomerWebOrder(outcome.lastCustomerWebOrder);
      setError(outcome.error);
    } finally {
      setLoading(false);
    }
  }

  const searchOptions = React.useCallback(
    () => ({
      resetWizardOnDifferentAmka,
      baselineCustomerAmka: baselineCustomerAmkaRef?.current ?? null,
    }),
    [baselineCustomerAmkaRef, resetWizardOnDifferentAmka],
  );

  async function applyCustomer(c: CustomerSearchResult) {
    setApplying(true);
    try {
      await applyCustomerFromSearch(dispatch, c, searchOptions());
      onClose();
    } finally {
      setApplying(false);
    }
  }

  async function applyLastCustomerWebOrder(lwo: Record<string, unknown>) {
    setApplying(true);
    try {
      await applyLastCustomerWebOrderFromSearch(dispatch, lwo, searchOptions());
      onClose();
    } finally {
      setApplying(false);
    }
  }

  const lastWebOrderRow = lastCustomerWebOrder
    ? formatLastCustomerWebOrderRow(lastCustomerWebOrder)
    : null;

  return (
    <Modal
      dialogClassName="modal-grow-scroll"
      show={show}
      onHide={onClose}
      centered
      contentClassName="premium-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="h6 mb-0">Αναζήτηση ασθενή</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex gap-2">
          <input
            ref={inputRef}
            className="form-control"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="π.χ ΑΜΚΑ ή Ονοματεπώνυμο"
            inputMode="search"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") search();
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={search}
            disabled={q.trim().length < 2 || loading}
          >
            <i className="bi bi-search" />
          </button>
        </div>

        {error ? (
          <div className="alert alert-danger small mt-3 mb-0 py-2">{error}</div>
        ) : null}

        <div className="modal-results mt-3">
          {loading ? (
            <AppLoader label="Αναζήτηση…" card={false} />
          ) : results.length ? (
            <div className="list-group">
              {results.map((r, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="list-group-item list-group-item-action"
                  onClick={() => void applyCustomer(r)}
                  disabled={applying}
                >
                  <div className="fw-semibold">{r.pE_NAME || "—"}</div>
                  <div className="small text-secondary">
                    AMKA: {r.tR_StringField5 || "—"}
                  </div>
                  <div className="small text-secondary">
                    Διέυθυνση:{" "}
                    {`${r.peS_CityCode ?? ""} ${r.peS_Address1 ?? ""}`}
                  </div>
                </button>
              ))}
            </div>
          ) : lastWebOrderRow ? (
            <div className="list-group">
              <button
                type="button"
                className="list-group-item list-group-item-action"
                onClick={() =>
                  void applyLastCustomerWebOrder(lastCustomerWebOrder!)
                }
                disabled={applying}
              >
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <div className="fw-semibold">{lastWebOrderRow.name}</div>
                  <span className="badge text-bg-success">Νέος/Προς EBS</span>
                </div>
                <div className="small text-secondary">
                  AMKA: {lastWebOrderRow.amka}
                </div>
                <div className="small text-secondary">
                  Διέυθυνση: {lastWebOrderRow.addressLine}
                </div>
              </button>
            </div>
          ) : hasSearched && !error ? (
            <div className="text-secondary small py-3 text-center">
              Δεν υπάρχουν αποτελέσματα.
            </div>
          ) : null}
        </div>
        {applying ? (
          <div className="small text-secondary d-flex align-items-center mt-2 gap-2">
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden
            />
            Φόρτωση τελευταίας παραγγελίας…
          </div>
        ) : null}
      </Modal.Body>
    </Modal>
  );
}
