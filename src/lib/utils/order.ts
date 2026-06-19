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
