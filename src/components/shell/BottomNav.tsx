"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import LeaveOrderWizardConfirmModal from "@/features/orders/components/LeaveOrderWizardConfirmModal";
import BottomToast from "@/components/ui/BottomToast";
import { hasOrderWizardDraftContent } from "@/lib/orderWizardDraftContent";
import { isOrderWizardPath } from "@/lib/orderWizardRoute";
import {
  fetchOrders,
  setDraftProperty,
  submitDraftAsync,
} from "@/store/orders/ordersSlice";

type Item = {
  href: string;
  icon: string;
  label: string;
  badge?: number;
};

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
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
  const [tempSaveToast, setTempSaveToast] = React.useState<string | null>(null);
  const guardWizardLeave = isOrderWizardPath(pathname);

  const items: Item[] = [
    { href: "/", icon: "bi-house", label: "Αρχική" },
    { href: "/orders", icon: "bi-list-check", label: "Παραγγελίες" },
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
    if (!guardWizardLeave || pathname === href) return;
    if (!hasDraftContent) return;
    event.preventDefault();
    setPendingHref(href);
  }

  function confirmLeave() {
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
                      className="position-absolute translate-middle badge rounded-pill bg-danger start-100 top-0"
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
      />

      <BottomToast
        message={tempSaveToast}
        durationMs={2000}
        onDismiss={() => setTempSaveToast(null)}
      />
    </>
  );
}
