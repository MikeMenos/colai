import OrderField from "@/components/ui/OrderField";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import {
  hasText,
  isBlank,
  pickFirstNonBlankString,
  trimmedString,
} from "@/lib/utils/string";
import React from "react";

export default function UpdateRecipientArea() {
  const dispatch = useAppDispatch();
  const data = useAppSelector((s) => s.orders.draft.order);
  const listAddressesPersons = useAppSelector(
    (s) => s.orders.draft.list_AddressesPersons,
  );
  const selectedPerson = React.useMemo(
    () =>
      listAddressesPersons.find((p) => p.person_ErpGID == data.person_ErpGID) ??
      null,
    [listAddressesPersons, data.person_ErpGID],
  );
  const isSamePersonAndCustomerAmka =
    hasText(data.customer_amka) &&
    trimmedString(data.customer_amka) ===
      trimmedString(selectedPerson?.personAMKA);

  /** Lookup-selected recipient may match customer AMKA but still needs ΑΦΜ on this step. */
  const showAfmField =
    !isSamePersonAndCustomerAmka || data.recipient_from_erp_lookup == 1;

  const initialValues = React.useMemo(
    () => ({
      amka: pickFirstNonBlankString(
        selectedPerson?.personAMKA,
        data.recipient_amka,
        data.customer_amka,
      ),
      afm: pickFirstNonBlankString(
        selectedPerson?.personVatNumber,
        data.recipient_afm,
        data.customer_afm,
      ),
      passport: pickFirstNonBlankString(
        selectedPerson?.personIDCode,
        selectedPerson?.personPassport,
        data.recipient_passport,
        data.customer_passport,
      ),
      mobile: pickFirstNonBlankString(
        selectedPerson?.personMobile1,
        selectedPerson?.personMobile,
        data.recipient_mobile,
        data.customer_mobile,
      ),
    }),
    [
      data.customer_afm,
      data.customer_amka,
      data.customer_mobile,
      data.customer_passport,
      data.recipient_afm,
      data.recipient_amka,
      data.recipient_mobile,
      data.recipient_passport,
      selectedPerson?.personAMKA,
      selectedPerson?.personIDCode,
      selectedPerson?.personMobile,
      selectedPerson?.personMobile1,
      selectedPerson?.personPassport,
      selectedPerson?.personVatNumber,
    ],
  );

  /** After Αποθήκευση, overrides live on the draft order; remount must rehydrate from those, not only CRM/person defaults. */
  const seedValues = React.useMemo(() => {
    if (data.shouldUpdateRecipientInfos != 1) return initialValues;
    return {
      amka: initialValues.amka,
      afm: pickFirstNonBlankString(data.updateRecipient_afm, initialValues.afm),
      passport: pickFirstNonBlankString(
        data.updateRecipient_passport,
        initialValues.passport,
      ),
      mobile: pickFirstNonBlankString(
        data.updateRecipient_mobile,
        initialValues.mobile,
      ),
    };
  }, [
    data.shouldUpdateRecipientInfos,
    data.updateRecipient_afm,
    data.updateRecipient_passport,
    data.updateRecipient_mobile,
    initialValues,
  ]);
  const [afmValue, setAfmValue] = React.useState("");
  const [passportValue, setPassportValue] = React.useState("");
  const [mobileValue, setMobileValue] = React.useState("");
  const [savedValues, setSavedValues] = React.useState({
    afm: "",
    passport: "",
    mobile: "",
  });
  const [isSaveFeedbackActive, setIsSaveFeedbackActive] = React.useState(false);

  React.useEffect(() => {
    dispatch(setDraftProperty({ key: "updateRecipient_amka", value: null }));
  }, [dispatch, initialValues.amka]);

  React.useEffect(() => {
    setAfmValue(seedValues.afm);
    setPassportValue(seedValues.passport);
    setMobileValue(seedValues.mobile);
    setSavedValues({
      afm: seedValues.afm,
      passport: seedValues.passport,
      mobile: seedValues.mobile,
    });
  }, [seedValues.afm, seedValues.mobile, seedValues.passport]);

  React.useEffect(() => {
    if (data.shouldUpdateRecipientInfos == 1) return;
    dispatch(
      setDraftProperty({ key: "shouldUpdateRecipientInfos", value: null }),
    );
    dispatch(setDraftProperty({ key: "updateRecipient_afm", value: null }));
    dispatch(
      setDraftProperty({ key: "updateRecipient_passport", value: null }),
    );
    dispatch(setDraftProperty({ key: "updateRecipient_mobile", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_address", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_tk", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_amka", value: null }));
  }, [data.shouldUpdateRecipientInfos, dispatch]);

  const isDirty =
    (showAfmField && afmValue !== savedValues.afm) ||
    passportValue !== savedValues.passport ||
    mobileValue !== savedValues.mobile;

  const handleSave = () => {
    dispatch(setDraftProperty({ key: "shouldUpdateRecipientInfos", value: 1 }));
    dispatch(
      setDraftProperty({
        key: "updateRecipient_afm",
        value: showAfmField ? afmValue : null,
      }),
    );
    dispatch(
      setDraftProperty({
        key: "updateRecipient_passport",
        value: passportValue,
      }),
    );
    dispatch(
      setDraftProperty({
        key: "updateRecipient_mobile",
        value: isBlank(mobileValue) ? null : mobileValue.trim(),
      }),
    );
    dispatch(setDraftProperty({ key: "updateRecipient_address", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_tk", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_amka", value: null }));
    setSavedValues({
      afm: afmValue,
      passport: passportValue,
      mobile: mobileValue,
    });
    setIsSaveFeedbackActive(true);
  };

  React.useEffect(() => {
    if (!isSaveFeedbackActive) return;
    const timer = window.setTimeout(() => {
      setIsSaveFeedbackActive(false);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [isSaveFeedbackActive]);

  const recipientTitleSuffix = pickFirstNonBlankString(
    selectedPerson?.personName,
    data.recipient_name,
  );

  return (
    <div className="app-card px-3 py-2">
      <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
        <div className="fw-semibold">
          Επικαιροποίηση στοιχείων παραλήπτη
          {recipientTitleSuffix ? ` - ${recipientTitleSuffix}` : ""}
        </div>
      </div>

      {!showAfmField ? (
        <>
          <div className="row g-2">
            <div className="col-12">
              <OrderField label="ΑΜΚΑ">
                <input
                  className="form-control"
                  name="updateRecipient_amka"
                  inputMode="numeric"
                  disabled
                  value={initialValues.amka}
                  readOnly
                />
              </OrderField>
            </div>
          </div>
          <div className="row g-2">
            <div className="col-6">
              <OrderField label="ΑΤ/Διαβατήριο">
                <input
                  className="form-control"
                  name="updateRecipient_passport"
                  value={passportValue}
                  onChange={(e) => setPassportValue(e.target.value)}
                />
              </OrderField>
            </div>
            <div className="col-6">
              <OrderField label="Κινητό">
                <input
                  className="form-control"
                  name="updateRecipient_mobile"
                  inputMode="tel"
                  value={mobileValue}
                  onChange={(e) => setMobileValue(e.target.value)}
                />
              </OrderField>
            </div>
          </div>
        </>
      ) : (
        <div className="row g-2">
          <div className="col-6">
            <OrderField label="ΑΜΚΑ">
              <input
                className="form-control"
                name="updateRecipient_amka"
                inputMode="numeric"
                disabled
                value={initialValues.amka}
                readOnly
              />
            </OrderField>
          </div>
          <div className="col-6">
            <OrderField label="ΑΦΜ">
              <input
                className="form-control"
                name="updateRecipient_afm"
                inputMode="numeric"
                value={afmValue}
                onChange={(e) => setAfmValue(e.target.value)}
              />
            </OrderField>
          </div>
          <div className="col-6">
            <OrderField label="ΑΤ/Διαβατήριο">
              <input
                className="form-control"
                name="updateRecipient_passport"
                value={passportValue}
                onChange={(e) => setPassportValue(e.target.value)}
              />
            </OrderField>
          </div>
          <div className="col-6">
            <OrderField label="Κινητό">
              <input
                className="form-control"
                name="updateRecipient_mobile"
                inputMode="tel"
                value={mobileValue}
                onChange={(e) => setMobileValue(e.target.value)}
              />
            </OrderField>
          </div>
        </div>
      )}
      <div className="d-flex justify-content-end mt-3">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!isDirty || isSaveFeedbackActive}
        >
          {isSaveFeedbackActive ? "Αποθηκεύτηκε" : "Αποθήκευση"}
        </button>
      </div>
    </div>
  );
}
