import type { Maybe, Nullable } from "@/types/api/common";
import type { ApiAccessSellerItem, ApiUserInfo } from "@/types/api/schemas";

export function normalizeSellerCode(value: unknown): string {
  const text = String(value ?? "").trim();
  return /^\d+$/.test(text) ? text.replace(/^0+(?=\d)/, "") : text;
}

export function isManagerWithoutSellerRole(
  userInfo: Maybe<ApiUserInfo>,
): boolean {
  return userInfo?.isManager === true && userInfo.isSeller !== true;
}

export function canAccessSeller(
  userInfo: Maybe<ApiUserInfo>,
  sellerCode: string,
): boolean {
  const normalizedTarget = normalizeSellerCode(sellerCode);
  const normalizedOwn = normalizeSellerCode(userInfo?.sellerCode);
  if (normalizedOwn && normalizedTarget === normalizedOwn) return true;

  if (!isManagerWithoutSellerRole(userInfo)) return false;

  return (userInfo?.listAccessSellers ?? []).some(
    (seller) => normalizeSellerCode(seller.sellerCode) === normalizedTarget,
  );
}

export function hasSellerAccessList(
  userInfos: Maybe<ApiUserInfo>,
): boolean {
  return (userInfos?.listAccessSellers?.length ?? 0) > 0;
}

export function isActingSellerSelectionValid(
  userInfos: Maybe<ApiUserInfo>,
  actingSellerCode: Maybe<string>,
): boolean {
  if (!hasSellerAccessList(userInfos)) return true;
  return Boolean(getActingSellerCodeForApi(userInfos, actingSellerCode));
}

export function getOwnSellerCode(
  userInfos: Maybe<ApiUserInfo>,
): string {
  return userInfos?.sellerCode?.trim() ?? "";
}

export function getAccessibleSellers(
  userInfos: Maybe<ApiUserInfo>,
): ApiAccessSellerItem[] {
  const ownCode = getOwnSellerCode(userInfos);
  return (userInfos?.listAccessSellers ?? []).filter((item) => {
    const code = item.sellerCode?.trim();
    return Boolean(code) && code !== ownCode;
  });
}

export function getActingSellerCodeForApi(
  userInfos: Maybe<ApiUserInfo>,
  actingSellerCode: Maybe<string>,
): string | undefined {
  if (!hasSellerAccessList(userInfos)) return undefined;

  const selected = actingSellerCode?.trim();
  if (!selected) return undefined;

  const ownCode = getOwnSellerCode(userInfos);
  if (!ownCode || selected === ownCode) return undefined;

  const allowed = getAccessibleSellers(userInfos).some(
    (item) => item.sellerCode?.trim() === selected,
  );
  return allowed ? selected : undefined;
}

export function resolveActingSeller(
  userInfos: Maybe<ApiUserInfo>,
  actingSellerCode: Maybe<string>,
): Pick<ApiAccessSellerItem, "sellerCode" | "sellerName"> | null {
  if (!userInfos) return null;

  const ownCode = getOwnSellerCode(userInfos);
  const selected = actingSellerCode?.trim();

  if (selected && selected !== ownCode) {
    const match = getAccessibleSellers(userInfos).find(
      (item) => item.sellerCode?.trim() === selected,
    );
    if (match?.sellerCode?.trim()) {
      return {
        sellerCode: match.sellerCode.trim(),
        sellerName: match.sellerName?.trim() ?? null,
      };
    }
  }

  if (!ownCode) return null;

  const ownName =
    [userInfos.fname, userInfos.lname].filter(Boolean).join(" ").trim() ||
    userInfos.username?.trim() ||
    null;

  return { sellerCode: ownCode, sellerName: ownName };
}

export function getActingSellerDisplayLabel(
  userInfos: Maybe<ApiUserInfo>,
  actingSellerCode: Maybe<string>,
): string | null {
  const code = getActingSellerCodeForApi(userInfos, actingSellerCode);
  if (!code) return null;

  const seller = getAccessibleSellers(userInfos).find(
    (item) => item.sellerCode?.trim() === code,
  );
  const name = seller?.sellerName?.trim();
  return name ? `${name} (${code})` : code;
}

export function applyActingSellerToOrder<
  T extends { sellerCode?: string; sellerName?: string },
>(
  order: T,
  userInfos: Maybe<ApiUserInfo>,
  actingSellerCode: Maybe<string>,
): T {
  const seller = resolveActingSeller(userInfos, actingSellerCode);
  if (!seller?.sellerCode) return order;

  return {
    ...order,
    sellerCode: seller.sellerCode,
    ...(seller.sellerName ? { sellerName: seller.sellerName } : {}),
  };
}

export function appendActingSellerCommentsSuffix<
  T extends { sellerComments?: string | null },
>(
  order: T,
  userInfos: Maybe<ApiUserInfo>,
  actingSellerCode: Maybe<string>,
): T {
  if (!getActingSellerCodeForApi(userInfos, actingSellerCode)) {
    return order;
  }

  const username = userInfos?.username?.trim();
  if (!username) return order;

  const existing = order.sellerComments?.trim() ?? "";
  const suffix = `καταχωρήθηκε από ${username}`;
  const sellerComments = existing ? `${existing} - ${suffix}` : suffix;

  return {
    ...order,
    sellerComments,
  };
}
