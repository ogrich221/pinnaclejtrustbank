import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy \u2014 Pinnacle J Trust Bank" },
      { name: "description", content: "Our full privacy policy is being finalised and will be published here. It will explain how personal information is collected, used, and protected." },
      { property: "og:title", content: "Privacy Policy \u2014 Pinnacle J Trust Bank" },
      { property: "og:description", content: "Our full privacy policy is being finalised and will be published here. It will explain how personal information is collected, used, and protected." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

const items = [
  {
    "title": "Information We Collect",
    "text": "Details to be published."
  },
  {
    "title": "How We Use Information",
    "text": "Details to be published."
  },
  {
    "title": "Your Rights",
    "text": "Details to be published."
  }
];

function PrivacyPage() {
  return <InfoPage eyebrow="Privacy Policy" title="Privacy Policy" intro="Our full privacy policy is being finalised and will be published here. It will explain how personal information is collected, used, and protected." items={items} />;
}
