import { createFileRoute } from "@tanstack/react-router";
import { AdminDataProvider } from "@/components/admin/AdminDataContext";
import { AdminLayout } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administrative Command Centre — Pinnacle J Trust Bank" },
      {
        name: "description",
        content: "Secure modern glassmorphic management dashboard for Pinnacle J Trust Bank authorized staff.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return (
    <AdminDataProvider>
      <AdminLayout />
    </AdminDataProvider>
  );
}
