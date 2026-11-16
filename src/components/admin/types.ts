export type CustomerAccountStatus = "Active" | "Restricted" | "Suspended" | "Flagged";
export type VerificationStatus = "Verified" | "Pending" | "Unverified" | "Rejected";
export type AccountType =
  | "Private Wealth"
  | "Corporate Trust"
  | "Premier Checking"
  | "High-Yield Custody"
  | "Offshore Escrow"
  | "Institutional Treasury";

export interface AdministrativeNote {
  id: string;
  authorName: string;
  authorRole: string;
  timestamp: string;
  content: string;
  category: "Compliance" | "General" | "Security" | "Audit";
}

export interface VerificationDocument {
  id: string;
  documentType: "Passport" | "National ID" | "Articles of Incorporation" | "Proof of Address" | "Tax Residency Certificate";
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  status: "Approved" | "Pending Review" | "Rejected";
  fileUrl?: string;
  submittedAt: string;
}

export interface SecurityEvent {
  id: string;
  type: "Login" | "Password Change" | "2FA Verification" | "Device Authorized" | "Failed Attempt" | "IP Change";
  ipAddress: string;
  location: string;
  device: string;
  timestamp: string;
  status: "Success" | "Failed" | "Flagged";
}

export interface CustomerRecord {
  id: string;
  customerId: string; // e.g., "PJ-89201"
  fullName: string;
  initials: string;
  email: string;
  phone: string;
  accountNumber: string; // e.g., "PJTB-8492-3841-09"
  maskedAccountNumber: string; // e.g., "PJTB-••••-09"
  accountType: AccountType;
  jurisdiction: string;
  currency: "USD" | "EUR" | "GBP" | "CHF" | "SGD";
  balance: number;
  availableBalance: number;
  dailyTransferLimit: number;
  registrationDate: string;
  verificationStatus: VerificationStatus;
  accountStatus: CustomerAccountStatus;
  lastLogin: string;
  avatarUrl?: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  notes: AdministrativeNote[];
  documents: VerificationDocument[];
  securityHistory: SecurityEvent[];
}

export type TransactionType =
  | "Inbound SWIFT"
  | "Outbound SWIFT"
  | "SEPA Instant"
  | "Fedwire Domestic"
  | "Internal Transfer"
  | "Custodial Escrow"
  | "Foreign Exchange"
  | "Treasury Dividend";

export type TransactionStatus = "Settled" | "Clearing" | "Flagged" | "Rejected" | "Reversed";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface TransactionRecord {
  id: string;
  reference: string; // e.g., "TX-2026-99201"
  customerId: string;
  customerName: string;
  type: TransactionType;
  amount: number;
  currency: "USD" | "EUR" | "GBP" | "CHF" | "SGD";
  direction: "Inbound" | "Outbound";
  timestamp: string;
  status: TransactionStatus;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  originatingBank: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  clearingRoute: string; // e.g. "CHIPS / SWIFT FIN"
  purpose: string;
  timeline: {
    stage: string;
    timestamp: string;
    status: "Completed" | "Pending" | "Flagged";
    note?: string;
  }[];
}

export interface AuditLogEntry {
  id: string;
  adminName: string;
  adminRole: string;
  action:
    | "RESTRICT_ACCOUNT"
    | "SUSPEND_ACCOUNT"
    | "RESTORE_ACCOUNT"
    | "FLAG_ACCOUNT"
    | "APPROVE_VERIFICATION"
    | "REJECT_VERIFICATION"
    | "EDIT_CUSTOMER_PROFILE"
    | "ADD_ADMIN_NOTE"
    | "MODIFY_TRANSFER_LIMIT"
    | "SYSTEM_CONFIG_CHANGE"
    | "SECURITY_OVERRIDE";
  targetId: string;
  targetDescription: string;
  timestamp: string;
  ipAddress: string;
  reason: string;
  note?: string;
  severity: "Info" | "Warning" | "Critical";
}

export type AdminRole =
  | "Super Admin"
  | "Bank Administrator"
  | "Compliance Officer"
  | "Customer Support"
  | "Auditor";

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  department: string;
  status: "Active" | "Inactive";
  mfaEnabled: boolean;
  lastActive: string;
  permissions: {
    canViewCustomers: boolean;
    canEditCustomers: boolean;
    canReviewKYC: boolean;
    canRestrictAccounts: boolean;
    canViewTransactions: boolean;
    canReviewAlerts: boolean;
    canManageStaff: boolean;
  };
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: "Security" | "Verification" | "Compliance" | "Transaction" | "System";
  severity: "Info" | "Warning" | "Critical";
  isRead: boolean;
  actionUrl?: string;
}
