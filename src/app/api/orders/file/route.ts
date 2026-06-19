import { cookieName } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    const incoming = await req.formData();
    const token = (await cookies()).get(cookieName)?.value;

    const order_uid = String(incoming.get("order_uid") ?? "");
    const document_category = String(incoming.get("document_category") ?? "recipe");
    const positionRaw = incoming.get("position");
    const position = Number(positionRaw ?? 0);

    const file = incoming.get("file");

    if (!order_uid) return NextResponse.json({ ok: false, message: "Missing order_uid" }, { status: 400 });
    if (!(file instanceof File)) return NextResponse.json({ ok: false, message: "Missing file" }, { status: 400 });
    if (!token) return NextResponse.json({ ok: false, message: "Missing token" }, { status: 401 });

    const ab = await file.arrayBuffer();
    const base64file = Buffer.from(ab).toString("base64");
    const base64filename = file.name;
    const payload = {
        order_uid,
        document_category,
        position,
        base64file,
        base64filename,
    };

    const r = await fetch(`${process.env.AMSA_API_BASE_URL}/api/order-file-upload`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
    });

    const parsed = await r.json().catch((e: any) => ({ ok: false, message: e.message }));
    try {
        return NextResponse.json({ ok: true, ...parsed }, { status: r.status });
    } catch {
        return new NextResponse(parsed, { status: r.status });
    }
}
