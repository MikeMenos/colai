"use client";

import { formatUIDate } from "@/lib/utils/date";
import { useAppSelector } from "@/store/hooks";
import type { OrderFile } from "@/types/orders";
import React from "react";
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from "react-icons/md";
import { isDocumentCategory } from "@/lib/utils/order";
import { OrderFilePreviewButtons, ORDER_FILE_PREVIEW_BUTTON_STYLE } from "@/components/ui/OrderFilePreviewButton";

export default function OrderDetailsSyntagiInfo() {
  const [open, setOpen] = React.useState(true);
  const order = useAppSelector((s) => s.orders.selected?.order);
  const files = useAppSelector((s) => s.orders.selected?.files ?? []) as OrderFile[];
  const recipeFiles = files.filter((f) => isDocumentCategory(f, "recipe"));

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
        <div>Συνταγή</div>
        {open ? (
          <MdOutlineKeyboardArrowUp className="ms-2" />
        ) : (
          <MdOutlineKeyboardArrowDown className="ms-2" />
        )}
      </div>

      {open ? (
        <div className="p-3 row g-2">
          <div className="col-6">
            <div className="small text-secondary">Barcode</div>
            <div className="fw-medium">{order?.barcode}</div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">Ημ/νία συνταγής</div>
            <div className="fw-medium">{formatUIDate(order?.dateOfSyntagi)}</div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">Ισχύς από</div>
            <div className="fw-medium">{formatUIDate(order?.dateIsxyeiApo)}</div>
          </div>

          <div className="col-6">
            <div className="small text-secondary">Έως</div>
            <div className="fw-medium">{formatUIDate(order?.dateIsxyeiEos)}</div>
          </div>

          <div className="col-12">
            <div className="small text-secondary">Κατηγορία παροχής</div>
            <div className="fw-medium">{order?.katigoriaParoxis}</div>
          </div>

          <div className="col-12">
            <div className="small text-secondary">Διάγνωση</div>
            <div className="fw-medium">
              {order?.eoppy_Diagnosi_Code} - {order?.eoppy_Diagnosi_Name}
            </div>
          </div>

          <div className="col-12">
            <div className="small text-secondary">Διάγνωση 2</div>
            <div className="fw-medium">
              {order?.eoppy_Diagnosi2_Code} - {order?.eoppy_Diagnosi2_Name}
            </div>
          </div>

          {recipeFiles.length > 0 ? (
            <div className="col-12">
              <div className="small text-secondary mb-2">Γνωμάτευση</div>
              <OrderFilePreviewButtons
                files={recipeFiles}
                style={ORDER_FILE_PREVIEW_BUTTON_STYLE}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
