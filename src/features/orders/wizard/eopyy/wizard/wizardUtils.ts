export { onlyDigits } from "@/lib/utils/string";

export function normalizeBarcode(value: unknown): string {
  return String(value ?? "").replace(/\s/g, "");
}

export const SYMM_PERCENTAGE_OPTIONS = [0, 10, 25] as const;

export function normalizeSymmPercentage(value: unknown): number | null {
  const n = Number(value);
  return SYMM_PERCENTAGE_OPTIONS.includes(
    n as (typeof SYMM_PERCENTAGE_OPTIONS)[number],
  )
    ? n
    : null;
}

export function isAllowedSymmPercentage(
  value: unknown,
): value is (typeof SYMM_PERCENTAGE_OPTIONS)[number] {
  return SYMM_PERCENTAGE_OPTIONS.includes(
    value as (typeof SYMM_PERCENTAGE_OPTIONS)[number],
  );
}

export function hasAnyValue(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some((v) => v !== null && v !== "");
}

export function focusWizardField(fieldName: string) {
  window.setTimeout(() => {
    const esc = (window as unknown as { CSS?: { escape?: (s: string) => string } })
      .CSS?.escape
      ? (window as unknown as { CSS: { escape: (s: string) => string } }).CSS.escape(
          fieldName,
        )
      : fieldName;
    const el = document.querySelector(`[name="${esc}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
    (el as HTMLElement & { focus?: () => void })?.focus?.();
  }, 60);
}
