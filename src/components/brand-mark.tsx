import { Coffee } from "lucide-react";

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-espresso text-cream shadow-lift">
        <Coffee className="h-6 w-6" />
      </div>
      <div>
        <p className="text-base font-semibold leading-tight text-espresso">
          PuntoCafe
        </p>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-espresso/45">
          Rewards
        </p>
      </div>
    </div>
  );
}
