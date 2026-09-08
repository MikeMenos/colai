"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";

function setViewportAttrs() {
  const standalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.matchMedia?.("(display-mode: fullscreen)")?.matches ||
    (window.navigator as Navigator & { standalone?: boolean })?.standalone ===
      true;
  const isNative = Capacitor.isNativePlatform();

  document.documentElement.setAttribute(
    "data-pwa",
    standalone || isNative ? "true" : "false",
  );
  document.documentElement.setAttribute(
    "data-native",
    isNative ? "true" : "false",
  );
}

export function ViewportRuntime() {
  useEffect(() => {
    setViewportAttrs();

    const mq = window.matchMedia("(display-mode: standalone)");
    const onDisplayModeChange = () => setViewportAttrs();
    mq.addEventListener("change", onDisplayModeChange);

    return () => mq.removeEventListener("change", onDisplayModeChange);
  }, []);

  return null;
}
