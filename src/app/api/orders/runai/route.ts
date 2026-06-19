import { cookieName } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const token = (await cookies()).get(cookieName)?.value;
    if (!token) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const order_uid = String(body?.order_uid ?? "");
    const catid = String(body?.catid ?? "");
    const aiclient = String(body?.aiclient ?? "");
    if (!order_uid) return NextResponse.json({ ok: false, message: "Missing order_uid" }, { status: 400 });
    if (!catid) return NextResponse.json({ ok: false, message: "Missing catid" }, { status: 400 });
    // NOTE: adjust payload keys to match Swagger if needed
    const payload = {
        order_uid,
        catid,
        aiclient
    };

    const r = await fetch(`${process.env.AMSA_API_BASE_URL}/api/order-runai`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
    });

    const text = await r.text();
    try {
        return NextResponse.json(JSON.parse(text), { status: r.status });
    } catch {
        return new NextResponse(text, { status: r.status });
    }
}
