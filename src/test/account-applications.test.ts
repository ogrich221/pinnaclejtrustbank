import { describe, expect, it } from "vitest";
import { getApplicationReference, sharedCustomerSchema } from "@/lib/account-applications";

const application = {
  id: "cust-application-1",
  customerId: "PJ-90001",
  fullName: "Application Customer",
  email: "application@example.com",
  username: "applicationuser",
  applicationReference: "PJ-APP-123456",
};

describe("shared account applications", () => {
  it("keeps the original PJ-APP-123456 reference for admin review", () => {
    expect(getApplicationReference(application)).toBe("PJ-APP-123456");
  });

  it("recovers the PJ-APP-654321 reference from the original onboarding note", () => {
    const { applicationReference: _ignored, ...withoutReference } = application;
    const legacy = {
      ...withoutReference,
      notes: [{ content: "Online application submitted. Ref: PJ-APP-654321. Awaiting approval." }],
    };
    expect(getApplicationReference(legacy)).toBe("PJ-APP-654321");
  });

  it("rejects an application without the customer ID and email needed for approval", () => {
    expect(sharedCustomerSchema.safeParse({ fullName: "Missing Details" }).success).toBe(false);
  });
});
