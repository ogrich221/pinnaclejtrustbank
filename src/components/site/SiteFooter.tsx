import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Logo } from "./Logo";

const links = [
  { to: "/about", label: "About the Bank" },
  { to: "/personal-banking", label: "Personal Banking" },
  { to: "/business-banking", label: "Business Banking" },
  { to: "/digital-banking", label: "Digital Banking" },
  { to: "/contact", label: "Contact" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms and Conditions" },
  { to: "/security", label: "Security Information" },
] as const;

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const r = z.string().trim().email().max(255).safeParse(email);
    if (!r.success) return setError("Please enter a valid email address.");
    setError("");
    setEmail("");
    toast.success("Thank you for subscribing", { description: "You'll receive our latest updates." });
  };
  return (
    <footer className="bg-navy-deep text-ivory/70">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Logo />
          <p className="mt-6 font-display text-lg italic text-ivory/80">PINNACLE J TRUST BANK — A higher standard of financial possibilities.</p>
          <div className="mt-6 flex gap-3">
            {[{ I: Facebook, l: "Facebook" }, { I: Twitter, l: "X (Twitter)" }, { I: Linkedin, l: "LinkedIn" }, { I: Instagram, l: "Instagram" }].map(({ I, l }) => (
              <a key={l} href="#" onClick={(e) => { e.preventDefault(); toast.info(`${l} profile coming soon`); }} aria-label={l} title={l} className="flex h-10 w-10 items-center justify-center border border-ivory/15 transition-colors hover:border-gold hover:text-gold">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="eyebrow mb-5">Explore</h3>
          <ul className="space-y-3 text-sm">
            {links.map((l) => <li key={l.to}><Link to={l.to} className="hover:text-gold">{l.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="eyebrow mb-5">Contact</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-gold" />28 Wall Street, Financial District, New York, NY 10005</li>
            <li className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-gold" /><a href="tel:+10007882" className="hover:text-gold transition-colors">+1 000 PJTB</a></li>
            <li className="flex gap-3"><Mail className="h-4 w-4 shrink-0 text-gold" /><a href="mailto:contactsupport@pinnaclejtrustbank.online" className="hover:text-gold transition-colors">contactsupport@pinnaclejtrustbank.online</a></li>
          </ul>
        </div>
        <div>
          <h3 className="eyebrow mb-5">Newsletter</h3>
          <p className="text-sm">Insights and updates from Pinnacle J Trust Bank.</p>
          <form onSubmit={onSubmit} noValidate className="mt-4">
            <label htmlFor="nl" className="sr-only">Email address</label>
            <input id="nl" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" aria-invalid={!!error} suppressHydrationWarning
              className="w-full border border-ivory/20 bg-transparent px-4 py-3 text-sm text-ivory placeholder:text-ivory/40 outline-none focus:border-gold" />
            {error && <p className="mt-2 text-xs text-destructive-foreground/90" role="alert">{error}</p>}
            <button type="submit" className="btn-gold mt-3 w-full">Subscribe</button>
          </form>
        </div>
      </div>
      <div className="border-t border-ivory/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-2 px-6 py-6 text-xs text-ivory/50 md:flex-row">
          <span>© {new Date().getFullYear()} Pinnacle J Trust Bank. All rights reserved.</span>
          <span>Pinnacle J Trust Bank is a chartered trust institution authorized and regulated under international financial governance standards.</span>
        </div>
      </div>
    </footer>
  );
}
