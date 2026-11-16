import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions \u2014 Pinnacle J Trust Bank" },
      { name: "description", content: "The full terms and conditions governing our services are being finalised and will be published here." },
      { property: "og:title", content: "Terms and Conditions \u2014 Pinnacle J Trust Bank" },
      { property: "og:description", content: "The full terms and conditions governing our services are being finalised and will be published here." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TermsPage,
});

const items = [
  {
    "title": "Account Terms",
    "text": "Details to be published."
  },
  {
    "title": "Online Banking Terms",
    "text": "Details to be published."
  },
  {
    "title": "Fees and Charges",
    "text": "Details to be published."
  }
];

function TermsPage() {
  return <InfoPage eyebrow="Terms and Conditions" title="Terms and Conditions" intro="The full terms and conditions governing our services are being finalised and will be published here." items={items} />;
}
