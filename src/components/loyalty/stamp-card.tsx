import { Gift } from "lucide-react";
import { getRewardCopy, rewardGoal } from "@/lib/loyalty";
import { BrandPattern } from "../brand-identity";

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
    <div className="relative overflow-hidden rounded-3xl bg-tertiary-container/40 backdrop-blur-xl p-6 text-inverse-on-surface shadow-[0_8px_32px_rgba(0,0,0,0.5)] sm:p-8 border border-surface-variant/10">
      {/* Brand pattern as a gorgeous, subtle watermark in the card background */}
      <div className="absolute right-[-20px] top-[-20px] text-surface-variant/5 pointer-events-none transform rotate-12 scale-125">
        <BrandPattern count={1} />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary-fixed-dim">
              Tarjeta de Fidelización
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-inverse-on-surface sm:text-3xl">
              {customerName}
            </h2>
          </div>
          
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-surface-variant/10 border border-surface-variant/10">
            <svg viewBox="0 0 100 100" className="h-7 w-7 text-secondary-fixed-dim" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="43" stroke="currentColor" strokeWidth="5"/>
              <circle cx="50" cy="50" r="32" fill="currentColor"/>
              <path d="M33 50 A 17 17 0 0 1 50 33" stroke="#1c1b1b" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="50" cy="50" r="8" stroke="#1c1b1b" strokeWidth="2.5"/>
              <circle cx="50" cy="50" r="2.5" fill="#1c1b1b"/>
            </svg>
          </div>
        </div>

        {/* Stamps Grid */}
        <div className="mt-8 grid grid-cols-5 gap-3 sm:gap-4">
          {Array.from({ length: rewardGoal }).map((_, index) => {
            const active = index < stamps;
            return (
              <div
                key={index}
                className={`grid aspect-square place-items-center rounded-2xl border transition-all duration-500 ${
                  active
                    ? "border-secondary-fixed-dim bg-secondary-fixed-dim text-primary-container shadow-[0_4px_20px_rgba(214,196,171,0.2)] scale-105"
                    : "border-surface-variant/10 bg-surface-variant/5 text-surface-variant/20"
                }`}
              >
                <svg viewBox="0 0 100 100" className="h-7 w-7 sm:h-9 sm:w-9" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer circle */}
                  <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="6"/>
                  {/* Inner cup */}
                  <circle cx="50" cy="50" r="30" fill="currentColor"/>
                  {/* Reflection arc */}
                  <path d="M34 50 A 16 16 0 0 1 50 34" stroke={active ? "#1c1b1b" : "currentColor"} strokeWidth="4.5" strokeLinecap="round"/>
                  {/* Dot ring */}
                  <circle cx="50" cy="50" r="7" stroke={active ? "#1c1b1b" : "currentColor"} strokeWidth="3"/>
                  {/* Center dot */}
                  <circle cx="50" cy="50" r="2" fill={active ? "#1c1b1b" : "currentColor"}/>
                </svg>
              </div>
            );
          })}
        </div>

        {/* Footer info box */}
        <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-surface-variant/10 border border-surface-variant/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-surface-variant/80 font-medium">{getRewardCopy(stamps)}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary-fixed-dim">
              {stamps}/{rewardGoal} sellos acumulados
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-secondary-fixed-dim bg-surface-variant/10 px-4 py-2 rounded-xl">
            <Gift className="h-4 w-4" />
            {totalRewards} canjes
          </div>
        </div>
      </div>
    </div>
  );
}
