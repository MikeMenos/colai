export type SearchableSelectOption = {
  value: string;
  label: string;
  description?: string;
  searchText?: string;
};

export type SearchableSelectProps = {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  size?: "sm" | "lg";
  className?: string;
  name?: string;
  isInvalid?: boolean;
  allowClear?: boolean;
  emptyLabel?: string;
};
