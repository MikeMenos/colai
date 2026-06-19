"use client";

import React from "react";
import BulkSlotUploadFields from "./BulkSlotUploadFields";
import CompactRunAiButtons from "./CompactRunAiButtons";
import {
  getBulkSlotStatusBadge,
  isBulkSlotUploadDisabled,
  shouldShowBulkAiButtons,
  slotHasRecipeFiles,
} from "./bulkSlotUtils";
import type { BulkOrderSlot } from "./types";
import type { AiClient } from "@/lib/utils/ai";

type BulkOrderUploadSlotProps = {
  index: number;
  slot: BulkOrderSlot;
  canRemove: boolean;
  onRemove: () => void;
  onFilesChange: (files: BulkOrderSlot["files"]) => void;
  onRunAi: (client: AiClient) => void;
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
    <div className="app-card p-2">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <span className="fw-semibold">Παραγγελία {index + 1}</span>
          {badge ? (
            <span className={`badge text-bg-${badge.variant}`}>{badge.label}</span>
          ) : null}
          {slot.status === "processing" ? (
            <span className="spinner-border spinner-border-sm" aria-hidden />
          ) : null}
        </div>

        {canRemove ? (
          <button
            type="button"
            className="btn btn-sm btn-link text-secondary p-0"
            onClick={onRemove}
            disabled={slot.status === "processing"}
            aria-label={`Αφαίρεση παραγγελίας ${index + 1}`}
          >
            <i className="bi bi-x-lg" />
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
              <CompactRunAiButtons
                aiStatus={slot.aiStatus}
                aiRunningClient={slot.aiRunningClient}
                aiDisabledClients={slot.aiDisabledClients}
                hasFiles={hasRecipeFiles}
                onRunAiWithClient={onRunAi}
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
