export const PAYMENT_METHOD_OPTIONS = [
  { value: 1, label: "Πληρωμή μέσω κατάθεσης" },
  { value: 0, label: "Πληρωμή με αντικαταβολή" },
] as const;

export function isPaymentMethodSelected(
  isPaid: number | null | undefined,
): boolean {
  return isPaid === 0 || isPaid === 1;
}

export function getPaymentMethodLabel(
  isPaid: number | null | undefined,
): string | null {
  const option = PAYMENT_METHOD_OPTIONS.find((item) => item.value === isPaid);
  return option?.label ?? null;
}
