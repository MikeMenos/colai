import React from "react";
import type { UploadStatus, UploadingInfo } from "./types";

export type FileUploadState = {
  status: UploadStatus;
  setStatus: (status: UploadStatus) => void;
  progress: number;
  setProgress: (progress: number) => void;
  message: string | null;
  setMessage: (message: string | null) => void;
  uploading: UploadingInfo | null;
  setUploading: (info: UploadingInfo | null) => void;
  isUploading: boolean;
};

export function useFileUploadState(): FileUploadState {
  const [status, setStatus] = React.useState<UploadStatus>("idle");
  const [progress, setProgress] = React.useState(0);
  const [message, setMessage] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState<UploadingInfo | null>(null);

  return {
    status,
    setStatus,
    progress,
    setProgress,
    message,
    setMessage,
    uploading,
    setUploading,
    isUploading: status === "uploading",
  };
}

export function useDualFileUploadState() {
  const recipe = useFileUploadState();
  const aux = useFileUploadState();
  return { recipe, aux };
}
