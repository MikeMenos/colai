export type Props = {
  placeholder?: string;
  value: string;
  onChange: (next: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  autoFocus?: boolean;
  className?: string;
  debounceMs?: number;
  onDebouncedChange?: (next: string) => void;
  debouncedCompareTo?: string;
};
