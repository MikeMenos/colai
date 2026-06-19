"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { ORDER_WIZARD_PATH_RE } from "@/lib/orderWizardRoute";
import { resetEntireDraft } from "@/store/orders/ordersSlice";

/**
 * Clears persisted draft (order `{}`, ai_ylika/files `[]`, etc.) when navigating away from
 * the order wizard or switching order / mode / uid. Uses route transitions, not wizard unmount,
 * so React Strict Mode does not clear state right after editDraftAsync loads.
 */
export default function OrderDraftResetOnRouteLeave() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const prevRef = React.useRef<{ pathname: string; uid: string } | null>(null);

    const uid = searchParams.get("uid") ?? "";

    React.useEffect(() => {
        const curr = { pathname, uid };

        if (prevRef.current === null) {
            prevRef.current = curr;
            return;
        }

        const before = prevRef.current;
        prevRef.current = curr;

        const prevMatch = before.pathname.match(ORDER_WIZARD_PATH_RE);
        const currMatch = pathname.match(ORDER_WIZARD_PATH_RE);

        const wasOnWizard = !!prevMatch;
        const onWizard = !!currMatch;

        const sameWizardOrder =
            onWizard &&
            prevMatch &&
            currMatch &&
            prevMatch[1] === currMatch[1] &&
            prevMatch[2] === currMatch[2] &&
            prevMatch[3] === currMatch[3] &&
            before.uid === uid;

        if (wasOnWizard && !sameWizardOrder) {
            dispatch(resetEntireDraft());
        }
    }, [pathname, uid, dispatch]);

    return null;
}
