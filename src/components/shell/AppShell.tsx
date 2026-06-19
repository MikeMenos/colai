"use client";

import React, { Suspense } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import BottomNav from "@/components/shell/BottomNav";
import OrderDraftResetOnRouteLeave from "@/features/orders/components/OrderDraftResetOnRouteLeave";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutAsync } from "@/features/auth/authSlice";

import Dropdown from "react-bootstrap/Dropdown";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const userInfos = useAppSelector((s) => s.auth?.userInfos);
  const fullName =
    [userInfos?.fname, userInfos?.lname].filter(Boolean).join(" ") ||
    "Λογαριασμός";

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const displayName = mounted ? fullName : "Λογαριασμός";

  const onSettings = () => {
    router.push("/settings");
  };

  const onLogout = async () => {
    try {
      await dispatch(logoutAsync());
      router.replace("/login");
    } catch (e) {}
  };

  return (
    <div className="app-viewport d-flex flex-column">
      <Suspense fallback={null}>
        <OrderDraftResetOnRouteLeave />
      </Suspense>
      <header className="app-header">
        <div className="d-flex align-items-center justify-content-between px-3">
          <div className="d-flex justify-content-start flex-grow-1">
            <Image
              src="/mono_logo.png"
              alt="App logo"
              width={120}
              height={28}
              priority
              style={{ height: 28, width: "auto" }}
            />
          </div>
          {/* Left: Back */}
          <div
            className="d-flex align-items-center gap-2"
            style={{ minWidth: 44 }}
          >
            {/* {showBack ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary app-pill"
                aria-label="Back"
                onClick={() => router.back()}
              >
                <i className="bi bi-chevron-left" />
              </button>
            ) : null} */}
          </div>

          {/* Center: Logo */}

          {/* Right: User menu */}
          <div
            className="d-flex align-items-center justify-content-end"
            style={{ minWidth: 44 }}
          >
            <Dropdown align="end">
              <Dropdown.Toggle
                id="user-menu"
                size="sm"
                variant="outline-secondary"
                className="app-pill d-inline-flex align-items-center gap-2"
                aria-label="User menu"
                style={{ maxWidth: 200 }}
              >
                <span
                  className="text-truncate"
                  style={{ maxWidth: 170 }}
                  suppressHydrationWarning
                >
                  {displayName}
                </span>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={onSettings}>
                  <i className="bi bi-gear me-2" />
                  Ρυθμίσεις
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={onLogout}>
                  <i className="bi bi-box-arrow-right me-2" />
                  Αποσύνδεση
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </header>

      <main className="app-content">{children}</main>
      <BottomNav />
    </div>
  );
}
