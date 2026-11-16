import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/business-banking")({
  head: () => ({
    meta: [
      { title: "Business Banking \u2014 Pinnacle J Trust Bank" },
      { name: "description", content: "Business accounts, payment management, corporate banking solutions, and cash-flow tools for organisations of every size." },
      { property: "og:title", content: "Business Banking \u2014 Pinnacle J Trust Bank" },
      { property: "og:description", content: "Business accounts, payment management, corporate banking solutions, and cash-flow tools for organisations of every size." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BusinessBankingPage,
});

const items = [
  {
    "title": "Business Accounts",
    "text": "Accounts structured around the way your business operates."
  },
  {
    "title": "Payment Management",
    "text": "Organise outgoing and incoming payments in one place."
  },
  {
    "title": "Corporate Solutions",
    "text": "Banking support for growing and established organisations."
  },
  {
    "title": "Cash-Flow Tools",
    "text": "Plan ahead with clear visibility of your cash position."
  },
  {
    "title": "International Banking",
    "text": "International payment information and foreign currency services."
  },
  {
    "title": "Cross-Border Solutions",
    "text": "Support for businesses operating across borders."
  }
];

function BusinessBankingPage() {
  return <InfoPage eyebrow="Business Banking" title="Banking that moves your business forward." intro="Business accounts, payment management, corporate banking solutions, and cash-flow tools for organisations of every size." items={items} />;
}
