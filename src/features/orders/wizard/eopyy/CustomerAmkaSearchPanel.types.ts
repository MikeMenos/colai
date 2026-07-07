import type { CustomerSearchResult } from "@/types/api/responses";

export type UseCustomerAmkaSearchResult = {
  loading: boolean;
  applying: boolean;
  error: string | null;
  results: CustomerSearchResult[];
  lastCustomerWebOrder: Record<string, unknown> | null;
  hasSearched: boolean;
  amkaIsValid: boolean;
  handleSelectCustomer: (c: CustomerSearchResult) => Promise<void>;
  handleSelectLastWebOrder: (lwo: Record<string, unknown>) => Promise<void>;
  handleContinueAsNew: () => void;
};

export type CustomerAmkaSearchPanelProps = {
  amka: string;
  completeGate?: boolean;
  onResolved?: () => void;
  onDismiss?: () => void;
  open?: boolean;
  anchorRef?: React.RefObject<HTMLElement | null>;
  resetWizardOnDifferentAmka?: boolean;
  baselineCustomerAmkaRef?: React.RefObject<string | null>;
};
