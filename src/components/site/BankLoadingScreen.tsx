import React from "react";
import { LogoMark } from "./Logo";

interface BankLoadingScreenProps {
  message?: string;
  subtext?: string;
  fullScreen?: boolean;
}

export const BankLoadingScreen: React.FC<BankLoadingScreenProps> = ({
  message = "PINNACLE J TRUST BANK",
  subtext = "Establishing secure cryptographic connection...",
  fullScreen = true,
}) => {
  return (
    <div
      className={`${
        fullScreen
          ? "fixed inset-0 z-50 flex items-center justify-center bg-[#071426] backdrop-blur-xl"
          : "flex flex-col items-center justify-center p-12 min-h-[300px]"
      } text-ivory animate-in fade-in duration-200 select-none`}
      role="status"
      aria-label="Loading"
    >
      {/* Background ambient gold/navy glow */}
      <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-gold/15 blur-3xl animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Pulsing Animated Bank Logo */}
        <div className="relative flex items-center justify-center">
          <div className="absolute h-24 w-24 rounded-2xl bg-gold/20 blur-xl animate-ping opacity-40" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-gold/40 bg-gradient-to-br from-[#0C1B30] to-[#071426] p-4 text-gold shadow-2xl">
            <LogoMark className="h-12 w-12 text-gold animate-pulse" />
          </div>
        </div>

        {/* Brand Text */}
        <div className="mt-6 space-y-1">
          <h2 className="font-display text-xl font-bold tracking-[0.2em] text-ivory uppercase">
            {message}
          </h2>
          <p className="text-[10px] font-mono tracking-[0.4em] text-gold uppercase">
            TRUST BANK · GLOBAL CLEARING
          </p>
        </div>

        {/* Gold Shimmer Progress Bar */}
        <div className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-ivory/10">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-gold to-transparent animate-shimmer" />
        </div>

        <p className="mt-3 text-xs text-ivory/60 font-mono">
          {subtext}
        </p>
      </div>
    </div>
  );
};
