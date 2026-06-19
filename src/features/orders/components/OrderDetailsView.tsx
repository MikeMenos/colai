"use client";

import type { Order } from "@/types/orders";
import { formatUIDate } from "@/lib/utils/date";
import { StatusBadge } from "@/components/ui/StatusBadge";
import OrderDetailsViewCustomerInfo from "../view/OrderDetailsViewCustomerInfo";
import OrderDetailsViewDoctorInfo from "../view/OrderDetailsViewDoctorInfo";
import OrderDetailsViewSystinon from "../view/OrderDetailsViewSystinon";
import OrderDetailsYlikaInfo from "../view/OrderDetailsYlikaInfo";
import OrderDetailsSyntagiInfo from "../view/OrderDetailsSyntagiInfo";

export default function OrderDetailsView({
  order,
  mode,
  value,
}: {
  order: Order;
  mode: "view" | "edit";
  value: Partial<Order>;
}) {
  return (
    <div
      className="d-flex flex-column h-100 gap-3"
      style={{
        minHeight: 0,
        overflowX: "hidden",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
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

      <OrderDetailsViewCustomerInfo order={order} />

      <OrderDetailsViewDoctorInfo order={order} />

      {order.hasOtherSystinonIatroBool && (
        <OrderDetailsViewSystinon order={order} />
      )}

      <OrderDetailsYlikaInfo />

      <OrderDetailsSyntagiInfo />
    </div>
  );
}
