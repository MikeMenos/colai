import React from "react";

export default function DeferredQuantityInput({
  value,
  onCommit,
}: {
  value: number | null | undefined;
  onCommit: (quantity: number) => void;
}) {
  const [draftValue, setDraftValue] = React.useState(
    value == null ? "" : String(value),
  );

  React.useEffect(() => {
    setDraftValue(value == null ? "" : String(value));
  }, [value]);

  function commit() {
    onCommit(draftValue === "" ? 0 : parseInt(draftValue, 10));
  }

  return (
    <input
      className="form-control text-center"
      inputMode="numeric"
      value={draftValue}
      onChange={(e) => {
        setDraftValue(e.target.value.replace(/[^\d]/g, ""));
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.currentTarget.blur();
        }
      }}
    />
  );
}
