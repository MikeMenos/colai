import {
  DEFAULT_LIST_PAGE,
  buildListSearchParams,
  type BaseListQuery,
} from "@/lib/api/listQuery";

export const DEFAULT_ORDER_LIST_PAGE = DEFAULT_LIST_PAGE;
export const DEFAULT_ORDER_LIST_PAGE_SIZE = 30;

/** `Σε αναμονή` — shown first in the orders list. */
export const PENDING_ORDER_STATUS_ID = 0;

export type OrderListQuery = BaseListQuery;

export function sortOrdersPendingFirst<T extends { statusId: number }>(
  orders: T[],
): T[] {
  return [...orders].sort((a, b) => {
    const aPending = a.statusId === PENDING_ORDER_STATUS_ID ? 0 : 1;
    const bPending = b.statusId === PENDING_ORDER_STATUS_ID ? 0 : 1;
    return aPending - bPending;
  });
}

export function buildOrderListSearchParams(
  query: OrderListQuery & { _ts?: number } = {},
): URLSearchParams {
  return buildListSearchParams(query, {
    page: DEFAULT_ORDER_LIST_PAGE,
    pagesize: DEFAULT_ORDER_LIST_PAGE_SIZE,
  });
}

export { parsePositiveInt } from "@/lib/api/listQuery";
