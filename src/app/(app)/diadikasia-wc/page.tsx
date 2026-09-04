"use client";

import React from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SearchBar } from "@/components/ui/SearchBar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import AppLoader from "@/components/ui/AppLoader";
import PullToRefresh from "@/components/ui/PullToRefresh";
import WCDiadikasiaGroupedList from "@/features/orders/components/diadikasia/WCDiadikasiaGroupedList";
import OrderSellerScopeToggle from "@/features/orders/components/OrderSellerScopeToggle";
import { useSellerScope } from "@/hooks/useSellerScope";
import { fetchWCCalendar } from "@/store/wcDiadikasia/wcDiadikasiaSlice";
import { Alert, Offcanvas } from "react-bootstrap";
import { parseOrderDate } from "@/features/orders/diadikasia/groupWcCalendarByLastOrderDate";
import {
  describeWcStatusFilter,
  isDefaultWcStatusFilter,
  isWcStatusFilterKeyActive,
  parseWcStatusFilterKeys,
  rowMatchesStatusFilterKeys,
  serializeWcStatusFilterKeys,
  toggleWcStatusFilterKey,
  WC_STATUS_FILTER_DEFAULT,
  type WcStatusFilterKey,
  WC_STATUS_TITLE_EPISOULETHIKE,
  WC_STATUS_TITLE_APEBIWSE,
} from "@/features/orders/diadikasia/wcCalendarStatus";

const SEARCH_DEBOUNCE_MS = 500;

