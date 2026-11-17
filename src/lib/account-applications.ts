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
