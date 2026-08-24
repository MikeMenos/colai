export type SellerLookupFieldProps = {
  label: string;
  name: string;
  displayValue: string;
  placeholder?: string;
  disabled?: boolean;
  isInvalid?: boolean;
  canClear?: boolean;
  onOpen: () => void;
  onClear?: () => void;
  showSearchButton?: boolean;
  openAriaLabel?: string;
  clearAriaLabel?: string;
};
