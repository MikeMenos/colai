import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  AIMaterials,
  OrdeListOfSelections,
  Order,
  OrderFile,
  OrderListOfAddressPersons,
  OrderYlika,
  SaleOrder_CheckItem,
} from "@/types/orders";
import type {
  DeleteOrderSuccess,
  GetCustomerAddressesSuccess,
  GetOrderEditSuccess,
  GetOrdersSuccess,
  GetOrderViewSuccess,
  PostOrderSuccess,
} from "@/types/api/responses";
import type { PagingResults } from "@/types/api/common";
import { parseProxyJson } from "@/lib/api/client";
import {
  buildOrderListSearchParams,
  DEFAULT_ORDER_LIST_PAGE,
  DEFAULT_ORDER_LIST_PAGE_SIZE,
  PENDING_ORDER_STATUS_ID,
  sortOrdersPendingFirst,
} from "@/lib/api/orderListQuery";
import type {
  IDoctorFormData,
  IPatientFormData,
  IRecipientFormData,
} from "@/lib/interface";
import { AppDispatch, RootState } from "@/store/store";
import { formatStringToISODDateTime, formatUIDate } from "@/lib/utils/date";
import { parseGreekDecimal } from "@/lib/utils/number";
import { pickFirstNonBlankString } from "@/lib/utils/string";
import {
  pickDefaultAddressGid,
  pickDefaultPersonRow,
} from "@/lib/utils/customerAddresses";
import type { SynaineseisResults } from "@/lib/consentUpload";
import {
  applyActingSellerToOrder,
  appendActingSellerCommentsSuffix,
  getActingSellerCodeForApi,
} from "@/lib/sellerAccess";

type OrderDraftType = "eopyy" | "non_eoppy";

export interface DraftState {
  editState: { loading: boolean; error: string | null };
  submitState: { loading: boolean; error: string | null };
  order: Order;
  ylika: OrderYlika[];
  files: OrderFile[];
  list_LogosParalipti: OrdeListOfSelections[];
  list_SygeniaParalipti: OrdeListOfSelections[];
  list_DiscountReasons: OrdeListOfSelections[];
  list_KatigoriesParoxis: OrdeListOfSelections[];
  list_TroposApostolis: OrdeListOfSelections[];
  list_AddressesPersons: OrderListOfAddressPersons[];
  preselected_address_GID?: string;
  preselected_person_GID?: string;
  ai_ylika: AIMaterials[];
  synaineseisResults: SynaineseisResults | null;
  lastOrderInfoCustomerErpGID?: string;
  customerProsEbs?: boolean;
  customerSelectedFromList?: boolean;
  customerIsCompletelyNew?: boolean;
  /** Set from `POST /api/load-last-customer-order-info` — `null` means no prior web order. */
  lastWebOrderFromLoadInfo?: Record<string, unknown> | null;
  /** Step 2 AMKA gate completed (manual flow without AI). */
  customerAmkaGateCompleted?: boolean;
}

/** Isolated draft payload used by bulk ΕΟΠΥΥ slot processing (not persisted to localStorage). */
export type BulkDraftSnapshot = Pick<
  DraftState,
  | "order"
  | "ylika"
  | "files"
  | "ai_ylika"
  | "list_AddressesPersons"
  | "preselected_address_GID"
  | "preselected_person_GID"
  | "lastOrderInfoCustomerErpGID"
  | "customerProsEbs"
  | "customerSelectedFromList"
  | "customerIsCompletelyNew"
  | "lastWebOrderFromLoadInfo"
>;

export function captureBulkDraftSnapshot(state: RootState): BulkDraftSnapshot {
  const { draft } = state.orders;
  return {
    order: { ...draft.order },
    ylika: [...draft.ylika],
    files: [...draft.files],
    ai_ylika: [...draft.ai_ylika],
    list_AddressesPersons: [...draft.list_AddressesPersons],
    preselected_address_GID: draft.preselected_address_GID,
    preselected_person_GID: draft.preselected_person_GID,
    lastOrderInfoCustomerErpGID: draft.lastOrderInfoCustomerErpGID,
    customerProsEbs: draft.customerProsEbs,
    customerSelectedFromList: draft.customerSelectedFromList,
    customerIsCompletelyNew: draft.customerIsCompletelyNew,
    lastWebOrderFromLoadInfo: draft.lastWebOrderFromLoadInfo,
  };
}

export interface SelectedOrderState {
  order: Order;
  ylika: OrderYlika[];
  files: OrderFile[];
  checkErrors: SaleOrder_CheckItem[] | null;
  loading: boolean;
  loadingError: string | null;
  saving: boolean;
  saveError: string | null;
}

export interface OrdersState {
  orders: Order[];
  loadingOrders: boolean;
  refreshingOrders: boolean;
  ordersError: string | null;
  draft: DraftState;
  selected: SelectedOrderState | null;
  ordersQuery: string;
  ordersPage: number;
  ordersPageSize: number;
  ordersPaging: PagingResults | null;
  ordersFetchedAt: number;
  pendingOrdersCount: number;
  loadingPendingOrdersCount: boolean;
}

export const fetchOrders = createAsyncThunk<
  { orders: Order[]; paging: PagingResults | null },
  { q?: string; page?: number; pagesize?: number; force?: boolean } | void,
  { state: RootState }
