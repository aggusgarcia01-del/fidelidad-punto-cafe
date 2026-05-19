import { Coffee, QrCode, ShieldCheck, Sparkles } from "lucide-react";
import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { BrandMark } from "@/components/brand-mark";

const highlights = [
  { icon: Coffee, label: "5 sellos = cafe gratis" },
  { icon: QrCode, label: "QR listo para escanear" },
  { icon: ShieldCheck, label: "Magic link seguro" },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh px-4 py-5 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100dvh-2.5rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8">
          <BrandMark />
          <div className="max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-espresso/10 bg-porcelain/70 px-3 py-1 text-sm font-medium text-espresso/70">
              <Sparkles className="h-4 w-4 text-caramel" />
              Specialty coffee rewards
            </div>
            <h1 className="text-5xl font-semibold leading-[0.95] tracking-normal text-espresso sm:text-6xl lg:text-7xl">
              PuntoCafe
            </h1>
            <p className="max-w-xl text-lg leading-8 text-espresso/68">
              Tu tarjeta de fidelizacion digital: junta sellos por cada cafe y
              canjea tu recompensa sin tarjetas fisicas ni friccion.
            </p>
          </div>
          <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="glass-panel flex items-center gap-3 rounded-lg px-4 py-3"
              >
                <Icon className="h-5 w-5 shrink-0 text-caramel" />
                <span className="text-sm font-medium text-espresso/76">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <MagicLinkForm />
      </section>
    </main>
  );
}
