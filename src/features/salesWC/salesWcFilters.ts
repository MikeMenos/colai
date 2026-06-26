import { parseLocalDateTime } from "@/lib/utils/date";
import { parseLocaleNumber } from "@/lib/utils/number";
import type { SellerSalesWC } from "@/types/api";

export const SALES_WC_PAGE_SIZE = 30;

export function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getTodayDateInputValue(): string {
  return toDateInputValue(new Date());
}

export function getCurrentMonthStartDateInputValue(): string {
  const now = new Date();
  return toDateInputValue(new Date(now.getFullYear(), now.getMonth(), 1));
}

export function getPreviousMonthStartDateInputValue(): string {
  const now = new Date();
  return toDateInputValue(new Date(now.getFullYear(), now.getMonth() - 1, 1));
}

export function getPreviousMonthEndDateInputValue(): string {
  const now = new Date();
  return toDateInputValue(new Date(now.getFullYear(), now.getMonth(), 0));
}

export type SalesWCSummaryStats = {
  newCount: number;
  repeatCount: number;
  totalCount: number;
  turnoverTotal: number;
};

function getNewRepKind(value: unknown): "new" | "repeat" | "other" {
  const text = String(value ?? "").trim();
  if (text === "Νέο") return "new";
  if (text === "Επαναληπτικό") return "repeat";
  return "other";
}

export function summarizeSalesWCRecords(
  records: readonly SellerSalesWC[],
): SalesWCSummaryStats {
  let newCount = 0;
  let repeatCount = 0;
  let turnoverTotal = 0;

  for (const sale of records) {
    const kind = getNewRepKind(sale.NEWREP);
    if (kind === "new") newCount += 1;
    else if (kind === "repeat") repeatCount += 1;
    turnoverTotal += parseLocaleNumber(sale.Turnover);
  }

  return {
    newCount,
    repeatCount,
    totalCount: records.length,
    turnoverTotal,
  };
}

export function getDaysInDateRange(dateFrom: string, dateTo: string): number | null {
  const fromDayMs = getCalendarDayMs(dateFrom);
  const toDayMs = getCalendarDayMs(dateTo);
  if (fromDayMs == null || toDayMs == null || toDayMs < fromDayMs) {
    return null;
  }
  return Math.round((toDayMs - fromDayMs) / (24 * 60 * 60 * 1000)) + 1;
}

export function getSalesWCResultTitle(dateFrom: string, dateTo: string): string {
  const today = getTodayDateInputValue();
  const currentMonthStart = getCurrentMonthStartDateInputValue();
  const previousMonthStart = getPreviousMonthStartDateInputValue();
  const previousMonthEnd = getPreviousMonthEndDateInputValue();

  if (dateFrom === currentMonthStart && dateTo === today) {
    return "Αποτέλεσμα WC · Τρέχων μήνας";
  }

  if (dateFrom === previousMonthStart && dateTo === previousMonthEnd) {
    return "Αποτέλεσμα WC · Προηγούμενος μήνας";
  }

  const days = getDaysInDateRange(dateFrom, dateTo);
  if (days != null) {
    return `Αποτέλεσμα WC · ${days} ${days === 1 ? "ημέρα" : "ημέρες"}`;
  }

  return "Αποτέλεσμα WC";
}

function getCalendarDayMs(value: string): number | null {
  const date = parseLocalDateTime(value);
  if (!date) return null;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

export function getSaleRegistrationDayMs(sale: SellerSalesWC): number | null {
  return getCalendarDayMs(sale.RegistrationDate);
}

export function isSaleInDateRange(
  sale: SellerSalesWC,
  dateFrom: string,
  dateTo: string,
): boolean {
  const saleDayMs = getSaleRegistrationDayMs(sale);
  const fromDayMs = getCalendarDayMs(dateFrom);
  const toDayMs = getCalendarDayMs(dateTo);

  if (saleDayMs == null || fromDayMs == null || toDayMs == null) {
    return false;
  }

  return saleDayMs >= fromDayMs && saleDayMs <= toDayMs;
}

export function filterSalesByDateRange(
  records: SellerSalesWC[],
  dateFrom: string,
  dateTo: string,
): SellerSalesWC[] {
  return records.filter((sale) => isSaleInDateRange(sale, dateFrom, dateTo));
}

export function paginateItems<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export type ClientPaginationState = {
  currentPage: number;
  totalPages: number;
  canGoPrev: boolean;
  canGoNext: boolean;
  showPagination: boolean;
  totalRecords: number;
};

export function getClientPaginationState(
  totalItems: number,
  currentPage: number,
  pageSize: number,
): ClientPaginationState {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);
  const page = Math.min(Math.max(1, currentPage), totalPages);

  return {
    currentPage: page,
    totalPages,
    canGoPrev: page > 1,
    canGoNext: page < totalPages,
    showPagination: totalItems > pageSize,
    totalRecords: totalItems,
  };
}

export function formatClientPageInfo({
  currentPage,
  totalPages,
  totalRecords,
}: ClientPaginationState): string {
  return `Σελίδα ${currentPage} / ${totalPages} · ${totalRecords} εγγραφές`;
}
