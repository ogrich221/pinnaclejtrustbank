export type CustomerAccountStatus = "Active" | "Pending" | "Restricted" | "Suspended" | "Flagged";
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
  documentType:
    | "Passport"
    | "National ID"
    | "Articles of Incorporation"
    | "Proof of Address"
    | "Tax Residency Certificate"
    | "Corporate Resolution"
    | "Trust Deed"
    | "Tax Certificate";
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  status: "Approved" | "Pending Review" | "Rejected";
  fileUrl?: string;
  submittedAt: string;
}

export interface CustomerBeneficiary {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  swiftBic?: string;
  country: string;
  type: "Domestic" | "International";
}

export interface SecurityEvent {
  id: string;
  type: "Login" | "Password Change" | "PIN Change" | "2FA Verification" | "Device Authorized" | "Failed Attempt" | "IP Change" | "Profile Update" | "Beneficiary Added" | "Beneficiary Removed";
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
  routingNumber?: string;
  tier?: string;
  holdBalance?: number;
  dateOpened?: string;
  twoFactorEnabled?: boolean;
  beneficiaries?: CustomerBeneficiary[];
  transferPinChangedAt?: string;
}

export type TransactionType =
  | "Inbound SWIFT"
  | "Outbound SWIFT"
  | "SEPA Instant"
  | "Fedwire Domestic"
  | "Internal Transfer"
  | "Custodial Escrow"
  | "Foreign Exchange"
  | "Treasury Dividend"
  | "Manual Credit"
  | "Manual Debit"
  | "Administrative Adjustment";

export type TransactionStatus = "Settled" | "Clearing" | "Flagged" | "Rejected" | "Reversed";
export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface TransactionRecord {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  type: TransactionType;
  amount: number;
  currency: "USD" | "EUR" | "GBP" | "CHF" | "SGD";
  direction: "Inbound" | "Outbound";
  timestamp: string;
  status: TransactionStatus;
  riskScore: number;
  riskLevel: RiskLevel;
  originatingBank: string;
  beneficiaryName: string;
  beneficiaryAccount: string;
  clearingRoute: string;
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
    | "UPDATE_VERIFICATION"
    | "EDIT_CUSTOMER_PROFILE"
    | "ADD_ADMIN_NOTE"
    | "MODIFY_TRANSFER_LIMIT"
    | "SYSTEM_CONFIG_CHANGE"
    | "SECURITY_OVERRIDE"
    | "ACCOUNT_APPROVED"
    | "CREDIT_ACCOUNT"
    | "DEBIT_ACCOUNT"
    | "EDIT_TRANSACTION"
    | "DELETE_ACCOUNT";
  targetId: string;
  targetDescription: string;
  timestamp: string;
  ipAddress: string;
  reason: string;
  note?: string;
  severity: "Info" | "Warning" | "Critical" | "Success";
}

// Single Administrator Model
export type AdminRole = "Administrator";

export interface AdministratorProfile {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  title: string;
  department: string;
  status: "Active";
  mfaEnabled: boolean;
  lastActive: string;
  sessionIp: string;
  permissions: {
    fullSystemControl: boolean;
    customerManagement: boolean;
    transactionClearing: boolean;
    accountRestriction: boolean;
    kycVerification: boolean;
    auditLogging: boolean;
    securityOverrides: boolean;
  };
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: "Security" | "Verification" | "Compliance" | "Transaction" | "System" | "Customer";
  severity: "Info" | "Warning" | "Critical";
  isRead: boolean;
  actionUrl?: string;
}


export interface CreditDebitParams {
  customerId: string;
  type: "Credit" | "Debit";
  amount: number;
  date: string;
  time: string;
  narration: string;
  counterparty?: string;
  category?: TransactionType;
}

export interface EditTransactionParams {
  transactionId: string;
  date?: string;
  time?: string;
  purpose?: string;
  narration?: string;
  status?: TransactionStatus;
  counterparty?: string;
  originatingBank?: string;
  category?: TransactionType;
}