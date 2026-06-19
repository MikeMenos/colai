import React from "react";
import FormErrorsContext from "./FormErrorContect";

function mergeClassName(a?: string, b?: string) {
    return [a, b].filter(Boolean).join(" ");
}

export default function OrderSwitchField({
    name,
    id,
    label,
    checked,
    onChange,
}: {
    name: string;
    id: string;
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    const { errors, clearError } = React.useContext(FormErrorsContext);
    const error = errors[name];

    return (
        <div className="form-check form-switch mb-2 switch-lg">
            <input
                className={mergeClassName("form-check-input", error ? "is-invalid" : "")}
                type="checkbox"
                name={name}
                id={id}
                checked={!!checked}
                aria-invalid={!!error}
                onChange={(e) => {
                    onChange(e.target.checked);
                    if (error && clearError) clearError(name);
                }}
            />
            <label className="form-check-label" htmlFor={id}>
                {label}
            </label>

            {error && error !== true ? <div className="invalid-feedback d-block">{error}</div> : null}
        </div>
    );
}