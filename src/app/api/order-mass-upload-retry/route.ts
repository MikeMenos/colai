import { cookieName } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const baseUrl = process.env.AMSA_API_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { ok: false, message: "Missing AMSA_API_BASE_URL" },
      { status: 500 },
    );
  }

  const url = new URL(req.url);
  const orderUid = url.searchParams.get("order_uid")?.trim();
  const aiClient = url.searchParams.get("aiclient")?.trim();

  if (!orderUid || !aiClient) {
    return NextResponse.json(
      { ok: false, message: "Missing order_uid or aiclient" },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    order_uid: orderUid,
    aiclient: aiClient,
  });

  const r = await fetch(
    `${baseUrl}/api/order-mass-upload-retry?${params.toString()}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  const text = await r.text();
  try {
    return NextResponse.json(JSON.parse(text), { status: r.status });
  } catch {
    return new NextResponse(text, { status: r.status });
  }
}
