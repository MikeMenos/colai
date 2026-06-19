import type { AppDispatch } from "@/store/store";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import type { Order } from "@/types/orders";
import { hasText } from "@/lib/utils/string";

const KEY_MAP: Record<string, keyof Order> = {
  customer_Notes: "sellerComments",
  customerNotes: "sellerComments",
  customer_notes: "sellerComments",
  recipient_Notes: "sellerComments",
  recipientNotes: "sellerComments",
  preselected_address_GID: "address_ErpGID",
  address_GID: "address_ErpGID",
  preselected_person_GID: "person_ErpGID",
  person_GID: "person_ErpGID",
  hasOtherRecipient: "has_other_recipient",
  Has_Other_Recipient: "has_other_recipient",
  shipToOtherAddress: "shipTo_other_address",
  ShipTo_Other_Address: "shipTo_other_address",
  recipientRelationId: "recipient_relation_id",
  recipientReasonId: "recipient_reason_id",
};

const EXCLUDE_KEYS = new Set<string>([
  "id",
  "uid",
  "dateIn",
  "dateUpdated",
  "dateErpLinked",
  "seller_GID",
  "sellerPerson_GID",
  "sellerName",
  "sellerCode",
  "sellerComments",
  "erpId",
]);

/** Fields that must be 0 or 1 for checkbox/switch UI */
const ZERO_ONE_FIELDS = new Set<string>([
  "has_other_recipient",
  "shipTo_other_address",
  "deliverySunday",
  "deliveryMorning",
  "shipToOtherAddressBool",
]);

export function normalizeZeroOne(value: unknown): 0 | 1 {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value ? 1 : 0;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "string")
    return value === "1" || value.toLowerCase() === "true" ? 1 : 0;
  return !!value ? 1 : 0;
}

type OrderLikeRecord = Record<string, unknown> | null | undefined;

export function pickOrderFieldFromRecords(
  keys: string[],
  ...sources: OrderLikeRecord[]
): unknown {
  for (const src of sources) {
    if (!src || typeof src !== "object" || Array.isArray(src)) continue;
    for (const k of keys) {
      const v = src[k];
      if (hasText(v)) return v;
    }
  }
  return undefined;
}

export function extractShipToOtherAddress(
  ...sources: OrderLikeRecord[]
): 0 | 1 | undefined {
  const v = pickOrderFieldFromRecords(
    ["shipTo_other_address", "shipToOtherAddress", "ShipTo_Other_Address"],
    ...sources,
  );
  if (v === undefined || v === null) return undefined;
  return normalizeZeroOne(v);
}

export function extractPersonErpGID(
  ...sources: OrderLikeRecord[]
): string | undefined {
  const v = pickOrderFieldFromRecords(
    ["person_ErpGID", "preselected_person_GID", "person_GID"],
    ...sources,
  );
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s || undefined;
}

export function extractAddressErpGID(
  ...sources: OrderLikeRecord[]
): string | undefined {
  const v = pickOrderFieldFromRecords(
    ["address_ErpGID", "preselected_address_GID"],
    ...sources,
  );
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s || undefined;
}

export function syncShipToOtherAddressFlags(
  dispatch: AppDispatch,
  shipTo: 0 | 1,
): void {
  dispatch(setDraftProperty({ key: "shipTo_other_address", value: shipTo }));
  dispatch(
    setDraftProperty({ key: "shipToOtherAddressBool", value: shipTo === 1 }),
  );
  if (shipTo === 1) {
    dispatch(setDraftProperty({ key: "address_ErpGID", value: null }));
  }
}

export function applyPersonErpGIDFromLastOrder(
  dispatch: AppDispatch,
  personGid: string | undefined,
): void {
  if (!personGid) return;
  dispatch(setDraftProperty({ key: "person_ErpGID", value: personGid }));
}

