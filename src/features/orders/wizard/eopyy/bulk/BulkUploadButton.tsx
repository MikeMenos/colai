"use client";

import React from "react";
import type { AiStatus } from "@/lib/utils/ai";

type BulkUploadButtonProps = {
  aiStatus: AiStatus;
  hasFiles: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export default function BulkUploadButton({
  aiStatus,
  hasFiles,
  disabled = false,
  onClick,
}: BulkUploadButtonProps) {
  const isRunning = aiStatus === "running";
  const isDisabled = disabled || !hasFiles || isRunning;

  return (
    <button
      type="button"
      className="btn btn-sm btn-primary d-inline-flex align-items-center justify-content-center w-100 gap-2"
      disabled={isDisabled}
      onClick={onClick}
    >
      {isRunning ? (
        <>
          <span className="spinner-border spinner-border-sm" aria-hidden />
          Επεξεργασία…
        </>
      ) : (
        <>
          <i className="bi bi-cloud-upload" />
          Αποθήκευση
        </>
      )}
    </button>
  );
}
