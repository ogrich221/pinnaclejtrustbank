import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(3, "Enter your username or customer ID").max(64),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  subject: z.string().trim().min(3, "Please add a subject").max(120),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

const adultCutoff = () => { const d = new Date(); d.setFullYear(d.getFullYear() - 18); return d; };

export const stepSchemas = [
  z.object({
    accountType: z.enum(["personal", "business"], { errorMap: () => ({ message: "Choose an account type" }) }),
    firstName: z.string().trim().min(2, "Enter your first name").max(60),
    lastName: z.string().trim().min(2, "Enter your last name").max(60),
    dob: z.string().min(1, "Enter your date of birth").refine((v) => !isNaN(Date.parse(v)) && new Date(v) <= adultCutoff(), "You must be at least 18 years old"),
  }),
  z.object({
    email: z.string().trim().email("Enter a valid email").max(255),
    phone: z.string().trim().regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number"),
    address: z.string().trim().min(5, "Enter your residential address").max(200),
    country: z.string().trim().min(2, "Enter your country").max(60),
  }),
  z.object({
    idType: z.enum(["passport", "national_id", "drivers_licence"], { errorMap: () => ({ message: "Choose an identity document" }) }),
    idNumber: z.string().trim().regex(/^[A-Za-z0-9-]{5,20}$/, "Enter a valid document number (5–20 letters or digits)"),
    idExpiry: z.string().min(1, "Enter the expiry date").refine((v) => !isNaN(Date.parse(v)) && new Date(v) > new Date(), "Document must not be expired"),
    consent: z.literal(true, { errorMap: () => ({ message: "You must confirm the information is accurate" }) }),
  }),
] as const;

type Keys = "username" | "password" | "name" | "email" | "subject" | "message" | "accountType" | "firstName" | "lastName" | "dob" | "phone" | "address" | "country" | "idType" | "idNumber" | "idExpiry" | "consent";
export type FieldErrors = Partial<Record<Keys, string>>;
export function toErrors(err: z.ZodError): FieldErrors {
  const out: Record<string, string> = {};
  for (const i of err.issues) { const k = String(i.path[0]); if (!out[k]) out[k] = i.message; }
  return out as FieldErrors;
}
