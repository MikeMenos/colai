import React from "react";
import FormErrorsContext from "./FormErrorContect";

function mergeClassName(a?: string, b?: string, p0?: string) {
  return [a, b].filter(Boolean).join(" ");
}

export default function OrderField({
  label,
  children,
  hint,
  warning,
}: {
  label?: React.ReactNode;
  children: React.ReactNode;
  hint?: string;
  warning?: string | null;
}) {
  const { errors, clearError } = React.useContext(FormErrorsContext);

  const childIsEl = React.isValidElement(children);
  const name = childIsEl ? (children.props as any)?.name : undefined;
  const error = name ? errors[name] : undefined;
  const showWarning = !error && Boolean(warning);

  const enhancedChild = childIsEl
    ? React.cloneElement(children as any, {
        className: mergeClassName(
          (children.props as any).className,
          error ? "is-invalid" : "",
          showWarning ? "border-warning" : "",
        ),
        "aria-invalid": !!error,

        onChange: (...args: any[]) => {
          (children.props as any)?.onChange?.(...args);
          if (name && error && clearError) clearError(name);
        },
        onBlur: (...args: any[]) => {
          (children.props as any)?.onBlur?.(...args);
          if (name && error && clearError) clearError(name);
        },
      })
    : children;

  return (
    <div className={label ? "mb-3" : ""}>
      {label && <label className="form-label fw-semibold">{label}</label>}
      {enhancedChild}
      {error && error !== true ? (
        <div className="invalid-feedback d-block">{error}</div>
      ) : showWarning ? (
        <div className="form-text text-warning d-flex align-items-center gap-1">
          <i className="bi bi-exclamation-triangle-fill" aria-hidden />
          <span>{warning}</span>
        </div>
      ) : hint ? (
        <div className="form-text">{hint}</div>
      ) : null}
    </div>
  );
}
