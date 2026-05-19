import { Coffee } from "lucide-react";

export function BrandMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-espresso text-[#f6f1eb] shadow-lift">
        <svg viewBox="0 0 100 100" className="h-9 w-9" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Saucer (outer circle) */}
          <circle cx="50" cy="50" r="43" stroke="currentColor" stroke-width="4.5"/>
          {/* Cup body (inner circle) */}
          <circle cx="50" cy="50" r="32" fill="currentColor"/>
          {/* Handle */}
          <path d="M78 44 C84 44, 89 47, 89 50 C89 53, 84 56, 78 56 Z" fill="currentColor"/>
          {/* Reflection (white arc) */}
          <path d="M33 50 A 17 17 0 0 1 50 33" stroke="#f6f1eb" stroke-width="3" stroke-linecap="round"/>
          {/* Center "punto" (white circle + dot) */}
          <circle cx="50" cy="50" r="8" stroke="#f6f1eb" stroke-width="2.5"/>
          <circle cx="50" cy="50" r="2.5" fill="#f6f1eb"/>
        </svg>
      </div>
      <div>
        <p className="text-base font-semibold leading-tight text-espresso font-sans">
          PuntoCafé
        </p>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-espresso/45 font-sans">
          Rewards
        </p>
      </div>
    </div>
  );
}
