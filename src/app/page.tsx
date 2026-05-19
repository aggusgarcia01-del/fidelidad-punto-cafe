import { Coffee, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { BrandLogo, BrandPattern } from "@/components/brand-identity";

const highlights = [
  { icon: Coffee, label: "5 sellos = café de regalo" },
  { icon: QrCode, label: "Acceso simple con tu DNI" },
  { icon: ShieldCheck, label: "Sin plásticos ni papel" },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden flex items-center justify-center">
      {/* Decorative watermark patterns in the background */}
      <div className="absolute top-[-50px] right-[-100px] text-caramel/5 pointer-events-none transform rotate-12 scale-150 hidden lg:block">
        <BrandPattern count={3} />
      </div>
      <div className="absolute bottom-[-50px] left-[-100px] text-caramel/5 pointer-events-none transform -rotate-12 scale-150 hidden lg:block">
        <BrandPattern count={3} />
      </div>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] relative z-10 py-4">
        
        {/* Left Side: Brand presentation */}
        <div className="space-y-10 flex flex-col justify-center">
          <div className="space-y-6">
            <BrandLogo layout="horizontal" size="lg" />
            
            <div className="inline-flex items-center gap-2 rounded-full border border-[#b5a48c]/20 bg-[#b5a48c]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-espresso">
              <Sparkles className="h-3.5 w-3.5 text-caramel animate-pulse" />
              Specialty Coffee Loyalty Card
            </div>
            
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-espresso sm:text-5xl lg:text-6xl max-w-xl">
              Tus cafés de siempre, ahora con recompensa.
            </h1>
            
            <p className="max-w-xl text-base leading-relaxed text-espresso/70">
              Juntá sellos digitales en cada visita. Al llegar a 5 consumos,
              te regalamos el próximo café. Así de simple, rápido y 100% digital.
            </p>
          </div>

          {/* Highlights grid */}
          <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="glass-panel flex flex-col justify-between items-start gap-3 rounded-2xl p-5 border border-espresso/10 hover:border-[#b5a48c]/50 transition-all duration-300 shadow-sm"
              >
                <div className="bg-[#b5a48c]/10 p-2.5 rounded-xl text-caramel">
                  <Icon className="h-5 w-5 shrink-0" />
                </div>
                <span className="text-sm font-bold text-espresso leading-snug">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Elegant geometric separator strip */}
          <div className="w-full pt-4 border-t border-espresso/5">
            <BrandPattern count={2} className="text-espresso/15" />
          </div>
        </div>

        {/* Right Side: Authentication container */}
        <div className="relative">
          {/* Accent light block behind the card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#b5a48c]/20 to-transparent blur-3xl -z-10 rounded-3xl" />
          <MagicLinkForm />
        </div>
      </section>
    </main>
  );
}