export default function DiadikasiaWC() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const wcDiadikasia = useAppSelector((s) => s.wcDiadiaksia);
  const listLoading = useAppSelector((s) => s.wcDiadiaksia.loadingList);
  const refreshing = useAppSelector((s) => s.wcDiadiaksia.refreshingList);
  const error = useAppSelector((s) => s.wcDiadiaksia.error);

  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [expandAllNonce, setExpandAllNonce] = React.useState(0);
  const [expandAllOpen, setExpandAllOpen] = React.useState(false);
  const [allTilesExpanded, setAllTilesExpanded] = React.useState(false);

  const urlSearch = (
    searchParams.get("searchfield") ??
    searchParams.get("search") ??
    ""
  ).trim();
  const onlyNext10Days = searchParams.get("next10") === "1";
  const urlStatusFilter = searchParams.get("statusFilter");
  const activeStatusFilters = urlStatusFilter
    ? parseWcStatusFilterKeys(urlStatusFilter)
    : WC_STATUS_FILTER_DEFAULT;
  const monthOrder = searchParams.get("monthOrder") === "asc" ? "asc" : "desc";
  const [q, setQ] = React.useState(urlSearch);
  const {
    sellerCodeFilter,
    sellerScopeValue,
    canSelectSeller,
    setSellerCodeFilter,
  } = useSellerScope();

  const applySearchToUrl = React.useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = next.trim();

      params.delete("searchfield");
      params.delete("search");
      if (trimmed) params.set("searchfield", trimmed);

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );
  const applyNext10FilterToUrl = React.useCallback(
    (enabled: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      if (enabled) params.set("next10", "1");
      else params.delete("next10");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const applyStatusFiltersToUrl = React.useCallback(
    (keys: WcStatusFilterKey[]) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("statusTitle");
      if (isDefaultWcStatusFilter(keys)) params.delete("statusFilter");
      else params.set("statusFilter", serializeWcStatusFilterKeys(keys));
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const toggleStatusFilter = React.useCallback(
    (key: WcStatusFilterKey) => {
      applyStatusFiltersToUrl(
        toggleWcStatusFilterKey(activeStatusFilters, key),
      );
    },
    [activeStatusFilters, applyStatusFiltersToUrl],
  );

  const toggleExpandAllTiles = React.useCallback(() => {
    const next = !allTilesExpanded;
    setExpandAllOpen(next);
    setExpandAllNonce((nonce) => nonce + 1);
  }, [allTilesExpanded]);

  const wcStatusFilterButtonClass = (
    key: WcStatusFilterKey,
    active: boolean,
  ): string => {
    const base =
      "btn btn-sm rounded-3 fw-semibold px-3 d-inline-flex align-items-center gap-1";
    if (!active) return `${base} btn-outline-secondary opacity-50`;
    if (key === "e") return `${base} btn-success border-success`;
    if (key === "a") return `${base} btn-danger border-danger`;
    if (key === "active") return `${base} btn-primary border-primary`;
    return `${base} btn-primary border-primary`;
  };

  const wcStatusFilterButtonTitle = (key: WcStatusFilterKey): string => {
    if (key === "all") return "Όλες οι εγγραφές";
    if (key === "active") return "Ενεργές εγγραφές (χωρίς Ε και Α)";
    if (key === "e") return WC_STATUS_TITLE_EPISOULETHIKE;
    return WC_STATUS_TITLE_APEBIWSE;
  };

  const toggleMonthSort = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (monthOrder === "desc") params.set("monthOrder", "asc");
    else params.delete("monthOrder");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, monthOrder]);

  const wcGroupOrder = React.useMemo(
    () =>
      ({
        monthOrder: monthOrder === "asc" ? "asc" : "desc",
        dayOrder: "desc",
      }) as const,
    [monthOrder],
  );

  React.useEffect(() => {
    setQ(urlSearch);
  }, [urlSearch]);

  React.useEffect(() => {
    void dispatch(
      fetchWCCalendar({
        ...(urlSearch ? { q: urlSearch } : {}),
        sellerCode: sellerCodeFilter,
      }),
    );
  }, [dispatch, sellerCodeFilter, urlSearch]);

  const onRefresh = React.useCallback(async () => {
    await dispatch(
      fetchWCCalendar({
        ...(urlSearch ? { q: urlSearch } : {}),
        sellerCode: sellerCodeFilter,
        force: true,
      }),
    ).unwrap();
  }, [dispatch, sellerCodeFilter, urlSearch]);

  const visibleItems = React.useMemo(() => {
    let items = wcDiadikasia.calendar.filter((item) =>
      rowMatchesStatusFilterKeys(item, activeStatusFilters),
    );

    if (!onlyNext10Days) return items;

    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const maxDate = new Date(
      todayStart.getFullYear(),
      todayStart.getMonth(),
      todayStart.getDate() + 10,
    );

    return items.filter((item) => {
      const d = parseOrderDate(item.expectedNextOrderDate);
      if (!d) return false;
      const localDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return localDay >= todayStart && localDay <= maxDate;
    });
  }, [activeStatusFilters, onlyNext10Days, wcDiadikasia.calendar]);

  const showInitialLoader = listLoading && wcDiadikasia.calendar.length === 0;
  const showFilterLoader = listLoading && wcDiadikasia.calendar.length > 0;
  const loaderLabel =
    urlSearch.length > 0 ? "Αναζήτηση…" : "Φόρτωση WC διαδικασίας…";

  const hasActiveStatusFilter = !isDefaultWcStatusFilter(activeStatusFilters);
  const hasNonDefaultFilters =
    hasActiveStatusFilter || onlyNext10Days || monthOrder !== "desc";
  const statusFilterDescription = describeWcStatusFilter(activeStatusFilters);
  const allFilterActive = isWcStatusFilterKeyActive(activeStatusFilters, "all");
  const activeFilterActive = isWcStatusFilterKeyActive(
    activeStatusFilters,
    "active",
  );
  const eFilterActive = isWcStatusFilterKeyActive(activeStatusFilters, "e");
  const aFilterActive = isWcStatusFilterKeyActive(activeStatusFilters, "a");

  const renderMonthSortButton = () => (
    <button
      type="button"
      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
      onClick={toggleMonthSort}
      title="Πατήστε για εναλλαγή σειράς μηνών"
      aria-pressed={monthOrder === "asc"}
      aria-label={
        monthOrder === "desc"
          ? "Ταξινόμηση μήνα φθίνουσα. Εναλλαγή σε αύξουσα."
          : "Ταξινόμηση μήνα αύξουσα. Εναλλαγή σε φθίνουσα."
      }
    >
      <i
        className={`bi ${monthOrder === "desc" ? "bi-sort-down" : "bi-sort-up"}`}
        aria-hidden
      />
      <span className="text-nowrap">Μήνας</span>
    </button>
  );

  const renderStatusFilterButtons = () => (
    <>
      <button
        type="button"
        className={wcStatusFilterButtonClass("all", allFilterActive)}
        style={{ minWidth: 56 }}
        aria-pressed={allFilterActive}
        title={wcStatusFilterButtonTitle("all")}
        onClick={() => toggleStatusFilter("all")}
      >
        {allFilterActive ? <i className="bi bi-check2" aria-hidden /> : null}
        Όλα
      </button>
      <button
        type="button"
        className={wcStatusFilterButtonClass("active", activeFilterActive)}
        style={{ minWidth: 72 }}
        aria-pressed={activeFilterActive}
        title={wcStatusFilterButtonTitle("active")}
        onClick={() => toggleStatusFilter("active")}
      >
        {activeFilterActive ? <i className="bi bi-check2" aria-hidden /> : null}
        Ενεργά
      </button>
      <button
        type="button"
        className={wcStatusFilterButtonClass("e", eFilterActive)}
        style={{ minWidth: 48 }}
        aria-pressed={eFilterActive}
        title={wcStatusFilterButtonTitle("e")}
        onClick={() => toggleStatusFilter("e")}
      >
        {eFilterActive ? <i className="bi bi-check2" aria-hidden /> : null}E
      </button>
      <button
        type="button"
        className={wcStatusFilterButtonClass("a", aFilterActive)}
        style={{ minWidth: 48 }}
        aria-pressed={aFilterActive}
        title={wcStatusFilterButtonTitle("a")}
        onClick={() => toggleStatusFilter("a")}
      >
        {aFilterActive ? <i className="bi bi-check2" aria-hidden /> : null}A
      </button>
    </>
  );

  return (
    <>
      <div className="d-flex align-items-center mb-2 flex-wrap gap-2">
        <div className="app-card flex-grow-1 p-2">
          <div className="d-flex flex-column gap-2">
            <SearchBar
              placeholder="Αναζήτηση..."
              value={q}
              onChange={setQ}
              debounceMs={SEARCH_DEBOUNCE_MS}
              debouncedCompareTo={urlSearch}
              onDebouncedChange={applySearchToUrl}
            />
            <OrderSellerScopeToggle
              value={sellerScopeValue}
              disabled={
                !canSelectSeller ||
                (listLoading && wcDiadikasia.calendar.length === 0)
              }
              onChange={setSellerCodeFilter}
            />
          </div>
        </div>
        <div className="d-flex align-items-center flex-shrink-0 gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary flex-shrink-0"
            onClick={toggleExpandAllTiles}
          >
            <i
              className={`bi ${allTilesExpanded ? "bi-arrows-collapse" : "bi-arrows-expand"}`}
              aria-hidden
            />
            <span className="visually-hidden">
              {allTilesExpanded ? "Σύμπτυξη όλων" : "Ανάπτυξη όλων"}
            </span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary position-relative flex-shrink-0"
            onClick={() => setFiltersOpen(true)}
            aria-label="Φίλτρα"
            title="Φίλτρα"
          >
            <i className="bi bi-funnel" aria-hidden />
            {hasNonDefaultFilters ? (
              <span
                className="position-absolute translate-middle bg-primary border-light rounded-circle start-100 top-0 border p-1"
                aria-hidden
              />
            ) : null}
          </button>
        </div>
      </div>

      <PullToRefresh onRefresh={onRefresh} isRefreshing={refreshing}>
        {error ? (
          <Alert variant="danger">{error}</Alert>
        ) : showInitialLoader || showFilterLoader ? (
          <AppLoader label={loaderLabel} />
        ) : visibleItems.length ? (
          <WCDiadikasiaGroupedList
            items={visibleItems}
            expandAllNonce={expandAllNonce}
            expandAllOpen={expandAllOpen}
            onAllExpandedChange={setAllTilesExpanded}
            groupOrder={wcGroupOrder}
          />
        ) : (
          <div className="app-card text-secondary p-3 text-center">
            {onlyNext10Days
              ? "Δεν βρέθηκαν WC διαδικασίες για τις επόμενες 10 ημέρες."
              : hasActiveStatusFilter
                ? "Δεν βρέθηκαν WC διαδικασίες για το επιλεγμένο φίλτρο."
                : "Δεν βρέθηκαν WC διαδικασίες"}
          </div>
        )}
      </PullToRefresh>

      <Offcanvas
        show={filtersOpen}
        onHide={() => setFiltersOpen(false)}
        placement="end"
        className="wc-filters-offcanvas"
        backdropClassName="wc-filters-offcanvas-backdrop"
      >
        <Offcanvas.Header closeButton>
          <div>
            <Offcanvas.Title>Φίλτρα</Offcanvas.Title>
            <p className="small text-secondary mb-0">
              {statusFilterDescription}
            </p>
          </div>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <section
            className="wc-filters-drawer__section"
            role="group"
            aria-label={`Φίλτρο κατάστασης: ${statusFilterDescription}`}
          >
            <p className="wc-filters-drawer__label">Κατασταση</p>
            <div className="wc-filters-drawer__buttons">
              {renderStatusFilterButtons()}
            </div>
          </section>
          <section className="wc-filters-drawer__section">
            <p className="wc-filters-drawer__label">Ημερομηνια</p>
            <div className="wc-filters-drawer__buttons">
              <button
                type="button"
                className={`btn btn-sm ${onlyNext10Days ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => applyNext10FilterToUrl(!onlyNext10Days)}
              >
                {onlyNext10Days ? "Προβολή όλων" : "10 ημέρες μετά"}
              </button>
              {renderMonthSortButton()}
            </div>
          </section>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
