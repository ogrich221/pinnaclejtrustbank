import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";

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
    <header className={`${overlay ? "absolute" : "relative bg-navy-deep"} inset-x-0 top-0 z-30 border-b border-ivory/10`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="text-sm text-ivory/80 transition-colors hover:text-gold" activeProps={{ className: "text-gold" }} activeOptions={{ exact: true }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-5 lg:flex">
          <Link to="/login" className="text-xs font-semibold tracking-[0.2em] text-ivory hover:text-gold">LOGIN</Link>
          <Link to="/open-account" className="btn-gold !py-3 !px-5">Open an Account</Link>
        </div>
        <button className="text-ivory lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-ivory/10 bg-navy-deep px-6 pb-6 lg:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block border-b border-ivory/10 py-4 text-ivory/90">{n.label}</Link>
          ))}
          <div className="mt-6 flex gap-3">
            <Link to="/login" className="btn-outline-light flex-1">Login</Link>
            <Link to="/open-account" className="btn-gold flex-1">Open Account</Link>
          </div>
        </div>
      )}
    </header>
  );
}
