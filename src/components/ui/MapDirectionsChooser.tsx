"use client";

import React from "react";
import { Modal } from "react-bootstrap";

import {
  buildMapDirectionActions,
  type MapDirectionAction,
} from "./MapDirectionsChooser.types";

export type MapDirectionsChooserProps = {
  show: boolean;
  onHide: () => void;
  /** Query string used for map apps (address / city / postal). */
  query: string;
  /** Human-readable location; also used for copy-to-clipboard. */
  location: string;
  title?: string;
};

export default function MapDirectionsChooser({
  show,
  onHide,
  query,
  location,
  title = "Άνοιγμα χάρτη με:",
}: MapDirectionsChooserProps) {
  const links = React.useMemo(
    () => buildMapDirectionActions(query, location),
    [query, location],
  );

  async function handleCopy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Ignore clipboard failures; still close the chooser.
    }
    onHide();
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="border-0 bg-transparent shadow-none"
    >
      <Modal.Body className="p-0">
        <div
          style={{
            position: "relative",
            borderRadius: 24,
            padding: 12,
            background: "rgba(var(--bs-body-bg-rgb))",
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
            boxShadow: "0 18px 50px rgba(0,0,0,.12)",
          }}
        >
          <div className="text-center fw-semibold mb-2">{title}</div>

          <div className="d-flex flex-column gap-2">
            {links.map((link: MapDirectionAction) => {
              if (link.href !== null) {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="d-flex align-items-center justify-content-center gap-2 text-decoration-none"
                    style={{
                      minHeight: 48,
                      borderRadius: 999,
                      background: "rgba(var(--bs-secondary-rgb), .10)",
                      color: "var(--bs-body-color)",
                      fontWeight: 700,
                      fontSize: 15,
                    }}
                    onClick={onHide}
                  >
                    <i className={`bi ${link.icon}`} aria-hidden />
                    {link.label}
                  </a>
                );
              }

              return (
                <button
                  key={link.label}
                  type="button"
                  className="border-0 d-flex align-items-center justify-content-center gap-2"
                  style={{
                    minHeight: 48,
                    borderRadius: 999,
                    background: "rgba(var(--bs-secondary-rgb), .10)",
                    color: "var(--bs-body-color)",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                  onClick={() => void handleCopy(link.copyValue)}
                >
                  <i className={`bi ${link.icon}`} aria-hidden />
                  {link.label}
                </button>
              );
            })}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export { buildMapDirectionActions } from "./MapDirectionsChooser.types";
export type { MapDirectionAction } from "./MapDirectionsChooser.types";
