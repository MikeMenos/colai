import type {
  ColaiSearchAmkaAddress,
  ColaiSearchAmkaCustomer,
  ColaiSearchAmkaRelatedPerson,
  ColaiSearchAmkaRow,
} from "@/types/api/sqlData";

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function rowKind(
  typos: string,
): "customer_main" | "customer_extra" | "related_main" | "related_extra" | "unknown" {
  const upper = typos.toUpperCase();
  if (upper.includes("CUSTOMER_MAIN_ADDRESS") || upper.startsWith("01")) {
    return "customer_main";
  }
  if (upper.includes("CUSTOMER_EXTRA_ADDRESS") || upper.startsWith("02")) {
    return "customer_extra";
  }
  if (
    upper.includes("CUSTOMER_RELATED_PERSON_MAIN") ||
    upper.startsWith("03")
  ) {
    return "related_main";
  }
  if (
    upper.includes("CUSTOMER_RELATED_PERSON_EXTRA") ||
    upper.startsWith("04")
  ) {
    return "related_extra";
  }
  return "unknown";
}

export function isLastDeliveryAddressStatus(
  statusPerson: unknown,
): boolean {
  return text(statusPerson) !== "*";
}

export function parseTelephoneAll(value: unknown): string[] {
  return text(value)
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
}

function uniquePhones(...values: unknown[]): string[] {
  const phones: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    const candidates =
      typeof value === "string" && value.includes("/")
        ? parseTelephoneAll(value)
        : [text(value)];
    for (const phone of candidates) {
      if (!phone || seen.has(phone)) continue;
      seen.add(phone);
      phones.push(phone);
    }
  }
  return phones;
}

function toAddress(
  row: ColaiSearchAmkaRow,
  isMain: boolean,
): ColaiSearchAmkaAddress {
  const addressGid = text(row.J3) || text(row.fMainAddressGID);
  return {
    key: addressGid || `${text(row.Address1)}-${text(row.fPostalCode)}`,
    addressGid,
    address: text(row.Address1),
    city: text(row.fCityCode),
    postalCode: text(row.fPostalCode),
    telephone: text(row.Telephone1),
    isMain,
    isLastDelivery: isLastDeliveryAddressStatus(row.STATUS_PERSON),
    statusPerson: text(row.STATUS_PERSON),
    row,
  };
}

function upsertAddress(
  addresses: ColaiSearchAmkaAddress[],
  next: ColaiSearchAmkaAddress,
) {
  const idx = addresses.findIndex(
    (address) =>
      (next.addressGid && address.addressGid === next.addressGid) ||
      address.key === next.key,
  );
  if (idx === -1) {
    addresses.push(next);
    return;
  }
  const existing = addresses[idx];
  addresses[idx] = {
    ...existing,
    ...next,
    isMain: existing.isMain || next.isMain,
    isLastDelivery: existing.isLastDelivery || next.isLastDelivery,
  };
}

function sortAddresses(addresses: ColaiSearchAmkaAddress[]) {
  addresses.sort((a, b) => {
    if (a.isLastDelivery !== b.isLastDelivery) {
      return a.isLastDelivery ? -1 : 1;
    }
    if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
    return a.address.localeCompare(b.address, "el");
  });
}

