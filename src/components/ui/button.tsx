import { ComponentPropsWithoutRef } from "react";
import { Loader2 } from "lucide-react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  loading?: boolean;
  variant?: "primary" | "secondary" | "ghost";
};

const variants = {
  primary: "bg-espresso text-cream shadow-lift hover:bg-espresso/92",
  secondary:
    "border border-espresso/12 bg-porcelain text-espresso hover:bg-oat/40",
  ghost: "text-espresso/70 hover:bg-espresso/5",
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
