import { useAppSelector } from "@/store/hooks";

const statusB: Record<"-1" | "0" | "1" | "2", { variant: string }> = {
    "-1": { variant: "secondary" },
    "0": { variant: "danger" },
    "1": { variant: "success" },
    "2": { variant: "success" },
};
export function DiscountRequestStatusBadge({ status }: { status: number; }) {
    const key = String(status) as keyof typeof statusB;
    const variant = statusB[key]?.variant || "secondary";
    const discountStatuses = useAppSelector((s) => s.staticData.list_Discount_Statuses)
    const name = discountStatuses.find((v) => v.value == String(status))?.text ?? status

    return (
        <span
            className={`badge bg-${variant}`}
            style={{ letterSpacing: "0.02em" }}
        >
            {name}
        </span>
    );
}
