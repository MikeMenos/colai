"use client";

import React from "react";
import { Modal } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import AppLoader from "@/components/ui/AppLoader";
import { hasText, trimmedString } from "@/lib/utils/string";
import type { AddressDto, ErpContact } from "@/types/api";
import type { SearchErpContactsApiResponse } from "@/types/api/responses";
import { parseJson } from "@/lib/api/client";

export type ErpContactAddress = AddressDto & {
  address_ErpGID: string;
  address: string;
  city: string;
  tk: string;
};

export type { ErpContact };

export default function ErpContactsLookupModal({
  show,
  onClose,
  person_GID = "",
  address_GID = "",
}: {
  show: boolean;
  onClose: () => void;
  person_GID?: string;
  address_GID?: string;
}) {
  const dispatch = useAppDispatch();
  const draftOrder = useAppSelector((s) => s.orders.draft.order);
  const [q, setQ] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<ErpContact[]>([]);
  const [hasSearched, setHasSearched] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setQ("");
    setResults([]);
    setError(null);
    setHasSearched(false);
    setLoading(false);
  }, [show]);

  async function search() {
    inputRef.current?.blur();
    const searchField = q.trim();

    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const params = new URLSearchParams();
      params.set("searchField", searchField);
      if (person_GID) params.set("person_GID", person_GID);
      if (address_GID) params.set("address_GID", address_GID);

      const res = await fetch(
        `/api/search-erp-contacts?${params.toString()}&_ts=${Date.now()}`,
        {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
        },
      );
      const data = await parseJson<SearchErpContactsApiResponse>(res);

      if (!res.ok || !data?.isSuccess) {
        throw new Error(data?.message || data?.errorMessage || "Search failed");
      }

      setResults(data.contacts ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  function applyContact(c: ErpContact, address?: AddressDto) {
    const addr =
      address ??
      c.addresses?.find((a) => a.isAddressPreselected) ??
      c.addresses?.[0];

    // Overwrite recipient form fields with selected contact values
    dispatch(
      setDraftProperty({
        key: "recipient_ErpContact_PersonGID",
        value: c.person_ErpGID,
      }),
    );
    dispatch(
      setDraftProperty({
        key: "recipient_ErpContact_AddressGID",
        value: addr?.address_ErpGID ?? null,
      }),
    );
    dispatch(setDraftProperty({ key: "recipient_ErpGID", value: null }));
    dispatch(setDraftProperty({ key: "person_ErpGID", value: null }));
    dispatch(setDraftProperty({ key: "address_ErpGID", value: null }));
    dispatch(
      setDraftProperty({ key: "recipient_name", value: c.personName ?? "" }),
    );
    dispatch(
      setDraftProperty({ key: "recipient_amka", value: c.personAMKA ?? "" }),
    );
    dispatch(
      setDraftProperty({
        key: "recipient_afm",
        value: c.personVatNumber ?? "",
      }),
    );
    const idTrim = trimmedString(c.personIDCode);
    const passTrim = trimmedString(c.personPassport);
    const recipientPassport = idTrim || passTrim;
    dispatch(
      setDraftProperty({
        key: "recipient_passport",
        value: recipientPassport,
      }),
    );
    dispatch(
      setDraftProperty({
        key: "recipient_address",
        value: addr?.address ?? "",
      }),
    );
    dispatch(
      setDraftProperty({ key: "recipient_city", value: addr?.city ?? "" }),
    );
    dispatch(setDraftProperty({ key: "recipient_tk", value: addr?.tk ?? "" }));

    const customerAmka = trimmedString(draftOrder.customer_amka);
    const sameAmkaAsCustomer =
      hasText(customerAmka) &&
      customerAmka === trimmedString(c.personAMKA);

    dispatch(setDraftProperty({ key: "shouldUpdateRecipientInfos", value: 1 }));
    dispatch(
      setDraftProperty({
        key: "updateRecipient_afm",
        value: sameAmkaAsCustomer ? null : c.personVatNumber ?? "",
      }),
    );
    dispatch(
      setDraftProperty({
        key: "updateRecipient_passport",
        value: recipientPassport,
      }),
    );
    dispatch(setDraftProperty({ key: "updateRecipient_mobile", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_address", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_tk", value: null }));
    dispatch(setDraftProperty({ key: "updateRecipient_amka", value: null }));

    dispatch(setDraftProperty({ key: "recipient_from_erp_lookup", value: 1 }));
    onClose();
  }

  return (
    <Modal
      dialogClassName="modal-grow-scroll"
      show={show}
      onHide={onClose}
      centered
      contentClassName="premium-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="h6 mb-0">Αναζήτηση σε πελατολόγιο</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex gap-2">
          <input
            ref={inputRef}
            className="form-control"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="π.χ. όνομα, ΑΜΚΑ, ΑΦΜ"
            inputMode="search"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") search();
            }}
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={search}
            disabled={q.trim().length < 2 || loading}
          >
            <i className="bi bi-search" />
          </button>
        </div>

        {error ? (
          <div className="alert alert-danger small mt-3 mb-0 py-2">{error}</div>
        ) : null}

        <div className="modal-results mt-3">
          {loading ? (
            <AppLoader label="Αναζήτηση…" card={false} />
          ) : results.length ? (
            <div className="list-group">
              {results.map((r) => (
                <div key={r.person_ErpGID} className="list-group-item">
                  <button
                    type="button"
                    className="list-group-item-action w-100 border-0 bg-transparent p-0 text-start"
                    onClick={() => applyContact(r)}
                  >
                    <div className="fw-semibold">
                      {r.personName || r.textDisplay || "—"}
                    </div>
                    <div className="small text-secondary">
                      AMKA: {r.personAMKA || "—"} | ΑΦΜ:{" "}
                      {r.personVatNumber || "—"}
                    </div>
                  </button>
                  {r.addresses && r.addresses.length > 1 && (
                    <div className="border-start mt-2 ps-2">
                      {r.addresses.map((a) => (
                        <button
                          key={a.address_ErpGID}
                          type="button"
                          className="btn btn-sm btn-outline-secondary d-block mb-1 w-100 text-start"
                          onClick={() => applyContact(r, a)}
                        >
                          <span className="small">
                            {a.address}, {a.city}, {a.tk}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="text-secondary small py-3 text-center">
              Δεν υπάρχουν αποτελέσματα.
            </div>
          ) : null}
        </div>
      </Modal.Body>
    </Modal>
  );
}
