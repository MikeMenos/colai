export const DEFAULT_LIST_PAGE = 1;

export function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export type BaseListQuery = {
  search?: string;
  page?: number;
  pagesize?: number;
};

export function buildListSearchParams(
  query: BaseListQuery & { _ts?: number },
  defaults: { page?: number; pagesize: number },
  extra?: Record<string, string | number | null | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  params.set("page", String(query.page ?? defaults.page ?? DEFAULT_LIST_PAGE));
  params.set("pagesize", String(query.pagesize ?? defaults.pagesize));

  const search = query.search?.trim();
  if (search) params.set("search", search);

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value != null && value !== "") {
        params.set(key, String(value));
      }
    }
  }

  if (query._ts) params.set("_ts", String(query._ts));

  return params;
}
