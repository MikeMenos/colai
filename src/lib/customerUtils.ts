import type { DraftState } from "@/store/orders/ordersSlice";

export function isCompletelyNewCustomer(
  draft: Pick<DraftState, "customerIsCompletelyNew">,
): boolean {
  return draft.customerIsCompletelyNew === true;
}

export function shouldShowSynainesiStep(
  draft: Pick<DraftState, "customerIsCompletelyNew">,
): boolean {
  return isCompletelyNewCustomer(draft);
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

export function formatLastCustomerWebOrderRow(lwo: Record<string, unknown>) {
  const name = String(lwo.customer_name ?? "").trim() || "—";
  const amka = String(lwo.customer_amka ?? "").trim() || "—";
  const city = String(lwo.customer_city ?? "").trim();
  const address = String(lwo.customer_address ?? "").trim();
  const addressLine = [city, address].filter(Boolean).join(" ") || "—";
  return { name, amka, addressLine };
}
