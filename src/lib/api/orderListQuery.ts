import {
  DEFAULT_LIST_PAGE,
  buildListSearchParams,
  type BaseListQuery,
} from "@/lib/api/listQuery";

export const DEFAULT_ORDER_LIST_PAGE = DEFAULT_LIST_PAGE;
export const DEFAULT_ORDER_LIST_PAGE_SIZE = 30;

export type OrderListQuery = BaseListQuery;

export function buildOrderListSearchParams(
  query: OrderListQuery & { _ts?: number } = {},
): URLSearchParams {
  return buildListSearchParams(query, {
    page: DEFAULT_ORDER_LIST_PAGE,
    pagesize: DEFAULT_ORDER_LIST_PAGE_SIZE,
  });
}

export { parsePositiveInt } from "@/lib/api/listQuery";
