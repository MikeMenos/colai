"use client";

import type { Order } from "@/types/orders";
import React from "react";
import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";

export default function OrderDetailsViewSellerComments({
  order,
}: {
  order: Order;
}) {
  const [open, setOpen] = React.useState(true);
  const sellerComments = order.sellerComments?.trim() ?? "";

  if (!sellerComments) return null;

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
        <div>Σχόλια παραγγελίας</div>
        {open ? (
          <MdOutlineKeyboardArrowUp className="ms-2" />
        ) : (
          <MdOutlineKeyboardArrowDown className="ms-2" />
        )}
      </div>
      {open ? (
        <div className="p-3">
          <div className="fw-medium" style={{ whiteSpace: "pre-wrap" }}>
            {sellerComments}
          </div>
        </div>
      ) : null}
    </div>
  );
}
