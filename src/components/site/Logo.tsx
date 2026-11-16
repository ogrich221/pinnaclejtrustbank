import { Link } from "@tanstack/react-router";

export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="1" y="1" width="46" height="46" fill="none" stroke="currentColor" strokeOpacity="0.5" />
      <path d="M24 6 L38 21 H33.5 L24 11 L14.5 21 H10 Z" fill="currentColor" />
      <text x="24" y="40" textAnchor="middle" fontFamily="Cormorant Garamond, Georgia, serif" fontSize="17" fontWeight="600" fill="currentColor">PJ</text>
    </svg>
  );
}

export function Logo({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="Pinnacle J Trust Bank home">
      <span className="text-gold"><LogoMark /></span>
      <span className="leading-none">
        <span className={`block font-display text-lg font-semibold tracking-[0.18em] ${tone === "light" ? "text-ivory" : "text-navy"}`}>PINNACLE J</span>
        <span className="block text-[0.6rem] tracking-[0.45em] text-gold">TRUST BANK</span>
      </span>
    </Link>
  );
}
