import { describe, expect, it } from "vitest";
import {
  findCustomerForLogin,
  hashCustomerPassword,
  PREVIEW_LOGIN,
  verifyCustomerPassword,
  type CustomerCredentialStore,
} from "@/lib/customer-access";

const previewCustomer = {
  id: "cust-testrun-1",
  customerId: "PJ-89201",
  email: "testrun@pinnaclejtrust.com",
  accountNumber: "PJTB-8492-3841-09",
};

const registeredCustomer = {
  id: "cust-new-1",
  customerId: "PJ-90001",
  email: "new@example.com",
  username: "newclient",
};

describe("customer login lookup", () => {
  it("finds the preview account using its testrun alias", () => {
    expect(findCustomerForLogin([previewCustomer], "  TESTRUN ")).toEqual(previewCustomer);
  });

  it("finds registered customers by username, email, customer ID, or account number", () => {
    expect(findCustomerForLogin([registeredCustomer], "NEWCLIENT")).toEqual(registeredCustomer);
    expect(findCustomerForLogin([registeredCustomer], " new@example.com ")).toEqual(registeredCustomer);
    expect(findCustomerForLogin([registeredCustomer], "pj-90001")).toEqual(registeredCustomer);
    expect(findCustomerForLogin([previewCustomer], "pjtb-8492-3841-09")).toEqual(previewCustomer);
  });

  it("does not match an unknown login", () => {
    expect(findCustomerForLogin([previewCustomer], "unknown")).toBeNull();
  });
});

describe("customer password verification", () => {
  it("accepts only Pinnacle123! for the preview account", async () => {
    expect(await verifyCustomerPassword(previewCustomer, PREVIEW_LOGIN.password)).toBe(true);
    expect(await verifyCustomerPassword(previewCustomer, "incorrect-password")).toBe(false);
  });

  it("verifies a registered customer's saved password hash", async () => {
    const credentials: CustomerCredentialStore = {
      "cust-new-1": {
        username: "newclient",
        passwordHash: await hashCustomerPassword("NewAccount123!"),
      },
    };

    expect(await verifyCustomerPassword(registeredCustomer, "NewAccount123!", credentials)).toBe(true);
    expect(await verifyCustomerPassword(registeredCustomer, "WrongAccount123!", credentials)).toBe(false);
  });

  it("rejects a non-preview customer with no saved credentials", async () => {
    expect(await verifyCustomerPassword(registeredCustomer, "NewAccount123!")).toBe(false);
  });
});
