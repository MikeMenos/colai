import {
  loadCustomerAddressesAsync,
  setDraftProperty,
} from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import CustomerLookupModal from "../modals/CustomerLookupModal";
import CustomerAmkaGate from "./CustomerAmkaGate";
import { CustomerAmkaSearchPanel } from "./CustomerAmkaSearchPanel";
import ErpContactsLookupModal from "../modals/ErpContactsLookupModal";
import NewRecipientConfirmModal from "../modals/NewRecipientConfirmModal";
import SavedRecipientFields, {
  clearOtherRecipientFields,
  resolveSavedRecipientSelection,
} from "./SavedRecipientFields";
import React from "react";
import { FormSelect } from "react-bootstrap";
import FormErrorsContext from "@/components/ui/FormErrorContect";
import OrderField from "@/components/ui/OrderField";
import OtpInput from "@/components/ui/OTPInput";
import {
  isCompletelyNewCustomer,
  isCustomerProsEbs,
  isCustomerSelectedFromList,
} from "@/lib/customerUtils";
import { isValidAmka } from "@/lib/utils/amka";
import type { OrderCustomerAreaProps } from "./componentProps";

function CustomerNameLabel() {
  const data = useAppSelector((s) => s.orders.draft.order);
  const draftMeta = useAppSelector((s) => ({
    customerProsEbs: s.orders.draft.customerProsEbs,
    customerSelectedFromList: s.orders.draft.customerSelectedFromList,
    customerIsCompletelyNew: s.orders.draft.customerIsCompletelyNew,
  }));
  const isProsEbs = isCustomerProsEbs(draftMeta);
  const selectedFromList = isCustomerSelectedFromList(draftMeta);
  const completelyNew = isCompletelyNewCustomer(draftMeta);
  const isExistingCustomer = !!String(data.customer_ErpGID ?? "").trim();
  return (
    <span className="d-inline-flex align-items-center flex-wrap gap-2">
      Ονοματεπώνυμο
      {selectedFromList ? (
        <span className="badge text-bg-success">Υφιστάμενος</span>
      ) : isProsEbs ? (
        <span className="badge text-bg-success">Νέος/Προς EBS</span>
      ) : completelyNew ? (
        <span className="badge text-bg-danger">Νέος</span>
      ) : (
        <span
          className={`badge ${isExistingCustomer ? "text-bg-success" : "text-bg-danger"}`}
        >
          {isExistingCustomer ? "Υφιστάμενος" : "Νέος"}
        </span>
      )}
    </span>
  );
}

