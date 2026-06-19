import { parseProxyJson } from "@/lib/api/client";
import { getActingSellerCodeForApi } from "@/lib/sellerAccess";
import type { GetOrderEditSuccess } from "@/types/api/responses";
import type { ApiUserInfo } from "@/types/api/schemas";
import type { Maybe } from "@/types/api/common";

export async function fetchOrderEdit(params: {
  typeid: string;
  catid: number;
  uid?: string;
  sellercode?: string | null;
}): Promise<GetOrderEditSuccess> {
  const search = new URLSearchParams({
    _ts: String(Date.now()),
    typeid: params.typeid,
    catid: String(params.catid),
  });
  if (params.uid) search.set("uid", params.uid);
  if (params.sellercode) search.set("sellercode", params.sellercode);

  const res = await fetch(`/api/orders/edit?${search.toString()}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  return parseProxyJson<GetOrderEditSuccess>(res, "Failed to load order draft");
}

export function buildOrderEditParams(
  typeid: string,
  catid: number,
  auth: {
    userInfos: Maybe<ApiUserInfo>;
    actingSellerCode: string | null;
  },
  uid?: string,
): { typeid: string; catid: number; uid?: string; sellercode?: string | null } {
  const sellercode = getActingSellerCodeForApi(
    auth.userInfos,
    auth.actingSellerCode,
  );
  return { typeid, catid, uid, sellercode };
}
