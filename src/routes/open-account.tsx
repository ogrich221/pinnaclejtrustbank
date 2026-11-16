import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Check, CheckCircle2, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/site/InfoPage";
import { Field } from "@/components/site/Field";
import { stepSchemas, toErrors, type FieldErrors } from "@/lib/validation";

export const Route = createFileRoute("/open-account")({
  head: () => ({
    meta: [
      { title: "Open an Account — Pinnacle J Trust Bank" },
      { name: "description", content: "Apply for a Pinnacle J Trust Bank personal or business account in a few simple steps." },
      { property: "og:title", content: "Open an Account — Pinnacle J Trust Bank" },
      { property: "og:description", content: "Apply for a personal or business account in a few simple steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OpenAccount,
});

const steps = ["Personal details", "Contact details", "Identity verification", "Review"];
const empty = { accountType: "", firstName: "", lastName: "", dob: "", email: "", phone: "", address: "", country: "", idType: "", idNumber: "", idExpiry: "", consent: false };
const idLabels: Record<string, string> = { passport: "Passport", national_id: "National ID card", drivers_licence: "Driver's licence" };

function OpenAccount() {
  const [step, setStep] = useState(0);
  const [v, setV] = useState(empty);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [done, setDone] = useState<string | null>(null);
  const set = (k: keyof typeof empty) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value });
  const inp = (k: keyof typeof empty, type = "text", ac?: string) => (
    <input id={k} type={type} autoComplete={ac} className="field" value={v[k] as string} onChange={set(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `${k}-err` : undefined} />
  );

  const next = (e: FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      const r = stepSchemas[step].safeParse(v);
      if (!r.success) return setErrors(toErrors(r.error));
      setErrors({}); setStep(step + 1); window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setDone("PJ-" + Math.random().toString(36).slice(2, 8).toUpperCase());
    }
  };

  return (
    <PageShell>
      <section className="bg-navy-deep px-6 pb-16 pt-14 text-ivory">
        <div className="mx-auto max-w-3xl"><p className="eyebrow">Open an Account</p><h1 className="mt-4 text-5xl">Begin your Pinnacle journey.</h1></div>
      </section>
      <section className="mx-auto max-w-3xl px-6 py-16">
        {done ? (
          <div className="border border-gold bg-card p-12 text-center shadow-elegant" role="status">
            <CheckCircle2 strokeWidth={1.2} className="mx-auto h-16 w-16 text-gold" />
            <h2 className="mt-6 text-4xl">Application received</h2>
            <p className="mt-4 text-muted-foreground">Thank you, {v.firstName}. Your reference is <strong className="text-navy">{done}</strong>.<br />Our team will review your identity documents and contact you at {v.email}.</p>
            <Link to="/" className="btn-navy mt-8">Return Home</Link>
          </div>
        ) : (
          <>
            <ol className="mb-12 grid grid-cols-4 gap-2" aria-label="Application progress">
              {steps.map((s, i) => (
                <li key={s} className="text-center" aria-current={i === step ? "step" : undefined}>
                  <span className={`mx-auto flex h-9 w-9 items-center justify-center border text-sm ${i < step ? "border-gold bg-gold text-navy-deep" : i === step ? "border-navy bg-navy text-ivory" : "border-border text-muted-foreground"}`}>
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className="mt-2 hidden text-xs text-muted-foreground sm:block">{s}</span>
                </li>
              ))}
            </ol>
            <form onSubmit={next} noValidate className="space-y-6 border border-border bg-card p-8 shadow-elegant md:p-10">
              <h2 className="text-3xl">{steps[step]}</h2>
              {step === 0 && (<>
                <Field id="accountType" label="Account type" error={errors.accountType}>
                  <div className="grid grid-cols-2 gap-3" role="radiogroup">
                    {(["personal", "business"] as const).map((t) => (
                      <button type="button" role="radio" aria-checked={v.accountType === t} key={t} onClick={() => setV({ ...v, accountType: t })}
                        className={`border p-4 text-left capitalize transition-colors ${v.accountType === t ? "border-gold bg-gold/10" : "border-input hover:border-navy"}`}>{t} account</button>
                    ))}
                  </div>
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="firstName" label="First name" error={errors.firstName}>{inp("firstName", "text", "given-name")}</Field>
                  <Field id="lastName" label="Last name" error={errors.lastName}>{inp("lastName", "text", "family-name")}</Field>
                </div>
                <Field id="dob" label="Date of birth" error={errors.dob}>{inp("dob", "date", "bday")}</Field>
              </>)}
              {step === 1 && (<>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="email" label="Email" error={errors.email}>{inp("email", "email", "email")}</Field>
                  <Field id="phone" label="Phone" error={errors.phone}>{inp("phone", "tel", "tel")}</Field>
                </div>
                <Field id="address" label="Residential address" error={errors.address}>{inp("address", "text", "street-address")}</Field>
                <Field id="country" label="Country of residence" error={errors.country}>{inp("country", "text", "country-name")}</Field>
              </>)}
              {step === 2 && (<>
                <p className="flex gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-5 w-5 shrink-0 text-gold" />We need to verify your identity before an account can be opened. Please provide a valid government-issued document.</p>
                <Field id="idType" label="Identity document" error={errors.idType}>
                  <select id="idType" className="field" value={v.idType} onChange={set("idType")} aria-invalid={!!errors.idType}>
                    <option value="">Select a document</option>
                    {Object.entries(idLabels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field id="idNumber" label="Document number" error={errors.idNumber}>{inp("idNumber")}</Field>
                  <Field id="idExpiry" label="Expiry date" error={errors.idExpiry}>{inp("idExpiry", "date")}</Field>
                </div>
                <Field id="consent" label="Declaration" error={errors.consent}>
                  <label className="flex items-start gap-3 text-sm">
                    <input id="consent" type="checkbox" className="mt-1 accent-gold" checked={v.consent} onChange={(e) => setV({ ...v, consent: e.target.checked })} />
                    I confirm the information provided is accurate and I consent to identity verification checks.
                  </label>
                </Field>
              </>)}
              {step === 3 && (
                <dl className="divide-y divide-border text-sm">
                  {[["Account type", v.accountType], ["Name", `${v.firstName} ${v.lastName}`], ["Date of birth", v.dob], ["Email", v.email], ["Phone", v.phone], ["Address", `${v.address}, ${v.country}`], ["Identity document", `${idLabels[v.idType]} · ${v.idNumber}`]].map(([k, val]) => (
                    <div key={k} className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium capitalize">{val}</dd></div>
                  ))}
                </dl>
              )}
              <div className="flex justify-between gap-4 pt-4">
                {step > 0 ? <button type="button" onClick={() => { setErrors({}); setStep(step - 1); }} className="text-xs font-semibold tracking-[0.2em] text-navy hover:text-gold">← BACK</button> : <span />}
                <button type="submit" className="btn-navy">{step === 3 ? "Submit Application" : "Continue"}</button>
              </div>
            </form>
            <p className="mt-6 text-center text-sm text-muted-foreground">Already a customer? <Link to="/login" className="font-semibold text-navy hover:underline">Login</Link></p>
          </>
        )}
      </section>
    </PageShell>
  );
}
