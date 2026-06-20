import { parseProxyJson } from "@/lib/api/client";
import { formatStringToISODDateTime } from "@/lib/utils/date";
import { parseGreekDecimal } from "@/lib/utils/number";
import {
  applyActingSellerToOrder,
  appendActingSellerCommentsSuffix,
} from "@/lib/sellerAccess";
import type { BulkDraftSnapshot } from "@/store/orders/ordersSlice";
import type { PostOrderSuccess } from "@/types/api/responses";
import type { ApiUserInfo } from "@/types/api/schemas";
import type { Maybe } from "@/types/api/common";

type SubmitSlotDraftAuth = {
  userInfos: Maybe<ApiUserInfo>;
  actingSellerCode: string | null;
};

export function buildSlotSubmitPayload(
  snapshot: BulkDraftSnapshot,
  auth: SubmitSlotDraftAuth,
) {
  let order = { ...snapshot.order };
  if (!order.customer_tel?.trim() && order.customer_mobile?.trim()) {
    order.customer_tel = order.customer_mobile.trim();
  }
  if (!order.customer_mobile?.trim() && order.customer_tel?.trim()) {
    order.customer_mobile = order.customer_tel.trim();
  }
  if (!order.recipient_tel?.trim() && order.recipient_mobile?.trim()) {
    order.recipient_tel = order.recipient_mobile.trim();
  }
  order = applyActingSellerToOrder(
    order,
    auth.userInfos,
    auth.actingSellerCode,
  );
  order = appendActingSellerCommentsSuffix(
    order,
    auth.userInfos,
    auth.actingSellerCode,
  );

  const parsedFinalAmount = parseGreekDecimal(order.posoDiscounted);
  const canShowMidenikiToggle =
    order.payFullOrDiscount == 2 &&
    Number.isFinite(parsedFinalAmount) &&
    parsedFinalAmount === 0;
  const zeroParticipationConfirmed = order.eopyyVerifyNoParticipation == 1;

  return {
    order: {
      ...order,
      dateOfSyntagi: formatStringToISODDateTime(order.dateOfSyntagi),
      dateIsxyeiApo: formatStringToISODDateTime(order.dateIsxyeiApo),
      dateIsxyeiEos: formatStringToISODDateTime(order.dateIsxyeiEos),
      posoDiscounted: parseGreekDecimal(order.posoDiscounted),
      posoSymmetoxis: parseGreekDecimal(order.posoSymmetoxis),
      hasConfirmedMidenikiPliromi: zeroParticipationConfirmed
        ? true
        : canShowMidenikiToggle
          ? Boolean(order.hasConfirmedMidenikiPliromi)
          : null,
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION,
    },
    ylika: snapshot.ylika,
    isTempSave: order.isTempSave,
  };
}

export async function submitSlotDraft(
  snapshot: BulkDraftSnapshot,
  auth: SubmitSlotDraftAuth,
  signal?: AbortSignal,
): Promise<PostOrderSuccess> {
  const payload = buildSlotSubmitPayload(snapshot, auth);
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });

  return parseProxyJson<PostOrderSuccess>(res, "Failed to submit order");
}
