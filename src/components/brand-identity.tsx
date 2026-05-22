import React from "react";

interface BrandIdentityProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";
}

/**
 * Custom text logo for "punto café" with the dot-in-o pattern
 */
export function BrandText({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-12",
  };

  return (
    <img 
      src="/punto-cafe-text.png" 
      alt="Punto Café" 
      className={`object-contain ${sizeClasses[size]} ${className}`} 
    />
  );
}

/**
 * Vector logo cup (Isotipo)
 */
export function BrandIcon({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-20 w-20",
  };

  return (
    <div className={`grid place-items-center rounded-xl bg-espresso text-[#f6f1eb] shadow-lift shrink-0 ${sizeClasses[size]} ${className} overflow-hidden`}>
      <img 
        src="/logo-circle.png" 
        alt="Punto Café Logo" 
        className="w-[85%] h-[85%] object-contain" 
      />
    </div>
  );
}

/**
 * Unified Logo Component
 */
export function BrandLogo({ layout = "horizontal", size = "md", className = "" }: BrandIdentityProps) {
  if (layout === "vertical") {
    return (
      <div className={`flex flex-col items-center text-center gap-3 ${className}`}>
        <BrandIcon size={size === "lg" ? "lg" : "md"} />
        <BrandText size={size} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <BrandIcon size={size === "lg" ? "md" : "sm"} />
      <BrandText size={size} />
    </div>
  );
}

/**
 * Geometric brand pattern from PuntoCafé branding materials
 */
export function BrandPattern({ className = "", count = 1 }: { className?: string; count?: number }) {
  return (
    <div className={`flex items-center gap-8 overflow-hidden py-2 select-none ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-8 shrink-0">
          {/* Shape 1: Horizontal cup/bowl crescent */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-70" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 10 C4 15, 8 18, 12 18 C16 18, 20 15, 20 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="12" cy="10" r="2" fill="currentColor"/>
          </svg>
          
          {/* Shape 2: Semicircle upright (D shape) */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-70" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5 C14 5, 17 9, 17 12 C17 15, 14 19, 9 19 Z" fill="currentColor"/>
          </svg>

          {/* Shape 3: Target ring and dot */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-70" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
          </svg>

          {/* Shape 4: Left-facing open crescent with dot */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-70" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 6 A6 6 0 0 0 16 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="10" cy="12" r="2" fill="currentColor"/>
          </svg>

          {/* Shape 5: Triple dots */}
          <div className="flex flex-col gap-1">
            <div className="w-1.5 h-1.5 bg-current rounded-full" />
            <div className="w-1.5 h-1.5 bg-current rounded-full" />
            <div className="w-1.5 h-1.5 bg-current rounded-full" />
          </div>

          {/* Shape 6: Semicircle vertical outline */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-70" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5 A 7 7 0 0 1 12 19 Z" stroke="currentColor" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1"/>
          </svg>
        </div>
      ))}
    </div>
  );
}
