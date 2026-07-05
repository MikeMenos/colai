"use client";

import React from "react";
import { useSearchParams } from "next/navigation";

import AppLoader from "@/components/ui/AppLoader";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { SearchBar } from "@/components/ui/SearchBar";
import ListPagination from "@/components/ui/ListPagination";

import OrderCard from "@/features/orders/components/OrderCard";
import OrderSellerScopeToggle from "@/features/orders/components/OrderSellerScopeToggle";
import {
  DEFAULT_ORDER_LIST_PAGE,
  DEFAULT_ORDER_LIST_PAGE_SIZE,
} from "@/lib/api/orderListQuery";
import { getListPaginationState } from "@/lib/pagination/listPagination";
import { useUrlListNavigation } from "@/hooks/useUrlListNavigation";
import { fetchOrders } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const userInfo = useAppSelector((s) => s.auth.userInfos);
  const orders = useAppSelector((s) => s.orders.orders);
  const paging = useAppSelector((s) => s.orders.ordersPaging);
  const listLoading = useAppSelector((s) => s.orders.loadingOrders);
  const refreshing = useAppSelector((s) => s.orders.refreshingOrders);

  const {
    urlPage,
    urlSearch,
    urlPageSize,
    goToPage,
    applySearchToUrl,
    mutateSearchParams,
  } = useUrlListNavigation({
    defaultPage: DEFAULT_ORDER_LIST_PAGE,
    defaultPageSize: DEFAULT_ORDER_LIST_PAGE_SIZE,
  });

  const [q, setQ] = React.useState(urlSearch);
  const [showAllAccounts, setShowAllAccounts] = React.useState(false);
  const loggedSellerCode = userInfo?.sellerCode?.trim() ?? "";
  const urlSellerCode = (searchParams.get("sellercode") ?? "").trim();
  const sellerCodeFilter = showAllAccounts ? "" : loggedSellerCode;

  React.useEffect(() => {
    setQ(urlSearch);
  }, [urlSearch]);

  React.useEffect(() => {
    if (showAllAccounts || !loggedSellerCode) return;
    if (urlSellerCode === loggedSellerCode) return;

    mutateSearchParams((params) => {
      params.set("sellercode", loggedSellerCode);
      params.delete("page");
    });
  }, [loggedSellerCode, mutateSearchParams, showAllAccounts, urlSellerCode]);

  React.useEffect(() => {
    void dispatch(
      fetchOrders({
        q: urlSearch,
        page: urlPage,
        pagesize: urlPageSize,
        sellerCode: sellerCodeFilter,
      }),
    );
  }, [dispatch, urlSearch, urlPage, urlPageSize, sellerCodeFilter]);

  const onRefresh = React.useCallback(async () => {
    await dispatch(
      fetchOrders({
        q: urlSearch,
        page: urlPage,
        pagesize: urlPageSize,
        sellerCode: sellerCodeFilter,
        force: true,
      }),
    ).unwrap();
  }, [dispatch, urlSearch, urlPage, urlPageSize, sellerCodeFilter]);

  const handleSellerScopeChange = React.useCallback(
    (nextShowAllAccounts: boolean) => {
      setShowAllAccounts(nextShowAllAccounts);
      mutateSearchParams((params) => {
        if (nextShowAllAccounts || !loggedSellerCode) {
          params.delete("sellercode");
        } else {
          params.set("sellercode", loggedSellerCode);
        }
        params.delete("page");
      });
    },
    [loggedSellerCode, mutateSearchParams],
  );

  const pagination = getListPaginationState({
    paging,
    urlPage,
    pageSize: urlPageSize ?? DEFAULT_ORDER_LIST_PAGE_SIZE,
    itemCount: orders.length,
    listLoading,
    defaultPage: DEFAULT_ORDER_LIST_PAGE,
  });

  const showInitialLoader = listLoading && orders.length === 0;
  const showUpdatingLoader = listLoading && orders.length > 0;

  return (
    <>
      <div className="app-card mb-3 p-2">
        <div className="d-flex flex-column gap-2">
          <SearchBar
            placeholder="Αναζήτηση (ID, συνταγή, όνομα, ΑΜΚΑ…)"
            value={q}
            onChange={setQ}
            debounceMs={500}
            debouncedCompareTo={urlSearch}
            onDebouncedChange={applySearchToUrl}
          />
          <OrderSellerScopeToggle
            allAccounts={showAllAccounts}
            disabled={!loggedSellerCode || (listLoading && orders.length === 0)}
            onChange={handleSellerScopeChange}
          />
        </div>
      </div>

      <PullToRefresh onRefresh={onRefresh} isRefreshing={refreshing}>
        {showInitialLoader || showUpdatingLoader ? (
          <AppLoader label="Φόρτωση παραγγελιών…" />
        ) : orders.length ? (
          <div className="d-flex flex-column gap-2">
            {orders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                showSellerName={showAllAccounts}
                onDelete={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="app-card text-secondary p-3 text-center">
            Δεν βρέθηκαν παραγγελίες.
          </div>
        )}
      </PullToRefresh>

      <ListPagination
        {...pagination}
        disabled={listLoading}
        onPageChange={goToPage}
        pageInfo={pagination}
        fab={
          userInfo?.isSeller
            ? { href: "/orders/0", ariaLabel: "Νέα παραγγελία" }
            : undefined
        }
      />
    </>
  );
}
