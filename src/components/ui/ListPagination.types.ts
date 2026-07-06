import type { ListPaginationState } from "@/lib/pagination/listPagination";

export type ListPaginationFab = {
  href: string;
  ariaLabel: string;
};

export type ListPaginationProps = Pick<
  ListPaginationState,
  "currentPage" | "canGoPrev" | "canGoNext" | "showPagination"
> & {
  disabled?: boolean;
  onPageChange: (page: number) => void;
  pageInfo?: ListPaginationState;
  fab?: ListPaginationFab;
};
