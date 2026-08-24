export const SELLER_SCOPE_STORAGE_KEY = "sellerScope";
export const SELLER_SCOPE_PARAM = "scope";

type SellerScopePersisted = {
  sellerCode: string;
};

let currentSellerCode = "";
let hydrated = false;
const listeners = new Set<() => void>();

function readPersistedSellerCode(raw: string | null): string {
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw) as SellerScopePersisted;
    return typeof parsed?.sellerCode === "string" ? parsed.sellerCode.trim() : "";
  } catch {
    return "";
  }
}

function hydrateSellerScope(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    currentSellerCode = readPersistedSellerCode(
      window.localStorage.getItem(SELLER_SCOPE_STORAGE_KEY),
    );
  } catch {
    currentSellerCode = "";
  }
}

function emitSellerScope(): void {
  listeners.forEach((listener) => listener());
}

function persistSellerCode(sellerCode: string): void {
  if (typeof window === "undefined") return;

  try {
    if (!sellerCode) {
      window.localStorage.removeItem(SELLER_SCOPE_STORAGE_KEY);
      return;
    }

    const payload: SellerScopePersisted = { sellerCode };
    window.localStorage.setItem(
      SELLER_SCOPE_STORAGE_KEY,
      JSON.stringify(payload),
    );
  } catch {
    // ignore quota / private mode issues
  }
}

export function subscribeSellerScope(onStoreChange: () => void): () => void {
  hydrateSellerScope();
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getSellerScopeSellerCode(): string {
  hydrateSellerScope();
  return currentSellerCode;
}

export function getSellerScopeServerSnapshot(): string {
  return "";
}

export function setSellerScopeSellerCode(sellerCode: string): void {
  hydrateSellerScope();
  const next = sellerCode.trim();
  if (currentSellerCode === next) return;

  currentSellerCode = next;
  persistSellerCode(next);
  emitSellerScope();
}

export function resetSellerScope(): void {
  currentSellerCode = "";
  persistSellerCode("");
  emitSellerScope();
}

export function stripSellerScopeSearchParams(params: URLSearchParams): boolean {
  const hadScope = params.has(SELLER_SCOPE_PARAM);
  const hadSellerCode = params.has("sellercode");
  if (!hadScope && !hadSellerCode) return false;

  params.delete(SELLER_SCOPE_PARAM);
  params.delete("sellercode");
  return true;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key !== SELLER_SCOPE_STORAGE_KEY) return;
    currentSellerCode = readPersistedSellerCode(event.newValue);
    hydrated = true;
    emitSellerScope();
  });
}
