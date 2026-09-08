"use client";

import React from "react";

import MapDirectionsChooser from "@/components/ui/MapDirectionsChooser";
import { buildAddressMapQuery } from "@/lib/utils/address";

type AddressMapLinkProps = {
  address: string;
  mapQuery?: string;
  className?: string;
  inline?: boolean;
};

export function AddressMapLink({
  address,
  mapQuery,
  className = "",
  inline = false,
}: AddressMapLinkProps) {
  const [showMapChooser, setShowMapChooser] = React.useState(false);
  const line = address.trim();
  if (!line) return null;

  const query = (mapQuery ?? line).trim();
  const canOpenMap = Boolean(query);

  const mapButtonClassName =
    "btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 flex-shrink-0";
  const mapButtonStyle: React.CSSProperties = {
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1,
  };

  return (
    <>
      <div
        className={
          inline
            ? "d-inline-flex align-items-center flex-wrap gap-2"
            : "d-flex align-items-start justify-content-between gap-2"
        }
      >
        <span className={className}>{line}</span>
        {canOpenMap ? (
          <button
            type="button"
            className={mapButtonClassName}
            style={mapButtonStyle}
            aria-label="Άνοιγμα επιλογών χάρτη"
            onClick={() => setShowMapChooser(true)}
          >
            <i className="bi bi-box-arrow-up-right" aria-hidden />
            Χάρτης
          </button>
        ) : null}
      </div>

      {canOpenMap ? (
        <MapDirectionsChooser
          show={showMapChooser}
          onHide={() => setShowMapChooser(false)}
          query={query}
          location={line}
        />
      ) : null}
    </>
  );
}

type AddressMapFieldsProps = {
  address?: string | null;
  city?: string | null;
  postalCode?: string | null;
  className?: string;
  inline?: boolean;
};

export function AddressMapFields({
  address,
  city,
  postalCode,
  className = "",
  inline = false,
}: AddressMapFieldsProps) {
  const display = [address, city, postalCode]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(", ");

  if (!display) return null;
  const mapQuery = buildAddressMapQuery(address, postalCode, city);

  return (
    <AddressMapLink
      address={display}
      mapQuery={mapQuery}
      className={className}
      inline={inline}
    />
  );
}
