import { hasText, trimmedString } from "@/lib/utils/string";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import type { AppDispatch } from "@/store/store";
import { store } from "@/store/store";
import type { Order, OrderAddress, OrderListOfAddressPersons } from "@/types/orders";

const POSTAL_CODE_PATTERN = /^\d{5}$/;

export type ShipMethodPostalCodeSource =
  | "recipient_tk"
  | "customer_other_tk"
  | "saved_address_tk"
  | "customer_tk";

export type ShipMethodSuggestionsPlacement =
  | "recipient_tk"
  | "customer_other_tk"
  | "saved_address"
  | "customer_tk";

function normalizePostalCode(value: string | null | undefined): string {
  return String(value ?? "").trim();
}

export function getSelectedSavedAddress(
  listAddressesPersons: OrderListOfAddressPersons[],
  order: Pick<Order, "person_ErpGID" | "address_ErpGID">,
): OrderAddress | null {
  const person = listAddressesPersons.find(
    (entry) => entry.person_ErpGID == order.person_ErpGID,
  );
  if (!person) return null;

  const address = person.addresses.find(
    (entry) => entry.address_ErpGID == order.address_ErpGID,
  );
  return address ?? null;
}

export function getShipMethodPostalCodeSource(
  order: Pick<
    Order,
    | "has_other_recipient"
    | "shipTo_other_address"
    | "person_ErpGID"
    | "address_ErpGID"
    | "customer_tk"
  >,
  listAddressesPersons: OrderListOfAddressPersons[] = [],
): ShipMethodPostalCodeSource {
  if (order.has_other_recipient == 1) return "recipient_tk";
  if (order.shipTo_other_address == 1) return "customer_other_tk";

  const savedAddress = getSelectedSavedAddress(listAddressesPersons, order);
  const savedTk = normalizePostalCode(savedAddress?.tk);
  const customerTk = normalizePostalCode(order.customer_tk);

  if (savedAddress && savedTk && savedTk !== customerTk) {
    return "saved_address_tk";
  }

  return "customer_tk";
}

export function getEffectiveShipMethodPostalCode(
  order: Pick<
    Order,
    | "has_other_recipient"
    | "recipient_tk"
    | "shipTo_other_address"
    | "customer_other_tk"
    | "customer_tk"
    | "person_ErpGID"
    | "address_ErpGID"
  >,
  listAddressesPersons: OrderListOfAddressPersons[] = [],
): string {
  const source = getShipMethodPostalCodeSource(order, listAddressesPersons);

  if (source === "recipient_tk") {
    return normalizePostalCode(order.recipient_tk);
  }
  if (source === "customer_other_tk") {
    return normalizePostalCode(order.customer_other_tk);
  }
  if (source === "saved_address_tk") {
    return normalizePostalCode(
      getSelectedSavedAddress(listAddressesPersons, order)?.tk,
    );
  }
  return normalizePostalCode(order.customer_tk);
}

export function shouldSkipShipMethodSuggestions(
  order: Pick<
    Order,
    | "has_other_recipient"
    | "shipTo_other_address"
    | "person_ErpGID"
    | "address_ErpGID"
    | "customer_tk"
  >,
  listAddressesPersons: OrderListOfAddressPersons[] = [],
  customerTkFromAi?: boolean,
): boolean {
  if (getShipMethodPostalCodeSource(order, listAddressesPersons) !== "customer_tk") {
    return false;
  }
  return customerTkFromAi === true;
}

export function getShipMethodSuggestionsPlacement(
  order: Pick<
    Order,
    | "has_other_recipient"
    | "shipTo_other_address"
    | "person_ErpGID"
    | "address_ErpGID"
    | "customer_tk"
  >,
  listAddressesPersons: OrderListOfAddressPersons[] = [],
  customerTkFromAi?: boolean,
): ShipMethodSuggestionsPlacement | null {
  if (order.has_other_recipient == 1) return "recipient_tk";
  if (order.shipTo_other_address == 1) return "customer_other_tk";

  const source = getShipMethodPostalCodeSource(order, listAddressesPersons);
  if (source === "saved_address_tk") return "saved_address";

  if (shouldSkipShipMethodSuggestions(order, listAddressesPersons, customerTkFromAi)) {
    return null;
  }

  return "customer_tk";
}

export function isValidShipMethodPostalCode(value: string): boolean {
  return POSTAL_CODE_PATTERN.test(value.trim());
}

export function applyShipMethodToDraft(
  dispatch: AppDispatch,
  id: number | string | null | undefined,
  name?: string | null,
) {
  if (id == null || id === "") return;

  const shipMethodId = String(id);
  const list = store.getState().orders.draft.list_TroposApostolis ?? [];
  const match = list.find((item) => String(item.value) === shipMethodId);
  const resolvedName = match?.text ?? (hasText(name) ? trimmedString(name) : "");

  dispatch(setDraftProperty({ key: "shipMethodId", value: shipMethodId }));
  dispatch(
    setDraftProperty({
      key: "shipMethodName",
      value: resolvedName,
    }),
  );
  dispatch(
    setDraftProperty({
      key: "shipMethod_GID",
      value: match?.value ?? shipMethodId,
    }),
  );
}
