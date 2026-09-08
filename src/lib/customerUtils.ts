import type { DraftState } from "@/store/orders/ordersSlice";
import type { CustomerSearchResult } from "@/types/api/responses";
import { isDateOlderThanMonths } from "@/lib/utils/date";

export type CustomerOrderRecencyBadge = "Νέο" | "Επαναλ.";

export function getCustomerOrderRecencyBadge(
  lastOrderInfoDateIn: string | undefined,
): CustomerOrderRecencyBadge | null {
  const date = String(lastOrderInfoDateIn ?? "").trim();
  if (!date) return null;
  return isDateOlderThanMonths(date, 4) ? "Νέο" : "Επαναλ.";
}

export function isCompletelyNewCustomer(
  draft: Pick<DraftState, "customerIsCompletelyNew">,
): boolean {
  return draft.customerIsCompletelyNew === true;
}

export function isCustomerProsEbs(
  draft: Pick<DraftState, "customerProsEbs">,
): boolean {
  return draft.customerProsEbs === true;
}

export function isCustomerSelectedFromList(
  draft: Pick<DraftState, "customerSelectedFromList">,
): boolean {
  return draft.customerSelectedFromList === true;
}

/** Locks suggested-doctor options for returning customers with a recent prior order. */
export function isSuggestedDoctorChoiceLocked(
  draft: Pick<
    DraftState,
    "customerIsCompletelyNew" | "lastOrderInfoDateIn"
  > & { customerProsEbs?: DraftState["customerProsEbs"] },
): boolean {
  if (draft.customerIsCompletelyNew === true) return false;
  if (draft.customerProsEbs === true) return false;
  // Empty/missing date is treated as older than 4 months → not locked.
  if (!String(draft.lastOrderInfoDateIn ?? "").trim()) return false;
  return !isDateOlderThanMonths(draft.lastOrderInfoDateIn, 4);
}

export function shouldShowSuggestedDoctorChangeToggle(
  draft: Pick<
    DraftState,
    "customerIsCompletelyNew" | "lastOrderInfoDateIn"
  > & { customerProsEbs?: DraftState["customerProsEbs"] },
  customerErpGID: string | null | undefined,
): boolean {
  if (!String(customerErpGID ?? "").trim()) return false;
  return isSuggestedDoctorChoiceLocked(draft);
}

/** True when the customer row shows a Νέος / Νέο status badge. */
export function canShowCustomerAmkaInlineSearch(
  draft: Pick<
    DraftState,
    | "customerIsCompletelyNew"
    | "lastOrderInfoDateIn"
    | "customerProsEbs"
    | "customerSelectedFromList"
  >,
  customerErpGID: string | null | undefined,
): boolean {
  const isProsEbs = isCustomerProsEbs(draft);
  const selectedFromList = isCustomerSelectedFromList(draft);
  const completelyNew = isCompletelyNewCustomer(draft);
  const isExistingCustomer = !!String(customerErpGID ?? "").trim();

  if (selectedFromList || (!isProsEbs && !completelyNew && isExistingCustomer)) {
    return getCustomerOrderRecencyBadge(draft.lastOrderInfoDateIn) === "Νέο";
  }

  if (isProsEbs) return false;

  return completelyNew || !isExistingCustomer;
}

export function getCustomerSearchResultName(
  customer: Pick<CustomerSearchResult, "pE_NAME" | "tR_Name">,
): string {
  return String(customer.pE_NAME ?? customer.tR_Name ?? "").trim();
}

export function getCustomerSearchResultDisplayName(
  customer: Pick<CustomerSearchResult, "pE_NAME" | "tR_Name">,
): string {
  return getCustomerSearchResultName(customer) || "—";
}

export function formatLastCustomerWebOrderRow(lwo: Record<string, unknown>) {
  const name = String(lwo.customer_name ?? "").trim() || "—";
  const amka = String(lwo.customer_amka ?? "").trim() || "—";
  const city = String(lwo.customer_city ?? "").trim();
  const address = String(lwo.customer_address ?? "").trim();
  const addressLine = [city, address].filter(Boolean).join(" ") || "—";
  return { name, amka, addressLine };
}
