"use client";

import React from "react";
import FileUploadButton from "../FileUploadButton";
import type { OrderFile } from "@/types/orders";
import { useFileUploadState } from "../wizard/useFileUploadState";
import {
  FileTypeIcon,
  getOrderFileDisplayName,
  MAX_RECIPE_FILES,
} from "../wizard/fileUploadUi";

type BulkUploadRowProps = {
  title: string;
  emptyHint: string;
  orderUid: string;
  files: OrderFile[];
  documentCategory: "recipe" | "recipe_aux";
  position: number;
  disabled?: boolean;
  onFileAdded: (file: OrderFile) => void;
  maxFiles?: number;
};

function BulkUploadRow({
  title,
  emptyHint,
  orderUid,
  files,
  documentCategory,
  position,
  disabled = false,
  onFileAdded,
  maxFiles,
}: BulkUploadRowProps) {
  const upload = useFileUploadState();
  const sectionFiles = files.filter(
    (f) => f.documentCategory === documentCategory,
  );
  const canAdd = maxFiles == null || sectionFiles.length < maxFiles;

  return (
    <div className="bulk-upload-row rounded border p-2">
      <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
        <div className="fw-semibold small">{title}</div>

        {canAdd ? (
          <FileUploadButton
            ariaLabel={`Προσθήκη ${title}`}
            disabled={disabled || upload.isUploading}
            accept="application/pdf,image/*"
            className="btn btn-sm btn-outline-secondary btn-icon-pill"
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
              <span className="spinner-border spinner-border-sm" aria-hidden />
            ) : (
              <i className="bi bi-plus-lg" />
            )}
          </FileUploadButton>
        ) : null}
      </div>

      {upload.isUploading ? (
        <div className="small text-secondary mb-2">{upload.progress}%</div>
      ) : null}

      {upload.message ? (
        <div className="small text-danger mb-2">{upload.message}</div>
      ) : null}

      <div className="small text-secondary">{emptyHint}</div>

      {sectionFiles.length > 0 ? (
        <div className="d-flex flex-wrap gap-1 mt-2">
          {sectionFiles.map((file) => {
            const name = getOrderFileDisplayName(file);
            return (
              <span
                key={`${file.position}-${name}`}
                className="badge text-bg-light d-inline-flex align-items-center fw-normal gap-1 border"
                title={name}
                style={{ maxWidth: "100%" }}
              >
                <FileTypeIcon
                  name={name}
                  mimeType={file.fileType ?? undefined}
                  className="bi"
                />
                <span className="text-truncate" style={{ maxWidth: 120 }}>
                  {name}
                </span>
              </span>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

type BulkSlotUploadFieldsProps = {
  orderUid: string;
  files: OrderFile[];
  disabled?: boolean;
  onFilesChange: (files: OrderFile[]) => void;
};

export default function BulkSlotUploadFields({
  orderUid,
  files,
  disabled = false,
  onFilesChange,
}: BulkSlotUploadFieldsProps) {
  const recipeFiles = files.filter((f) => f.documentCategory === "recipe");

  function handleFileAdded(file: OrderFile) {
    onFilesChange([...files, file]);
  }

  return (
    <div className="d-flex flex-column gap-2">
      <BulkUploadRow
        title="Αρχείο γνωμάτευσης"
        emptyHint="Πάτα + για να ανεβάσεις γνωμάτευση μέχρι δύο σελίδες. (εμπρός/πίσω)"
        orderUid={orderUid}
        files={files}
        documentCategory="recipe"
        position={recipeFiles.length}
        disabled={disabled}
        onFileAdded={handleFileAdded}
        maxFiles={MAX_RECIPE_FILES}
      />
      <BulkUploadRow
        title="Άλλα αρχεία (δεν αφορούν γνωμάτευση)"
        emptyHint="Πάτα + για να ανεβάσεις επιπλέον αρχεία που δεν αφορούν γνωμάτευση."
        orderUid={orderUid}
        files={files}
        documentCategory="recipe_aux"
        position={files.length}
        disabled={disabled}
        onFileAdded={handleFileAdded}
      />
    </div>
  );
}
