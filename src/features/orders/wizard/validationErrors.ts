export type WizardFieldErrorMessage = string | boolean;

export type WizardFieldIssue = {
  field: string;
  message: WizardFieldErrorMessage;
};

export type WizardFieldErrors = Record<string, WizardFieldErrorMessage>;

export function getWizardFieldErrors<TIssue extends WizardFieldIssue>(
  issues: readonly TIssue[],
  options?: {
    include?: (issue: TIssue) => boolean;
  },
): WizardFieldErrors {
  const errors: WizardFieldErrors = {};

  for (const issue of issues) {
    if (options?.include && !options.include(issue)) continue;
    if (!errors[issue.field]) errors[issue.field] = issue.message;
  }

  return errors;
}

export function clearWizardIssue<TIssue extends { field: string }>(
  issues: readonly TIssue[],
  field: string,
): TIssue[] {
  return issues.filter((issue) => issue.field !== field);
}

export function clearWizardFieldError(
  errors: WizardFieldErrors,
  field: string,
): WizardFieldErrors {
  if (!(field in errors)) return errors;

  const next = { ...errors };
  delete next[field];
  return next;
}

export function getActiveWizardFieldErrors(
  errors: WizardFieldErrors,
  isActive: (field: string) => boolean,
): WizardFieldErrors {
  return Object.fromEntries(
    Object.entries(errors).filter(([field]) => isActive(field)),
  );
}

export function hasWizardFieldErrors(errors: WizardFieldErrors): boolean {
  return Object.keys(errors).length > 0;
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
