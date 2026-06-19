import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName } from "@/lib/auth";
import {
  DEFAULT_DISCOUNT_LIST_PAGE,
  DEFAULT_DISCOUNT_LIST_PAGE_SIZE,
  parsePositiveInt,
} from "@/lib/api/discountListQuery";

export async function GET(req: Request) {
  const jar = cookies();
  const token = (await jar).get(cookieName)?.value;

  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Not authenticated" },
      { status: 401 },
    );
  }

  const url = new URL(req.url);
  const backendParams = new URLSearchParams({
    orderby: "dateDesc",
    page: String(parsePositiveInt(url.searchParams.get("page"), DEFAULT_DISCOUNT_LIST_PAGE)),
    pagesize: String(
      parsePositiveInt(
        url.searchParams.get("pagesize"),
        DEFAULT_DISCOUNT_LIST_PAGE_SIZE,
      ),
    ),
  });

  const search = url.searchParams.get("search")?.trim();
  if (search) backendParams.set("search", search);

  const discountstatus = url.searchParams.get("discountstatus")?.trim();
  if (discountstatus) backendParams.set("discountstatus", discountstatus);

  const backendUrl = `${process.env.AMSA_API_BASE_URL}/api/list-discount-requests?${backendParams.toString()}`;

  const res = await fetch(backendUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const json = await res.json().catch((e) => ({ ok: false, message: e.message }));
    return NextResponse.json(
      { ok: false, message: json || "Backend orders fetch failed" },
      { status: res.status },
    );
  }

  const payload = await res.json().catch((e) => ({ ok: false, message: e.message }));

  return NextResponse.json({ ok: true, ...payload });
}
