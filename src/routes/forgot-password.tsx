import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Customer Password — Pinnacle J Trust Bank" },
      { name: "description", content: "Request a secure Pinnacle J Trust Bank customer password reset link." },
      { property: "og:title", content: "Reset Customer Password — Pinnacle J Trust Bank" },
      { property: "og:description", content: "Request a secure customer password reset link." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      setNotice("We couldn't send the reset link right now. Please try again shortly.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-deep px-6 py-16 text-ivory">
      <div className="w-full max-w-md">
        <Logo />
        <div className="mt-8 rounded-2xl border border-gold/25 bg-white/[0.04] p-8 shadow-2xl">
          <Mail className="h-8 w-8 text-gold" />
          <h1 className="mt-5 text-4xl">Reset your password</h1>
          <p className="mt-3 text-sm leading-relaxed text-ivory/65">Enter the email used for your online banking account. We will send a secure reset link if an account exists.</p>
          {submitted ? (
            <div role="status" className="mt-8 rounded-xl border border-gold/30 bg-gold/10 p-5">
              <ShieldCheck className="h-5 w-5 text-gold" />
              <p className="mt-3 text-sm leading-relaxed text-ivory/85">If an account matches that email, a reset link is on its way. Check your inbox and spam folder.</p>
              <Link to="/login" className="btn-gold mt-6 w-full">Return to sign in</Link>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-8">
              <label htmlFor="recovery-email" className="text-xs font-semibold uppercase tracking-wider text-ivory/80">Account email</label>
              <input
                id="recovery-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
              />
              {notice && <p role="alert" className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">{notice}</p>}
              <button type="submit" disabled={busy} className="btn-gold mt-6 w-full">{busy ? "Sending…" : "Send secure reset link"}</button>
            </form>
          )}
          <Link to="/login" className="mt-6 inline-block text-sm text-ivory/65 hover:text-gold">← Back to customer sign in</Link>
        </div>
      </div>
    </div>
  );
}
