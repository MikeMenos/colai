"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setDraftProperty,
  setDraftSyntagiUploaded,
} from "@/store/orders/ordersSlice";
import FileUploadButton from "./FileUploadButton";
import { OrderFile } from "@/types/orders";
import RunAiButton from "./RunAIButton";
import { SiGooglegemini } from "react-icons/si";
import Image from "next/image";
import type { GnomateuseisAreaProps } from "./componentProps";
import { formatFileSizeMB } from "@/lib/utils/number";
import type { UploadStatus, UploadingInfo } from "./wizard/types";

function isPdf(name: string, mimeType?: string) {
  return mimeType === "application/pdf" || name.toLowerCase().endsWith(".pdf");
}

function TruncatedFileName({
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

const fileInfoWrapStyle: React.CSSProperties = {
  minWidth: 0,
  overflow: "hidden",
  flex: "1 1 0%",
};

const MAX_RECIPE_FILES = 2;

export default function GnomateuseisArea({
  aiMessage,
  aiStatus,
  aiRunningClient,
  aiDisabledClients = [],
  onRunAiWithClient,
}: GnomateuseisAreaProps) {
  const dispatch = useAppDispatch();

  const files = useAppSelector((s: any) => s.orders?.draft?.files) ?? [];
  const orderUid = useAppSelector((s: any) => s.orders?.draft?.order?.uid);

  const [status, setStatus] = React.useState<UploadStatus>("idle");
  const [statusExtra, setStatusExtra] = React.useState<UploadStatus>("idle");
  const [progress, setProgress] = React.useState<number>(0);
  const [progressExtra, setProgressExtra] = React.useState<number>(0);

  const [message, setMessage] = React.useState<string | null>(null);
  const [messageExtra, setMessageExtra] = React.useState<string | null>(null);

  const [uploading, setUploading] = React.useState<UploadingInfo | null>(null);
  const [uploadingExtra, setUploadingExtra] =
    React.useState<UploadingInfo | null>(null);

  React.useEffect(() => {
    dispatch(setDraftProperty({ key: "type", value: "eopyy" }));
  }, [dispatch]);

  const isUploadingNow = status === "uploading";
  const isUploadingNowExtra = statusExtra === "uploading";
  const recipeFiles = files.filter(
    (o: any) => o?.documentCategory === "recipe",
  );
  const recipeFileCount = recipeFiles.length;
  const canAddRecipeFile = recipeFileCount < MAX_RECIPE_FILES;
  const hasFiles = recipeFileCount > 0;
  const hasAuxFiles = files.some(
    (o: any) => o?.documentCategory === "recipe_aux",
  );

  return (
    <>
      <div className="app-card overflow-hidden p-3">
        <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
          <div className="fw-semibold">Αρχείο γνωμάτευσης</div>

          {canAddRecipeFile ? (
            <div className="d-flex align-items-center gap-2">
              <FileUploadButton
                ariaLabel="Προσθήκη"
                disabled={isUploadingNow || aiStatus === "running"}
                accept="application/pdf,image/*"
                dispatchFileToRedux={(d: any) =>
                  dispatch(setDraftSyntagiUploaded(d))
                }
                position={recipeFileCount}
                setMessage={(s: any) => setMessage(s)}
                setProgress={(i: number) => setProgress(i)}
                orderUid={orderUid}
                setUploading={(s: any) => setUploading(s)}
                setStatus={(s: any) => setStatus(s)}
                endpoint="/api/orders/file"
              >
                {isUploadingNow ? (
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

        {uploading ? (
          <div className="mb-3 rounded border p-3">
            <div className="d-flex align-items-start justify-content-between overflow-hidden">
              <div
                className="d-flex me-2 flex-grow-1 gap-2 overflow-hidden"
                style={fileInfoWrapStyle}
              >
                <i
                  className={`bi flex-shrink-0 ${isPdf(uploading.name, uploading.fileType) ? "bi-filetype-pdf" : "bi-image"}`}
                />
                <div style={fileInfoWrapStyle}>
                  <TruncatedFileName name={uploading.name} />
                  <div className="small text-secondary">
                    {uploading.fileSize}
                  </div>
                </div>
              </div>

              <div className="small text-secondary flex-shrink-0">
                {progress}%
              </div>
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
              <div className="alert alert-danger small mt-3 mb-0 py-2">
                {message}
              </div>
            ) : null}
          </div>
        ) : message ? (
          <div className="alert alert-danger small mb-3 py-2">{message}</div>
        ) : null}

        {aiStatus === "running" ? (
          <div className="mb-3 rounded border p-3">
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light border"
                style={{ width: 44, height: 44 }}
              >
                <i className="bi bi-robot" style={{ fontSize: "1.2rem" }} />
              </div>
              <div>
                <div className="fw-semibold">
                  Το AI αναλύει τα αρχεία <span className="ai-dots" />
                </div>
                <div className="small text-secondary">Παρακαλώ περιμένετε…</div>
              </div>
            </div>

            <div className="progress mt-3" style={{ height: 10 }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                style={{ width: "100%" }}
              />
            </div>
          </div>
        ) : aiStatus === "error" ? (
          <div className="alert alert-danger small mb-3 py-2">{aiMessage}</div>
        ) : null}

        {hasFiles ? (
          <div className="d-flex flex-column gap-2 overflow-hidden">
            {recipeFiles.map((f: OrderFile) => {
              const name = f.originalFileName ?? f.name ?? f.base64filename;
              const pdf = isPdf(name ?? "", f.fileType ?? undefined);

              return (
                <div
                  key={`${f.position}-${name}`}
                  className="d-flex justify-content-between align-items-center overflow-hidden rounded border p-2"
                  style={{ minWidth: 0 }}
                >
                  <div
                    className="d-flex align-items-start me-2 gap-2 overflow-hidden"
                    style={fileInfoWrapStyle}
                  >
                    <i
                      className={`bi flex-shrink-0 ${pdf ? "bi-filetype-pdf" : "bi-image"}`}
                    />
                    <div style={fileInfoWrapStyle}>
                      <TruncatedFileName name={name} />
                      <div className="small text-secondary">{f.fileSize}</div>
                    </div>
                  </div>

                  <span className="badge text-bg-success flex-shrink-0">
                    Uploaded
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="small text-secondary">
            Πάτα + για να ανεβάσεις γνωμάτευση μέχρι δύο σελίδες.
          </div>
        )}
      </div>
      <div className="app-card overflow-hidden p-4">
        <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
          <div className="fw-semibold">
            Άλλα αρχεία (δεν αφορούν γνωμάτευση)
          </div>

          <div className="d-flex align-items-center gap-2">
            <FileUploadButton
              ariaLabel="Προσθήκη"
              disabled={isUploadingNowExtra}
              accept="application/pdf,image/*"
              dispatchFileToRedux={(d: any) =>
                dispatch(setDraftSyntagiUploaded(d))
              }
              position={files.length}
              setMessage={(s: any) => setMessageExtra(s)}
              setProgress={(i: number) => setProgressExtra(i)}
              orderUid={orderUid}
              setUploading={(s: any) => setUploadingExtra(s)}
              setStatus={(s: any) => setStatusExtra(s)}
              endpoint="/api/orders/file"
              document_category="recipe_aux"
            >
              {isUploadingNowExtra ? (
                <span
                  className="spinner-border spinner-border-sm"
                  aria-hidden
                />
              ) : (
                <i className="bi bi-plus-lg" />
              )}
            </FileUploadButton>
          </div>
        </div>

        {uploadingExtra ? (
          <div className="mb-3 rounded border p-3">
            <div className="d-flex align-items-start justify-content-between overflow-hidden">
              <div
                className="d-flex me-2 flex-grow-1 gap-2 overflow-hidden"
                style={fileInfoWrapStyle}
              >
                <i
                  className={`bi flex-shrink-0 ${isPdf(uploadingExtra.name, uploadingExtra.fileType) ? "bi-filetype-pdf" : "bi-image"}`}
                />
                <div style={fileInfoWrapStyle}>
                  <TruncatedFileName name={uploadingExtra.name} />
                  <div className="small text-secondary">
                    {formatFileSizeMB(uploadingExtra.fileSize)}
                  </div>
                </div>
              </div>

              <div className="small text-secondary flex-shrink-0">
                {progressExtra}%
              </div>
            </div>

            <div className="progress mt-2" style={{ height: 10 }}>
              <div
                className={`progress-bar ${statusExtra === "error" ? "bg-danger" : "bg-success"}`}
                role="progressbar"
                style={{
                  width: `${statusExtra === "error" ? 100 : statusExtra}%`,
                }}
                aria-valuenow={statusExtra === "error" ? 100 : progressExtra}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>

            {messageExtra ? (
              <div className="alert alert-danger small mt-3 mb-0 py-2">
                {messageExtra}
              </div>
            ) : null}
          </div>
        ) : messageExtra ? (
          <div className="alert alert-danger small mb-3 py-2">
            {messageExtra}
          </div>
        ) : null}

        {hasAuxFiles ? (
          <div className="d-flex flex-column gap-2 overflow-hidden">
            {files.map((f: OrderFile) => {
              const name = f.name ?? f.base64filename ?? f.originalFileName;
              const sizeMb = (
                parseFloat(f.fileSize ?? "0") /
                1024 /
                1024
              ).toFixed(2);
              const pdf = isPdf(name ?? "", f.fileType ?? undefined);

              if (f.documentCategory == "recipe_aux") {
                return (
                  <div
                    key={`${f.position}-${name}`}
                    className="d-flex justify-content-between align-items-center overflow-hidden rounded border p-2"
                    style={{ minWidth: 0 }}
                  >
                    <div
                      className="d-flex align-items-start me-2 gap-2 overflow-hidden"
                      style={fileInfoWrapStyle}
                    >
                      <i
                        className={`bi flex-shrink-0 ${pdf ? "bi-filetype-pdf" : "bi-image"}`}
                      />
                      <div style={fileInfoWrapStyle}>
                        <TruncatedFileName name={name} />
                        <div className="small text-secondary">
                          {sizeMb ? ` ${sizeMb} MB` : ""}
                        </div>
                      </div>
                    </div>

                    <span className="badge text-bg-success flex-shrink-0">
                      Uploaded
                    </span>
                  </div>
                );
              } else {
                return null;
              }
            })}
          </div>
        ) : (
          <div className="small text-secondary">
            Πάτα + για να ανεβάσεις επιπλέον αρχεία που δεν αφορούν γνωμάτευση.
          </div>
        )}
      </div>
      {aiStatus !== "done" ? (
        <div className="d-flex flex-column mt-1 gap-1">
          <RunAiButton
            label="Run AI (Claude)"
            running={aiStatus === "running" && aiRunningClient === "Claude"}
            failed={aiDisabledClients.includes("Claude")}
            disabled={
              !hasFiles ||
              aiDisabledClients.includes("Claude") ||
              (aiStatus === "running" && aiRunningClient !== "Claude")
            }
            onClick={() => onRunAiWithClient("Claude")}
            icon={
              <Image src="/claude.svg" alt="Claude" width={18} height={18} />
            }
          />
          <div
            className="d-flex align-items-center text-secondary small gap-2 px-1"
            aria-hidden
          >
            <hr className="m-0 flex-grow-1" />
            <span className="text-uppercase fw-semibold">ή</span>
            <hr className="m-0 flex-grow-1" />
          </div>
          <RunAiButton
            label="Run AI (Gemini)"
            running={aiStatus === "running" && aiRunningClient === "Gemini"}
            failed={aiDisabledClients.includes("Gemini")}
            disabled={
              !hasFiles ||
              aiDisabledClients.includes("Gemini") ||
              (aiStatus === "running" && aiRunningClient !== "Gemini")
            }
            onClick={() => onRunAiWithClient("Gemini")}
            icon={<SiGooglegemini size={18} />}
          />
        </div>
      ) : null}
    </>
  );
}
