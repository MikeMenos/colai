import { setDraftProperty } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import FormErrorsContext from "@/components/ui/FormErrorContect";
import { Order } from "@/types/orders";
import React from "react";
import { FormSelect } from "react-bootstrap";
import BarcodeField from "./BarcodeField";
import type { SyntagiAreaProps } from "./componentProps";

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

const SyntagiArea = ({ errors, clearError }: SyntagiAreaProps) => {
  const data = useAppSelector((s) => s.orders.draft.order);
  const dispatch = useAppDispatch();
  const eidiEgrisis =
    useAppSelector((s) => s.staticData.list_Order_EidosEgkrisis) ?? [];
  const katigoriesParoxis =
    useAppSelector((s) => s?.orders?.draft?.list_KatigoriesParoxis) ?? [];

  const handleDateInput = (key: keyof Order, value: string) => {
    if (value.length == 1 && parseInt(value) > 3) return;
    if (value.length == 2 && parseInt(value) > 31) return;

    if (value.length == 5 && parseInt(value.substring(3, 5)) > 12) return;

    if (value.length === 2 || value.length === 5) {
      if (
        data[key] &&
        typeof data[key] === "string" &&
        data[key].length < value.length
      ) {
        value += "/";
      }
    }

    if (value.length === 4) {
      if (
        data[key] &&
        typeof data[key] === "string" &&
        data[key].length < value.length &&
        parseInt(value.substring(3, 4)) > 1
      ) {
        value = value.substring(0, 2) + "/0" + value.substring(3, 4) + "/";
      }
    }
    dispatch(setDraftProperty({ key, value: value }));
  };

  return (
    <div className="app-card px-3 py-2">
      <FormErrorsContext.Provider value={{ errors: errors ?? {}, clearError }}>
        <div
          style={{ height: 51 }}
          className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2"
        >
          <div className="fw-semibold">Συνταγή - Περιστατικό</div>
        </div>

        <BarcodeField
          label="Barcode"
          value={data.barcode ?? ""}
          onChange={(v) =>
            dispatch(setDraftProperty({ key: "barcode", value: v }))
          }
          name="barcode"
        />
        <div className="row g-2">
          <div className="col-6">
            <Field label="Ημ/νία συνταγης">
              <input
                className="form-control"
                inputMode="numeric"
                name="dateOfSyntagi"
                value={data.dateOfSyntagi ?? ""}
                onChange={(e) =>
                  handleDateInput("dateOfSyntagi", e.target.value)
                }
              />
            </Field>
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <Field label="Ισχύς από">
              <input
                className="form-control"
                inputMode="numeric"
                name="dateIsxyeiApo"
                value={data.dateIsxyeiApo ?? ""}
                onChange={(e) =>
                  handleDateInput("dateIsxyeiApo", e.target.value)
                }
              />
            </Field>
          </div>
          <div className="col-6">
            <Field label="Έως">
              <input
                className="form-control"
                inputMode="numeric"
                name="dateIsxyeiEos"
                value={data.dateIsxyeiEos ?? ""}
                onChange={(e) =>
                  handleDateInput("dateIsxyeiEos", e.target.value)
                }
              />
            </Field>
          </div>
        </div>

        <Field label="Κατηγορία παροχής">
          <FormSelect
            name="katigoriaParoxis"
            value={data.katigoriaParoxis ?? ""}
            onChange={(e) => {
              const selected = e.target.selectedOptions[0];

              const value = e.target.value || "";
              const plafonAmount = selected.dataset.attributePlafon;
              const plafonGiftAmount = selected.dataset.attributeGift;

              dispatch(setDraftProperty({ key: "katigoriaParoxis", value }));
              dispatch(
                setDraftProperty({
                  key: "maxPosoKostousGiaSymmetoxi",
                  value: plafonAmount ? Number(plafonAmount) : null,
                }),
              );
              dispatch(
                setDraftProperty({
                  key: "plafonGiftAmount",
                  value: plafonGiftAmount ? Number(plafonGiftAmount) : null,
                }),
              );
            }}
          >
            <option value=""></option>
            {katigoriesParoxis.map((x) => {
              return (
                <option
                  key={x.value}
                  value={x.value}
                  data-attribute-plafon={x.plafonAmount}
                  data-attribute-gift={x.plafonGiftAmount}
                >
                  {x.text}
                </option>
              );
            })}
          </FormSelect>
        </Field>

        <Field label="Είδος">
          <FormSelect
            name="eidos_Egkrisis"
            value={
              data.eidos_Egkrisis != null ? String(data.eidos_Egkrisis) : ""
            }
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "eidos_Egkrisis",
                  value: e.target.value,
                }),
              )
            }
          >
            <option value=""></option>
            {eidiEgrisis.map((x) => {
              return (
                <option key={x.value} value={x.value}>
                  {x.text}
                </option>
              );
            })}
          </FormSelect>
          {/* <input
                    className="form-control"
                    value={data.eidos_Egkrisis ?? ""}
                    onChange={(e) => dispatch(setDraftProperty({ key: "eidos_Egkrisis", value: e.target.value }))}
                /> */}
        </Field>
        <div className="row g-0">
          <div className="col-3">
            <Field label="Κωδ.">
              <input
                className="form-control"
                name="eoppy_Diagnosi_Code"
                style={{ borderRadius: "14px 0px 0px 14px" }}
                value={data.eoppy_Diagnosi_Code ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "eoppy_Diagnosi_Code",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </Field>
          </div>
          <div className="col-9">
            <Field label="Περιγραφή διάγνωσης">
              <input
                className="form-control"
                name="eoppy_Diagnosi_Name"
                style={{ borderRadius: "0px 14px 14px 0px" }}
                value={data.eoppy_Diagnosi_Name ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "eoppy_Diagnosi_Name",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </Field>
          </div>
        </div>
        <div className="row g-0">
          <div className="col-3">
            <Field label="Κωδ.">
              <input
                className="form-control"
                name="eoppy_Diagnosi2_Code"
                style={{ borderRadius: "14px 0px 0px 14px" }}
                value={data.eoppy_Diagnosi2_Code ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "eoppy_Diagnosi2_Code",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </Field>
          </div>
          <div className="col-9">
            <Field label="Περιγραφή διάγνωσης 2">
              <input
                className="form-control"
                name="eoppy_Diagnosi2_Name"
                style={{ borderRadius: "0px 14px 14px 0px" }}
                value={data.eoppy_Diagnosi2_Name ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "eoppy_Diagnosi2_Name",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </Field>
          </div>
        </div>
        {/* <div className="row g-2">
                <div className="col-6">
                    <Field label="Βάρος">
                        <input
                            className="form-control"
                            name="varos"
                            inputMode="numeric"
                            value={data.varos ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "varos", value: e.target.value }))}
                        />
                    </Field>
                </div>
                <div className="col-6">
                    <Field label='Ύψος'>
                        <input
                            className="form-control"
                            inputMode="numeric"
                            name="ipsos"
                            value={data.ipsos ?? ""}
                            onChange={(e) => dispatch(setDraftProperty({ key: "ipsos", value: e.target.value }))}
                        />
                    </Field>
                </div>
            </div> */}
      </FormErrorsContext.Provider>
    </div>
  );
};

export default SyntagiArea;
