"use client";

import React from "react";
import AppLoader from "@/components/ui/AppLoader";
import { formatLastCustomerWebOrderRow } from "@/lib/customerUtils";
import { isValidAmka, normalizeAmka } from "@/lib/utils/amka";
import { useAppDispatch } from "@/store/hooks";
import { setCustomerAmkaGateCompleted } from "@/store/orders/ordersSlice";
import type { CustomerSearchResult } from "@/types/api/responses";
import {
  applyCompletelyNewCustomerFromAmka,
  applyCustomerFromSearch,
  applyLastCustomerWebOrderFromSearch,
  searchCustomersByQuery,
} from "../modals/customerSearchActions";

export type UseCustomerAmkaSearchResult = {
  loading: boolean;
  applying: boolean;
  error: string | null;
  results: CustomerSearchResult[];
  lastCustomerWebOrder: Record<string, unknown> | null;
  hasSearched: boolean;
  amkaIsValid: boolean;
  handleSelectCustomer: (c: CustomerSearchResult) => Promise<void>;
  handleSelectLastWebOrder: (lwo: Record<string, unknown>) => Promise<void>;
  handleContinueAsNew: () => void;
};

function useDismissOnClickOutside(
  anchorRef: React.RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss?: () => void,
) {
  React.useEffect(() => {
    if (!open || !onDismiss) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      onDismiss();
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [anchorRef, open, onDismiss]);
}

export function useCustomerAmkaSearch(
  amka: string,
  {
    completeGate = false,
    onResolved,
    enabled = true,
    resetWizardOnDifferentAmka = false,
    baselineCustomerAmkaRef,
  }: {
    completeGate?: boolean;
    onResolved?: () => void;
    enabled?: boolean;
    resetWizardOnDifferentAmka?: boolean;
    baselineCustomerAmkaRef?: React.RefObject<string | null>;
  } = {},
): UseCustomerAmkaSearchResult {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = React.useState(false);
  const [applying, setApplying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<CustomerSearchResult[]>([]);
  const [lastCustomerWebOrder, setLastCustomerWebOrder] = React.useState<Record<
    string,
    unknown
  > | null>(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  const normalizedAmka = normalizeAmka(amka);
  const amkaIsValid = isValidAmka(amka);

  React.useEffect(() => {
    if (!enabled || !amkaIsValid) {
      setResults([]);
      setLastCustomerWebOrder(null);
      setHasSearched(false);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      setHasSearched(false);
      try {
        const outcome = await searchCustomersByQuery(normalizedAmka);
        if (cancelled) return;
        setResults(outcome.results);
        setLastCustomerWebOrder(outcome.lastCustomerWebOrder);
        setError(outcome.error);
        setHasSearched(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, amkaIsValid, normalizedAmka]);

  const finish = React.useCallback(() => {
    if (completeGate) {
      dispatch(setCustomerAmkaGateCompleted(true));
    }
    onResolved?.();
  }, [completeGate, dispatch, onResolved]);

  const searchOptions = React.useCallback(
    () => ({
      resetWizardOnDifferentAmka,
      baselineCustomerAmka: baselineCustomerAmkaRef?.current ?? null,
    }),
    [baselineCustomerAmkaRef, resetWizardOnDifferentAmka],
  );

  const handleSelectCustomer = React.useCallback(
    async (c: CustomerSearchResult) => {
      setApplying(true);
      try {
        await applyCustomerFromSearch(dispatch, c, searchOptions());
        finish();
      } finally {
        setApplying(false);
      }
    },
    [dispatch, finish, searchOptions],
  );

  const handleSelectLastWebOrder = React.useCallback(
    async (lwo: Record<string, unknown>) => {
      setApplying(true);
      try {
        await applyLastCustomerWebOrderFromSearch(dispatch, lwo, searchOptions());
        finish();
      } finally {
        setApplying(false);
      }
    },
    [dispatch, finish, searchOptions],
  );

  const handleContinueAsNew = React.useCallback(() => {
    applyCompletelyNewCustomerFromAmka(dispatch, normalizedAmka, searchOptions());
    finish();
  }, [dispatch, finish, normalizedAmka, searchOptions]);

  return {
    loading,
    applying,
    error,
    results,
    lastCustomerWebOrder,
    hasSearched,
    amkaIsValid,
    handleSelectCustomer,
    handleSelectLastWebOrder,
    handleContinueAsNew,
  };
}

function AmkaSearchDropdownItem({
  title,
  lines,
  icon,
  onClick,
  disabled,
}: {
  title: React.ReactNode;
  lines: React.ReactNode[];
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="amka-search-dropdown-item"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="d-flex align-items-start gap-3">
        <span className="amka-search-dropdown-icon" aria-hidden>
          <i className={`bi ${icon}`} />
        </span>
        <span className="min-w-0 flex-grow-1">
          <span className="d-block fw-semibold mb-1">{title}</span>
          {lines.map((line, idx) => (
            <span key={idx} className="d-block small text-secondary">
              {line}
            </span>
          ))}
        </span>
        <i className="bi bi-chevron-right text-secondary mt-1 flex-shrink-0 opacity-50" />
      </div>
    </button>
  );
}

function AmkaSearchDropdownContent({
  search,
  lastWebOrderRow,
  showNoResults,
}: {
  search: UseCustomerAmkaSearchResult;
  lastWebOrderRow: ReturnType<typeof formatLastCustomerWebOrderRow> | null;
  showNoResults: boolean;
}) {
  return (
    <>
      {search.loading ? (
        <div className="amka-search-dropdown-status">
          <AppLoader label="Αναζήτηση ασθενή…" card={false} />
        </div>
      ) : null}

      {search.error ? (
        <div className="amka-search-dropdown-status">
          <div className="alert alert-danger small mb-0 py-2">
            {search.error}
          </div>
        </div>
      ) : null}

      {!search.loading && search.results.length > 0 ? (
        <>
          {search.results.map((r, idx) => (
            <AmkaSearchDropdownItem
              key={`${r.tR_GID ?? idx}`}
              icon="bi-person-fill"
              title={r.pE_NAME || "—"}
              lines={[
                <>AMKA: {r.tR_StringField5 || "—"}</>,
                <>
                  Διεύθυνση:{" "}
                  {`${r.peS_CityCode ?? ""} ${r.peS_Address1 ?? ""}`.trim() ||
                    "—"}
                </>,
              ]}
              onClick={() => void search.handleSelectCustomer(r)}
              disabled={search.applying}
            />
          ))}
        </>
      ) : null}

      {!search.loading && lastWebOrderRow && search.lastCustomerWebOrder ? (
        <>
          <div className="amka-search-dropdown-header">
            Προηγούμενη παραγγελία
          </div>
          <AmkaSearchDropdownItem
            icon="bi-clock-history"
            title={lastWebOrderRow.name}
            lines={[
              <>AMKA: {lastWebOrderRow.amka}</>,
              <>Διεύθυνση: {lastWebOrderRow.addressLine}</>,
            ]}
            onClick={() =>
              void search.handleSelectLastWebOrder(search.lastCustomerWebOrder!)
            }
            disabled={search.applying}
          />
        </>
      ) : null}

      {showNoResults ? (
        <div className="amka-search-dropdown-empty">
          <div className="text-secondary small mb-3">
            Δεν βρέθηκε υπάρχων ασθενής με αυτόν τον ΑΜΚΑ.
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm w-100"
            onClick={search.handleContinueAsNew}
            disabled={search.applying}
          >
            <i className="bi bi-person-plus me-1" />
            Συνέχεια ως νέος ασθενής
          </button>
        </div>
      ) : null}

      {search.applying ? (
        <div className="amka-search-dropdown-footer">
          <span className="spinner-border spinner-border-sm" aria-hidden />
          Φόρτωση στοιχείων…
        </div>
      ) : null}
    </>
  );
}

export type CustomerAmkaSearchPanelProps = {
  amka: string;
  completeGate?: boolean;
  onResolved?: () => void;
  onDismiss?: () => void;
  open?: boolean;
  anchorRef?: React.RefObject<HTMLElement | null>;
  resetWizardOnDifferentAmka?: boolean;
  baselineCustomerAmkaRef?: React.RefObject<string | null>;
};

export function CustomerAmkaSearchPanel({
  amka,
  completeGate = false,
  onResolved,
  onDismiss,
  open = true,
  anchorRef,
  resetWizardOnDifferentAmka = false,
  baselineCustomerAmkaRef,
}: CustomerAmkaSearchPanelProps) {
  const fallbackAnchorRef = React.useRef<HTMLElement | null>(null);
  const resolvedAnchorRef = anchorRef ?? fallbackAnchorRef;
  const search = useCustomerAmkaSearch(amka, {
    completeGate,
    onResolved,
    enabled: open,
    resetWizardOnDifferentAmka,
    baselineCustomerAmkaRef,
  });

  useDismissOnClickOutside(resolvedAnchorRef, open, onDismiss);

  if (!open || !search.amkaIsValid) return null;

  const showPanel = search.loading || search.hasSearched;
  if (!showPanel) return null;

  const lastWebOrderRow = search.lastCustomerWebOrder
    ? formatLastCustomerWebOrderRow(search.lastCustomerWebOrder)
    : null;
  const showNoResults =
    search.hasSearched &&
    !search.loading &&
    !search.error &&
    search.results.length === 0 &&
    !lastWebOrderRow;

  const content = (
    <AmkaSearchDropdownContent
      search={search}
      lastWebOrderRow={lastWebOrderRow}
      showNoResults={showNoResults}
    />
  );

  return (
    <div
      className="amka-search-panel"
      role="listbox"
      aria-label="Αποτελέσματα αναζήτησης ΑΜΚΑ"
    >
      <div className="amka-search-panel-topbar">
        <span className="amka-search-panel-title">Αποτελέσματα αναζήτησης</span>
        {onDismiss ? (
          <button
            type="button"
            className="amka-search-panel-close"
            aria-label="Κλείσιμο αποτελεσμάτων"
            onClick={onDismiss}
          >
            <i className="bi bi-x-lg" />
          </button>
        ) : null}
      </div>
      <div className="amka-search-panel-scroll">{content}</div>
    </div>
  );
}
