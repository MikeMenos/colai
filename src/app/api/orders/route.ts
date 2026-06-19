import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  DEFAULT_ORDER_LIST_PAGE,
  DEFAULT_ORDER_LIST_PAGE_SIZE,
} from "@/lib/api/orderListQuery";
import { cookieName } from "@/lib/auth";

const WEB_ORDERS_PATH = "/api/list-orders";
const ERP_ORDERS_PATH = "/api/list-erp-orders";

function extractOrdersArray(payload: any): any[] {
    // Your backend returns orders here:
    if (Array.isArray(payload?.data?.mydata)) return payload.data.mydata;

    // Safe fallbacks (in case other endpoints differ)
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.result)) return payload.result;

    return [];
}

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
    const mode = url.searchParams.get("mode");
    const page = url.searchParams.get("page") ?? String(DEFAULT_ORDER_LIST_PAGE);
    const pagesize =
      url.searchParams.get("pagesize") ??
      String(DEFAULT_ORDER_LIST_PAGE_SIZE);
    const search = url.searchParams.get("search")?.trim();

    const backendParams = new URLSearchParams();
    backendParams.set("page", page);
    backendParams.set("pagesize", pagesize);
    if (search) backendParams.set("search", search);

    const path = mode === "erp" ? ERP_ORDERS_PATH : WEB_ORDERS_PATH;
    const backendUrl = `${baseUrl}${path}?${backendParams.toString()}`;

    const res = await fetch(backendUrl, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
    });

    // If backend uses real non-2xx codes:
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        return NextResponse.json(
            { ok: false, message: text || "Backend orders fetch failed" },
            { status: res.status }
        );
    }

    const payload = await res.json().catch(() => ({}));

    // // IMPORTANT: backend logical errors can still come with HTTP 200
    // // Your example shows statusCode: 0 for success. Treat non-zero as error.
    // const statusCode = Number(payload?.statusCode);
    // if (Number.isFinite(statusCode) && statusCode !== 200) {
    //     return NextResponse.json(
    //         {
    //             ok: false,
    //             message: payload?.message || "Backend returned error",
    //             detailedMessage: payload?.detailedMessage || null,
    //         },
    //         { status: 500 }
    //     );
    // }

    const arr = extractOrdersArray(payload);

    // Optional: return paging too (useful later)
    const paging = payload?.data?.paging_item ?? null;

    return NextResponse.json({ ok: true, orders: arr, paging });
}

export async function POST(req: Request) {
    const jar = cookies();
    const token = (await jar).get(cookieName)?.value;

    if (!token) {
        return NextResponse.json({ ok: false, message: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
        return NextResponse.json({ ok: false, message: "Invalid body" }, { status: 400 });
    }

    const baseUrl = process.env.AMSA_API_BASE_URL;
    if (!baseUrl) {
        return NextResponse.json({ ok: false, message: "Missing AMSA_API_BASE_URL" }, { status: 500 });
    }
    const backendUrl = `${baseUrl}/api/order-save`;

    const res = await fetch(backendUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });


    // If backend uses real non-2xx codes:
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
