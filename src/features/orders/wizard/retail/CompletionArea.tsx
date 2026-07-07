import { setDraftProperty } from "@/store/orders/ordersSlice";
import { formatCurrencyGR } from "@/lib/utils/number";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/utils/paymentMethod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import FormErrorsContext from "@/components/ui/FormErrorContect";
import OrderField from "@/components/ui/OrderField";
import React from "react";
import { Alert, FormSelect } from "react-bootstrap";

type AppliedPriceList = "retail" | "eopyy" | "typet";

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

function getDefaultAppliedPriceList(value: unknown): AppliedPriceList {
  if (value === "ΕΟΠΥΥ") return "eopyy";
  if (value === "ΤΥΠΕΤ") return "typet";
  return "retail";
}

export default function CompletionArea({
  errors = {},
  clearError,
}: {
  errors?: Record<string, string | boolean>;
  clearError?: (field: string) => void;
}) {
  const data = useAppSelector((s) => s.orders.draft.order);
  const ylika = useAppSelector((s) => s.orders.draft.ylika);
  const dispatch = useAppDispatch();
  const submitState = useAppSelector((s) => s.orders.draft.submitState);
  const discountChangeAllowed = Number(data.ischangeable) !== 0;

  const calculatePriceListTotal = React.useCallback(
    (priceList: AppliedPriceList) =>
      ylika.reduce((acc, x) => {
        const price =
          priceList === "eopyy"
            ? x.erp_EoppyPrice
            : priceList === "typet"
              ? x.erp_TypetPrice
              : x.erp_Price;
        return acc + ((Number(price) || 0) * Number(x.qty) || 0);
      }, 0),
    [ylika],
  );

  const applyDiscountPriceList = React.useCallback(
    (priceList: AppliedPriceList) => {
      dispatch(setDraftProperty({ key: "appliedPriceList", value: priceList }));
      dispatch(
        setDraftProperty({
          key: "posoDiscounted",
          value: formatCurrencyGR(calculatePriceListTotal(priceList)),
        }),
      );
    },
    [calculatePriceListTotal, dispatch],
  );

  React.useEffect(() => {
    if (!data.shipMethodId)
      dispatch(setDraftProperty({ key: "shipMethodId", value: 5 }));
    if (!data.isTempSave)
      dispatch(setDraftProperty({ key: "isTempSave", value: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (discountChangeAllowed) return;

    if (data.payFullOrDiscount != 1) {
      dispatch(setDraftProperty({ key: "payFullOrDiscount", value: 1 }));
    }
    if (data.appliedPriceList != null) {
      dispatch(setDraftProperty({ key: "appliedPriceList", value: null }));
    }
    if (data.posoDiscounted != null) {
      dispatch(setDraftProperty({ key: "posoDiscounted", value: null }));
    }
  }, [
    data.appliedPriceList,
    data.payFullOrDiscount,
    data.posoDiscounted,
    discountChangeAllowed,
    dispatch,
  ]);

  return (
    <FormErrorsContext.Provider value={{ errors, clearError }}>
      <>
        <div className="app-card px-3 py-2">
          <div className="form-check form-switch switch-lg mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              checked={data.isTempSave == 1}
              onChange={(e) =>
                dispatch(
                  setDraftProperty({
                    key: "isTempSave",
                    value: e.target.checked ? 1 : 0,
                  }),
                )
              }
              id="isTempSave"
            />
            <label className="form-check-label" htmlFor="isTempSave">
              Προσωρινή αποθήκευση
            </label>
          </div>
        </div>

        <div className="app-card px-3 py-2">
          <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
            <div className="fw-semibold">Touchdown</div>
          </div>

          <div className="row g-2">
            <div className="col-6">
              <Field label="Αξία Υλικών">
                <input
                  className="form-control"
                  value={formatCurrencyGR(data.kostos)}
                  disabled
                />
              </Field>
            </div>
          </div>

          <div className="app-divider my-2" />

          <div className="form-check form-switch switch-lg mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={data.payFullOrDiscount == 1}
              disabled={!discountChangeAllowed}
              onChange={(e) => {
                dispatch(
                  setDraftProperty({
                    key: "payFullOrDiscount",
                    value: e.target.checked ? 1 : 2,
                  }),
                );
                if (e.target.checked) {
                  dispatch(
                    setDraftProperty({ key: "appliedPriceList", value: null }),
                  );
                  dispatch(
                    setDraftProperty({ key: "posoDiscounted", value: null }),
                  );
                } else {
                  applyDiscountPriceList(
                    getDefaultAppliedPriceList(data.prE_LOADED_PRICE),
                  );
                }
              }}
              id="payFullOrDiscount"
            />
            <label className="form-check-label" htmlFor="payFullOrDiscount">
              Πληρωμή όλου του ποσού
            </label>
          </div>

          <div className="form-check form-switch switch-lg mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={data.payFullOrDiscount == 2}
              disabled={!discountChangeAllowed}
              onChange={(e) => {
                dispatch(
                  setDraftProperty({
                    key: "payFullOrDiscount",
                    value: e.target.checked ? 2 : 1,
                  }),
                );
                if (e.target.checked) {
                  applyDiscountPriceList(
                    getDefaultAppliedPriceList(data.prE_LOADED_PRICE),
                  );
                } else {
                  dispatch(
                    setDraftProperty({ key: "appliedPriceList", value: null }),
                  );
                  dispatch(
                    setDraftProperty({ key: "posoDiscounted", value: null }),
                  );
                }
              }}
              id="payFullOrDiscount"
            />
            <label className="form-check-label" htmlFor="payFullOrDiscount">
              Εφαρμογή έκπτωσης
            </label>
          </div>

          {data.payFullOrDiscount == 2 && (
            <div className="row g-2">
              <div className="col-6">
                <Field label="Εφαρμογή">
                  <FormSelect
                    name="appliedPriceList"
                    value={data.appliedPriceList}
                    onChange={(e) => {
                      applyDiscountPriceList(
                        e.target.value as AppliedPriceList,
                      );
                    }}
                  >
                    <option value="retail">Λιανική</option>
                    <option value="eopyy">ΕΟΠΥΥ</option>
                    <option value="typet">ΤΥΠΕΤ</option>
                  </FormSelect>
                </Field>
              </div>
              <div className="col-6">
                <Field label="Τελικό ποσό">
                  <input
                    className="form-control"
                    name="posoDiscounted"
                    value={data.posoDiscounted ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value
                        .replaceAll(".", "")
                        .replaceAll(",", ".");
                      dispatch(
                        setDraftProperty({
                          key: "posoDiscounted",
                          value: raw.replace(".", ","),
                        }),
                      );
                    }}
                    onBlur={(e) => {
                      dispatch(
                        setDraftProperty({
                          key: "posoDiscounted",
                          value: formatCurrencyGR(
                            e.target.value
                              .replaceAll(".", "")
                              .replaceAll(",", "."),
                          ),
                        }),
                      );
                    }}
                  />
                </Field>
              </div>
            </div>
          )}

          <OrderField label="Τρόπος πληρωμής">
            <FormSelect
              name="isPaid"
              value={
                data.isPaid === 0 || data.isPaid === 1
                  ? String(data.isPaid)
                  : ""
              }
              onChange={(e) => {
                const raw = e.target.value;
                dispatch(
                  setDraftProperty({
                    key: "isPaid",
                    value: raw === "" ? null : Number(raw),
                  }),
                );
              }}
            >
              <option value="">Επιλέξτε...</option>
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </FormSelect>
          </OrderField>
        </div>

        <div className="app-card px-3 py-2">
          <OrderField label="Σχόλια για το τμήμα παραγγελιών">
            <textarea
              className="form-control"
              name="sellerComments"
              rows={2}
              value={data.sellerComments ?? ""}
              onChange={(e) =>
                dispatch(
                  setDraftProperty({
                    key: "sellerComments",
                    value: e.target.value,
                  }),
                )
              }
            />
          </OrderField>
          {String(data.definitioN_PRICE ?? "").trim() ? (
            <div className="alert alert-info small mb-0 py-2">
              <i className="bi bi-info-circle me-2" aria-hidden />
              {data.definitioN_PRICE}
            </div>
          ) : null}
        </div>

        {submitState.error && (
          <Alert className="mt-3" variant="danger">
            {submitState.error}
          </Alert>
        )}
      </>
    </FormErrorsContext.Provider>
  );
}
