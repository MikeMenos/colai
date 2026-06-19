import { clearUserSessionLocalStorage } from "@/lib/clearUserSession";
import { resetDashboardUserSession } from "@/store/dashboard/slice";
import { resetDiscountRequestsUserSession } from "@/store/discountRequests/discountRequestsSlice";
import {
  resetEntireDraft,
  resetOrdersListCache,
} from "@/store/orders/ordersSlice";
import { resetStaticDataUserSession } from "@/store/staticData/staticDataSlice";
import { resetWcDiadikasiaUserSession } from "@/store/wcDiadikasia/wcDiadikasiaSlice";
import type { AppDispatch } from "@/store/store";

export function clearUserSessionOnLogout(dispatch: AppDispatch): void {
  clearUserSessionLocalStorage();
  dispatch(resetEntireDraft());
  dispatch(resetOrdersListCache());
  dispatch(resetStaticDataUserSession());
  dispatch(resetDiscountRequestsUserSession());
  dispatch(resetWcDiadikasiaUserSession());
  dispatch(resetDashboardUserSession());
}
