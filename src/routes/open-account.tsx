import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { OpenAccountWizard } from "@/components/onboarding/OpenAccountWizard";

export const Route = createFileRoute("/open-account")({
  head: () => ({
    meta: [
      { title: "Open an Account — Pinnacle J Trust Bank" },
      {
        name: "description",
        content: "Begin your financial journey with Pinnacle J Trust Bank. Secure, modern multi-currency personal and corporate accounts.",
      },
      { property: "og:title", content: "Open an Account — Pinnacle J Trust Bank" },
      {
        property: "og:description",
        content: "Open your Pinnacle J Trust Bank account and experience a smarter, more secure approach to modern banking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OpenAccountPage,
});

function OpenAccountPage() {
  return (
    <div className="min-h-screen bg-[#071426] text-ivory flex flex-col">
      <SiteHeader overlay={false} />
      <main className="flex-1">
        <OpenAccountWizard />
      </main>
      <SiteFooter />
    </div>
  );
}
