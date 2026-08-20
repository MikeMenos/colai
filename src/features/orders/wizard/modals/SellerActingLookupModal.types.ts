export type SellerActingLookupOption = {
  value: string;
  label: string;
  description?: string;
};

export type SellerActingLookupModalProps = {
  show: boolean;
  options: SellerActingLookupOption[];
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
};
