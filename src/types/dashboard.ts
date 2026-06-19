import type { DashboardVM, StoxoiMina } from "@/types/api/schemas";
import type { Order } from "@/types/orders";

export type WcStoixoiMina = StoxoiMina;

/** Payload from `GET /api/dashboard` (mirrors backend `DashboardVM`). */
export type DashboardData = Pick<
  DashboardVM,
  | "totalOrders_month"
  | "totalOrders_prev_month"
  | "totalOrders_month_perc"
  | "pendingReviews"
  | "next10DaysSyntages"
  | "wC_stoixoi_mina"
> & {
  lastOrders: Order[];
};
