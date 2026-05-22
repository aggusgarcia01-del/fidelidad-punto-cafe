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
    sm: "text-lg tracking-wide",
    md: "text-2xl tracking-wide",
    lg: "text-4xl tracking-wider",
  };

  const oSize = {
    sm: "h-[0.55em] w-[0.55em] border-[1.8px] mx-[0.04em]",
    md: "h-[0.62em] w-[0.62em] border-[2.2px] mx-[0.05em]",
    lg: "h-[0.65em] w-[0.65em] border-[3px] mx-[0.06em]",
  };

  const dotSize = {
    sm: "h-[1.5px] w-[1.5px]",
    md: "h-[2px] w-[2px]",
    lg: "h-[3.5px] w-[3.5px]",
  };

  return (
    <div className={`font-sans select-none flex items-center gap-1.5 ${sizeClasses[size]} ${className}`}>
      {/* "punto" in lowercase */}
      <span className="font-normal text-espresso flex items-center lowercase leading-none">
        p
        u
        n
        t
        <span className={`inline-flex items-center justify-center relative rounded-full border-espresso/90 border-solid ${oSize[size]}`}>
          <span className={`absolute bg-espresso/90 rounded-full ${dotSize[size]}`} />
        </span>
      </span>
      {/* "café" in lowercase bold */}
      <span className="font-extrabold text-caramel lowercase leading-none">
        café
      </span>
    </div>
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
    <div className={`grid place-items-center rounded-xl bg-espresso text-[#f6f1eb] shadow-lift shrink-0 ${sizeClasses[size]} ${className}`}>
      <svg viewBox="0 0 100 100" className="h-[75%] w-[75%]" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Saucer (outer circle) */}
        <circle cx="50" cy="50" r="43" stroke="currentColor" strokeWidth="4.5"/>
        {/* Cup body (inner circle) */}
        <circle cx="50" cy="50" r="32" fill="currentColor"/>
        {/* Handle */}
        <path d="M78 44 C84 44, 89 47, 89 50 C89 53, 84 56, 78 56 Z" fill="currentColor"/>
        {/* Reflection (white arc) */}
        <path d="M33 50 A 17 17 0 0 1 50 33" stroke="#f6f1eb" strokeWidth="3" strokeLinecap="round"/>
        {/* Center "punto" (white circle + dot) */}
        <circle cx="50" cy="50" r="8" stroke="#f6f1eb" strokeWidth="2.5"/>
        <circle cx="50" cy="50" r="2.5" fill="#f6f1eb"/>
      </svg>
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
