import type { OrderYlika } from "@/types/orders";
import type { StepKey, WizardIssue } from "./types";

export const MATERIALS_QTY_FIELD = "materials_qty";

export const MATERIALS_QTY_MESSAGE =
  "Συμπληρώστε ποσότητα μεγαλύτερη από το μηδέν για όλα τα υλικά";

export function isInvalidYlikoQty(qty: unknown): boolean {
  if (qty == null || qty === "") return true;
  const n = Number(qty);
  return !Number.isFinite(n) || n <= 0;
}

export function hasInvalidMaterialsQty(
  ylika: ReadonlyArray<Pick<OrderYlika, "qty">>,
): boolean {
  return ylika.some((y) => isInvalidYlikoQty(y.qty));
}

export function getMaterialsQtyWizardIssues(
  ylika: ReadonlyArray<Pick<OrderYlika, "qty">>,
): WizardIssue[] {
  if (!hasInvalidMaterialsQty(ylika)) return [];

  return [
    {
      step: "materials" as StepKey,
      field: MATERIALS_QTY_FIELD,
      message: MATERIALS_QTY_MESSAGE,
      error: MATERIALS_QTY_MESSAGE,
    },
  ];
}
