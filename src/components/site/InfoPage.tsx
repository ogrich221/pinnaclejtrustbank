import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function PageShell({ children }: { children: ReactNode }) {
  return (<div className="min-h-screen bg-background"><SiteHeader /><main>{children}</main><SiteFooter /></div>);
}

export function InfoPage({ eyebrow, title, intro, items }: { eyebrow: string; title: string; intro: string; items: { title: string; text: string }[] }) {
  return (
    <PageShell>
      <section className="bg-navy-deep px-6 pb-24 pt-16 text-ivory">
        <div className="mx-auto max-w-4xl animate-rise">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 text-5xl md:text-6xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-ivory/70">{intro}</p>
        </div>
      </section>
      <section className="mx-auto -mt-12 grid max-w-6xl gap-px bg-border px-0 md:grid-cols-2 lg:grid-cols-3 shadow-elegant">
        {items.map((i) => (
          <div key={i.title} className="bg-card p-10">
            <div className="mb-5 h-px w-10 bg-gold" />
            <h2 className="text-2xl">{i.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{i.text}</p>
          </div>
        ))}
      </section>
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-4xl">Ready to begin?</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link to="/open-account" className="btn-navy">Open an Account</Link>
          <Link to="/contact" className="btn-gold">Contact Our Team</Link>
        </div>
      </section>
    </PageShell>
  );
}
