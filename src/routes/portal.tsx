import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CustomerDashboard } from "@/components/portal/CustomerDashboard";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentCustomerApplication } from "@/lib/account-applications.functions";
import type { SharedCustomer } from "@/lib/account-applications";

export const Route = createFileRoute("/portal")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Online Banking Portal — Pinnacle J Trust Bank" },
      {
        name: "description",
        content: "Secure personal online banking dashboard for Pinnacle J Trust Bank account holders.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PortalPage,
});

function PortalPage() {
  const navigate = useNavigate();
  const fetchCurrentApplication = useServerFn(getCurrentCustomerApplication);
  const [customer, setCustomer] = useState<SharedCustomer | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    const checkAccess = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          await navigate({ to: "/login", search: { redirect: "/portal" }, replace: true });
          return;
        }
        const application = await fetchCurrentApplication();
        if (!active) return;
        if (!application?.canAccess) {
          const reason = application?.approvalStatus ?? "Unavailable";
          await supabase.auth.signOut();
          await navigate({ to: "/login", search: { redirect: "/portal", reason }, replace: true });
          return;
        }
        setCustomer(application);
      } catch {
        if (active) {
          await navigate({ to: "/login", search: { redirect: "/portal" }, replace: true });
        }
      }
    };
    void checkAccess();
    return () => { active = false; };
  }, [fetchCurrentApplication, navigate]);

  if (!customer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-deep text-sm tracking-wide text-gold">
        Verifying secure account access…
      </div>
    );
  }

  return <CustomerDashboard initialCustomer={customer} />;
}
