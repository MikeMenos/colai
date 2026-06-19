"use client";

import React from "react";
import { useParams, useSearchParams } from "next/navigation";

import AppLoader from "@/components/ui/AppLoader";
import NotFoundView from "@/components/system/NotFoundView";

import OrderDetailsView from "@/features/orders/components/OrderDetailsView";
import { fetchOrderById } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const ALLOWED_ORDER_TYPES = new Set(["eopyy", "retail"]);

export default function OrderViewPage() {
  const params = useParams<{ orderId: string; orderType: string }>();
  const searchParams = useSearchParams();

  const orderId = Number(params.orderId);
  const orderType = params.orderType;
  const uid = searchParams.get("uid") ?? "";

  const dispatch = useAppDispatch();
  const selected = useAppSelector((s) => s.orders.selected);

  const [isBootstrapping, setIsBootstrapping] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!orderId || !uid) {
        if (isMounted) setIsBootstrapping(false);
        return;
      }

      try {
        await dispatch(fetchOrderById({ orderId, orderUID: uid })).unwrap();
      } finally {
        if (isMounted) setIsBootstrapping(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [dispatch, orderId, uid]);

  if (!ALLOWED_ORDER_TYPES.has(orderType)) return <NotFoundView />;

  if (selected?.loading || isBootstrapping) return <AppLoader label="Φόρτωση παραγγελίας…" />;
  if (selected?.loadingError) return <div className="alert alert-danger">{selected.loadingError}</div>;
  if (!selected?.order) return <NotFoundView title="Δεν βρέθηκε παραγγελία" actionHref="/orders" actionLabel="Πίσω στις παραγγελίες" />;

  return <OrderDetailsView order={selected.order} mode="view" value={{}} />;
}
