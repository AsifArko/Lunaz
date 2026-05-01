/**
 * Professional hero background — geometric mesh gradient with subtle animation.
 * CSS-only, performant, responsive.
 */
export function HeroBackground({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {/* Base gradient — animated subtle shift */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(214,211,209,0.4),transparent)] animate-[hero-shimmer_8s_ease-in-out_infinite]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(231,229,228,0.25),transparent)] animate-[hero-shimmer_10s_ease-in-out_infinite_reverse]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_20%_80%,rgba(214,211,209,0.2),transparent)] animate-[hero-shimmer_12s_ease-in-out_infinite]" />

      {/* Geometric accent lines — subtle, professional */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      {/* Soft vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(250,250,249,0.4)_100%)]" />
    </div>
  );
}
