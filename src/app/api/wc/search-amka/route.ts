import { cookieName } from "@/lib/auth";
import {
  extractSqlRecords,
  getSqlDataConfig,
  getUpstreamErrorMessage,
  readSqlUpstreamPayload,
  WC_SQL_NO_CACHE_HEADERS,
} from "@/lib/api/wcSqlService";
import { groupColaiSearchAmkaRows } from "@/lib/pelatologio/groupColaiSearchAmkaRows";
import type {
  ColaiSearchAmkaRow,
  ColaiSearchAmkaTypos,
} from "@/types/api/sqlData";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SQL_APP_ID = "1305";
const SQL_NAME = "COLAI_SEARCH_AMKA";

const ALLOWED_TYPOS = new Set<ColaiSearchAmkaTypos>([
  "NAME",
  "AMKA",
  "TELEPHONE",
]);

function normalizeTypos(value: unknown): ColaiSearchAmkaTypos | null {
  const typos = String(value ?? "")
    .trim()
    .toUpperCase() as ColaiSearchAmkaTypos;
  return ALLOWED_TYPOS.has(typos) ? typos : null;
}

export async function POST(req: Request) {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Not authenticated" },
      { status: 401, headers: WC_SQL_NO_CACHE_HEADERS },
    );
  }

  let body: { typos?: unknown; sea?: unknown };
  try {
    body = (await req.json()) as { typos?: unknown; sea?: unknown };
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid JSON body" },
      { status: 400, headers: WC_SQL_NO_CACHE_HEADERS },
    );
  }

  const typos = normalizeTypos(body.typos);
  const sea = String(body.sea ?? "").trim();
  if (!typos) {
    return NextResponse.json(
      { ok: false, message: "Invalid typos. Use NAME, AMKA, or TELEPHONE." },
      { status: 400, headers: WC_SQL_NO_CACHE_HEADERS },
    );
  }
  if (!sea) {
    return NextResponse.json(
      { ok: false, message: "Missing search value (SEA)" },
      { status: 400, headers: WC_SQL_NO_CACHE_HEADERS },
    );
  }

  const { serviceUrl, clientId: clientID } = getSqlDataConfig();
  if (!serviceUrl || !clientID) {
    return NextResponse.json(
      { ok: false, message: "Missing SQL data config" },
      { status: 500, headers: WC_SQL_NO_CACHE_HEADERS },
    );
  }

  let upstream: Response;
  try {
    upstream = await fetch(serviceUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service: "SqlData",
        clientID,
        appId: SQL_APP_ID,
        SqlName: SQL_NAME,
        typos,
        SEA: sea,
      }),
      cache: "no-store",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "SQL data service request failed";
    return NextResponse.json(
      { ok: false, message },
      { status: 502, headers: WC_SQL_NO_CACHE_HEADERS },
    );
  }

  const { payload, text } = await readSqlUpstreamPayload(upstream);

  if (!upstream.ok) {
    return NextResponse.json(
      { ok: false, message: text || "SQL data service failed" },
      { status: upstream.status, headers: WC_SQL_NO_CACHE_HEADERS },
    );
  }

  if (payload === null) {
    return NextResponse.json(
      { ok: false, message: text || "Invalid SQL data service response" },
      { status: 502, headers: WC_SQL_NO_CACHE_HEADERS },
    );
  }

  const upstreamMessage = getUpstreamErrorMessage(payload);
  if (upstreamMessage) {
    return NextResponse.json(
      { ok: false, message: upstreamMessage },
      { status: 502, headers: WC_SQL_NO_CACHE_HEADERS },
    );
  }

  const rows = extractSqlRecords<ColaiSearchAmkaRow>(payload);
  const customers = groupColaiSearchAmkaRows(rows);
  const totalcount =
    typeof (payload as { totalcount?: unknown })?.totalcount === "number"
      ? Number((payload as { totalcount: number }).totalcount)
      : rows.length;

  return NextResponse.json(
    {
      ok: true,
      totalcount,
      rows,
      customers,
    },
    { headers: WC_SQL_NO_CACHE_HEADERS },
  );
}
