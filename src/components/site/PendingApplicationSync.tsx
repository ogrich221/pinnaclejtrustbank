import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitAccountApplication } from "@/lib/account-applications.functions";
import { getApplicationReference, sharedCustomerSchema } from "@/lib/account-applications";

export function PendingApplicationSync() {
  const submitShared = useServerFn(submitAccountApplication);

  useEffect(() => {
    const raw = localStorage.getItem("pjtb_pending_registration");
    if (!raw) return;

    const sync = async () => {
      const parsed = sharedCustomerSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) return;
      const customer = parsed.data;
      const reference = getApplicationReference(customer);
      const marker = localStorage.getItem("pjtb_pending_registration_synced");
      if (marker === reference) return;

      await submitShared({ data: { reference, customer } });
      localStorage.setItem("pjtb_pending_registration_synced", reference);
    };

    void sync().catch(() => {
      // Keep the local backup so the next page load can retry the shared submission.
    });
  }, [submitShared]);

  return null;
}
