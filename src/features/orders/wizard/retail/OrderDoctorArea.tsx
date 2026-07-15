import type {
  SuggestedDoctorSnapshot,
  OrderDoctorAreaProps,
} from "./OrderDoctorArea.types";
import OrderField from "@/components/ui/OrderField";
import FormErrorsContext from "@/components/ui/FormErrorContect";
import {
  isSuggestedDoctorChoiceLocked,
  shouldShowSuggestedDoctorChangeToggle,
} from "@/lib/customerUtils";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { AppDispatch } from "@/store/store";
import type { Order } from "@/types/orders";
import React from "react";
import DoctorLookupModal from "../modals/DoctorLookupModal";
import { isRetailCustomerWithoutPriceBadge } from "./retailCustomerBadge";

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
  const draftMeta = useAppSelector((s) => ({
    customerIsCompletelyNew: s.orders.draft.customerIsCompletelyNew,
    lastOrderInfoDateIn: s.orders.draft.lastOrderInfoDateIn,
    customerSelectedFromList: s.orders.draft.customerSelectedFromList,
  }));
  const hasPersonErpGID = !!String(data.person_ErpGID ?? "").trim();
  const disableWithoutSuggestedDoctorSwitch = hasPersonErpGID;
  const forceSuggestedDoctorForm =
    hasPersonErpGID &&
    isRetailCustomerWithoutPriceBadge(data, draftMeta.customerSelectedFromList);
  const disableSuggestedDoctorChoice = isSuggestedDoctorChoiceLocked(draftMeta);
  const showSuggestedDoctorChange = shouldShowSuggestedDoctorChangeToggle(
    draftMeta,
    data.customer_ErpGID,
  );
  const proposeOtherSuggestedDoctor = data.propose_other_suggested_doctor == 1;
  const showSuggestedDoctorFields =
    (forceSuggestedDoctorForm || data.has_suggested_doctor == 2) &&
    !proposeOtherSuggestedDoctor;
  const dispatch = useAppDispatch();
  const [showLookup, setShowLookup] = React.useState(false);
  const [showChangeSuggestedLookup, setShowChangeSuggestedLookup] =
    React.useState(false);
  const suggestedDoctorBeforeChangeRef =
    React.useRef<SuggestedDoctorSnapshot | null>(null);

  const openSuggestedDoctorLookup = () => setShowLookup(true);
  const openChangeSuggestedDoctorLookup = () =>
    setShowChangeSuggestedLookup(true);

  React.useEffect(() => {
    if (!forceSuggestedDoctorForm) return;
    if (data.has_suggested_doctor != 2) {
      dispatch(setDraftProperty({ key: "has_suggested_doctor", value: 2 }));
    }
    if (!data.hasOtherSystinonIatroBool) {
      dispatch(
        setDraftProperty({ key: "hasOtherSystinonIatroBool", value: true }),
      );
    }
  }, [
    data.has_suggested_doctor,
    data.hasOtherSystinonIatroBool,
    dispatch,
    forceSuggestedDoctorForm,
  ]);

  React.useEffect(() => {
    if (disableWithoutSuggestedDoctorSwitch) return;
    if (data.has_suggested_doctor != null) return;
    dispatch(setDraftProperty({ key: "has_suggested_doctor", value: 0 }));
    dispatch(
      setDraftProperty({ key: "hasOtherSystinonIatroBool", value: false }),
    );
  }, [
    data.has_suggested_doctor,
    disableWithoutSuggestedDoctorSwitch,
    dispatch,
  ]);

  React.useEffect(() => {
    if (showSuggestedDoctorChange || data.propose_other_suggested_doctor != 1) {
      return;
    }
    dispatch(
      setDraftProperty({ key: "propose_other_suggested_doctor", value: 0 }),
    );
    clearOtherSuggestedDoctorFields(dispatch);
  }, [
    data.propose_other_suggested_doctor,
    dispatch,
    showSuggestedDoctorChange,
  ]);

  return (
    <div className="app-card px-3 py-2">
      <FormErrorsContext.Provider value={{ errors: errors ?? {}, clearError }}>
        <div
          style={{ height: 51 }}
          className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2"
        >
          <div className="fw-semibold">Ιατρός</div>

          {showSuggestedDoctorFields &&
          !disableSuggestedDoctorChoice &&
          !forceSuggestedDoctorForm ? (
            <button
              type="button"
              className="btn-icon-pill"
              aria-label="Αναζήτηση"
              onClick={openSuggestedDoctorLookup}
            >
              <i className="bi bi-search" />
            </button>
          ) : null}
        </div>

        <DoctorLookupModal
          show={showLookup}
          isSuggested
          onClose={() => setShowLookup(false)}
        />

        {showSuggestedDoctorChange && !forceSuggestedDoctorForm ? (
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
                    suggestedDoctorBeforeChangeRef.current =
                      captureSuggestedDoctorSnapshot(data);
                    clearOtherSuggestedDoctorFields(dispatch);
                  } else {
                    clearOtherSuggestedDoctorFields(dispatch);
                    const snapshot = suggestedDoctorBeforeChangeRef.current;
                    if (snapshot) {
                      restoreSuggestedDoctorSnapshot(dispatch, snapshot);
                      suggestedDoctorBeforeChangeRef.current = null;
                    }
                  }
                }}
              />
              <label
                className="form-check-label"
                htmlFor="propose_other_suggested_doctor"
              >
                Αλλαγή συστήνοντος ιατρού (μετά από έγκριση)
              </label>
            </div>

            {proposeOtherSuggestedDoctor ? (
              <>
                <div className="d-flex align-items-center border-bottom mb-2 gap-3 pb-2">
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

        <fieldset
          disabled={disableSuggestedDoctorChoice && !forceSuggestedDoctorForm}
        >
          <div className="form-check form-switch switch-lg mb-2">
            <input
              className="form-check-input"
              name="has_suggested_doctor"
              id="has_suggested_doctor_0"
              type="checkbox"
              checked={
                data.has_suggested_doctor == 0 && !proposeOtherSuggestedDoctor
              }
              disabled={
                disableWithoutSuggestedDoctorSwitch ||
                proposeOtherSuggestedDoctor
              }
              onChange={(e) => {
                dispatch(
                  setDraftProperty({
                    key: "has_suggested_doctor",
                    value: e.target.checked ? 0 : 2,
                  }),
                );
                dispatch(
                  setDraftProperty({
                    key: "hasOtherSystinonIatroBool",
                    value: !e.target.checked,
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

          {!forceSuggestedDoctorForm ? (
            <div className="form-check form-switch switch-lg mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={data.has_suggested_doctor == 2}
                disabled={proposeOtherSuggestedDoctor}
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
              <label
                className="form-check-label"
                htmlFor="has_suggested_doctor"
              >
                Έχω συστήνων ιατρό
              </label>
            </div>
          ) : null}

          {showSuggestedDoctorFields && (
            <>
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
              <OrderField label="ΑΜΚΑ Ιατρού">
                <input
                  className="form-control"
                  name="doctorSuggested_amka"
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

              <OrderField label="ΑΦΜ">
                <input
                  className="form-control"
                  name="doctorSuggested_afm"
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
              <div className="row g-2">
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
              </div>
            </>
          )}
        </fieldset>
      </FormErrorsContext.Provider>
    </div>
  );
}
