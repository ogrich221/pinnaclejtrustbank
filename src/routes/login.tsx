import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import hero from "@/assets/hq-hero.jpg";
import { Logo } from "@/components/site/Logo";
import { Field } from "@/components/site/Field";
import { loginSchema, toErrors, type FieldErrors } from "@/lib/validation";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Secure Login — Pinnacle J Trust Bank" },
      { name: "description", content: "Sign in to Pinnacle J Trust Bank online banking." },
      { property: "og:title", content: "Secure Login — Pinnacle J Trust Bank" },
      { property: "og:description", content: "Sign in to Pinnacle J Trust Bank online banking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [v, setV] = useState({ username: "", password: "" });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setNotice("");
    const r = loginSchema.safeParse(v);
    if (!r.success) return setErrors(toErrors(r.error));
    setErrors({}); setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setNotice("Online banking sign-in is not yet available. No account was found for these details — please open an account or contact our team.");
    }, 700);
  };
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <img src={hero} alt="" className="absolute inset-0 h-full w-full object-cover object-[75%_center]" />
        <div className="absolute inset-0 bg-overlay-navy" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div className="text-ivory"><h2 className="text-5xl">Welcome back.</h2><p className="mt-4 max-w-md text-ivory/70">Access your accounts through a protected online banking session.</p></div>
        </div>
      </div>
      <div className="flex flex-col bg-background">
        <div className="bg-navy-deep p-6 lg:hidden"><Logo /></div>
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-md animate-rise">
            <p className="eyebrow flex items-center gap-2"><Lock className="h-3.5 w-3.5" /> Secure Login</p>
            <h1 className="mt-4 text-4xl">Sign in to online banking</h1>
            {notice && (
              <div role="alert" className="mt-6 flex gap-3 border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                <AlertCircle className="h-5 w-5 shrink-0" />{notice}
              </div>
            )}
            <form onSubmit={submit} noValidate className="mt-8 space-y-6">
              <Field id="username" label="Username or customer ID" error={errors.username}>
                <input id="username" autoComplete="username" className="field" value={v.username} onChange={(e) => setV({ ...v, username: e.target.value })} aria-invalid={!!errors.username} />
              </Field>
              <Field id="password" label="Password" error={errors.password}>
                <div className="relative">
                  <input id="password" type={show ? "text" : "password"} autoComplete="current-password" className="field pr-12" value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} aria-invalid={!!errors.password} />
                  <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>
              <button type="submit" disabled={busy} className="btn-navy w-full">{busy ? "Verifying…" : "Sign In"}</button>
            </form>
            <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-gold" /> Never share your password or verification codes with anyone.</p>
            <p className="mt-8 text-sm text-muted-foreground">New to Pinnacle J? <Link to="/open-account" className="font-semibold text-navy underline-offset-4 hover:underline">Open an account</Link></p>
            <Link to="/" className="mt-3 inline-block text-sm text-muted-foreground hover:text-navy">← Back to home</Link>
            <div className="mt-8 border-t border-border/80 pt-4">
              <Link to="/admin" className="text-xs font-semibold text-gold tracking-wide hover:underline flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-gold" /> Authorized Staff? Access Admin Command Centre →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
