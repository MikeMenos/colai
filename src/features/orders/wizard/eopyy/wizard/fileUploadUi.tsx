import type { CSSProperties } from "react";
import type { OrderFile } from "@/types/orders";
import { formatFileSizeMB } from "@/lib/utils/number";
import type { UploadStatus, UploadingInfo } from "./types";

export const FILE_INFO_WRAP_STYLE: CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  flex: "1 1 0%",
};

export const MAX_RECIPE_FILES = 2;

export function isPdf(name: string, mimeType?: string) {
  return mimeType === "application/pdf" || name.toLowerCase().endsWith(".pdf");
}

export function getOrderFileDisplayName(file: OrderFile): string {
  return (
    file.originalFileName ?? file.name ?? file.base64filename ?? ""
  );
}

export function FileTypeIcon({
  name,
  mimeType,
  className = "bi flex-shrink-0",
}: {
  name: string;
  mimeType?: string;
  className?: string;
}) {
  return (
    <i
      className={`${className} ${isPdf(name, mimeType) ? "bi-filetype-pdf" : "bi-image"}`}
    />
  );
}

export function TruncatedFileName({
  name,
  className = "fw-semibold",
}: {
  name?: string | null;
  className?: string;
}) {
  const displayName = name ?? "";
  if (!displayName) return null;

  return (
    <div
      className={className}
      title={displayName}
      style={{
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        maxWidth: "100%",
      }}
    >
      {displayName}
    </div>
  );
}

export function UploadProgressBlock({
  uploading,
  progress,
  status,
  message,
  formatSize,
}: {
  uploading: UploadingInfo;
  progress: number;
  status: UploadStatus;
  message: string | null;
  formatSize?: (size: number) => string;
}) {
  const sizeLabel = formatSize
    ? formatSize(uploading.fileSize)
    : uploading.fileSize;

  return (
    <div className="mb-3 rounded border p-3">
      <div className="d-flex align-items-start justify-content-between overflow-hidden">
        <div
          className="d-flex me-2 flex-grow-1 gap-2 overflow-hidden"
          style={FILE_INFO_WRAP_STYLE}
        >
          <FileTypeIcon name={uploading.name} mimeType={uploading.fileType} />
          <div style={FILE_INFO_WRAP_STYLE}>
            <TruncatedFileName name={uploading.name} />
            <div className="small text-secondary">{sizeLabel}</div>
          </div>
        </div>

        <div className="small text-secondary flex-shrink-0">{progress}%</div>
      </div>

      <div className="progress mt-2" style={{ height: 10 }}>
        <div
          className={`progress-bar ${status === "error" ? "bg-danger" : "bg-success"}`}
          role="progressbar"
          style={{ width: `${status === "error" ? 100 : progress}%` }}
          aria-valuenow={status === "error" ? 100 : progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {message ? (
        <div className="alert alert-danger small mt-3 mb-0 py-2">{message}</div>
      ) : null}
    </div>
  );
}

export function UploadedFileRow({ file }: { file: OrderFile }) {
  const name = getOrderFileDisplayName(file);
  const sizeLabel =
    file.documentCategory === "recipe_aux"
      ? (() => {
          const sizeMb = (
            parseFloat(file.fileSize ?? "0") /
            1024 /
            1024
          ).toFixed(2);
          return sizeMb ? ` ${sizeMb} MB` : "";
        })()
      : file.fileSize;

  return (
    <div
      className="d-flex justify-content-between align-items-center overflow-hidden rounded border p-2"
      style={{ minWidth: 0 }}
    >
      <div
        className="d-flex align-items-start me-2 gap-2 overflow-hidden"
        style={FILE_INFO_WRAP_STYLE}
      >
        <FileTypeIcon name={name} mimeType={file.fileType ?? undefined} />
        <div style={FILE_INFO_WRAP_STYLE}>
          <TruncatedFileName name={name} />
          <div className="small text-secondary">{sizeLabel}</div>
        </div>
      </div>

      <span className="badge text-bg-success flex-shrink-0">Uploaded</span>
    </div>
  );
}

export function UploadErrorAlert({ message }: { message: string }) {
  return <div className="alert alert-danger small mb-3 py-2">{message}</div>;
}

export function formatUploadingSizeMb(size: number) {
  return formatFileSizeMB(size);
}
