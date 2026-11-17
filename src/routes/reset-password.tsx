import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Choose a New Password — Pinnacle J Trust Bank" },
      { name: "description", content: "Choose a new customer online banking password using your secure recovery link." },
      { property: "og:title", content: "Choose a New Password — Pinnacle J Trust Bank" },
      { property: "og:description", content: "Choose a new customer online banking password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [validLink, setValidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setValidLink(window.location.hash.includes("type=recovery"));
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setNotice("");
    if (password.length < 8) {
      setNotice("Your new password must contain at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      setNotice("The password entries do not match.");
      return;
    }

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) {
      setNotice("This recovery link is invalid or has expired. Request a new link.");
      return;
    }
    await supabase.auth.signOut();
    await navigate({ to: "/login", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-deep px-6 py-16 text-ivory">
      <div className="w-full max-w-md">
        <Logo />
        <div className="mt-8 rounded-2xl border border-gold/25 bg-white/[0.04] p-8 shadow-2xl">
          <KeyRound className="h-8 w-8 text-gold" />
          <h1 className="mt-5 text-4xl">Choose a new password</h1>
          {validLink ? (
            <form onSubmit={submit} className="mt-8 space-y-5">
              <div>
                <label htmlFor="new-password" className="text-xs font-semibold uppercase tracking-wider text-ivory/80">New password</label>
                <input id="new-password" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-3 text-sm text-ivory outline-none focus:border-gold" />
              </div>
              <div>
                <label htmlFor="confirm-new-password" className="text-xs font-semibold uppercase tracking-wider text-ivory/80">Confirm new password</label>
                <input id="confirm-new-password" type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-3 text-sm text-ivory outline-none focus:border-gold" />
              </div>
              {notice && <p role="alert" className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">{notice}</p>}
              <button type="submit" disabled={busy} className="btn-gold w-full">{busy ? "Updating…" : "Update password"}</button>
            </form>
          ) : (
            <div className="mt-6">
              <p className="text-sm leading-relaxed text-ivory/70">This password recovery link is invalid or incomplete. Request a new secure link to continue.</p>
              <Link to="/forgot-password" className="btn-gold mt-6 w-full">Request a new link</Link>
            </div>
          )}
          <Link to="/login" className="mt-6 inline-block text-sm text-ivory/65 hover:text-gold">← Back to customer sign in</Link>
        </div>
      </div>
    </div>
  );
}
