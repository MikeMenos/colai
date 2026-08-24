"use client";

import React from "react";
import { OrderFilePreviewButtons } from "@/components/ui/OrderFilePreviewButton";
import { getOrderFileViewUrl, isDocumentCategory } from "@/lib/utils/order";
import { useAppSelector } from "@/store/hooks";
import type { OrderFile } from "@/types/orders";

export default function OrderRecipeFilePreviewBar() {
  const files = useAppSelector((s) => s.orders.draft.files ?? []);
  const recipeFiles = React.useMemo(
    () =>
      (files as OrderFile[]).filter(
        (file) =>
          isDocumentCategory(file, "recipe") && getOrderFileViewUrl(file),
      ),
    [files],
  );

  if (!recipeFiles.length) return null;

  return (
    <div className="order-recipe-preview-bar app-card-soft d-flex align-items-center justify-content-between mb-1 gap-2 px-3 py-2">
      <div
        className="small text-secondary text-truncate"
        style={{ minWidth: 0 }}
      >
        <i className="bi bi-file-earmark-medical me-1" aria-hidden />
        Αρχείο γνωμάτευσης
      </div>

      <OrderFilePreviewButtons
        files={recipeFiles}
        size="sm"
        variant="outline-primary"
        style={{ borderRadius: 999, fontWeight: 600 }}
      />
    </div>
  );
}
