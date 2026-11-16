import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us \u2014 Pinnacle J Trust Bank" },
      { name: "description", content: "Pinnacle J Trust Bank is built on the belief that banking should be grounded in confidence, transparency, and exceptional service." },
      { property: "og:title", content: "About Us \u2014 Pinnacle J Trust Bank" },
      { property: "og:description", content: "Pinnacle J Trust Bank is built on the belief that banking should be grounded in confidence, transparency, and exceptional service." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

const items = [
  {
    "title": "Our Purpose",
    "text": "To help customers move forward with secure, intelligent financial solutions."
  },
  {
    "title": "Our Values",
    "text": "Integrity, clarity, and genuine care in every relationship."
  },
  {
    "title": "Our Approach",
    "text": "Combining established banking principles with modern digital convenience."
  }
];

function AboutPage() {
  return <InfoPage eyebrow="About Us" title="A higher standard of financial possibilities." intro="Pinnacle J Trust Bank is built on the belief that banking should be grounded in confidence, transparency, and exceptional service." items={items} />;
}
