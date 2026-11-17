import type {
  TransactionStatus,
  VerificationDocument,
  VerificationStatus,
} from "@/components/admin/types";

export function calculateVerificationStatus(documents: VerificationDocument[]): VerificationStatus {
  if (documents.length === 0) return "Unverified";
  if (documents.some((document) => document.status === "Rejected")) return "Rejected";
  if (documents.every((document) => document.status === "Approved")) return "Verified";
  return "Pending";
}

export function getAdjustedBalances(
  balance: number,
  availableBalance: number,
  type: "Credit" | "Debit",
  amount: number
): { balance: number; availableBalance: number } | null {
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (type === "Debit" && amount > availableBalance) return null;

  const delta = type === "Credit" ? amount : -amount;
  return {
    balance: balance + delta,
    availableBalance: availableBalance + delta,
  };
}

interface TransferValidationInput {
  accountStatus: string;
  availableBalance: number;
  dailyTransferLimit: number;
  amount: number;
  fee?: number;
  outboundToday?: number;
}

export function getTransferValidationError({
  accountStatus,
  availableBalance,
  dailyTransferLimit,
  amount,
  fee = 0,
  outboundToday = 0,
}: TransferValidationInput): string | null {
  if (accountStatus !== "Active") {
    return `Transfers are unavailable while this account is ${accountStatus.toLowerCase()}. Contact support for assistance.`;
  }
  if (!Number.isFinite(amount) || amount <= 0) return "Please enter a valid transfer amount.";
  if (outboundToday + amount > dailyTransferLimit) {
    return `This transfer would exceed the daily transfer limit of ${dailyTransferLimit.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`;
  }
  if (amount + fee > availableBalance) {
    return "The transfer amount and network fee exceed the available balance.";
  }
  return null;
}

export function mapAdminTransactionStatus(
  status: TransactionStatus
): "Completed" | "Processing" | "Flagged" | "Rejected" | "Reversed" {
  switch (status) {
    case "Settled":
      return "Completed";
    case "Clearing":
      return "Processing";
    case "Flagged":
      return "Flagged";
    case "Rejected":
      return "Rejected";
    case "Reversed":
      return "Reversed";
  }
}