export function groupColaiSearchAmkaRows(
  rows: ColaiSearchAmkaRow[],
): ColaiSearchAmkaCustomer[] {
  const customersByGid = new Map<string, ColaiSearchAmkaCustomer>();
  const relatedByCustomer = new Map<
    string,
    Map<string, ColaiSearchAmkaRelatedPerson>
  >();

  for (const row of rows) {
    const customerGid = text(row.GID) || text(row.J1);
    if (!customerGid) continue;

    let customer = customersByGid.get(customerGid);
    if (!customer) {
      const phones = uniquePhones(
        row.PERSON_MOBILE1_EOPYY,
        row.Telephone1,
        row.TELEPHONE_ALL,
      );
      customer = {
        key: customerGid,
        customerGid,
        traderCode: text(row.TR_CODE),
        traderName: text(row.TR_NAME),
        amka: text(row.AMKA),
        personGid: text(row.TR_PERSON_GID),
        personCode: text(row.PERSON_CODE),
        personName: text(row.PERSON_NAME) || text(row.TR_NAME),
        personAmka: text(row.PERSON_AMKA) || text(row.AMKA),
        taxRegistrationNumber: text(row.TaxRegistrationNumber),
        idCode: text(row.IDCode),
        mobile: text(row.PERSON_MOBILE1_EOPYY),
        telephone: text(row.Telephone1),
        phones,
        certified: text(row.CERTIFIED) === "1",
        addresses: [],
        relatedPersons: [],
      };
      customersByGid.set(customerGid, customer);
      relatedByCustomer.set(customerGid, new Map());
    }

    const kind = rowKind(text(row.TYPOS));

    if (kind === "customer_main" || kind === "customer_extra") {
      // Prefer customer identity fields from main/customer rows.
      if (kind === "customer_main" || !customer.personName) {
        customer.personCode = text(row.PERSON_CODE) || customer.personCode;
        customer.personName =
          text(row.PERSON_NAME) || text(row.TR_NAME) || customer.personName;
        customer.personAmka =
          text(row.PERSON_AMKA) || text(row.AMKA) || customer.personAmka;
        customer.personGid = text(row.TR_PERSON_GID) || customer.personGid;
        customer.taxRegistrationNumber =
          text(row.TaxRegistrationNumber) || customer.taxRegistrationNumber;
        customer.idCode = text(row.IDCode) || customer.idCode;
        customer.mobile = text(row.PERSON_MOBILE1_EOPYY) || customer.mobile;
        customer.telephone = text(row.Telephone1) || customer.telephone;
        customer.phones = uniquePhones(
          customer.mobile,
          customer.telephone,
          row.TELEPHONE_ALL,
          ...customer.phones,
        );
      }
      upsertAddress(
        customer.addresses,
        toAddress(row, kind === "customer_main"),
      );
      continue;
    }

    if (kind === "related_main" || kind === "related_extra") {
      const relatedMap = relatedByCustomer.get(customerGid)!;
      const personGid =
        text(row.J2) || text(row.PERSON_CODE) || text(row.PERSON_AMKA);
      if (!personGid) continue;

      let related = relatedMap.get(personGid);
      if (!related) {
        related = {
          key: personGid,
          personGid,
          personCode: text(row.PERSON_CODE),
          personName: text(row.PERSON_NAME),
          personAmka: text(row.PERSON_AMKA),
          taxRegistrationNumber: text(row.TaxRegistrationNumber),
          idCode: text(row.IDCode),
          mobile: text(row.PERSON_MOBILE1_EOPYY),
          addresses: [],
        };
        relatedMap.set(personGid, related);
      } else if (kind === "related_main") {
        related.personCode = text(row.PERSON_CODE) || related.personCode;
        related.personName = text(row.PERSON_NAME) || related.personName;
        related.personAmka = text(row.PERSON_AMKA) || related.personAmka;
        related.taxRegistrationNumber =
          text(row.TaxRegistrationNumber) || related.taxRegistrationNumber;
        related.idCode = text(row.IDCode) || related.idCode;
        related.mobile = text(row.PERSON_MOBILE1_EOPYY) || related.mobile;
      }

      upsertAddress(
        related.addresses,
        toAddress(row, kind === "related_main"),
      );
    }
  }

  const customers = Array.from(customersByGid.values());
  for (const customer of customers) {
    sortAddresses(customer.addresses);
    const relatedMap = relatedByCustomer.get(customer.customerGid);
    customer.relatedPersons = relatedMap
      ? Array.from(relatedMap.values()).map((related) => {
          sortAddresses(related.addresses);
          return related;
        })
      : [];
    customer.relatedPersons.sort((a, b) =>
      a.personName.localeCompare(b.personName, "el"),
    );
  }

  customers.sort((a, b) => a.traderName.localeCompare(b.traderName, "el"));
  return customers;
}
