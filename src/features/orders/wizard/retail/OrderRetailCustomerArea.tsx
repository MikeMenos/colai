import {
  loadCustomerAddressesAsync,
  setDraftProperty,
} from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import CustomerLookupModal from "../modals/CustomerLookupModal";
import React from "react";
import { FormSelect } from "react-bootstrap";
import FormErrorsContext from "@/components/ui/FormErrorContect";
import OrderField from "@/components/ui/OrderField";
import { getAmkaInlineFieldError } from "@/lib/utils/amka";

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

export default function OrderRetailCustomerArea() {
  const data = useAppSelector((s) => s.orders.draft.order);
  const dispatch = useAppDispatch();
  const [showLookup, setShowLookup] = React.useState(false);
  const listTropoiApostolis = useAppSelector(
    (s) => s.orders.draft.list_TroposApostolis,
  );
  const listAddressesPersons = useAppSelector(
    (s) => s.orders.draft.list_AddressesPersons,
  );

  const selectedPersonAddresses = React.useMemo(() => {
    const row = listAddressesPersons.find(
      (p) => p.person_ErpGID == data.person_ErpGID,
    );
    return row?.addresses ?? [];
  }, [listAddressesPersons, data.person_ErpGID]);

  const amkaFieldErrors = React.useMemo((): Record<
    string,
    string | boolean
  > => {
    const message = getAmkaInlineFieldError(data.customer_amka);
    return message ? { customer_amka: message } : {};
  }, [data.customer_amka]);

  const handleDateInput = (value: string) => {
    if (value.length == 1 && parseInt(value) > 3) return;
    if (value.length == 2 && parseInt(value) > 31) return;

    if (value.length == 5 && parseInt(value.substring(3, 5)) > 12) return;

    if (value.length === 2 || value.length === 5) {
      if (data.customer_dob && data.customer_dob.length < value.length) {
        value += "/";
      }
    }

    if (value.length === 4) {
      if (
        data.customer_dob &&
        data.customer_dob.length < value.length &&
        parseInt(value.substring(3, 4)) > 1
      ) {
        value = value.substring(0, 2) + "/0" + value.substring(3, 4) + "/";
      }
    }
    dispatch(setDraftProperty({ key: "customer_dob", value: value }));
  };

  const handleSearchClick = () => {
    // open search modal / navigate to search page
    setShowLookup(true);
  };

  React.useEffect(() => {
    if (!data.shipMethodId)
      dispatch(setDraftProperty({ key: "shipMethodId", value: 5 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const gid = data.customer_ErpGID?.toString().trim();
    const amka = data.customer_amka?.trim();
    if (!gid || !amka || listAddressesPersons.length > 0) return;
    void dispatch(
      loadCustomerAddressesAsync({
        customer_ErpGID: data.customer_ErpGID,
        customer_amka: data.customer_amka ?? "",
        customer_name: data.customer_name ?? "",
        customer_address: data.customer_address ?? "",
      }),
    );
  }, [
    dispatch,
    data.customer_ErpGID,
    data.customer_amka,
    data.customer_name,
    data.customer_address,
    listAddressesPersons.length,
  ]);

  return (
    <FormErrorsContext.Provider value={{ errors: amkaFieldErrors }}>
      <div className="app-card px-3 py-2">
        <div className="d-flex align-items-center border-bottom mb-3 gap-5 pb-3">
          <label className="form-label fw-semibold mb-0 flex-shrink-0">
            Ασθενής
          </label>
          <div className="input-group flex-grow-1" style={{ minWidth: 0 }}>
            <input
              type="text"
              readOnly
              className="form-control"
              placeholder="Αναζήτηση..."
              onClick={handleSearchClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSearchClick();
                }
              }}
              aria-label="Αναζήτηση ασθενή"
              style={{ cursor: "pointer" }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSearchClick}
              aria-label="Αναζήτηση"
            >
              <i className="bi bi-search" />
            </button>
          </div>
        </div>

        <CustomerLookupModal
          show={showLookup}
          onClose={() => setShowLookup(false)}
        />

        <Field label="Ονοματεπώνυμο">
          <input
            className="form-control"
            name="customer_name"
            value={data.customer_name ?? ""}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "customer_name",
                  value: e.target.value,
                }),
              )
            }
          />
        </Field>

        <div className="row g-2">
          <div className="col-6">
            <OrderField label="ΑΜΚΑ">
              <input
                className="form-control"
                name="customer_amka"
                inputMode="numeric"
                value={data.customer_amka ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "customer_amka",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>
          <div className="col-6">
            <Field label="Ημ/νία γέννησης" hint="π.χ. 31/12/1990">
              <input
                className="form-control"
                name="customer_dob"
                inputMode="numeric"
                value={data.customer_dob ?? ""}
                onChange={(e) => handleDateInput(e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <Field label="Τηλέφωνο">
              <input
                className="form-control"
                name="customer_tel"
                inputMode="tel"
                value={data.customer_tel ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "customer_tel",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </Field>
          </div>
          <div className="col-6">
            <Field label="Email">
              <input
                className="form-control"
                name="customer_email"
                inputMode="email"
                value={data.customer_email ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "customer_email",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </Field>
          </div>
        </div>

        <Field label="Διεύθυνση">
          <input
            className="form-control"
            name="customer_address"
            value={data.customer_address ?? ""}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "customer_address",
                  value: e.target.value,
                }),
              )
            }
          />
        </Field>

        <div className="row g-2">
          <div className="col-6">
            <Field label="Πόλη">
              <input
                className="form-control"
                name="customer_city"
                value={data.customer_city ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "customer_city",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </Field>
          </div>
          <div className="col-6">
            <Field label="ΤΚ">
              <input
                className="form-control"
                name="customer_tk"
                inputMode="numeric"
                value={data.customer_tk ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "customer_tk",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </Field>
          </div>
        </div>

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

        <hr className="app-divider my-2" />

        <Field label="Αποστολή">
          <FormSelect
            name="shipMethodId"
            value={data.shipMethodId ?? ""}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "shipMethodId",
                  value: e.target.value,
                }),
              )
            }
          >
            {listTropoiApostolis.map((x) => (
              <option key={x.value} value={x.value}>
                {x.text}
              </option>
            ))}
          </FormSelect>
        </Field>

        <div className="form-check form-switch switch-lg mb-2">
          <input
            className="form-check-input"
            name="deliverySunday"
            type="checkbox"
            checked={data.deliverySunday == 1}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "deliverySunday",
                  value: e.target.checked ? 1 : 0,
                }),
              )
            }
            id="deliverySunday"
          />
          <label className="form-check-label" htmlFor="deliverySunday">
            Παράδοση Σάββατο
          </label>
        </div>

        <div className="form-check form-switch switch-lg mb-2">
          <input
            className="form-check-input"
            name="deliveryMorning"
            type="checkbox"
            checked={data.deliveryMorning == 1}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "deliveryMorning",
                  value: e.target.checked ? 1 : 0,
                }),
              )
            }
            id="deliveryMorning"
          />
          <label className="form-check-label" htmlFor="deliveryMorning">
            Πρωινή παράδοση
          </label>
        </div>

        {!data.shipToOtherAddressBool && listAddressesPersons.length > 0 && (
          <Field label="Θα παραδοθεί σε">
            <FormSelect
              name="person_ErpGID"
              value={data.person_ErpGID ?? ""}
              onChange={(e) => {
                dispatch(
                  setDraftProperty({
                    key: "person_ErpGID",
                    value: e.target.value,
                  }),
                );
                if (data.shipTo_other_address != 1) {
                  dispatch(
                    setDraftProperty({
                      key: "address_ErpGID",
                      value:
                        listAddressesPersons.find(
                          (p) => p.person_ErpGID == e.target.value,
                        )?.addresses?.[0]?.address_ErpGID ?? null,
                    }),
                  );
                }
              }}
            >
              {listAddressesPersons.map((x) => (
                <option
                  key={x.person_ErpGID ?? ""}
                  value={x.person_ErpGID ?? ""}
                >
                  {x.personName}
                </option>
              ))}
            </FormSelect>
          </Field>
        )}

        {!data.shipToOtherAddressBool &&
          data.shipTo_other_address != 1 &&
          listAddressesPersons.length > 0 &&
          data.person_ErpGID &&
          data.person_ErpGID != "" &&
          selectedPersonAddresses.length > 0 && (
            <Field label="Αποθηκευμένη διεύθυνση">
              <FormSelect
                name="address_ErpGID"
                value={data.address_ErpGID ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "address_ErpGID",
                      value: e.target.value,
                    }),
                  )
                }
              >
                {selectedPersonAddresses.map((a) => (
                  <option
                    key={a.address_ErpGID}
                    value={a.address_ErpGID ?? ""}
                  >{`${a.address}, ${a.city}, ${a.tk}`}</option>
                ))}
              </FormSelect>
            </Field>
          )}

        <div className="form-check form-switch switch-lg mb-2">
          <input
            className="form-check-input"
            name="shipTo_other_address"
            type="checkbox"
            checked={data.shipTo_other_address == 1}
            onChange={(e) => {
              dispatch(
                setDraftProperty({
                  key: "shipTo_other_address",
                  value: e.target.checked ? 1 : 0,
                }),
              );
              dispatch(
                setDraftProperty({
                  key: "shipToOtherAddressBool",
                  value: e.target.checked,
                }),
              );
              if (e.target.checked) {
                dispatch(
                  setDraftProperty({ key: "address_ErpGID", value: null }),
                );
              } else if (data.person_ErpGID && data.person_ErpGID != "") {
                dispatch(
                  setDraftProperty({
                    key: "address_ErpGID",
                    value:
                      listAddressesPersons.find(
                        (x) => x.person_ErpGID == data.person_ErpGID,
                      )?.addresses?.[0]?.address_ErpGID ?? null,
                  }),
                );
              }
            }}
            id="shipTo_other_address"
          />
          <label className="form-check-label" htmlFor="shipTo_other_address">
            Παράδοση σε νέα διεύθυνση
          </label>
        </div>

        {data.shipTo_other_address == 1 && (
          <>
            <div className="mt-3">
              <Field label="Διεύθυνση παράδοσης">
                <input
                  className="form-control"
                  name="customer_other_address"
                  value={data.customer_other_address ?? ""}
                  onChange={(e) =>
                    dispatch(
                      setDraftProperty({
                        key: "customer_other_address",
                        value: e.target.value,
                      }),
                    )
                  }
                />
              </Field>
            </div>
            <div className="row g-2">
              <div className="col-6">
                <Field label="Πόλη ">
                  <input
                    className="form-control"
                    name="customer_other_city"
                    value={data.customer_other_city ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "customer_other_city",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </Field>
              </div>
              <div className="col-6">
                <Field label="ΤΚ">
                  <input
                    className="form-control"
                    name="customer_other_tk"
                    inputMode="numeric"
                    value={data.customer_other_tk ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "customer_other_tk",
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
    </FormErrorsContext.Provider>
  );
}
