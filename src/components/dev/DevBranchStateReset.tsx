"use client";

import React from "react";
import { USER_SESSION_STORAGE_KEYS } from "@/lib/clearUserSession";

const BRANCH_STORAGE_KEY = "colai_dev_branch";
const LEGACY_SESSION_STORAGE_KEYS = [
  ...USER_SESSION_STORAGE_KEYS,
  "dashboard",
  "orderDraft",
] as const;

type RuntimeStateResponse = {
  branchName?: string;
};

async function clearServiceWorkerState(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations.map((registration) => registration.unregister()),
    );
  } catch {
    // Best effort cleanup only.
  }
}

async function clearCacheStorage(): Promise<void> {
  if (!("caches" in window)) return;

  try {
    const cacheNames = await window.caches.keys();
    await Promise.all(
      cacheNames.map((cacheName) => window.caches.delete(cacheName)),
    );
  } catch {
    // Best effort cleanup only.
  }
}

function clearBranchSensitiveLocalStorage() {
  for (const key of LEGACY_SESSION_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore quota / private mode issues
    }
  }
}

export default function DevBranchStateReset() {
  React.useEffect(() => {
    if (process.env.NODE_ENV === "production") return;

    let cancelled = false;

    async function resetIfBranchChanged() {
      try {
        const res = await fetch("/api/dev/runtime-state", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (!res.ok) return;

        const data = (await res.json()) as RuntimeStateResponse;
        const branchName = data.branchName?.trim();
        if (!branchName || cancelled) return;

        const previousBranchName =
          window.localStorage.getItem(BRANCH_STORAGE_KEY);
        if (!previousBranchName) {
          window.localStorage.setItem(BRANCH_STORAGE_KEY, branchName);
          return;
        }

        if (previousBranchName === branchName) return;

        clearBranchSensitiveLocalStorage();
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
        await Promise.all([clearServiceWorkerState(), clearCacheStorage()]);
        window.localStorage.setItem(BRANCH_STORAGE_KEY, branchName);

        if (!cancelled) {
          window.location.reload();
        }
      } catch {
        // Development convenience only; never block app startup.
      }
    }

    void resetIfBranchChanged();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
