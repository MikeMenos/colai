import type { Order } from "@/types/orders";

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function dayKey(d: Date): string {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export type DayOrderBucket = {
    key: string;
    /** Short label e.g. 25/3 */
    label: string;
    count: number;
};

/**
 * Buckets `lastOrders` into the last `trailingDays` calendar days (local time).
 */
export function aggregateLastOrdersByDay(orders: Order[], trailingDays = 14): DayOrderBucket[] {
    const end = new Date();
    end.setHours(0, 0, 0, 0);

    const slots: DayOrderBucket[] = [];
    for (let i = trailingDays - 1; i >= 0; i--) {
        const d = new Date(end);
        d.setDate(d.getDate() - i);
        slots.push({
            key: dayKey(d),
            label: `${d.getDate()}/${d.getMonth() + 1}`,
            count: 0,
        });
    }

    const byKey = new Map(slots.map((s) => [s.key, s]));

    for (const o of orders) {
        if (!o.dateIn) continue;
        const dt = new Date(o.dateIn);
        if (Number.isNaN(dt.getTime())) continue;
        dt.setHours(0, 0, 0, 0);
        const k = dayKey(dt);
        const slot = byKey.get(k);
        if (slot) slot.count += 1;
    }

    return slots;
}
