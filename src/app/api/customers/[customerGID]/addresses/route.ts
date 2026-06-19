import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ customerGID: string }> }) {
    const token = (await cookies()).get(cookieName)?.value;
    if (!token) return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });

    const customer_GID = (await ctx.params).customerGID;
    if (!customer_GID) return NextResponse.json({ ok: false, message: "Invalid customer_GID" }, { status: 400 });

    const url = new URL(_req.url);
    const customerAMKA = url.searchParams.get("customerAMKA");
    const customerName = url.searchParams.get("customerName");
    const customerAddress = url.searchParams.get("customerAddress");

    const res = await fetch(`${process.env.AMSA_API_BASE_URL}/api/search-address?customer_GID=${customer_GID}&customerAMKA=${customerAMKA}&customerName=${customerName}&customerAddress=${customerAddress}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const t = await res.text().catch(() => { });
        return NextResponse.json({ ok: false, message: t || "Backend fetch failed" }, { status: res.status });
    }

    const payload = await res.json().catch((e: any) => ({ isSucess: false, errorMessage: e.message }));

    return NextResponse.json({ ok: true, ...payload }, {
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache" },
    });
}
