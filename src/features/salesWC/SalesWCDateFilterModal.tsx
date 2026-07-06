"use client";

import { formatElGRDateShort } from "@/lib/utils/date";
import { Button, Modal } from "react-bootstrap";

type SalesWCDateFilterModalProps = {
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

export default function SalesWCDateFilterModal({
  show,
  onHide,
  dateFrom,
  dateTo,
  maxSelectableDate,
  onDateFromChange,
  onDateToChange,
  onApplyCurrentMonth,
  onApplyPreviousMonth,
}: SalesWCDateFilterModalProps) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="premium-modal"
    >
      <Modal.Header
        closeButton
        style={{ borderBottom: "1px solid var(--bs-border-color-translucent)" }}
      >
        <Modal.Title className="fw-semibold h6 mb-0">
          Φίλτρο ημερομηνίας
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="row g-3">
          <div className="col-6">
            <label
              className="form-label small mb-1"
              htmlFor="sales-wc-date-from"
            >
              Από
            </label>
            <input
              id="sales-wc-date-from"
              type="date"
              className="form-control"
              value={dateFrom}
              max={maxSelectableDate}
              onChange={(e) => onDateFromChange(e.target.value)}
            />
          </div>
          <div className="col-6">
            <label className="form-label small mb-1" htmlFor="sales-wc-date-to">
              Έως
            </label>
            <input
              id="sales-wc-date-to"
              type="date"
              className="form-control"
              value={dateTo}
              min={dateFrom}
              max={maxSelectableDate}
              onChange={(e) => onDateToChange(e.target.value)}
            />
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer
        className="d-flex flex-wrap gap-2"
        style={{ borderTop: "1px solid var(--bs-border-color-translucent)" }}
      >
        <Button
          variant="outline-primary"
          onClick={() => {
            onApplyCurrentMonth();
            onHide();
          }}
          style={{ borderRadius: 12 }}
        >
          Τρέχων μήνας
        </Button>
        <Button
          variant="outline-primary"
          onClick={() => {
            onApplyPreviousMonth();
            onHide();
          }}
          style={{ borderRadius: 12 }}
        >
          Προηγ. μήνας
        </Button>
        <Button
          variant="primary"
          onClick={onHide}
          className="ms-auto"
          style={{ borderRadius: 12 }}
        >
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export function formatSalesWCDateRangeLabel(
  dateFrom: string,
  dateTo: string,
): string {
  const from = formatElGRDateShort(dateFrom, "");
  const to = formatElGRDateShort(dateTo, "");
  if (!from && !to) return "Όλες";
  if (from && to) return `${from} – ${to}`;
  return from || to;
}
