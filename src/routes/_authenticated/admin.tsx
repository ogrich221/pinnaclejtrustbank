import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AdminDataProvider } from "@/components/admin/AdminDataContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { BankLoadingScreen } from "@/components/site/BankLoadingScreen";
import { ensureAdminAccess } from "@/lib/account-applications.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administrative Command Centre — Pinnacle J Trust Bank" },
      { name: "description", content: "Secure management dashboard for Pinnacle J Trust Bank authorized staff." },
      { property: "og:title", content: "Administrative Command Centre — Pinnacle J Trust Bank" },
      { property: "og:description", content: "Secure management dashboard for authorized bank administrators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const verifyAccess = useServerFn(ensureAdminAccess);
  const [access, setAccess] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let active = true;
    void verifyAccess()
      .then((result) => { if (active) setAccess(result.allowed ? "allowed" : "denied"); })
      .catch(() => { if (active) setAccess("denied"); });
    return () => { active = false; };
  }, [verifyAccess]);

  if (access === "loading") {
    return <BankLoadingScreen message="ADMINISTRATOR ACCESS" subtext="Verifying administrator credentials..." />;
  }

  if (access === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep px-6 text-ivory">
        <div className="w-full max-w-md rounded-2xl border border-gold/30 bg-white/[0.04] p-8 text-center">
          <h1 className="text-3xl">Administrator access required</h1>
          <p className="mt-4 text-sm leading-relaxed text-ivory/70">This signed-in account does not have permission to view customer applications.</p>
          <button
            type="button"
            onClick={async () => {
              await supabase.auth.signOut();
              await navigate({ to: "/auth", replace: true });
            }}
            className="btn-gold mt-6"
          >
            Sign out
          </button>
          <Link to="/" className="mt-5 block text-sm text-ivory/70 hover:text-gold">Return home</Link>
        </div>
      </div>
    );
  }

  return (
    <AdminDataProvider>
      <AdminLayout />
    </AdminDataProvider>
  );
}
