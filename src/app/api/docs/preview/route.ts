import { DOCS_BASE } from "@/lib/utils/order";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")?.trim();
  if (!name) {
    return NextResponse.json({ ok: false, message: "Missing name" }, { status: 400 });
  }

  const upstream = await fetch(`${DOCS_BASE}${encodeURIComponent(name)}`, {
    cache: "no-store",
  });

  if (!upstream.ok) {
    return new NextResponse("File not found", { status: upstream.status });
  }

  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/pdf",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
