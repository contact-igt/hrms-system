import { ArrowRight, LoaderCircle } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type SubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function SubmitButton({
  children,
  loading,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      className="auth-submit"
      type="submit"
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className="spin" size={18} /> : null}
      <span>{children}</span>
      {!loading && <ArrowRight size={17} />}
    </button>
  );
}
