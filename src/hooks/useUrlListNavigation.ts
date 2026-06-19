"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_LIST_PAGE, parsePositiveInt } from "@/lib/api/listQuery";

type UseUrlListNavigationOptions = {
  defaultPage?: number;
  defaultPageSize?: number;
};

export function useUrlListNavigation(
  options: UseUrlListNavigationOptions = {},
) {
  const defaultPage = options.defaultPage ?? DEFAULT_LIST_PAGE;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlPage = parsePositiveInt(searchParams.get("page"), defaultPage);
  const urlSearch = (searchParams.get("search") ?? "").trim();
  const urlPageSize =
    options.defaultPageSize != null
      ? parsePositiveInt(searchParams.get("pagesize"), options.defaultPageSize)
      : undefined;

  const pushParams = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const goToPage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextPage <= defaultPage) params.delete("page");
      else params.set("page", String(nextPage));
      pushParams(params);
    },
    [defaultPage, pushParams, searchParams],
  );

  const applySearchToUrl = useCallback(
    (next: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = next.trim();

      if (trimmed) params.set("search", trimmed);
      else params.delete("search");

      params.delete("page");
      pushParams(params);
    },
    [pushParams, searchParams],
  );

  const mutateSearchParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      pushParams(params);
    },
    [pushParams, searchParams],
  );

  return {
    urlPage,
    urlSearch,
    urlPageSize,
    goToPage,
    applySearchToUrl,
    mutateSearchParams,
  };
}
