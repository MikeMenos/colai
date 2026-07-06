import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName, decodeUserInfoCookie, userCookieName } from "@/lib/auth";
import { canAccessSeller } from "@/lib/sellerAccess";

export async function GET(req: Request) {
    const jar = await cookies();
    const token = jar.get(cookieName)?.value;

    if (!token) {
        return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const baseUrl = process.env.AMSA_API_BASE_URL;
    if (!baseUrl) {
        return NextResponse.json({ ok: false, message: "Missing AMSA_API_BASE_URL" }, { status: 500 });
    }

    const url = new URL(req.url);
    const sellerCode = url.searchParams.get("sellercode")?.trim() ?? "";
    const userInfo = decodeUserInfoCookie(jar.get(userCookieName)?.value);

    if (sellerCode && !canAccessSeller(userInfo, sellerCode)) {
        return NextResponse.json(
            { ok: false, message: "Not allowed to filter by this seller code" },
            { status: 403 },
        );
    }

    const backendUrl = new URL(`${baseUrl}/api/get-dashboard-data`);
    if (sellerCode) backendUrl.searchParams.set("sellercode", sellerCode);

    const res = await fetch(backendUrl.toString(), {
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
