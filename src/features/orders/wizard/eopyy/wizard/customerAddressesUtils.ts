import { normalizeAmka } from "@/lib/utils/amka";
import { pickFirstNonBlankString } from "@/lib/utils/string";
import type { OrderListOfAddressPersons } from "@/types/orders";

export function findAddressPersonByAmka(
  addresses: OrderListOfAddressPersons[],
  customerAmka: string,
): OrderListOfAddressPersons | undefined {
  const target = normalizeAmka(customerAmka);
  if (!target) return undefined;

  const customerMatch = addresses.find(
    (person) =>
      person.isCustomer && normalizeAmka(person.personAMKA) === target,
  );
  if (customerMatch) return customerMatch;

  return addresses.find(
    (person) => normalizeAmka(person.personAMKA) === target,
  );
}

export function getCustomerPassportFromAddressPerson(
  person: OrderListOfAddressPersons | undefined,
): string {
  if (!person) return "";
  return pickFirstNonBlankString(person.personIDCode, person.personPassport);
}

export function getCustomerMobileFromAddressPerson(
  person: OrderListOfAddressPersons | undefined,
): string {
  if (!person) return "";
  return pickFirstNonBlankString(person.personMobile1, person.personMobile);
}