export default function OrderCustomerArea({
  errors,
  clearError,
  consentStepShown = true,
}: OrderCustomerAreaProps) {
  const data = useAppSelector((s) => s.orders.draft.order);
  const dispatch = useAppDispatch();
  const [showLookup, setShowLookup] = React.useState(false);
  const [showErpContactsLookup, setShowErpContactsLookup] =
    React.useState(false);
  const [showNewRecipientConfirm, setShowNewRecipientConfirm] =
    React.useState(false);
  const listTropoiApostolis = useAppSelector(
    (s) => s.orders.draft.list_TroposApostolis,
  );
  const listReceiptientReasons = useAppSelector(
    (s) => s.orders.draft.list_LogosParalipti,
  );
  const listRelationIDs = useAppSelector(
    (s) => s.orders.draft.list_SygeniaParalipti,
  );
  const listAddressesPersons = useAppSelector(
    (s) => s.orders.draft.list_AddressesPersons,
  );
  const preselected_person_GID = useAppSelector(
    (s) => s.orders.draft.preselected_person_GID,
  );
  const preselected_address_GID = useAppSelector(
    (s) => s.orders.draft.preselected_address_GID,
  );
  const aiCalculated = useAppSelector((s) => s.orders.draft.order.aiCalculated);
  const customerAmkaGateCompleted = useAppSelector(
    (s) => s.orders.draft.customerAmkaGateCompleted,
  );
  const showAmkaGate = !aiCalculated && customerAmkaGateCompleted !== true;
  const [amkaEditedByUser, setAmkaEditedByUser] = React.useState(false);
  const [amkaSearchOpen, setAmkaSearchOpen] = React.useState(false);
  const amkaSearchAnchorRef = React.useRef<HTMLDivElement | null>(null);
  const baselineCustomerAmkaRef = React.useRef<string | null>(null);
  const showInlineAmkaSearch =
    aiCalculated &&
    amkaEditedByUser &&
    amkaSearchOpen &&
    isValidAmka(data.customer_amka ?? "");

  const savedRecipientSelectionRef = React.useRef<{
    person_ErpGID: string | null;
    address_ErpGID: string | null;
  } | null>(null);

  const selectedPerson = React.useMemo(
    () =>
      listAddressesPersons.find((p) => p.person_ErpGID == data.person_ErpGID) ??
      null,
    [listAddressesPersons, data.person_ErpGID],
  );
  const selectedAddress = React.useMemo(() => {
    const addresses = selectedPerson?.addresses ?? [];
    if (!addresses.length) return null;
    return (
      addresses.find((a) => a.address_ErpGID == data.address_ErpGID) ??
      addresses[0]
    );
  }, [selectedPerson, data.address_ErpGID]);

  const enableOtherRecipient = React.useCallback(() => {
    savedRecipientSelectionRef.current = {
      person_ErpGID: data.person_ErpGID ?? null,
      address_ErpGID: data.address_ErpGID ?? null,
    };
    dispatch(setDraftProperty({ key: "has_other_recipient", value: 1 }));
    dispatch(setDraftProperty({ key: "person_ErpGID", value: null }));
    dispatch(setDraftProperty({ key: "address_ErpGID", value: null }));
    dispatch(setDraftProperty({ key: "shipTo_other_address", value: 0 }));
    dispatch(
      setDraftProperty({ key: "recipient_from_erp_lookup", value: null }),
    );
  }, [data.address_ErpGID, data.person_ErpGID, dispatch]);

  const disableOtherRecipient = React.useCallback(() => {
    const saved = savedRecipientSelectionRef.current;
    const { person_ErpGID, address_ErpGID } = resolveSavedRecipientSelection(
      listAddressesPersons,
      {
        personErpGID: saved?.person_ErpGID ?? data.person_ErpGID,
        addressErpGID: saved?.address_ErpGID ?? data.address_ErpGID,
        preselectedPerson: preselected_person_GID,
        preselectedAddress: preselected_address_GID,
      },
    );

    dispatch(
      setDraftProperty({
        key: "person_ErpGID",
        value: person_ErpGID,
      }),
    );
    dispatch(
      setDraftProperty({
        key: "address_ErpGID",
        value: address_ErpGID,
      }),
    );
    clearOtherRecipientFields(dispatch);
    savedRecipientSelectionRef.current = null;
  }, [
    data.address_ErpGID,
    data.person_ErpGID,
    dispatch,
    listAddressesPersons,
    preselected_address_GID,
    preselected_person_GID,
  ]);

  React.useEffect(() => {
    if (!selectedAddress) return;

    dispatch(
      setDraftProperty({
        key: "updateRecipient_amka",
        value: null,
      }),
    );
  }, [selectedAddress, selectedPerson, dispatch]);

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
    if (aiCalculated && !amkaEditedByUser) {
      baselineCustomerAmkaRef.current = data.customer_amka ?? "";
    }
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
  if (showAmkaGate) {
    return <CustomerAmkaGate />;
  }

  return (
    <div className="app-card px-3 py-2">
      <FormErrorsContext.Provider value={{ errors: errors ?? {}, clearError }}>
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
          onClose={() => {
            setShowLookup(false);
            if (!amkaEditedByUser) {
              baselineCustomerAmkaRef.current = null;
            }
          }}
          resetWizardOnDifferentAmka={aiCalculated}
          baselineCustomerAmkaRef={baselineCustomerAmkaRef}
        />

        <div className="mb-3">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <label
              className="form-label fw-semibold mb-0"
              htmlFor="customer_tel_otp_0"
            >
              OTP
            </label>
            <OtpInput
              name="customer_tel_otp"
              length={6}
              value={data.customer_tel_otp ?? ""}
              onChange={(otp) => {
                dispatch(
                  setDraftProperty({ key: "customer_tel_otp", value: otp }),
                );
                if (errors?.customer_tel_otp && clearError) {
                  clearError("customer_tel_otp");
                }
              }}
            />
          </div>
          {errors?.customer_tel_otp && errors.customer_tel_otp !== true ? (
            <div className="invalid-feedback d-block">
              {errors.customer_tel_otp}
            </div>
          ) : null}
        </div>

        <OrderField label={<CustomerNameLabel />}>
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
        </OrderField>

        <OrderField label="ΑΤ/Διαβατήριο">
          <input
            className="form-control"
            name="customer_passport"
            value={data.customer_passport ?? ""}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "customer_passport",
                  value: e.target.value,
                }),
              )
            }
          />
        </OrderField>

        <div ref={amkaSearchAnchorRef}>
          <div className="row g-2">
            <div className="col-6">
              <OrderField label="ΑΜΚΑ">
                <input
                  className="form-control"
                  name="customer_amka"
                  role="combobox"
                  inputMode="numeric"
                  value={data.customer_amka ?? ""}
                  aria-haspopup="listbox"
                  aria-expanded={showInlineAmkaSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!amkaEditedByUser) {
                      baselineCustomerAmkaRef.current =
                        data.customer_amka ?? "";
                    }
                    setAmkaEditedByUser(true);
                    setAmkaSearchOpen(isValidAmka(value));
                    dispatch(
                      setDraftProperty({
                        key: "customer_amka",
                        value,
                      }),
                    );
                  }}
                />
              </OrderField>
            </div>
            <div className="col-6">
              <OrderField label="Ημ/νία γέννησης" hint="π.χ. 31/12/1990">
                <input
                  className="form-control"
                  name="customer_dob"
                  inputMode="numeric"
                  value={data.customer_dob ?? ""}
                  onChange={(e) => handleDateInput(e.target.value)}
                />
              </OrderField>
            </div>
          </div>
          {showInlineAmkaSearch ? (
            <CustomerAmkaSearchPanel
              amka={data.customer_amka ?? ""}
              anchorRef={amkaSearchAnchorRef}
              open={amkaSearchOpen}
              resetWizardOnDifferentAmka
              baselineCustomerAmkaRef={baselineCustomerAmkaRef}
              onDismiss={() => setAmkaSearchOpen(false)}
              onResolved={() => {
                setAmkaEditedByUser(false);
                setAmkaSearchOpen(false);
                baselineCustomerAmkaRef.current = null;
              }}
            />
          ) : null}
        </div>

        <div className="row g-2">
          <div className="col-6">
            <OrderField label="Κινητό">
              <input
                className="form-control"
                name="customer_mobile"
                inputMode="tel"
                value={data.customer_mobile ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "customer_mobile",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
          </div>
          <div className="col-6">
            <OrderField label="Τηλέφωνο">
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
            </OrderField>
          </div>
        </div>
        {consentStepShown ? (
          <div className="row g-2">
            <div className="col-12">
              <OrderField label="Email">
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
              </OrderField>
            </div>
          </div>
        ) : (
          <div className="row g-2">
            <div className="col-12">
              <OrderField label="Email">
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
              </OrderField>
            </div>
          </div>
        )}

        <OrderField label="Διεύθυνση">
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
        </OrderField>

        <div className="row g-2">
          <div className="col-6">
            <OrderField label="Πόλη">
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
            </OrderField>
          </div>
          <div className="col-6">
            <OrderField label="ΤΚ">
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
            </OrderField>
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

        <OrderField label="Αποστολή">
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
        </OrderField>

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

        {data.shipTo_other_address != 1 && (
          <div className="form-check form-switch switch-lg mb-2">
            <input
              className="form-check-input"
              name="has_other_recipient"
              type="checkbox"
              checked={data.has_other_recipient == 1}
              onChange={(e) => {
                const val = e.target.checked ? 1 : 0;
                if (val === 1) {
                  if (listAddressesPersons.length > 0) {
                    setShowNewRecipientConfirm(true);
                    return;
                  }
                  enableOtherRecipient();
                  return;
                }

                dispatch(
                  setDraftProperty({ key: "has_other_recipient", value: 0 }),
                );
                disableOtherRecipient();
              }}
              id="has_other_recipient"
            />
            <label className="form-check-label" htmlFor="has_other_recipient">
              Παραλαβή από νέο πρόσωπο
            </label>
          </div>
        )}

        {data.has_other_recipient == 1 && (
          <>
            <div className="d-flex align-items-center justify-content-between pb-2">
              <div className="fw-semibold">Αναζήτηση σε πελατολόγιο</div>
              <button
                type="button"
                className="btn-icon-pill"
                aria-label="Αναζήτηση σε πελατολόγιο"
                onClick={() => setShowErpContactsLookup(true)}
              >
                <i className="bi bi-search" />
              </button>
            </div>

            <ErpContactsLookupModal
              show={showErpContactsLookup}
              onClose={() => setShowErpContactsLookup(false)}
              person_GID={
                preselected_person_GID ??
                data.customer_ErpGID ??
                listAddressesPersons?.[0]?.person_ErpGID ??
                ""
              }
              address_GID={
                preselected_address_GID ??
                data.address_ErpGID ??
                listAddressesPersons?.[0]?.addresses?.[0]?.address_ErpGID ??
                ""
              }
            />
          </>
        )}

        {data.has_other_recipient != 1 && <SavedRecipientFields />}

        {data.has_other_recipient == 1 && (
          <>
            <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
              <div className="fw-semibold">Στοιχεία Παραλήπτη</div>
            </div>

            <OrderField label="Αιτία παραλαβής">
              <FormSelect
                name="recipient_reason_id"
                value={data.recipient_reason_id ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "recipient_reason_id",
                      value: e.target.value,
                    }),
                  )
                }
              >
                <option value=""></option>
                {listReceiptientReasons.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.text}
                  </option>
                ))}
              </FormSelect>
            </OrderField>
            <OrderField label="Σχέση">
              <FormSelect
                name="recipient_relation_id"
                value={data.recipient_relation_id ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "recipient_relation_id",
                      value: e.target.value,
                    }),
                  )
                }
              >
                <option value=""></option>
                {listRelationIDs.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.text}
                  </option>
                ))}
              </FormSelect>
            </OrderField>
            <OrderField label="Ονοματεπώνυμο ">
              <input
                className="form-control"
                name="recipient_name"
                value={data.recipient_name ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "recipient_name",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
            <div className="row g-2">
              <div className="col-6">
                <OrderField label="ΑΜΚΑ ">
                  <input
                    className="form-control"
                    name="recipient_amka"
                    type="numeric"
                    value={data.recipient_amka ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "recipient_amka",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </OrderField>
              </div>
              <div className="col-6">
                <OrderField label="ΑΦΜ ">
                  <input
                    className="form-control"
                    name="recipient_afm"
                    type="numeric"
                    value={data.recipient_afm ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "recipient_afm",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </OrderField>
              </div>
            </div>
            {consentStepShown ? (
              <>
                <div className="row g-2">
                  <div className="col-6">
                    <OrderField label="Κινητό">
                      <input
                        className="form-control"
                        name="recipient_mobile"
                        inputMode="tel"
                        value={data.recipient_mobile ?? ""}
                        onChange={(e) =>
                          dispatch(
                            setDraftProperty({
                              key: "recipient_mobile",
                              value: e.target.value,
                            }),
                          )
                        }
                      />
                    </OrderField>
                  </div>
                  <div className="col-6">
                    <OrderField label="Τηλέφωνο">
                      <input
                        className="form-control"
                        inputMode="tel"
                        name="recipient_tel"
                        value={data.recipient_tel ?? ""}
                        onChange={(e) =>
                          dispatch(
                            setDraftProperty({
                              key: "recipient_tel",
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
                    <OrderField label="ΑΤ/Διαβατήριο">
                      <input
                        className="form-control"
                        type="numeric"
                        name="recipient_passport"
                        value={data.recipient_passport ?? ""}
                        onChange={(e) =>
                          dispatch(
                            setDraftProperty({
                              key: "recipient_passport",
                              value: e.target.value,
                            }),
                          )
                        }
                      />
                    </OrderField>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="row g-2">
                  <div className="col-6">
                    <OrderField label="Κινητό">
                      <input
                        className="form-control"
                        name="recipient_mobile"
                        inputMode="tel"
                        value={data.recipient_mobile ?? ""}
                        onChange={(e) =>
                          dispatch(
                            setDraftProperty({
                              key: "recipient_mobile",
                              value: e.target.value,
                            }),
                          )
                        }
                      />
                    </OrderField>
                  </div>
                  <div className="col-6">
                    <OrderField label="Τηλέφωνο">
                      <input
                        className="form-control"
                        inputMode="tel"
                        name="recipient_tel"
                        value={data.recipient_tel ?? ""}
                        onChange={(e) =>
                          dispatch(
                            setDraftProperty({
                              key: "recipient_tel",
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
                    <OrderField label="ΑΤ/Διαβατήριο">
                      <input
                        className="form-control"
                        type="numeric"
                        name="recipient_passport"
                        value={data.recipient_passport ?? ""}
                        onChange={(e) =>
                          dispatch(
                            setDraftProperty({
                              key: "recipient_passport",
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
            <OrderField label="Διεύθυνση">
              <input
                className="form-control"
                name="recipient_address"
                value={data.recipient_address ?? ""}
                onChange={(e) =>
                  dispatch(
                    setDraftProperty({
                      key: "recipient_address",
                      value: e.target.value,
                    }),
                  )
                }
              />
            </OrderField>
            <div className="row g-2">
              <div className="col-6">
                <OrderField label="Πόλη ">
                  <input
                    className="form-control"
                    name="recipient_city"
                    value={data.recipient_city ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "recipient_city",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </OrderField>
              </div>
              <div className="col-6">
                <OrderField label="ΤΚ">
                  <input
                    className="form-control"
                    name="recipient_tk"
                    inputMode="numeric"
                    value={data.recipient_tk ?? ""}
                    onChange={(e) =>
                      dispatch(
                        setDraftProperty({
                          key: "recipient_tk",
                          value: e.target.value,
                        }),
                      )
                    }
                  />
                </OrderField>
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
          </>
        )}

        {data.has_other_recipient != 1 && (
          <div className="form-check form-switch switch-lg mb-2">
            <input
              className="form-check-input"
              name="shipTo_other_address"
              type="checkbox"
              checked={data.shipTo_other_address == 1}
              onChange={(e) => {
                const checked = e.target.checked;
                dispatch(
                  setDraftProperty({
                    key: "shipTo_other_address",
                    value: checked ? 1 : 0,
                  }),
                );
                if (checked) {
                  dispatch(
                    setDraftProperty({ key: "address_ErpGID", value: null }),
                  );
                  dispatch(
                    setDraftProperty({ key: "has_other_recipient", value: 0 }),
                  );
                  clearOtherRecipientFields(dispatch);
                  dispatch(
                    setDraftProperty({
                      key: "person_ErpGID",
                      value: preselected_person_GID,
                    }),
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
        )}

        {data.shipTo_other_address == 1 && (
          <>
            <div className="mt-3">
              <OrderField label="Διεύθυνση παράδοσης">
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
              </OrderField>
            </div>
            <div className="row g-2">
              <div className="col-6">
                <OrderField label="Πόλη ">
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
                </OrderField>
              </div>
              <div className="col-6">
                <OrderField label="ΤΚ">
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
                </OrderField>
              </div>
            </div>
          </>
        )}
      </FormErrorsContext.Provider>

      <NewRecipientConfirmModal
        show={showNewRecipientConfirm}
        onConfirmNewRecipient={() => {
          enableOtherRecipient();
          setShowNewRecipientConfirm(false);
        }}
        onSelectExisting={() => setShowNewRecipientConfirm(false)}
        onCancel={() => setShowNewRecipientConfirm(false)}
      />
    </div>
  );
}