>(
  "orders/fetchOrders",
  async (arg) => {
    const q = typeof arg === "object" && arg?.q ? arg.q.trim() : "";
    const page =
      typeof arg === "object" && arg?.page
        ? arg.page
        : DEFAULT_ORDER_LIST_PAGE;
    const pagesize =
      typeof arg === "object" && arg?.pagesize
        ? arg.pagesize
        : DEFAULT_ORDER_LIST_PAGE_SIZE;

    const params = buildOrderListSearchParams({
      search: q,
      page,
      pagesize,
      _ts: Date.now(),
    });

    const res = await fetch(`/api/orders?${params.toString()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    const data = await parseProxyJson<GetOrdersSuccess>(
      res,
      "Failed to load orders",
    );

    return {
      orders: sortOrdersPendingFirst((data.orders ?? []) as Order[]),
      paging: data.paging ?? null,
    };
  },
  {
    condition: (arg, { getState }) => {
      const state = getState();
      const q = typeof arg === "object" && arg?.q ? arg.q.trim() : "";
      const page =
        typeof arg === "object" && arg?.page
          ? arg.page
          : DEFAULT_ORDER_LIST_PAGE;
      const pagesize =
        typeof arg === "object" && arg?.pagesize
          ? arg.pagesize
          : DEFAULT_ORDER_LIST_PAGE_SIZE;
      const force = typeof arg === "object" && arg?.force;

      if (force)
        return !(state.orders.refreshingOrders || state.orders.loadingOrders);

      if (state.orders.loadingOrders || state.orders.refreshingOrders)
        return false;

      if (
        state.orders.orders.length > 0 &&
        state.orders.ordersQuery === q &&
        state.orders.ordersPage === page &&
        state.orders.ordersPageSize === pagesize
      ) {
        return false;
      }

      return true;
    },
  },
);

export const fetchPendingOrdersCount = createAsyncThunk<
  number,
  void | { force?: boolean },
  { state: RootState }
>(
  "orders/fetchPendingOrdersCount",
  async () => {
    const params = buildOrderListSearchParams({
      page: 1,
      pagesize: 500,
      _ts: Date.now(),
    });

    const res = await fetch(`/api/orders?${params.toString()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    const data = await parseProxyJson<GetOrdersSuccess>(
      res,
      "Failed to load pending orders count",
    );

    return (data.orders ?? []).filter(
      (o) => o.statusId === PENDING_ORDER_STATUS_ID,
    ).length;
  },
  {
    condition: (arg, { getState }) => {
      if (arg && typeof arg === "object" && arg.force) return true;
      return !getState().orders.loadingPendingOrdersCount;
    },
  },
);

export const fetchOrderById = createAsyncThunk<
  GetOrderViewSuccess,
  { orderId: number; orderUID: string }
>("orders/fetchOrderById", async ({ orderId, orderUID }) => {
  const res = await fetch(
    `/api/orders/${orderId}?_ts=${Date.now()}&uid=${orderUID}`,
    { cache: "no-store" },
  );
  return parseProxyJson<GetOrderViewSuccess>(res, "Failed to load order");
});

export const deleteOrderAsync = createAsyncThunk<
  DeleteOrderSuccess & { orderId: number; orderUID: string },
  { orderId: number; orderUID: string },
  { dispatch: AppDispatch }
>("orders/deleteOrder", async ({ orderId, orderUID }, { dispatch }) => {
  const res = await fetch(`/api/orders/${orderId}?uid=${orderUID}`, {
    method: "DELETE",
    cache: "no-store",
  });
  const data = await parseProxyJson<DeleteOrderSuccess>(
    res,
    "Failed to delete order",
  );
  void dispatch(fetchPendingOrdersCount({ force: true }));
  return { ...data, orderId, orderUID };
});

export const submitDraftAsync = createAsyncThunk<
  PostOrderSuccess,
  void,
  { state: RootState }
>("orders/submitDraftAsync", async (_, thunkApi) => {
  const state = thunkApi.getState();
  const { draft } = state.orders;

  let order = { ...draft.order };
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
    state.auth.userInfos,
    state.auth.actingSellerCode,
  );
  order = appendActingSellerCommentsSuffix(
    order,
    state.auth.userInfos,
    state.auth.actingSellerCode,
  );
  const parsedFinalAmount = parseGreekDecimal(order.posoDiscounted);
  const canShowMidenikiToggle =
    order.payFullOrDiscount == 2 &&
    Number.isFinite(parsedFinalAmount) &&
    parsedFinalAmount === 0;
  const zeroParticipationConfirmed = order.eopyyVerifyNoParticipation == 1;

  const payload = {
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
    ylika: draft.ylika,
    isTempSave: draft.order.isTempSave,
  };

  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseProxyJson<PostOrderSuccess>(res, "Failed to submit order");
});

export const editDraftAsync = createAsyncThunk<
  GetOrderEditSuccess,
  { typeid: string; catid: number; uid?: string },
  { state: RootState }
>("orders/editDraftAsync", async ({ typeid, catid, uid }, { getState }) => {
  const { auth } = getState();
  const params = new URLSearchParams({
    _ts: String(Date.now()),
    typeid,
    catid: String(catid),
  });
  if (uid) params.set("uid", uid);

  const sellercode = getActingSellerCodeForApi(
    auth.userInfos,
    auth.actingSellerCode,
  );
  if (sellercode) params.set("sellercode", sellercode);

  const res = await fetch(`/api/orders/edit?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });

  return parseProxyJson<GetOrderEditSuccess>(res, "Failed to submit order");
});

export type LoadCustomerAddressesArgs = {
  customer_ErpGID: string | undefined;
  customer_name: string | undefined;
  customer_address: string | undefined;
  customer_amka: string | undefined;
  /** If set and present in the API addresses list, selects this person (e.g. last_order_info.person_ErpGID). */
  preferredPersonErpGID?: string | null;
  preferredAddressErpGID?: string | null;
};

export const loadCustomerAddressesAsync = createAsyncThunk<
  GetCustomerAddressesSuccess,
  LoadCustomerAddressesArgs
>(
  "orders/loadCustomerAddressesAsync",
  async ({
    customer_ErpGID,
    customer_name,
    customer_address,
    customer_amka,
  }) => {
    const res = await fetch(
      `/api/customers/${customer_ErpGID}/addresses?customerAMKA=${customer_amka ?? ""}&customerName=${customer_name ?? ""}&customerAddress=${customer_address ?? ""}&_ts=${Date.now()}`,
      {
        method: "GET",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      },
    );

    return parseProxyJson<GetCustomerAddressesSuccess>(
      res,
      "Failed to load addresses",
    );
  },
);

const initialStateBase: OrdersState = {
  orders: [],
  loadingOrders: false,
  refreshingOrders: false,
  ordersError: null,
  draft: {
    editState: { loading: false, error: null },
    submitState: { loading: false, error: null },
    order: {} as Order,
    ylika: [] as OrderYlika[],
    files: [] as OrderFile[],
    list_DiscountReasons: [] as OrdeListOfSelections[],
    list_KatigoriesParoxis: [] as OrdeListOfSelections[],
    list_LogosParalipti: [] as OrdeListOfSelections[],
    list_SygeniaParalipti: [] as OrdeListOfSelections[],
    list_TroposApostolis: [] as OrdeListOfSelections[],
    list_AddressesPersons: [] as OrderListOfAddressPersons[],
    ai_ylika: [] as AIMaterials[],
    synaineseisResults: null,
  },
  selected: null,
  ordersQuery: "",
  ordersPage: DEFAULT_ORDER_LIST_PAGE,
  ordersPageSize: DEFAULT_ORDER_LIST_PAGE_SIZE,
  ordersPaging: null,
  ordersFetchedAt: 0,
  pendingOrdersCount: 0,
  loadingPendingOrdersCount: false,
};

const LS_KEY = "orders";

function loadStateFromLocalStorage(): OrdersState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as any;
    if (!parsed || typeof parsed !== "object") return null;

    return {
      ...initialStateBase,
      draft: {
        ...initialStateBase.draft,
        order: (parsed?.order ?? initialStateBase.draft.order) as Order,
        ylika: (parsed?.ylika ?? initialStateBase.draft.ylika) as OrderYlika[],
        files: (parsed?.files ?? initialStateBase.draft.files) as OrderFile[],
        list_DiscountReasons: (parsed?.list_DiscountReasons ??
          initialStateBase.draft
            .list_DiscountReasons) as OrdeListOfSelections[],
        list_KatigoriesParoxis: (parsed?.list_KatigoriesParoxis ??
          initialStateBase.draft
            .list_KatigoriesParoxis) as OrdeListOfSelections[],
        list_LogosParalipti: (parsed?.list_LogosParalipti ??
          initialStateBase.draft.list_LogosParalipti) as OrdeListOfSelections[],
        list_SygeniaParalipti: (parsed?.list_SygeniaParalipti ??
          initialStateBase.draft
            .list_SygeniaParalipti) as OrdeListOfSelections[],
        list_TroposApostolis: (parsed?.list_TroposApostolis ??
          initialStateBase.draft
            .list_TroposApostolis) as OrdeListOfSelections[],
        ai_ylika: (parsed?.ai_ylika ??
          initialStateBase.draft.ai_ylika) as AIMaterials[],
        lastOrderInfoCustomerErpGID:
          parsed?.lastOrderInfoCustomerErpGID ??
          initialStateBase.draft.lastOrderInfoCustomerErpGID,
        customerProsEbs:
          parsed?.customerProsEbs ?? initialStateBase.draft.customerProsEbs,
        customerSelectedFromList:
          parsed?.customerSelectedFromList ??
          initialStateBase.draft.customerSelectedFromList,
        customerIsCompletelyNew:
          parsed?.customerIsCompletelyNew ??
          initialStateBase.draft.customerIsCompletelyNew,
        lastWebOrderFromLoadInfo:
          parsed?.lastWebOrderFromLoadInfo ??
          initialStateBase.draft.lastWebOrderFromLoadInfo,
        customerAmkaGateCompleted:
          parsed?.customerAmkaGateCompleted ??
          initialStateBase.draft.customerAmkaGateCompleted,
      },
    };
  } catch {
    return null;
  }
}

function persistStateToLocalStorage(state: OrdersState) {
  if (typeof window === "undefined") return;

  const toSave = {
    order: state.draft.order,
    ylika: state.draft.ylika,
    files: state.draft.files,
    list_DiscountReasons: state.draft.list_DiscountReasons,
    list_KatigoriesParoxis: state.draft.list_KatigoriesParoxis,
    list_LogosParalipti: state.draft.list_LogosParalipti,
    list_SygeniaParalipti: state.draft.list_SygeniaParalipti,
    list_TroposApostolis: state.draft.list_TroposApostolis,
    ai_ylika: state.draft.ai_ylika,
    lastOrderInfoCustomerErpGID: state.draft.lastOrderInfoCustomerErpGID,
    customerProsEbs: state.draft.customerProsEbs,
    customerSelectedFromList: state.draft.customerSelectedFromList,
    customerIsCompletelyNew: state.draft.customerIsCompletelyNew,
    lastWebOrderFromLoadInfo: state.draft.lastWebOrderFromLoadInfo,
    customerAmkaGateCompleted: state.draft.customerAmkaGateCompleted,
  };

  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  } catch {
    // ignore quota / private mode issues
  }
}

const ordersSlice = createSlice({
  name: "orders",
  initialState: () => loadStateFromLocalStorage() ?? initialStateBase,
  reducers: {
    startDraft(state, action: PayloadAction<{ type: OrderDraftType }>) {
      state.draft.order.type = action.payload.type;
      persistStateToLocalStorage(state);
    },
    deletedDraftTemplate(state) {
      state.draft.order = {} as Order;
      state.draft.ylika = [] as OrderYlika[];
      persistStateToLocalStorage(state);
    },
    resetOrdersListCache(state) {
      state.orders = [];
      state.loadingOrders = false;
      state.refreshingOrders = false;
      state.ordersError = null;
      state.ordersQuery = "";
      state.ordersPage = DEFAULT_ORDER_LIST_PAGE;
      state.ordersPageSize = DEFAULT_ORDER_LIST_PAGE_SIZE;
      state.ordersPaging = null;
      state.ordersFetchedAt = 0;
      state.selected = null;
    },
    /** Full draft reset (order, ylika, files, lists, addresses, AI materials, etc.) — e.g. when leaving the order wizard. */
    resetEntireDraft(state) {
      state.draft.editState = { loading: false, error: null };
      state.draft.submitState = { loading: false, error: null };
      state.draft.order = {} as Order;
      state.draft.ylika = [] as OrderYlika[];
      state.draft.files = [] as OrderFile[];
      state.draft.list_DiscountReasons = [] as OrdeListOfSelections[];
      state.draft.list_KatigoriesParoxis = [] as OrdeListOfSelections[];
      state.draft.list_LogosParalipti = [] as OrdeListOfSelections[];
      state.draft.list_SygeniaParalipti = [] as OrdeListOfSelections[];
      state.draft.list_TroposApostolis = [] as OrdeListOfSelections[];
      state.draft.list_AddressesPersons = [] as OrderListOfAddressPersons[];
      state.draft.preselected_address_GID = undefined;
      state.draft.preselected_person_GID = undefined;
      state.draft.ai_ylika = [] as AIMaterials[];
      state.draft.synaineseisResults = null;
      state.draft.lastOrderInfoCustomerErpGID = undefined;
      state.draft.customerProsEbs = undefined;
      state.draft.customerSelectedFromList = undefined;
      state.draft.customerIsCompletelyNew = true;
      state.draft.lastWebOrderFromLoadInfo = undefined;
      state.draft.customerAmkaGateCompleted = undefined;
      persistStateToLocalStorage(state);
    },
    /** Hydrate Redux draft from a bulk slot snapshot for AI apply (does not persist). */
    replaceDraftSnapshot(state, action: PayloadAction<BulkDraftSnapshot>) {
      const snapshot = action.payload;
      state.draft.order = snapshot.order;
      state.draft.ylika = snapshot.ylika;
      state.draft.files = snapshot.files;
      state.draft.ai_ylika = snapshot.ai_ylika;
      state.draft.list_AddressesPersons = snapshot.list_AddressesPersons;
      state.draft.preselected_address_GID = snapshot.preselected_address_GID;
      state.draft.preselected_person_GID = snapshot.preselected_person_GID;
      state.draft.lastOrderInfoCustomerErpGID =
        snapshot.lastOrderInfoCustomerErpGID;
      state.draft.customerProsEbs = snapshot.customerProsEbs;
      state.draft.customerSelectedFromList = snapshot.customerSelectedFromList;
      state.draft.customerIsCompletelyNew = snapshot.customerIsCompletelyNew;
      state.draft.lastWebOrderFromLoadInfo = snapshot.lastWebOrderFromLoadInfo;
    },
    clearDraftAddressesList(state) {
      state.draft.list_AddressesPersons = [] as OrderListOfAddressPersons[];
      state.draft.preselected_address_GID = undefined;
      state.draft.preselected_person_GID = undefined;
      persistStateToLocalStorage(state);
    },
    setDraftProperty(
      state,
      action: PayloadAction<{ key: keyof Order; value: any }>,
    ) {
      state.draft.order = {
        ...state.draft.order,
        [action.payload.key]: action.payload.value,
      };

      if (
        [
          "symmPercentage",
          "kostos",
          "eidos_Egkrisis",
          "plafonGiftAmount",
          "maxPosoKostousGiaSymmetoxi",
        ].includes(action.payload.key)
      ) {
        const eidosEgkrisis = state.draft.order.eidos_Egkrisis;
        const type = state.draft.order.type;
        const kostos = Number(state.draft.order.kostos ?? 0);
        const symmPercentage = Number(state.draft.order.symmPercentage ?? 0);
        const maxPosoKostousGiaSymmetoxi = Number(
          state.draft.order.maxPosoKostousGiaSymmetoxi ?? 0,
        );
        const plafonGiftAmount = Number(
          state.draft.order.plafonGiftAmount ?? 0,
        );
        if (
          maxPosoKostousGiaSymmetoxi > 0 &&
          kostos > maxPosoKostousGiaSymmetoxi &&
          eidosEgkrisis == 1 &&
          type == "eopyy"
        ) {
          const diafora = kostos - maxPosoKostousGiaSymmetoxi;
          state.draft.order.posoSymmetoxis =
            (maxPosoKostousGiaSymmetoxi * symmPercentage) / 100 +
            (diafora > plafonGiftAmount ? diafora : 0);
        } else {
          state.draft.order.posoSymmetoxis = kostos * (symmPercentage / 100);
        }
      }

      persistStateToLocalStorage(state);
    },
    setAIMaterials(state, action: PayloadAction<AIMaterials[]>) {
      state.draft.ai_ylika = action.payload;
      persistStateToLocalStorage(state);
    },
    setDraftYlika(state, action: PayloadAction<OrderYlika[]>) {
      state.draft.ylika = action.payload;
      state.draft.order.kostos = state.draft.ylika.reduce(
        (acc, x) =>
          acc +
          (Number(x.qty) *
            Number(
              x[
                state.draft.order.type == "eopyy"
                  ? "erp_EoppyPrice"
                  : "erp_Price"
              ],
            ) || 0),
        0,
      );
      state.draft.order.kostos_EOPPY = state.draft.ylika.reduce(
        (acc, x) => acc + Number(x.qty) * Number(x.erp_EoppyPrice || 0),
        0,
      );
      state.draft.order.kostos_RETAIL = state.draft.ylika.reduce(
        (acc, x) => acc + Number(x.qty) * Number(x.erp_Price || 0),
        0,
      );
      const eidosEgkrisis = state.draft.order.eidos_Egkrisis;
      const type = state.draft.order.type;
      const kostos = Number(state.draft.order.kostos ?? 0);
      const symmPercentage = Number(state.draft.order.symmPercentage ?? 0);
      const maxPosoKostousGiaSymmetoxi = Number(
        state.draft.order.maxPosoKostousGiaSymmetoxi ?? 0,
      );
      const plafonGiftAmount = Number(state.draft.order.plafonGiftAmount ?? 0);
      if (
        maxPosoKostousGiaSymmetoxi > 0 &&
        kostos > maxPosoKostousGiaSymmetoxi &&
        eidosEgkrisis == 1 &&
        type == "eopyy"
      ) {
        const diafora = kostos - maxPosoKostousGiaSymmetoxi;
        state.draft.order.posoSymmetoxis =
          (maxPosoKostousGiaSymmetoxi * symmPercentage) / 100 +
          (diafora > plafonGiftAmount ? diafora : 0);
      } else {
        state.draft.order.posoSymmetoxis = kostos * (symmPercentage / 100);
      }
      persistStateToLocalStorage(state);
    },
    setDraftFiles(state, action: PayloadAction<OrderFile[]>) {
      state.draft.files = action.payload;
      persistStateToLocalStorage(state);
    },
    setSynaineseisResults(
      state,
      action: PayloadAction<SynaineseisResults | null>,
    ) {
      state.draft.synaineseisResults = action.payload;
    },
    setLastOrderInfoCustomerErpGID(
      state,
      action: PayloadAction<string | undefined>,
    ) {
      state.draft.lastOrderInfoCustomerErpGID = action.payload;
      persistStateToLocalStorage(state);
    },
    setCustomerProsEbs(state, action: PayloadAction<boolean | undefined>) {
      state.draft.customerProsEbs = action.payload;
      persistStateToLocalStorage(state);
    },
    setCustomerSelectedFromList(
      state,
      action: PayloadAction<boolean | undefined>,
    ) {
      state.draft.customerSelectedFromList = action.payload;
      persistStateToLocalStorage(state);
    },
    setCustomerIsCompletelyNew(
      state,
      action: PayloadAction<boolean | undefined>,
    ) {
      state.draft.customerIsCompletelyNew = action.payload;
      persistStateToLocalStorage(state);
    },
    setLastWebOrderFromLoadInfo(
      state,
      action: PayloadAction<Record<string, unknown> | null | undefined>,
    ) {
      state.draft.lastWebOrderFromLoadInfo = action.payload;
      persistStateToLocalStorage(state);
    },
    setCustomerAmkaGateCompleted(
      state,
      action: PayloadAction<boolean | undefined>,
    ) {
      state.draft.customerAmkaGateCompleted = action.payload;
      persistStateToLocalStorage(state);
    },
    addDraftYliko(state, action: PayloadAction<OrderYlika>) {
      state.draft.ylika.push(action.payload);
      state.draft.order.kostos = state.draft.ylika.reduce(
        (acc, x) =>
          acc +
          (Number(x.qty) *
            Number(
              x[
                state.draft.order.type == "eopyy"
                  ? "erp_EoppyPrice"
                  : "erp_Price"
              ],
            ) || 0),
        0,
      );
      state.draft.order.kostos_EOPPY = state.draft.ylika.reduce(
        (acc, x) => acc + Number(x.qty) * Number(x.erp_EoppyPrice || 0),
        0,
      );
      state.draft.order.kostos_RETAIL = state.draft.ylika.reduce(
        (acc, x) => acc + Number(x.qty) * Number(x.erp_Price || 0),
        0,
      );

      const eidosEgkrisis = state.draft.order.eidos_Egkrisis;
      const type = state.draft.order.type;
      const kostos = Number(state.draft.order.kostos ?? 0);
      const symmPercentage = Number(state.draft.order.symmPercentage ?? 0);
      const maxPosoKostousGiaSymmetoxi = Number(
        state.draft.order.maxPosoKostousGiaSymmetoxi ?? 0,
      );
      const plafonGiftAmount = Number(state.draft.order.plafonGiftAmount ?? 0);
      if (
        maxPosoKostousGiaSymmetoxi > 0 &&
        kostos > maxPosoKostousGiaSymmetoxi &&
        eidosEgkrisis == 1 &&
        type == "eopyy"
      ) {
        const diafora = kostos - maxPosoKostousGiaSymmetoxi;
        state.draft.order.posoSymmetoxis =
          (maxPosoKostousGiaSymmetoxi * symmPercentage) / 100 +
          (diafora > plafonGiftAmount ? diafora : 0);
      } else {
        state.draft.order.posoSymmetoxis = kostos * (symmPercentage / 100);
      }
      persistStateToLocalStorage(state);
    },
    updateDraftYlikoQuantity: (
      state,
      action: PayloadAction<{ index: number; quantity: number }>,
    ) => {
      const { index, quantity } = action.payload;
      if (state.draft.ylika[index]) {
        state.draft.ylika[index].qty = quantity;
      }

      state.draft.order.kostos = state.draft.ylika.reduce(
        (acc, x) =>
          acc +
          (Number(x.qty) *
            Number(
              x[
                state.draft.order.type == "eopyy"
                  ? "erp_EoppyPrice"
                  : "erp_Price"
              ],
            ) || 0),
        0,
      );
      state.draft.order.kostos_EOPPY = state.draft.ylika.reduce(
        (acc, x) => acc + Number(x.qty) * Number(x.erp_EoppyPrice || 0),
        0,
      );
      state.draft.order.kostos_RETAIL = state.draft.ylika.reduce(
        (acc, x) => acc + Number(x.qty) * Number(x.erp_Price || 0),
        0,
      );

      const eidosEgkrisis = state.draft.order.eidos_Egkrisis;
      const type = state.draft.order.type;
      const kostos = Number(state.draft.order.kostos ?? 0);
      const symmPercentage = Number(state.draft.order.symmPercentage ?? 0);
      const maxPosoKostousGiaSymmetoxi = Number(
        state.draft.order.maxPosoKostousGiaSymmetoxi ?? 0,
      );
      const plafonGiftAmount = Number(state.draft.order.plafonGiftAmount ?? 0);
      if (
        maxPosoKostousGiaSymmetoxi > 0 &&
        kostos > maxPosoKostousGiaSymmetoxi &&
        eidosEgkrisis == 1 &&
        type == "eopyy"
      ) {
        const diafora = kostos - maxPosoKostousGiaSymmetoxi;
        state.draft.order.posoSymmetoxis =
          (maxPosoKostousGiaSymmetoxi * symmPercentage) / 100 +
          (diafora > plafonGiftAmount ? diafora : 0);
      } else {
        state.draft.order.posoSymmetoxis = kostos * (symmPercentage / 100);
      }

      persistStateToLocalStorage(state);
    },
    removeDraftYliko: (state, action: PayloadAction<number>) => {
      state.draft.ylika.splice(action.payload, 1);
      state.draft.order.kostos = state.draft.ylika.reduce(
        (acc, x) =>
          acc +
          (Number(x.qty) *
            Number(
              x[
                state.draft.order.type == "eopyy"
                  ? "erp_EoppyPrice"
                  : "erp_Price"
              ],
            ) || 0),
        0,
      );
      state.draft.order.kostos_EOPPY = state.draft.ylika.reduce(
        (acc, x) => acc + Number(x.qty) * Number(x.erp_EoppyPrice || 0),
        0,
      );
      state.draft.order.kostos_RETAIL = state.draft.ylika.reduce(
        (acc, x) => acc + Number(x.qty) * Number(x.erp_Price || 0),
        0,
      );

      const eidosEgkrisis = state.draft.order.eidos_Egkrisis;
      const type = state.draft.order.type;
      const kostos = Number(state.draft.order.kostos ?? 0);
      const symmPercentage = Number(state.draft.order.symmPercentage ?? 0);
      const maxPosoKostousGiaSymmetoxi = Number(
        state.draft.order.maxPosoKostousGiaSymmetoxi ?? 0,
      );
      const plafonGiftAmount = Number(state.draft.order.plafonGiftAmount ?? 0);
      if (
        maxPosoKostousGiaSymmetoxi > 0 &&
        kostos > maxPosoKostousGiaSymmetoxi &&
        eidosEgkrisis == 1 &&
        type == "eopyy"
      ) {
        const diafora = kostos - maxPosoKostousGiaSymmetoxi;
        state.draft.order.posoSymmetoxis =
          (maxPosoKostousGiaSymmetoxi * symmPercentage) / 100 +
          (diafora > plafonGiftAmount ? diafora : 0);
      } else {
        state.draft.order.posoSymmetoxis = kostos * (symmPercentage / 100);
      }

      persistStateToLocalStorage(state);
    },
    removeAIMaterial: (state, action: PayloadAction<number>) => {
      state.draft.ai_ylika.splice(action.payload, 1);
      persistStateToLocalStorage(state);
    },
    setDraftSyntagiUploaded(state, action: PayloadAction<OrderFile>) {
      if (!state.draft.files) state.draft.files = [];
      const category = String(
        action.payload.documentCategory ??
          action.payload.document_category ??
          "",
      );
      if (category === "consent_form") {
        state.draft.files = state.draft.files.filter(
          (f) =>
            String(f.documentCategory ?? f.document_category ?? "") !==
            "consent_form",
        );
        action.payload.position = 0;
      }
      state.draft.files.push(action.payload);
      persistStateToLocalStorage(state);
    },
    patchDraftPatient(state, action: PayloadAction<Partial<IPatientFormData>>) {
      // state.draft.patient = { ...state.draft.patient, ...action.payload };
      return state;
    },
    patchDraftRecipient(
      state,
      action: PayloadAction<Partial<IRecipientFormData>>,
    ) {
      // state.draft.recipient = { ...state.draft.recipient, ...action.payload };
      return state;
    },
    patchDraftDoctor(state, action: PayloadAction<Partial<IDoctorFormData>>) {
      // state.draft.doctor = { ...state.draft.doctor, ...action.payload };
      return state;
    },
    submitDraft(state) {
      // state.draft = initialDraft();
      return state;
    },
    clearDraftSubmitError(state) {
      state.draft.submitState.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchOrders.pending, (state, action) => {
      const force =
        typeof action.meta.arg === "object" &&
        !!(action.meta.arg as any)?.force;
      if (force) state.refreshingOrders = true;
      else state.loadingOrders = true;
      state.ordersError = null;
    });
    b.addCase(fetchOrders.fulfilled, (state, action) => {
      const force =
        typeof action.meta.arg === "object" &&
        !!(action.meta.arg as any)?.force;
      if (force) state.refreshingOrders = false;
      else state.loadingOrders = false;

      state.orders = action.payload.orders;
      state.ordersPaging = action.payload.paging;

      const q =
        typeof action.meta.arg === "object" && action.meta.arg?.q
          ? action.meta.arg.q.trim()
          : "";
      const page =
        typeof action.meta.arg === "object" && action.meta.arg?.page
          ? action.meta.arg.page
          : DEFAULT_ORDER_LIST_PAGE;
      const pagesize =
        typeof action.meta.arg === "object" && action.meta.arg?.pagesize
          ? action.meta.arg.pagesize
          : DEFAULT_ORDER_LIST_PAGE_SIZE;

      state.ordersQuery = q;
      state.ordersPage = page;
      state.ordersPageSize = pagesize;
      state.ordersFetchedAt = Date.now();
    });
    b.addCase(fetchOrders.rejected, (state, action) => {
      const force =
        typeof action.meta.arg === "object" &&
        !!(action.meta.arg as any)?.force;
      if (force) state.refreshingOrders = false;
      else state.loadingOrders = false;

      state.ordersError = action.error.message || "Failed to load orders";
    });
    b.addCase(fetchPendingOrdersCount.pending, (state) => {
      state.loadingPendingOrdersCount = true;
    });
    b.addCase(fetchPendingOrdersCount.fulfilled, (state, action) => {
      state.loadingPendingOrdersCount = false;
      state.pendingOrdersCount = action.payload;
    });
    b.addCase(fetchPendingOrdersCount.rejected, (state) => {
      state.loadingPendingOrdersCount = false;
    });
    b.addCase(fetchOrderById.pending, (state) => {
      if (!state.selected) state.selected = {} as SelectedOrderState;
      state.selected.loading = true;
      state.selected.loadingError = null;
    });
    b.addCase(fetchOrderById.fulfilled, (state, action) => {
      if (!state.selected) state.selected = {} as SelectedOrderState;
      state.selected.loading = false;
      state.selected.loadingError = null;
      state.selected.order = action.payload?.order as Order;
      state.selected.ylika = (action.payload?.items ?? []) as OrderYlika[];
      state.selected.files = (action.payload?.files ?? []) as OrderFile[];
      state.selected.checkErrors = action.payload?.check_errors ?? null;
    });
    b.addCase(fetchOrderById.rejected, (state, action) => {
      if (!state.selected) state.selected = {} as SelectedOrderState;
      state.selected.loading = false;
      state.selected.loadingError =
        action.error.message || "Failed to load order";
      state.selected.order = null as any;
    });
    b.addCase(editDraftAsync.pending, (state) => {
      state.draft.editState.loading = true;
      state.draft.editState.error = null;
    });
    b.addCase(editDraftAsync.fulfilled, (state, action) => {
      state.draft.editState.loading = false;
      if (action.payload.ok) {
        const prevOrder = state.draft.order;
        const order = action.payload.data?.order;
        state.draft.order = order as Order;
        state.draft.order.dateOfSyntagi = formatUIDate(order.dateOfSyntagi);
        state.draft.order.dateIsxyeiApo = formatUIDate(order.dateIsxyeiApo);
        state.draft.order.dateIsxyeiEos = formatUIDate(order.dateIsxyeiEos);
        const loadedOrderRecord = order as Record<string, unknown>;
        const mergedComments = pickFirstNonBlankString(
          order?.sellerComments,
          loadedOrderRecord.customer_notes,
          loadedOrderRecord.customer_Notes,
          order?.recipient_Notes,
        );
        if (mergedComments) {
          state.draft.order.sellerComments = mergedComments;
        }
        const prevUid =
          prevOrder?.uid != null ? String(prevOrder.uid).trim() : "";
        const nextUid = order?.uid != null ? String(order.uid).trim() : "";
        const sameOrderUid =
          prevUid !== "" && nextUid !== "" && prevUid === nextUid;
        if (sameOrderUid) {
          const prevC =
            prevOrder?.customer_ErpGID != null
              ? String(prevOrder.customer_ErpGID).trim()
              : "";
          const nextC =
            order?.customer_ErpGID != null
              ? String(order.customer_ErpGID).trim()
              : "";
          if (!nextC && prevC) {
            state.draft.order.customer_ErpGID = prevOrder.customer_ErpGID;
            if (
              !order?.customer_amka?.trim() &&
              prevOrder.customer_amka?.trim()
            ) {
              state.draft.order.customer_amka = prevOrder.customer_amka;
            }
          }
          if (prevC && nextC && prevC === nextC) {
            const prevP = prevOrder.person_ErpGID?.trim();
            const prevA = prevOrder.address_ErpGID?.trim();
            const nextP = order?.person_ErpGID?.trim();
            const nextA = order?.address_ErpGID?.trim();
            if (!nextP && prevP) state.draft.order.person_ErpGID = prevP;
            if (!nextA && prevA) state.draft.order.address_ErpGID = prevA;
            if (
              !order?.customer_amka?.trim() &&
              prevOrder.customer_amka?.trim()
            ) {
              state.draft.order.customer_amka = prevOrder.customer_amka;
            }
          }
        }
        state.draft.list_AddressesPersons = [] as OrderListOfAddressPersons[];
        state.draft.preselected_address_GID = undefined;
        state.draft.preselected_person_GID = undefined;
        state.draft.ylika = (action.payload.data.items ?? []) as OrderYlika[];
        state.draft.files = (action.payload.data.files ?? []) as OrderFile[];
        state.draft.list_DiscountReasons = (action.payload.data
          .list_DiscountReasons ?? []) as OrdeListOfSelections[];
        state.draft.list_KatigoriesParoxis = (action.payload.data
          .list_KatigoriesParoxis ?? []) as OrdeListOfSelections[];
        state.draft.list_LogosParalipti = (action.payload.data
          .list_LogosParalipti ?? []) as OrdeListOfSelections[];
        state.draft.list_SygeniaParalipti = (action.payload.data
          .list_SygeniaParalipti ?? []) as OrdeListOfSelections[];
        state.draft.list_TroposApostolis = (action.payload.data
          .list_TroposApostolis ?? []) as OrdeListOfSelections[];
        state.draft.synaineseisResults = null;
        state.draft.submitState = { loading: false, error: null };
        const customerErpGID = order?.customer_ErpGID;
        state.draft.lastOrderInfoCustomerErpGID =
          customerErpGID && String(customerErpGID).trim()
            ? customerErpGID
            : undefined;
        if (Array.isArray(action.payload.data?.ai_ylika)) {
          state.draft.ai_ylika = action.payload.data
            .ai_ylika as unknown as AIMaterials[];
        }

        const isExistingSavedOrder = Number(order?.id) > 0;
        if (isExistingSavedOrder) {
          state.draft.customerAmkaGateCompleted = true;

          const customerGid = String(
            state.draft.order.customer_ErpGID ?? order?.customer_ErpGID ?? "",
          ).trim();
          if (customerGid) {
            state.draft.customerIsCompletelyNew = false;
            state.draft.customerSelectedFromList = true;
            state.draft.customerProsEbs = false;
          }

          const hasRecipeFiles = (action.payload.data?.files ?? []).some(
            (f) => f?.documentCategory === "recipe",
          );
          const loadedOrder = order as Order;
          if (
            loadedOrder?.aiCalculated ||
            loadedOrder?.statusId === 0 ||
            hasRecipeFiles
          ) {
            state.draft.order.aiCalculated = true;
          }
        }

        persistStateToLocalStorage(state);
      }
    });
    b.addCase(editDraftAsync.rejected, (state, action) => {
      state.draft.editState.loading = false;
      state.draft.editState.error =
        action.error.message || "Failed to submit order";
    });
    b.addCase(submitDraftAsync.pending, (state) => {
      state.draft.submitState.loading = true;
      state.draft.submitState.error = null;
    });
    b.addCase(submitDraftAsync.fulfilled, (state, action) => {
      state.draft.submitState.loading = false;
      if (action.payload.ok && action.payload.result) {
        state.draft.order = {} as Order;
        state.draft.ai_ylika = [] as AIMaterials[];
        state.draft.files = [] as OrderFile[];
        state.draft.ylika = [] as OrderYlika[];
      } else {
        state.draft.submitState.error = action.payload.message ?? null;
      }
    });
    b.addCase(submitDraftAsync.rejected, (state, action) => {
      state.draft.submitState.loading = false;
      state.draft.submitState.error =
        action.error.message || "Failed to submit order";
    });
    b.addCase(deleteOrderAsync.fulfilled, (state, action) => {
      const idx = state.orders.findIndex(
        (x) =>
          x.id === action.payload.orderId && x.uid === action.payload.orderUID,
      );
      if (idx !== -1) {
        const [deleted] = state.orders.splice(idx, 1);
        if (deleted.statusId === PENDING_ORDER_STATUS_ID) {
          state.pendingOrdersCount = Math.max(0, state.pendingOrdersCount - 1);
        }
      }
    });
    b.addCase(loadCustomerAddressesAsync.fulfilled, (state, action) => {
      if (!action.payload.ok) return;
      const savedPerson = state.draft.order.person_ErpGID?.trim();
      const savedAddr = state.draft.order.address_ErpGID?.trim();

      const addresses = (action.payload.addresses ??
        []) as OrderListOfAddressPersons[];
      state.draft.list_AddressesPersons = addresses;
      const prePerson = action.payload.preselected_person_GID;
      const preAddr = action.payload.preselected_address_GID;
      state.draft.preselected_person_GID = prePerson ?? undefined;
      state.draft.preselected_address_GID = preAddr ?? undefined;

      const metaP = action.meta.arg.preferredPersonErpGID?.trim();
      const metaA = action.meta.arg.preferredAddressErpGID?.trim();

      if (state.draft.order.shipTo_other_address === 1) {
        const person =
          metaP ||
          savedPerson ||
          (prePerson != null ? String(prePerson).trim() : "");
        if (person) state.draft.order.person_ErpGID = person;
        state.draft.order.address_ErpGID = null;
        persistStateToLocalStorage(state);
        return;
      }

      const personInList = (pid: string | undefined) =>
        !!pid && addresses.some((p) => p.person_ErpGID === pid);

      const addressInListForPerson = (
        pid: string | undefined,
        aid: string | undefined,
      ) =>
        !!pid &&
        !!aid &&
        addresses.some(
          (p) =>
            p.person_ErpGID === pid &&
            p.addresses?.some((a) => a.address_ErpGID === aid),
        );

      const preferredPersonGid =
        (metaP && personInList(metaP) ? metaP : null) ??
        (savedPerson && personInList(savedPerson) ? savedPerson : null) ??
        (prePerson != null && personInList(String(prePerson))
          ? String(prePerson)
          : null);

      const personRow = pickDefaultPersonRow(addresses, preferredPersonGid);
      const personGid = personRow?.person_ErpGID ?? null;

      let preferredAddr: string | null = null;
      if (personGid) {
        if (metaA && addressInListForPerson(personGid, metaA))
          preferredAddr = metaA;
        else if (savedAddr && addressInListForPerson(personGid, savedAddr))
          preferredAddr = savedAddr;
        else if (
          preAddr != null &&
          addressInListForPerson(personGid, String(preAddr))
        )
          preferredAddr = String(preAddr);
      }

      state.draft.order.person_ErpGID = personGid;
      state.draft.order.address_ErpGID = pickDefaultAddressGid(
        personRow?.addresses,
        preferredAddr,
      );

      persistStateToLocalStorage(state);
    });
  },
});

export const {
  startDraft,
  setSynaineseisResults,
  setLastOrderInfoCustomerErpGID,
  setCustomerProsEbs,
  setCustomerSelectedFromList,
  setCustomerIsCompletelyNew,
  setLastWebOrderFromLoadInfo,
  setCustomerAmkaGateCompleted,
  resetEntireDraft,
  replaceDraftSnapshot,
  resetOrdersListCache,
  clearDraftAddressesList,
  deletedDraftTemplate,
  setDraftSyntagiUploaded,
  patchDraftPatient,
  patchDraftRecipient,
  patchDraftDoctor,
  submitDraft,
  clearDraftSubmitError,
  setDraftProperty,
  addDraftYliko,
  updateDraftYlikoQuantity,
  removeDraftYliko,
  removeAIMaterial,
  setAIMaterials,
  setDraftYlika,
  setDraftFiles,
} = ordersSlice.actions;

export default ordersSlice.reducer;
