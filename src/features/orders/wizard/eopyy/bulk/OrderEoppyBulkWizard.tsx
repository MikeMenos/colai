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
    handleCancelSlot,
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
          <span className="small text-secondary fw-semibold">
            Παραγγελίες ({slots.length}/{MAX_BULK_SLOTS})
          </span>

          {canAddMore ? (
            <button
              type="button"
              className="text-primary btn btn-outline-secondary d-inline-flex align-items-center justify-content-center w-100 gap-2 py-2"
              style={{ borderStyle: "dashed" }}
              onClick={addSlot}
            >
              <i className="bi bi-plus-circle" />
              Προσθήκη παραγγελίας
            </button>
          ) : (
            <div className="small text-secondary py-1 text-center">
              Μέγιστο {MAX_BULK_SLOTS} παραγγελίες
            </div>
          )}
        </div>

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
              onCancel={() => handleCancelSlot(slot.id)}
            />
          ))}
        </div>
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
