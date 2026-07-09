import type { Order } from "@/types/orders";

export function getRetailCustomerPriceBadge(
  order: Order,
  customerSelectedFromList?: boolean | null,
) {
  if (customerSelectedFromList !== true) return "";

  return [order.activitY_DESC, order.prE_LOADED_PRICE]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(" - ");
}

export function isRetailCustomerWithoutPriceBadge(
  order: Order,
  customerSelectedFromList?: boolean | null,
) {
  return !getRetailCustomerPriceBadge(order, customerSelectedFromList);
}
