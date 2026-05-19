import { Coffee, Gift } from "lucide-react";
import { getRewardCopy, rewardGoal } from "@/lib/loyalty";

type StampCardProps = {
  customerName: string;
  stamps: number;
  totalRewards: number;
};

export function StampCard({
  customerName,
  stamps,
  totalRewards,
}: StampCardProps) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-espresso p-6 text-cream shadow-soft sm:p-8">
      <div className="absolute right-[-4rem] top-[-5rem] h-56 w-56 rounded-full border border-cream/10" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cream/55">
              Tarjeta digital
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              {customerName}
            </h2>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-lg bg-cream/10">
            <Coffee className="h-6 w-6 text-caramel" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-5 gap-2 sm:gap-3">
          {Array.from({ length: rewardGoal }).map((_, index) => {
            const active = index < stamps;
            return (
              <div
                key={index}
                className={`grid aspect-square place-items-center rounded-lg border ${
                  active
                    ? "border-caramel bg-caramel text-espresso"
                    : "border-cream/16 bg-cream/6 text-cream/34"
                }`}
              >
                <Coffee className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-lg bg-cream/8 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-cream/62">{getRewardCopy(stamps)}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-cream/35">
              {stamps}/{rewardGoal} sellos
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-caramel">
            <Gift className="h-4 w-4" />
            {totalRewards} canjes
          </div>
        </div>
      </div>
    </div>
  );
}
