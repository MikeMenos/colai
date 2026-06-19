"use client";

import React from "react";
import { DiscountRequest } from "@/types/discoutRequest";
import { DiscountRequestStatusBadge } from "@/components/ui/DiscountRequestStatusBadge";
import { formatUIDate } from "@/lib/utils/date";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatCurrencyGR } from "@/lib/utils/number";
import { Modal, Button } from "react-bootstrap";
import { reviewDiscountRequest } from "@/store/discountRequests/discountRequestsSlice";

type SheetMode = "approve" | "deny" | "amount" | null;

export default function DiscountRequestCard({
  request,
}: {
  request: DiscountRequest;
  canSwipeDelete?: boolean;
}) {
  const isPending = request.isDiscountApproved == -1;
  const userInfo = useAppSelector((s) => s.auth.userInfos);
  const userCanMakeAction = useAppSelector(
    (s) => s.discountRequests.userCanMakeAction,
  );
  const list_order_types = useAppSelector((s) => s.staticData.list_Order_Types);
  const dispatch = useAppDispatch();

  // review state from redux (loading + error)
  const reviewState = useAppSelector((s) => s.discountRequests.review);
  const isBusy = !!reviewState?.loading;
  const errorMsg = reviewState?.error;

  const [open, setOpen] = React.useState(false);

  // bottom-sheet state
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [sheetMode, setSheetMode] = React.useState<SheetMode>(null);
  const [amount, setAmount] = React.useState("");

  React.useEffect(() => {
    if (!sheetOpen) setAmount("");
  }, [sheetOpen]);

  const typeText =
    list_order_types?.find((t) => t.value == request.type)?.text ?? "";
  const groupText = request?.group_EOPPY ?? "";
  const discPercent = Number(
    String(request.calculatedDiscPercent ?? 0).replace(",", "."),
  );
  const discPercentText = Number.isFinite(discPercent)
    ? `${formatCurrencyGR(discPercent)}%`
    : "0%";

  const chipStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 8px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid var(--bs-border-color-translucent)",
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  const softPrimaryStyle: React.CSSProperties = {
    background: "rgba(var(--bs-primary-rgb), .12)",
    color: "var(--bs-primary)",
    border: "1px solid rgba(var(--bs-primary-rgb), .18)",
  };

  const cardStyle: React.CSSProperties = {
    overflow: "hidden",
  };

  const headerStyle: React.CSSProperties = {
    padding: "14px 14px 12px",
    borderBottom: open
      ? "1px solid var(--bs-border-color-translucent)"
      : "1px solid transparent",
  };

  const actionGridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    marginTop: 14,
  };

  const actionBtnStyle: React.CSSProperties = {
    borderRadius: 14,
    padding: "10px 10px",
    fontWeight: 700,
    width: "100%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    whiteSpace: "nowrap",
  };

  function openSheet(mode: Exclude<SheetMode, null>) {
    setSheetMode(mode);
    if (mode === "amount") setAmount(String(request.posoDiscounted ?? ""));
    setSheetOpen(true);
  }

  function closeSheet() {
    if (isBusy) return;
    setSheetOpen(false);
    setSheetMode(null);
  }

  async function onConfirmSheet() {
    if (!sheetMode) return;

    try {
      if (sheetMode === "approve") {
        await dispatch(
          reviewDiscountRequest({
            id: request.id,
            uid: request.uid,
            isapproved: 1,
            overrideamount: request.posoDiscounted,
          }),
        ).unwrap();
      }

      if (sheetMode === "deny") {
        await dispatch(
          reviewDiscountRequest({
            id: request.id,
            uid: request.uid,
            isapproved: 0,
          }),
        ).unwrap();
      }

      if (sheetMode === "amount") {
        const parsed = Number(String(amount).replace(",", "."));
        if (!Number.isFinite(parsed) || parsed < 0) return;

        await dispatch(
          reviewDiscountRequest({
            id: request.id,
            uid: request.uid,
            isapproved: 1,
            overrideamount: parsed,
          }),
        ).unwrap();
      }

      // success -> close
      setSheetOpen(false);
      setSheetMode(null);
    } catch {
      // error is stored in redux reviewState.error -> keep sheet open
    }
  }

  const sheetTitle =
    sheetMode === "approve"
      ? "Επιβεβαίωση έγκρισης"
      : sheetMode === "deny"
        ? "Επιβεβαίωση απόρριψης"
        : sheetMode === "amount"
          ? "Αλλαγή τελικού ποσού"
          : "";

  const confirmText =
    sheetMode === "approve"
      ? "Έγκριση"
      : sheetMode === "deny"
        ? "Απόρριψη"
        : "Αποθήκευση";

  const confirmVariant =
    sheetMode === "approve"
      ? "success"
      : sheetMode === "deny"
        ? "danger"
        : "primary";

  return (
    <>
      {/* Bottom-sheet CSS */}
      <style jsx global>{`
        .modal.bottomsheet {
          padding: 0 !important;
        }
        .modal.bottomsheet .modal-dialog {
          position: fixed;
          left: 0;
          right: 0;
          bottom: 0;
          margin: 0;
          max-width: 100%;
          transform: translate3d(0, 100%, 0);
          transition: transform 220ms ease;
          pointer-events: none;
        }
        .modal.bottomsheet.show .modal-dialog {
          transform: translate3d(0, 0, 0);
        }
        .modal.bottomsheet .modal-dialog .modal-content {
          pointer-events: auto;
          border: 0;
          border-top-left-radius: 18px;
          border-top-right-radius: 18px;
          box-shadow: 0 -18px 40px rgba(0, 0, 0, 0.18);
          padding-bottom: env(safe-area-inset-bottom);
        }
        .bottomsheet-grabber {
          width: 44px;
          height: 5px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.18);
          margin: 10px auto 6px;
        }
      `}</style>

      <div
        className="swipe-row"
        style={{
          touchAction: "pan-y",
          userSelect: "auto",
        }}
      >
        <div
          className="swipe-content"
          style={{
            transform: `translate3d(0px, 0, 0)`,
            position: "relative",
            zIndex: 1,
          }}
        >
          <details
            className="app-card"
            style={cardStyle}
            onToggle={(e) =>
              setOpen((e.currentTarget as HTMLDetailsElement).open)
            }
          >
            <summary
              className="d-flex align-items-start justify-content-between gap-3"
              style={{
                ...headerStyle,
                listStyle: "none",
                cursor: "pointer",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div className="d-flex align-items-center flex-wrap gap-2">
                  <span style={{ ...chipStyle, ...softPrimaryStyle }}>
                    <i className="bi bi-hash" />
                    <span className="fw-semibold">{request.id}</span>
                  </span>

                  {typeText ? <span style={chipStyle}>{typeText}</span> : null}
                  {groupText ? (
                    <span style={chipStyle}>{groupText}</span>
                  ) : null}
                </div>

                <div
                  className="mt-2"
                  style={{
                    color: "var(--bs-body-color)",
                    fontWeight: 650,
                    fontSize: 15,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {request.customer_name}
                </div>

                <div
                  className="text-secondary"
                  style={{ fontSize: 13, marginTop: 2 }}
                >
                  <span style={{ letterSpacing: 0.3 }}>
                    {userInfo?.isSeller ? "" : request.sellerName}
                  </span>
                </div>
              </div>

              <div className="text-end" style={{ flexShrink: 0 }}>
                <DiscountRequestStatusBadge
                  status={request.isDiscountApproved}
                />
                <div className="fw-semibold mt-2" style={{ fontSize: 15 }}>
                  {formatCurrencyGR(request.posoDiscounted)}€
                </div>
                <div
                  className="text-secondary"
                  style={{ fontSize: 14, lineHeight: 1.2, marginTop: 2 }}
                >
                  {discPercentText}
                </div>
              </div>
            </summary>

            <div style={{ padding: "14px 14px 14px" }}>
              <div className="row g-3">
                <div className="col-8">
                  <div className="small text-secondary">
                    Ημερομηνία Συνταγής
                  </div>
                  <div className="fw-medium">
                    {formatUIDate(request.dateOfSyntagi)}
                  </div>
                </div>
                <div className="col-4">
                  <div className="small text-secondary">Κόστος υλικών</div>
                  <div className="fw-medium">
                    {formatCurrencyGR(request.kostos)}€
                  </div>
                </div>
                <div className="col-8">
                  <div className="small text-secondary">
                    Ημερομηνία Υποβολής
                  </div>
                  <div className="fw-medium">
                    {formatUIDate(request.dateIn)}
                  </div>
                </div>
                <div className="col-4">
                  <div className="small text-secondary">Συμμετοχή</div>
                  <div className="fw-medium">
                    {formatCurrencyGR(request.posoSymmetoxis)}€{" "}
                    {request.symmPercentage ?? "0"}%
                  </div>
                </div>
                <div className="col-12">
                  <div className="small text-secondary">Ιατρός</div>
                  <div className="fw-medium">{request.doctor_name}</div>
                  <div className="text-secondary small">
                    AMKA: {request.doctor_amka}
                  </div>
                </div>
              </div>

              {userCanMakeAction && isPending ? (
                <>
                  <div
                    style={{
                      height: 1,
                      background: "var(--bs-border-color-translucent)",
                      margin: "14px 0",
                    }}
                  />

                  <div style={actionGridStyle}>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => openSheet("deny")}
                      style={actionBtnStyle}
                      disabled={isBusy}
                    >
                      <i className="bi bi-x-lg" />
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => openSheet("amount")}
                      style={actionBtnStyle}
                      disabled={isBusy}
                    >
                      <i className="bi bi-cash-coin" />
                    </button>

                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => openSheet("approve")}
                      style={{
                        ...actionBtnStyle,
                        boxShadow: "0 10px 18px rgba(25, 135, 84, .18)",
                      }}
                      disabled={isBusy}
                    >
                      <i className="bi bi-check2" />
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </details>
        </div>
      </div>
      {userCanMakeAction && (
        <Modal
          show={sheetOpen}
          onHide={closeSheet}
          className="bottomsheet"
          backdrop={isBusy ? "static" : true}
          keyboard={!isBusy}
          centered={false}
        >
          <div className="bottomsheet-grabber" />

          <Modal.Header
            closeButton={!isBusy}
            style={{
              borderBottom: "1px solid var(--bs-border-color-translucent)",
              paddingTop: 8,
            }}
          >
            <Modal.Title className="fw-semibold" style={{ fontSize: 16 }}>
              {sheetTitle}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body style={{ paddingTop: 12 }}>
            <div className="text-secondary" style={{ fontSize: 13 }}>
              Πελάτης:{" "}
              <span className="fw-semibold text-body">
                {request.customer_name}
              </span>
              <span className="mx-2">•</span>
              Αίτημα #{request.id}
            </div>

            {/* error */}
            {errorMsg ? (
              <div
                className="alert alert-danger mt-3 mb-0 py-2"
                role="alert"
                style={{ borderRadius: 12 }}
              >
                <div className="d-flex align-items-start gap-2">
                  <i className="bi bi-exclamation-triangle-fill mt-1" />
                  <div style={{ minWidth: 0 }}>
                    <div className="fw-semibold">Αποτυχία ενέργειας</div>
                    <div className="small">{String(errorMsg)}</div>
                  </div>
                </div>
              </div>
            ) : null}

            {sheetMode === "approve" ? (
              <div className="d-flex mt-3 gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    background: "rgba(25, 135, 84, 0.12)",
                    border: "1px solid rgba(25, 135, 84, 0.18)",
                  }}
                >
                  <i className="bi bi-check2-circle text-success" />
                </div>
                <div>
                  <div className="fw-semibold">
                    Είστε σίγουροι ότι θέλετε να εγκρίνετε το αίτημα;
                  </div>
                  <div className="text-secondary small mt-1">
                    Τελικό ποσό πληρωμής:{" "}
                    <span className="fw-semibold text-body">
                      {formatCurrencyGR(request.posoDiscounted)}€
                    </span>
                  </div>
                </div>
              </div>
            ) : null}

            {sheetMode === "deny" ? (
              <div className="d-flex mt-3 gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{
                    width: 44,
                    height: 44,
                    background: "rgba(220, 53, 69, 0.12)",
                    border: "1px solid rgba(220, 53, 69, 0.18)",
                  }}
                >
                  <i className="bi bi-x-circle text-danger" />
                </div>
                <div>
                  <div className="fw-semibold">
                    Είστε σίγουροι ότι θέλετε να απορρίψετε το αίτημα;
                  </div>
                  <div className="text-secondary small mt-1">
                    Η ενέργεια αυτή θα καταγραφεί στο ιστορικό.
                  </div>
                </div>
              </div>
            ) : null}

            {sheetMode === "amount" ? (
              <div className="mt-3">
                <div className="fw-semibold mb-2">Νέο τελικό ποσό</div>

                <div
                  className="input-group"
                  style={{ borderRadius: 14, overflow: "hidden" }}
                >
                  <span
                    className="input-group-text"
                    style={{ borderRadius: 0 }}
                  >
                    <i className="bi bi-cash-coin" />
                  </span>
                  <input
                    className="form-control"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="π.χ. 10.00"
                    disabled={isBusy}
                  />
                  <span
                    className="input-group-text"
                    style={{ borderRadius: 0 }}
                  >
                    €
                  </span>
                </div>

                <div className="text-secondary small mt-2">
                  Τρέχον:{" "}
                  <span className="fw-semibold text-body">
                    {formatCurrencyGR(request.posoDiscounted)}€
                  </span>
                </div>
              </div>
            ) : null}
          </Modal.Body>

          <Modal.Footer
            style={{
              borderTop: "1px solid var(--bs-border-color-translucent)",
            }}
          >
            <Button
              variant="outline-secondary"
              onClick={closeSheet}
              disabled={isBusy}
              style={{ borderRadius: 12 }}
            >
              Ακύρωση
            </Button>

            <Button
              variant={confirmVariant}
              onClick={onConfirmSheet}
              disabled={
                isBusy ||
                !sheetMode ||
                (sheetMode === "amount" && String(amount).trim() === "")
              }
              style={{ borderRadius: 12, minWidth: 140 }}
            >
              {isBusy ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Επεξεργασία…
                </>
              ) : (
                confirmText
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
}
