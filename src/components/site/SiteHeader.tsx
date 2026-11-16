import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
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
  return (
    <header className={`${overlay ? "absolute" : "relative bg-navy-deep"} inset-x-0 top-0 z-30`}>
      {/* Top Utility Bar with Language Selection at Top Left */}
      <div className="border-b border-ivory/10 bg-navy-deep/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          {/* Top-Left: Simple Back & Front Navigation Arrows + Language Selector */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-0.5 rounded-full border border-ivory/15 bg-navy-deep/80 px-1 py-0.5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => window.history.back()}
                title="Go Back"
                aria-label="Go Back"
                className="rounded-full p-1 text-ivory/70 hover:bg-ivory/10 hover:text-gold transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <div className="h-2.5 w-px bg-ivory/15" />
              <button
                type="button"
                onClick={() => window.history.forward()}
                title="Go Front / Forward"
                aria-label="Go Front"
                className="rounded-full p-1 text-ivory/70 hover:bg-ivory/10 hover:text-gold transition-colors cursor-pointer"
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
          <div className="flex items-center gap-4 text-xs text-ivory/70">
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
            <span className="hidden sm:inline text-ivory/20">|</span>
            <Link to="/admin" className="hover:text-gold transition-colors text-[11px] tracking-wide text-gold/90 font-medium">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="border-b border-ivory/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
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
            <Link to="/login" className="text-xs font-semibold tracking-[0.2em] text-ivory hover:text-gold">
              LOGIN
            </Link>
            <Link to="/open-account" className="btn-gold !py-3 !px-5">
              Open an Account
            </Link>
          </div>
          <button
            className="text-ivory lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {open && (
        <div className="border-t border-ivory/10 bg-navy-deep px-6 pb-6 pt-4 lg:hidden">
          <div className="mb-4 pb-4 border-b border-ivory/10">
            <LanguageSelector variant="mobile" />
          </div>
          <Link to="/admin" onClick={() => setOpen(false)} className="block border-b border-ivory/10 py-3 text-gold font-semibold">
            Admin Dashboard
          </Link>
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
            <Link to="/login" className="btn-outline-light flex-1">
              Login
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
