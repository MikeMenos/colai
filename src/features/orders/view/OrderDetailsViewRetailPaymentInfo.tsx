"use client";

import type { Order } from "@/types/orders";
import { getPaymentMethodLabel } from "@/lib/utils/paymentMethod";
import React from "react";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";

export default function OrderDetailsViewRetailPaymentInfo({
  order,
}: {
  order: Order;
}) {
  const [open, setOpen] = React.useState(true);
  const paymentMethodLabel = getPaymentMethodLabel(order.isPaid);

  return (
    <div className="app-card p-0">
      <div
        onClick={() => setOpen((x) => !x)}
        className="fw-semibold text-light d-flex justify-content-between align-items-center"
        style={{
          backgroundColor: "var(--bs-primary)",
          padding: "0.5rem",
          borderRadius: "0.5rem",
        }}
      >
        <div>Τρόπος πληρωμής</div>
        {open ? (
          <MdOutlineKeyboardArrowUp className="ms-2" />
        ) : (
          <MdOutlineKeyboardArrowDown className="ms-2" />
        )}
      </div>

      {open ? (
        <div className="p-3 row g-2">
          <div className="col-12">
            <div className="small text-secondary">Επιλογή</div>
            <div className="fw-medium">{paymentMethodLabel ?? "—"}</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
