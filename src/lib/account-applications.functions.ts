import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import { sharedCustomerSchema } from "./account-applications";

const submissionSchema = z.object({
  reference: z.string().trim().min(8).max(100),
  customer: sharedCustomerSchema,
});

function asJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function requireObject(value: Json): Record<string, Json | undefined> {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export const submitAccountApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => submissionSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { customer, reference } = data;
    const { error } = await supabaseAdmin.from("account_applications").upsert({
      reference,
      customer_key: customer.id,
      customer_id: customer.customerId,
      full_name: customer.fullName,
      email: customer.email.trim().toLowerCase(),
      application_data: asJson({ ...customer, applicationReference: reference }),
      status: "Pending",
    }, { onConflict: "customer_key", ignoreDuplicates: true });

    if (error) {
      console.error("Application submission failed", error.message);
      throw new Error("We couldn't save your application. Please try again.");
    }
    return { ok: true, reference };
  });

export const ensureAdminAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_initial_admin");
    if (error) {
      console.error("Administrator access check failed", error.message);
      throw new Error("Administrator access could not be verified.");
    }
    return { allowed: Boolean(data) };
  });

export const listAccountApplications = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) throw new Error("Administrator access required");

    const { data, error } = await context.supabase
      .from("account_applications")
      .select("reference, customer_key, application_data, status, submitted_at")
      .order("submitted_at", { ascending: false });
    if (error) throw new Error("Applications could not be loaded");

    return data.map((row) => ({
      ...requireObject(row.application_data),
      id: row.customer_key,
      applicationReference: row.reference,
      accountStatus: row.status === "Approved" ? "Active" : "Pending",
      verificationStatus: row.status === "Approved" ? "Verified" : "Pending",
    }));
  });

export const getCurrentCustomerApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = typeof context.claims.email === "string" ? context.claims.email.toLowerCase() : "";
    if (!email) return null;
    const { data, error } = await context.supabase
      .from("account_applications")
      .select("reference, customer_key, application_data, status")
      .eq("email", email)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error("Your customer profile could not be loaded");
    if (!data) return null;
    return {
      ...requireObject(data.application_data),
      id: data.customer_key,
      applicationReference: data.reference,
      accountStatus: data.status === "Approved" ? "Active" : "Pending",
      verificationStatus: data.status === "Approved" ? "Verified" : "Pending",
    };
  });

export const approveSharedApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ customerKey: z.string().trim().min(3).max(120) }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) throw new Error("Administrator access required");

    const existing = await context.supabase
      .from("account_applications")
      .select("application_data")
      .eq("customer_key", data.customerKey)
      .maybeSingle();
    if (existing.error || !existing.data) throw new Error("Application not found");

    const current = requireObject(existing.data.application_data);
    const documents = Array.isArray(current["documents"])
      ? current["documents"].map((document) => requireObject(document as Json))
      : [];
    const applicationData = {
      ...current,
      accountStatus: "Active",
      verificationStatus: "Verified",
      documents: documents.map((document) => ({ ...document, status: "Approved" })),
    };

    const { error } = await context.supabase
      .from("account_applications")
      .update({
        status: "Approved",
        application_data: asJson(applicationData),
        reviewed_at: new Date().toISOString(),
        reviewed_by: context.userId,
      })
      .eq("customer_key", data.customerKey);
    if (error) throw new Error("Application approval could not be saved");
    return { ok: true };
  });
