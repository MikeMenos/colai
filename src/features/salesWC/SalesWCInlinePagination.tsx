"use client";

import type { ClientPaginationState } from "./salesWcFilters";
import { formatClientPageInfo } from "./salesWcFilters";

export default function SalesWCInlinePagination({
  pagination,
  disabled = false,
  onPageChange,
}: {
  pagination: ClientPaginationState;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}) {
  if (!pagination.showPagination) return null;

  return (
    <div className="d-flex align-items-center justify-content-between gap-2 pt-2">
      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        disabled={!pagination.canGoPrev || disabled}
        onClick={() => onPageChange(pagination.currentPage - 1)}
      >
        <i className="bi bi-chevron-left me-1" aria-hidden />
        Προηγούμενη
      </button>

      <div className="text-secondary text-center" style={{ fontSize: 13 }}>
        {formatClientPageInfo(pagination)}
      </div>

      <button
        type="button"
        className="btn btn-sm btn-outline-primary"
        disabled={!pagination.canGoNext || disabled}
        onClick={() => onPageChange(pagination.currentPage + 1)}
      >
        Επόμενη
        <i className="bi bi-chevron-right ms-1" aria-hidden />
      </button>
    </div>
  );
}
