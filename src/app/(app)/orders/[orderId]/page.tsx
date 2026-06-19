"use client";

import React from "react";
import { Alert, FormSelect } from "react-bootstrap";
import { useRouter } from "next/navigation";

import { PlatformCard } from "@/components/ui/PlatformCard";
import SellerActingSelector from "@/features/orders/components/SellerActingSelector";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  editDraftAsync,
  resetEntireDraft,
  setDraftProperty,
} from "@/store/orders/ordersSlice";
import AppLoader from "@/components/ui/AppLoader";

export default function OrderStartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const type = useAppSelector((state) => state.orders.draft.order?.type);
  const groupid = useAppSelector((state) => state.orders.draft.order?.groupid);
  const editState = useAppSelector((state) => state.orders.draft.editState);

  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    dispatch(setDraftProperty({ key: "groupid", value: 4 }));
    dispatch(setDraftProperty({ key: "type", value: null }));
  }, [dispatch]);

  React.useEffect(() => {
    if (type) setError(null);
  }, [type]);

  React.useEffect(() => {
    if (editState.error) setError(editState.error);
  }, [editState.error]);

  const handleContinue = async (ty: string) => {
    setError(null);

    try {
      dispatch(resetEntireDraft());
      const response = await dispatch(
        editDraftAsync({ catid: 4, typeid: ty }),
      ).unwrap();
      router.push(
        `/orders/0/${encodeURIComponent(ty)}/new?uid=${response.data.order.uid}`,
      );
    } catch (e: any) {
      setError(e?.message || "Κάτι πήγε στραβά.");
    }
  };

  return (
    <div className="d-flex flex-column gap-3">
      <div>
        <h1 className="h5 fw-semibold mb-1">Επιλογή πλατφόρμας</h1>
        <p className="text-secondary small mb-0">
          Διάλεξε ροή εργασίας για να ξεκινήσεις.
        </p>
      </div>
      <div className="app-card px-3 py-2">
        <label className="form-label small text-secondary mb-2">
          Κατηγορία
        </label>
        <FormSelect
          value={groupid}
          onChange={(e) =>
            dispatch(
              setDraftProperty({
                key: "groupid",
                value: Number(e.target.value),
              }),
            )
          }
          aria-label="Κατηγορία"
        >
          <option value="4">WC</option>
        </FormSelect>
      </div>

      <div className="d-flex flex-column gap-2">
        <PlatformCard
          title="ΕΟΠΥΥ"
          type="eopyy"
          description="Ανέβασε παραπεμπτικό/γνωμάτευση"
          icon="bi-cloud-upload"
          onClick={(x) => handleContinue(x)}
        />
        <PlatformCard
          title="Λιανικής"
          type="retail"
          description="Συμπλήρωσε στοιχεία"
          icon="bi-ui-checks"
          onClick={(x) => handleContinue(x)}
        />
      </div>

      {error ? (
        <Alert variant="danger" className="mb-0">
          {error}
        </Alert>
      ) : null}
      {editState.loading && <AppLoader card={false} overlay label="" />}
    </div>
  );
}
