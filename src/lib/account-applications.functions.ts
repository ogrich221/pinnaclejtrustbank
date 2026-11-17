import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import {
  getCustomerAccessState,
  sharedApplicationStatusSchema,
  sharedCustomerSchema,
  type SharedCustomer,
} from "./account-applications";
import { profileDetailsSchema } from "./validation";

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

function applicationWithAccess(applicationData: Json, status: z.infer<typeof sharedApplicationStatusSchema>): SharedCustomer & ReturnType<typeof getCustomerAccessState> {
  const current = requireObject(applicationData);
  const customer = sharedCustomerSchema.parse(current);
  const verification = typeof current["verificationStatus"] === "string" ? current["verificationStatus"] : "Pending";
  return { ...customer, ...getCustomerAccessState(status, verification) };
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
      if (error.code === "23505") {
        throw new Error("An application already exists for this email. Sign in or use password recovery instead.");
      }
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

    return data.map((row) => {
      const status = sharedApplicationStatusSchema.parse(row.status);
      return {
        ...applicationWithAccess(row.application_data, status),
        id: row.customer_key,
        applicationReference: row.reference,
        approvalStatus: status,
      };
    });
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
    const status = sharedApplicationStatusSchema.parse(data.status);
    return {
      ...applicationWithAccess(data.application_data, status),
      id: data.customer_key,
      applicationReference: data.reference,
      approvalStatus: status,
    };
  });

export const updateCurrentCustomerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ profile: profileDetailsSchema }).parse(data))
  .handler(async ({ data, context }) => {
    const email = typeof context.claims.email === "string" ? context.claims.email.toLowerCase() : "";
    if (!email) throw new Error("Your customer profile could not be verified");

    const existing = await context.supabase
      .from("account_applications")
      .select("customer_key, application_data, status")
      .eq("email", email)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (existing.error || !existing.data) throw new Error("Your customer profile could not be found");
    if (existing.data.status !== "Approved") throw new Error("Approved account access required");

    const current = requireObject(existing.data.application_data);
    const currentAddress = current["address"] && typeof current["address"] === "object" && !Array.isArray(current["address"])
      ? current["address"]
      : {};
    const applicationData = {
      ...current,
      fullName: data.profile.fullName,
      phone: data.profile.phone,
      address: {
        ...currentAddress,
        street: data.profile.street,
        city: data.profile.city,
        country: data.profile.country,
      },
    };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("account_applications")
      .update({ full_name: data.profile.fullName, application_data: asJson(applicationData) })
      .eq("customer_key", existing.data.customer_key)
      .eq("email", email);
    if (error) throw new Error("Your personal details could not be saved");
    return { ok: true };
  });

export const reviewSharedApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({
    customerKey: z.string().trim().min(3).max(120),
    status: sharedApplicationStatusSchema,
    reason: z.string().trim().min(3).max(500).optional(),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (roleError || !isAdmin) throw new Error("Administrator access required");

    const existing = await context.supabase
      .from("account_applications")
      .select("email, application_data")
      .eq("customer_key", data.customerKey)
      .maybeSingle();
    if (existing.error || !existing.data) throw new Error("Application not found");

    const adminEmail = typeof context.claims.email === "string" ? context.claims.email.toLowerCase() : "";
    if (adminEmail && existing.data.email.toLowerCase() === adminEmail) {
      throw new Error("Administrators cannot review their own customer application");
    }

    const current = requireObject(existing.data.application_data);
    const documents = Array.isArray(current["documents"])
      ? current["documents"].map((document) => requireObject(document as Json))
      : [];
    const notes = Array.isArray(current["notes"]) ? current["notes"] : [];
    const verificationStatus = data.status === "Approved" ? "Verified" : data.status === "Rejected" ? "Rejected" : current["verificationStatus"];
    const applicationData = {
      ...current,
      ...getCustomerAccessState(data.status, typeof verificationStatus === "string" ? verificationStatus : "Pending"),
      documents: documents.map((document) => ({
        ...document,
        status: data.status === "Approved" ? "Approved" : data.status === "Rejected" ? "Rejected" : document["status"],
      })),
      notes: data.reason ? [{
        id: `note-${Date.now()}`,
        authorName: "Administrator",
        authorRole: "Bank Administrator",
        timestamp: new Date().toISOString(),
        content: data.reason,
        category: "Compliance",
      }, ...notes] : notes,
    };

    const { error } = await context.supabase
      .from("account_applications")
      .update({
        status: data.status,
        application_data: asJson(applicationData),
        reviewed_at: new Date().toISOString(),
        reviewed_by: context.userId,
      })
      .eq("customer_key", data.customerKey);
    if (error) throw new Error("The account review could not be saved");
    return { ok: true, status: data.status };
  });
