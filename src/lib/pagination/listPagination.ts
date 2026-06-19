import { DEFAULT_LIST_PAGE } from "@/lib/api/listQuery";
import type { PagingResults } from "@/types/api/common";

export type ListPaginationInput = {
  paging: PagingResults | null;
  urlPage: number;
  pageSize: number;
  itemCount: number;
  listLoading: boolean;
  defaultPage?: number;
  visibleItemCount?: number;
};

export type ListPaginationState = {
  currentPage: number;
  totalPages: number;
  hasKnownTotalPages: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  showPagination: boolean;
  totalRecords: number | null;
};

export function getListPaginationState({
  paging,
  urlPage,
  pageSize,
  itemCount,
  listLoading,
  defaultPage = DEFAULT_LIST_PAGE,
  visibleItemCount,
}: ListPaginationInput): ListPaginationState {
  const totalPages = Number(paging?.totalpages ?? 0);
  const hasKnownTotalPages = totalPages > 0;
  const currentPage = Math.min(
    urlPage,
    paging?.currentPage && paging.currentPage > 0
      ? paging.currentPage
      : urlPage,
  );
  const canGoPrev = currentPage > defaultPage;
  const canGoNext = hasKnownTotalPages
    ? currentPage < totalPages
    : itemCount >= pageSize;
  const countForVisibility = visibleItemCount ?? itemCount;

  return {
    currentPage,
    totalPages,
    hasKnownTotalPages,
    canGoPrev,
    canGoNext,
    showPagination:
      !listLoading &&
      (canGoPrev || canGoNext || hasKnownTotalPages || countForVisibility > 0),
    totalRecords:
      paging?.totalrecords != null ? Number(paging.totalrecords) : null,
  };
}

export function formatListPageInfo({
  currentPage,
  totalPages,
  hasKnownTotalPages,
  totalRecords,
}: Pick<
  ListPaginationState,
  "currentPage" | "totalPages" | "hasKnownTotalPages" | "totalRecords"
>): string {
  let text = `Σελίδα ${currentPage}`;
  if (hasKnownTotalPages) text += ` / ${totalPages}`;
  if (totalRecords != null) text;
  return text;
}
