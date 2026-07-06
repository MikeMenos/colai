"use client";

import React from "react";
import { Capacitor } from "@capacitor/core";
import { Modal } from "react-bootstrap";
import { useRouter } from "next/navigation";
import LeaveOrderWizardConfirmModal from "@/features/orders/components/LeaveOrderWizardConfirmModal";
import SellerActingSelector from "@/features/orders/components/SellerActingSelector";
import { registerBulkLeaveGuard } from "./bulkLeaveGuard";
import { resolveActingSeller } from "@/lib/sellerAccess";
import { fetchOrders } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type UploadSide = "front" | "back";
type SectionStatus = "draft" | "submitting" | "success" | "error";

type MassUploadSection = {
  id: string;
  frontFile: File | null;
  backFile: File | null;
  status: SectionStatus;
  message: string | null;
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
    frontFile: null,
    backFile: null,
    status: "draft",
    message: null,
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
  files: File[],
  sellercode: string,
): Promise<MassUploadPayload> {
  return {
    catid: 4,
    typeid: "eopyy",
    sellercode,
    orders: [
      {
        files: await Promise.all(
          files.map(async (file) => ({
            base64file: await readFileAsBase64(file),
            base64filename: file.name,
          })),
        ),
      },
    ],
  };
}

function getStatusBadge(status: SectionStatus) {
  if (status === "submitting") {
    return { label: "Αποστολή...", className: "text-bg-primary" };
  }
  if (status === "success") {
    return { label: "Ολοκληρώθηκε", className: "text-bg-success" };
  }
  if (status === "error") {
    return { label: "Σφάλμα", className: "text-bg-danger" };
  }
  return null;
}

function getSelectedFiles(section: MassUploadSection): File[] {
  return [section.frontFile, section.backFile].filter(Boolean) as File[];
}

function shouldUseUploadSourcePicker(): boolean {
  if (typeof window === "undefined") return false;
  const platform = Capacitor.getPlatform();
  if (platform === "android") return true;
  if (platform === "web" && /Android/i.test(navigator.userAgent)) return true;
  return false;
}

type LocalFilePickerButtonProps = {
  id: string;
  disabled: boolean;
  ariaLabel: string;
  onFileChange: (file: File) => void;
};

function LocalFilePickerButton({
  id,
  disabled,
  ariaLabel,
  onFileChange,
}: LocalFilePickerButtonProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);
  const galleryInputRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [showSourcePicker, setShowSourcePicker] = React.useState(false);
  const useSourcePicker = React.useMemo(
    () => shouldUseUploadSourcePicker(),
    [],
  );

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.currentTarget.value = "";
    if (file) onFileChange(file);
  }

  function openPicker() {
    if (disabled) return;
    if (useSourcePicker) {
      setShowSourcePicker(true);
      return;
    }
    inputRef.current?.click();
  }

  function pickFrom(ref: React.RefObject<HTMLInputElement | null>) {
    setShowSourcePicker(false);
    window.setTimeout(() => ref.current?.click(), 0);
  }

  return (
    <>
      <button
        type="button"
        className="btn-icon-pill"
        aria-label={ariaLabel}
        disabled={disabled}
        style={{ borderRadius: 50 }}
        onClick={openPicker}
      >
        <i className="bi bi-plus-lg" />
      </button>

      <input
        id={id}
        ref={inputRef}
        className="d-none"
        type="file"
        accept={ACCEPTED_FILES}
        onChange={handleChange}
      />

      {useSourcePicker ? (
        <>
          <input
            ref={cameraInputRef}
            className="d-none"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleChange}
          />
          <input
            ref={galleryInputRef}
            className="d-none"
            type="file"
            accept="image/*"
            onChange={handleChange}
          />
          <input
            ref={fileInputRef}
            className="d-none"
            type="file"
            accept={ACCEPTED_FILES}
            onChange={handleChange}
          />

          <Modal
            show={showSourcePicker}
            onHide={() => setShowSourcePicker(false)}
            centered
            contentClassName="premium-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title className="h6 mb-0">Προσθήκη αρχείου</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-0">
              <div className="list-group list-group-flush">
                <button
                  type="button"
                  className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3"
                  onClick={() => pickFrom(cameraInputRef)}
                >
                  <i className="bi bi-camera fs-5" aria-hidden />
                  Λήψη φωτογραφίας
                </button>
                <button
                  type="button"
                  className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3"
                  onClick={() => pickFrom(galleryInputRef)}
                >
                  <i className="bi bi-images fs-5" aria-hidden />
                  Βιβλιοθήκη φωτογραφιών
                </button>
                <button
                  type="button"
                  className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3"
                  onClick={() => pickFrom(fileInputRef)}
                >
                  <i className="bi bi-folder2-open fs-5" aria-hidden />
                  Επιλογή αρχείου (PDF / εικόνα)
                </button>
              </div>
            </Modal.Body>
          </Modal>
        </>
      ) : null}
    </>
  );
}

