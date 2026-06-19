import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import type { DashboardData, WcStoixoiMina } from "@/types/dashboard";
import type { Order } from "@/types/orders";
import type { GetDashboardSuccess } from "@/types/api/responses";
import { parseProxyJson } from "@/lib/api/client";

export type DashboardState = DashboardData & {
    loading: boolean;
    error: string | null;
    /** Set after first fetch completes (success or error) so UI can show initial loader. */
    lastFetchedAt: number;
};

function normalizeWcStoixoi(raw: unknown): WcStoixoiMina | null {
    if (!raw || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    return {
        count_paragg_new: Number(o.count_paragg_new) || 0,
        count_paragg_repeat: Number(o.count_paragg_repeat) || 0,
        amount_paragg_new: Number(o.amount_paragg_new) || 0,
        amount_paragg_repeat: Number(o.amount_paragg_repeat) || 0,
    };
}

const emptyData: DashboardData = {
    totalOrders_month: 0,
    totalOrders_prev_month: 0,
    totalOrders_month_perc: 0,
    pendingReviews: 0,
    next10DaysSyntages: 0,
    lastOrders: [],
    wC_stoixoi_mina: null,
};

const initialState: DashboardState = {
    ...emptyData,
    loading: false,
    error: null,
    lastFetchedAt: 0,
};

export const fetchDashboardData = createAsyncThunk<
  GetDashboardSuccess,
  void,
  { state: RootState }
>(
    "dashboard/fetchDashboardData",
    async () => {
        const res = await fetch(`/api/dashboard`, {
            cache: "no-store",
            headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
            },
        });

        return parseProxyJson<GetDashboardSuccess>(
          res,
          "Failed to load dashboard",
        );
    }
);

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        resetDashboardUserSession(state) {
            Object.assign(state, initialState);
        },
    },
    extraReducers: (b) => {
        b.addCase(fetchDashboardData.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        b.addCase(fetchDashboardData.fulfilled, (state, action) => {
            state.loading = false;
            state.lastFetchedAt = Date.now();
            const payload = action.payload;

            if (!payload.ok) {
                state.error = payload.message ?? "Σφάλμα φόρτωσης";
                return;
            }

            const sc = payload.statusCode as number | undefined;
            if (sc !== undefined && sc !== 0 && sc !== 200) {
                state.error = payload.message ?? payload.detailedMessage ?? "Σφάλμα φόρτωσης";
                return;
            }

            state.error = null;
            state.totalOrders_month = Number(payload.totalOrders_month) || 0;
            state.totalOrders_prev_month = Number(payload.totalOrders_prev_month) || 0;
            state.totalOrders_month_perc = Number(payload.totalOrders_month_perc) || 0;
            state.pendingReviews = Number(payload.pendingReviews) || 0;
            state.next10DaysSyntages = Number(payload.next10DaysSyntages) || 0;
            state.lastOrders = Array.isArray(payload.lastOrders) ? (payload.lastOrders as Order[]) : [];
            state.wC_stoixoi_mina = normalizeWcStoixoi(payload.wC_stoixoi_mina);
        });
        b.addCase(fetchDashboardData.rejected, (state, action) => {
            state.loading = false;
            state.lastFetchedAt = Date.now();
            state.error = action.error.message ?? "Failed to fetch dashboard data";
        });
    },
});

export const { resetDashboardUserSession } = dashboardSlice.actions;
export default dashboardSlice.reducer;
