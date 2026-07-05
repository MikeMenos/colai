"use client";

import React from "react";

import SearchableSelect, {
  type SearchableSelectOption,
} from "@/components/ui/SearchableSelect";
import {
  getAccessibleSellers,
  getOwnSellerCode,
  hasSellerAccessList,
  resolveActingSeller,
} from "@/lib/sellerAccess";
import { setActingSellerCode } from "@/features/auth/authSlice";
import { setDraftProperty } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type SellerActingSelectorProps = {
  className?: string;
  error?: string | boolean | null;
  clearError?: (field: string) => void;
};

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

  const accessSellers = getAccessibleSellers(userInfos);
  const ownSellerCode = getOwnSellerCode(userInfos);
  const selectedValue = actingSellerCode?.trim() || ownSellerCode || "";
  const defaultSeller = React.useMemo(
    () => resolveActingSeller(userInfos, null),
    [userInfos],
  );

  const options = React.useMemo<SearchableSelectOption[]>(() => {
    const items: SearchableSelectOption[] = [];

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

  return (
    <div
      className={`app-card-soft searchable-select-shell d-flex align-items-center mb-1 gap-2 px-3 py-2 ${className}`.trim()}
    >
      <i
        className="bi bi-person-badge text-secondary flex-shrink-0"
        aria-hidden
      />
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <div className="text-secondary mb-1" style={{ fontSize: 11 }}>
          Παραγγελία ως
        </div>
        <SearchableSelect
          size="sm"
          name="actingSellerCode"
          options={options}
          value={selectedValue}
          onChange={handleChange}
          ariaLabel="Επιλογή πωλητή"
          placeholder="Επιλέξτε πωλητή…"
          searchPlaceholder="Αναζήτηση πωλητή…"
          allowClear
          isInvalid={Boolean(errorMessage)}
        />
        {errorMessage ? (
          <div className="invalid-feedback d-block">{errorMessage}</div>
        ) : null}
      </div>
    </div>
  );
}
