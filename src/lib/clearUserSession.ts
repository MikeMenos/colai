import { SELLER_SCOPE_STORAGE_KEY } from "@/lib/sellerScope";

/** localStorage keys that hold user-specific cached app data (not UI prefs like theme). */
export const USER_SESSION_STORAGE_KEYS = [
  "auth",
  "orders",
  "staticData",
  "discountRequests",
  "wc",
  SELLER_SCOPE_STORAGE_KEY,
] as const;

export function clearUserSessionLocalStorage(): void {
  if (typeof window === "undefined") return;

  for (const key of USER_SESSION_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore quota / private mode issues
    }
  }
}
