import { MagicLinkForm } from "@/components/auth/magic-link-form";

export default function HomePage() {
  return (
    <>
      {/* Main Content Canvas */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-container-padding-mobile md:px-container-padding-desktop py-12">
        {/* Header Section */}
        <header className="flex flex-col items-center text-center max-w-2xl mx-auto w-full mb-10">
          {/* Brand Logo */}
          <div className="w-24 h-24 rounded-full overflow-hidden mb-8 border border-surface-variant/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <img 
              alt="Punto Café Logo" 
              className="w-full h-full object-cover" 
              src="/logo-circle.png" 
            />
          </div>
          <div className="mb-8">
            <img 
              alt="Punto Café" 
              className="h-10 w-auto object-contain" 
              src="/punto-cafe-text.png" 
            />
          </div>

          {/* Headline */}
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-display-lg md:text-display-lg text-balance bg-gradient-to-b from-white via-white to-surface-variant/40 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            Tus cafés de siempre,<br className="hidden md:block" /> ahora con <span className="font-bold bg-gradient-to-br from-secondary-fixed via-secondary-fixed-dim to-on-secondary-fixed-variant bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(214,196,171,0.3)]">recompensa</span>.
          </h1>

          {/* Descriptive Text */}
          <p className="mt-6 text-body-md md:text-body-lg font-body-md md:font-body-lg text-surface-variant/80 text-balance max-w-lg mx-auto">
            Juntá sellos digitales en cada visita. Al llegar a 5 consumos, te regalamos el próximo café. Así de simple, rápido y 100% digital.
          </p>
        </header>

        {/* Loyalty Progress Visual */}
        <section aria-label="Progreso de lealtad" className="flex flex-col items-center mb-12 w-full">
          <div className="flex items-center justify-center gap-2 md:gap-4">
            {/* Stamp 1 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-secondary-fixed-dim flex items-center justify-center overflow-hidden">
                <img alt="Sello Punto Café" className="w-full h-full object-cover opacity-30 animate-stamp-fill" style={{ animationDelay: '0s' }} src="/logo-gold.png" />
              </div>
            </div>
            {/* Connector Line */}
            <div className="w-4 md:w-8 h-[1px] bg-surface-variant/20"></div>
            
            {/* Stamp 2 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-secondary-fixed-dim flex items-center justify-center overflow-hidden">
                <img alt="Sello Punto Café" className="w-full h-full object-cover opacity-30 animate-stamp-fill" style={{ animationDelay: '0.5s' }} src="/logo-gold.png" />
              </div>
            </div>
            {/* Connector Line */}
            <div className="w-4 md:w-8 h-[1px] bg-surface-variant/20"></div>
            
            {/* Stamp 3 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-secondary-fixed-dim flex items-center justify-center overflow-hidden">
                <img alt="Sello Punto Café" className="w-full h-full object-cover opacity-30 animate-stamp-fill" style={{ animationDelay: '1s' }} src="/logo-gold.png" />
              </div>
            </div>
            {/* Connector Line */}
            <div className="w-4 md:w-8 h-[1px] bg-surface-variant/20"></div>
            
            {/* Stamp 4 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-secondary-fixed-dim flex items-center justify-center overflow-hidden">
                <img alt="Sello Punto Café" className="w-full h-full object-cover opacity-30 animate-stamp-fill" style={{ animationDelay: '1.5s' }} src="/logo-gold.png" />
              </div>
            </div>
            {/* Connector Line */}
            <div className="w-4 md:w-8 h-[1px] bg-surface-variant/20"></div>
            
            {/* Stamp 5 (Reward) */}
            <div className="flex flex-col items-center relative">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-secondary-fixed-dim border-dashed flex items-center justify-center overflow-hidden">
                <img alt="Sello Punto Café" className="w-full h-full object-cover opacity-30 animate-stamp-fill" style={{ animationDelay: '2s' }} src="/logo-gold.png" />
              </div>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <MagicLinkForm />
      </main>
    </>
  );
}
