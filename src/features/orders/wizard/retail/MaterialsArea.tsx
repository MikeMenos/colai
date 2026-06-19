import {
  removeDraftYliko,
  setDraftProperty,
  updateDraftYlikoQuantity,
} from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React from "react";
import MaterialsLookupModal from "../modals/MaterialsLookupModals";
import SwipeToDeleteYliko from "@/components/ui/SwipeToDeleteYliko";

export default function MaterialsArea() {
  const ylika = useAppSelector((s) => s.orders.draft.ylika);
  const dispatch = useAppDispatch();
  const [showLookup, setShowLookup] = React.useState(false);

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

      {ylika.length > 0 && (
        <div className="d-flex flex-column gap-2">
          {ylika.length > 0 ? (
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
                        <input
                          className="form-control text-center"
                          inputMode="numeric"
                          value={String(y.qty ?? "")}
                          onChange={(e) => {
                            const v = e.target.value.replace(/[^\d]/g, "");
                            dispatch(
                              updateDraftYlikoQuantity({
                                index: idx,
                                quantity: v === "" ? 0 : parseInt(v, 10),
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
          ) : (
            <div className="text-secondary small">
              Δεν έχουν προστεθεί υλικά.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
