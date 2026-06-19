import { setDraftProperty } from "@/store/orders/ordersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function PlatformCard({
  title,
  description,
  type,
  icon,
  onClick
}: {
  title: string;
  type: string;
  description: string;
  icon: string;
  onClick: (value: string) => void;
}) {
  const selectedType = useAppSelector((state) => state.orders.draft.order?.type);
  const editState = useAppSelector((state) => state.orders.draft.editState);
  const dispatch = useAppDispatch();
  const isSelected = selectedType === type;

  const handleClick = () => {
    if (!editState.loading) {

      dispatch(setDraftProperty({ key: "type", value: type }))
      onClick(type)
    }
  }

  return (
    <div onClick={() => handleClick()} className={`app-card app-card-pressable p-4 mb-3 ${isSelected ? "border-primary" : ""}`}>
      <div className="d-flex align-items-start gap-3">
        <div
          className="rounded-4 d-flex align-items-center justify-content-center"
          style={{ width: 48, height: 48, background: "rgba(99, 102, 241, 0.12)" }}
        >
          <i className={`bi ${icon}`} style={{ fontSize: "1.25rem" }} />
        </div>

        <div className="flex-grow-1">
          <div className="fw-semibold text-body">{title}</div>
          <div className="text-secondary small mt-1">{description}</div>
        </div>

      </div>
    </div>
  );
}
