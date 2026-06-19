"use client";

import React from "react";
import { createPortal } from "react-dom";

import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import {
  formatListPageInfo,
  type ListPaginationState,
} from "@/lib/pagination/listPagination";

type ListPaginationFab = {
  href: string;
  ariaLabel: string;
};

type ListPaginationProps = Pick<
  ListPaginationState,
  "currentPage" | "canGoPrev" | "canGoNext" | "showPagination"
> & {
  disabled?: boolean;
  onPageChange: (page: number) => void;
  pageInfo?: ListPaginationState;
  fab?: ListPaginationFab;
};

export default function ListPagination({
  currentPage,
  canGoPrev,
  canGoNext,
  showPagination,
  disabled = false,
  onPageChange,
  pageInfo,
  fab,
}: ListPaginationProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const hasFab = Boolean(fab);
  const hasNav = showPagination;

  if (!hasFab && !hasNav) return null;

  const infoText = pageInfo ? formatListPageInfo(pageInfo) : null;

  const nav = hasNav ? (
    <nav className="list-pagination-nav" aria-label="Σελιδοποίηση λίστας">
      <div className="d-md-none">
        <div className="d-flex justify-content-between align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            disabled={!canGoPrev || disabled}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <i className="bi bi-chevron-left me-1" aria-hidden />
            Προηγούμενη
          </button>

          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            disabled={!canGoNext || disabled}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Επόμενη
            <i className="bi bi-chevron-right ms-1" aria-hidden />
          </button>
        </div>

        {infoText ? (
          <div
            className="text-secondary text-center mt-2"
            style={{ fontSize: 13 }}
          >
            {infoText}
          </div>
        ) : null}
      </div>

      <div className="d-none d-md-flex align-items-center justify-content-between gap-2">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          disabled={!canGoPrev || disabled}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <i className="bi bi-chevron-left me-1" aria-hidden />
          Προηγούμενη
        </button>

        {infoText ? (
          <div className="text-secondary text-center" style={{ fontSize: 13 }}>
            {infoText}
          </div>
        ) : null}

        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          disabled={!canGoNext || disabled}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Επόμενη
          <i className="bi bi-chevron-right ms-1" aria-hidden />
        </button>
      </div>
    </nav>
  ) : null;

  const stack = (
    <div className="list-pagination-stack">
      {fab ? (
        <div className="list-pagination-fab-row">
          <FloatingActionButton
            href={fab.href}
            ariaLabel={fab.ariaLabel}
            inline
          />
        </div>
      ) : null}
      {nav}
    </div>
  );

  const spacerClassName = [
    "list-pagination-spacer",
    hasFab && hasNav && "list-pagination-spacer--with-fab",
    hasFab && !hasNav && "list-pagination-spacer--fab-only",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <div className={spacerClassName} aria-hidden="true" />
      {mounted ? createPortal(stack, document.body) : null}
    </>
  );
}
