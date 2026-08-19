"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  applySellerScopeToParams,
  isAllAccountsSearchParam,
} from "@/lib/sellerScope";

type UseSellerScopeOptions = {
  resetPage?: boolean;
};

export function useSellerScope(options: UseSellerScopeOptions = {}) {
  const resetPage = options.resetPage === true;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const skipDefaultScopeRef = useRef(false);
  const loggedSellerCode =
    useAppSelector((s) => s.auth.userInfos)?.sellerCode?.trim() ?? "";
  const queryString = searchParams.toString();
  const urlSellerCode = (searchParams.get("sellercode") ?? "").trim();
  const showAllAccounts = isAllAccountsSearchParam(searchParams);
  const sellerCodeFilter = showAllAccounts ? "" : loggedSellerCode;

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(queryString);
      mutate(params);
      if (resetPage) params.delete("page");
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, queryString, resetPage, router],
  );

  useEffect(() => {
    if (skipDefaultScopeRef.current) return;
    if (!loggedSellerCode) return;
    if (showAllAccounts) return;
    if (urlSellerCode === loggedSellerCode) return;

    replaceParams((params) => {
      applySellerScopeToParams(params, {
        showAllAccounts: false,
        loggedSellerCode,
      });
    });
  }, [loggedSellerCode, replaceParams, showAllAccounts, urlSellerCode]);

  const setShowAllAccounts = useCallback(
    (nextShowAllAccounts: boolean) => {
      skipDefaultScopeRef.current = true;
      replaceParams((params) => {
        applySellerScopeToParams(params, {
          showAllAccounts: nextShowAllAccounts,
          loggedSellerCode,
        });
      });
    },
    [loggedSellerCode, replaceParams],
  );

  return {
    showAllAccounts,
    sellerCodeFilter,
    loggedSellerCode,
    setShowAllAccounts,
  };
}
