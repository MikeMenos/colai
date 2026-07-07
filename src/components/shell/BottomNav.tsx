"use client";

import type { Item } from "./BottomNav.types";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import LeaveOrderWizardConfirmModal from "@/features/orders/components/LeaveOrderWizardConfirmModal";
import BottomToast from "@/components/ui/BottomToast";
import { hasOrderWizardDraftContent } from "@/lib/orderWizardDraftContent";
import {
  isOrderEoppyBulkPath,
  shouldGuardOrderWizardLeave,
} from "@/lib/orderWizardRoute";
import { getBulkLeaveGuard } from "@/features/orders/wizard/eopyy/bulk/bulkLeaveGuard";
import {
  fetchOrders,
  setDraftProperty,
  submitDraftAsync,
} from "@/store/orders/ordersSlice";

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/orders" && /^\/orders\/0(?:\/|$)/.test(pathname)) {
    return false;
  }
  return pathname.startsWith(href);
}

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pendingDiscounts = useAppSelector(
    (s) => s.discountRequests.requests.filter((r) => r.statusId == -1).length,
  );
  const draft = useAppSelector((s) => s.orders.draft);
  const submitState = useAppSelector((s) => s.orders.draft.submitState);
  const hasDraftContent = React.useMemo(
    () => hasOrderWizardDraftContent(draft),
    [draft],
  );
  const [pendingHref, setPendingHref] = React.useState<string | null>(null);
  const [leaveModalMode, setLeaveModalMode] = React.useState<
    "wizard" | "bulk"
  >("wizard");
  const [tempSaveToast, setTempSaveToast] = React.useState<string | null>(null);
  const guardWizardLeave = shouldGuardOrderWizardLeave(pathname);
  const onBulkPage = isOrderEoppyBulkPath(pathname);

  const items: Item[] = [
    { href: "/", icon: "bi-house", label: "Αρχική" },
    {
      href: "/orders",
      icon: "bi-list-check",
      label: "Παραγγελίες",
    },
    { href: "/diadikasia-wc", icon: "bi-calendar-check", label: "WC" },
    { href: "/salesWC", icon: "bi-receipt", label: "Πωλήσεις" },
    {
      href: "/discount-requests",
      icon: "bi-tag",
      label: "Αιτήματα",
      badge: pendingDiscounts || undefined,
    },
  ];

  function handleNavItemClick(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (pathname === href) return;

    if (onBulkPage) {
      const guard = getBulkLeaveGuard();
      if (guard?.hasContent()) {
        event.preventDefault();
        setLeaveModalMode("bulk");
        setPendingHref(href);
        return;
      }
      return;
    }

    if (!guardWizardLeave) return;
    if (!hasDraftContent) return;
    event.preventDefault();
    setLeaveModalMode("wizard");
    setPendingHref(href);
  }

  function confirmLeave() {
    if (leaveModalMode === "bulk") {
      getBulkLeaveGuard()?.abortAll();
    }
    if (pendingHref) router.push(pendingHref);
    setPendingHref(null);
  }

  async function confirmTempSave() {
    if (!pendingHref) return;

    try {
      dispatch(setDraftProperty({ key: "isTempSave", value: 1 }));
      const result = await dispatch(submitDraftAsync()).unwrap();
      if (result.result) {
        const href = pendingHref;
        setPendingHref(null);
        setTempSaveToast(
          result.message?.trim() || "Η προσωρινή αποθήκευση ολοκληρώθηκε",
        );
        router.push(href);
        await dispatch(fetchOrders({ force: true }));
      }
    } catch {
      // submitState.error is shown in the modal
    }
  }

  return (
    <>
      <nav className="app-bottom-nav">
        <div className="d-flex justify-content-around px-2">
          {items.map((it) => {
            const active = isActive(pathname, it.href);
            return (
              <Link
                key={it.href}
                href={it.href}
                onClick={(event) => handleNavItemClick(event, it.href)}
                className={
                  "text-decoration-none d-flex flex-column align-items-center justify-content-center px-2 py-2 " +
                  (active ? "text-primary" : "text-secondary")
                }
                aria-current={active ? "page" : undefined}
              >
                <div className="position-relative">
                  <i className={`nav-icon bi ${it.icon}`} />
                  {it.badge ? (
                    <span
                      className={`position-absolute translate-middle badge rounded-pill bg-${it.badgeVariant ?? "danger"} start-100 top-0`}
                      style={{ fontSize: "0.65rem" }}
                    >
                      {it.badge}
                    </span>
                  ) : null}
                </div>
                <div className="nav-label mt-1">{it.label}</div>
              </Link>
            );
          })}
        </div>
      </nav>

      <LeaveOrderWizardConfirmModal
        show={pendingHref != null}
        onCancel={() => setPendingHref(null)}
        onConfirm={confirmLeave}
        onTempSave={() => void confirmTempSave()}
        tempSaveLoading={submitState.loading}
        tempSaveError={submitState.error}
        showTempSave={leaveModalMode === "wizard"}
        title={
          leaveModalMode === "bulk"
            ? "Αποχώρηση από μαζική καταχώρηση"
            : undefined
        }
        message={
          leaveModalMode === "bulk"
            ? "Είστε σίγουροι ότι θέλετε να αποχωρήσετε; Τα ανεβασμένα αρχεία θα χαθούν και οι τρέχουσες διεργασίες AI/αποθήκευσης θα ακυρωθούν."
            : undefined
        }
      />

      <BottomToast
        message={tempSaveToast}
        durationMs={2000}
        onDismiss={() => setTempSaveToast(null)}
      />
    </>
  );
}
