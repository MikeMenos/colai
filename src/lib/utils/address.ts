function text(value: unknown): string {
  return String(value ?? "").trim();
}

export function buildAddressDisplayLine(
  address?: string | null,
  city?: string | null,
  postalCode?: string | null,
): string {
  return [address, city, postalCode].map(text).filter(Boolean).join(", ");
}

export function buildAddressMapQuery(
  address?: string | null,
  postalCode?: string | null,
  city?: string | null,
): string {
  return [address, postalCode, city].map(text).filter(Boolean).join(" ");
}
