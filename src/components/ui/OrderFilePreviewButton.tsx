"use client";

import React from "react";
import type { OrderFile } from "@/types/orders";
import { getFileSuffix, getOrderFileViewUrl } from "@/lib/utils/order";
import OrderFilePreviewModal from "./OrderFilePreviewModal";

type ButtonVariant = "primary" | "outline-primary";
type ButtonSize = "sm" | "md";

export const ORDER_FILE_PREVIEW_BUTTON_STYLE: React.CSSProperties = {
  borderRadius: 10,
  padding: "8px 12px",
  fontWeight: 600,
  fontSize: "0.875rem",
  boxShadow: "0 6px 12px rgba(var(--bs-primary-rgb), .2)",
};

export type OrderFilePreviewButtonProps = {
  file: OrderFile;
  label?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: ButtonVariant;
  size?: ButtonSize;
  showIcon?: boolean;
};

export function OrderFilePreviewButton({
  file,
  label = "Προβολή",
  className,
  style,
  variant = "primary",
  size = "md",
  showIcon = true,
}: OrderFilePreviewButtonProps) {
  const [show, setShow] = React.useState(false);

  if (!getOrderFileViewUrl(file)) return null;

  const defaultClassName =
    size === "sm"
      ? `btn btn-sm btn-${variant} d-inline-flex align-items-center gap-1`
      : `btn btn-${variant}`;

  return (
    <>
      <button
        type="button"
        className={className ?? defaultClassName}
        style={style}
        onClick={() => setShow(true)}
      >
        {showIcon ? (
          <i
            className={`bi bi-eye${size === "sm" ? "" : " me-2"}`}
            aria-hidden
          />
        ) : null}
        {label}
      </button>

      <OrderFilePreviewModal
        show={show}
        file={file}
        onClose={() => setShow(false)}
      />
    </>
  );
}

export type OrderFilePreviewButtonsProps = {
  files: OrderFile[];
  getLabel?: (
    file: OrderFile,
    index: number,
    total: number,
  ) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: ButtonVariant;
  size?: ButtonSize;
  showIcon?: boolean;
};

export function OrderFilePreviewButtons({
  files,
  getLabel,
  className,
  style,
  variant = "primary",
  size = "md",
  showIcon = true,
}: OrderFilePreviewButtonsProps) {
  const previewableFiles = files.filter((file) => getOrderFileViewUrl(file));
  if (!previewableFiles.length) return null;

  return (
    <div className="d-flex flex-wrap gap-2">
      {previewableFiles.map((file, index) => {
        const label =
          getLabel?.(file, index, previewableFiles.length) ??
          (previewableFiles.length > 1 ? `Προβολή ${index + 1}` : "Προβολή");

        return (
          <OrderFilePreviewButton
            key={`preview-${file.id ?? index}-${getFileSuffix(file)}`}
            file={file}
            label={label}
            className={className}
            style={style}
            variant={variant}
            size={size}
            showIcon={showIcon}
          />
        );
      })}
    </div>
  );
}
