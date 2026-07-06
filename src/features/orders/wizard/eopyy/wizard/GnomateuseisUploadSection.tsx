"use client";

import React from "react";
import FileUploadButton from "../FileUploadButton";
import type { OrderFile } from "@/types/orders";
import type { FileUploadState } from "./useFileUploadState";
import {
  getOrderFileDisplayName,
  UploadErrorAlert,
  UploadProgressBlock,
  UploadedFileRow,
  formatUploadingSizeMb,
} from "./fileUploadUi";

export type GnomateuseisUploadSectionProps = {
  title: string;
  emptyHint: string;
  orderUid: string;
  files: OrderFile[];
  documentCategory: "recipe" | "recipe_aux";
  position: number;
  disabled?: boolean;
  onFileAdded: (file: OrderFile) => void;
  upload: FileUploadState;
  maxFiles?: number;
  footer?: React.ReactNode;
};

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
}: GnomateuseisUploadSectionProps) {
  const sectionFiles = files.filter(
    (f) => f.documentCategory === documentCategory,
  );
  const canAdd =
    maxFiles == null ? true : sectionFiles.length < maxFiles;
  const formatSize =
    documentCategory === "recipe_aux" ? formatUploadingSizeMb : undefined;

  return (
    <div className="app-card overflow-hidden p-3">
      <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
        <div className="fw-semibold">{title}</div>

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
