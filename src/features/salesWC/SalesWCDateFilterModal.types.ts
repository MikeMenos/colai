export type SalesWCDateFilterModalProps = {
  show: boolean;
  onHide: () => void;
  dateFrom: string;
  dateTo: string;
  maxSelectableDate: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onApplyCurrentMonth: () => void;
  onApplyPreviousMonth: () => void;
};
