import { setDraftProperty } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function PlatformCard({
  title,
  description,
  type,
  icon,
  onClick,
  disabled = false,
  badge,
}: {
  title: string;
  type: string;
  description: string;
  icon: string;
  onClick: (value: string) => void;
  disabled?: boolean;
  badge?: string;
}) {
  const selectedType = useAppSelector((state) => state.orders.draft.order?.type);
  const editState = useAppSelector((state) => state.orders.draft.editState);
  const dispatch = useAppDispatch();
  const isSelected = selectedType === type;

  const handleClick = () => {
    if (editState.loading || disabled) return;

    dispatch(setDraftProperty({ key: "type", value: type }))
    onClick(type)
  }

  return (
    <div
      onClick={() => handleClick()}
      className={`app-card p-4 mb-3 ${disabled ? "" : "app-card-pressable"} ${isSelected ? "border-primary" : ""}`}
      style={{
        opacity: disabled ? 0.7 : undefined,
        cursor: disabled ? "not-allowed" : undefined,
      }}
      aria-disabled={disabled}
    >
      <div className="d-flex align-items-start gap-3">
        <div
          className="rounded-4 d-flex align-items-center justify-content-center"
          style={{ width: 48, height: 48, background: "rgba(99, 102, 241, 0.12)" }}
        >
          <i className={`bi ${icon}`} style={{ fontSize: "1.25rem" }} />
        </div>

        <div className="flex-grow-1">
          <div className="d-flex align-items-center flex-wrap gap-2">
            <div className="fw-semibold text-body">{title}</div>
            {badge ? (
              <span className="badge text-bg-secondary">{badge}</span>
            ) : null}
          </div>
          <div className="text-secondary small mt-1">{description}</div>
        </div>

      </div>
    </div>
  );
}
