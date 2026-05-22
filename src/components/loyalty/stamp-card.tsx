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
    <div className="relative overflow-hidden rounded-3xl glass-panel p-4 sm:p-8 border border-white/5">


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

        {stamps >= 5 ? (
          <div className="mt-8 flex flex-col items-center justify-center py-6 animate-fade-in">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-brand-accent/20 blur-xl rounded-full"></div>
              <div className="relative h-24 w-24 bg-brand-accent/10 border border-brand-accent/30 rounded-full flex items-center justify-center text-brand-accent shadow-[0_0_30px_rgba(212,175,55,0.3)] animate-pulse-glow">
                <Gift className="h-10 w-10 animate-bounce" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">¡Café Gratis de Autor!</h3>
            <p className="text-sm text-gray-400 text-center max-w-xs">Mostrá esta pantalla al barista para canjear tu merecida recompensa.</p>
          </div>
        ) : (
          <div className="mt-8 flex items-center justify-between pt-4 pb-8 w-full">
            {[0, 1, 2, 3, 4].map(idx => {
                const active = idx < stamps;
                const isGift = idx === 4;
                return (
                    <div key={idx} className="flex items-center flex-1 last:flex-none relative">
                        <div className="relative flex justify-center items-center">
                            <div className={`stamp-circle ${active ? 'active scale-105' : ''} ${isGift && !active ? 'gift' : ''} overflow-hidden border-none w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 min-[390px]:w-12 min-[390px]:h-12 min-[420px]:w-14 min-[420px]:h-14 sm:w-[72px] sm:h-[72px] flex-shrink-0`}>
                                <img 
                                  alt="Punto Café Premium Logo" 
                                  className={`w-full h-full object-cover ${!active ? 'opacity-20' : ''}`} 
                                  src="/logo-gold.png"
                                />
                            </div>
                            <span className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 text-[8px] min-[360px]:text-[10px] text-gray-500 font-medium select-none whitespace-nowrap">
                              SELLO {idx + 1}
                            </span>
                        </div>
                        {idx < 4 && <div className="h-[1px] flex-grow min-w-[4px] max-w-[48px] bg-white/10 mx-1 sm:mx-4"></div>}
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
