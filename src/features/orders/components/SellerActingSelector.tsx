"use client";

import type { SellerActingSelectorProps } from "./SellerActingSelector.types";
import React from "react";

import SellerLookupField from "@/features/orders/components/SellerLookupField";
import SellerActingLookupModal from "@/features/orders/wizard/modals/SellerActingLookupModal";
import {
  buildSellerLookupOptions,
  getOwnSellerCode,
  getSellerLookupOptionDisplayLabel,
  hasSellerAccessList,
  resolveActingSeller,
} from "@/lib/sellerAccess";
import { setActingSellerCode } from "@/features/auth/authSlice";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

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

  const ownSellerCode = getOwnSellerCode(userInfos);
  const selectedValue = actingSellerCode?.trim() || ownSellerCode || "";
  const defaultSeller = React.useMemo(
    () => resolveActingSeller(userInfos, null),
    [userInfos],
  );
  const options = React.useMemo(
    () => buildSellerLookupOptions(userInfos),
    [userInfos],
  );
  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? null;
  const selectedLabel = selectedOption
    ? getSellerLookupOptionDisplayLabel(selectedOption)
    : "";

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

    const seller = resolveActingSeller(userInfos, actingCode);
    if (!seller?.sellerCode) return;

    dispatch(
      setDraftProperty({
        key: "sellerCode",
        value: seller.sellerCode,
      }),
    );
    dispatch(
      setDraftProperty({
        key: "sellerName",
        value: seller.sellerName?.trim() ?? seller.sellerCode,
      }),
    );
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
        <SellerLookupField
          label="Παραγγελία ως"
          name="actingSellerCode"
          displayValue={selectedOption ? selectedLabel : ""}
          isInvalid={Boolean(errorMessage)}
          canClear={canClear}
          onOpen={() => setShowLookup(true)}
          onClear={() => handleChange("")}
        />
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
