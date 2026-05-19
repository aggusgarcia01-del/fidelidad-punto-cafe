import { ComponentPropsWithoutRef } from "react";

type InputProps = ComponentPropsWithoutRef<"input"> & {
  label: string;
};

export function Input({ label, className = "", ...props }: InputProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-espresso/68">{label}</span>
      <input
        className={`h-12 w-full rounded-lg border border-espresso/12 bg-porcelain px-4 text-base text-espresso outline-none transition placeholder:text-espresso/30 focus:border-caramel focus:ring-4 focus:ring-caramel/15 ${className}`}
        {...props}
      />
    </label>
  );
}
