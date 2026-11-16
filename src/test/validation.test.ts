import { describe, expect, it } from "vitest";
import { loginSchema, stepSchemas } from "@/lib/validation";

describe("banking forms", () => {
  it("rejects passwords shorter than 8 characters", () => {
    expect(loginSchema.safeParse({ username: "jdoe", password: "short" }).success).toBe(false);
  });
  it("requires applicants to be at least 18", () => {
    const d = new Date(); d.setFullYear(d.getFullYear() - 17);
    const r = stepSchemas[0].safeParse({ accountType: "personal", firstName: "Ann", lastName: "Lee", dob: d.toISOString().slice(0, 10) });
    expect(r.success).toBe(false);
  });
  it("rejects expired identity documents", () => {
    const r = stepSchemas[2].safeParse({ idType: "passport", idNumber: "AB12345", idExpiry: "2020-01-01", consent: true });
    expect(r.success).toBe(false);
  });
});
