import type { OrderFile } from "@/types/orders";
import type { FileUploadState } from "./useFileUploadState";

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
