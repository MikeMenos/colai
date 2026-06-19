"use client";

import React from "react";
import { Modal } from "react-bootstrap";
import FormErrorsContext from "@/components/ui/FormErrorContect";
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

  const [show, setShow] = React.useState(false);
  const [starting, setStarting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const html5QrRef = React.useRef<any>(null);

  // Stable id (no hydration issues)
  const rid = React.useId();
  const readerId = React.useMemo(
    () => `barcode-reader-${rid.replace(/[:]/g, "")}`,
    [rid],
  );

  const stopScanner = React.useCallback(async () => {
    try {
      const inst = html5QrRef.current;
      if (!inst) return;

      // stop() is required to release camera
      await inst.stop();
      // Some versions expose clear(). If not, ignore.
      if (typeof inst.clear === "function") {
        await inst.clear();
      }
    } catch {
      // ignore teardown issues
    } finally {
      html5QrRef.current = null;
    }
  }, []);

  const close = React.useCallback(async () => {
    setShow(false);
    setStarting(false);
    setError(null);
    await stopScanner();
  }, [stopScanner]);

  React.useEffect(() => {
    if (!show) return;

    let cancelled = false;

    (async () => {
      setStarting(true);
      setError(null);

      try {
        const mod = await import("html5-qrcode");
        if (cancelled) return;

        const Html5Qrcode = mod.Html5Qrcode;

        const inst = new Html5Qrcode(readerId);
        html5QrRef.current = inst;

        // Prefer back camera; must be called from user gesture (button) + HTTPS.
        await inst.start(
          { facingMode: "environment" },
          {
            fps: 12,
            // Wider box tends to work better for 1D barcodes
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.777,
          },
          (decodedText: string) => {
            // Success
            onChange(decodedText);
            void close();
          },
          () => {
            // Ignore per-frame errors
          },
        );
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Δεν ήταν δυνατή η πρόσβαση στην κάμερα.");
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
  }, [show, readerId, onChange, close, stopScanner]);

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
          onClick={() => setShow(true)}
          disabled={disabled}
          aria-label={scanButtonAriaLabel}
          title={scanButtonAriaLabel}
        >
          <i className="bi bi-upc-scan" />
        </button>
      </div>

      {fieldError && fieldError !== true ? (
        <div className="invalid-feedback d-block">{fieldError}</div>
      ) : hint ? (
        <div className="form-text">{hint}</div>
      ) : null}

      <Modal
        show={show}
        onHide={close}
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
                // Let the library decide height from video feed; keep a sensible minimum.
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

            {error ? (
              <div className="alert alert-danger small mt-3 mb-0 py-2">
                {error}
              </div>
            ) : null}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
