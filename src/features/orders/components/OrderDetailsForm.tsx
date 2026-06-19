"use client";

import React from "react";
import type { Order } from "@/types/orders";
import { formatUIDate } from "@/lib/utils/date";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function OrderDetailsForm({
  order,
  mode,
  value,
  onChange,
}: {
  order: Order;
  mode: "view" | "edit";
  value: Partial<Order>;
  onChange: (patch: Partial<Order>) => void;
}) {
  const disabled = mode === "view";

  return (
    <div className="d-flex flex-column gap-3">
      <div className="app-card px-3 py-2">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="fw-semibold">{order.barcode}</div>
            <div className="small text-secondary mt-1">
              #{order.id} • {formatUIDate(order.dateIn)} • {order.customer_name}
            </div>
          </div>
          <div className="text-end">
            <StatusBadge status={order.statusId} />
            <div className="small text-secondary mt-1">
              Υλικά: {order.countYlika}
            </div>
          </div>
        </div>
      </div>

      <div className="app-card px-3 py-2">
        <div className="fw-semibold mb-2">Στοιχεία Πελάτη/Ασθενή</div>

        <div className="row g-2">
          <div className="col-12">
            <div className="small text-secondary">Ονοματεπώνυμο</div>
            <div className="fw-medium">{order.customer_name}</div>
          </div>

          <div className="col-12">
            <div className="small text-secondary">ΑΜΚΑ</div>
            <div className="fw-medium">{order.customer_amka}</div>
          </div>

          <div className="col-12">
            <label className="form-label small text-secondary mb-1">
              Τηλέφωνο
            </label>
            <input
              className="form-control"
              disabled={disabled}
              value={(value.customer_tel ?? order.customer_tel) || ""}
              onChange={(e) => onChange({ customer_tel: e.target.value })}
            />
          </div>

          <div className="col-12">
            <label className="form-label small text-secondary mb-1">
              Email
            </label>
            <input
              className="form-control"
              disabled={disabled}
              value={(value.customer_email ?? order.customer_email) || ""}
              onChange={(e) => onChange({ customer_email: e.target.value })}
            />
          </div>

          <div className="col-12">
            <label className="form-label small text-secondary mb-1">
              Διεύθυνση
            </label>
            <input
              className="form-control"
              disabled={disabled}
              value={(value.customer_address ?? order.customer_address) || ""}
              onChange={(e) => onChange({ customer_address: e.target.value })}
            />
          </div>

          <div className="col-8">
            <label className="form-label small text-secondary mb-1">Πόλη</label>
            <input
              className="form-control"
              disabled={disabled}
              value={(value.customer_city ?? order.customer_city) || ""}
              onChange={(e) => onChange({ customer_city: e.target.value })}
            />
          </div>
          <div className="col-4">
            <label className="form-label small text-secondary mb-1">ΤΚ</label>
            <input
              className="form-control"
              disabled={disabled}
              value={(value.customer_tk ?? order.customer_tk) || ""}
              onChange={(e) => onChange({ customer_tk: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="app-card px-3 py-2">
        <div className="fw-semibold mb-2">Ιατρός</div>
        <div className="small text-secondary">Ονοματεπώνυμο</div>
        <div className="fw-medium">{order.doctor_name}</div>
        <div className="small text-secondary mt-2">ΑΜΚΑ</div>
        <div className="fw-medium">{order.doctor_amka}</div>
      </div>

      <div className="app-card px-3 py-2">
        <div className="fw-semibold mb-2">Σχόλια παραγγελίας</div>
        <textarea
          className="form-control"
          rows={2}
          disabled={disabled}
          value={(value.sellerComments ?? order.sellerComments) || ""}
          onChange={(e) => onChange({ sellerComments: e.target.value })}
        />
      </div>

      <div className="app-card px-3 py-2">
        <div className="fw-semibold mb-2">Παράδοση</div>

        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            disabled={disabled}
            checked={Boolean(
              (value.deliveryMorning ?? order.deliveryMorning) ? 1 : 0,
            )}
            onChange={(e) =>
              onChange({ deliveryMorning: e.target.checked ? 1 : 0 } as any)
            }
            id="deliveryMorning"
          />
          <label className="form-check-label" htmlFor="deliveryMorning">
            Παράδοση πρωί
          </label>
        </div>

        <div className="form-check form-switch mt-2">
          <input
            className="form-check-input"
            type="checkbox"
            disabled={disabled}
            checked={Boolean(
              (value.deliverySunday ?? order.deliverySunday) ? 1 : 0,
            )}
            onChange={(e) =>
              onChange({ deliverySunday: e.target.checked ? 1 : 0 } as any)
            }
            id="deliverySunday"
          />
          <label className="form-check-label" htmlFor="deliverySunday">
            Παράδοση Κυριακή
          </label>
        </div>
      </div>
    </div>
  );
}
