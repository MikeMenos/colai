"use client";

import React from "react";
import Image from "next/image";
import { SiGooglegemini } from "react-icons/si";
import type { AiClient, AiStatus } from "@/lib/utils/ai";
import type { RunAiButtonProps } from "../componentProps";

function CompactRunAiButton({
  label,
  running,
  failed,
  disabled,
  onClick,
  icon,
}: RunAiButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn-sm btn-ai d-inline-flex align-items-center justify-content-center gap-1 flex-fill${failed ? "btn-ai--failed" : ""}`}
      disabled={disabled || running}
      onClick={onClick}
      title={label}
    >
      {running ? (
        <span className="spinner-border spinner-border-sm" aria-hidden />
      ) : failed ? (
        <i className="bi bi-x-circle" />
      ) : (
        icon
      )}
      {label}
    </button>
  );
}

type CompactRunAiButtonsProps = {
  aiStatus: AiStatus;
  aiRunningClient: AiClient | null;
  aiDisabledClients: AiClient[];
  hasFiles: boolean;
  onRunAiWithClient: (client: AiClient) => void;
};

export default function CompactRunAiButtons({
  aiStatus,
  aiRunningClient,
  aiDisabledClients,
  hasFiles,
  onRunAiWithClient,
}: CompactRunAiButtonsProps) {
  if (aiStatus === "done") return null;

  const isRunning = aiStatus === "running";

  return (
    <div className="d-flex gap-1">
      <CompactRunAiButton
        label="Claude"
        running={isRunning && aiRunningClient === "Claude"}
        failed={aiDisabledClients.includes("Claude")}
        disabled={
          !hasFiles || aiDisabledClients.includes("Claude") || isRunning
        }
        onClick={() => onRunAiWithClient("Claude")}
        icon={<Image src="/claude.svg" alt="" width={14} height={14} />}
      />
      <CompactRunAiButton
        label="Gemini"
        running={isRunning && aiRunningClient === "Gemini"}
        failed={aiDisabledClients.includes("Gemini")}
        disabled={
          !hasFiles || aiDisabledClients.includes("Gemini") || isRunning
        }
        onClick={() => onRunAiWithClient("Gemini")}
        icon={<SiGooglegemini size={14} />}
      />
    </div>
  );
}
