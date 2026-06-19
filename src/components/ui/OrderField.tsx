import React from "react";
import FormErrorsContext from "./FormErrorContect";

function mergeClassName(a?: string, b?: string) {
    return [a, b].filter(Boolean).join(" ");
}

export default function OrderField({ label, children, hint }: { label?: React.ReactNode; children: React.ReactNode; hint?: string }) {
    const { errors, clearError } = React.useContext(FormErrorsContext);

    const childIsEl = React.isValidElement(children);
    const name = childIsEl ? (children.props as any)?.name : undefined;
    const error = name ? errors[name] : undefined;

    const enhancedChild = childIsEl
        ? React.cloneElement(children as any, {
            className: mergeClassName((children.props as any).className, error ? "is-invalid" : ""),
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
            {error && error !== true ? <div className="invalid-feedback d-block">{error}</div> : hint ? <div className="form-text">{hint}</div> : null}
        </div>
    );
}