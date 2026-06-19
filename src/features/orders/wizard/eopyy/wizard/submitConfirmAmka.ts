import { pickFirstNonBlankString } from "@/lib/utils/string";
import type { Order } from "@/types/orders";
import type { OrderListOfAddressPersons } from "@/types/orders";

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
