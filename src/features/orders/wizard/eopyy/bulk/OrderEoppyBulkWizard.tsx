"use client";

import React from "react";
import { Alert } from "react-bootstrap";
import { useRouter } from "next/navigation";
import SellerActingSelector from "@/features/orders/components/SellerActingSelector";
import BulkOrderUploadSlot from "./BulkOrderUploadSlot";
import { useBulkOrderSlots } from "./useBulkOrderSlots";
import { MAX_BULK_SLOTS } from "./types";

export default function OrderEoppyBulkWizard() {
  const router = useRouter();
  const {
    slots,
    addSlot,
    removeSlot,
    handleFilesChange,
    handleRunAi,
    canAddMore,
    savedCount,
  } = useBulkOrderSlots();

  return (
    <div className="d-flex flex-column gap-2">
      <div>
        <button
          type="button"
          className="btn btn-link text-secondary text-decoration-none small mb-1 p-0"
          onClick={() => router.push("/orders/0")}
        >
          <i className="bi bi-chevron-left me-1" />
          Πίσω
        </button>
        <h1 className="h6 fw-semibold my-2">ΕΟΠΥΥ μαζικό</h1>
      </div>

      <SellerActingSelector />

      <div className="d-flex flex-column gap-2">
        {slots.map((slot, index) => (
          <BulkOrderUploadSlot
            key={slot.id}
            index={index}
            slot={slot}
            canRemove={slots.length > 1}
            onRemove={() => removeSlot(slot.id)}
            onFilesChange={(files) => handleFilesChange(slot.id, files)}
            onRunAi={(client) => void handleRunAi(slot.id, client)}
          />
        ))}
      </div>

      {canAddMore ? (
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={addSlot}
        >
          <i className="bi bi-plus-lg me-1" />
          Προσθήκη ({slots.length}/{MAX_BULK_SLOTS})
        </button>
      ) : (
        <div className="text-secondary small text-center">
          Μέγιστο {MAX_BULK_SLOTS} παραγγελίες.
        </div>
      )}
    </div>
  );
}
