import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName } from "@/lib/auth";

export async function GET(req: Request) {
    const jar = cookies();
    const token = (await jar).get(cookieName)?.value;

    if (!token) return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const res = await fetch(`${process.env.AMSA_API_BASE_URL}/api/load-static-data`, {
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
            { status: res.status }
        );
    }

    const payload = await res.json().catch((e) => ({ ok: false, message: e.message }));

    return NextResponse.json({ ok: true, ...payload });
}
