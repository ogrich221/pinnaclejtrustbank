import { z } from "zod";

export const sharedCustomerSchema = z.object({
  id: z.string().trim().min(3).max(120),
  customerId: z.string().trim().min(3).max(120),
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(255),
  username: z.string().trim().min(5).max(64).optional(),
  applicationReference: z.string().trim().max(80).optional(),
}).passthrough();

export type SharedCustomer = z.infer<typeof sharedCustomerSchema>;

export const sharedApplicationStatusSchema = z.enum([
  "Pending",
  "Approved",
  "Rejected",
  "Suspended",
  "Restricted",
  "Flagged",
]);
export type SharedApplicationStatus = z.infer<typeof sharedApplicationStatusSchema>;

export function getCustomerAccessState(status: SharedApplicationStatus, currentVerification = "Pending") {
  return {
    accountStatus: status === "Approved" ? "Active" : status,
    verificationStatus: status === "Approved" ? "Verified" : status === "Rejected" ? "Rejected" : currentVerification,
    canAccess: status === "Approved",
  };
}

export function getCustomerAccessMessage(status: SharedApplicationStatus | null): string {
  switch (status) {
    case "Pending":
      return "Your account is awaiting administrator approval. You can sign in after it is approved.";
    case "Rejected":
      return "This account application was rejected. Contact support for more information.";
    case "Suspended":
      return "This account is suspended. Contact support before attempting to sign in again.";
    case "Restricted":
      return "This account is restricted. Contact support to review your access.";
    case "Flagged":
      return "This account is under administrative review. Online access is temporarily unavailable.";
    case "Approved":
      return "";
    default:
      return "No approved customer account is associated with this sign-in.";
  }
}

export function getApplicationReference(customer: SharedCustomer): string {
  if (customer.applicationReference) return customer.applicationReference;
  const notes = Array.isArray(customer["notes"]) ? customer["notes"] : [];
  for (const note of notes) {
    if (note && typeof note === "object" && "content" in note) {
      const content = String((note as { content?: unknown }).content || "");
      const match = content.match(/PJ-APP-\d{6}/);
      if (match) return match[0];
    }
  }
  return `PJ-APP-RECOVERED-${customer.id}`;
}
