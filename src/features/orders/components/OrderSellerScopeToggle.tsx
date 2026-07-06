"use client";

import type { Props } from "./OrderSellerScopeToggle.types";
import React from "react";export default function OrderSellerScopeToggle({
  allAccounts,
  disabled = false,
  onChange,
}: Props) {
  const label = allAccounts ? "Παραγγελίες ομάδας" : "Οι παραγγελίες μου";
  const title = allAccounts
    ? "Εμφάνιση παραγγελιών ομάδας"
    : "Εμφάνιση δικών μου παραγγελιών";

  return (
    <div className="d-flex align-items-center justify-content-between gap-3 rounded border px-3 py-2">
      <div className="d-flex min-w-0 align-items-center gap-2">
        <i
          className={`bi ${allAccounts ? "bi-people-fill" : "bi-person-fill"} text-primary`}
          aria-hidden
        />
        <span className="fw-semibold">{label}</span>
      </div>

      <div className="form-check form-switch switch-lg m-0 flex-shrink-0">
        <input
          className="form-check-input m-0"
          type="checkbox"
          id="order-seller-scope"
          checked={allAccounts}
          disabled={disabled}
          aria-label={title}
          title={title}
          onChange={(event) => onChange(event.target.checked)}
        />
      </div>
    </div>
  );
}
