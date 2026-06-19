"use client";

import React from "react";
import type { RunAiButtonProps } from "./componentProps";

export default function RunAiButton({
  disabled = false,
  failed = false,
  running = false,
  onClick,
  label = "Run AI",
  icon,
}: RunAiButtonProps) {
  const isDisabled = disabled || running;

  return (
    <button
      type="button"
      className={`btn btn-ai d-inline-flex align-items-center justify-content-center gap-2 w-100${failed ? "btn-ai--failed" : ""}`}
      disabled={isDisabled}
      onClick={() => onClick()}
    >
      <span>{running ? "AI running…" : failed ? `${label}` : label}</span>
      {running ? (
        <i className="bi bi-cpu" />
      ) : failed ? (
        <i className="bi bi-x-circle" />
      ) : (
        (icon ?? <i className="bi bi-robot" />)
      )}
    </button>
  );
}
