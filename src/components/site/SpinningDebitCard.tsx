import React, { useState } from "react";
import { Wifi, Sparkles, Pause, Play, RotateCw } from "lucide-react";

export const SpinningDebitCard: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center py-4 select-none">
      {/* 3D Scene Wrapper with Perspective */}
      <div
        className="group relative flex items-center justify-center"
        style={{ perspective: "1200px" }}
      >
        {/* Ambient Back Glow */}
        <div className="pointer-events-none absolute -inset-4 rounded-full bg-gradient-to-r from-gold/25 via-emerald-500/10 to-gold/20 blur-3xl opacity-60 animate-pulse" />

        {/* 3D Spinning Card Container - Fully Responsive Across All Viewports */}
        <div
          className={`relative h-[190px] w-[290px] min-[360px]:h-[210px] min-[360px]:w-[330px] sm:h-[235px] sm:w-[380px] md:h-[250px] md:w-[410px] max-w-[calc(100vw-32px)] cursor-pointer transition-transform duration-700 ${
            isPaused ? "" : "animate-spin-card"
          }`}
          onClick={() => setIsPaused(!isPaused)}
          style={{
            transformStyle: "preserve-3d",
          }}
          title="Click to pause / resume 360° rotation"
        >
          {/* ==================== FRONT OF CARD ==================== */}
          <div
            className="absolute inset-0 rounded-2xl border border-gold/45 bg-gradient-to-br from-[#0F223D] via-[#071426] to-[#0A1A2F] p-6 shadow-2xl overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {/* Holographic metallic sheen overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-gold/[0.12] to-transparent opacity-80" />
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-gold/20 bg-gold/10 blur-xl" />

            {/* Top Row: Logo & Contactless */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Gold Monogram Shield */}
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/60 bg-gradient-to-br from-gold/30 to-gold/10 text-gold shadow-md font-display font-bold text-base">
                  PJ
                </div>
                <div>
                  <h4 className="font-display text-sm sm:text-base font-bold tracking-wider text-ivory">
                    PINNACLE J TRUST BANK
                  </h4>
                  <p className="text-[9px] font-mono tracking-widest text-gold uppercase">
                    World Elite Private Banking
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded border border-gold/40 bg-gold/10 px-2 py-0.5 text-[9px] font-mono font-bold tracking-widest text-gold">
                  DEBIT
                </span>
                <Wifi className="h-5 w-5 rotate-90 text-gold" />
              </div>
            </div>

            {/* Middle: EMV Smart Chip */}
            <div className="relative z-10 mt-5 flex items-center justify-between">
              <div className="relative h-9 w-12 rounded-md border border-amber-300/80 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-500 shadow-inner overflow-hidden">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-[1px] opacity-40">
                  <div className="border border-navy/40" />
                  <div className="border border-navy/40" />
                  <div className="border border-navy/40" />
                  <div className="border border-navy/40" />
                  <div className="border border-navy/40" />
                  <div className="border border-navy/40" />
                </div>
              </div>

              {/* Security Hologram */}
              <div className="flex items-center gap-1 text-[9px] font-mono tracking-widest text-ivory/50">
                <Sparkles className="h-3 w-3 text-gold" /> FIPS 140-2
              </div>
            </div>

            {/* Masked Card Number */}
            <div className="relative z-10 mt-4">
              <p className="font-mono text-base sm:text-xl font-bold tracking-[0.22em] text-ivory drop-shadow-md">
                •••• •••• •••• 8829
              </p>
            </div>

            {/* Bottom Row: Cardholder Name, Expiry & World Elite Logo */}
            <div className="relative z-10 mt-3 flex items-end justify-between text-xs">
              <div>
                <span className="block text-[8px] font-mono uppercase tracking-widest text-ivory/50">
                  Cardholder
                </span>
                <p className="font-mono text-sm font-bold tracking-widest text-gold">
                  XXX
                </p>
              </div>

              <div className="text-center">
                <span className="block text-[8px] font-mono uppercase tracking-widest text-ivory/50">
                  Valid Thru
                </span>
                <p className="font-mono text-xs font-semibold text-ivory">
                  12/30
                </p>
              </div>

              {/* Interlocking Mastercard/World Elite circles in Gold & Platinum */}
              <div className="flex items-center">
                <div className="flex -space-x-3">
                  <div className="h-7 w-7 rounded-full bg-gold/80 shadow-md border border-gold" />
                  <div className="h-7 w-7 rounded-full bg-white/70 shadow-md border border-white/60 backdrop-blur-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* ==================== BACK OF CARD ==================== */}
          <div
            className="absolute inset-0 rounded-2xl border border-gold/40 bg-gradient-to-br from-[#071426] via-[#0B1B30] to-[#071426] pt-4 shadow-2xl overflow-hidden"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {/* Magnetic Stripe */}
            <div className="h-10 w-full bg-gradient-to-r from-[#030811] via-[#101724] to-[#030811] border-y border-white/10" />

            <div className="p-4 sm:p-5 space-y-3">
              {/* White Signature Strip & CVV */}
              <div className="flex items-center gap-3">
                <div className="flex-1 rounded-sm bg-gradient-to-r from-ivory/95 to-ivory/85 px-3 py-1 text-right font-mono text-[10px] italic text-navy-deep font-semibold">
                  Authorized Signature: <span className="font-bold text-navy">XXX</span>
                </div>
                <div className="rounded-sm border border-ivory/20 bg-white/10 px-2 py-1 font-mono text-[11px] font-bold text-gold">
                  •••
                </div>
              </div>

              {/* Hologram security stamp & legal terms */}
              <div className="space-y-1.5 text-[8px] leading-relaxed text-ivory/60 font-sans">
                <p>
                  This card is property of PINNACLE J TRUST BANK. Issued under authority of private fiduciary license. If found, please return to any PJ Trust branch or call the global concierge desk.
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-ivory/10 text-ivory/50 font-mono">
                  <span>24/7 Global: +1 (800) 849-2900</span>
                  <span className="text-gold font-bold">ZÜRICH · LONDON · NEW YORK</span>
                </div>
              </div>

              {/* Network badges */}
              <div className="flex items-center justify-between pt-1 text-[9px] font-mono text-ivory/40">
                <span className="tracking-widest">PJTB WORLD NETWORK</span>
                <span className="rounded bg-gold/15 px-1.5 py-0.5 text-gold border border-gold/30">
                  CIRRUS / EMV CO
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Pill beneath the Card */}
      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-white/[0.04] px-3.5 py-1 text-[11px] font-semibold text-gold hover:border-gold hover:bg-gold/15 transition-all shadow-sm backdrop-blur-md"
        >
          {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
          <span>{isPaused ? "Resume 360° Spin" : "Pause 360° Spin"}</span>
        </button>
        <span className="text-[11px] text-ivory/50 font-mono">
          Hover or click card to inspect
        </span>
      </div>
    </div>
  );
};
