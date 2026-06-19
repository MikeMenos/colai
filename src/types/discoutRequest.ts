import type { DiscountReq_OrderVM } from "@/types/api/schemas";

/** Discount list row — swagger `DiscountReq_OrderVM` plus app-only fields. */
export type DiscountRequest = DiscountReq_OrderVM & {
  uid: string;
  type: string;
  type_descr: string;
  group_EOPPY: string;
  statusId: number;
  kostos: number;
  symmPercentage: number;
  posoSymmetoxis: number;
  posoDiscounted: number;
  calculatedDiscPercent: number;
  isDiscountApproved: number;
  group_EOPPY_id: number;
};