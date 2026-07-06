"use client";

import type { DoctorLookupModal } from "./DoctorLookupModal.types";
import React from "react";
import { Modal } from "react-bootstrap";
import { useAppDispatch } from "@/store/hooks";
import { patchDraftOrder } from "@/store/orders/ordersSlice";
import AppLoader from "@/components/ui/AppLoader";
import type {
  DoctorSearchResult,
  SearchDoctorsSuccess,
} from "@/types/api/responses";
import type { Order } from "@/types/orders";
import { parseProxyJson } from "@/lib/api/client";

function buildDoctorPatch(
  c: DoctorLookupModal,
  isSuggested?: boolean,
  isOtherSuggested?: boolean,
): Partial<Order> {
  const phone = (c.mobile1?.trim() || c.mobile2?.trim()) ?? "";

  if (isOtherSuggested) {
    return {
      otherDoctorSuggested_name: c.doctoR_NAME,
      otherDoctorSuggested_amka: c.doctoR_AMKA,
      otherDoctorSuggested_afm: c.doctoR_AFM,
      otherDoctorSuggested_ErpGID: c.gid,
      otherDoctorSuggested_domi: c.domi?.trim() ?? "",
      otherDoctorSuggested_mobile: phone,
    } as Partial<Order>;
  }

  if (isSuggested) {
    return {
      doctorSuggested_name: c.doctoR_NAME,
      doctorSuggested_amka: c.doctoR_AMKA,
      doctorSuggested_afm: c.doctoR_AFM,
      doctorSuggested_ErpGID: c.gid,
      doctorSuggested_domi: c.domi?.trim() ?? "",
      doctorSuggested_tel: phone,
    } as Partial<Order>;
  }

  return {
    doctor_name: c.doctoR_NAME,
    doctor_amka: c.doctoR_AMKA,
    doctor_afm: c.doctoR_AFM,
    doctor_ErpGID: c.gid,
  } as Partial<Order>;
}

export default function DoctorLookupModal({
  show,
  onClose,
  isSuggested,
  isOtherSuggested,
}: {
  show: boolean;
  isSuggested?: boolean;
  isOtherSuggested?: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [applying, setApplying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<DoctorLookupModal[]>([]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setQ("");
    setResults([]);
    setError(null);
    setLoading(false);
    setApplying(false);
  }, [show]);

  async function search() {
    inputRef.current?.blur();
    const query = q.trim();

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/doctors?q=${encodeURIComponent(query)}&_ts=${Date.now()}`,
        {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        },
      );
      const data = await parseProxyJson<SearchDoctorsSuccess>(
        res,
        "Search failed",
      );

      setResults(data.listDoctors ?? []);
    } catch (e: any) {
      setError(e?.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }

  async function applyDoctor(c: DoctorLookupModal) {
    setApplying(true);
    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });
      dispatch(
        patchDraftOrder(
          buildDoctorPatch(c, isSuggested, isOtherSuggested),
        ),
      );
      onClose();
    } finally {
      setApplying(false);
    }
  }

  return (
    <Modal
      dialogClassName="modal-grow-scroll"
      show={show}
      onHide={onClose}
      centered
      contentClassName="premium-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="h6 mb-0">Αναζήτηση Ιατρού</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex gap-2">
          <input
            ref={inputRef}
            className="form-control"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="π.χ. ΑΜΚΑ ή Ονοματεπώνυμο"
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
            disabled={q.trim().length < 2 || loading || applying}
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
                  onClick={() => void applyDoctor(r)}
                  disabled={applying}
                >
                  <div className="fw-semibold">{r.doctoR_NAME || "—"}</div>
                  <div className="small text-secondary">
                    AMKA: {r.doctoR_AMKA || "—"}
                  </div>
                  <div className="small text-secondary">
                    Ειδικότητα: {`${r.eidikotita ?? ""}` || "—"}
                  </div>
                  <div className="small text-secondary">
                    Δομή: {r.domi?.trim() || "—"}
                  </div>
                  <div className="small text-secondary">
                    Τηλέφωνο: {r.mobile1?.trim() || r.mobile2?.trim() || "—"}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-secondary small py-3 text-center">
              Δεν υπάρχουν αποτελέσματα.
            </div>
          )}
        </div>
        {applying ? (
          <div className="small text-secondary d-flex align-items-center mt-2 gap-2">
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden
            />
            Εφαρμογή επιλογής…
          </div>
        ) : null}
      </Modal.Body>
    </Modal>
  );
}
