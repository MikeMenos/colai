"use client";

import React from "react";
import { Button, Modal } from "react-bootstrap";
import { useRouter } from "next/navigation";
import LeaveOrderWizardConfirmModal from "@/features/orders/components/LeaveOrderWizardConfirmModal";
import SellerActingSelector from "@/features/orders/components/SellerActingSelector";
import { registerBulkLeaveGuard } from "./bulkLeaveGuard";
import { resolveActingSeller } from "@/lib/sellerAccess";
import { fetchOrders } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type MassUploadFile = {
  id: string;
  file: File;
};

type MassUploadSection = {
  id: string;
  files: MassUploadFile[];
};

type MassUploadPayload = {
  catid: 4;
  typeid: "eopyy";
  sellercode: string;
  orders: {
    files: {
      base64file: string;
      base64filename: string;
    }[];
  }[];
};

const MAX_BULK_SECTIONS = 10;
const ACCEPTED_FILES = "application/pdf,image/*";

function createSection(): MassUploadSection {
  return {
    id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    files: [],
  };
}

function formatFileSize(file: File): string {
  const sizeMb = file.size / 1024 / 1024;
  return `${sizeMb.toFixed(sizeMb >= 10 ? 0 : 1)} MB`;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(new Error("Δεν ήταν δυνατή η ανάγνωση αρχείου"));
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.includes(",") ? result.split(",")[1] : result);
    };
    reader.readAsDataURL(file);
  });
}

async function buildMassUploadPayload(
  sections: MassUploadSection[],
  sellercode: string,
): Promise<MassUploadPayload> {
  return {
    catid: 4,
    typeid: "eopyy",
    sellercode,
    orders: await Promise.all(
      sections.map(async (section) => ({
        files: await Promise.all(
          section.files.map(async ({ file }) => ({
            base64file: await readFileAsBase64(file),
            base64filename: file.name,
          })),
        ),
      })),
    ),
  };
}

