import OrderField from "@/components/ui/OrderField";
import FormErrorsContext from "@/components/ui/FormErrorContect";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { AppDispatch } from "@/store/store";
import React from "react";
import DoctorLookupModal from "../modals/DoctorLookupModal";
import type { OrderDoctorAreaProps } from "./componentProps";
import type { Order } from "@/types/orders";

const OTHER_SUGGESTED_DOCTOR_KEYS = [
  "otherDoctorSuggested_amka",
  "otherDoctorSuggested_name",
  "otherDoctorSuggested_afm",
  "otherDoctorSuggested_domi",
  "otherDoctorSuggested_mobile",
] as const;

const SUGGESTED_DOCTOR_KEYS = [
  "doctorSuggested_amka",
  "doctorSuggested_name",
  "doctorSuggested_afm",
  "doctorSuggested_domi",
  "doctorSuggested_tel",
  "doctorSuggested_ErpGID",
] as const;

type SuggestedDoctorSnapshot = {
  has_suggested_doctor: number;
  hasOtherSystinonIatroBool: boolean;
  doctorSuggested_amka: string;
  doctorSuggested_name: string;
  doctorSuggested_afm: string;
  doctorSuggested_domi: string;
  doctorSuggested_tel: string;
  doctorSuggested_ErpGID: string;
};

function captureSuggestedDoctorSnapshot(
  order: Order,
): SuggestedDoctorSnapshot | null {
  if (order.has_suggested_doctor != 2) return null;

  return {
    has_suggested_doctor: order.has_suggested_doctor,
    hasOtherSystinonIatroBool: Boolean(order.hasOtherSystinonIatroBool),
    doctorSuggested_amka: order.doctorSuggested_amka ?? "",
    doctorSuggested_name: order.doctorSuggested_name ?? "",
    doctorSuggested_afm: order.doctorSuggested_afm ?? "",
    doctorSuggested_domi: order.doctorSuggested_domi ?? "",
    doctorSuggested_tel: order.doctorSuggested_tel ?? "",
    doctorSuggested_ErpGID: order.doctorSuggested_ErpGID ?? "",
  };
}

function restoreSuggestedDoctorSnapshot(
  dispatch: AppDispatch,
  snapshot: SuggestedDoctorSnapshot,
) {
  dispatch(
    setDraftProperty({
      key: "has_suggested_doctor",
      value: snapshot.has_suggested_doctor,
    }),
  );
  dispatch(
    setDraftProperty({
      key: "hasOtherSystinonIatroBool",
      value: snapshot.hasOtherSystinonIatroBool,
    }),
  );
  for (const key of SUGGESTED_DOCTOR_KEYS) {
    dispatch(setDraftProperty({ key, value: snapshot[key] }));
  }
}

function clearOtherSuggestedDoctorFields(dispatch: AppDispatch) {
  for (const key of OTHER_SUGGESTED_DOCTOR_KEYS) {
    dispatch(setDraftProperty({ key, value: "" }));
  }
  dispatch(
    setDraftProperty({ key: "otherDoctorSuggested_ErpGID", value: null }),
  );
}

