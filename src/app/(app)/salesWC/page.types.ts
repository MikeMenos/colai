import type { SellerSalesWC } from "@/types/api";

export type SortMode = "date" | "newrep";

export type SellerOrderDetailsState = {
  loading: boolean;
  error: string | null;
  records: SellerSalesWC[] | null;
};
