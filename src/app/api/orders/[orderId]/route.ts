import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName } from "@/lib/auth";

const UPDATE_ORDER_PATH = "/api/update-order";

function toNum(v: any): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function isBackendOk(payload: any): boolean {
    // Your backend uses statusCode: 0 for success (based on your list-orders response).
    const sc = Number(payload?.statusCode);
    return Number.isFinite(sc) ? sc === 0 : true;
}

function backendError(payload: any): string {
    return payload?.message || payload?.detailedMessage || "Backend error";
}

export async function GET(_req: Request, ctx: { params: Promise<{ orderId: string }> }) {
    const jar = cookies();
    const token = (await jar).get(cookieName)?.value;
    if (!token) return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const baseUrl = process.env.AMSA_API_BASE_URL;
    if (!baseUrl) return NextResponse.json({ ok: false, message: "Missing AMSA_API_BASE_URL" }, { status: 500 });

    const id = toNum((await ctx.params).orderId);
    if (!id) return NextResponse.json({ ok: false, message: "Invalid orderId" }, { status: 400 });

    const url = new URL(_req.url);
    const uid = url.searchParams.get("uid");
    if (!uid) return NextResponse.json({ ok: false, message: "Missing uid" }, { status: 400 });

    const res = await fetch(`${baseUrl}/api/order-view?id=${id}&uid=${uid}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const t = await res.text().catch(() => "");
        return NextResponse.json({ ok: false, message: t || "Backend fetch failed" }, { status: res.status });
    }

    const payload = await res.json().catch(() => ({}));

    return NextResponse.json({ ok: true, ...payload.data });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ orderId: string }> }) {
    const jar = cookies();
    const token = (await jar).get(cookieName)?.value;
    if (!token) return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const baseUrl = process.env.AMSA_API_BASE_URL;
    if (!baseUrl) return NextResponse.json({ ok: false, message: "Missing AMSA_API_BASE_URL" }, { status: 500 });

    const id = toNum((await ctx.params).orderId);
    if (!id) return NextResponse.json({ ok: false, message: "Invalid orderId" }, { status: 400 });

    const patch = await req.json().catch(() => null);
    if (!patch || typeof patch !== "object") {
        return NextResponse.json({ ok: false, message: "Invalid patch body" }, { status: 400 });
    }

    // IMPORTANT: backend update contract unknown here, so we send:
    // { id, ...patch }
    // Adjust to match Swagger exactly.
    const res = await fetch(`${baseUrl}${UPDATE_ORDER_PATH}`, {
        method: "POST", // many .NET backends use POST for updates; change to PUT/PATCH if swagger says so
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...patch }),
        cache: "no-store",
    });

    if (!res.ok) {
        const t = await res.text().catch(() => "");
        return NextResponse.json({ ok: false, message: t || "Backend update failed" }, { status: res.status });
    }

    const payload = await res.json().catch(() => ({}));

    if (!isBackendOk(payload)) {
        return NextResponse.json({ ok: false, message: backendError(payload) }, { status: 500 });
    }

    // Some APIs return updated record in payload.data; some return just ok.
    const updated =
        payload?.data?.mydata?.[0] ??
        payload?.data ??
        payload?.order ??
        null;

    return NextResponse.json({ ok: true, order: updated });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ orderId: string }> }) {
    const jar = cookies();
    const token = (await jar).get(cookieName)?.value;
    if (!token) return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const baseUrl = process.env.AMSA_API_BASE_URL;
    if (!baseUrl) return NextResponse.json({ ok: false, message: "Missing AMSA_API_BASE_URL" }, { status: 500 });

    const id = toNum((await ctx.params).orderId);
    if (!id) return NextResponse.json({ ok: false, message: "Invalid orderId" }, { status: 400 });

    const url = new URL(_req.url);
    const uid = url.searchParams.get("uid");
    if (!uid) return NextResponse.json({ ok: false, message: "Missing uid" }, { status: 400 });

    const res = await fetch(`${baseUrl}/api/order-delete?id=${id}&uid=${uid}`, {
        method: "DELETE",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const t = await res.text().catch(() => "");
        return NextResponse.json({ ok: false, message: t || "Backend fetch failed" }, { status: res.status });
    }

    const payload = await res.json().catch(() => ({}));

    return NextResponse.json({ ok: true, ...payload });
}