export default function OrderDoctorArea({
  errors,
  clearError,
}: OrderDoctorAreaProps) {
  const data = useAppSelector((s) => s.orders.draft.order);
  const customerIsCompletelyNew = useAppSelector(
    (s) => s.orders.draft.customerIsCompletelyNew,
  );
  const disableFieldsBelowTypos = customerIsCompletelyNew !== true;
  const isExistingCustomer = !!String(data.customer_ErpGID ?? "").trim();
  const proposeOtherSuggestedDoctor = data.propose_other_suggested_doctor == 1;
  const showOtherSuggestedDoctorFields =
    data.has_suggested_doctor == 2 && !proposeOtherSuggestedDoctor;
  const dispatch = useAppDispatch();
  const [showLookup, setShowLookup] = React.useState(false);
  const [showSuggestedLookup, setShowSuggestedLookup] = React.useState(false);
  const [showChangeSuggestedLookup, setShowChangeSuggestedLookup] =
    React.useState(false);
  const suggestedDoctorBeforeChangeRef =
    React.useRef<SuggestedDoctorSnapshot | null>(null);
  const [otherSuggestedDoctorWasActive, setOtherSuggestedDoctorWasActive] =
    React.useState(false);
  const disableOtherSuggestedDoctorRadio =
    proposeOtherSuggestedDoctor && otherSuggestedDoctorWasActive;

  const openDoctorLookup = () => setShowLookup(true);
  const openSuggestedDoctorLookup = () => setShowSuggestedLookup(true);
  const openChangeSuggestedDoctorLookup = () =>
    setShowChangeSuggestedLookup(true);

  return (
    <div className="app-card px-3 py-2">
      <FormErrorsContext.Provider value={{ errors: errors ?? {}, clearError }}>
        <div className="d-flex align-items-center border-bottom mb-3 gap-3 pb-3">
          <label className="form-label fw-semibold mb-0 flex-shrink-0">
            Ιατρός συνταγής
          </label>
          <div className="input-group flex-grow-1" style={{ minWidth: 0 }}>
            <input
              type="text"
              readOnly
              className="form-control"
              placeholder="Αναζήτηση..."
              onClick={openDoctorLookup}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openDoctorLookup();
                }
              }}
              aria-label="Αναζήτηση ιατρού"
              style={{ cursor: "pointer" }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={openDoctorLookup}
              aria-label="Αναζήτηση"
            >
              <i className="bi bi-search" />
            </button>
          </div>
        </div>

        <DoctorLookupModal
          show={showLookup}
          onClose={() => setShowLookup(false)}
        />

        <OrderField label="Ονοματεπώνυμο">
          <input
            className="form-control"
            name="doctor_name"
            value={data.doctor_name ?? ""}
            onChange={(e) =>
              dispatch(
                setDraftProperty({ key: "doctor_name", value: e.target.value }),
              )
            }
          />
        </OrderField>
        <div className="row g-2">
          <div className="col-6">
            <OrderField label="ΑΜΚΑ">
              <input
                className="form-control"
                name="doctor_amka"
                inputMode="numeric"
                value={data.doctor_amka ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "doctor_amka",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>

          <div className="col-6">
            <OrderField label="ΑΦΜ">
              <input
                className="form-control"
                name="doctor_afm"
                inputMode="numeric"
                value={data.doctor_afm ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "doctor_afm",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <OrderField label="Δομή">
              <input
                className="form-control"
                name="doctor_Domi"
                value={data.doctor_Domi ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "doctor_Domi",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>

          <div className="col-6">
            <OrderField label="Τύπος">
              <input
                className="form-control"
                name="doctor_DomiTypos"
                value={data.doctor_DomiTypos ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "doctor_DomiTypos",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>
        </div>

        <fieldset disabled={disableFieldsBelowTypos}>
          <div className="form-check form-switch switch-lg mb-2">
            <input
              className="form-check-input"
              name="has_suggested_doctor"
              id="has_suggested_doctor_0"
              type="radio"
              checked={
                data.has_suggested_doctor == 0 && !proposeOtherSuggestedDoctor
              }
              disabled={proposeOtherSuggestedDoctor}
              onChange={() => {
                dispatch(
                  setDraftProperty({ key: "has_suggested_doctor", value: 0 }),
                );
                dispatch(
                  setDraftProperty({
                    key: "hasOtherSystinonIatroBool",
                    value: false,
                  }),
                );
              }}
            />
            <label
              className="form-check-label"
              htmlFor="has_suggested_doctor_0"
            >
              Χωρίς συστήνων ιατρό
            </label>
          </div>

          <div className="form-check form-switch switch-lg mb-2">
            <input
              className="form-check-input"
              name="has_suggested_doctor"
              id="has_suggested_doctor_2"
              type="radio"
              checked={data.has_suggested_doctor == 1}
              onChange={() => {
                dispatch(
                  setDraftProperty({ key: "has_suggested_doctor", value: 1 }),
                );
                dispatch(
                  setDraftProperty({
                    key: "hasOtherSystinonIatroBool",
                    value: false,
                  }),
                );
              }}
            />
            <label
              className="form-check-label"
              htmlFor="has_suggested_doctor_2"
            >
              Ο ίδιος
            </label>
          </div>
        </fieldset>

        {isExistingCustomer ? (
          <>
            <div className="form-check form-switch switch-lg mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="propose_other_suggested_doctor"
                checked={proposeOtherSuggestedDoctor}
                onChange={(e) => {
                  dispatch(
                    setDraftProperty({
                      key: "propose_other_suggested_doctor",
                      value: e.target.checked ? 1 : 0,
                    }),
                  );
                  if (e.target.checked) {
                    const snapshot = captureSuggestedDoctorSnapshot(data);
                    suggestedDoctorBeforeChangeRef.current = snapshot;
                    setOtherSuggestedDoctorWasActive(snapshot != null);
                    clearOtherSuggestedDoctorFields(dispatch);
                  } else {
                    clearOtherSuggestedDoctorFields(dispatch);
                    const snapshot = suggestedDoctorBeforeChangeRef.current;
                    if (snapshot) {
                      restoreSuggestedDoctorSnapshot(dispatch, snapshot);
                      suggestedDoctorBeforeChangeRef.current = null;
                    }
                    setOtherSuggestedDoctorWasActive(false);
                  }
                }}
              />
              <label
                className="form-check-label"
                htmlFor="propose_other_suggested_doctor"
              >
                Αλλαγή συστήνοντος ιατρού
              </label>
            </div>

            {proposeOtherSuggestedDoctor ? (
              <>
                <div className="d-flex align-items-center border-bottom mb-3 gap-3 pb-3">
                  <label className="form-label fw-semibold mb-0 flex-shrink-0">
                    Συστήνων ιατρός
                  </label>
                  <div
                    className="input-group flex-grow-1"
                    style={{ minWidth: 0 }}
                  >
                    <input
                      type="text"
                      readOnly
                      className="form-control"
                      placeholder="Αναζήτηση..."
                      onClick={openChangeSuggestedDoctorLookup}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openChangeSuggestedDoctorLookup();
                        }
                      }}
                      aria-label="Αναζήτηση συστήνοντος ιατρού για αλλαγή"
                      style={{ cursor: "pointer" }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={openChangeSuggestedDoctorLookup}
                      aria-label="Αναζήτηση"
                    >
                      <i className="bi bi-search" />
                    </button>
                  </div>
                </div>

                <DoctorLookupModal
                  show={showChangeSuggestedLookup}
                  isOtherSuggested
                  onClose={() => setShowChangeSuggestedLookup(false)}
                />

                <div className="mb-2 p-2">
                  <div className="row g-2">
                    <div className="col-12">
                      <OrderField label="Ονοματεπώνυμο">
                        <input
                          className="form-control"
                          name="otherDoctorSuggested_name"
                          value={data.otherDoctorSuggested_name ?? ""}
                          onChange={(e) =>
                            dispatch(
                              setDraftProperty({
                                key: "otherDoctorSuggested_name",
                                value: e.target.value,
                              }),
                            )
                          }
                        />
                      </OrderField>
                    </div>
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <OrderField label="ΑΜΚΑ">
                        <input
                          className="form-control"
                          name="otherDoctorSuggested_amka"
                          inputMode="numeric"
                          value={data.otherDoctorSuggested_amka ?? ""}
                          onChange={(e) =>
                            dispatch(
                              setDraftProperty({
                                key: "otherDoctorSuggested_amka",
                                value: e.target.value,
                              }),
                            )
                          }
                        />
                      </OrderField>
                    </div>
                    <div className="col-6">
                      <OrderField label="ΑΦΜ">
                        <input
                          className="form-control"
                          name="otherDoctorSuggested_afm"
                          inputMode="numeric"
                          value={data.otherDoctorSuggested_afm ?? ""}
                          onChange={(e) =>
                            dispatch(
                              setDraftProperty({
                                key: "otherDoctorSuggested_afm",
                                value: e.target.value,
                              }),
                            )
                          }
                        />
                      </OrderField>
                    </div>
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <OrderField label="Κινητό">
                        <input
                          className="form-control"
                          name="otherDoctorSuggested_mobile"
                          inputMode="tel"
                          value={data.otherDoctorSuggested_mobile ?? ""}
                          onChange={(e) =>
                            dispatch(
                              setDraftProperty({
                                key: "otherDoctorSuggested_mobile",
                                value: e.target.value,
                              }),
                            )
                          }
                        />
                      </OrderField>
                    </div>
                    <div className="col-6">
                      <OrderField label="Δομή">
                        <input
                          className="form-control"
                          name="otherDoctorSuggested_domi"
                          value={data.otherDoctorSuggested_domi ?? ""}
                          onChange={(e) =>
                            dispatch(
                              setDraftProperty({
                                key: "otherDoctorSuggested_domi",
                                value: e.target.value,
                              }),
                            )
                          }
                        />
                      </OrderField>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </>
        ) : null}

        <fieldset disabled={disableFieldsBelowTypos}>
          <div className="form-check form-switch switch-lg mb-2">
            <input
              className="form-check-input"
              name="has_suggested_doctor"
              id="has_suggested_doctor_3"
              type="radio"
              checked={
                data.has_suggested_doctor == 2 &&
                !disableOtherSuggestedDoctorRadio
              }
              disabled={disableOtherSuggestedDoctorRadio}
              onChange={() => {
                setOtherSuggestedDoctorWasActive(false);
                suggestedDoctorBeforeChangeRef.current = null;
                dispatch(
                  setDraftProperty({ key: "has_suggested_doctor", value: 2 }),
                );
                dispatch(
                  setDraftProperty({
                    key: "hasOtherSystinonIatroBool",
                    value: true,
                  }),
                );
                dispatch(
                  setDraftProperty({
                    key: "propose_other_suggested_doctor",
                    value: 0,
                  }),
                );
                clearOtherSuggestedDoctorFields(dispatch);
              }}
            />
            <label
              className="form-check-label"
              htmlFor="has_suggested_doctor_3"
            >
              Άλλος συστήνων ιατρός
            </label>
          </div>

          {showOtherSuggestedDoctorFields && (
            <>
              <div className="d-flex align-items-center border-bottom mb-3 gap-3 pb-3">
                <label className="form-label fw-semibold mb-0 flex-shrink-0">
                  Συστήνων ιατρός
                </label>
                <div
                  className="input-group flex-grow-1"
                  style={{ minWidth: 0 }}
                >
                  <input
                    type="text"
                    readOnly
                    className="form-control"
                    placeholder="Αναζήτηση..."
                    onClick={openSuggestedDoctorLookup}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openSuggestedDoctorLookup();
                      }
                    }}
                    aria-label="Αναζήτηση συστήνοντος ιατρού"
                    style={{ cursor: "pointer" }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openSuggestedDoctorLookup}
                    aria-label="Αναζήτηση"
                  >
                    <i className="bi bi-search" />
                  </button>
                </div>
              </div>

              <DoctorLookupModal
                show={showSuggestedLookup}
                isSuggested
                onClose={() => setShowSuggestedLookup(false)}
              />
              <OrderField label="Ονοματεπώνυμο">
                <input
                  className="form-control"
                  name="doctorSuggested_name"
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
              </OrderField>
              <div className="row g-2">
                <div className="col-6">
                  <OrderField label="ΑΜΚΑ">
                    <input
                      className="form-control"
                      name="doctorSuggested_amka"
                      inputMode="numeric"
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
                  </OrderField>
                </div>
                <div className="col-6">
                  <OrderField label="ΑΦΜ">
                    <input
                      className="form-control"
                      name="doctorSuggested_afm"
                      inputMode="numeric"
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
                  </OrderField>
                </div>
              </div>
              <div className="row g-2">
                <div className="col-6">
                  <OrderField label="Κινητό">
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
                  </OrderField>
                </div>
                <div className="col-6">
                  <OrderField label="Δομή">
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
                  </OrderField>
                </div>
              </div>
            </>
          )}
        </fieldset>
      </FormErrorsContext.Provider>
    </div>
  );
}
