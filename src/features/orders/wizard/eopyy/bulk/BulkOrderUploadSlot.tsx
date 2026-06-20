"use client";

import React from "react";
import BulkSlotUploadFields from "./BulkSlotUploadFields";
import BulkUploadButton from "./BulkUploadButton";
import {
  getBulkSlotStatusBadge,
  isBulkSlotUploadDisabled,
  shouldShowBulkAiButtons,
  slotHasRecipeFiles,
} from "./bulkSlotUtils";
import type { BulkOrderSlot } from "./types";

type BulkOrderUploadSlotProps = {
  index: number;
  slot: BulkOrderSlot;
  canRemove: boolean;
  onRemove: () => void;
  onFilesChange: (files: BulkOrderSlot["files"]) => void;
  onRunAi: () => void;
};

export default function BulkOrderUploadSlot({
  index,
  slot,
  canRemove,
  onRemove,
  onFilesChange,
  onRunAi,
}: BulkOrderUploadSlotProps) {
  const badge = getBulkSlotStatusBadge(slot.status);
  const hasRecipeFiles = slotHasRecipeFiles(slot);
  const showAiButtons = shouldShowBulkAiButtons(slot);

  return (
    <div
      className="app-card border-primary-subtle border p-2"
      style={{
        boxShadow:
          "var(--app-shadow-tight), 0 0 0 1px rgba(var(--bs-primary-rgb), 0.06)",
      }}
    >
      <div className="d-flex align-items-center justify-content-between border-bottom mb-3 pb-2">
        <div className="d-flex align-items-center gap-2">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold text-primary flex-shrink-0"
            style={{
              width: 34,
              height: 34,
              fontSize: "0.9rem",
              background: "rgba(var(--bs-primary-rgb), 0.12)",
              border: "1px solid rgba(var(--bs-primary-rgb), 0.2)",
            }}
            aria-hidden
          >
            {index + 1}
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="fw-semibold fs-6">Παραγγελία</span>
            {badge ? (
              <span className={`badge text-bg-${badge.variant}`}>
                {badge.label}
              </span>
            ) : null}
            {slot.status === "processing" ? (
              <span className="spinner-border spinner-border-sm" aria-hidden />
            ) : null}
          </div>
        </div>

        {canRemove ? (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onRemove}
            disabled={slot.status === "processing"}
            aria-label={`Αφαίρεση παραγγελίας ${index + 1}`}
          >
            <i className="bi bi-trash" />
          </button>
        ) : null}
      </div>

      {slot.status === "initializing" ? (
        <div className="small text-secondary">Δημιουργία…</div>
      ) : slot.orderUid ? (
        <>
          <BulkSlotUploadFields
            orderUid={slot.orderUid}
            files={slot.files}
            disabled={isBulkSlotUploadDisabled(slot)}
            onFilesChange={onFilesChange}
          />

          {showAiButtons ? (
            <div className="mt-2">
              <BulkUploadButton
                aiStatus={slot.aiStatus}
                hasFiles={hasRecipeFiles}
                disabled={isBulkSlotUploadDisabled(slot)}
                onClick={onRunAi}
              />
            </div>
          ) : null}
        </>
      ) : null}

      {slot.aiMessage ? (
        <div className="small text-danger mt-1">{slot.aiMessage}</div>
      ) : null}

      {slot.statusMessage && slot.status === "error" ? (
        <div className="small text-danger mt-1">{slot.statusMessage}</div>
      ) : null}
    </div>
  );
}
