import {
  DEFAULT_LIST_PAGE,
  buildListSearchParams,
  type BaseListQuery,
} from "@/lib/api/listQuery";

export const DEFAULT_DISCOUNT_LIST_PAGE = DEFAULT_LIST_PAGE;
export const DEFAULT_DISCOUNT_LIST_PAGE_SIZE = 20;

export type DiscountListQuery = BaseListQuery & {
  discountstatus?: number;
};

export function buildDiscountListSearchParams(
  query: DiscountListQuery & { _ts?: number } = {},
): URLSearchParams {
  return buildListSearchParams(
    query,
    {
      page: DEFAULT_DISCOUNT_LIST_PAGE,
      pagesize: DEFAULT_DISCOUNT_LIST_PAGE_SIZE,
    },
    { discountstatus: query.discountstatus },
  );
}

export { parsePositiveInt } from "@/lib/api/listQuery";
