export function phoneTelHref(phone: string): string {
  const digits = phone.trim().replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
}

export function splitPhoneDisplay(value: string): string[] {
  return value
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}
