import { createFileRoute } from "@tanstack/react-router";
import { CustomerDashboard } from "@/components/portal/CustomerDashboard";

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
  component: CustomerDashboard,
});
