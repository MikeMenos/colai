"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchStaticData } from "@/store/staticData/staticDataSlice";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export default function AppBootstrap() {
    const dispatch = useAppDispatch();
    const authStatus = useAppSelector((s) => s.auth.status);
    const staticDataLastFetched = useAppSelector((s) => s.staticData.staticDataLastFetched);

    React.useEffect(() => {
        if (authStatus == "authenticated" && (Date.now() - staticDataLastFetched) > ONE_DAY_MS) dispatch(fetchStaticData());
    }, [dispatch, authStatus, staticDataLastFetched]);

    return null;
}
