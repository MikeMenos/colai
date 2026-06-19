"use client";

import React from "react";
import { useParams, useSearchParams } from "next/navigation";

import AppLoader from "@/components/ui/AppLoader";
import NotFoundView from "@/components/system/NotFoundView";

import { editDraftAsync, loadCustomerAddressesAsync } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { store } from "@/store/store";
import { applyCustomerFieldsFromLoadedAddresses } from "@/features/orders/wizard/eopyy/wizard/bootstrapExistingOrderEdit";
import type { OrderListOfAddressPersons } from "@/types/orders";

import OrderEoppyWizard from "@/features/orders/wizard/eopyy/OrderEoppyWizard";
import OrderRetailWizard from "@/features/orders/wizard/retail/OrderRetailWizard";

const WIZARDS: Record<string, React.ComponentType> = {
  eopyy: OrderEoppyWizard,
  retail: OrderRetailWizard,
};

export default function OrderWizardEditPage() {
  const dispatch = useAppDispatch();
  const params = useParams<{ orderType: string }>();
  const searchParams = useSearchParams();

  const orderType = params.orderType;
  const uid = searchParams.get("uid") ?? "";

  const editState = useAppSelector((s) => s.orders.draft.editState);
  const [isBootstrapping, setIsBootstrapping] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      try {
        const result = await dispatch(editDraftAsync({ catid: 4, typeid: orderType, uid })).unwrap();
        if (!isMounted || !result?.ok) return;
        const order = store.getState().orders.draft.order;
        const gid = order.customer_ErpGID?.toString().trim();
        const amka = order.customer_amka?.toString().trim();
        if (gid && amka) {
          try {
            const addressResult = await dispatch(
              loadCustomerAddressesAsync({
                customer_ErpGID: order.customer_ErpGID,
                customer_amka: order.customer_amka ?? "",
                customer_name: order.customer_name ?? "",
                customer_address: order.customer_address ?? "",
                preferredPersonErpGID: order.person_ErpGID,
                preferredAddressErpGID: order.address_ErpGID,
              }),
            ).unwrap();

            if (addressResult.ok) {
              applyCustomerFieldsFromLoadedAddresses(
                dispatch,
                (addressResult.addresses ?? []) as OrderListOfAddressPersons[],
                amka,
              );
            }
          } catch {
            // Addresses fetch failure does not fail the edit flow
          }
        }
      } finally {
        if (isMounted) setIsBootstrapping(false);
      }
    };

    void bootstrap();
    return () => {
      isMounted = false;
    };
  }, [dispatch, orderType, uid]);

  const Wizard = WIZARDS[orderType];
  if (!Wizard) return <NotFoundView />;

  if (editState.loading || isBootstrapping) return <AppLoader label="Φόρτωση παραγγελίας…" />;
  if (editState.error) return <div className="alert alert-danger">{editState.error}</div>;

  return <Wizard />;
}
