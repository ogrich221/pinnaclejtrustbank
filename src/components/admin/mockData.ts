import {
  CustomerRecord,
  TransactionRecord,
  AuditLogEntry,
  AdministratorProfile,
  SystemNotification,
} from "./types";
import { DEFAULT_DAILY_TRANSFER_LIMIT } from "@/lib/banking";

export const INITIAL_ADMIN: AdministratorProfile = {
  id: "admin-master",
  name: "Administrator",
  email: "admin@pinnaclejtrust.com",
  role: "Administrator",
  title: "Sole Bank Administrator",
  department: "Executive Banking & Operational Governance",
  status: "Active",
  mfaEnabled: true,
  lastActive: "Active Session",
  sessionIp: "10.14.0.52 (Dedicated Secure Bastion)",
  permissions: {
    fullSystemControl: true,
    customerManagement: true,
    transactionClearing: true,
    accountRestriction: true,
    kycVerification: true,
    auditLogging: true,
    securityOverrides: true,
  },
};

export const INITIAL_CUSTOMERS: CustomerRecord[] = [
  {
    id: "cust-testrun-1",
    customerId: "PJ-89201",
    fullName: "Testrun Customer",
    initials: "TC",
    email: "testrun@pinnaclejtrust.com",
    phone: "+1 (212) 555-0199",
    accountNumber: "PJTB-8492-3841-09",
    maskedAccountNumber: "PJTB-••••-3841",
    accountType: "Premier Checking",
    jurisdiction: "United States",
    currency: "USD",
    balance: 0.0,
    availableBalance: 0.0,
    dailyTransferLimit: DEFAULT_DAILY_TRANSFER_LIMIT,
    registrationDate: "2026-11-16",
    verificationStatus: "Pending",
    accountStatus: "Pending",
    lastLogin: "Active Session",
    address: {
      street: "28 Wall Street, Suite 4400",
      city: "New York",
      postalCode: "10005",
      country: "United States",
    },
    notes: [
      {
        id: "note-testrun-1",
        authorName: "Onboarding Gateway",
        authorRole: "System",
        timestamp: "2026-11-16 12:00",
        content: "Online registration completed. Account pending Administrator review and approval.",
        category: "Compliance",
      },
    ],
    documents: [
      {
        id: "doc-testrun-1",
        documentType: "National ID",
        documentNumber: "USA-ID-994821",
        issueDate: "2024-01-10",
        expiryDate: "2034-01-10",
        status: "Pending Review",
        submittedAt: "2026-11-16",
      },
      {
        id: "doc-testrun-2",
        documentType: "Passport",
        documentNumber: "USA-PASS-881920",
        issueDate: "2023-05-15",
        expiryDate: "2033-05-15",
        status: "Pending Review",
        submittedAt: "2026-11-16",
      },
    ],
    securityHistory: [
      {
        id: "sec-testrun-1",
        type: "Login",
        ipAddress: "127.0.0.1",
        location: "New York, USA",
        device: "Secure Chrome Web Session",
        timestamp: "2026-11-16 12:00",
        status: "Success",
      },
    ],
  },
];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "audit-testrun-1",
    adminName: "System Gateway",
    adminRole: "Administrator",
    action: "ADD_ADMIN_NOTE",
    targetId: "PJ-89201",
    targetDescription: "Customer: Testrun Customer",
    timestamp: "2026-11-16 12:00:00",
    ipAddress: "10.14.0.52 (Dedicated Secure Bastion)",
    reason: "New online customer registration submitted",
    note: "Account created with initial balance of $0.00. Pending administrator review.",
    severity: "Info",
  },
];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "notif-testrun-1",
    title: "New Registration Pending Review",
    message: "Testrun Customer (PJ-89201) completed registration and is awaiting account approval.",
    timestamp: "Just now",
    category: "Verification",
    severity: "Info",
    isRead: false,
    actionUrl: "customers",
  },
];

export const ANALYTICS_TREND_DATA = [
  { month: "Jun", volume: 0, deposits: 0, withdrawals: 0, customers: 0 },
  { month: "Jul", volume: 0, deposits: 0, withdrawals: 0, customers: 0 },
  { month: "Aug", volume: 0, deposits: 0, withdrawals: 0, customers: 0 },
  { month: "Sep", volume: 0, deposits: 0, withdrawals: 0, customers: 0 },
  { month: "Oct", volume: 0, deposits: 0, withdrawals: 0, customers: 0 },
  { month: "Nov", volume: 0, deposits: 0, withdrawals: 0, customers: 1 },
];
