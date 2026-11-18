import { describe, expect, it } from "vitest";
import {
  calculateVerificationStatus,
  DEFAULT_DAILY_TRANSFER_LIMIT,
  getAdjustedBalances,
  getTransferValidationError,
  mapAdminTransactionStatus,
} from "@/lib/banking";
import { normalizeCustomerRecord } from "@/components/admin/AdminDataContext";
import type { VerificationDocument } from "@/components/admin/types";

const document = (status: VerificationDocument["status"]): VerificationDocument => ({
  id: `doc-${status}`,
  documentType: "Passport",
  documentNumber: "P123456",
  issueDate: "2026-01-01",
  expiryDate: "2036-01-01",
  submittedAt: "2026-11-17",
  status,
});

describe("customer verification rules", () => {
  it("marks a customer unverified when no documents remain", () => {
    expect(calculateVerificationStatus([])).toBe("Unverified");
  });

  it("verifies a customer only when every document is approved", () => {
    expect(calculateVerificationStatus([document("Approved"), document("Approved")])).toBe("Verified");
    expect(calculateVerificationStatus([document("Approved"), document("Pending Review")])).toBe("Pending");
  });

  it("rejects verification when any document is rejected", () => {
    expect(calculateVerificationStatus([document("Approved"), document("Rejected")])).toBe("Rejected");
  });
});

describe("balance adjustment rules", () => {
  it("applies a 1,000 credit to both balances", () => {
    expect(getAdjustedBalances(100, 80, "Credit", 1000)).toEqual({ balance: 1100, availableBalance: 1080 });
  });

  it("subtracts a 250 debit from both balances", () => {
    expect(getAdjustedBalances(1000, 1000, "Debit", 250)).toEqual({ balance: 750, availableBalance: 750 });
  });

  it("rejects a debit greater than the available balance instead of clipping it to zero", () => {
    expect(getAdjustedBalances(1000, 500, "Debit", 500.01)).toBeNull();
  });
});

describe("customer transfer rules", () => {
  const validTransfer = {
    accountStatus: "Active",
    availableBalance: 10000,
    dailyTransferLimit: 5000,
    amount: 1000,
    fee: 15,
    outboundToday: 0,
  };

  it("blocks transfers while an administrator has suspended the account", () => {
    expect(getTransferValidationError({ ...validTransfer, accountStatus: "Suspended" })).toContain("suspended");
  });

  it("enforces the daily limit across same-day outbound transfers", () => {
    expect(getTransferValidationError({ ...validTransfer, outboundToday: 4000 })).toBeNull();
    expect(getTransferValidationError({ ...validTransfer, outboundToday: 4000.01 })).toContain("daily transfer limit");
  });

  it("includes the 15 network fee when checking available funds", () => {
    expect(getTransferValidationError({ ...validTransfer, availableBalance: 1014.99 })).toContain("available balance");
    expect(getTransferValidationError({ ...validTransfer, availableBalance: 1015 })).toBeNull();
  });

  it("allows 10,000,000 within the new daily limit and rejects 10,000,000.01", () => {
    expect(getTransferValidationError({
      ...validTransfer,
      availableBalance: 20_000_000,
      dailyTransferLimit: DEFAULT_DAILY_TRANSFER_LIMIT,
      amount: 10_000_000,
      fee: 0,
    })).toBeNull();
    expect(getTransferValidationError({
      ...validTransfer,
      availableBalance: 20_000_000,
      dailyTransferLimit: DEFAULT_DAILY_TRANSFER_LIMIT,
      amount: 10_000_000.01,
      fee: 0,
    })).toContain("daily transfer limit");
  });
});

describe("record normalization and portal status mapping", () => {
  it("preserves an administrator-set daily transfer limit", () => {
    expect(normalizeCustomerRecord({ id: "c1", customerId: "PJ-1", fullName: "Test User", dailyTransferLimit: 25000 })?.dailyTransferLimit).toBe(25000);
    expect(normalizeCustomerRecord({ id: "c2", customerId: "PJ-2", fullName: "Test User" })?.dailyTransferLimit).toBe(DEFAULT_DAILY_TRANSFER_LIMIT);
  });

  it("maps administrative settlement states to customer-facing states", () => {
    expect(mapAdminTransactionStatus("Settled")).toBe("Completed");
    expect(mapAdminTransactionStatus("Clearing")).toBe("Processing");
    expect(mapAdminTransactionStatus("Flagged")).toBe("Flagged");
    expect(mapAdminTransactionStatus("Rejected")).toBe("Rejected");
    expect(mapAdminTransactionStatus("Reversed")).toBe("Reversed");
  });
});
