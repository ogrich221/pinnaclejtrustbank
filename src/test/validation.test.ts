import { describe, expect, it } from "vitest";
import { loginSchema, profileDetailsSchema, stepSchemas } from "@/lib/validation";

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
  it("accepts a complete editable customer profile", () => {
    const result = profileDetailsSchema.safeParse({
      fullName: "  Jordan Avery  ",
      phone: "+1 (212) 555-0199",
      street: "  28 Wall Street  ",
      city: "  New York  ",
      country: "  United States  ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.fullName).toBe("Jordan Avery");
  });
  it("rejects a profile without a residential address", () => {
    const result = profileDetailsSchema.safeParse({
      fullName: "Jordan Avery",
      phone: "+1 (212) 555-0199",
      street: "",
      city: "New York",
      country: "United States",
    });
    expect(result.success).toBe(false);
  });
});
