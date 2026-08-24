"use client";

import type { GnomateuseisUploadSectionProps } from "./GnomateuseisUploadSection.types";
import React from "react";
import FileUploadButton from "../FileUploadButton";
import type { OrderFile } from "@/types/orders";
import type { FileUploadState } from "./useFileUploadState";
import {
  UploadErrorAlert,
  UploadProgressBlock,
  UploadedFileRow,
  formatUploadingSizeMb,
} from "./fileUploadUi";
import { getOrderFileDisplayName, getOrderFileViewUrl } from "@/lib/utils/order";
import { OrderFilePreviewButtons } from "@/components/ui/OrderFilePreviewButton";

export default function GnomateuseisUploadSection({
  title,
  emptyHint,
  orderUid,
  files,
  documentCategory,
  position,
  disabled = false,
  onFileAdded,
  upload,
  maxFiles,
  footer,
  showFilePreview = false,
}: GnomateuseisUploadSectionProps) {
  const sectionFiles = files.filter(
    (f) => f.documentCategory === documentCategory,
  );
  const canAdd =
    maxFiles == null ? true : sectionFiles.length < maxFiles;
  const formatSize =
    documentCategory === "recipe_aux" ? formatUploadingSizeMb : undefined;
  const previewableFiles = showFilePreview
    ? sectionFiles.filter((file) => getOrderFileViewUrl(file))
    : [];

  return (
    <div className="app-card overflow-hidden p-3">
      <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
        <div className="d-flex align-items-center min-w-0 flex-wrap gap-2">
          <div className="fw-semibold">{title}</div>
          {previewableFiles.length > 0 ? (
            <OrderFilePreviewButtons
              files={previewableFiles}
              variant="outline-primary"
              size="sm"
              style={{ borderRadius: 999, fontWeight: 600 }}
            />
          ) : null}
        </div>

        {canAdd ? (
          <div className="d-flex align-items-center gap-2">
            <FileUploadButton
              ariaLabel="Προσθήκη"
              disabled={disabled || upload.isUploading}
              accept="application/pdf,image/*"
              dispatchFileToRedux={onFileAdded}
              position={position}
              setMessage={upload.setMessage}
              setProgress={upload.setProgress}
              orderUid={orderUid}
              setUploading={upload.setUploading}
              setStatus={upload.setStatus}
              endpoint="/api/orders/file"
              document_category={documentCategory}
            >
              {upload.isUploading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  aria-hidden
                />
              ) : (
                <i className="bi bi-plus-lg" />
              )}
            </FileUploadButton>
          </div>
        ) : null}
      </div>

      {upload.uploading ? (
        <UploadProgressBlock
          uploading={upload.uploading}
          progress={upload.progress}
          status={upload.status}
          message={upload.message}
          formatSize={formatSize}
        />
      ) : upload.message ? (
        <UploadErrorAlert message={upload.message} />
      ) : null}

      {footer}

      {sectionFiles.length > 0 ? (
        <div className="d-flex flex-column gap-2 overflow-hidden">
          {sectionFiles.map((file) => (
            <UploadedFileRow
              key={`${file.position}-${getOrderFileDisplayName(file)}`}
              file={file}
            />
          ))}
        </div>
      ) : (
        <div className="small text-secondary">{emptyHint}</div>
      )}
    </div>
  );
}