/** Keys allowed when applying last_web_order from load-last-customer-order-info (Ασθενής + Ιατρός steps) */
export const LAST_CUSTOMER_WEB_ORDER_ALLOW_KEYS = new Set<string>([
  "customer_amka",
  "customer_passport",
  "customer_name",
  "customer_address",
  "customer_city",
  "customer_tk",
  "customer_tel",
  "customer_mobile",
  "customer_mobile2",
  "customer_email",
  "customer_dob",
  "sellerComments",
  "customer_ErpGID",
  "customer_other_address",
  "customer_other_city",
  "customer_other_tk",
  "shipTo_other_address",
  "shipMethodId",
  "has_other_recipient",
  "recipient_relation_id",
  "recipient_reason_id",
  "recipient_name",
  "recipient_amka",
  "recipient_afm",
  "recipient_tel",
  "recipient_mobile",
  "recipient_mobile2",
  "recipient_passport",
  "recipient_address",
  "recipient_city",
  "recipient_tk",
  "recipient_ErpGID",
  "recipient_ErpContact_PersonGID",
  "recipient_ErpContact_AddressGID",
  "person_ErpGID",
  "address_ErpGID",
  "preselected_person_GID",
  "preselected_address_GID",
  "doctor_amka",
  "doctor_name",
  "doctor_afm",
  "doctor_Domi",
  "doctor_DomiTypos",
  "doctor_ErpGID",
  "doctorSuggested_amka",
  "doctorSuggested_name",
  "doctorSuggested_afm",
  "doctorSuggested_domi",
  "doctorSuggested_tel",
  "doctorSuggested_ErpGID",
  "has_suggested_doctor",
  "hasOtherSystinonIatroBool",
]);

/**
 * Maps `last_erp_order` from load-last-customer-order-info into draft (customer + suggested doctor).
 * `person_ErpGID` / `address_ErpGID` are not set here — use `loadCustomerAddressesAsync` with
 * `preferredPersonErpGID` = `deliveryPersonGID` so selection is applied only when that ID exists in `addresses`.
 */
export function applyLastErpOrderData(
  erp: Record<string, unknown>,
  dispatch: AppDispatch,
): void {
  const map: Record<string, keyof Order> = {
    customerGID: "customer_ErpGID",
    customerAMKA: "customer_amka",
    suggestedDoctorGID: "doctorSuggested_ErpGID",
    suggestedDoctor_amka: "doctorSuggested_amka",
    suggestedDoctor_name: "doctorSuggested_name",
    suggestedDoctor_afm: "doctorSuggested_afm",
    suggestedDoctor_domi: "doctorSuggested_domi",
    suggestedDoctor_tel: "doctorSuggested_tel",
  };
  for (const [erpKey, orderKey] of Object.entries(map)) {
    const v = erp[erpKey];
    if (v === null || v === undefined || v === "") continue;
    const normalized = ZERO_ONE_FIELDS.has(orderKey) ? normalizeZeroOne(v) : v;
    dispatch(setDraftProperty({ key: orderKey, value: normalized }));
  }
  if (hasText(erp.suggestedDoctorGID)) {
    dispatch(setDraftProperty({ key: "has_suggested_doctor", value: 2 }));
  }
}

/**
 * Overwrites draft order with values from lastOrderData (e.g. last_order_info or last_web_order from load-last-customer-order-info).
 * Skips null/undefined and excluded keys.
 * When restrictToCustomerAndDoctor is true, only Ασθενής and Ιατρός fields are applied (e.g. last_web_order from patient search).
 */
export function applyLastOrderData(
  lastOrderData: Record<string, unknown>,
  dispatch: AppDispatch,
  restrictToCustomerAndDoctor?: boolean,
): void {
  for (const [key, value] of Object.entries(lastOrderData)) {
    const orderKey = (KEY_MAP[key] ?? key) as keyof Order;
    if (EXCLUDE_KEYS.has(orderKey)) continue;
    if (
      restrictToCustomerAndDoctor &&
      !LAST_CUSTOMER_WEB_ORDER_ALLOW_KEYS.has(orderKey)
    )
      continue;
    const normalized = ZERO_ONE_FIELDS.has(orderKey)
      ? normalizeZeroOne(value)
      : value;
    if (normalized === null || normalized === undefined) continue;
    dispatch(setDraftProperty({ key: orderKey, value: normalized }));
  }
}
