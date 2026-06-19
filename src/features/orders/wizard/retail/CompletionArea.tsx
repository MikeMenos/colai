import { setDraftProperty } from "@/store/orders/ordersSlice";
import { formatCurrencyGR } from "@/lib/utils/number";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import OrderField from "@/components/ui/OrderField";
import React from "react";
import { Alert, FormSelect } from "react-bootstrap";

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

export default function CompletionArea() {
  const data = useAppSelector((s) => s.orders.draft.order);
  const ylika = useAppSelector((s) => s.orders.draft.ylika);
  const dispatch = useAppDispatch();
  const submitState = useAppSelector((s) => s.orders.draft.submitState);

  React.useEffect(() => {
    if (!data.shipMethodId)
      dispatch(setDraftProperty({ key: "shipMethodId", value: 5 }));
    if (!data.isTempSave)
      dispatch(setDraftProperty({ key: "isTempSave", value: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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
                dispatch(
                  setDraftProperty({ key: "appliedPriceList", value: "eopyy" }),
                );
                const pricesEOPPY = ylika.reduce(
                  (acc, x) =>
                    acc +
                    ((Number(x.erp_EoppyPrice) || 0) * Number(x.qty) || 0),
                  0,
                );
                dispatch(
                  setDraftProperty({
                    key: "posoDiscounted",
                    value: formatCurrencyGR(pricesEOPPY),
                  }),
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
            onChange={(e) => {
              dispatch(
                setDraftProperty({
                  key: "payFullOrDiscount",
                  value: e.target.checked ? 2 : 1,
                }),
              );
              if (e.target.checked) {
                dispatch(
                  setDraftProperty({ key: "appliedPriceList", value: "eopyy" }),
                );
                const pricesEOPPY = ylika.reduce(
                  (acc, x) =>
                    acc +
                    ((Number(x.erp_EoppyPrice) || 0) * Number(x.qty) || 0),
                  0,
                );
                dispatch(
                  setDraftProperty({
                    key: "posoDiscounted",
                    value: formatCurrencyGR(pricesEOPPY),
                  }),
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
                    dispatch(
                      setDraftProperty({
                        key: "appliedPriceList",
                        value: e.target.value,
                      }),
                    );
                    if (e.target.value == "eopyy") {
                      const pricesEOPPY = ylika.reduce(
                        (acc, x) =>
                          acc +
                          ((Number(x.erp_EoppyPrice) || 0) * Number(x.qty) ||
                            0),
                        0,
                      );
                      dispatch(
                        setDraftProperty({
                          key: "posoDiscounted",
                          value: formatCurrencyGR(pricesEOPPY),
                        }),
                      );
                    } else {
                      const pricesRETAIL = ylika.reduce(
                        (acc, x) =>
                          acc +
                          ((Number(x.erp_Price) || 0) * Number(x.qty) || 0),
                        0,
                      );
                      dispatch(
                        setDraftProperty({
                          key: "posoDiscounted",
                          value: formatCurrencyGR(pricesRETAIL),
                        }),
                      );
                    }
                  }}
                >
                  <option value="retail">Λιανική</option>
                  <option value="eopyy">ΕΟΠΠΥ</option>
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

        <div className="form-check form-switch switch-lg mb-2">
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
        <OrderField label="Σχόλια παραγγελίας">
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
      </div>

      {submitState.error && (
        <Alert className="mt-3" variant="danger">
          {submitState.error}
        </Alert>
      )}
    </>
  );
}
