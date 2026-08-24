"use client";

import type { SellerLookupFieldProps } from "./SellerLookupField.types";

export default function SellerLookupField({
  label,
  name,
  displayValue,
  placeholder = "Επιλέξτε πωλητή…",
  disabled = false,
  isInvalid = false,
  canClear = false,
  onOpen,
  onClear,
  showSearchButton = true,
  openAriaLabel = "Αναζήτηση πωλητή",
  clearAriaLabel = "Επιστροφή στον προεπιλεγμένο πωλητή",
}: SellerLookupFieldProps) {
  return (
    <>
      <div className="text-secondary mb-1" style={{ fontSize: 11 }}>
        {label}
      </div>
      <div className="input-group input-group-sm">
        <input
          type="text"
          readOnly
          name={name}
          className={`form-control${isInvalid ? " is-invalid" : ""}`}
          value={displayValue}
          placeholder={placeholder}
          disabled={disabled}
          onClick={(e) => {
            if (disabled) return;
            e.currentTarget.blur();
            onOpen();
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen();
            }
          }}
          aria-label={label}
          style={{ cursor: disabled ? "default" : "pointer" }}
        />
        {canClear && onClear ? (
          <button
            type="button"
            className="btn btn-outline-secondary"
            aria-label={clearAriaLabel}
            disabled={disabled}
            onClick={onClear}
          >
            <i className="bi bi-x-lg" aria-hidden />
          </button>
        ) : null}
        {showSearchButton ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={onOpen}
            disabled={disabled}
            aria-label={openAriaLabel}
          >
            <i className="bi bi-search" />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onOpen}
            disabled={disabled}
            aria-label={openAriaLabel}
            aria-haspopup="listbox"
          >
            <i className="bi bi-chevron-down" aria-hidden />
          </button>
        )}
      </div>
    </>
  );
}
