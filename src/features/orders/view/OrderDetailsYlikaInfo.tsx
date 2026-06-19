"use client";

import { useAppSelector } from "@/store/hooks";
import type { Order } from "@/types/orders";
import React from "react";
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from "react-icons/md";

export default function OrderDetailsYlikaInfo() {
    const [open, setOpen] = React.useState(true);
    const ylika = useAppSelector((s) => s.orders.selected?.ylika || []);

    return (
        <div className="app-card p-0">
            <div onClick={() => setOpen(x => !x)}
                className="fw-semibold text-light d-flex justify-content-between align-items-center" style={{
                    backgroundColor: "var(--bs-success)",
                    padding: "0.5rem",
                    borderRadius: "0.5rem"
                }}>
                <div>

                    Υλικά
                    <i className="bi bi-check-lg ms-2"></i>
                </div>
                {open ? <MdOutlineKeyboardArrowUp className="ms-2" /> : <MdOutlineKeyboardArrowDown className="ms-2" />}

            </div>
            {open &&
                ylika.map((y, idx) => (
                    <div key={idx} className="p-3" style={{ borderRadius: 0, borderTop: "1px solid var(--app-surface-border)" }}>
                        <div className="d-flex align-items-start justify-content-between gap-3">
                            <div className="flex-grow-1">
                                <span className="badge bg-secondary-subtle text-secondary ms-0">
                                    {y.erpCode}
                                </span>
                                <div className="d-flex align-items-center">
                                    <div className="fw-semibold" style={{ lineHeight: 1.2 }}>
                                        {y.erpName}
                                    </div>
                                </div>
                            </div>

                            <div className="text-end" style={{ maxWidth: 60, minWidth: 60 }}>
                                <input
                                    className="form-control text-center"
                                    inputMode="numeric"
                                    value={String(y.qty ?? "")}
                                    readOnly
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                ))
            }
        </div>

    );
}
