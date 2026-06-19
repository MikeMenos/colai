import type { OrderAddress, OrderListOfAddressPersons } from "@/types/orders";

export function pickDefaultAddress(
  addresses: OrderAddress[] | undefined,
): OrderAddress | undefined {
  if (!addresses?.length) return undefined;
  return (
    addresses.find((a) => a.isAddressPreselected) ?? addresses[0]
  );
}

export function pickDefaultAddressGid(
  addresses: OrderAddress[] | undefined,
  preferredGid?: string | null,
): string | null {
  if (!addresses?.length) return null;
  const preferred = preferredGid?.trim();
  if (
    preferred &&
    addresses.some((a) => a.address_ErpGID === preferred)
  ) {
    return preferred;
  }
  return pickDefaultAddress(addresses)?.address_ErpGID ?? null;
}

export function pickDefaultPersonRow(
  persons: OrderListOfAddressPersons[],
  preferredPersonGid?: string | null,
): OrderListOfAddressPersons | undefined {
  if (!persons.length) return undefined;
  const preferred = preferredPersonGid?.trim();
  if (preferred) {
    const found = persons.find((p) => p.person_ErpGID === preferred);
    if (found) return found;
  }
  return persons.find((p) => p.isCustomer) ?? persons[0];
}
