"use client";

import type { Order } from "@/types/orders";
import type { WcStoixoiMina } from "@/types/dashboard";
import { aggregateLastOrdersByDay, type DayOrderBucket } from "@/features/home/dashboard/aggregateLastOrdersByDay";
import { formatCurrencyGR, formatIntGR } from "@/lib/utils/number";
import React from "react";

/** Donut + stacked bar: νέες vs επαναλήψεις (WC μήνας). */
export function WcDistributionCharts({ wc }: { wc: WcStoixoiMina }) {
    const newC = Math.max(0, wc.count_paragg_new);
    const repC = Math.max(0, wc.count_paragg_repeat);
    const total = newC + repC;
    const pNew = total > 0 ? (newC / total) * 100 : 0;
    const pRep = total > 0 ? (repC / total) * 100 : 0;
    const degNew = total > 0 ? (newC / total) * 360 : 0;

    return (
        <div className="mt-3">
            <div
                className="position-relative mx-auto mb-3"
                style={{ width: 132, height: 132 }}
                role="img"
                aria-label={`Κατανομή παραγγελιών: νέες ${newC}, επαναλήψεις ${repC}`}
            >
                <div
                    className="rounded-circle"
                    style={{
                        width: "100%",
                        height: "100%",
                        background:
                            total === 0
                                ? "var(--bs-secondary-bg-subtle)"
                                : `conic-gradient(from -90deg, rgba(var(--bs-primary-rgb), 0.95) 0deg ${degNew}deg, rgba(var(--bs-info-rgb), 0.92) ${degNew}deg 360deg)`,
                    }}
                />
                <div
                    className="position-absolute top-50 start-50 translate-middle rounded-circle d-flex align-items-center justify-content-center bg-body border"
                    style={{
                        width: "58%",
                        height: "58%",
                        borderColor: "var(--bs-border-color-translucent)",
                    }}
                >
                    <span className="small fw-bold text-body">{formatIntGR(total)}</span>
                </div>
            </div>

            <div
                className="rounded-pill overflow-hidden d-flex mb-2"
                style={{ height: 10 }}
                role="presentation"
                aria-hidden
            >
                <div className="bg-primary h-100" style={{ width: `${pNew}%`, minWidth: total > 0 && newC > 0 ? 2 : 0 }} />
                <div className="bg-info h-100" style={{ width: `${pRep}%`, minWidth: total > 0 && repC > 0 ? 2 : 0 }} />
            </div>

            <div className="d-flex flex-wrap justify-content-between gap-2 small">
                <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle bg-primary flex-shrink-0" style={{ width: 8, height: 8 }} />
                    <span className="text-secondary">Νέες</span>
                    <span className="fw-semibold text-body">{formatIntGR(newC)}</span>
                    <span className="text-secondary">({formatCurrencyGR(wc.amount_paragg_new)}€)</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <span className="rounded-circle bg-info flex-shrink-0" style={{ width: 8, height: 8 }} />
                    <span className="text-secondary">Επαναλήψεις</span>
                    <span className="fw-semibold text-body">{formatIntGR(repC)}</span>
                    <span className="text-secondary">({formatCurrencyGR(wc.amount_paragg_repeat)}€)</span>
                </div>
            </div>
        </div>
    );
}

function buildBarsPath(buckets: DayOrderBucket[], w: number, h: number, padX: number, padY: number): { bars: React.ReactNode; max: number } {
    const max = Math.max(1, ...buckets.map((b) => b.count));
    const innerW = w - padX * 2;
    const innerH = h - padY * 2;
    const gap = 2;
    const n = buckets.length;
    const barW = Math.max(3, (innerW - gap * (n - 1)) / n);

    const bars = buckets.map((b, i) => {
        const x = padX + i * (barW + gap);
        const bh = b.count > 0 ? Math.max(4, (b.count / max) * innerH) : 0;
        const y = padY + innerH - bh;
        return <rect key={b.key} x={x} y={y} width={barW} height={bh || 1} rx={2} fill="var(--bs-primary)" opacity={b.count ? 0.85 : 0.12} />;
    });

    return { bars, max };
}

/** Daily counts from `lastOrders` over the trailing window. */
export function RecentOrdersByDayChart({ orders }: { orders: Order[] }) {
    const buckets = React.useMemo(() => aggregateLastOrdersByDay(orders, 14), [orders]);
    const totalHits = buckets.reduce((s, b) => s + b.count, 0);

    if (orders.length === 0) {
        return (
            <div className="small text-secondary text-center py-2">Δεν υπάρχουν πρόσφατες παραγγελίες για γράφημα.</div>
        );
    }

    const w = 320;
    const h = 112;
    const padX = 8;
    const padY = 8;
    const { bars, max } = buildBarsPath(buckets, w, h, padX, padY);

    const labelEvery = buckets.length > 10 ? 2 : 1;

    return (
        <div className="mt-2">
            <svg
                width="100%"
                height={h + 28}
                viewBox={`0 0 ${w} ${h + 28}`}
                role="img"
                aria-label={`Κατανομή ${totalHits} πρόσφατων παραγγελιών ανά ημέρα`}
            >
                {bars}
                {buckets.map((b, i) => {
                    if (i % labelEvery !== 0) return null;
                    const innerW = w - padX * 2;
                    const gap = 2;
                    const n = buckets.length;
                    const barW = Math.max(3, (innerW - gap * (n - 1)) / n);
                    const x = padX + i * (barW + gap) + barW / 2;
                    return (
                        <text
                            key={`lbl-${b.key}`}
                            x={x}
                            y={h + 14}
                            textAnchor="middle"
                            style={{ fontSize: 9, fill: "var(--bs-secondary-color)" }}
                        >
                            {b.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}
