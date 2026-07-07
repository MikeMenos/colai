"use client";

import type { LoaderProps } from "./AppLoader.types";
import React from "react";export default function AppLoader({
  label = "Loading…",
  size = 44,
  card = true,
  overlay = false,
}: LoaderProps) {
  const content = (
    <div
      className={`${card ? "app-card h-100 p-3 text-center" : "text-center"} d-flex flex-column align-items-center justify-content-center`}
    >
      <div
        className="premium-loader mx-auto"
        style={{ width: size, height: size }}
        aria-label={label}
        role="status"
      />
      {label ? <div className="small text-secondary mt-3">{label}</div> : null}
    </div>
  );

  if (!overlay) return content;

  return (
    <div className="premium-loader-overlay" role="alert" aria-busy="true">
      <div style={{ width: "min(92vw, 420px)" }}>{content}</div>
    </div>
  );
}
