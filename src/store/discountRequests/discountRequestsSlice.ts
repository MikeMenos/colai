import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { DiscountRequest } from "@/types/discoutRequest";
import type { PagingResults } from "@/types/api/common";
import type {
  GetDiscountRequestsSuccess,
  ReviewDiscountRequestSuccess,
} from "@/types/api/responses";
import { parseProxyJson } from "@/lib/api/client";
import {
  DEFAULT_DISCOUNT_LIST_PAGE,
  DEFAULT_DISCOUNT_LIST_PAGE_SIZE,
  buildDiscountListSearchParams,
} from "@/lib/api/discountListQuery";

const LS_KEY = "discountRequests";

export type FetchDiscountRequestsArg = {
  q?: string;
  page?: number;
  pagesize?: number;
  discountstatus?: number;
  force?: boolean;
};

function extractDiscountRequestsPayload(payload: unknown): {
  requests: DiscountRequest[];
  userCanMakeAction: boolean;
  paging: PagingResults | null;
} {
  const root =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : null;
  const data =
    typeof root?.data === "object" && root.data !== null
      ? (root.data as Record<string, unknown>)
      : null;

  const requests = (
    Array.isArray(data?.mydata)
      ? data.mydata
      : Array.isArray(root?.mydata)
        ? root.mydata
        : Array.isArray(root?.data)
          ? root.data
          : []
  ) as DiscountRequest[];

  const userCanMakeAction = Boolean(
    data?.userCanMakeAction ?? root?.userCanMakeAction,
  );

  const paging =
    typeof data?.paging_item === "object" && data.paging_item !== null
      ? (data.paging_item as PagingResults)
      : null;

  return { requests, userCanMakeAction, paging };
}

export interface DiscountRequestState {
  requests: DiscountRequest[];
  loadingList: boolean;
  refreshingList: boolean;
  error: string | null;
  query: string;
  page: number;
  pagesize: number;
  discountstatus: number | null;
  paging: PagingResults | null;
  requestsFetchedAt: number;
  userCanMakeAction: boolean;
  review: {
    loading: boolean;
    error: string | null;
  };
}

export const reviewDiscountRequest = createAsyncThunk<
  ReviewDiscountRequestSuccess & { id: number; isapproved: number },
  { id: number; uid: string; isapproved: number; overrideamount?: number }
