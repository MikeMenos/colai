"use client";

import type { ColaiSearchAmkaCustomer } from "@/types/api/sqlData";

export default function PelatologioCustomerCard({
  customer,
  onOpen,
}: {
  customer: ColaiSearchAmkaCustomer;
  onOpen: (customer: ColaiSearchAmkaCustomer) => void;
}) {
  const name = customer.traderName || customer.personName || "—";
  const amka = customer.amka || customer.personAmka;
  const phone = customer.phones[0] || customer.mobile || customer.telephone;

  return (
    <button
      type="button"
      className="app-card d-flex align-items-center justify-content-between gap-3 text-start w-100 p-3"
      onClick={() => onOpen(customer)}
      aria-label={`Άνοιγμα στοιχείων για ${name}`}
      style={{
        border: "1px solid var(--bs-border-color-translucent)",
        background: "var(--bs-body-bg)",
        cursor: "pointer",
        overflow: "hidden",
      }}
    >
      <div className="flex-grow-1 min-w-0 overflow-hidden">
        <div
          className="fw-semibold text-truncate"
          title={name}
          style={{ display: "block" }}
        >
          {name}
        </div>
        <div className="small text-secondary text-truncate mt-1">
          {amka ? `ΑΜΚΑ: ${amka}` : "ΑΜΚΑ: —"}
        </div>
        <div className="small text-secondary text-truncate">
          {phone ? `Τηλ: ${phone}` : "Τηλ: —"}
        </div>
      </div>

      <div
        className="d-inline-flex align-items-center justify-content-center text-secondary flex-shrink-0"
        style={{
          width: 32,
          height: 32,
          borderRadius: 999,
          background: "rgba(var(--bs-secondary-rgb), .08)",
          border: "1px solid var(--bs-border-color-translucent)",
        }}
        aria-hidden
      >
        <i className="bi bi-chevron-right" style={{ fontSize: 14 }} />
      </div>
    </button>
  );
}
