import type { OrderFile } from "@/types/orders";

export const DOCS_BASE = "https://sales.amsaworks.gr/docs/uploads/";

export function getFileSuffix(f: OrderFile): string {
  return (f.friendlyName ?? f.name) ?? "";
}

export function isDocumentCategory(f: OrderFile, category: string): boolean {
  const cat = f.documentCategory;
  return cat === category;
}

export function getOrderFileViewUrl(f: OrderFile): string | null {
  const suffix = getFileSuffix(f);
  if (!suffix) return null;
  return `${DOCS_BASE}${encodeURIComponent(suffix)}`;
}

/** Same-origin URL for react-pdf (avoids cross-origin fetch issues in WebView). */
export function getOrderFilePdfPreviewUrl(f: OrderFile): string | null {
  const suffix = getFileSuffix(f);
  if (!suffix) return null;
  return `/api/docs/preview?name=${encodeURIComponent(suffix)}`;
}

export function getOrderFileDisplayName(f: OrderFile): string {
  return f.originalFileName ?? f.name ?? f.base64filename ?? "";
}

export function isPdfFile(name: string, mimeType?: string | null): boolean {
  return (
    mimeType === "application/pdf" || name.toLowerCase().endsWith(".pdf")
  );
}

export function isOrderFilePdf(f: OrderFile): boolean {
  return isPdfFile(
    getFileSuffix(f) || getOrderFileDisplayName(f),
    f.fileType,
  );
}
