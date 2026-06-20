"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LeaveOrderWizardConfirmModal from "@/features/orders/components/LeaveOrderWizardConfirmModal";
import SellerActingSelector from "@/features/orders/components/SellerActingSelector";
import BulkOrderUploadSlot from "./BulkOrderUploadSlot";
import { useBulkOrderSlots } from "./useBulkOrderSlots";
import { MAX_BULK_SLOTS } from "./types";

export default function OrderEoppyBulkWizard() {
  const router = useRouter();
  const [pendingLeaveHref, setPendingLeaveHref] = React.useState<string | null>(
    null,
  );
  const {
    slots,
    addSlot,
    removeSlot,
    handleFilesChange,
    handleRunAi,
    abortAllJobs,
    hasUploadedContent,
    canAddMore,
  } = useBulkOrderSlots();

  function requestLeave(href: string) {
    if (hasUploadedContent) {
      setPendingLeaveHref(href);
      return;
    }
    router.push(href);
  }

  function confirmLeave() {
    abortAllJobs();
    const href = pendingLeaveHref ?? "/orders/0";
    setPendingLeaveHref(null);
    router.push(href);
  }

  return (
    <>
      <div className="d-flex flex-column gap-2">
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
              onRunAi={() => void handleRunAi(slot.id)}
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

      <LeaveOrderWizardConfirmModal
        show={pendingLeaveHref != null}
        onCancel={() => setPendingLeaveHref(null)}
        onConfirm={confirmLeave}
        showTempSave={false}
        title="Αποχώρηση από μαζική καταχώρηση"
        message="Είστε σίγουροι ότι θέλετε να αποχωρήσετε; Τα ανεβασμένα αρχεία θα χαθούν και οι τρέχουσες διεργασίες AI/αποθήκευσης θα ακυρωθούν."
      />
    </>
  );
}
