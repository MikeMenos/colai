import { fetchOrderEdit, buildOrderEditParams } from "@/lib/api/orderDraft";
import { formatUIDate } from "@/lib/utils/date";
import { pickFirstNonBlankString } from "@/lib/utils/string";
import type { BulkDraftSnapshot } from "@/store/orders/ordersSlice";
import type { OrderEditVM } from "@/types/api/schemas";
import type {
  AIMaterials,
  Order,
  OrderFile,
  OrderYlika,
} from "@/types/orders";

type LoadSlotDraftAuth = {
  userInfos: Parameters<typeof buildOrderEditParams>[2]["userInfos"];
  actingSellerCode: string | null;
};

export function mapOrderEditVmToSnapshot(
  data: OrderEditVM,
  expectedOrderUid?: string,
): BulkDraftSnapshot {
  const order = { ...data.order } as Order;
  if (expectedOrderUid) {
    order.uid = expectedOrderUid;
  }
  order.dateOfSyntagi = formatUIDate(order.dateOfSyntagi);
  order.dateIsxyeiApo = formatUIDate(order.dateIsxyeiApo);
  order.dateIsxyeiEos = formatUIDate(order.dateIsxyeiEos);

  const loadedOrderRecord = order as Record<string, unknown>;
  const mergedComments = pickFirstNonBlankString(
    order?.sellerComments,
    loadedOrderRecord.customer_notes,
    loadedOrderRecord.customer_Notes,
    order?.recipient_Notes,
  );
  if (mergedComments) {
    order.sellerComments = mergedComments;
  }

  const customerErpGID = order?.customer_ErpGID;
  const isExistingSavedOrder = Number(order?.id) > 0;
  let customerIsCompletelyNew = true;
  let customerSelectedFromList: boolean | undefined;
  let customerProsEbs: boolean | undefined;

  if (isExistingSavedOrder) {
    const customerGid = String(order.customer_ErpGID ?? "").trim();
    if (customerGid) {
      customerIsCompletelyNew = false;
      customerSelectedFromList = true;
      customerProsEbs = false;
    }

    const hasRecipeFiles = (data.files ?? []).some(
      (f) => f?.documentCategory === "recipe",
    );
    if (order?.aiCalculated || order?.statusId === 0 || hasRecipeFiles) {
      order.aiCalculated = true;
    }
  }

  return {
    order,
    ylika: (data.items ?? []) as OrderYlika[],
    files: (data.files ?? []) as OrderFile[],
    ai_ylika: (data.ai_ylika ?? []) as unknown as AIMaterials[],
    list_AddressesPersons: [],
    preselected_address_GID: undefined,
    preselected_person_GID: undefined,
    lastOrderInfoCustomerErpGID:
      customerErpGID && String(customerErpGID).trim()
        ? customerErpGID
        : undefined,
    customerProsEbs,
    customerSelectedFromList,
    customerIsCompletelyNew,
    lastWebOrderFromLoadInfo: undefined,
  };
}

export async function loadSlotDraft(
  orderUid: string,
  auth: LoadSlotDraftAuth,
): Promise<BulkDraftSnapshot> {
  const params = buildOrderEditParams("eopyy", 4, auth, orderUid);
  const response = await fetchOrderEdit(params);

  if (!response.ok || !response.data?.order) {
    throw new Error("Αποτυχία φόρτωσης παραγγελίας.");
  }

  return mapOrderEditVmToSnapshot(response.data, orderUid);
}
