import { setDraftProperty } from "@/store/orders/ordersSlice";
import { formatCurrencyGR } from "@/lib/utils/number";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { FormSelect } from "react-bootstrap";
import { useEffect, useRef, useState } from "react";
import FormErrorsContext from "@/components/ui/FormErrorContect";
import OrderField from "@/components/ui/OrderField";
import OrderSwitchField from "@/components/ui/OrdeSwitchField";
import PrepaidOrderConfirmModal from "../modals/PrepaidOrderConfirmModal";
import type { SymmetoxiAreaProps } from "./componentProps";
import {
  isAllowedSymmPercentage,
  SYMM_PERCENTAGE_OPTIONS,
} from "./wizard/wizardUtils";

const SymmetoxiArea = ({ errors, clearError }: SymmetoxiAreaProps) => {
  const data = useAppSelector((s) => s.orders.draft.order);
  const dispatch = useAppDispatch();
  const discountReasons = useAppSelector(
    (s) => s.orders.draft.list_DiscountReasons,
  );

  const posoSymetoxis =
    (Number(data.kostos ?? 0) * Number(data.symmPercentage ?? 0)) / 100;
  const maxPosoKostousGiaSymmetoxi = data.maxPosoKostousGiaSymmetoxi ?? 0;
  const symmetoxiEoppy =
    data.kostos > maxPosoKostousGiaSymmetoxi
      ? (Number(data.maxPosoKostousGiaSymmetoxi ?? 0) *
          Number(data.symmPercentage ?? 0)) /
        100
      : posoSymetoxis;
  const ypervasiPlafon =
    (data.kostos ?? 0) - (data.maxPosoKostousGiaSymmetoxi ?? 0);
  const finalAmount = Number(
    String(data.posoDiscounted ?? 0)
      .replaceAll(".", "")
      .replaceAll(",", "."),
  );
  const isFinalAmountZero =
    data.payFullOrDiscount == 2 &&
    Number.isFinite(finalAmount) &&
    finalAmount === 0;

  const isDiscountMode = data.payFullOrDiscount == 2;
  const showParticipationFinalAmount =
    data.eidos_Egkrisis == 1 && !isDiscountMode;

  const prominentAmountInputClass =
    "form-control fw-bold text-end prominent-amount-input";

  const prominentAmountWrapStyle: React.CSSProperties = {
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(var(--bs-primary-rgb), .28)",
    background: "rgba(var(--bs-primary-rgb), .08)",
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const prominentAmountSuffixStyle: React.CSSProperties = {
    fontSize: "1.35rem",
    fontWeight: 700,
    flexShrink: 0,
    lineHeight: 1,
  };

  const prominentAmountInputStyle: React.CSSProperties = {
    fontSize: "1.35rem",
    letterSpacing: 0.3,
    border: "none",
    background: "transparent",
    boxShadow: "none",
    padding: 0,
    flex: 1,
    minWidth: 0,
  };

  const prevPosoSymmetoxisRef = useRef<number | null>(null);
  const [showPrepaidConfirm, setShowPrepaidConfirm] = useState(false);

  const showIsPaidToggle =
    isAllowedSymmPercentage(data.symmPercentage) && data.symmPercentage !== 0;

  useEffect(() => {
    if (data.payFullOrDiscount !== 2) {
      return;
    }

    const currentPosoSymmetoxis = Number(data.posoSymmetoxis ?? 0);
    if (prevPosoSymmetoxisRef.current === currentPosoSymmetoxis) {
      return;
    }

    const hadPrevious = prevPosoSymmetoxisRef.current !== null;
    prevPosoSymmetoxisRef.current = currentPosoSymmetoxis;

    if (!hadPrevious) {
      return;
    }

    dispatch(
      setDraftProperty({
        key: "posoDiscounted",
        value: formatCurrencyGR(currentPosoSymmetoxis),
      }),
    );
  }, [data.payFullOrDiscount, data.posoSymmetoxis, dispatch]);

  useEffect(() => {
    if (data.payFullOrDiscount !== 2) {
      prevPosoSymmetoxisRef.current = null;
    }
  }, [data.payFullOrDiscount]);

  useEffect(() => {
    if (data.eopyyVerifyNoParticipation == 1) {
      if (data.hasConfirmedMidenikiPliromi !== true) {
        dispatch(
          setDraftProperty({
            key: "hasConfirmedMidenikiPliromi",
            value: true,
          }),
        );
      }
      return;
    }

    if (!isFinalAmountZero && data.hasConfirmedMidenikiPliromi != null) {
      dispatch(
        setDraftProperty({
          key: "hasConfirmedMidenikiPliromi",
          value: null,
        }),
      );
    }
  }, [
    data.eopyyVerifyNoParticipation,
    data.hasConfirmedMidenikiPliromi,
    dispatch,
    isFinalAmountZero,
  ]);

  useEffect(() => {
    if (data.eopyyVerifyNoParticipation == 1) return;

    if (isFinalAmountZero && data.hasConfirmedMidenikiPliromi == null) {
      dispatch(
        setDraftProperty({
          key: "hasConfirmedMidenikiPliromi",
          value: false,
        }),
      );
    }
  }, [
    data.eopyyVerifyNoParticipation,
    data.hasConfirmedMidenikiPliromi,
    dispatch,
    isFinalAmountZero,
  ]);

  return (
    <>
    <div className="app-card px-3 py-2">
      <FormErrorsContext.Provider value={{ errors: errors ?? {}, clearError }}>
        <div
          style={{ height: 51 }}
          className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2"
        >
          <div className="fw-semibold">Συμμετοχή ασθενή</div>
        </div>

        <OrderField label="%">
          <FormSelect
            name="symmPercentage"
            value={
              isAllowedSymmPercentage(data.symmPercentage)
                ? String(data.symmPercentage)
                : ""
            }
            onChange={(e) => {
              const raw = e.target.value;

              if (raw === "") {
                dispatch(
                  setDraftProperty({ key: "symmPercentage", value: null }),
                );
                dispatch(setDraftProperty({ key: "isPaid", value: 0 }));
                setShowPrepaidConfirm(false);
                return;
              }

              const n = Number(raw);
              if (!isAllowedSymmPercentage(n)) return;

              dispatch(setDraftProperty({ key: "symmPercentage", value: n }));
              if (n === 0) {
                dispatch(setDraftProperty({ key: "isPaid", value: 0 }));
                setShowPrepaidConfirm(false);
              }
            }}
          >
            <option value="" />
            {SYMM_PERCENTAGE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </FormSelect>
        </OrderField>

        <div className="row g-2">
          <div className="col-6">
            <OrderField label="Αξία υλικών">
              <input
                className="form-control"
                name="kostos"
                inputMode="numeric"
                disabled
                readOnly
                value={formatCurrencyGR(data.kostos ?? "")}
              />
            </OrderField>
          </div>
          <div className="col-6">
            <OrderField label="Συμμετοχή ΕΟΠΥΥ">
              <input
                className="form-control"
                name="posoSymmetoxisOld"
                inputMode="numeric"
                disabled
                readOnly
                value={formatCurrencyGR(symmetoxiEoppy)}
              />
            </OrderField>
          </div>
        </div>

        {data.eidos_Egkrisis == 1 && (
          <>
            <div className="row g-2">
              <div className="col-6">
                <OrderField label="Πλαφόν">
                  <input
                    className="form-control"
                    name="maxPosoKostousGiaSymmetoxi"
                    inputMode="numeric"
                    disabled
                    readOnly
                    value={formatCurrencyGR(
                      data.maxPosoKostousGiaSymmetoxi ?? 0,
                    )}
                  />
                </OrderField>
              </div>

              <div className="col-6">
                <OrderField label="Υπέρβαση πλαφόν">
                  <input
                    className="form-control"
                    name="ypervasiPlafon"
                    inputMode="numeric"
                    disabled
                    readOnly
                    value={formatCurrencyGR(
                      ypervasiPlafon > 0 ? ypervasiPlafon : 0,
                    )}
                  />
                </OrderField>
              </div>
            </div>
            {showParticipationFinalAmount ? (
              <div className="col-12">
                <OrderField
                  label={
                    <span style={{ fontSize: "0.95rem", letterSpacing: 0.2 }}>
                      Τελικό ποσό πληρωμής
                    </span>
                  }
                >
                  <div style={prominentAmountWrapStyle}>
                    <input
                      className={prominentAmountInputClass}
                      style={prominentAmountInputStyle}
                      name="posoSymmetoxis"
                      inputMode="numeric"
                      disabled
                      readOnly
                      value={formatCurrencyGR(data.posoSymmetoxis ?? 0)}
                    />
                    <span style={prominentAmountSuffixStyle} aria-hidden>
                      €
                    </span>
                  </div>
                </OrderField>
              </div>
            ) : null}
          </>
        )}

        {data.posoSymmetoxis > 0 && (
          <>
            <div className="form-check form-switch switch-lg mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={data.payFullOrDiscount == 1}
                onChange={(e) => {
                  dispatch(
                    setDraftProperty({
                      key: "payFullOrDiscount",
                      value: e.target.checked ? 1 : 2,
                    }),
                  );
                  if (!e.target.checked) {
                    dispatch(
                      setDraftProperty({
                        key: "discount_reason_id",
                        value: discountReasons?.[0]?.value,
                      }),
                    );
                    dispatch(
                      setDraftProperty({
                        key: "posoDiscounted",
                        value: formatCurrencyGR(data.posoSymmetoxis ?? 0),
                      }),
                    );
                  } else {
                    dispatch(
                      setDraftProperty({
                        key: "discount_reason_id",
                        value: null,
                      }),
                    );
                    dispatch(
                      setDraftProperty({ key: "posoDiscounted", value: null }),
                    );
                    dispatch(
                      setDraftProperty({
                        key: "hasConfirmedMidenikiPliromi",
                        value: null,
                      }),
                    );
                  }
                }}
                id="payFullOrDiscount"
              />
              <label className="form-check-label" htmlFor="payFullOrDiscount">
                Επιβεβαίωση συνολικού ποσού
              </label>
            </div>
            <div className="form-check form-switch switch-lg mb-2">
              <input
                className="form-check-input"
                type="checkbox"
                checked={data.payFullOrDiscount == 2}
                onChange={(e) => {
                  dispatch(
                    setDraftProperty({
                      key: "payFullOrDiscount",
                      value: e.target.checked ? 2 : 1,
                    }),
                  );
                  if (e.target.checked) {
                    dispatch(
                      setDraftProperty({
                        key: "discount_reason_id",
                        value: discountReasons?.[0]?.value,
                      }),
                    );
                    dispatch(
                      setDraftProperty({
                        key: "posoDiscounted",
                        value: formatCurrencyGR(data.posoSymmetoxis ?? 0),
                      }),
                    );
                  } else {
                    dispatch(
                      setDraftProperty({
                        key: "discount_reason_id",
                        value: null,
                      }),
                    );
                    dispatch(
                      setDraftProperty({ key: "posoDiscounted", value: null }),
                    );
                    dispatch(
                      setDraftProperty({
                        key: "hasConfirmedMidenikiPliromi",
                        value: null,
                      }),
                    );
                  }
                }}
                id="payFullOrDiscount"
              />
              <label className="form-check-label" htmlFor="payFullOrDiscount">
                Εφαρμογή έκπτωσης
              </label>
            </div>
            {showIsPaidToggle ? (
              <OrderSwitchField
                name="isPaid"
                id="isPaid"
                label="Προπληρωμένο"
                checked={data.isPaid == 1}
                onChange={(checked) => {
                  if (checked) {
                    setShowPrepaidConfirm(true);
                    return;
                  }

                  dispatch(
                    setDraftProperty({
                      key: "isPaid",
                      value: 0,
                    }),
                  );
                }}
              />
            ) : null}
          </>
        )}
        {!(data.posoSymmetoxis > 0) && (
          <OrderSwitchField
            name="eopyyVerifyNoParticipation"
            id="eopyyVerifyNoParticipation"
            label="Επιβεβαίωση μηδενικής πληρωμής"
            checked={data.eopyyVerifyNoParticipation == 1}
            onChange={(checked) => {
              dispatch(
                setDraftProperty({
                  key: "eopyyVerifyNoParticipation",
                  value: checked ? 1 : 0,
                }),
              );
              dispatch(
                setDraftProperty({
                  key: "hasConfirmedMidenikiPliromi",
                  value: checked ? true : null,
                }),
              );
              !data.eidos_Egkrisis &&
                dispatch(setDraftProperty({ key: "eidos_Egkrisis", value: 1 }));
            }}
          />
        )}
        {data.payFullOrDiscount == 2 && (
          <>
            <div className="app-divider my-2" />
            <OrderField label="Λόγος έκπτωσης">
              <FormSelect
                name=""
                value={data.discount_reason_id}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "discount_reason_id",
                      value: e.target.value,
                    }),
                  )
                }
              >
                {discountReasons.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.text}
                  </option>
                ))}
              </FormSelect>
            </OrderField>
            <OrderField
              label={
                <span style={{ fontSize: "0.95rem", letterSpacing: 0.2 }}>
                  Τελικό ποσό πληρωμής
                </span>
              }
            >
              <div style={prominentAmountWrapStyle}>
                <input
                  className={prominentAmountInputClass}
                  style={prominentAmountInputStyle}
                  name="posoDiscounted"
                  inputMode="decimal"
                  value={data.posoDiscounted ?? 0}
                  onChange={(e) => {
                    const raw = e.target.value
                      .replaceAll("€", "")
                      .trim()
                      .replaceAll(".", "")
                      .replaceAll(",", ".");
                    const maxAllowed = data.posoSymmetoxis ?? 0;

                    if (raw === "") {
                      dispatch(
                        setDraftProperty({
                          key: "posoDiscounted",
                          value: null,
                        }),
                      );
                      return;
                    }

                    if (parseFloat(raw) <= maxAllowed) {
                      dispatch(
                        setDraftProperty({
                          key: "posoDiscounted",
                          value: raw.replace(".", ","),
                        }),
                      );
                    }
                  }}
                  onBlur={(e) => {
                    dispatch(
                      setDraftProperty({
                        key: "posoDiscounted",
                        value: formatCurrencyGR(
                          e.target.value
                            .replaceAll("€", "")
                            .trim()
                            .replaceAll(".", "")
                            .replaceAll(",", "."),
                        ),
                      }),
                    );
                  }}
                />
                <span style={prominentAmountSuffixStyle} aria-hidden>
                  €
                </span>
              </div>
            </OrderField>
            {isFinalAmountZero && (
              <OrderSwitchField
                name="hasConfirmedMidenikiPliromi"
                id="hasConfirmedMidenikiPliromi"
                label="Επιβεβαίωση μηδενικής πληρωμής"
                checked={Boolean(data.hasConfirmedMidenikiPliromi)}
                onChange={(checked) => {
                  dispatch(
                    setDraftProperty({
                      key: "hasConfirmedMidenikiPliromi",
                      value: checked,
                    }),
                  );
                }}
              />
            )}
          </>
        )}
      </FormErrorsContext.Provider>
    </div>

    <PrepaidOrderConfirmModal
      show={showPrepaidConfirm && showIsPaidToggle}
      onCancel={() => setShowPrepaidConfirm(false)}
      onConfirm={() => {
        setShowPrepaidConfirm(false);
        dispatch(setDraftProperty({ key: "isPaid", value: 1 }));
      }}
    />
    </>
  );
};

export default SymmetoxiArea;
