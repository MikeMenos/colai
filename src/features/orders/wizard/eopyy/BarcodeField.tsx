"use client";

import React from "react";
import { Modal } from "react-bootstrap";
import FormErrorsContext from "@/components/ui/FormErrorContect";
import {
  isNativeBarcodeScannerAvailable,
  scanBarcodeNative,
} from "@/lib/barcode/nativeScanner";
import { normalizeScannedBarcode } from "@/lib/utils/barcode";
import type { BarcodeFieldProps } from "./componentProps";

function mergeClassName(a?: string, b?: string) {
  return [a, b].filter(Boolean).join(" ");
}

export default function BarcodeField({
  label,
  value,
  onChange,
  name,
  hint,
  placeholder,
  inputMode = "numeric",
  disabled,
  autoFocus,

  scanButtonAriaLabel = "Scan barcode",
  modalTitle = "Σάρωση Barcode",
}: BarcodeFieldProps) {
  const { errors, clearError } = React.useContext(FormErrorsContext);
  const fieldError = name ? errors[name] : undefined;

  const useNativeScanner = React.useMemo(
    () => isNativeBarcodeScannerAvailable(),
    [],
  );

  const [showWebScanner, setShowWebScanner] = React.useState(false);
  const [starting, setStarting] = React.useState(false);
  const [nativeScanning, setNativeScanning] = React.useState(false);
  const [scanError, setScanError] = React.useState<string | null>(null);

  const html5QrRef = React.useRef<any>(null);

  const rid = React.useId();
  const readerId = React.useMemo(
    () => `barcode-reader-${rid.replace(/[:]/g, "")}`,
    [rid],
  );

  const stopScanner = React.useCallback(async () => {
    try {
      const inst = html5QrRef.current;
      if (!inst) return;

      await inst.stop();
      if (typeof inst.clear === "function") {
        await inst.clear();
      }
    } catch {
      // ignore teardown issues
    } finally {
      html5QrRef.current = null;
    }
  }, []);

  const closeWebScanner = React.useCallback(async () => {
    setShowWebScanner(false);
    setStarting(false);
    setScanError(null);
    await stopScanner();
  }, [stopScanner]);

  const applyScannedValue = React.useCallback(
    (raw: string) => {
      const normalized = normalizeScannedBarcode(raw);
      if (!normalized) return;
      onChange(normalized);
      if (name && clearError) clearError(name);
    },
    [clearError, name, onChange],
  );

  const handleNativeScan = React.useCallback(async () => {
    setNativeScanning(true);
    setScanError(null);

    try {
      const scanned = await scanBarcodeNative();
      if (scanned) applyScannedValue(scanned);
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : "Δεν ήταν δυνατή η σάρωση του barcode.";
      setScanError(message);
    } finally {
      setNativeScanning(false);
    }
  }, [applyScannedValue]);

  const handleScanClick = React.useCallback(() => {
    if (disabled || nativeScanning) return;
    if (useNativeScanner) {
      void handleNativeScan();
      return;
    }
    setShowWebScanner(true);
  }, [disabled, handleNativeScan, nativeScanning, useNativeScanner]);

  React.useEffect(() => {
    if (!showWebScanner || useNativeScanner) return;

    let cancelled = false;

    (async () => {
      setStarting(true);
      setScanError(null);

      try {
        const mod = await import("html5-qrcode");
        if (cancelled) return;

        const Html5Qrcode = mod.Html5Qrcode;
        const inst = new Html5Qrcode(readerId);
        html5QrRef.current = inst;

        await inst.start(
          { facingMode: "environment" },
          {
            fps: 12,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.777,
          },
          (decodedText: string) => {
            applyScannedValue(decodedText);
            void closeWebScanner();
          },
          () => {
            // Ignore per-frame errors
          },
        );
      } catch (e: unknown) {
        if (!cancelled) {
          const message =
            e instanceof Error
              ? e.message
              : "Δεν ήταν δυνατή η πρόσβαση στην κάμερα.";
          setScanError(message);
          await stopScanner();
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();

    return () => {
      cancelled = true;
      void stopScanner();
    };
  }, [
    applyScannedValue,
    closeWebScanner,
    readerId,
    showWebScanner,
    stopScanner,
    useNativeScanner,
  ]);

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>

      <div className="input-group">
        <input
          className={mergeClassName(
            "form-control",
            fieldError ? "is-invalid" : "",
          )}
          name={name}
          value={value}
          placeholder={placeholder}
          inputMode={inputMode}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={!!fieldError}
          onChange={(e) => {
            onChange(e.target.value);
            if (name && fieldError && clearError) clearError(name);
          }}
          onBlur={() => {
            if (name && fieldError && clearError) clearError(name);
          }}
        />

        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={handleScanClick}
          disabled={disabled || nativeScanning}
          aria-label={scanButtonAriaLabel}
          title={scanButtonAriaLabel}
        >
          {nativeScanning ? (
            <span
              className="spinner-border spinner-border-sm"
              aria-hidden
            />
          ) : (
            <i className="bi bi-upc-scan" />
          )}
        </button>
      </div>

      {fieldError && fieldError !== true ? (
        <div className="invalid-feedback d-block">{fieldError}</div>
      ) : scanError ? (
        <div className="invalid-feedback d-block">{scanError}</div>
      ) : hint ? (
        <div className="form-text">{hint}</div>
      ) : null}

      {!useNativeScanner ? (
        <Modal
          show={showWebScanner}
          onHide={closeWebScanner}
          centered
          contentClassName="premium-modal"
        >
          <Modal.Header closeButton>
            <Modal.Title className="h6 mb-0">{modalTitle}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <div className="app-card px-3 py-2">
              <div className="small text-secondary mb-2">
                Στρέψε την κάμερα στο barcode. Κράτα το σταθερό για καλύτερη
                ανάγνωση.
              </div>

              <div
                id={readerId}
                className="overflow-hidden rounded border"
                style={{
                  width: "100%",
                  minHeight: 220,
                }}
              />

              {starting ? (
                <div className="d-flex align-items-center text-secondary small mt-3 gap-2">
                  <span
                    className="spinner-border spinner-border-sm"
                    aria-hidden
                  />
                  Εκκίνηση κάμερας…
                </div>
              ) : null}

              {scanError ? (
                <div className="alert alert-danger small mt-3 mb-0 py-2">
                  {scanError}
                </div>
              ) : null}
            </div>
          </Modal.Body>
        </Modal>
      ) : null}
    </div>
  );
}
