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
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9Oc41mV9ZvO4QpzGUUodEFizePE5Wov7XX0StaZsETKx8cF2C7_blz4lZljL3V7bFGihWnVwzVTWnBifHW97NYTp8Lq4AXnd3UX2Zbr9M_ri_qAif6tkVji0MRhePUdXeUfU1Tfc44yGBOlo4IZyth15WgONOk3-NCu72ToY4c4v66aVDqoIUK_Bl4sf1NEmXdTp8ldQ1R10XwHguz1w39XtdqC0OoVxJKpoWiBtZNTk9yQRlO0C5wY9jMfFH-C-L79TcW0madeg" 
            />
          </div>

          {/* Premium Typography Treatment */}
          <div className="mb-8 select-none"></div>

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
            {/* Stamp 1 (Collected) */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary-fixed-dim/20 border border-secondary-fixed-dim flex items-center justify-center shadow-[0_0_15px_rgba(214,196,171,0.2)]">
                <img alt="Sello Punto Café" className="w-full h-full object-cover rounded-full shadow-[0_0_15px_rgba(214,196,171,0.2)]" src="https://lh3.googleusercontent.com/aida/ADBb0uh7UlelO7YyABnhctM4eldejBMs7gZ2MmxuAoKfVFxvrzKprSnnYv_m6xf9qR1NlK7VeHtci-F6w7mfywaWUNkPqxr6YthulBC6DIn6ni7oJlLfp-H9Mbejv0vlOxjADfh93gK_qwtWPMdeKgkzq6VEcH1IhwT6A7t5Te79Zp7OjaUYYzUEoS7CfeGzDVwKHOmwMNMmph8UVnz9we7ZzQknhiBfSz9exaczw8cfkZ2O_MzAzyz7dnhjznc" />
              </div>
            </div>
            {/* Connector Line */}
            <div className="w-4 md:w-8 h-[1px] bg-secondary-fixed-dim/50"></div>
            
            {/* Stamp 2 (Collected) */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary-fixed-dim/20 border border-secondary-fixed-dim flex items-center justify-center shadow-[0_0_15px_rgba(214,196,171,0.2)]">
                <img alt="Sello Punto Café" className="w-full h-full object-cover rounded-full shadow-[0_0_15px_rgba(214,196,171,0.2)]" src="https://lh3.googleusercontent.com/aida/ADBb0uh7UlelO7YyABnhctM4eldejBMs7gZ2MmxuAoKfVFxvrzKprSnnYv_m6xf9qR1NlK7VeHtci-F6w7mfywaWUNkPqxr6YthulBC6DIn6ni7oJlLfp-H9Mbejv0vlOxjADfh93gK_qwtWPMdeKgkzq6VEcH1IhwT6A7t5Te79Zp7OjaUYYzUEoS7CfeGzDVwKHOmwMNMmph8UVnz9we7ZzQknhiBfSz9exaczw8cfkZ2O_MzAzyz7dnhjznc" />
              </div>
            </div>
            {/* Connector Line */}
            <div className="w-4 md:w-8 h-[1px] bg-surface-variant/20"></div>
            
            {/* Stamp 3 (Empty) */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-transparent border border-surface-variant/20 flex items-center justify-center">
                <img alt="Sello Punto Café" className="w-full h-full object-cover rounded-full opacity-30" src="https://lh3.googleusercontent.com/aida/ADBb0uh7UlelO7YyABnhctM4eldejBMs7gZ2MmxuAoKfVFxvrzKprSnnYv_m6xf9qR1NlK7VeHtci-F6w7mfywaWUNkPqxr6YthulBC6DIn6ni7oJlLfp-H9Mbejv0vlOxjADfh93gK_qwtWPMdeKgkzq6VEcH1IhwT6A7t5Te79Zp7OjaUYYzUEoS7CfeGzDVwKHOmwMNMmph8UVnz9we7ZzQknhiBfSz9exaczw8cfkZ2O_MzAzyz7dnhjznc" />
              </div>
            </div>
            {/* Connector Line */}
            <div className="w-4 md:w-8 h-[1px] bg-surface-variant/20"></div>
            
            {/* Stamp 4 (Empty) */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-transparent border border-surface-variant/20 flex items-center justify-center">
                <img alt="Sello Punto Café" className="w-full h-full object-cover rounded-full opacity-30" src="https://lh3.googleusercontent.com/aida/ADBb0uh7UlelO7YyABnhctM4eldejBMs7gZ2MmxuAoKfVFxvrzKprSnnYv_m6xf9qR1NlK7VeHtci-F6w7mfywaWUNkPqxr6YthulBC6DIn6ni7oJlLfp-H9Mbejv0vlOxjADfh93gK_qwtWPMdeKgkzq6VEcH1IhwT6A7t5Te79Zp7OjaUYYzUEoS7CfeGzDVwKHOmwMNMmph8UVnz9we7ZzQknhiBfSz9exaczw8cfkZ2O_MzAzyz7dnhjznc" />
              </div>
            </div>
            {/* Connector Line */}
            <div className="w-4 md:w-8 h-[1px] bg-surface-variant/20"></div>
            
            {/* Stamp 5 (Empty - Reward) */}
            <div className="flex flex-col items-center relative">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-transparent border border-surface-variant/20 border-dashed flex items-center justify-center">
                <img alt="Sello Punto Café" className="w-full h-full object-cover rounded-full opacity-30" src="https://lh3.googleusercontent.com/aida/ADBb0uh7UlelO7YyABnhctM4eldejBMs7gZ2MmxuAoKfVFxvrzKprSnnYv_m6xf9qR1NlK7VeHtci-F6w7mfywaWUNkPqxr6YthulBC6DIn6ni7oJlLfp-H9Mbejv0vlOxjADfh93gK_qwtWPMdeKgkzq6VEcH1IhwT6A7t5Te79Zp7OjaUYYzUEoS7CfeGzDVwKHOmwMNMmph8UVnz9we7ZzQknhiBfSz9exaczw8cfkZ2O_MzAzyz7dnhjznc" />
              </div>
            </div>
          </div>
          <p className="font-label-sm text-label-sm text-surface-variant/60 mt-4 tracking-wide">2 DE 5 COMPLETADOS</p>
        </section>

        {/* Form Section */}
        <MagicLinkForm />
      </main>
    </>
  );
}
