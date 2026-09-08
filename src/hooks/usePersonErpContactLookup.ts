"use client";

import React from "react";

import { parseProxyJson } from "@/lib/api/client";
import { buildAddressDisplayLine, buildAddressMapQuery } from "@/lib/utils/address";
import type { PostWcSearchAmkaResponse } from "@/types/api";
import type {
  ColaiSearchAmkaAddress,
  ColaiSearchAmkaCustomer,
  ColaiSearchAmkaRow,
} from "@/types/api/sqlData";

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function formatContactPhones(
  mobile?: string,
  telephone?: string,
  phones?: string[],
): string {
  const fromArray = (phones ?? []).map(text).filter(Boolean);
  if (fromArray.length > 0) {
    return [...new Set(fromArray)].join(" / ");
  }
  return [...new Set([mobile, telephone].map(text).filter(Boolean))].join(" / ");
}

function addressPartsFromList(
  addresses: ColaiSearchAmkaAddress[],
): { address: string; addressMapQuery: string } {
  const main = addresses.find((entry) => entry.isMain) ?? addresses[0];
  if (!main) return { address: "", addressMapQuery: "" };

  return {
    address: buildAddressDisplayLine(main.address, main.city, main.postalCode),
    addressMapQuery: buildAddressMapQuery(
      main.address,
      main.postalCode,
      main.city,
    ),
  };
}

function addressPartsFromRows(
  rows: ColaiSearchAmkaRow[],
  personErpGid: string,
): { address: string; addressMapQuery: string } {
  const gid = text(personErpGid);
  const row =
    rows.find(
      (entry) =>
        text(entry.J2) === gid ||
        text(entry.TR_PERSON_GID) === gid ||
        text(entry.PERSON_CODE) === gid,
    ) ?? rows[0];

  if (!row) return { address: "", addressMapQuery: "" };

  const street = text(row.Address1);
  const city = text(row.fCityCode);
  const postalCode = text(row.fPostalCode);

  return {
    address: buildAddressDisplayLine(street, city, postalCode),
    addressMapQuery: buildAddressMapQuery(street, postalCode, city),
  };
}

function extractPersonErpContact(
  customer: ColaiSearchAmkaCustomer,
  rows: ColaiSearchAmkaRow[],
  personErpGid: string,
): PersonErpContactInfo {
  const gid = text(personErpGid);
  const related = customer.relatedPersons.find(
    (person) =>
      text(person.personGid) === gid || text(person.personCode) === gid,
  );

  const amka = related
    ? text(related.personAmka)
    : text(customer.personAmka) || text(customer.amka);
  const phone = related
    ? formatContactPhones(related.mobile)
    : formatContactPhones(
        customer.mobile,
        customer.telephone,
        customer.phones,
      );
  const fromList = addressPartsFromList(related?.addresses ?? customer.addresses);
  const addressParts = fromList.address
    ? fromList
    : addressPartsFromRows(rows, gid);

  return {
    amka,
    phone,
    address: addressParts.address,
    addressMapQuery: addressParts.addressMapQuery,
  };
}

export interface PersonErpContactInfo {
  amka: string;
  phone: string;
  address: string;
  addressMapQuery: string;
}

export function usePersonErpContactLookup(
  personErpGid: string | null | undefined,
  enabled: boolean,
): {
  contact: PersonErpContactInfo | null;
  loading: boolean;
  error: string | null;
} {
  const [contact, setContact] = React.useState<PersonErpContactInfo | null>(
    null,
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const gid = text(personErpGid);
    if (!enabled || !gid) {
      setContact(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void (async () => {
      try {
        const res = await fetch("/api/wc/search-amka", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ typos: "PERSON_GID", sea: gid }),
          cache: "no-store",
        });
        const response = await parseProxyJson<PostWcSearchAmkaResponse>(
          res,
          "Αποτυχία φόρτωσης στοιχείων παραλήπτη",
        );
        if (!response.ok) {
          throw new Error(
            response.message || "Αποτυχία φόρτωσης στοιχείων παραλήπτη",
          );
        }

        const customer = response.customers?.[0] ?? null;
        if (cancelled) return;

        if (!customer) {
          setContact(null);
          return;
        }

        const contactInfo = extractPersonErpContact(
          customer,
          response.rows ?? [],
          gid,
        );
        setContact(
          contactInfo.amka || contactInfo.phone || contactInfo.address
            ? contactInfo
            : null,
        );
      } catch (err) {
        if (cancelled) return;
        setContact(null);
        setError(
          err instanceof Error
            ? err.message
            : "Αποτυχία φόρτωσης στοιχείων παραλήπτη",
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [personErpGid, enabled]);

  return { contact, loading, error };
}
