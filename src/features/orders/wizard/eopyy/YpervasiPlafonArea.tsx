"use client";

import { useAppSelector } from "@/store/hooks";
import { formatCurrencyGR } from "@/lib/utils/number";

export default function YpervasiPlafonArea() {
  const data = useAppSelector((state) => state.orders.draft.order);

  return (
    <div className="app-card border-warning-subtle border p-3">
      {/* Header */}
      <div
        style={{ height: 51 }}
        className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2"
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-inline-flex align-items-center justify-content-center bg-warning"
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              background: "rgba(180, 56, 18, 0.22)",
              border: "1px solid rgba(180, 56, 18, 0.22)",
            }}
            aria-hidden
          >
            <i
              className="bi bi-exclamation-octagon-fill"
              style={{ fontSize: "1.05rem" }}
            />
          </div>

          <div className="lh-sm">
            <div className="fw-semibold">ΠΡΟΣΟΧΗ</div>
            <div className="small text-secondary">Υπέρβαση πλαφόν</div>
          </div>
        </div>
      </div>

      <div className="d-flex flex-column gap-2">
        <span>
          {`Τα υλικά της παραγγελίας ανέρχονται στα ${formatCurrencyGR(data.kostos)} €.`}
        </span>
        <span>
          {`Το πλαφόν για την συγκεκριμένη κατηγορία είναι ${formatCurrencyGR(data.maxPosoKostousGiaSymmetoxi)} €.`}
        </span>
      </div>
    </div>
  );
}
