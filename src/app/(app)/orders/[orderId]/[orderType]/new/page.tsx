"use client";

import React from "react";
import { useParams } from "next/navigation";

import NotFoundView from "@/components/system/NotFoundView";
import { useAppDispatch } from "@/store/hooks";
import { setDraftProperty } from "@/store/orders/ordersSlice";

import OrderEoppyWizard from "@/features/orders/wizard/eopyy/OrderEoppyWizard";
import OrderEoppyBulkWizard from "@/features/orders/wizard/eopyy/bulk/OrderEoppyBulkWizard";
import OrderRetailWizard from "@/features/orders/wizard/retail/OrderRetailWizard";

const WIZARDS: Record<string, React.ComponentType> = {
  eopyy: OrderEoppyWizard,
  "eopyy-bulk": OrderEoppyBulkWizard,
  retail: OrderRetailWizard,
};

export default function OrderWizardNewPage() {
  const dispatch = useAppDispatch();
  const params = useParams<{ orderType: string }>();
  const orderType = params.orderType;

  React.useEffect(() => {
    dispatch(setDraftProperty({ key: "type", value: orderType }));
  }, [dispatch, orderType]);

  const Wizard = WIZARDS[orderType];
  if (!Wizard) return <NotFoundView />;

  return <Wizard />;
}
