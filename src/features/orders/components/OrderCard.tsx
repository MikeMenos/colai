"use client";

import React from "react";
import type { Order } from "@/types/orders";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCompactUIDateTime, formatUIDate } from "@/lib/utils/date";
import Link from "next/link";
import { Modal, Button } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteOrderAsync } from "@/store/orders/ordersSlice";
import { useRouter } from "next/navigation";
import { formatCurrencyGR } from "@/lib/utils/number";
import {
  formatRecipientAddress,
  hasOrderRecipientInfo,
} from "@/lib/utils/orderRecipient";

const ACTION_WIDTH = 88;
const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export default function OrderCard({
  order,
  onDelete,
  onRetryAi,
  showSellerName = false,
}: {
  order: Order;
  onDelete?: (id: number) => void;
  onRetryAi?: (orderUid: string) => Promise<void>;
  showSellerName?: boolean;
}) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userInfo = useAppSelector((s) => s.auth.userInfos);
  const list_order_types = useAppSelector((s) => s.staticData.list_Order_Types);
  const list_group_eoppy = useAppSelector((s) => s.staticData.list_GroupEoppy);

  const isDesktop = useIsDesktop();
  const canDelete = order.statusId === 0 && userInfo?.isSeller;
  const aiBatchStatus = order.aiBatchStatus?.trim().toLowerCase() ?? "";
  const aiQueued = aiBatchStatus === "queued" || aiBatchStatus === "processing";
  const aiFailed = aiBatchStatus === "failed";
  const isAiLocked = aiQueued || aiFailed;
  const canSwipeDelete = canDelete && !isDesktop && !isAiLocked;

  const [x, setX] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);

  const [showConfirm, setShowConfirm] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [retryingAi, setRetryingAi] = React.useState(false);
  const [retryAiError, setRetryAiError] = React.useState<string | null>(null);

  const [open, setOpen] = React.useState(false);

  const startRef = React.useRef({
    x: 0,
    y: 0,
    baseX: 0,
    active: false,
    swiping: false,
    pointerId: -1,
  });
  const blockedClickRef = React.useRef(false);

  React.useEffect(() => {
    if (!canSwipeDelete) {
      setX(0);
      setDragging(false);
      startRef.current.active = false;
      startRef.current.swiping = false;
    }
  }, [canSwipeDelete]);

  function clamp(v: number) {
    return Math.max(-ACTION_WIDTH, Math.min(0, v));
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!canSwipeDelete) return;
    // Swipe-to-delete is a touch gesture; mouse clicks must expand the card.
    if (e.pointerType === "mouse") return;
    if (e.button !== 0) return;

    blockedClickRef.current = false;
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      baseX: x,
      active: true,
      swiping: false,
      pointerId: e.pointerId,
    };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!canSwipeDelete) return;
    if (!startRef.current.active) return;

    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    if (!startRef.current.swiping) {
      const isHorizontal = Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
      if (!isHorizontal) return;

      startRef.current.swiping = true;
      blockedClickRef.current = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setDragging(true);
    }

    e.preventDefault();

    const nextX = clamp(startRef.current.baseX + dx);
    setX(Math.round(nextX));
  }

  function releaseCapturedPointer(e: React.PointerEvent<HTMLDivElement>) {
    const el = e.currentTarget as HTMLElement;
    if (
      startRef.current.pointerId >= 0 &&
      el.hasPointerCapture(startRef.current.pointerId)
    ) {
      el.releasePointerCapture(startRef.current.pointerId);
    }
  }

  function settle(e: React.PointerEvent<HTMLDivElement>) {
    releaseCapturedPointer(e);
    setDragging(false);
    startRef.current.active = false;
    startRef.current.pointerId = -1;

    const shouldOpen = x < -ACTION_WIDTH * 0.35;
    setX(shouldOpen ? -ACTION_WIDTH : 0);
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!canSwipeDelete) return;
    if (!startRef.current.active) return;
    settle(e);
  }

  function onPointerCancel(e: React.PointerEvent<HTMLDivElement>) {
    if (!canSwipeDelete) return;
    if (!startRef.current.active) return;
    blockedClickRef.current = false;
    settle(e);
  }

  function blockClickIfSwiping(e: React.SyntheticEvent) {
    if (blockedClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      blockedClickRef.current = false;
    }
  }

  function onClickDelete() {
    setShowConfirm(true);
  }

  async function confirmDelete() {
    try {
      setDeleting(true);
      await dispatch(
        deleteOrderAsync({ orderId: order.id, orderUID: order.uid }),
      );

      setShowConfirm(false);
      setX(0);
      onDelete?.(order.id);
    } finally {
      setDeleting(false);
    }
  }

  async function handleRetryAi(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (!onRetryAi || !order.uid || retryingAi) return;

    try {
      setRetryingAi(true);
      setRetryAiError(null);
      await onRetryAi(order.uid);
    } catch (error) {
      setRetryAiError(
        error instanceof Error
          ? error.message
          : "Η επανάληψη της ανάλυσης απέτυχε.",
      );
    } finally {
      setRetryingAi(false);
    }
  }

  function closeModal() {
    if (deleting) return;

    setShowConfirm(false);

    setX(0);
    setDragging(false);
    startRef.current.active = false;
    startRef.current.swiping = false;
    startRef.current.pointerId = -1;
    blockedClickRef.current = false;
  }

  const reveal = canSwipeDelete
    ? Math.min(1, Math.max(0, -x / ACTION_WIDTH))
    : 0;

  const typeText =
    list_order_types?.find((t) => t.value == order.type)?.text ?? "";
  const groupText =
    list_group_eoppy?.find((g) => g.value == String(order.group_EOPPY_id))
      ?.text ?? "";
  const dateInText = formatCompactUIDateTime(order.dateIn);

  const doctorLabel =
    order.has_suggested_doctor == 2 ? "Συστήνων ιατρός" : "Ιατρός";
  const doctorName =
    order.has_suggested_doctor == 2
      ? order.doctorSuggested_name
      : order.doctor_name;
  const doctorAmka =
    order.has_suggested_doctor == 2
      ? order.doctorSuggested_amka
      : order.doctor_amka;
  const sellerName = order.sellerName?.trim();
  const showRecipientInfo = hasOrderRecipientInfo(order);
  const recipientAddress = formatRecipientAddress(order);
  const customerMobile = order.customer_mobile?.trim();
  const recipientName = order.recipient_name?.trim();
  const recipientAmka = order.recipient_amka?.trim();
  const recipientMobile = order.recipient_mobile?.trim();
  const recipientOtherContact = [
    order.recipient_mobile2,
    order.recipient_tel,
  ]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" / ");
  const recipientSummary = [order.recipient_relation, order.recipient_reason]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(" • ");

  const chipStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 8px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid var(--bs-border-color-translucent)",
    // background: "var(--bs-body-bg)",
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  const softPrimaryStyle: React.CSSProperties = {
    background: "rgba(var(--bs-primary-rgb), .12)",
    color: "var(--bs-primary)",
    border: "1px solid rgba(var(--bs-primary-rgb), .18)",
  };

  const timestampChipStyle: React.CSSProperties = {
    background: "rgba(var(--bs-info-rgb), .1)",
    color: "var(--bs-emphasis-color)",
    border: "1px solid rgba(var(--bs-info-rgb), .22)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,.08)",
    fontVariantNumeric: "tabular-nums",
  };

  const cardStyle: React.CSSProperties = {
    // borderRadius: 16,
    overflow: "hidden",
    // background: "var(--bs-body-bg)",
    // border: "1px solid var(--bs-border-color-translucent)",
    // boxShadow: "0 10px 24px rgba(0,0,0,.06)",
  };

  const headerStyle: React.CSSProperties = {
    padding: "14px 14px 12px",
    // background: open ? "rgba(var(--bs-secondary-rgb), .06)" : "var(--bs-body-bg)",
    borderBottom: open
      ? "1px solid var(--bs-border-color-translucent)"
      : "1px solid transparent",
  };

  const aiQueuedBadgeStyle: React.CSSProperties = {
    background: "rgba(var(--bs-secondary-rgb), .16)",
    color: "var(--bs-secondary-color)",
    border: "1px solid rgba(var(--bs-secondary-rgb), .28)",
  };

  const aiFailedBadgeStyle: React.CSSProperties = {
    background: "rgba(var(--bs-danger-rgb), .12)",
    color: "var(--bs-danger)",
    border: "1px solid rgba(var(--bs-danger-rgb), .24)",
  };

  const aiBatchBadge = aiQueued ? (
    <span style={{ ...chipStyle, ...aiQueuedBadgeStyle }}>
      <i className="bi bi-robot" />
      <span className="fw-semibold">Ανάλυση από ΑΙ</span>
    </span>
  ) : aiFailed ? (
    <span style={{ ...chipStyle, ...aiFailedBadgeStyle }}>
      <i className="bi bi-exclamation-triangle" />
      <span className="fw-semibold">Αποτυχία του ΑΙ</span>
    </span>
  ) : null;

  const headerContent = (
    <>
      <div style={{ minWidth: 0 }}>
        <div className="d-flex align-items-center flex-wrap gap-2">
          <span style={{ ...chipStyle, ...softPrimaryStyle }}>
            <i className="bi bi-hash" />
            <span className="fw-semibold">{order.id}</span>
          </span>

          {typeText ? <span style={chipStyle}>{typeText}</span> : null}
          {groupText ? <span style={chipStyle}>{groupText}</span> : null}
          {dateInText ? (
            <span
              style={{ ...chipStyle, ...timestampChipStyle }}
              title={`Καταχώρηση: ${dateInText}`}
              aria-label={`Καταχώρηση: ${dateInText}`}
            >
              <i className="bi bi-clock-history" />
              <span className="fw-semibold">{dateInText}</span>
            </span>
          ) : null}
          {aiFailed ? aiBatchBadge : null}
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
          title={order.customer_name}
        >
          {order.customer_name ?? ""}
        </div>

        <div
          className="text-secondary"
          style={{
            fontSize: 13,
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={doctorName}
        >
          {order.has_suggested_doctor == 2
            ? `${order.doctorSuggested_name ?? ""}`
            : `${order.doctor_name ?? ""}`}
        </div>

        {retryAiError ? (
          <div className="small text-danger mt-2">{retryAiError}</div>
        ) : null}
      </div>

      <div className="text-end" style={{ flexShrink: 0 }}>
        {aiQueued ? aiBatchBadge : <StatusBadge status={order.statusId} />}

        {!aiQueued ? (
          <>
            <div
              className="fw-semibold mt-2"
              style={{
                fontSize: 15,
                letterSpacing: 0.2,
              }}
            >
              {formatCurrencyGR(order.kostos)}€
            </div>

            <span
              className="mt-2"
              style={{
                ...chipStyle,
                background: "rgba(var(--bs-secondary-rgb), .08)",
              }}
            >
              <i className="bi bi-box-seam" />
              <span className="small">Υλικά: {order.countYlika}</span>
            </span>
          </>
        ) : null}

        {aiFailed ? (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center gap-1 mt-2"
            onClick={handleRetryAi}
            disabled={retryingAi || !onRetryAi}
            style={{ borderRadius: 999, fontWeight: 600 }}
          >
            {retryingAi ? (
              <span
                className="spinner-border spinner-border-sm"
                aria-hidden
              />
            ) : (
              <i className="bi bi-arrow-clockwise" aria-hidden />
            )}
            Επανάληψη
          </button>
        ) : null}

        {!isAiLocked ? (
          <div
            className="d-inline-flex align-items-center justify-content-center text-secondary mt-2"
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              background: "rgba(var(--bs-secondary-rgb), .08)",
              border: "1px solid var(--bs-border-color-translucent)",
            }}
            aria-hidden="true"
          >
            <i
              className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"}`}
              style={{ fontSize: 14 }}
            />
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <>
      <div
        className="swipe-row"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        style={{
          touchAction: canSwipeDelete ? "pan-y" : "auto",
          userSelect: dragging ? "none" : "auto",
        }}
      >
        {canSwipeDelete ? (
          <div
            className="swipe-actions"
            style={{
              opacity: reveal,
              transform: `translateX(${(1 - reveal) * 12}px)`,
              pointerEvents: reveal > 0.02 ? "auto" : "none",
              transition: dragging
                ? "none"
                : "opacity 140ms ease, transform 140ms ease",
            }}
          >
            <button
              type="button"
              className="btn btn-danger swipe-delete"
              onClick={onClickDelete}
              aria-label="Delete order"
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 18px rgba(220,53,69,.22)",
              }}
            >
              <i className="bi bi-trash3" style={{ fontSize: 18 }} />
            </button>
          </div>
        ) : null}

        <div
          className={`swipe-content ${dragging ? "dragging" : ""}`}
          style={{
            transform: `translate3d(${canSwipeDelete ? x : 0}px, 0, 0)`,
            position: "relative",
            zIndex: 1,
          }}
        >
          {isAiLocked ? (
            <div className="app-card" style={cardStyle}>
              <div
                className="d-flex align-items-start justify-content-between gap-3"
                style={{
                  ...headerStyle,
                  borderBottom: "1px solid transparent",
                }}
              >
                {headerContent}
              </div>
            </div>
          ) : (
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
                onClickCapture={blockClickIfSwiping}
                onPointerUpCapture={blockClickIfSwiping}
              >
                {headerContent}
              </summary>

              <div style={{ padding: "14px 14px 14px" }}>
                <div className="row g-3">
                  <div className="col-4">
                    <div className="small text-secondary">Ημ/νία Συνταγής</div>
                    <div className="fw-medium">
                      {formatUIDate(order.dateOfSyntagi)}
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="small text-secondary">Αξία συνταγής</div>
                    <div className="fw-medium">
                      {formatCurrencyGR(order.kostos)} €
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="small text-secondary">Συμμετοχή</div>
                    <div className="fw-medium">
                      {formatCurrencyGR(order.posoSymmetoxis)} €
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="small text-secondary">ΑΜΚΑ Πελάτη</div>
                    <div className="fw-medium" style={{ letterSpacing: 0.3 }}>
                      {order.customer_amka}
                    </div>
                  </div>
                  {customerMobile ? (
                    <div className="col-4">
                      <div className="small text-secondary">
                        Κινητό Πελάτη
                      </div>
                      <div className="fw-medium">{customerMobile}</div>
                    </div>
                  ) : null}
                  <div className="col-4">
                    <div className="small text-secondary">Έκπτωση</div>
                    <div className="fw-medium">
                      {formatCurrencyGR(order.calculatedDiscPercent)} %
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="small text-secondary">Πληρωτέο</div>
                    <div className="fw-medium">
                      {formatCurrencyGR(order.posoDiscounted)} €
                    </div>
                  </div>

                  <div className="col-12">
                    <div className="small text-secondary">{doctorLabel}</div>
                    <div className="fw-medium">{doctorName}</div>
                    <div className="text-secondary small">
                      AMKA: {doctorAmka}
                    </div>
                  </div>
                  {showSellerName && sellerName ? (
                    <div className="col-12">
                      <div className="d-flex align-items-center gap-2 text-secondary small">
                        <i className="bi bi-person-badge" aria-hidden />
                        <span>Πωλητής</span>
                      </div>
                      <div className="fw-medium">{sellerName}</div>
                    </div>
                  ) : null}

                  {showRecipientInfo ? (
                    <div className="col-12">
                      <div className="d-flex align-items-center gap-2 text-secondary small">
                        <i className="bi bi-person-lines-fill" aria-hidden />
                        <span>Παραλήπτης</span>
                      </div>
                      {recipientName ? (
                        <div className="fw-medium">{recipientName}</div>
                      ) : null}
                      {recipientAmka ? (
                        <div className="text-secondary small">
                          AMKA: {recipientAmka}
                        </div>
                      ) : null}
                      {recipientMobile ? (
                        <div className="text-secondary small">
                          Κινητό: {recipientMobile}
                        </div>
                      ) : null}
                      {recipientSummary ? (
                        <div className="text-secondary small">
                          {recipientSummary}
                        </div>
                      ) : null}
                      {recipientOtherContact ? (
                        <div className="text-secondary small">
                          Τηλ: {recipientOtherContact}
                        </div>
                      ) : null}
                      {recipientAddress ? (
                        <div className="text-secondary small">
                          {recipientAddress}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div
                  style={{
                    height: 1,
                    background: "var(--bs-border-color-translucent)",
                    margin: "14px 0",
                  }}
                />

                <div className="d-flex gap-2">
                  {order.statusId === 0 ? (
                    <button
                      type="button"
                      className="btn btn-outline-primary flex-fill"
                      onClick={() =>
                        router.push(
                          `/orders/${order.id}/${order.type}/edit?uid=${order.uid}`,
                        )
                      }
                      style={{
                        borderRadius: 14,
                        padding: "10px 12px",
                        fontWeight: 600,
                        background: "rgba(var(--bs-primary-rgb), .1)",
                        borderColor: "rgba(var(--bs-primary-rgb), .35)",
                      }}
                    >
                      <i className="bi bi-pencil-fill me-2" />
                      Επεξεργασία
                    </button>
                  ) : null}

                  <Link
                    href={`/orders/${order.id}/${order.type}/view?uid=${order.uid}`}
                    className="btn btn-primary flex-fill"
                    style={{
                      borderRadius: 14,
                      padding: "10px 12px",
                      fontWeight: 700,
                      boxShadow:
                        "0 10px 18px rgba(var(--bs-primary-rgb), .22)",
                    }}
                  >
                    <i className="bi bi-eye me-2" />
                    Προβολή
                  </Link>

                  {canDelete && isDesktop ? (
                    <button
                      type="button"
                      className="btn btn-outline-danger flex-fill"
                      onClick={onClickDelete}
                      style={{
                        borderRadius: 14,
                        padding: "10px 12px",
                        fontWeight: 600,
                      }}
                    >
                      <i className="bi bi-trash3 me-2" />
                      Διαγραφή
                    </button>
                  ) : null}
                </div>
              </div>
            </details>
          )}
        </div>
      </div>

      <Modal
        show={showConfirm}
        onHide={closeModal}
        centered
        backdrop={deleting ? "static" : true}
        keyboard={!deleting}
      >
        <Modal.Header
          closeButton={!deleting}
          style={{
            borderBottom: "1px solid var(--bs-border-color-translucent)",
            background: "rgba(var(--bs-danger-rgb), .04)",
          }}
        >
          <Modal.Title className="fw-semibold">
            Επιβεβαίωση διαγραφής
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="d-flex align-items-start gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: 46,
                height: 46,
                background: "rgba(var(--bs-danger-rgb), .12)",
                border: "1px solid rgba(var(--bs-danger-rgb), .18)",
              }}
            >
              <i className="bi bi-exclamation-triangle-fill text-danger" />
            </div>

            <div style={{ minWidth: 0 }}>
              <div className="fw-semibold mb-1">
                Είστε σίγουροι πως θέλετε να διαγράψετε την παραγγελία #
                {order.id};
              </div>
              <div className="text-secondary small">
                Η ενέργεια αυτή δεν μπορεί να αναιρεθεί.
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer
          style={{ borderTop: "1px solid var(--bs-border-color-translucent)" }}
        >
          <Button
            variant="outline-secondary"
            onClick={closeModal}
            disabled={deleting}
            style={{ borderRadius: 12 }}
          >
            Ακύρωση
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            disabled={deleting}
            style={{ borderRadius: 12 }}
          >
            {deleting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Διαγραφή…
              </>
            ) : (
              "Διαγραφή"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
