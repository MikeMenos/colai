export const SELLER_SCOPE_PARAM = "scope";
export const SELLER_SCOPE_ALL = "all";

type SearchParamReader = {
  get(name: string): string | null;
};

export function isAllAccountsSearchParam(
  searchParams: SearchParamReader,
): boolean {
  return searchParams.get(SELLER_SCOPE_PARAM) === SELLER_SCOPE_ALL;
}

export function applySellerScopeToParams(
  params: URLSearchParams,
  options: {
    showAllAccounts: boolean;
    loggedSellerCode: string;
  },
): void {
  const { showAllAccounts, loggedSellerCode } = options;

  if (showAllAccounts && loggedSellerCode) {
    params.delete("sellercode");
    params.set(SELLER_SCOPE_PARAM, SELLER_SCOPE_ALL);
    return;
  }

  params.delete(SELLER_SCOPE_PARAM);
  if (loggedSellerCode) params.set("sellercode", loggedSellerCode);
  else params.delete("sellercode");
}
