import type { StepKey, WizardIssue } from "./types";
import {
  OTHER_SUGGESTED_DOCTOR_FIELD_ORDER,
  SUGGESTED_DOCTOR_FIELD_ORDER,
} from "./doctorFieldValidation";

export type StepOrderEntry = {
  number: number;
  label: string;
};

export function buildStepOrderMap(
  steps: ReadonlyArray<{ key: StepKey; label: string }>,
): Map<StepKey, StepOrderEntry> {
  const order = new Map<StepKey, StepOrderEntry>();
  let stepNumber = 1;
  for (const step of steps) {
    if (step.key === "touchdown") continue;
    order.set(step.key, { number: stepNumber, label: step.label });
    stepNumber += 1;
  }
  return order;
}

const FIELD_ORDER_BY_STEP: Partial<Record<StepKey, readonly string[]>> = {
  doctor: [
    ...OTHER_SUGGESTED_DOCTOR_FIELD_ORDER,
    ...SUGGESTED_DOCTOR_FIELD_ORDER,
  ],
};

function compareFieldsWithinStep(a: WizardIssue, b: WizardIssue): number {
  const fieldOrder = FIELD_ORDER_BY_STEP[a.step];
  if (!fieldOrder || a.step !== b.step) {
    return a.field.localeCompare(b.field);
  }

  const idxA = fieldOrder.indexOf(a.field);
  const idxB = fieldOrder.indexOf(b.field);
  const sortA = idxA === -1 ? Number.MAX_SAFE_INTEGER : idxA;
  const sortB = idxB === -1 ? Number.MAX_SAFE_INTEGER : idxB;
  if (sortA !== sortB) return sortA - sortB;

  return a.field.localeCompare(b.field);
}

export function sortWizardIssues(
  issues: WizardIssue[],
  stepOrder: Map<StepKey, StepOrderEntry>,
): WizardIssue[] {
  return [...issues].sort((a, b) => {
    const orderA = stepOrder.get(a.step)?.number ?? Number.MAX_SAFE_INTEGER;
    const orderB = stepOrder.get(b.step)?.number ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return compareFieldsWithinStep(a, b);
  });
}

export function dedupeWizardIssues(issues: WizardIssue[]): WizardIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    if (seen.has(issue.field)) return false;
    seen.add(issue.field);
    return true;
  });
}

export function formatWizardStepLabel(
  step: StepKey,
  stepOrder: Map<StepKey, StepOrderEntry>,
): string {
  const entry = stepOrder.get(step);
  if (!entry) return step;
  return `Βήμα ${entry.number} - ${entry.label}`;
}

export function prepareTouchdownIssues(
  issues: WizardIssue[],
  stepOrder: Map<StepKey, StepOrderEntry>,
): WizardIssue[] {
  return dedupeWizardIssues(sortWizardIssues(issues, stepOrder));
}
