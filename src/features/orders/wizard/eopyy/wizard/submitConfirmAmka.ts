import { pickFirstNonBlankString } from "@/lib/utils/string";
import type { Order } from "@/types/orders";
import type { OrderListOfAddressPersons } from "@/types/orders";

function formatOrderAddress(
  address?: string | null,
  city?: string | null,
  tk?: string | null,
): string {
  const parts = [
    pickFirstNonBlankString(address),
    pickFirstNonBlankString(city),
    pickFirstNonBlankString(tk),
  ].filter(Boolean);

  return parts.join(", ");
}

export function getSubmitConfirmAmka(
  draftOrder: Order,
  listAddressesPersons: OrderListOfAddressPersons[],
): string {
  const selectedPerson = listAddressesPersons.find(
    (p) => p.person_ErpGID == draftOrder.person_ErpGID,
  );

  return pickFirstNonBlankString(
    selectedPerson?.personAMKA,
    draftOrder.recipient_amka,
    draftOrder.customer_amka,
  );
}

export function getSubmitConfirmRecipientName(
  draftOrder: Order,
  listAddressesPersons: OrderListOfAddressPersons[],
): string {
  if (draftOrder.has_other_recipient == 1) {
    return pickFirstNonBlankString(draftOrder.recipient_name);
  }

  const selectedPerson = listAddressesPersons.find(
    (p) => p.person_ErpGID == draftOrder.person_ErpGID,
  );

  return pickFirstNonBlankString(
    selectedPerson?.personName,
    draftOrder.customer_name,
  );
}

export function getSubmitConfirmRecipientAddress(
  draftOrder: Order,
  listAddressesPersons: OrderListOfAddressPersons[],
): string {
  if (draftOrder.has_other_recipient == 1) {
    return formatOrderAddress(
      draftOrder.recipient_address,
      draftOrder.recipient_city,
      draftOrder.recipient_tk,
    );
  }

  if (draftOrder.shipTo_other_address == 1) {
    return formatOrderAddress(
      draftOrder.customer_other_address,
      draftOrder.customer_other_city,
      draftOrder.customer_other_tk,
    );
  }

  const selectedPerson = listAddressesPersons.find(
    (p) => p.person_ErpGID == draftOrder.person_ErpGID,
  );
  const selectedAddress =
    selectedPerson?.addresses?.find(
      (address) => address.address_ErpGID == draftOrder.address_ErpGID,
    ) ?? selectedPerson?.addresses?.[0];

  if (selectedAddress) {
    return formatOrderAddress(
      selectedAddress.address,
      selectedAddress.city,
      selectedAddress.tk,
    );
  }

  return formatOrderAddress(
    draftOrder.customer_address,
    draftOrder.customer_city,
    draftOrder.customer_tk,
  );
}

export function getSubmitConfirmSuggestedDoctorName(
  draftOrder: Order,
): string | null {
  if (draftOrder.has_suggested_doctor == 1) {
    return draftOrder.doctor_name ?? null;
  }

  if (draftOrder.has_suggested_doctor == 2) {
    return draftOrder.doctorSuggested_name ?? null;
  }

  return null;
}
