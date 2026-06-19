import {
  cookieName,
  decodeUserInfoCookie,
  userCookieName,
} from "@/lib/auth";
import {
  extractSqlRecords,
  getSqlDataConfig,
  getUpstreamErrorMessage,
  readSqlUpstreamPayload,
  WC_SQL_NO_CACHE_HEADERS,
} from "@/lib/api/wcSqlService";
import { isManagerWithoutSellerRole } from "@/lib/sellerAccess";
import type { SellerTeamatesWC } from "@/types/api/sqlData";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SQL_APP_ID = "1305";
const SQL_NAME = "TEAMATES_WC";

export async function GET() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Not authenticated" },
      { status: 401, headers: WC_SQL_NO_CACHE_HEADERS },
    );
  }

  const userInfo = decodeUserInfoCookie(jar.get(userCookieName)?.value);
  const sellerCode = isManagerWithoutSellerRole(userInfo)
    ? userInfo?.listAccessSellers?.[0]?.sellerCode?.trim()
    : userInfo?.sellerCode?.trim();
  if (!sellerCode) {
    return NextResponse.json(
      { ok: false, message: "Missing seller code for authenticated user" },
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
        SELLERCODE: sellerCode,
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

  return NextResponse.json(
    { ok: true, records: extractSqlRecords<SellerTeamatesWC>(payload) },
    { headers: WC_SQL_NO_CACHE_HEADERS },
  );
}
