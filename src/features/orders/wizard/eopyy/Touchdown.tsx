// Touchdown.tsx
"use client";

import { setDraftProperty } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import React from "react";
import { Alert } from "react-bootstrap";
import OrderField from "@/components/ui/OrderField";
import type { TouchdownProps } from "./componentProps";
import {
  formatWizardStepLabel,
  prepareTouchdownIssues,
} from "./wizard/sortWizardIssues";

export default function Touchdown({
  issues = [],
  onGoToIssue,
  stepOrder,
}: TouchdownProps) {
  const data = useAppSelector((s) => s.orders.draft.order);
  const dispatch = useAppDispatch();
  const submitState = useAppSelector((s) => s.orders.draft.submitState);

  React.useEffect(() => {
    if (!data.isTempSave)
      dispatch(setDraftProperty({ key: "isTempSave", value: 0 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedIssues = React.useMemo(() => {
    if (!stepOrder || stepOrder.size === 0) return issues;
    return prepareTouchdownIssues(issues, stepOrder);
  }, [issues, stepOrder]);

  return (
    <>
      <div className="app-card my-2 p-3">
        <div className="form-check form-switch switch-lg mb-0">
          <input
            className="form-check-input"
            type="checkbox"
            checked={data.isTempSave == 1}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "isTempSave",
                  value: e.target.checked ? 1 : 0,
                }),
              )
            }
            name="isTempSave"
            id="isTempSave"
          />
          <label className="form-check-label" htmlFor="isTempSave">
            Προσωρινή αποθήκευση
          </label>
        </div>

        <div className="mt-3">
          <OrderField label="Σχόλια παραγγελίας">
            <textarea
              className="form-control"
              name="sellerComments"
              rows={2}
              value={data.sellerComments ?? ""}
              onChange={(e) =>
                dispatch(
                  setDraftProperty({
                    key: "sellerComments",
                    value: e.target.value,
                  }),
                )
              }
            />
          </OrderField>
        </div>
      </div>

      {sortedIssues.length > 0 && (
        <div className="app-card border-danger-subtle mb-2 border p-3">
          <div className="d-flex flex-column gap-2">
            <div className="d-flex align-items-start gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 border"
                style={{ width: 38, height: 38 }}
                aria-hidden
              >
                <i className="bi bi-exclamation-triangle text-danger fs-5" />
              </div>

              <div style={{ minWidth: 0 }}>
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <div className="fw-semibold">
                    Ελλείψεις πριν την αποθήκευση
                  </div>
                  <span className="badge text-bg-danger">
                    {sortedIssues.length}
                  </span>
                </div>

                <div className="text-body-secondary small mt-1">
                  Πατήστε σε μια γραμμή για να μεταφερθείτε στο αντίστοιχο
                  πεδίο.
                </div>
              </div>
            </div>

            <div className="d-flex flex-column gap-2">
              {sortedIssues.map((it, idx) => {
                const stepPrefix =
                  stepOrder && stepOrder.size > 0
                    ? formatWizardStepLabel(it.step, stepOrder)
                    : it.step;
                const text = it.error;

                return (
                  <button
                    key={`${it.step}-${it.field}-${idx}`}
                    type="button"
                    onClick={() => onGoToIssue?.(it)}
                    className="btn w-100 border text-start"
                    style={{ borderRadius: 12 }}
                  >
                    <div className="d-flex align-items-start gap-2">
                      <i className="bi bi-arrow-return-right text-danger mt-1" />
                      <div className="flex-grow-1">
                        <div className="small text-body-secondary">
                          {stepPrefix}
                        </div>
                        <div className="fw-semibold">{text}</div>
                      </div>
                      <i className="bi bi-chevron-right text-body-secondary mt-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {submitState.error && (
        <Alert className="mt-3" variant="danger">
          {submitState.error}
        </Alert>
      )}
    </>
  );
}
