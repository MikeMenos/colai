"use client";

import type {
  SellerActingLookupModalProps,
  SellerActingLookupOption,
} from "./SellerActingLookupModal.types";
import React from "react";
import { Modal } from "react-bootstrap";
import { normalizeSearchText } from "@/lib/utils/string";

function getOptionSearchText(option: SellerActingLookupOption): string {
  return normalizeSearchText(
    [option.label, option.description, option.value].filter(Boolean).join(" "),
  );
}

export default function SellerActingLookupModal({
  show,
  options,
  value,
  onSelect,
  onClose,
}: SellerActingLookupModalProps) {
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setQ("");
  }, [show]);

  const filteredOptions = React.useMemo(() => {
    const query = normalizeSearchText(q);
    if (!query) return options;
    return options.filter((option) =>
      getOptionSearchText(option).includes(query),
    );
  }, [options, q]);

  return (
    <Modal
      dialogClassName="seller-acting-lookup-modal"
      show={show}
      onHide={onClose}
      centered
      contentClassName="premium-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="h6 mb-0">Επιλογή πωλητή</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex gap-2">
          <input
            ref={inputRef}
            className="form-control"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Αναζήτηση πωλητή…"
            inputMode="search"
            autoFocus
            autoComplete="off"
            spellCheck={false}
            aria-label="Αναζήτηση πωλητή"
          />
        </div>

        <div className="modal-results mt-3">
          {filteredOptions.length ? (
            <div className="list-group">
              {filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className="list-group-item list-group-item-action"
                    onClick={() => {
                      onSelect(option.value);
                      onClose();
                    }}
                  >
                    <div className="d-flex align-items-start justify-content-between gap-2">
                      <div className="min-w-0">
                        <div className="fw-semibold text-break">
                          {option.label.trim() || option.value}
                        </div>
                        {option.description ? (
                          <div className="small text-secondary text-break">
                            {option.description}
                          </div>
                        ) : null}
                      </div>
                      {isSelected ? (
                        <i className="bi bi-check2 flex-shrink-0" aria-hidden />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-secondary small py-3 text-center">
              Δεν βρέθηκαν αποτελέσματα.
            </div>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
}
