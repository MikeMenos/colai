import {
  getCustomerOrderRecencyBadge,
  isCompletelyNewCustomer,
  isCustomerProsEbs,
  isCustomerSelectedFromList,
} from "@/lib/customerUtils";
import { useAppSelector } from "@/store/hooks";

function ExistingCustomerBadges({
  lastOrderInfoDateIn,
}: {
  lastOrderInfoDateIn?: string;
}) {
  const recency = getCustomerOrderRecencyBadge(lastOrderInfoDateIn);

  return (
    <>
      <span className="badge text-bg-success">Υφιστάμενος</span>
      {recency ? (
        <span
          className={`badge ${recency === "Νέο" ? "text-bg-warning text-dark" : "text-bg-info"}`}
        >
          {recency}
        </span>
      ) : null}
    </>
  );
}

export function CustomerStatusBadges({ className }: { className?: string }) {
  const data = useAppSelector((s) => s.orders.draft.order);
  const draftMeta = useAppSelector((s) => ({
    customerProsEbs: s.orders.draft.customerProsEbs,
    customerSelectedFromList: s.orders.draft.customerSelectedFromList,
    customerIsCompletelyNew: s.orders.draft.customerIsCompletelyNew,
    lastOrderInfoDateIn: s.orders.draft.lastOrderInfoDateIn,
  }));
  const isProsEbs = isCustomerProsEbs(draftMeta);
  const selectedFromList = isCustomerSelectedFromList(draftMeta);
  const completelyNew = isCompletelyNewCustomer(draftMeta);
  const isExistingCustomer = !!String(data.customer_ErpGID ?? "").trim();

  let badges: React.ReactNode = null;
  if (
    selectedFromList ||
    (!isProsEbs && !completelyNew && isExistingCustomer)
  ) {
    badges = (
      <ExistingCustomerBadges
        lastOrderInfoDateIn={draftMeta.lastOrderInfoDateIn}
      />
    );
  } else if (isProsEbs) {
    badges = <span className="badge text-bg-success">Νέος/Προς EBS</span>;
  } else if (completelyNew || !isExistingCustomer) {
    badges = <span className="badge text-bg-danger">Νέος</span>;
  }

  if (!badges) return null;

  return (
    <span
      className={["d-inline-flex align-items-center flex-wrap gap-2", className]
        .filter(Boolean)
        .join(" ")}
    >
      {badges}
    </span>
  );
}

export function CustomerNameLabel() {
  return (
    <span className="d-inline-flex align-items-center flex-wrap gap-2">
      Ονοματεπώνυμο
      <CustomerStatusBadges className="d-none d-md-inline-flex" />
    </span>
  );
}
