import { cookieName } from "@/lib/auth";
import axios from "axios";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as {
            id?: number;
            uid: string;
            isapproved: number;
            overrideamount?: number;
        };

        const baseUrl = process.env.AMSA_API_BASE_URL;
        if (!baseUrl) {
            return NextResponse.json({ ok: false, message: "Missing AMSA_API_BASE_URL." }, { status: 500 });
        }

        // Next.js cookies() is async in newer versions
        const jar = await cookies();
        const token = jar.get(cookieName)?.value;

        if (!token) {
            return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
        }

        // basic validation
        if (!body?.uid || typeof body.isapproved !== "number") {
            return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
        }

        const overrideamount = body.overrideamount ?? 0;

        const upstream = await axios.post(
            `${baseUrl}/api/discount-request-review`,
            {
                id: body.id,
                uid: body.uid,
                isapproved: body.isapproved,
                overrideamount,
            },
            {
                headers: {
                    Accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                timeout: 30_000,
            }
        );

        // return upstream response (and keep ok=true for your thunk)
        return NextResponse.json({ ok: true, ...upstream.data }, { status: upstream.status });
    } catch (err: any) {
        if (axios.isAxiosError(err)) {
            const status = err.response?.status ?? 502;
            const upstreamData = err.response?.data;

            return NextResponse.json(
                {
                    ok: false,
                    ...(typeof upstreamData === "object" && upstreamData ? upstreamData : {}),
                    message:
                        (typeof upstreamData === "object" && upstreamData ? (upstreamData as any).message : null) ??
                        err.message ??
                        "Upstream request failed.",
                },
                { status }
            );
        }

        return NextResponse.json({ ok: false, message: err?.message || "Server error." }, { status: 500 });
    }
}
