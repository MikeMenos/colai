import type { DraftState } from "@/store/orders/ordersSlice";
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
  draft: Pick<DraftState, "customerIsCompletelyNew" | "lastOrderInfoDateIn">,
): boolean {
  if (draft.customerIsCompletelyNew === true) return false;
  return !isDateOlderThanMonths(draft.lastOrderInfoDateIn, 4);
}

export function shouldShowSuggestedDoctorChangeToggle(
  draft: Pick<DraftState, "customerIsCompletelyNew" | "lastOrderInfoDateIn">,
  customerErpGID: string | null | undefined,
): boolean {
  if (!String(customerErpGID ?? "").trim()) return false;
  return isSuggestedDoctorChoiceLocked(draft);
}

export function formatLastCustomerWebOrderRow(lwo: Record<string, unknown>) {
  const name = String(lwo.customer_name ?? "").trim() || "—";
  const amka = String(lwo.customer_amka ?? "").trim() || "—";
  const city = String(lwo.customer_city ?? "").trim();
  const address = String(lwo.customer_address ?? "").trim();
  const addressLine = [city, address].filter(Boolean).join(" ") || "—";
  return { name, amka, addressLine };
}
