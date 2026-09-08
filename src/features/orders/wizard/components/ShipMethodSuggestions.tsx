"use client";

import React from "react";
import { suggestShipMethods } from "@/lib/api/suggestShipMethod";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SuggestShipMethodItem } from "@/types/api/schemas";
import {
  applyShipMethodToDraft,
  getEffectiveShipMethodPostalCode,
  getShipMethodSuggestionsPlacement,
  isValidShipMethodPostalCode,
  type ShipMethodSuggestionsPlacement,
} from "../shipMethodUtils";

const SEARCH_DEBOUNCE_MS = 350;

function ShipMethodSuggestionItem({
  item,
  isSelected,
  onSelect,
}: {
  item: SuggestShipMethodItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      className={
        isSelected
          ? "ship-method-suggestions__item ship-method-suggestions__item--selected"
          : "ship-method-suggestions__item"
      }
      onClick={onSelect}
    >
      <div className="ship-method-suggestions__item-row">
        <span className="ship-method-suggestions__item-icon" aria-hidden>
          <i
            className={`bi ${isSelected ? "bi-check-circle-fill" : "bi-truck"}`}
          />
        </span>
        <span className="ship-method-suggestions__item-text">
          <span className="ship-method-suggestions__item-name">
            {item.name}
          </span>
          <span className="ship-method-suggestions__item-hint">
            {isSelected
              ? "Επιλεγμένο ήδη στο πεδίο Αποστολή"
              : "Πατήστε για επιλογή"}
          </span>
        </span>
        <i
          className="bi bi-chevron-right ship-method-suggestions__item-chevron"
          aria-hidden
        />
      </div>
    </button>
  );
}

export default function ShipMethodSuggestions({
  placement,
}: {
  placement: ShipMethodSuggestionsPlacement;
}) {
  const dispatch = useAppDispatch();
  const order = useAppSelector((s) => s.orders.draft.order);
  const listAddressesPersons = useAppSelector(
    (s) => s.orders.draft.list_AddressesPersons,
  );
  const customerTkFromAi = useAppSelector(
    (s) => s.orders.draft.customerTkFromAi,
  );
  const currentShipMethodId = useAppSelector((s) =>
    String(s.orders.draft.order.shipMethodId ?? ""),
  );
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [suggestions, setSuggestions] = React.useState<SuggestShipMethodItem[]>(
    [],
  );
  const requestIdRef = React.useRef(0);

  const activePlacement = getShipMethodSuggestionsPlacement(
    order,
    listAddressesPersons,
    customerTkFromAi,
  );
  const postalCode = getEffectiveShipMethodPostalCode(
    order,
    listAddressesPersons,
  );

  React.useEffect(() => {
    if (activePlacement !== placement) {
      setLoading(false);
      setError(null);
      setSuggestions([]);
      return;
    }

    if (!isValidShipMethodPostalCode(postalCode)) {
      setLoading(false);
      setError(null);
      setSuggestions([]);
      return;
    }

    const requestId = ++requestIdRef.current;
    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      setSuggestions([]);

      void suggestShipMethods(postalCode)
        .then((items) => {
          if (requestId !== requestIdRef.current) return;
          setSuggestions(items);
        })
        .catch((fetchError: unknown) => {
          if (requestId !== requestIdRef.current) return;
          setSuggestions([]);
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Η πρόταση τρόπου αποστολής απέτυχε",
          );
        })
        .finally(() => {
          if (requestId !== requestIdRef.current) return;
          setLoading(false);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [activePlacement, placement, postalCode]);

  if (activePlacement !== placement || !isValidShipMethodPostalCode(postalCode)) {
    return null;
  }

  const handleSelect = (item: SuggestShipMethodItem) => {
    applyShipMethodToDraft(dispatch, item.id, item.name);
  };

  return (
    <div className="ship-method-suggestions">
      <div className="ship-method-suggestions__header">
        <div className="ship-method-suggestions__title">
          Προτεινόμενοι τρόποι αποστολής
        </div>
        <p className="ship-method-suggestions__hint">
          Επιλέξτε έναν τρόπο αποστολής για να ενημερωθεί το πεδίο Αποστολή.
        </p>
      </div>

      {loading ? (
        <div className="ship-method-suggestions__status d-flex align-items-center gap-2">
          <span className="spinner-border spinner-border-sm" aria-hidden />
          Αναζήτηση…
        </div>
      ) : null}

      {error ? (
        <div className="ship-method-suggestions__status text-danger">
          {error}
        </div>
      ) : null}

      {!loading && !error && suggestions.length === 0 ? (
        <div className="ship-method-suggestions__status">
          Δεν βρέθηκαν προτάσεις για αυτόν τον ΤΚ.
        </div>
      ) : null}

      {!loading && suggestions.length > 0 ? (
        <div
          className="ship-method-suggestions__body"
          role="listbox"
          aria-label="Προτεινόμενοι τρόποι αποστολής"
        >
          {suggestions.map((item) => {
            const id = String(item.id);
            const isSelected = currentShipMethodId === id;

            return (
              <ShipMethodSuggestionItem
                key={id}
                item={item}
                isSelected={isSelected}
                onSelect={() => handleSelect(item)}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
