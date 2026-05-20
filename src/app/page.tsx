import { MagicLinkForm } from "@/components/auth/magic-link-form";

export default function HomePage() {
  return (
    <>
      {/* Premium Gradient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#131110]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(181,164,140,0.15),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(60,45,35,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#131110_80%)]"></div>
      </div>

      {/* Main Content Canvas */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-container-padding-mobile md:px-container-padding-desktop py-12">
        
        {/* Header Section */}
        <header className="flex flex-col items-center text-center max-w-2xl mx-auto w-full mb-10">
          {/* Brand Logo: Restored Isologo from SCREEN_5 */}
          <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border border-surface-variant/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            <img 
              alt="Punto Café Logo" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9Oc41mV9ZvO4QpzGUUodEFizePE5Wov7XX0StaZsETKx8cF2C7_blz4lZljL3V7bFGihWnVwzVTWnBifHW97NYTp8Lq4AXnd3UX2Zbr9M_ri_qAif6tkVji0MRhePUdXeUfU1Tfc44yGBOlo4IZyth15WgONOk3-NCu72ToY4c4v66aVDqoIUK_Bl4sf1NEmXdTp8ldQ1R10XwHguz1w39XtdqC0OoVxJKpoWiBtZNTk9yQRlO0C5wY9jMfFH-C-L79TcW0madeg" 
            />
          </div>
          
          <img 
            src="/punto-cafe-text.png" 
            alt="Punto Café" 
            className="h-12 object-contain mb-8 opacity-90"
          />

          {/* Headline */}
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-display-lg md:text-display-lg text-balance bg-gradient-to-b from-white via-white to-surface-variant/40 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            Tus cafés de siempre,<br className="hidden md:block" /> ahora con <span className="font-bold bg-gradient-to-br from-secondary-fixed via-secondary-fixed-dim to-on-secondary-fixed-variant bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(214,196,171,0.3)]">recompensa</span>.
          </h1>

          {/* Descriptive Text */}
          <p className="mt-6 text-body-md md:text-body-lg font-body-md md:font-body-lg text-surface-variant/80 text-balance max-w-lg mx-auto">
            Juntá sellos digitales en cada visita. Al llegar a 5 consumos, te regalamos el próximo café. Así de simple, rápido y 100% digital.
          </p>
        </header>

        {/* Form Section */}
        <MagicLinkForm />

      </main>
    </>
  );
}