>(
  "discountRequests/reviewDiscountRequest",
  async ({ id, uid, isapproved, overrideamount = 0 }) => {
    const res = await fetch(`/api/discountRequests/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, uid, isapproved, overrideamount }),
    });

    const data = await parseProxyJson<ReviewDiscountRequestSuccess>(
      res,
      "Failed to review discount request",
    );
    return { ...data, id, isapproved };
  },
);

export const fetchDiscountRequests = createAsyncThunk<
  GetDiscountRequestsSuccess,
  FetchDiscountRequestsArg | void,
  { state: RootState }
>(
  "discountRequests/fetchDiscountRequests",
  async (arg) => {
    const q = typeof arg === "object" && arg?.q ? arg.q.trim() : "";
    const page =
      typeof arg === "object" && arg?.page
        ? arg.page
        : DEFAULT_DISCOUNT_LIST_PAGE;
    const pagesize =
      typeof arg === "object" && arg?.pagesize
        ? arg.pagesize
        : DEFAULT_DISCOUNT_LIST_PAGE_SIZE;
    const discountstatus =
      typeof arg === "object" && arg?.discountstatus != null
        ? arg.discountstatus
        : undefined;

    const params = buildDiscountListSearchParams({
      search: q,
      page,
      pagesize,
      discountstatus,
      _ts: Date.now(),
    });

    const res = await fetch(`/api/discountRequests?${params.toString()}`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    return parseProxyJson<GetDiscountRequestsSuccess>(
      res,
      "Failed to load discount requests",
    );
  },
  {
    condition: (arg, { getState }) => {
      const state = getState();
      const q = typeof arg === "object" && arg?.q ? arg.q.trim() : "";
      const page =
        typeof arg === "object" && arg?.page
          ? arg.page
          : DEFAULT_DISCOUNT_LIST_PAGE;
      const pagesize =
        typeof arg === "object" && arg?.pagesize
          ? arg.pagesize
          : DEFAULT_DISCOUNT_LIST_PAGE_SIZE;
      const force = typeof arg === "object" && arg?.force;

      if (force) return !state.discountRequests.refreshingList;

      if (
        state.discountRequests.loadingList ||
        state.discountRequests.refreshingList
      ) {
        return false;
      }

      if (
        state.discountRequests.requestsFetchedAt > 0 &&
        state.discountRequests.query === q &&
        state.discountRequests.page === page &&
        state.discountRequests.pagesize === pagesize
      ) {
        return false;
      }

      return true;
    },
  },
);

function loadStateFromLocalStorage(): DiscountRequestState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<DiscountRequestState>;
    if (!parsed || typeof parsed !== "object") return null;

    return {
      ...initialStateBase,
      userCanMakeAction:
        parsed.userCanMakeAction ?? initialStateBase.userCanMakeAction,
    };
  } catch {
    return null;
  }
}

function persistStateToLocalStorage(state: DiscountRequestState) {
  if (typeof window === "undefined") return;

  const toSave = {
    userCanMakeAction: state.userCanMakeAction,
  };

  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  } catch {
    // ignore quota / private mode issues
  }
}

const initialStateBase: DiscountRequestState = {
  requests: [],
  loadingList: false,
  refreshingList: false,
  error: null,
  query: "",
  page: DEFAULT_DISCOUNT_LIST_PAGE,
  pagesize: DEFAULT_DISCOUNT_LIST_PAGE_SIZE,
  discountstatus: null,
  paging: null,
  requestsFetchedAt: 0,
  userCanMakeAction: false,
  review: {
    loading: false,
    error: null,
  },
};

const discountRequestsSlice = createSlice({
  name: "discountRequests",
  initialState: loadStateFromLocalStorage() ?? initialStateBase,
  reducers: {
    resetDiscountRequestsUserSession(state) {
      Object.assign(state, initialStateBase);
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchDiscountRequests.pending, (state, action) => {
      const force =
        typeof action.meta.arg === "object" &&
        !!(action.meta.arg as FetchDiscountRequestsArg)?.force;
      if (force) state.refreshingList = true;
      else state.loadingList = true;
    });
    b.addCase(fetchDiscountRequests.fulfilled, (state, action) => {
      const { requests, userCanMakeAction, paging } =
        extractDiscountRequestsPayload(action.payload);

      state.loadingList = false;
      state.refreshingList = false;
      state.requests = requests;
      state.paging = paging;
      state.userCanMakeAction = userCanMakeAction;
      state.error = null;

      const arg =
        typeof action.meta.arg === "object"
          ? (action.meta.arg as FetchDiscountRequestsArg)
          : undefined;

      state.query = arg?.q?.trim() ?? "";
      state.page = arg?.page ?? DEFAULT_DISCOUNT_LIST_PAGE;
      state.pagesize = arg?.pagesize ?? DEFAULT_DISCOUNT_LIST_PAGE_SIZE;
      state.discountstatus =
        arg?.discountstatus != null ? arg.discountstatus : null;
      state.requestsFetchedAt = Date.now();
      persistStateToLocalStorage(state);
    });
    b.addCase(fetchDiscountRequests.rejected, (state, action) => {
      state.loadingList = false;
      state.refreshingList = false;

      state.error = action.error.message || "Failed to load discount requests";
    });

    b.addCase(reviewDiscountRequest.pending, (state) => {
      state.review.loading = true;
      state.review.error = null;
    });
    b.addCase(reviewDiscountRequest.fulfilled, (state, action) => {
      state.review.loading = false;
      if (action.payload.result && action.payload.type === "success") {
        const req = state.requests.find((r) => r.id === action.payload.id);
        if (req) {
          req.isDiscountApproved = action.payload.isapproved;
        }
      } else {
        state.review.error =
          action.payload.message ?? action.payload.exmessage ?? null;
      }
    });
    b.addCase(reviewDiscountRequest.rejected, (state, action) => {
      state.review.loading = false;
      state.review.error = action.error.message ?? "";
    });
  },
});

export const { resetDiscountRequestsUserSession } =
  discountRequestsSlice.actions;
export default discountRequestsSlice.reducer;
