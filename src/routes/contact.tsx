import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Mail, Phone, MapPin, Clock, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/site/InfoPage";
import { Field } from "@/components/site/Field";
import { contactSchema, toErrors, type FieldErrors } from "@/lib/validation";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Pinnacle J Trust Bank" },
      { name: "description", content: "Get in touch with the Pinnacle J Trust Bank team. Direct support at contactsupport@pinnaclejtrustbank.online." },
      { property: "og:title", content: "Contact — Pinnacle J Trust Bank" },
      { property: "og:description", content: "Get in touch with the Pinnacle J Trust Bank team. Direct support at contactsupport@pinnaclejtrustbank.online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [v, setV] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sent, setSent] = useState(false);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value });
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = contactSchema.safeParse(v);
    if (!r.success) return setErrors(toErrors(r.error));
    setErrors({}); setSent(true);
  };
  return (
    <PageShell>
      <section className="bg-navy-deep px-6 pb-20 pt-16 text-ivory">
        <div className="mx-auto max-w-4xl animate-rise text-center">
          <p className="eyebrow">Client Services & Support</p>
          <h1 className="mt-4 text-5xl md:text-6xl font-display font-semibold">Speak with our team.</h1>
          <p className="mt-6 text-ivory/70 max-w-2xl mx-auto text-base">
            Whether you require assistance with private wealth transfers, account management, or institutional clearing, our dedicated advisory team is available 24/7.
          </p>
        </div>
      </section>

      {/* Direct Contact Channels Cards */}
      <section className="mx-auto max-w-5xl px-6 -mt-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gold/30 bg-[#0E2140] p-6 shadow-xl backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 border border-gold/30 text-gold mb-4">
              <Mail className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-gold">Official Support Email</p>
            <a
              href="mailto:contactsupport@pinnaclejtrustbank.online"
              className="mt-1.5 block font-semibold text-sm text-ivory hover:text-gold transition-colors break-all"
            >
              contactsupport@pinnaclejtrustbank.online
            </a>
            <p className="mt-1 text-xs text-ivory/50">Guaranteed encrypted priority response</p>
          </div>

          <div className="rounded-2xl border border-ivory/15 bg-[#0E2140] p-6 shadow-xl backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ivory/10 border border-ivory/20 text-gold mb-4">
              <Phone className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-gold">Private Client Desk</p>
            <a
              href="tel:+12125550199"
              className="mt-1.5 block font-semibold text-sm text-ivory hover:text-gold transition-colors"
            >
              +1 (212) 555-0199
            </a>
            <p className="mt-1 text-xs text-ivory/50">Direct executive telephone hotline</p>
          </div>

          <div className="rounded-2xl border border-ivory/15 bg-[#0E2140] p-6 shadow-xl backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ivory/10 border border-ivory/20 text-gold mb-4">
              <MapPin className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-gold">Global Headquarters</p>
            <p className="mt-1.5 font-semibold text-sm text-ivory">
              28 Wall Street
            </p>
            <p className="mt-1 text-xs text-ivory/50">Financial District, New York, NY 10005</p>
          </div>

          <div className="rounded-2xl border border-ivory/15 bg-[#0E2140] p-6 shadow-xl backdrop-blur-md">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ivory/10 border border-ivory/20 text-gold mb-4">
              <Clock className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-gold">Operations Schedule</p>
            <p className="mt-1.5 font-semibold text-sm text-ivory">
              24/7 Global Clearing
            </p>
            <p className="mt-1 text-xs text-ivory/50">Continuous live advisory coverage</p>
          </div>
        </div>
      </section>

      {/* Message Form Section */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        {sent ? (
          <div className="border border-gold bg-card p-12 text-center shadow-elegant rounded-2xl" role="status">
            <CheckCircle2 strokeWidth={1.2} className="mx-auto h-14 w-14 text-gold" />
            <h2 className="mt-6 text-3xl font-display font-semibold">Thank you, {v.name.split(" ")[0]}.</h2>
            <p className="mt-3 text-muted-foreground text-sm">
              Your inquiry has been logged. Our client relations desk will review and reply to <strong>{v.email}</strong>.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              For urgent or institutional matters, you can also email us directly at{" "}
              <a href="mailto:contactsupport@pinnaclejtrustbank.online" className="text-gold underline font-medium">
                contactsupport@pinnaclejtrustbank.online
              </a>.
            </p>
            <button className="btn-navy mt-8" onClick={() => { setSent(false); setV({ name: "", email: "", subject: "", message: "" }); }}>Send another message</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-6 rounded-2xl border border-ivory/10 bg-card p-8 sm:p-10 shadow-lg">
            <div className="border-b border-ivory/10 pb-4">
              <h2 className="text-2xl font-display font-semibold">Send Secure Message</h2>
              <p className="text-xs text-muted-foreground mt-1">
                You may also reach out directly via email to{" "}
                <a href="mailto:contactsupport@pinnaclejtrustbank.online" className="text-gold font-medium hover:underline">
                  contactsupport@pinnaclejtrustbank.online
                </a>.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="name" label="Full name" error={errors.name}><input id="name" className="field" value={v.name} onChange={set("name")} aria-invalid={!!errors.name} /></Field>
              <Field id="email" label="Email" error={errors.email}><input id="email" type="email" className="field" value={v.email} onChange={set("email")} aria-invalid={!!errors.email} /></Field>
            </div>
            <Field id="subject" label="Subject" error={errors.subject}><input id="subject" className="field" value={v.subject} onChange={set("subject")} aria-invalid={!!errors.subject} /></Field>
            <Field id="message" label="Message" error={errors.message}><textarea id="message" rows={6} className="field" value={v.message} onChange={set("message")} aria-invalid={!!errors.message} /></Field>
            <button type="submit" className="btn-navy w-full py-3.5 text-sm font-semibold">Send Secure Inquiry</button>
          </form>
        )}
      </section>
    </PageShell>
  );
}
