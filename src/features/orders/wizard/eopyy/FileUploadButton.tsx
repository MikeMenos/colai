"use client";

import React from "react";
import { Capacitor } from "@capacitor/core";
import { Modal } from "react-bootstrap";
import type { FileUploadSuccess } from "@/types/api/responses";
import { formatFileSizeMB } from "@/lib/utils/number";
import type { FileUploadButtonProps } from "./componentProps";

function uploadWithProgress(
  fd: FormData,
  endpoint: string,
  onProgress?: (pct: number) => void,
): Promise<FileUploadSuccess> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);
    xhr.responseType = "text";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      const text = xhr.responseText || "";
      let json = {} as FileUploadSuccess;
      try {
        json = text ? (JSON.parse(text) as FileUploadSuccess) : ({} as FileUploadSuccess);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(json);
      else reject({ status: xhr.status, data: json, text });
    };

    xhr.onerror = () =>
      reject({ status: 0, data: null, text: "Network error" });
    xhr.send(fd);
  });
}

function shouldUseUploadSourcePicker(): boolean {
  if (typeof window === "undefined") return false;
  const platform = Capacitor.getPlatform();
  if (platform === "android") return true;
  if (platform === "web" && /Android/i.test(navigator.userAgent)) return true;
  return false;
}

export default function FileUploadButton({
  orderUid,
  accept = "application/pdf,image/*",
  multiple = false,
  disabled = false,
  ariaLabel = "Upload",
  className = "btn-icon-pill",
  children,
  position,
  endpoint,
  document_category = "recipe",
  setMessage,
  setStatus,
  setProgress,
  setUploading,
  dispatchFileToRedux,
  dispatchResultsToRedux,
}: FileUploadButtonProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);
  const galleryInputRef = React.useRef<HTMLInputElement | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [showSourcePicker, setShowSourcePicker] = React.useState(false);
  const useSourcePicker = React.useMemo(
    () => shouldUseUploadSourcePicker(),
    [],
  );

  async function handlePick(file: File) {
    if (!orderUid) return;

    setMessage(null);
    setStatus("uploading");
    setProgress(0);

    setUploading({
      name: file.name,
      fileSize: file.size,
      fileType: file.type || "",
    });

    if (document_category === "consent_form") {
      dispatchResultsToRedux?.(null);
    }

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("order_uid", String(orderUid));
      fd.append("document_category", document_category);
      fd.append("position", String(position));
      fd.append("base64filename", file.name);

      const data = await uploadWithProgress(fd, endpoint, setProgress);

      if (!data || !data?.result || !data?.ok) {
        setStatus("error");
        setMessage(data?.message || "Upload failed");
        return;
      }

      if (document_category == "consent_form") {
        dispatchResultsToRedux &&
          dispatchResultsToRedux({
            form_score: data?.dataobject?.form_score,
          });
      }

      dispatchFileToRedux({
        originalFileName: file.name,
        base64filename: file.name,
        name: file.name,
        position,
        document_category,
        documentCategory: document_category,
        fileSize: formatFileSizeMB(file.size),
        fileType: file.type,
      });

      setStatus("idle");
      setProgress(0);
      setUploading(null);
    } catch (e: any) {
      console.log(e);
      setStatus("error");
      setProgress(0);
      setMessage(e?.data?.message || e?.text || "Upload failed");
    }
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list || list.length === 0) return;

    const files = Array.from(list);
    await handlePick(files[0]);

    e.target.value = "";
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
        className={className}
        aria-label={ariaLabel}
        disabled={disabled}
        style={{ borderRadius: 50 }}
        onClick={openPicker}
      >
        {children ?? <i className="bi bi-plus-lg" />}
      </button>

      {/* iOS / desktop: native picker (Photo Library, Camera, Files on iOS). */}
      <input
        ref={inputRef}
        className="d-none"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
      />

      {/* Android: separate inputs so camera / gallery appear (combined accept often = files only). */}
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
            accept={accept}
            multiple={multiple}
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
