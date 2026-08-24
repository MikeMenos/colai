"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setDraftProperty,
  setDraftSyntagiUploaded,
} from "@/store/orders/ordersSlice";
import { OrderFile } from "@/types/orders";
import RunAiButton from "./RunAIButton";
import { SiGooglegemini } from "react-icons/si";
import Image from "next/image";
import type { GnomateuseisAreaProps } from "./componentProps";
import GnomateuseisUploadSection from "./wizard/GnomateuseisUploadSection";
import { useDualFileUploadState } from "./wizard/useFileUploadState";
import { getAiClientsByPriority, type AiClient } from "@/lib/utils/ai";

const AI_CLIENT_CONFIG: Record<
  AiClient,
  { label: string; icon: React.ReactNode }
> = {
  Claude: {
    label: "Run AI (Claude)",
    icon: <Image src="/claude.svg" alt="Claude" width={18} height={18} />,
  },
  Gemini: {
    label: "Run AI (Gemini)",
    icon: <SiGooglegemini size={18} />,
  },
};

function AiClientSeparator() {
  return (
    <div
      className="d-flex align-items-center text-secondary small gap-2 px-1"
      aria-hidden
    >
      <hr className="m-0 flex-grow-1" />
      <span className="text-uppercase fw-semibold">ή</span>
      <hr className="m-0 flex-grow-1" />
    </div>
  );
}

export default function GnomateuseisArea({
  aiMessage,
  aiStatus,
  aiRunningClient,
  aiDisabledClients = [],
  onRunAiWithClient,
  localFiles,
  onFilesChange,
  orderUid: orderUidProp,
  uploadDisabled = false,
}: GnomateuseisAreaProps) {
  const dispatch = useAppDispatch();
  const isLocalMode = localFiles !== undefined;
  const availableAiClients = useAppSelector((s) => s.auth.availableAiClients);
  const aiClients = React.useMemo(
    () => getAiClientsByPriority(availableAiClients),
    [availableAiClients],
  );

  const draftFiles = useAppSelector((s) => s.orders?.draft?.files) ?? [];
  const draftOrderUid = useAppSelector((s) => s.orders?.draft?.order?.uid);
  const lastPageContainsMaterialsGnomateusi = useAppSelector(
    (s) => s.orders?.draft?.order?.lastPageContainsMaterialsGnomateusi === true,
  );
  const files = isLocalMode ? (localFiles ?? []) : draftFiles;
  const orderUid = orderUidProp ?? draftOrderUid ?? "";

  const { recipe: recipeUpload, aux: auxUpload } = useDualFileUploadState();

  React.useEffect(() => {
    if (!isLocalMode) {
      dispatch(setDraftProperty({ key: "type", value: "eopyy" }));
    }
  }, [dispatch, isLocalMode]);

  const recipeFiles = files.filter((f) => f?.documentCategory === "recipe");
  const recipeFileCount = recipeFiles.length;
  const hasFiles = recipeFileCount > 0;
  const hasTwoRecipeFiles = recipeFileCount >= 2;

  React.useEffect(() => {
    if (
      !isLocalMode &&
      !hasTwoRecipeFiles &&
      lastPageContainsMaterialsGnomateusi
    ) {
      dispatch(
        setDraftProperty({
          key: "lastPageContainsMaterialsGnomateusi",
          value: false,
        }),
      );
    }
  }, [
    dispatch,
    hasTwoRecipeFiles,
    isLocalMode,
    lastPageContainsMaterialsGnomateusi,
  ]);

  function handleFileAdded(file: OrderFile) {
    if (isLocalMode) {
      onFilesChange?.([...files, file]);
      return;
    }

    dispatch(setDraftSyntagiUploaded(file));
  }

  const recipeDisabled =
    uploadDisabled || recipeUpload.isUploading || aiStatus === "running";
  const auxDisabled = uploadDisabled || auxUpload.isUploading;

  const aiStatusPanel = !isLocalMode ? (
    aiStatus === "running" ? (
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
    ) : null
  ) : null;

  return (
    <>
      <GnomateuseisUploadSection
        title="Αρχείο γνωμάτευσης"
        emptyHint="Πάτα + για να ανεβάσεις γνωμάτευση μέχρι δύο σελίδες. (εμπρός/πίσω)"
        orderUid={orderUid}
        files={files}
        documentCategory="recipe"
        position={recipeFileCount}
        disabled={recipeDisabled}
        onFileAdded={handleFileAdded}
        upload={recipeUpload}
        maxFiles={2}
        showFilePreview
        footer={aiStatusPanel}
      />

      {!isLocalMode && hasTwoRecipeFiles ? (
        <div className="app-card-soft mb-2 px-3 py-2">
          <div className="form-check form-switch switch-lg mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              checked={lastPageContainsMaterialsGnomateusi}
              onChange={(e) =>
                dispatch(
                  setDraftProperty({
                    key: "lastPageContainsMaterialsGnomateusi",
                    value: e.target.checked,
                  }),
                )
              }
              id="lastPageContainsMaterialsGnomateusi"
            />
            <label
              className="form-check-label"
              htmlFor="lastPageContainsMaterialsGnomateusi"
            >
              Η τελευταία σελίδα περιέχει υλικά
            </label>
          </div>
        </div>
      ) : null}

      <GnomateuseisUploadSection
        title="Άλλα αρχεία (δεν αφορούν γνωμάτευση)"
        emptyHint="Πάτα + για να ανεβάσεις επιπλέον αρχεία που δεν αφορούν γνωμάτευση."
        orderUid={orderUid}
        files={files}
        documentCategory="recipe_aux"
        position={files.length}
        disabled={auxDisabled}
        onFileAdded={handleFileAdded}
        upload={auxUpload}
      />

      {!isLocalMode && aiStatus !== "done" ? (
        <div className="d-flex flex-column mt-1 gap-1">
          {aiClients.map((client, index) => {
            const config = AI_CLIENT_CONFIG[client];
            if (!config) return null;

            return (
              <React.Fragment key={client}>
                {index > 0 ? <AiClientSeparator /> : null}
                <RunAiButton
                  label={config.label}
                  running={aiStatus === "running" && aiRunningClient === client}
                  failed={aiDisabledClients.includes(client)}
                  disabled={
                    !hasFiles ||
                    aiDisabledClients.includes(client) ||
                    (aiStatus === "running" && aiRunningClient !== client)
                  }
                  onClick={() => onRunAiWithClient(client)}
                  icon={config.icon}
                />
              </React.Fragment>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
