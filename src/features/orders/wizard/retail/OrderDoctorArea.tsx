import { setDraftProperty } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React from "react";
import DoctorLookupModal from "../modals/DoctorLookupModal";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>
      {children}
      {hint ? <div className="form-text">{hint}</div> : null}
    </div>
  );
}

export default function OrderDoctorArea() {
  const data = useAppSelector((s) => s.orders.draft.order);
  const dispatch = useAppDispatch();
  const [showLookup, setShowLookup] = React.useState(false);

  return (
    <div className="app-card px-3 py-2">
      <div
        style={{ height: 51 }}
        className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2"
      >
        <div className="fw-semibold">Ιατρός</div>

        {data.has_suggested_doctor == 2 && (
          <button
            type="button"
            className="btn-icon-pill"
            aria-label="Αναζήτηση"
            onClick={() => setShowLookup(true)}
          >
            <i className="bi bi-search" />
          </button>
        )}
      </div>

      <DoctorLookupModal
        show={showLookup}
        isSuggested
        onClose={() => setShowLookup(false)}
      />

      <div className="form-check form-switch switch-lg mb-2">
        <input
          className="form-check-input"
          type="checkbox"
          checked={data.has_suggested_doctor == 2}
          onChange={(e) => {
            dispatch(
              setDraftProperty({
                key: "has_suggested_doctor",
                value: e.target.checked ? 2 : 0,
              }),
            );
            dispatch(
              setDraftProperty({
                key: "hasOtherSystinonIatroBool",
                value: e.target.checked,
              }),
            );
          }}
          id="has_suggested_doctor"
        />
        <label className="form-check-label" htmlFor="has_suggested_doctor">
          Έχω συστήνων ιατρό
        </label>
      </div>

      {data.has_suggested_doctor == 2 && (
        <>
          <Field label="ΑΜΚΑ Ιατρού">
            <input
              className="form-control"
              value={data.doctorSuggested_amka ?? ""}
              onChange={(e) =>
                dispatch(
                  setDraftProperty({
                    key: "doctorSuggested_amka",
                    value: e.target.value,
                  }),
                )
              }
            />
          </Field>
          <Field label="Ονοματεπώνυμο">
            <input
              className="form-control"
              value={data.doctorSuggested_name ?? ""}
              onChange={(e) =>
                dispatch(
                  setDraftProperty({
                    key: "doctorSuggested_name",
                    value: e.target.value,
                  }),
                )
              }
            />
          </Field>
          <Field label="ΑΦΜ">
            <input
              className="form-control"
              value={data.doctorSuggested_afm ?? ""}
              onChange={(e) =>
                dispatch(
                  setDraftProperty({
                    key: "doctorSuggested_afm",
                    value: e.target.value,
                  }),
                )
              }
            />
          </Field>
          <div className="row g-2">
            <div className="col-6">
              <Field label="Δομή">
                <input
                  className="form-control"
                  name="doctorSuggested_domi"
                  value={data.doctorSuggested_domi ?? ""}
                  onChange={(e) =>
                    dispatch(
                      setDraftProperty({
                        key: "doctorSuggested_domi",
                        value: e.target.value,
                      }),
                    )
                  }
                />
              </Field>
            </div>
            <div className="col-6">
              <Field label="Τηλέφωνο">
                <input
                  className="form-control"
                  name="doctorSuggested_tel"
                  inputMode="tel"
                  value={data.doctorSuggested_tel ?? ""}
                  onChange={(e) =>
                    dispatch(
                      setDraftProperty({
                        key: "doctorSuggested_tel",
                        value: e.target.value,
                      }),
                    )
                  }
                />
              </Field>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