export default function OrderEoppyBulkWizard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userInfos = useAppSelector((s) => s.auth.userInfos);
  const actingSellerCode = useAppSelector((s) => s.auth.actingSellerCode);
  const selectedSeller = React.useMemo(
    () => resolveActingSeller(userInfos, actingSellerCode),
    [actingSellerCode, userInfos],
  );

  const [sections, setSections] = React.useState<MassUploadSection[]>([
    createSection(),
  ]);
  const [pendingLeaveHref, setPendingLeaveHref] = React.useState<string | null>(
    null,
  );
  const [submitting, setSubmitting] = React.useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null,
  );

  const hasUploadedContent = React.useMemo(
    () => sections.some((section) => section.files.length > 0),
    [sections],
  );
  const canAddMore = sections.length < MAX_BULK_SECTIONS;

  React.useEffect(() => {
    return registerBulkLeaveGuard({
      hasContent: () => hasUploadedContent,
      abortAll: () => undefined,
    });
  }, [hasUploadedContent]);

  function addSection() {
    if (!canAddMore || submitting) return;
    setSections((prev) => [...prev, createSection()]);
  }

  function removeSection(sectionId: string) {
    if (sections.length <= 1 || submitting) return;
    setSections((prev) => prev.filter((section) => section.id !== sectionId));
  }

  function addFiles(sectionId: string, fileList: FileList | null) {
    if (!fileList || submitting) return;
    const nextFiles = Array.from(fileList).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
    }));
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, files: [...section.files, ...nextFiles] }
          : section,
      ),
    );
    setMessage(null);
    setSuccessMessage(null);
  }

  function removeFile(sectionId: string, fileId: string) {
    if (submitting) return;
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              files: section.files.filter((file) => file.id !== fileId),
            }
          : section,
      ),
    );
  }

  function requestLeave(href: string) {
    if (hasUploadedContent && !successMessage) {
      setPendingLeaveHref(href);
      return;
    }
    router.push(href);
  }

  function confirmLeave() {
    const href = pendingLeaveHref ?? "/orders/0";
    setPendingLeaveHref(null);
    router.push(href);
  }

  function requestMassUploadSubmit() {
    const sellercode = selectedSeller?.sellerCode?.trim() ?? "";
    if (!sellercode) {
      setMessage("Δεν βρέθηκε κωδικός πωλητή.");
      return;
    }

    const ordersWithFiles = sections.filter(
      (section) => section.files.length > 0,
    );
    if (ordersWithFiles.length === 0) {
      setMessage("Προσθέστε τουλάχιστον ένα αρχείο σε μία παραγγελία.");
      return;
    }

    setShowSubmitConfirm(true);
  }

  async function submitMassUpload() {
    const sellercode = selectedSeller?.sellerCode?.trim() ?? "";
    if (!sellercode) {
      setMessage("Δεν βρέθηκε κωδικός πωλητή.");
      return;
    }

    const ordersWithFiles = sections.filter(
      (section) => section.files.length > 0,
    );
    if (ordersWithFiles.length === 0) {
      setMessage("Προσθέστε τουλάχιστον ένα αρχείο σε μία παραγγελία.");
      return;
    }

    try {
      setShowSubmitConfirm(false);
      setSubmitting(true);
      setMessage(null);
      setSuccessMessage(null);

      const payload = await buildMassUploadPayload(ordersWithFiles, sellercode);
      const res = await fetch("/api/order-mass-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || "Η μαζική αποστολή απέτυχε.");
      }

      setSuccessMessage("Η μαζική αποστολή ολοκληρώθηκε.");
      setSections([createSection()]);
      void dispatch(fetchOrders({ force: true }));
      router.push("/orders");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Η μαζική αποστολή απέτυχε.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="d-flex flex-column gap-2">
        <SellerActingSelector />

        <div className="d-flex flex-column gap-2">
          <div className="d-flex align-items-center justify-content-between gap-2">
            <span className="small text-secondary fw-semibold">
              Παραγγελίες ({sections.length}/{MAX_BULK_SECTIONS})
            </span>

            <button
              type="button"
              className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 px-3 py-2"
              onClick={requestMassUploadSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <span className="spinner-border spinner-border-sm" aria-hidden />
              ) : (
                <i className="bi bi-send" />
              )}
              <span className="d-none d-sm-inline">
                Αποστολή μαζικής καταχώρησης
              </span>
              <span className="d-inline d-sm-none">Αποστολή</span>
            </button>
          </div>

          {sections.map((section, index) => (
            <div key={section.id} className="app-card border p-2">
              <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
                <div className="d-flex align-items-center gap-2">
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle fw-bold text-primary"
                    style={{
                      width: 34,
                      height: 34,
                      background: "rgba(var(--bs-primary-rgb), 0.12)",
                    }}
                  >
                    {index + 1}
                  </span>
                  <span className="fw-semibold">
                    Παραγγελία (μέχρι 2 σελίδες)
                  </span>
                </div>

                {sections.length > 1 ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => removeSection(section.id)}
                    disabled={submitting}
                    aria-label={`Αφαίρεση παραγγελίας ${index + 1}`}
                  >
                    <i className="bi bi-trash" />
                  </button>
                ) : null}
              </div>

              <label className="btn btn-outline-primary d-inline-flex align-items-center justify-content-center w-100 gap-2">
                <i className="bi bi-cloud-upload" />
                Προσθήκη αρχείων
                <input
                  className="d-none"
                  type="file"
                  accept={ACCEPTED_FILES}
                  multiple
                  disabled={submitting}
                  onChange={(event) => {
                    addFiles(section.id, event.target.files);
                    event.currentTarget.value = "";
                  }}
                />
              </label>

              {section.files.length > 0 ? (
                <div className="d-flex flex-column mt-2 gap-1">
                  {section.files.map(({ id, file }) => (
                    <div
                      key={id}
                      className="d-flex align-items-center justify-content-between gap-2 rounded border px-2 py-1"
                      style={{ minWidth: 0 }}
                    >
                      <div className="min-w-0 flex-grow-1" style={{ minWidth: 0 }}>
                        <div
                          className="text-truncate small fw-semibold"
                          title={file.name}
                        >
                          {file.name}
                        </div>
                        <div className="small text-secondary">
                          {formatFileSize(file)}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-link text-secondary"
                        onClick={() => removeFile(section.id, id)}
                        disabled={submitting}
                        aria-label={`Αφαίρεση αρχείου ${file.name}`}
                      >
                        <i className="bi bi-x-lg" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="small text-secondary mt-2">
                  Δεν έχουν προστεθεί αρχεία.
                </div>
              )}
            </div>
          ))}

          {canAddMore ? (
            <button
              type="button"
              className="text-primary btn btn-outline-secondary d-inline-flex align-items-center justify-content-center w-100 gap-2 py-2"
              style={{ borderStyle: "dashed" }}
              onClick={addSection}
              disabled={submitting}
            >
              <i className="bi bi-plus-circle" />
              Προσθήκη παραγγελίας
            </button>
          ) : (
            <div className="small text-secondary py-1 text-center">
              Μέγιστο {MAX_BULK_SECTIONS} παραγγελίες
            </div>
          )}
        </div>

        {message ? (
          <div className="alert alert-danger mb-0">{message}</div>
        ) : null}
        {successMessage ? (
          <div className="alert alert-success mb-0">{successMessage}</div>
        ) : null}
      </div>

      <Modal
        show={showSubmitConfirm}
        onHide={submitting ? undefined : () => setShowSubmitConfirm(false)}
        centered
        contentClassName="premium-modal"
        backdrop={submitting ? "static" : true}
        keyboard={!submitting}
      >
        <Modal.Body className="p-3">
          <div className="d-flex align-items-start gap-3 mb-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 text-primary"
              style={{
                width: 42,
                height: 42,
                background: "rgba(var(--bs-primary-rgb), 0.12)",
              }}
              aria-hidden
            >
              <i className="bi bi-send" />
            </div>

            <div style={{ minWidth: 0 }}>
              <div className="fw-semibold mb-1">
                Αποστολή μαζικής καταχώρησης
              </div>
              <p className="text-secondary small mb-0">
                Είστε σίγουροι ότι θέλετε να στείλετε τις παραγγελίες που έχουν
                αρχεία; Η αποστολή θα ξεκινήσει αμέσως.
              </p>
            </div>
          </div>

          <div className="d-grid gap-2">
            <Button
              variant="primary"
              onClick={() => void submitMassUpload()}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden
                  />
                  Αποστολή…
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2" aria-hidden />
                  Ναι, αποστολή
                </>
              )}
            </Button>

            <Button
              variant="outline-secondary"
              onClick={() => setShowSubmitConfirm(false)}
              disabled={submitting}
            >
              Ακύρωση
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <LeaveOrderWizardConfirmModal
        show={pendingLeaveHref != null}
        onCancel={() => setPendingLeaveHref(null)}
        onConfirm={confirmLeave}
        showTempSave={false}
        title="Αποχώρηση από μαζική καταχώρηση"
        message="Είστε σίγουροι ότι θέλετε να αποχωρήσετε; Τα επιλεγμένα αρχεία δεν θα σταλούν."
      />
    </>
  );
}
