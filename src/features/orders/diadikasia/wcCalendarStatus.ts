import type { wcCalendar } from "@/types/wc";

export const WC_STATUS_TITLE_EPISOULETHIKE = "ΕΠΟΥΛΩΘΗΚΕ";
export const WC_STATUS_TITLE_APEBIWSE = "ΑΠΕΒΙΩΣΕ";

export type WcStatusFilterKey = "all" | "e" | "a";

export const WC_STATUS_FILTER_DEFAULT: WcStatusFilterKey[] = ["all"];

export type WcStatusFilterMode =
  | "everything"
  | "only-e"
  | "only-a"
  | "everything-except-a"
  | "everything-except-e"
  | "e-and-a";

export function statusEaWcStatusFilterKey(
  statuS_EA: string | null | undefined,
): WcStatusFilterKey | null {
  const ea = (statuS_EA ?? "").trim().toUpperCase();
  if (ea === "E" || ea === "Ε") return "e";
  if (ea === "A" || ea === "Α") return "a";
  return null;
}

export function rowHasMappedStatusEa(row: wcCalendar): boolean {
  return statusEaWcStatusFilterKey(row.statuS_EA) !== null;
}

export function wcStatusTitleForFilterKey(key: "e" | "a"): string {
  return key === "e"
    ? WC_STATUS_TITLE_EPISOULETHIKE
    : WC_STATUS_TITLE_APEBIWSE;
}

export function parseWcStatusFilterKeys(param: string): WcStatusFilterKey[] {
  return param
    .split(",")
    .map((part) => part.trim())
    .filter(
      (key): key is WcStatusFilterKey =>
        key === "all" || key === "e" || key === "a",
    );
}

export function serializeWcStatusFilterKeys(keys: WcStatusFilterKey[]): string {
  return keys.join(",");
}

export function resolveWcStatusFilterMode(
  keys: WcStatusFilterKey[],
): WcStatusFilterMode {
  const hasAll = keys.includes("all");
  const hasE = keys.includes("e");
  const hasA = keys.includes("a");

  if (hasAll && hasE && hasA) return "everything";
  if (hasAll && !hasE && !hasA) return "everything";
  if (hasAll && hasE && !hasA) return "everything-except-a";
  if (hasAll && hasA && !hasE) return "everything-except-e";
  if (!hasAll && hasE && !hasA) return "only-e";
  if (!hasAll && hasA && !hasE) return "only-a";
  if (!hasAll && hasE && hasA) return "e-and-a";

  return "everything";
}

export function isDefaultWcStatusFilter(keys: WcStatusFilterKey[]): boolean {
  return resolveWcStatusFilterMode(keys) === "everything";
}

export function describeWcStatusFilter(keys: WcStatusFilterKey[]): string {
  switch (resolveWcStatusFilterMode(keys)) {
    case "everything":
      return "Όλες οι εγγραφές";
    case "only-e":
      return WC_STATUS_TITLE_EPISOULETHIKE;
    case "only-a":
      return WC_STATUS_TITLE_APEBIWSE;
    case "everything-except-a":
      return `Όλα εκτός ${WC_STATUS_TITLE_APEBIWSE}`;
    case "everything-except-e":
      return `Όλα εκτός ${WC_STATUS_TITLE_EPISOULETHIKE}`;
    case "e-and-a":
      return `${WC_STATUS_TITLE_EPISOULETHIKE} και ${WC_STATUS_TITLE_APEBIWSE}`;
  }
}

export function isWcStatusFilterKeyActive(
  keys: WcStatusFilterKey[],
  key: WcStatusFilterKey,
): boolean {
  return keys.includes(key);
}

/**
 * Toggle rules:
 * - Όλα only → E/A → only E or only A
 * - only E → Όλα → Όλα+E (all except A); E again → Όλα
 * - only A → Όλα → Όλα+A (all except E); A again → Όλα
 * - Όλα+E → Όλα → only E; A → Όλα+A
 * - Όλα+A → Όλα → only A; E → Όλα+E
 */
export function toggleWcStatusFilterKey(
  keys: WcStatusFilterKey[],
  key: WcStatusFilterKey,
): WcStatusFilterKey[] {
  const mode = resolveWcStatusFilterMode(keys);

  if (key === "all") {
    switch (mode) {
      case "everything":
        return keys;
      case "everything-except-a":
        return ["e"];
      case "everything-except-e":
        return ["a"];
      case "only-e":
        return ["all", "e"];
      case "only-a":
        return ["all", "a"];
      case "e-and-a":
        return [...WC_STATUS_FILTER_DEFAULT];
      default:
        return [...WC_STATUS_FILTER_DEFAULT];
    }
  }

  if (key === "e") {
    if (keys.includes("e")) {
      return [...WC_STATUS_FILTER_DEFAULT];
    }

    switch (mode) {
      case "everything":
        return ["e"];
      case "everything-except-e":
        return ["all", "e"];
      case "only-a":
        return ["e", "a"];
      default:
        return ["e"];
    }
  }

  if (key === "a") {
    if (keys.includes("a")) {
      return [...WC_STATUS_FILTER_DEFAULT];
    }

    switch (mode) {
      case "everything":
        return ["a"];
      case "everything-except-a":
        return ["all", "a"];
      case "only-e":
        return ["e", "a"];
      default:
        return ["a"];
    }
  }

  return keys;
}

export function wcStatusEaBadgeClassForLabel(
  statusEa: string | null | undefined,
): string {
  const key = statusEaWcStatusFilterKey(statusEa);
  if (key === "e") return "badge text-bg-success";
  if (key === "a") return "badge text-bg-danger";
  return "badge text-bg-secondary";
}

export function rowWcStatusFilterKey(row: wcCalendar): WcStatusFilterKey {
  return statusEaWcStatusFilterKey(row.statuS_EA) ?? "all";
}

export function rowMatchesWcStatusFilterMode(
  rowKey: WcStatusFilterKey,
  mode: WcStatusFilterMode,
): boolean {
  switch (mode) {
    case "everything":
      return true;
    case "only-e":
      return rowKey === "e";
    case "only-a":
      return rowKey === "a";
    case "everything-except-a":
      return rowKey !== "a";
    case "everything-except-e":
      return rowKey !== "e";
    case "e-and-a":
      return rowKey === "e" || rowKey === "a";
  }
}

export function rowMatchesStatusFilterKeys(
  row: wcCalendar,
  selectedKeys: WcStatusFilterKey[],
): boolean {
  const mode = resolveWcStatusFilterMode(selectedKeys);
  const rowKey = rowWcStatusFilterKey(row);
  return rowMatchesWcStatusFilterMode(rowKey, mode);
}
