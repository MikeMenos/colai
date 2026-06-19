import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const url = new URL(req.url);
    const search = (url.searchParams.get("q") ?? "").trim();

    if (search.length < 2) {
        return NextResponse.json({ ok: true, results: [] });
    }

    const token = (await cookies()).get(cookieName)?.value;
    if (!token) {
        return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const baseUrl = process.env.AMSA_API_BASE_URL;
    if (!baseUrl) {
        return NextResponse.json({ ok: false, message: "Missing AMSA_API_BASE_URL" }, { status: 500 });
    }

    const backendUrl = `${baseUrl}/api/search-doctors?search=${search}`;

    const res = await fetch(backendUrl, {
        method: "GET",
        headers: { Accept: "text/plain", Authorization: `Bearer ${token}` },
        cache: "no-store",
    });


    if (!res.ok) {
        const t = await res.text().catch(() => "");
        return NextResponse.json({ ok: false, message: t || "Search failed" }, { status: res.status });
    }

    const payload = await res.json().catch(() => ({}));

    return NextResponse.json({ ok: true, ...payload }, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache" },
    });
}
