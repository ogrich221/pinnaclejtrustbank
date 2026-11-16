import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/personal-banking")({
  head: () => ({
    meta: [
      { title: "Personal Banking \u2014 Pinnacle J Trust Bank" },
      { name: "description", content: "Everyday accounts, savings solutions, convenient transfers, and personal financial management \u2014 designed around you." },
      { property: "og:title", content: "Personal Banking \u2014 Pinnacle J Trust Bank" },
      { property: "og:description", content: "Everyday accounts, savings solutions, convenient transfers, and personal financial management \u2014 designed around you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PersonalBankingPage,
});

const items = [
  {
    "title": "Everyday Accounts",
    "text": "Flexible current accounts for managing daily spending with clarity."
  },
  {
    "title": "Savings Solutions",
    "text": "Set goals and track your progress with simple savings tools."
  },
  {
    "title": "Convenient Transfers",
    "text": "Move money between accounts and to others with ease."
  },
  {
    "title": "Personal Financial Management",
    "text": "Understand your spending with clear insights."
  },
  {
    "title": "Savings and Wealth",
    "text": "Financial planning resources and wealth-building tools."
  },
  {
    "title": "Digital Statements",
    "text": "Access and download your statements whenever you need them."
  }
];

function PersonalBankingPage() {
  return <InfoPage eyebrow="Personal Banking" title="Banking for every chapter of your life." intro="Everyday accounts, savings solutions, convenient transfers, and personal financial management \u2014 designed around you." items={items} />;
}
