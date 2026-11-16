import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck, HeartHandshake, Cpu, User, Briefcase, PiggyBank, Globe2, Smartphone, ArrowRight,
  KeyRound, Fingerprint, BellRing, Activity, EyeOff, Headset, ArrowUpRight, ArrowDownLeft,
} from "lucide-react";
import hero from "@/assets/hq-hero.jpg";
import sunset from "@/assets/hq-sunset.jpg";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pinnacle J Trust Bank — Your Financial Future. Our Pinnacle." },
      { name: "description", content: "Secure, intelligent and seamless personal, business, international and digital banking from Pinnacle J Trust Bank." },
      { property: "og:title", content: "Pinnacle J Trust Bank — Premium Digital Banking" },
      { property: "og:description", content: "Experience a higher standard of banking with Pinnacle J Trust Bank." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const trust = [
  { I: ShieldCheck, t: "Financial Security", d: "Careful stewardship of your finances, guided by prudent and responsible banking practices." },
  { I: HeartHandshake, t: "Customer Commitment", d: "Every relationship is built on respect, clarity, and genuinely attentive service." },
  { I: Cpu, t: "Digital Innovation", d: "Thoughtfully designed digital tools that make everyday banking effortless." },
];
const services = [
  { I: User, t: "Personal Banking", d: "Everyday accounts, savings solutions, convenient transfers, and personal financial management.", to: "/personal-banking" },
  { I: Briefcase, t: "Business Banking", d: "Business accounts, payment management, corporate banking solutions, and cash-flow tools.", to: "/business-banking" },
  { I: PiggyBank, t: "Savings and Wealth", d: "Savings management, financial planning resources, and wealth-building tools.", to: "/personal-banking" },
  { I: Globe2, t: "International Banking", d: "International payment information, foreign currency services, and cross-border banking solutions.", to: "/business-banking" },
  { I: Smartphone, t: "Digital Banking", d: "Convenient account access, transaction monitoring, digital statements, and secure online banking.", to: "/digital-banking" },
] as const;
const security = [
  { I: KeyRound, t: "Secure authentication" }, { I: Fingerprint, t: "Multi-factor authentication" },
  { I: BellRing, t: "Transaction notifications" }, { I: Activity, t: "Account activity monitoring" },
  { I: EyeOff, t: "Privacy-focused account management" }, { I: Headset, t: "Dedicated customer support" },
];
const why = [
  ["01", "Customer First", "Banking experiences designed around customer needs."],
  ["02", "Modern Technology", "Intuitive digital tools and convenient banking experiences."],
  ["03", "Transparency", "Clear communication and straightforward financial services."],
  ["04", "Reliable Support", "Professional assistance whenever customers need guidance."],
];
const tx = [
  { n: "Sample Grocery Store", a: "-84.20", out: true }, { n: "Sample Salary Credit", a: "+3,200.00", out: false },
  { n: "Sample Utility Bill", a: "-126.45", out: true }, { n: "Sample Transfer In", a: "+250.00", out: false },
];

function Index() {
  return (
    <div className="bg-background">
      {/* HERO */}
      <section className="relative min-h-[100svh] overflow-hidden bg-navy-deep">
        <img src={hero} alt="Pinnacle J Trust Bank headquarters tower at dusk with its illuminated logo on the facade" width={1920} height={1088}
          className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-overlay-side" />
        <SiteHeader overlay />
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl items-center px-6 pt-24">
          <div className="max-w-2xl animate-rise">
            <p className="eyebrow">Pinnacle J Trust Bank</p>
            <h1 className="mt-6 text-5xl leading-[1.02] text-ivory sm:text-6xl lg:text-7xl">
              Your Financial Future.<br /><em className="text-gold">Our Pinnacle.</em>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ivory/75">
              Experience a higher standard of banking. Discover secure, intelligent, and seamless financial solutions designed to move you forward.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/open-account" className="btn-gold">Open an Account <ArrowRight className="h-4 w-4" /></Link>
              <a href="#services" className="btn-outline-light">Explore Our Services</a>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Our Foundation</p>
          <h2 className="mt-4 text-4xl md:text-5xl">Built on Trust. Driven by Excellence.</h2>
          <p className="mt-6 text-muted-foreground">At Pinnacle J Trust Bank, we believe banking should be built around confidence, transparency, and exceptional service.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {trust.map(({ I, t, d }) => (
            <div key={t} className="group border border-border bg-card p-10 transition-all duration-500 hover:-translate-y-1 hover:border-gold hover:shadow-elegant">
              <I strokeWidth={1.2} className="h-10 w-10 text-gold transition-transform duration-500 group-hover:scale-110" />
              <h3 className="mt-8 text-2xl">{t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-8 bg-silver py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div><p className="eyebrow">Our Services</p><h2 className="mt-4 text-4xl md:text-5xl">Banking Designed Around You.</h2></div>
          </div>
          <div className="mt-14 grid gap-px bg-border md:grid-cols-2 lg:grid-cols-5">
            {services.map(({ I, t, d, to }) => (
              <div key={t} className="group flex flex-col bg-card p-8 transition-colors duration-500 hover:bg-navy">
                <I strokeWidth={1.2} className="h-9 w-9 text-gold" />
                <h3 className="mt-8 text-xl uppercase tracking-wide group-hover:text-ivory">{t}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground group-hover:text-ivory/70">{d}</p>
                <Link to={to} className="mt-8 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-navy group-hover:text-gold">LEARN MORE <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIGITAL */}
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-28 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="eyebrow">Digital Banking</p>
          <h2 className="mt-4 text-4xl md:text-5xl">Your Bank. Always Within Reach.</h2>
          <p className="mt-6 text-muted-foreground">Manage your financial life with a seamless digital banking experience designed for convenience, clarity, and control.</p>
          <Link to="/digital-banking" className="btn-navy mt-10">Explore Digital Banking</Link>
        </div>
        <DeviceShowcase />
      </section>

      {/* SECURITY */}
      <section className="relative overflow-hidden bg-navy-deep py-28 text-ivory">
        <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full border border-gold/20" />
        <div className="pointer-events-none absolute -right-20 top-20 h-[360px] w-[360px] rounded-full border border-gold/10" />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="max-w-2xl">
            <p className="eyebrow">Security</p>
            <h2 className="mt-4 text-4xl md:text-5xl">Your Security Is Our Priority.</h2>
            <p className="mt-6 text-ivory/70">Confidence begins with knowing your financial information deserves careful protection.</p>
          </div>
          <div className="mt-16 grid gap-px bg-ivory/10 sm:grid-cols-2 lg:grid-cols-3">
            {security.map(({ I, t }) => (
              <div key={t} className="flex items-center gap-5 bg-navy-deep p-8 transition-colors hover:bg-navy">
                <I strokeWidth={1.2} className="h-8 w-8 shrink-0 text-gold" /><span className="font-display text-xl">{t}</span>
              </div>
            ))}
          </div>
          <Link to="/security" className="mt-10 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-gold hover:text-gold-soft">SECURITY INFORMATION <ArrowRight className="h-3.5 w-3.5" /></Link>
        </div>
      </section>

      {/* WHY */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <p className="eyebrow">The Pinnacle Difference</p>
        <h2 className="mt-4 text-4xl md:text-5xl">Why Choose Pinnacle J Trust Bank?</h2>
        <div className="mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {why.map(([n, t, d]) => (
            <div key={n} className="group border-t border-border pt-8 transition-colors hover:border-gold">
              <span className="font-display text-6xl text-gold/70 transition-colors group-hover:text-gold">{n}</span>
              <h3 className="mt-6 font-sans text-sm font-semibold tracking-[0.2em] uppercase">{t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <img src={sunset} alt="Pinnacle J Trust Bank tower at sunset with PJ monogram on its crown" loading="lazy" width={1920} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-overlay-navy" />
        <div className="relative mx-auto max-w-3xl px-6 py-40 text-center text-ivory">
          <h2 className="text-5xl md:text-6xl">Rise Above Ordinary Banking.</h2>
          <p className="mt-6 text-lg text-ivory/80">Take the next step towards a smarter financial experience with Pinnacle J Trust Bank.</p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
            <Link to="/open-account" className="btn-gold">Get Started</Link>
            <Link to="/contact" className="text-xs font-semibold tracking-[0.2em] text-ivory underline-offset-8 hover:text-gold hover:underline">CONTACT OUR TEAM</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function DeviceShowcase() {
  return (
    <div className="relative pb-10" aria-label="Demonstration of the online banking dashboard using sample data">
      {/* Laptop */}
      <div className="rounded-t-xl border-[10px] border-b-0 border-navy-deep bg-navy-deep shadow-elegant">
        <div className="bg-background p-5 text-[11px]">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-display text-base font-semibold">Dashboard</span>
            <span className="bg-gold/15 px-2 py-1 text-[9px] font-semibold tracking-widest text-navy">DEMO · SAMPLE DATA</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 bg-navy p-4 text-ivory">
              <p className="text-ivory/60">Sample Current Account</p>
              <p className="mt-1 font-display text-2xl">$12,480.00</p>
              <div className="mt-3 flex gap-2">{["Transfer", "Pay", "Statements"].map((b) => <span key={b} className="border border-gold/50 px-2 py-1 text-gold">{b}</span>)}</div>
            </div>
            <div className="bg-silver p-4">
              <p className="text-muted-foreground">Sample Savings</p>
              <p className="mt-1 font-display text-xl">$8,200</p>
              <div className="mt-3 h-1.5 bg-border"><div className="h-full w-2/3 bg-gold" /></div>
              <p className="mt-1 text-muted-foreground">66% of goal</p>
            </div>
          </div>
          <p className="mb-2 mt-4 font-semibold">Recent activity (sample)</p>
          <ul className="divide-y divide-border">
            {tx.map((t) => (
              <li key={t.n} className="flex items-center justify-between py-2">
                <span className="flex items-center gap-2">{t.out ? <ArrowUpRight className="h-3 w-3 text-muted-foreground" /> : <ArrowDownLeft className="h-3 w-3 text-gold" />}{t.n}</span>
                <span className={t.out ? "" : "text-gold"}>{t.a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mx-[-4%] h-3 rounded-b-xl bg-navy" />
      {/* Phone */}
      <div className="absolute -bottom-2 -right-2 w-[34%] min-w-[140px] rounded-[1.6rem] border-[6px] border-navy-deep bg-navy-deep shadow-elegant sm:right-0">
        <div className="rounded-[1.2rem] bg-navy p-3 text-[9px] text-ivory">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-ivory/20" />
          <p className="text-ivory/60">Sample balance</p>
          <p className="font-display text-lg">$12,480.00</p>
          <div className="my-3 grid grid-cols-3 gap-1 text-center">{["Send", "Pay", "Save"].map((b) => <span key={b} className="bg-ivory/10 py-1.5 text-gold">{b}</span>)}</div>
          <p className="flex items-center gap-1 text-ivory/60"><ShieldCheck className="h-3 w-3 text-gold" /> Secure session</p>
          <ul className="mt-2 space-y-1.5">{tx.slice(0, 3).map((t) => <li key={t.n} className="flex justify-between"><span className="truncate">{t.n.replace("Sample ", "")}</span><span>{t.a}</span></li>)}</ul>
          <p className="mt-3 text-center text-[8px] tracking-widest text-gold">DEMO DATA</p>
        </div>
      </div>
    </div>
  );
}