type PageUploadBoxProps = {
  id: string;
  title: string;
  file: File | null;
  disabled: boolean;
  onFileChange: (file: File) => void;
  onFileRemove: () => void;
};

function PageUploadBox({
  id,
  title,
  file,
  disabled,
  onFileChange,
  onFileRemove,
}: PageUploadBoxProps) {
  return (
    <div className="rounded border p-2">
      <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
        <div className="fw-semibold small">{title}</div>

        {!file && !disabled ? (
          <LocalFilePickerButton
            id={id}
            disabled={disabled}
            ariaLabel={`Προσθήκη ${title}`}
            onFileChange={onFileChange}
          />
        ) : null}
      </div>

      {file ? (
        <div className="d-flex align-items-center justify-content-between gap-2">
          <div className="min-w-0 flex-grow-1" style={{ minWidth: 0 }}>
            <div className="text-truncate small fw-semibold" title={file.name}>
              {file.name}
            </div>
            <div className="small text-secondary">{formatFileSize(file)}</div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-link text-secondary"
            onClick={onFileRemove}
            disabled={disabled}
            aria-label={`Αφαίρεση αρχείου ${file.name}`}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
      ) : (
        <div className="small text-secondary">Δεν έχει προστεθεί αρχείο.</div>
      )}
    </div>
  );
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
  const [message, setMessage] = React.useState<string | null>(null);

  const activeSection = sections[sections.length - 1];
  const canAddMore = sections.length < MAX_BULK_SECTIONS;
  const canAddOrder = Boolean(activeSection?.frontFile) && canAddMore;
  const hasUnsavedContent = React.useMemo(
    () =>
      sections.some(
        (section) =>
          getSelectedFiles(section).length > 0 && section.status !== "success",
      ),
    [sections],
  );

  React.useEffect(() => {
    return registerBulkLeaveGuard({
      hasContent: () => hasUnsavedContent,
      abortAll: () => undefined,
    });
  }, [hasUnsavedContent]);

  function updateSection(sectionId: string, patch: Partial<MassUploadSection>) {
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section,
      ),
    );
  }

  async function submitSection(sectionId: string, files: File[]) {
    const sellercode = selectedSeller?.sellerCode?.trim() ?? "";
    if (!sellercode) {
      updateSection(sectionId, {
        status: "error",
        message: "Δεν βρέθηκε κωδικός πωλητή.",
      });
      return;
    }
    if (files.length === 0) return;

    updateSection(sectionId, { status: "submitting", message: null });

    try {
      const payload = await buildMassUploadPayload(files, sellercode);
      const res = await fetch("/api/order-mass-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || "Η αποστολή απέτυχε.");
      }

      updateSection(sectionId, {
        status: "success",
        message: "Η παραγγελία στάλθηκε.",
      });
      void dispatch(fetchOrders({ force: true }));
    } catch (error) {
      updateSection(sectionId, {
        status: "error",
        message: error instanceof Error ? error.message : "Η αποστολή απέτυχε.",
      });
    }
  }

  function handleFileChange(sectionId: string, side: UploadSide, file: File) {
    const section = sections.find((item) => item.id === sectionId);
    if (!section || section.status === "success") return;

    const nextSection = {
      ...section,
      [side === "front" ? "frontFile" : "backFile"]: file,
      status: "draft" as const,
      message: null,
    };

    updateSection(sectionId, nextSection);
    setMessage(null);

    if (side === "back" && nextSection.frontFile && nextSection.backFile) {
      void submitSection(sectionId, getSelectedFiles(nextSection));
    }
  }

  function handleFileRemove(sectionId: string, side: UploadSide) {
    const section = sections.find((item) => item.id === sectionId);
    if (
      !section ||
      section.status === "submitting" ||
      section.status === "success"
    ) {
      return;
    }

    updateSection(sectionId, {
      [side === "front" ? "frontFile" : "backFile"]: null,
      status: "draft",
      message: null,
    });
  }

  function handleRetry(section: MassUploadSection) {
    const files = getSelectedFiles(section);
    if (files.length === 0) return;
    void submitSection(section.id, files);
  }

  function addSection() {
    if (!activeSection?.frontFile) {
      setMessage("Ανεβάστε πρώτα τη μπροστινή σελίδα.");
      return;
    }
    if (!canAddMore) return;

    if (
      activeSection.status !== "success" &&
      activeSection.status !== "submitting"
    ) {
      void submitSection(activeSection.id, getSelectedFiles(activeSection));
    }

    setSections((prev) => [...prev, createSection()]);
    setMessage(null);
  }

  function requestLeave(href: string) {
    if (hasUnsavedContent) {
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

  return (
    <>
      <div className="d-flex flex-column gap-2">
        <SellerActingSelector />

        <div className="d-flex flex-column gap-2">
          <div className="d-flex align-items-center justify-content-between gap-2">
            <span className="small text-secondary fw-semibold">
              Παραγγελίες ({sections.length}/{MAX_BULK_SECTIONS})
            </span>
          </div>

          {sections.map((section, index) => {
            const statusBadge = getStatusBadge(section.status);
            const isLocked =
              section.status === "submitting" || section.status === "success";

            return (
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
                    <span className="fw-semibold">Παραγγελία</span>
                  </div>

                  {statusBadge ? (
                    <span className={`badge ${statusBadge.className}`}>
                      {section.status === "submitting" ? (
                        <span
                          className="spinner-border spinner-border-sm me-1"
                          aria-hidden
                        />
                      ) : null}
                      {statusBadge.label}
                    </span>
                  ) : null}
                </div>

                <div className="d-flex flex-column gap-2">
                  <PageUploadBox
                    id={`${section.id}-front`}
                    title={`Μπροστινή σελίδα`}
                    file={section.frontFile}
                    disabled={isLocked}
                    onFileChange={(file) =>
                      handleFileChange(section.id, "front", file)
                    }
                    onFileRemove={() => handleFileRemove(section.id, "front")}
                  />

                  {section.frontFile &&
                  (section.status !== "success" || section.backFile) ? (
                    <PageUploadBox
                      id={`${section.id}-back`}
                      title={`Πίσω σελίδα (εάν υπάρχει)`}
                      file={section.backFile}
                      disabled={isLocked}
                      onFileChange={(file) =>
                        handleFileChange(section.id, "back", file)
                      }
                      onFileRemove={() => handleFileRemove(section.id, "back")}
                    />
                  ) : null}
                </div>

                {section.message ? (
                  <div
                    className={`small mt-2 ${
                      section.status === "error"
                        ? "text-danger"
                        : "text-success"
                    }`}
                  >
                    {section.message}
                  </div>
                ) : null}

                {section.status === "error" ? (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary mt-2"
                    onClick={() => handleRetry(section)}
                  >
                    Επανάληψη αποστολής
                  </button>
                ) : null}
              </div>
            );
          })}

          {canAddMore ? (
            <button
              type="button"
              className="text-primary btn btn-outline-secondary d-inline-flex align-items-center justify-content-center w-100 gap-2 py-2"
              style={{ borderStyle: "dashed" }}
              onClick={addSection}
              disabled={!canAddOrder}
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
      </div>

      <LeaveOrderWizardConfirmModal
        show={pendingLeaveHref != null}
        onCancel={() => setPendingLeaveHref(null)}
        onConfirm={confirmLeave}
        showTempSave={false}
        title="Αποχώρηση από μαζική καταχώρηση"
        message="Είστε σίγουροι ότι θέλετε να αποχωρήσετε; Οι παραγγελίες που δεν ολοκληρώθηκαν δεν θα σταλούν."
      />
    </>
  );
}
