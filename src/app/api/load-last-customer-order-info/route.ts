import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const token = (await cookies()).get(cookieName)?.value;
    if (!token) return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const baseUrl = process.env.AMSA_API_BASE_URL;
    if (!baseUrl) {
        return NextResponse.json({ ok: false, message: "Missing AMSA_API_BASE_URL" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const customer_gid = String(body?.customer_gid ?? "").trim();
    const customer_amka = String(body?.customer_amka ?? "").trim();

    if (!customer_gid) {
        return NextResponse.json({ ok: false, message: "Missing customer_gid" }, { status: 400 });
    }

    const res = await fetch(`${baseUrl}/api/load-last-customer-order-info`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ customer_gid, customer_amka }),
        cache: "no-store",
    });

    const payload = await res.json().catch((e: unknown) => ({ message: String(e) }));

    if (!res.ok) {
        return NextResponse.json(
            { ok: false, message: (payload as { message?: string })?.message || "Backend request failed" },
            { status: res.status }
        );
    }

    return NextResponse.json({ ok: true, ...payload }, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate", Pragma: "no-cache" },
    });
}
