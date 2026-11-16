import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import { PageShell } from "@/components/site/InfoPage";
import { Field } from "@/components/site/Field";
import { contactSchema, toErrors, type FieldErrors } from "@/lib/validation";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Pinnacle J Trust Bank" },
      { name: "description", content: "Get in touch with the Pinnacle J Trust Bank team." },
      { property: "og:title", content: "Contact — Pinnacle J Trust Bank" },
      { property: "og:description", content: "Get in touch with the Pinnacle J Trust Bank team." },
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
        <div className="mx-auto max-w-3xl animate-rise"><p className="eyebrow">Contact</p><h1 className="mt-4 text-5xl md:text-6xl">Speak with our team.</h1>
          <p className="mt-6 text-ivory/70">Send us a message and a member of our team will be in touch.</p></div>
      </section>
      <section className="mx-auto max-w-2xl px-6 py-20">
        {sent ? (
          <div className="border border-gold bg-card p-12 text-center shadow-elegant" role="status">
            <CheckCircle2 strokeWidth={1.2} className="mx-auto h-14 w-14 text-gold" />
            <h2 className="mt-6 text-3xl">Thank you, {v.name.split(" ")[0]}.</h2>
            <p className="mt-3 text-muted-foreground">Your message has been received. We'll reply to {v.email}.</p>
            <button className="btn-navy mt-8" onClick={() => { setSent(false); setV({ name: "", email: "", subject: "", message: "" }); }}>Send another message</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="name" label="Full name" error={errors.name}><input id="name" className="field" value={v.name} onChange={set("name")} aria-invalid={!!errors.name} /></Field>
              <Field id="email" label="Email" error={errors.email}><input id="email" type="email" className="field" value={v.email} onChange={set("email")} aria-invalid={!!errors.email} /></Field>
            </div>
            <Field id="subject" label="Subject" error={errors.subject}><input id="subject" className="field" value={v.subject} onChange={set("subject")} aria-invalid={!!errors.subject} /></Field>
            <Field id="message" label="Message" error={errors.message}><textarea id="message" rows={6} className="field" value={v.message} onChange={set("message")} aria-invalid={!!errors.message} /></Field>
            <button type="submit" className="btn-navy w-full">Send Message</button>
          </form>
        )}
      </section>
    </PageShell>
  );
}
