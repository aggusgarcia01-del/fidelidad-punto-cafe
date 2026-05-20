import { ComponentPropsWithoutRef } from "react";
import { Loader2 } from "lucide-react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary: "bg-inverse-on-surface text-primary-container shadow-[0_4px_20px_rgba(255,255,255,0.05)] hover:shadow-[0_4px_25px_rgba(214,196,171,0.2)] hover:bg-secondary-fixed-dim hover:text-on-secondary-fixed hover:-translate-y-0.5",
  secondary:
    "border border-surface-variant/30 bg-transparent text-surface-variant hover:border-secondary-fixed-dim hover:text-secondary-fixed-dim hover:-translate-y-0.5",
  ghost: "text-surface-variant/60 hover:bg-surface-variant/10 hover:text-surface-variant",
};

export function Button({
  children,
  className = "",
  loading,
  variant = "primary",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
