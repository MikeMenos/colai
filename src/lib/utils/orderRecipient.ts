import type { Order } from "@/types/orders";

function text(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

export function hasOrderRecipientInfo(order: Partial<Order>): boolean {
  return [
    order.has_other_recipient == 1 ? "1" : "",
    order.recipient_name,
    order.recipient_relation,
    order.recipient_reason,
    order.recipient_passport,
    order.recipient_amka,
    order.recipient_afm,
    order.recipient_mobile,
    order.recipient_mobile2,
    order.recipient_tel,
    order.recipient_address,
    order.recipient_city,
    order.recipient_tk,
    order.recipient_Notes,
  ].some((value) => text(value) !== "");
}

export function formatRecipientAddress(order: Partial<Order>): string {
  return [order.recipient_address, order.recipient_city, order.recipient_tk]
    .map(text)
    .filter(Boolean)
    .join(", ");
}

export function formatRecipientContact(order: Partial<Order>): string {
  return [order.recipient_mobile, order.recipient_mobile2, order.recipient_tel]
    .map(text)
    .filter(Boolean)
    .join(" / ");
}
