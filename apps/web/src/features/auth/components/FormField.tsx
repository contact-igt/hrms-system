import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  registration: UseFormRegisterReturn;
  error?: FieldError;
  hint?: string;
};

export function FormField({
  label,
  registration,
  error,
  hint,
  type = "text",
  ...inputProps
}: FormFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="form-field">
      <span>{label}</span>
      <div className={`field-control ${error ? "has-error" : ""}`}>
        <input
          {...inputProps}
          {...registration}
          type={isPassword && passwordVisible ? "text" : type}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setPasswordVisible((value) => !value)}
            aria-label={passwordVisible ? "Hide password" : "Show password"}
          >
            {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error ? (
        <small className="field-error">{error.message}</small>
      ) : hint ? (
        <small className="field-hint">{hint}</small>
      ) : null}
    </label>
  );
}
