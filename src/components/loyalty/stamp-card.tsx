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
    <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-white/5">
      {/* Brand pattern as a gorgeous, subtle watermark in the card background */}
      <div className="absolute right-[-20px] top-[-20px] text-white/5 pointer-events-none transform rotate-12 scale-125">
        <BrandPattern count={1} />
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Tarjeta de Fidelización
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {customerName}
            </h2>
          </div>
          
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-accent/10 border border-brand-accent/20">
            <svg viewBox="0 0 100 100" className="h-7 w-7 text-brand-accent" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="43" stroke="currentColor" strokeWidth="5"/>
              <circle cx="50" cy="50" r="32" fill="currentColor"/>
              <path d="M33 50 A 17 17 0 0 1 50 33" stroke="#121212" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="50" cy="50" r="8" stroke="#121212" strokeWidth="2.5"/>
              <circle cx="50" cy="50" r="2.5" fill="#121212"/>
            </svg>
          </div>
        </div>

        {/* Stamps Row or Reward Celebration */}
        {stamps >= 5 ? (
          <div className="mt-8 flex flex-col items-center justify-center py-6 animate-fade-in">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-brand-accent/20 blur-xl rounded-full"></div>
              <div className="relative h-24 w-24 bg-brand-accent/10 border border-brand-accent/30 rounded-full flex items-center justify-center text-brand-accent shadow-[0_0_30px_rgba(212,175,55,0.3)] animate-pulse-glow">
                <Gift className="h-10 w-10 animate-bounce" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">¡Café Gratis de Autor!</h3>
            <p className="text-sm text-gray-400 text-center max-w-xs">Muestra tu código al barista para canjear tu merecida recompensa.</p>
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-center py-4">
            {[0, 1, 2, 3, 4].map(idx => {
                const active = idx < stamps;
                const isGift = idx === 4;
                return (
                    <div key={idx} className="flex items-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className={`stamp-circle ${active ? 'active scale-105' : ''} ${isGift && !active ? 'gift' : ''} overflow-hidden border-none w-[72px] h-[72px]`}>
                              <img 
                                alt="Punto Café Premium Logo" 
                                className={`w-full h-full object-cover ${!active ? 'opacity-20' : ''}`} 
                                src="/logo-circle.png"
                              />
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium">TAZA {idx + 1}</span>
                        </div>
                        {idx < 4 && <div className="h-[1px] w-4 sm:w-8 md:w-12 bg-white/10 mb-6 mx-2 sm:mx-4"></div>}
                    </div>
                );
            })}
          </div>
        )}

        {/* Footer info box */}
        <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-white/5 border border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-300 font-medium">{getRewardCopy(stamps)}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-brand-accent">
              {stamps}/{rewardGoal} sellos acumulados
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-brand-accent bg-brand-accent/10 px-4 py-2 rounded-xl">
            <Gift className="h-4 w-4" />
            {totalRewards} canjes
          </div>
        </div>
      </div>
    </div>
  );
}
