"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setDraftProperty,
  setDraftSyntagiUploaded,
  setSynaineseisResults,
} from "@/store/orders/ordersSlice";
import FileUploadButton from "./FileUploadButton";
import { OrderFile } from "@/types/orders";
import {
  getConsentFileCategory,
  getConsentFormScore,
  isConsentScoreHigh,
  isConsentScoreTooLow,
  isConsentScoreWarning,
} from "@/lib/consentUpload";
import { Alert } from "react-bootstrap";
import { formatFileSizeMB } from "@/lib/utils/number";
import type { UploadStatus, UploadingInfo } from "./wizard/types";

const CONSENT_BACK_CATEGORY = "consent_form_back";

function isPdf(name: string, mimeType?: string) {
  return mimeType === "application/pdf" || name.toLowerCase().endsWith(".pdf");
}

export default function SynenaiseisArea() {
  const dispatch = useAppDispatch();

  const files = useAppSelector((s) => s.orders?.draft?.files) ?? [];
  const orderUid = useAppSelector((s) => s.orders?.draft?.order?.uid);
  const isVoiceConsent = useAppSelector(
    (s) => s.orders?.draft?.order?.isVoiceConsent,
  );
  const synaineseisResults = useAppSelector(
    (s) => s.orders?.draft?.synaineseisResults,
  );

  const [status, setStatus] = React.useState<UploadStatus>("idle");
  const [statusBack, setStatusBack] = React.useState<UploadStatus>("idle");
  const [progress, setProgress] = React.useState<number>(0);
  const [progressBack, setProgressBack] = React.useState<number>(0);
  const [message, setMessage] = React.useState<string | null>(null);
  const [messageBack, setMessageBack] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState<UploadingInfo | null>(null);
  const [uploadingBack, setUploadingBack] =
    React.useState<UploadingInfo | null>(null);

  const consentFiles = files.filter(
    (f) => getConsentFileCategory(f) === "consent_form",
  );
  const backFiles = files.filter(
    (f) => getConsentFileCategory(f) === CONSENT_BACK_CATEGORY,
  );
  const hasFiles = consentFiles.length > 0;
  const hasBackFiles = backFiles.length > 0;
  const formScore = getConsentFormScore(synaineseisResults);
  const consentScoreTooLow = isConsentScoreTooLow(synaineseisResults);
  const consentScoreWarning = isConsentScoreWarning(synaineseisResults);
  const consentScoreHigh = isConsentScoreHigh(synaineseisResults);

  const isUploadingNow = status === "uploading";
  const isUploadingBackNow = statusBack === "uploading";
  const showConsentUploads = isVoiceConsent != 1;

  return (
    <>
      <div className="app-card mb-1 p-2">
        <div className="form-check form-switch switch-lg mb-0">
          <input
            className="form-check-input"
            type="checkbox"
            checked={isVoiceConsent == 1}
            onChange={(e) =>
              dispatch(
                setDraftProperty({
                  key: "isVoiceConsent",
                  value: e.target.checked ? 1 : 0,
                }),
              )
            }
            name="isVoiceConsent"
            id="isVoiceConsent"
          />
          <label className="form-check-label" htmlFor="isVoiceConsent">
            Ηχητική συναίνεση
          </label>
        </div>
      </div>

      {showConsentUploads ? (
        <>
      <div className="app-card mb-1 px-3 py-2">
        <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
          <div className="fw-semibold">Αρχείo συναίνεσης</div>

          <div className="d-flex align-items-center gap-2">
            <FileUploadButton
              ariaLabel="Προσθήκη"
              disabled={isUploadingNow}
              accept="application/pdf,image/*"
              dispatchFileToRedux={(d: OrderFile) =>
                dispatch(setDraftSyntagiUploaded(d))
              }
              dispatchResultsToRedux={(d) => dispatch(setSynaineseisResults(d))}
              position={0}
              document_category="consent_form"
              setMessage={(s: string | null) => setMessage(s)}
              setProgress={(i: number) => setProgress(i)}
              orderUid={orderUid}
              setUploading={(s: UploadingInfo | null) => setUploading(s)}
              setStatus={(s: UploadStatus) => setStatus(s)}
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
        </div>

        {uploading ? (
          <div className="mb-3 rounded border p-3">
            <div className="d-flex align-items-start justify-content-between">
              <div className="d-flex gap-2">
                <i
                  className={`bi ${isPdf(uploading.name, uploading.fileType) ? "bi-filetype-pdf" : "bi-image"}`}
                />
                <div>
                  <div className="fw-semibold">{uploading.name}</div>
                  <div className="small text-secondary">
                    {formatFileSizeMB(uploading.fileSize)}
                  </div>
                </div>
              </div>

              <div className="small text-secondary">{progress}%</div>
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

        {hasFiles ? (
          <div className="d-flex flex-column gap-2">
            {consentFiles.map((f: OrderFile) => {
              const name = f.name ?? f.base64filename ?? f.originalFileName;
              const sizeLabel = f.fileSize
                ? String(f.fileSize).includes("MB")
                  ? String(f.fileSize)
                  : formatFileSizeMB(f.fileSize)
                : "";
              const pdf = isPdf(name ?? "", f.fileType ?? undefined);

              return (
                <div
                  key={`consent-${name}`}
                  className="d-flex justify-content-between align-items-center rounded border p-2"
                >
                  <div className="d-flex align-items-start gap-2">
                    <i
                      className={`bi ${pdf ? "bi-filetype-pdf" : "bi-image"}`}
                    />
                    <div>
                      <div className="fw-semibold">{name}</div>
                      <div className="small text-secondary">
                        {sizeLabel ? ` ${sizeLabel}` : ""}
                      </div>
                    </div>
                  </div>

                  <span className="badge text-bg-success">Uploaded</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="small text-secondary">
            Πάτα + για να ανεβάσεις συνάινεση.
          </div>
        )}

        {formScore != null ? (
          <div className="mt-3">
            <div
              className={`rounded border p-3 ${
                consentScoreTooLow
                  ? "border-danger"
                  : consentScoreWarning
                    ? "border-warning bg-warning-subtle"
                    : consentScoreHigh
                      ? "border-success bg-success-subtle"
                      : "border-secondary"
              }`}
            >
              <div className="fs-5 fw-semibold">
                Σκορ: <span className="fw-bold">{formScore}</span>
              </div>
            </div>

            {consentScoreTooLow ? (
              <div className="alert alert-danger small mt-2 mb-0 py-2">
                Το score δεν είναι αρκετά υψηλό. Παρακαλώ ανεβάστε νέο αρχείο.
              </div>
            ) : consentScoreWarning ? (
              <Alert variant="warning" className="small mt-2 mb-0 py-2">
                Το score είναι μεσαίο. Μπορείτε να συνεχίσετε, αλλά συνιστάται
                να ανεβάσετε νέο αρχείο.
              </Alert>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="app-card px-3 py-2">
        <div className="d-flex align-items-center justify-content-between border-bottom mb-2 pb-2">
          <div className="fw-semibold">Πίσω σελίδα</div>

          <div className="d-flex align-items-center gap-2">
            <FileUploadButton
              ariaLabel="Προσθήκη"
              disabled={isUploadingBackNow}
              accept="application/pdf,image/*"
              dispatchFileToRedux={(d: OrderFile) =>
                dispatch(setDraftSyntagiUploaded(d))
              }
              position={files.length}
              setMessage={(s: string | null) => setMessageBack(s)}
              setProgress={(i: number) => setProgressBack(i)}
              orderUid={orderUid}
              setUploading={(s: UploadingInfo | null) => setUploadingBack(s)}
              setStatus={(s: UploadStatus) => setStatusBack(s)}
              endpoint="/api/orders/file"
              document_category={CONSENT_BACK_CATEGORY}
            >
              {isUploadingBackNow ? (
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

        {uploadingBack ? (
          <div className="mb-3 rounded border p-3">
            <div className="d-flex align-items-start justify-content-between">
              <div className="d-flex gap-2">
                <i
                  className={`bi ${isPdf(uploadingBack.name, uploadingBack.fileType) ? "bi-filetype-pdf" : "bi-image"}`}
                />
                <div>
                  <div className="fw-semibold">{uploadingBack.name}</div>
                  <div className="small text-secondary">
                    {formatFileSizeMB(uploadingBack.fileSize)}
                  </div>
                </div>
              </div>

              <div className="small text-secondary">{progressBack}%</div>
            </div>

            <div className="progress mt-2" style={{ height: 10 }}>
              <div
                className={`progress-bar ${statusBack === "error" ? "bg-danger" : "bg-success"}`}
                role="progressbar"
                style={{
                  width: `${statusBack === "error" ? 100 : progressBack}%`,
                }}
                aria-valuenow={statusBack === "error" ? 100 : progressBack}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>

            {messageBack ? (
              <div className="alert alert-danger small mt-3 mb-0 py-2">
                {messageBack}
              </div>
            ) : null}
          </div>
        ) : messageBack ? (
          <div className="alert alert-danger small mb-3 py-2">{messageBack}</div>
        ) : null}

        {hasBackFiles ? (
          <div className="d-flex flex-column gap-2">
            {backFiles.map((f: OrderFile) => {
              const name = f.name ?? f.base64filename ?? f.originalFileName;
              const sizeLabel = f.fileSize
                ? String(f.fileSize).includes("MB")
                  ? String(f.fileSize)
                  : formatFileSizeMB(f.fileSize)
                : "";
              const pdf = isPdf(name ?? "", f.fileType ?? undefined);

              return (
                <div
                  key={`${f.position}-${name}`}
                  className="d-flex justify-content-between align-items-center rounded border p-2"
                >
                  <div className="d-flex align-items-start gap-2">
                    <i
                      className={`bi ${pdf ? "bi-filetype-pdf" : "bi-image"}`}
                    />
                    <div>
                      <div className="fw-semibold">{name}</div>
                      <div className="small text-secondary">
                        {sizeLabel ? ` ${sizeLabel}` : ""}
                      </div>
                    </div>
                  </div>

                  <span className="badge text-bg-success">Uploaded</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="small text-secondary">
            Πάτα + για να ανεβάσεις την πίσω σελίδα της συναίνεσης.
          </div>
        )}
      </div>
        </>
      ) : null}
    </>
  );
}
