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
import { Alert, Button, FormSelect, Modal } from "react-bootstrap";
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

  const [showFilters, setShowFilters] = React.useState(false);
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
    showAllAccounts,
    sellerCodeFilter,
    loggedSellerCode,
    setShowAllAccounts,
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
    return `${base} btn-primary border-primary`;
  };

  const wcStatusFilterButtonTitle = (key: WcStatusFilterKey): string => {
    if (key === "all") return "Όλες οι εγγραφές";
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

  const applyFilters = () => {
    setShowFilters(false);
  };

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
  const statusFilterDescription = describeWcStatusFilter(activeStatusFilters);
  const allFilterActive = isWcStatusFilterKeyActive(activeStatusFilters, "all");
  const eFilterActive = isWcStatusFilterKeyActive(activeStatusFilters, "e");
  const aFilterActive = isWcStatusFilterKeyActive(activeStatusFilters, "a");

  const renderMonthSortButton = () => (
    <button
      type="button"
      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center flex-shrink-0 gap-1"
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
              allAccounts={showAllAccounts}
              disabled={
                !loggedSellerCode ||
                (listLoading && wcDiadikasia.calendar.length === 0)
              }
              onChange={setShowAllAccounts}
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
          <div className="d-md-none">{renderMonthSortButton()}</div>
        </div>
        <div
          className="d-flex align-items-center flex-shrink-0 gap-2"
          role="group"
          aria-label={`Φίλτρο κατάστασης: ${statusFilterDescription}`}
        >
          <button
            type="button"
            className={wcStatusFilterButtonClass("all", allFilterActive)}
            style={{ minWidth: 56 }}
            aria-pressed={allFilterActive}
            title={wcStatusFilterButtonTitle("all")}
            onClick={() => toggleStatusFilter("all")}
          >
            {allFilterActive ? (
              <i className="bi bi-check2" aria-hidden />
            ) : null}
            Όλα
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
        </div>
        <button
          type="button"
          className={`btn btn-sm flex-shrink-0 ${onlyNext10Days ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => applyNext10FilterToUrl(!onlyNext10Days)}
        >
          {onlyNext10Days ? "Προβολή όλων" : "10 ημέρες μετά"}
        </button>
        <div className="d-none d-md-inline-flex">{renderMonthSortButton()}</div>
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

      {/* <Button
                onClick={() => setShowFilters(true)}
                className="app-fab btn btn-primary rounded-circle shadow d-flex align-items-center justify-content-center"
                style={{ width: 56, height: 56 }}
            >
                <i className={`bi bi-filter`} style={{ fontSize: "1.25rem" }} />
            </Button> */}
      <Modal show={showFilters} onHide={() => setShowFilters(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Φίλτρα WC</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <label className="form-label small text-secondary mb-2">
            Area-Team
          </label>
          <FormSelect aria-label="Area-Team">
            {/* <option value="4">WC</option> */}
          </FormSelect>
          <label className="form-label small text-secondary mb-2">
            Πωλητής
          </label>
          <FormSelect aria-label="Πωλητής">
            {/* <option value="4">WC</option> */}
          </FormSelect>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={applyFilters}>
            Εφαρμογή
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
