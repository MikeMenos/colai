"use client";

import type { SellerActingSelectorProps } from "./SellerActingSelector.types";
import React from "react";

import SellerActingLookupModal from "@/features/orders/wizard/modals/SellerActingLookupModal";
import type { SellerActingLookupOption } from "@/features/orders/wizard/modals/SellerActingLookupModal.types";
import {
  getAccessibleSellers,
  getOwnSellerCode,
  hasSellerAccessList,
  resolveActingSeller,
} from "@/lib/sellerAccess";
import { setActingSellerCode } from "@/features/auth/authSlice";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

function getOptionDisplayLabel(option: SellerActingLookupOption): string {
  const name = option.label.trim() || option.value;
  const code = option.description?.trim();
  return code && code !== name ? `${name} (${code})` : name;
}

export default function SellerActingSelector({
  className = "",
  error = null,
  clearError,
}: SellerActingSelectorProps) {
  const dispatch = useAppDispatch();
  const userInfos = useAppSelector((s) => s.auth.userInfos);
  const actingSellerCode = useAppSelector((s) => s.auth.actingSellerCode);
  const draftSellerCode = useAppSelector(
    (s) => s.orders.draft.order.sellerCode,
  );
  const [showLookup, setShowLookup] = React.useState(false);

  const accessSellers = getAccessibleSellers(userInfos);
  const ownSellerCode = getOwnSellerCode(userInfos);
  const selectedValue = actingSellerCode?.trim() || ownSellerCode || "";
  const defaultSeller = React.useMemo(
    () => resolveActingSeller(userInfos, null),
    [userInfos],
  );

  const options = React.useMemo<SellerActingLookupOption[]>(() => {
    const items: SellerActingLookupOption[] = [];

    if (defaultSeller?.sellerCode) {
      const ownLabel =
        defaultSeller.sellerName?.trim() || defaultSeller.sellerCode;
      items.push({
        value: defaultSeller.sellerCode,
        label: `${ownLabel} (Εγώ)`,
      });
    }

    for (const seller of accessSellers) {
      const code = seller.sellerCode?.trim() ?? "";
      if (!code || items.some((item) => item.value === code)) continue;
      items.push({
        value: code,
        label: seller.sellerName?.trim() || code,
        description: code || undefined,
      });
    }

    return items;
  }, [accessSellers, defaultSeller]);

  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? null;
  const selectedLabel = selectedOption
    ? getOptionDisplayLabel(selectedOption)
    : "Επιλέξτε πωλητή…";

  React.useEffect(() => {
    if (!defaultSeller?.sellerCode) return;
    if (actingSellerCode?.trim()) return;
    if (draftSellerCode?.trim()) return;

    dispatch(
      setDraftProperty({
        key: "sellerCode",
        value: defaultSeller.sellerCode,
      }),
    );
    dispatch(
      setDraftProperty({
        key: "sellerName",
        value: defaultSeller.sellerName?.trim() ?? defaultSeller.sellerCode,
      }),
    );
  }, [actingSellerCode, defaultSeller, dispatch, draftSellerCode]);

  const handleChange = (value: string) => {
    const code = value.trim() || null;
    const actingCode = code && code !== ownSellerCode ? code : null;
    dispatch(setActingSellerCode(actingCode));
    clearError?.("actingSellerCode");

    if (actingCode) {
      const seller = accessSellers.find(
        (item) => item.sellerCode?.trim() === actingCode,
      );
      if (seller?.sellerCode?.trim()) {
        dispatch(
          setDraftProperty({
            key: "sellerCode",
            value: seller.sellerCode.trim(),
          }),
        );
        if (seller.sellerName?.trim()) {
          dispatch(
            setDraftProperty({
              key: "sellerName",
              value: seller.sellerName.trim(),
            }),
          );
        }
      }
      return;
    }

    if (defaultSeller?.sellerCode) {
      dispatch(
        setDraftProperty({
          key: "sellerCode",
          value: defaultSeller.sellerCode,
        }),
      );
      dispatch(
        setDraftProperty({
          key: "sellerName",
          value: defaultSeller.sellerName?.trim() ?? defaultSeller.sellerCode,
        }),
      );
    }
  };

  if (!hasSellerAccessList(userInfos)) return null;

  const errorMessage =
    typeof error === "string" ? error : error ? "Επιλέξτε πωλητή" : null;
  const canClear = Boolean(actingSellerCode?.trim());

  return (
    <div
      className={`app-card-soft d-flex align-items-center mb-1 gap-2 px-3 py-2 ${className}`.trim()}
    >
      <i
        className="bi bi-person-badge text-secondary flex-shrink-0"
        aria-hidden
      />
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <div className="text-secondary mb-1" style={{ fontSize: 11 }}>
          Παραγγελία ως
        </div>
        <div className="input-group input-group-sm">
          <input
            type="text"
            readOnly
            name="actingSellerCode"
            className={`form-control${errorMessage ? " is-invalid" : ""}`}
            value={selectedOption ? selectedLabel : ""}
            placeholder="Επιλέξτε πωλητή…"
            onClick={() => setShowLookup(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setShowLookup(true);
              }
            }}
            aria-label="Επιλογή πωλητή"
            style={{ cursor: "pointer" }}
          />
          {canClear ? (
            <button
              type="button"
              className="btn btn-outline-secondary"
              aria-label="Επιστροφή στον προεπιλεγμένο πωλητή"
              onClick={() => handleChange("")}
            >
              <i className="bi bi-x-lg" aria-hidden />
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowLookup(true)}
            aria-label="Αναζήτηση πωλητή"
          >
            <i className="bi bi-search" />
          </button>
        </div>
        {errorMessage ? (
          <div className="invalid-feedback d-block">{errorMessage}</div>
        ) : null}
      </div>

      <SellerActingLookupModal
        show={showLookup}
        options={options}
        value={selectedValue}
        onSelect={handleChange}
        onClose={() => setShowLookup(false)}
      />
    </div>
  );
}
