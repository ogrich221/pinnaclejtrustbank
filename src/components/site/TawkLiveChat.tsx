import { useEffect } from "react";

declare global {
  interface Window {
    Tawk_API?: Record<string, unknown>;
    Tawk_LoadStart?: Date;
  }
}

export function TawkLiveChat() {
  useEffect(() => {
    if (document.getElementById("tawk-to-live-chat")) return;

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = "tawk-to-live-chat";
    script.async = true;
    script.src = "https://embed.tawk.to/6afcda498e6f59d4de4964c7/1k7lr9cmq";
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    document.head.appendChild(script);
  }, []);

  return null;
}
