"use client";

import type { OrderSellerScopeToggleProps } from "./OrderSellerScopeToggle.types";
import React from "react";

import SellerLookupField from "@/features/orders/components/SellerLookupField";
import SellerActingLookupModal from "@/features/orders/wizard/modals/SellerActingLookupModal";
import {
  buildSellerLookupOptions,
  getOwnSellerCode,
  getSellerLookupOptionDisplayLabel,
  hasSellerAccessList,
  resolveSellerScopeCode,
} from "@/lib/sellerAccess";
import { useAppSelector } from "@/store/hooks";

export default function OrderSellerScopeToggle({
  value,
  disabled = false,
  onChange,
}: OrderSellerScopeToggleProps) {
  const userInfos = useAppSelector((s) => s.auth.userInfos);
  const [showLookup, setShowLookup] = React.useState(false);
  const options = React.useMemo(
    () => buildSellerLookupOptions(userInfos),
    [userInfos],
  );
  const selectedValue = resolveSellerScopeCode(userInfos, value);
  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? null;
  const selectedLabel = selectedOption
    ? getSellerLookupOptionDisplayLabel(selectedOption)
    : "";
  const defaultSellerCode =
    getOwnSellerCode(userInfos) || options[0]?.value || "";
  const canClear = Boolean(
    selectedValue && defaultSellerCode && selectedValue !== defaultSellerCode,
  );

  if (!hasSellerAccessList(userInfos)) return null;

  return (
    <div className="d-flex align-items-center gap-2">
      <i
        className="bi bi-person-badge text-secondary flex-shrink-0"
        aria-hidden
      />
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <SellerLookupField
          label="Πωλητής"
          name="sellerScopeCode"
          displayValue={selectedOption ? selectedLabel : ""}
          disabled={disabled}
          canClear={canClear}
          showSearchButton={false}
          onOpen={() => setShowLookup(true)}
          onClear={() => onChange(defaultSellerCode)}
        />
      </div>

      <SellerActingLookupModal
        show={showLookup}
        options={options}
        value={selectedValue}
        onSelect={onChange}
        onClose={() => setShowLookup(false)}
      />
    </div>
  );
}
