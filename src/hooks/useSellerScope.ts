"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  getOwnSellerCode,
  hasSellerAccessList,
  resolveSellerScopeCode,
} from "@/lib/sellerAccess";
import {
  getSellerScopeSellerCode,
  getSellerScopeServerSnapshot,
  SELLER_SCOPE_PARAM,
  setSellerScopeSellerCode,
  stripSellerScopeSearchParams,
  subscribeSellerScope,
} from "@/lib/sellerScope";

type UseSellerScopeOptions = {
  resetPage?: boolean;
};

export function useSellerScope(options: UseSellerScopeOptions = {}) {
  const resetPage = options.resetPage === true;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const userInfos = useAppSelector((s) => s.auth.userInfos);
  const storedSellerCode = useSyncExternalStore(
    subscribeSellerScope,
    getSellerScopeSellerCode,
    getSellerScopeServerSnapshot,
  );
  const queryString = searchParams.toString();
  const sellerScopeValue = resolveSellerScopeCode(userInfos, storedSellerCode);
  const sellerCodeFilter = sellerScopeValue;
  const loggedSellerCode = getOwnSellerCode(userInfos);
  const canSelectSeller = hasSellerAccessList(userInfos);

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(queryString);
      mutate(params);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, queryString, router],
  );

  useEffect(() => {
    if (
      !searchParams.get(SELLER_SCOPE_PARAM) &&
      !(searchParams.get("sellercode") ?? "").trim()
    ) {
      return;
    }

    replaceParams((params) => {
      stripSellerScopeSearchParams(params);
    });
  }, [replaceParams, searchParams]);

  const setSellerCodeFilter = useCallback(
    (nextSellerCode: string) => {
      const next = resolveSellerScopeCode(userInfos, nextSellerCode);
      setSellerScopeSellerCode(next);
      if (!resetPage) return;

      replaceParams((params) => {
        stripSellerScopeSearchParams(params);
        params.delete("page");
      });
    },
    [replaceParams, resetPage, userInfos],
  );

  return {
    sellerCodeFilter,
    sellerScopeValue,
    loggedSellerCode,
    canSelectSeller,
    setSellerCodeFilter,
  };
}
