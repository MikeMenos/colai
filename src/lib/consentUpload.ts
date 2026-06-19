import type { ConsentUploadDataObject } from "@/types/api/common";

export type SynaineseisResults = ConsentUploadDataObject;

export function getConsentFormScore(
  results: SynaineseisResults | null | undefined,
): number | null {
  if (!results) return null;

  const formScore = Number(results.form_score);
  if (Number.isNaN(formScore)) return null;

  return formScore;
}

export function isVoiceConsentOrder(
  order: { isVoiceConsent?: number | null } | null | undefined,
): boolean {
  return order?.isVoiceConsent == 1;
}

export function isConsentScoreTooLow(
  results: SynaineseisResults | null | undefined,
): boolean {
  const formScore = getConsentFormScore(results);
  if (formScore == null) return false;

  return formScore < 50;
}

export function isConsentScoreWarning(
  results: SynaineseisResults | null | undefined,
): boolean {
  const formScore = getConsentFormScore(results);
  if (formScore == null) return false;

  return formScore >= 50 && formScore < 70;
}

export function isConsentScoreHigh(
  results: SynaineseisResults | null | undefined,
): boolean {
  const formScore = getConsentFormScore(results);
  if (formScore == null) return false;

  return formScore >= 80;
}

import type { Maybe } from "@/types/api/common";

export function getConsentFileCategory(file: {
  documentCategory?: Maybe<string>;
  document_category?: Maybe<string>;
}): string {
  return String(file.documentCategory ?? file.document_category ?? "");
}
