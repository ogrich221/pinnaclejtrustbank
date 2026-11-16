import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/digital-banking")({
  head: () => ({
    meta: [
      { title: "Digital Banking \u2014 Pinnacle J Trust Bank" },
      { name: "description", content: "Convenient account access, transaction monitoring, digital statements, and secure online banking on any device." },
      { property: "og:title", content: "Digital Banking \u2014 Pinnacle J Trust Bank" },
      { property: "og:description", content: "Convenient account access, transaction monitoring, digital statements, and secure online banking on any device." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DigitalBankingPage,
});

const items = [
  {
    "title": "Account Access",
    "text": "View your accounts securely from desktop or mobile."
  },
  {
    "title": "Transaction Monitoring",
    "text": "Keep track of account activity as it happens."
  },
  {
    "title": "Digital Statements",
    "text": "Paperless statements, available whenever you need them."
  },
  {
    "title": "Transfers and Payments",
    "text": "Intuitive navigation for paying and moving money."
  },
  {
    "title": "Savings Overview",
    "text": "See your savings progress at a glance."
  },
  {
    "title": "Secure Sign-In",
    "text": "Protected access to your online banking."
  }
];

function DigitalBankingPage() {
  return <InfoPage eyebrow="Digital Banking" title="Your bank. Always within reach." intro="Convenient account access, transaction monitoring, digital statements, and secure online banking on any device." items={items} />;
}
