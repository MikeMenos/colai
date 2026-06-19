import { useAppSelector } from "@/store/hooks";

const statusB: Record<"0" | "1" | "200" | "500", { variant: string }> = {
  "0": { variant: "warning" },
  "1": { variant: "primary" },
  "200": { variant: "success" },
  "500": { variant: "danger" },
};
export function StatusBadge({ status }: { status: number; }) {
  const key = String(status) as keyof typeof statusB;
  const variant = statusB[key]?.variant || "secondary";
  const orderStatuses = useAppSelector((s) => s.staticData.list_Order_Statuses)
  const name = orderStatuses.find((s) => s.value == String(status))?.text || status;

  return (
    <span
      className={`badge bg-${variant}`}
      style={{ letterSpacing: "0.02em" }}
    >
      {name}
    </span>
  );
}
