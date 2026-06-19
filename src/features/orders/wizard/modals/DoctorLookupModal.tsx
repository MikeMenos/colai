"use client";

import React from "react";
import { Modal } from "react-bootstrap";
import { useAppDispatch } from "@/store/hooks";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import AppLoader from "@/components/ui/AppLoader";
import type {
  DoctorSearchResult,
  SearchDoctorsSuccess,
} from "@/types/api/responses";
import { parseProxyJson } from "@/lib/api/client";

export type DoctorLookupModal = DoctorSearchResult;

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
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<DoctorLookupModal[]>([]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setQ("");
    setResults([]);
    setError(null);
    setLoading(false);
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

  function applyDoctor(c: DoctorLookupModal) {
    if (isOtherSuggested) {
      dispatch(
        setDraftProperty({
          key: "otherDoctorSuggested_name",
          value: c.doctoR_NAME,
        }),
      );
      dispatch(
        setDraftProperty({
          key: "otherDoctorSuggested_amka",
          value: c.doctoR_AMKA,
        }),
      );
      dispatch(
        setDraftProperty({
          key: "otherDoctorSuggested_afm",
          value: c.doctoR_AFM,
        }),
      );
      dispatch(
        setDraftProperty({
          key: "otherDoctorSuggested_ErpGID",
          value: c.gid,
        }),
      );
      dispatch(
        setDraftProperty({
          key: "otherDoctorSuggested_domi",
          value: c.domi?.trim() ?? "",
        }),
      );
      dispatch(
        setDraftProperty({
          key: "otherDoctorSuggested_mobile",
          value: (c.mobile1?.trim() || c.mobile2?.trim()) ?? "",
        }),
      );
    } else if (isSuggested) {
      dispatch(
        setDraftProperty({ key: "doctorSuggested_name", value: c.doctoR_NAME }),
      );
      dispatch(
        setDraftProperty({ key: "doctorSuggested_amka", value: c.doctoR_AMKA }),
      );
      dispatch(
        setDraftProperty({ key: "doctorSuggested_afm", value: c.doctoR_AFM }),
      );
      dispatch(
        setDraftProperty({ key: "doctorSuggested_ErpGID", value: c.gid }),
      );
      dispatch(
        setDraftProperty({
          key: "doctorSuggested_domi",
          value: c.domi?.trim() ?? "",
        }),
      );
      dispatch(
        setDraftProperty({
          key: "doctorSuggested_tel",
          value: (c.mobile1?.trim() || c.mobile2?.trim()) ?? "",
        }),
      );
    } else {
      dispatch(setDraftProperty({ key: "doctor_name", value: c.doctoR_NAME }));
      dispatch(setDraftProperty({ key: "doctor_amka", value: c.doctoR_AMKA }));
      dispatch(setDraftProperty({ key: "doctor_afm", value: c.doctoR_AFM }));
      dispatch(setDraftProperty({ key: "doctor_ErpGID", value: c.gid }));
    }

    onClose();
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
                  onClick={() => applyDoctor(r)}
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
      </Modal.Body>
    </Modal>
  );
}
