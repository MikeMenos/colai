"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

import DiscountRequestCard from "@/features/orders/components/DiscountRequestCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { SearchBar } from "@/components/ui/SearchBar";
import ListPagination from "@/components/ui/ListPagination";
import { fetchDiscountRequests } from "@/store/discountRequests/discountRequestsSlice";
import PullToRefresh from "@/components/ui/PullToRefresh";
import AppLoader from "@/components/ui/AppLoader";
import {
  DEFAULT_DISCOUNT_LIST_PAGE,
  DEFAULT_DISCOUNT_LIST_PAGE_SIZE,
} from "@/lib/api/discountListQuery";
import { getListPaginationState } from "@/lib/pagination/listPagination";
import { useUrlListNavigation } from "@/hooks/useUrlListNavigation";

type DiscountRequestsTab = "pending" | "reviewed";

function isPendingDiscountRequest(isDiscountApproved: number) {
  return isDiscountApproved == -1;
}

export default function DiscountRequestsPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const discountRequests = useAppSelector((s) => s.discountRequests);
  const listLoading = useAppSelector((s) => s.discountRequests.loadingList);
  const refreshing = useAppSelector((s) => s.discountRequests.refreshingList);
  const paging = useAppSelector((s) => s.discountRequests.paging);
  const discountStatuses = useAppSelector(
    (s) => s.staticData.list_Discount_Statuses,
  );

  const { urlPage, urlSearch, goToPage, applySearchToUrl, mutateSearchParams } =
    useUrlListNavigation({ defaultPage: DEFAULT_DISCOUNT_LIST_PAGE });

  const activeTab: DiscountRequestsTab =
    searchParams.get("tab") === "reviewed" ? "reviewed" : "pending";
  const [q, setQ] = React.useState(urlSearch);

  const pendingRequests = React.useMemo(
    () =>
      discountRequests.requests.filter((r) =>
        isPendingDiscountRequest(r.isDiscountApproved),
      ),
    [discountRequests.requests],
  );

  const reviewedRequests = React.useMemo(
    () =>
      discountRequests.requests.filter(
        (r) => !isPendingDiscountRequest(r.isDiscountApproved),
      ),
    [discountRequests.requests],
  );

  const visibleRequests =
    activeTab === "pending" ? pendingRequests : reviewedRequests;

  const pendingTabLabel =
    discountStatuses.find((s) => s.value == "-1")?.text ?? "Αναμονή";
  const reviewedTabLabel = "Απαντημένα";

  React.useEffect(() => {
    setQ(urlSearch);
  }, [urlSearch]);

  React.useEffect(() => {
    void dispatch(
      fetchDiscountRequests({
        q: urlSearch,
        page: urlPage,
        pagesize: DEFAULT_DISCOUNT_LIST_PAGE_SIZE,
      }),
    );
  }, [dispatch, urlSearch, urlPage]);

  const onSubmitSearch = React.useCallback(() => {
    applySearchToUrl(q);
  }, [applySearchToUrl, q]);

  const onClearSearch = React.useCallback(() => {
    applySearchToUrl("");
  }, [applySearchToUrl]);

  const setActiveTab = React.useCallback(
    (tab: DiscountRequestsTab) => {
      mutateSearchParams((params) => {
        if (tab === "pending") params.delete("tab");
        else params.set("tab", tab);
      });
    },
    [mutateSearchParams],
  );

  const onRefresh = React.useCallback(async () => {
    await dispatch(
      fetchDiscountRequests({
        q: urlSearch,
        page: urlPage,
        pagesize: DEFAULT_DISCOUNT_LIST_PAGE_SIZE,
        force: true,
      }),
    ).unwrap();
  }, [dispatch, urlSearch, urlPage]);

  const pagination = getListPaginationState({
    paging,
    urlPage,
    pageSize: DEFAULT_DISCOUNT_LIST_PAGE_SIZE,
    itemCount: discountRequests.requests.length,
    listLoading,
    defaultPage: DEFAULT_DISCOUNT_LIST_PAGE,
    visibleItemCount: visibleRequests.length,
  });

  const showInitialLoader =
    (listLoading || refreshing) && discountRequests.requests.length === 0;
  const showUpdatingLoader =
    listLoading && discountRequests.requests.length > 0;

  return (
    <>
      <div className="d-flex align-items-center mb-2 flex-wrap gap-2">
        <div className="app-card flex-grow-1">
          <SearchBar
            placeholder="Αναζήτηση αιτήματος"
            value={q}
            onChange={setQ}
            onSubmit={onSubmitSearch}
            onClear={onClearSearch}
          />
        </div>
      </div>

      <div className="app-card mb-2 px-3 py-2">
        <ul className="nav nav-pills nav-fill mb-0 gap-1">
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              {pendingTabLabel}
              <span className="badge bg-secondary ms-2">
                {pendingRequests.length}
              </span>
            </button>
          </li>
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link ${activeTab === "reviewed" ? "active" : ""}`}
              onClick={() => setActiveTab("reviewed")}
            >
              {reviewedTabLabel}
              <span className="badge bg-secondary ms-2">
                {reviewedRequests.length}
              </span>
            </button>
          </li>
        </ul>
      </div>

      <PullToRefresh onRefresh={onRefresh} isRefreshing={refreshing}>
        {showInitialLoader || showUpdatingLoader ? (
          <AppLoader label="Φόρτωση αιτημάτων..." />
        ) : visibleRequests.length ? (
          <div className="d-flex flex-column gap-2">
            {visibleRequests.map((r) => (
              <DiscountRequestCard key={r.uid} request={r} />
            ))}
          </div>
        ) : discountRequests.requests.length ? (
          <div className="app-card text-secondary p-3 text-center">
            {activeTab === "pending"
              ? "Δεν βρέθηκαν αιτήματα σε αναμονή."
              : "Δεν βρέθηκαν απαντημένα αιτήματα."}
          </div>
        ) : (
          <div className="app-card text-secondary p-3 text-center">
            Δεν βρέθηκαν αιτήματα.
          </div>
        )}
      </PullToRefresh>

      <ListPagination
        {...pagination}
        disabled={listLoading}
        onPageChange={goToPage}
        pageInfo={pagination}
      />
    </>
  );
}
