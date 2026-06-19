"use client";

import React from "react";
import { removeAIMaterial } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import SwipeToDeleteYliko from "@/components/ui/SwipeToDeleteYliko";
import AIMaterialSelectorModal from "../modals/AIMaterialSelectorModal";
import {
  AIMaterials as AIMaterialsType,
  AIMaterialsErpProducts,
} from "@/types/orders";

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value?: React.ReactNode;
  mono?: boolean;
}) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="d-flex align-items-start justify-content-between gap-3 py-1">
      <div className="small text-secondary fw-semibold">{label}</div>
      <div
        className={`small text-end ${mono ? "font-monospace" : ""}`}
        style={{ maxWidth: "72%" }}
      >
        {value}
      </div>
    </div>
  );
}

export default function AIMaterials() {
  const dispatch = useAppDispatch();
  const aiMaterials = useAppSelector(
    (s: any) => s.orders?.draft?.ai_ylika ?? [],
  );
  const [selectedIDX, setSeletectedIDX] = React.useState<number>(-1);
  const [show, setShow] = React.useState<boolean>(false);
  const [erp_products, set_erp_products] = React.useState<AIMaterialsType>(
    {} as AIMaterialsType,
  );
  const count = aiMaterials.length;

  const handleClickOnRow = (idx: number, aiMaterials: AIMaterialsType) => {
    set_erp_products(aiMaterials);
    setSeletectedIDX(idx);
    setShow(true);
  };

  return (
    <div className="app-card px-3 py-2">
      {/* Header */}
      <AIMaterialSelectorModal
        idx={selectedIDX}
        show={show}
        onClose={() => setShow(false)}
        aiMaterials={erp_products}
      />
      <div
        style={{ height: 51 }}
        className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2"
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-inline-flex align-items-center justify-content-center"
            style={{
              width: 38,
              height: 38,
              borderRadius: 14,
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.22)",
            }}
            aria-hidden
          >
            <i
              className="bi bi-stars"
              style={{ fontSize: "1.05rem", color: "rgb(99,102,241)" }}
            />
          </div>

          <div className="lh-sm">
            <div className="fw-semibold">Υλικά από AI</div>
            <div className="small text-secondary">
              Προτεινόμενα υλικά από την ανάλυση
            </div>
          </div>
        </div>

        <span
          className="badge text-bg-light border"
          style={{ borderRadius: 999 }}
        >
          {count} {count === 1 ? "υλικό" : "υλικά"}
        </span>
      </div>

      <div className="d-flex flex-column gap-2">
        {aiMaterials.map((y: any, idx: number) => {
          const months = Number(y.diarkeia_therapeias_se_mines ?? 0);
          const monthsLabel = months
            ? `${months} ${months > 1 ? "μήνες" : "μήνα"}`
            : null;

          return (
            <SwipeToDeleteYliko
              key={`${y.kodikos_ylikou ?? "m"}-${idx}`}
              onDelete={() => dispatch(removeAIMaterial(idx))}
              deleteAriaLabel="Αφαίρεση υλικού"
            >
              <div
                className="app-card px-3 py-2"
                onClick={() => handleClickOnRow(idx, y)}
              >
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    {/* Title line */}
                    <div className="d-flex align-items-center justify-content-between gap-3">
                      <div style={{ minWidth: 0 }}>
                        <div className="fw-semibold ai-mat-title">
                          {y.perigrafi_ylikou || "—"}
                        </div>
                        <div className="small text-secondary d-flex align-items-center gap-2">
                          <span
                            className="badge text-bg-light border"
                            style={{ borderRadius: 999 }}
                          >
                            <i className="bi bi-upc-scan me-1" />
                            {y.kodikos_ylikou || "—"}
                          </span>
                          {y.anatomiki_perioxi ? (
                            <span className="text-truncate">
                              <i className="bi bi-geo-alt me-1" />
                              {y.anatomiki_perioxi}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="border-top mt-2 pt-2">
                      <Row
                        label="Διάγνωση"
                        value={
                          y.kodikos_diagnosis || y.perigrafi_diagnosis
                            ? `${y.kodikos_diagnosis ?? ""} ${y.perigrafi_diagnosis ?? ""}`.trim()
                            : null
                        }
                      />
                      <Row
                        label="Διάγνωση 2"
                        value={
                          y.kodikos_diagnosis2 || y.perigrafi_diagnosis2
                            ? `${y.kodikos_diagnosis2 ?? ""} ${y.perigrafi_diagnosis2 ?? ""}`.trim()
                            : null
                        }
                      />
                      <Row label="Διάρκεια θεραπείας" value={monthsLabel} />
                      <Row
                        label="Συνολική ποσότητα"
                        value={y.synoliki_posotita_eidous}
                        mono
                      />
                      <Row label="Σχόλια παραγγελίας" value={y.sxolia} />
                    </div>
                  </div>
                </div>
              </div>
            </SwipeToDeleteYliko>
          );
        })}
      </div>
    </div>
  );
}
