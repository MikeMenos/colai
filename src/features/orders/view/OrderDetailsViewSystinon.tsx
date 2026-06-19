"use client";

import type { Order } from "@/types/orders";
import React from "react";
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from "react-icons/md";

export default function OrderDetailsViewSystinon({ order }: { order: Order; }) {
    const [open, setOpen] = React.useState(true);

    return (
        <div className="app-card p-0">
            <div onClick={() => setOpen(x => !x)}
                className="fw-semibold text-light d-flex justify-content-between align-items-center" style={{
                    backgroundColor: order.doctorSuggested_ErpGID ? "var(--bs-success)" : "var(--bs-danger)",
                    padding: "0.5rem",
                    borderRadius: "0.5rem"
                }}>
                <div>

                    Συστήνων Ιατρός
                    {order.doctorSuggested_ErpGID ? <i className="bi bi-check-lg ms-2"></i> : <i className="bi bi-ban ms-2"></i>}
                </div>
                {open ? <MdOutlineKeyboardArrowUp className="ms-2" /> : <MdOutlineKeyboardArrowDown className="ms-2" />}

            </div>
            {open &&

                <div className="p-3 row g-2">
                    <div className="col-12">
                        <div className="small text-secondary">Ονοματεπώνυμο</div>
                        <div className="fw-medium">{order.doctorSuggested_name}</div>
                    </div>

                    <div className="col-6">
                        <div className="small text-secondary">ΑΜΚΑ</div>
                        <div className="fw-medium">{order.doctorSuggested_amka}</div>
                    </div>

                    <div className="col-6">
                        <div className="small text-secondary">ΑΦΜ</div>
                        <div className="fw-medium">{order.doctorSuggested_afm}</div>
                    </div>
                </div>
            }
        </div>

    );
}
