"use client";

import OrderField from "@/components/ui/OrderField";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import type { AppDispatch } from "@/store/store";
import { OrderListOfAddressPersons } from "@/types/orders";
import React from "react";
import { FormSelect } from "react-bootstrap";
import type {
  RecipientSelection,
  ResolveSavedRecipientSelectionInput,
} from "./wizard/types";

const OTHER_RECIPIENT_FIELD_KEYS = [
  "recipient_reason_id",
  "recipient_relation_id",
  "recipient_relation",
  "recipient_reason",
  "recipient_name",
  "recipient_amka",
  "recipient_afm",
  "recipient_mobile",
  "recipient_mobile2",
  "recipient_tel",
  "recipient_passport",
  "recipient_address",
  "recipient_city",
  "recipient_tk",
  "recipient_ErpGID",
  "recipient_ErpContact_PersonGID",
  "recipient_ErpContact_AddressGID",
  "recipient_from_erp_lookup",
  "shouldUpdateRecipientInfos",
  "updateRecipient_afm",
  "updateRecipient_passport",
  "updateRecipient_mobile",
  "updateRecipient_address",
  "updateRecipient_tk",
  "updateRecipient_amka",
] as const;

export function clearOtherRecipientFields(dispatch: AppDispatch) {
  for (const key of OTHER_RECIPIENT_FIELD_KEYS) {
    dispatch(setDraftProperty({ key, value: null }));
  }
}

export function resolveSavedRecipientSelection(
  listAddressesPersons: OrderListOfAddressPersons[],
  {
    personErpGID,
    addressErpGID,
    preselectedPerson,
    preselectedAddress,
  }: ResolveSavedRecipientSelectionInput,
): RecipientSelection {
  const personInList = (pid?: string | null) =>
    !!pid && listAddressesPersons.some((p) => p.person_ErpGID == pid);

  const addressForPerson = (
    pid: string,
    ...preferredAddresses: Array<string | null | undefined>
  ) => {
    const addresses =
      listAddressesPersons.find((p) => p.person_ErpGID == pid)?.addresses ?? [];
    for (const preferred of preferredAddresses) {
      if (
        preferred &&
        addresses.some((a) => a.address_ErpGID == preferred)
      ) {
        return preferred;
      }
    }
    return addresses[0]?.address_ErpGID ?? null;
  };

  const person =
    (personErpGID && personInList(personErpGID) ? personErpGID : null) ??
    (preselectedPerson && personInList(preselectedPerson)
      ? preselectedPerson
      : null) ??
    listAddressesPersons[0]?.person_ErpGID ??
    null;

  const address = person
    ? addressForPerson(person, addressErpGID, preselectedAddress)
    : null;

  return { person_ErpGID: person, address_ErpGID: address };
}

export default function SavedRecipientFields() {
  const data = useAppSelector((s) => s.orders.draft.order);
  const dispatch = useAppDispatch();
  const listAddressesPersons = useAppSelector(
    (s) => s.orders.draft.list_AddressesPersons,
  );

  const selectedPerson = React.useMemo(
    () =>
      listAddressesPersons.find((p) => p.person_ErpGID == data.person_ErpGID) ??
      null,
    [listAddressesPersons, data.person_ErpGID],
  );
  const selectedPersonAddresses = React.useMemo(() => {
    return selectedPerson?.addresses ?? [];
  }, [selectedPerson]);

  if (listAddressesPersons.length === 0) return null;

  return (
    <>
      <OrderField label="Θα παραδοθεί σε">
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
            <option key={x.person_ErpGID ?? ""} value={x.person_ErpGID ?? ""}>
              {x.personName}
            </option>
          ))}
        </FormSelect>
      </OrderField>

      {data.shipTo_other_address != 1 &&
        data.person_ErpGID &&
        data.person_ErpGID != "" &&
        selectedPersonAddresses.length > 0 && (
          <OrderField label="Αποθηκευμένη διεύθυνση">
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
                <option key={a.address_ErpGID} value={a.address_ErpGID ?? ""}>
                  {`${a.address}, ${a.city}, ${a.tk}`}
                </option>
              ))}
            </FormSelect>
          </OrderField>
        )}
    </>
  );
}
