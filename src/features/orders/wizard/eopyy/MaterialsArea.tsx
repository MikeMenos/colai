import {
  removeDraftYliko,
  updateDraftYlikoQuantity,
} from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React from "react";
import MaterialsLookupModal from "../modals/MaterialsLookupModals";
import SwipeToDeleteYliko from "@/components/ui/SwipeToDeleteYliko";
import DeferredQuantityInput from "../components/DeferredQuantityInput";
import {
  hasInvalidMaterialsQty,
  MATERIALS_QTY_MESSAGE,
} from "./wizard/materialsValidation";

export default function MaterialsArea() {
  const ylika = useAppSelector((s) => s.orders.draft.ylika);
  const dispatch = useAppDispatch();
  const [showLookup, setShowLookup] = React.useState(false);
  const hasInvalidQty = hasInvalidMaterialsQty(ylika);

  return (
    <div className="app-card px-3 py-2">
      <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
        <div className="fw-semibold">Υλικά</div>

        <button
          type="button"
          className="btn-icon-pill"
          aria-label="Προσθήκη Υλικού"
          onClick={() => setShowLookup(true)}
        >
          <i className="bi bi-plus-lg" />
        </button>
      </div>

      <MaterialsLookupModal
        show={showLookup}
        onClose={() => setShowLookup(false)}
      />

      {ylika.length === 1 ? (
        <div className="alert alert-info small mb-2 d-flex align-items-center gap-2 py-2">
          <i className="bi bi-info-circle flex-shrink-0" aria-hidden />
          <span>Έχετε προσθέσει ένα υλικό.</span>
        </div>
      ) : null}

      {ylika.length > 0 && (
        <div className="d-flex flex-column gap-2">
          <div className="d-flex flex-column gap-2">
            {ylika.map((y, idx) => (
              <SwipeToDeleteYliko
                key={idx}
                onDelete={() => {
                  dispatch(removeDraftYliko(idx));
                }}
                deleteAriaLabel="Αφαίρεση υλικού"
              >
                <div className="app-card px-3 py-2">
                  <div className="d-flex align-items-start justify-content-between gap-3">
                    <div className="flex-grow-1">
                      <span className="badge bg-secondary-subtle text-secondary ms-0">
                        {y.erpCode}
                      </span>
                      <div className="d-flex align-items-center">
                        <div
                          className="fw-semibold"
                          style={{ lineHeight: 1.2 }}
                        >
                          {y.erpName}
                        </div>
                      </div>
                    </div>

                    <div
                      className="text-end"
                      style={{ maxWidth: 60, minWidth: 60 }}
                    >
                      <DeferredQuantityInput
                        value={y.qty}
                        onCommit={(quantity) => {
                          if (quantity === y.qty) return;
                          dispatch(
                            updateDraftYlikoQuantity({
                              index: idx,
                              quantity,
                            }),
                          );
                        }}
                      />
                    </div>
                  </div>
                </div>
              </SwipeToDeleteYliko>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
