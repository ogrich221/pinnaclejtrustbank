import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronLeft, ChevronRight, LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./Logo";
import { LanguageSelector } from "./LanguageSelector";

const nav = [
  { to: "/", label: "Home" },
  { to: "/personal-banking", label: "Personal Banking" },
  { to: "/business-banking", label: "Business Banking" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
  }, []);

  const loginTarget = signedIn ? "/portal" : "/login";
  const loginLabel = signedIn ? "My Account" : "Login";

  return (
    <header className={`${overlay ? "absolute" : "relative bg-navy-deep"} inset-x-0 top-0 z-30`}>
      {/* Top Utility Bar with Language Selection at Top Left */}
      <div className="border-b border-ivory/10 bg-navy-deep/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 sm:px-6 py-2">
          {/* Top-Left: Simple Back & Front Navigation Arrows + Language Selector */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="flex items-center gap-0.5 rounded-full border border-ivory/15 bg-navy-deep/80 px-1 py-0.5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => window.history.back()}
                title="Go Back"
                aria-label="Go Back"
                className="rounded-full p-1.5 text-ivory/70 hover:bg-ivory/10 hover:text-gold transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <div className="h-2.5 w-px bg-ivory/15" />
              <button
                type="button"
                onClick={() => window.history.forward()}
                title="Go Front / Forward"
                aria-label="Go Front"
                className="rounded-full p-1.5 text-ivory/70 hover:bg-ivory/10 hover:text-gold transition-colors cursor-pointer"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <LanguageSelector variant="header" />
            <span className="hidden sm:inline text-ivory/20">|</span>
            <span className="hidden sm:inline text-[11px] font-medium tracking-widest text-ivory/60 uppercase">
              Private & Institutional Trust
            </span>
          </div>

          {/* Top-Right: Quick branch & support links */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs text-ivory/70">
            <a
              href="/#global-branches"
              className="hidden md:inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-soft transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
              </span>
              12 Global Branches
            </a>
            <span className="hidden md:inline text-ivory/20">|</span>
            <Link to="/contact" className="hover:text-gold transition-colors text-[11px] tracking-wide">
              Support 24/7
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="border-b border-ivory/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4">
          <Logo />
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="text-sm text-ivory/80 transition-colors hover:text-gold"
                activeProps={{ className: "text-gold" }}
                activeOptions={{ exact: true }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-5 lg:flex">
            <Link to={loginTarget} className="text-xs font-semibold tracking-[0.2em] text-ivory hover:text-gold">
              {loginLabel.toUpperCase()}
            </Link>
            <Link to="/open-account" className="btn-gold !py-3 !px-5">
              Open an Account
            </Link>
          </div>
          <div className="flex items-center gap-2 lg:hidden">
            <Link to={loginTarget} className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-gold/35 px-3 text-xs font-semibold text-gold transition-colors hover:bg-gold/10">
              <LogIn className="h-4 w-4" /> {loginLabel}
            </Link>
            <button
              className="text-ivory min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-ivory/15 bg-white/[0.04] p-2 hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {open && (
        <div className="border-t border-ivory/10 bg-navy-deep px-6 pb-6 pt-4 lg:hidden">
          <div className="mb-4 pb-4 border-b border-ivory/10">
            <LanguageSelector variant="mobile" />
          </div>
          
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block border-b border-ivory/10 py-3.5 text-ivory/90"
            >
              {n.label}
            </Link>
          ))}
          <div className="mt-6 flex gap-3">
            <Link to={loginTarget} className="btn-outline-light flex-1">
              {loginLabel}
            </Link>
            <Link to="/open-account" className="btn-gold flex-1">
              Open Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
