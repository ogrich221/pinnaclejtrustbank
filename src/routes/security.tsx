import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/site/InfoPage";

export const Route = createFileRoute("/security")({
  head: () => ({
    meta: [
      { title: "Security Information \u2014 Pinnacle J Trust Bank" },
      { name: "description", content: "Confidence begins with knowing your financial information deserves careful protection. Here is how you can help keep your accounts safe." },
      { property: "og:title", content: "Security Information \u2014 Pinnacle J Trust Bank" },
      { property: "og:description", content: "Confidence begins with knowing your financial information deserves careful protection. Here is how you can help keep your accounts safe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SecurityPage,
});

const items = [
  {
    "title": "Protect Your Credentials",
    "text": "Never share your password or verification codes with anyone, including bank staff."
  },
  {
    "title": "Beware of Phishing",
    "text": "We will never ask for your full password by email, text, or phone."
  },
  {
    "title": "Use Trusted Devices",
    "text": "Keep your devices and browsers updated, and avoid public computers."
  },
  {
    "title": "Review Your Activity",
    "text": "Check your account activity regularly and report anything unfamiliar."
  },
  {
    "title": "Strong Passwords",
    "text": "Use a unique password of at least 8 characters with mixed character types."
  },
  {
    "title": "Report Concerns",
    "text": "Contact our security desk immediately at contactsupport@pinnaclejtrustbank.online if you suspect unauthorised access."
  }
];

function SecurityPage() {
  return <InfoPage eyebrow="Security Information" title="Your security is our priority." intro="Confidence begins with knowing your financial information deserves careful protection. Here is how you can help keep your accounts safe." items={items} />;
}
