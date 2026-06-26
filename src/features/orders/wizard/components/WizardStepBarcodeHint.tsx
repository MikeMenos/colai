export default function WizardStepBarcodeHint({
  barcode,
}: {
  barcode?: string | null;
}) {
  const value = String(barcode ?? "").trim();
  if (!value) return null;

  return (
    <div
      className="d-inline-flex align-items-center gap-2 rounded-3 px-2 py-1"
      style={{
        background: "rgba(var(--bs-primary-rgb), 0.08)",
        border: "1px solid rgba(var(--bs-primary-rgb), 0.18)",
      }}
    >
      <span className="small text-secondary">Barcode</span>
      <span className="fw-semibold">{value}</span>
    </div>
  );
}
