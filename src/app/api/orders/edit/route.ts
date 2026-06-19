import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName } from "@/lib/auth";

export async function GET(req: Request) {
    const jar = cookies();
    const token = (await jar).get(cookieName)?.value;

    if (!token) {
        return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const baseUrl = process.env.AMSA_API_BASE_URL;
    if (!baseUrl) {
        return NextResponse.json({ ok: false, message: "Missing AMSA_API_BASE_URL" }, { status: 500 });
    }

    const url = new URL(req.url);
    const qs = url.searchParams.toString();

    const backendUrl = `${baseUrl}/api/order-edit${qs ? `?${qs}` : ""}`;

    const res = await fetch(backendUrl, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        return NextResponse.json(
            { ok: false, message: text || "Backend orders fetch failed" },
            { status: res.status }
        );
    }

    const payload = await res.json().catch(() => ({}));

    return NextResponse.json({ ok: true, ...payload });
}