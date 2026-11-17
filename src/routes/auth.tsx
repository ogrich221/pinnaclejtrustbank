import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { redirect?: string | undefined } => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Administrator Sign In — Pinnacle J Trust Bank" },
      { name: "description", content: "Authorized administrator access for Pinnacle J Trust Bank." },
      { property: "og:title", content: "Administrator Sign In — Pinnacle J Trust Bank" },
      { property: "og:description", content: "Authorized administrator access for Pinnacle J Trust Bank." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdministratorAuth,
});

function safeDestination(value: string | undefined): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}

function AdministratorAuth() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"sign-in" | "register">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const destination = safeDestination(search.redirect);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user) void navigate({ to: destination, replace: true });
    });
  }, [destination, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    setConfirmed(false);

    if (mode === "register") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      setBusy(false);
      if (error) {
        setNotice(error.message);
        return;
      }
      if (!data.session) {
        setConfirmed(true);
        setNotice("Check your email to confirm the administrator account, then return here and sign in.");
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) {
        setNotice("The administrator username or password is incorrect.");
        return;
      }
    }

    await navigate({ to: destination, replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-deep px-6 py-16 text-ivory">
      <div className="w-full max-w-md">
        <Logo />
        <div className="mt-8 rounded-2xl border border-gold/25 bg-white/[0.04] p-8 shadow-2xl">
          <p className="eyebrow flex items-center gap-2"><Lock className="h-4 w-4" /> Authorized staff only</p>
          <h1 className="mt-4 text-4xl">{mode === "sign-in" ? "Administrator sign in" : "Create administrator access"}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ivory/65">
            A valid administrator username and password are required before any customer approval data can be accessed.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="admin-username" className="text-xs font-semibold uppercase tracking-wider text-ivory/80">Administrator username (email)</label>
              <input
                id="admin-username"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="text-xs font-semibold uppercase tracking-wider text-ivory/80">Password</label>
              <input
                id="admin-password"
                type="password"
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-3 text-sm text-ivory outline-none focus:border-gold"
              />
            </div>
            {notice && (
              <p role={confirmed ? "status" : "alert"} className={`rounded-xl border p-3 text-sm ${confirmed ? "border-gold/30 bg-gold/10 text-gold" : "border-destructive/40 bg-destructive/10 text-destructive-foreground"}`}>
                {notice}
              </p>
            )}
            <button type="submit" disabled={busy} className="btn-gold w-full">
              {busy ? "Verifying…" : mode === "sign-in" ? "Sign in securely" : "Create administrator account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => { setMode(mode === "sign-in" ? "register" : "sign-in"); setNotice(""); }}
            className="mt-5 text-sm text-gold underline-offset-4 hover:underline"
          >
            {mode === "sign-in" ? "First administrator? Create access" : "Already registered? Sign in"}
          </button>
          <div className="mt-6 flex items-start gap-2 border-t border-ivory/10 pt-5 text-xs leading-relaxed text-ivory/55">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            The first verified administrator claims the admin role. Subsequent users need that administrator's credentials.
          </div>
        </div>
        <Link to="/" className="mt-6 inline-block text-sm text-ivory/65 hover:text-gold">← Back to homepage</Link>
      </div>
    </div>
  );
}
