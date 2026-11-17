import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { approveSharedApplication, listAccountApplications } from "@/lib/account-applications.functions";
import {
  CustomerRecord,
  TransactionRecord,
  AuditLogEntry,
  AdministratorProfile,
  SystemNotification,
  CustomerAccountStatus,
  VerificationStatus,
  AdministrativeNote,
  CreditDebitParams,
  EditTransactionParams,
} from "./types";
import {
  INITIAL_CUSTOMERS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ADMIN,
  INITIAL_NOTIFICATIONS,
} from "./mockData";
import { toast } from "sonner";
import {
  calculateVerificationStatus,
  getAdjustedBalances,
  mapAdminTransactionStatus,
} from "@/lib/banking";

export type AdminViewId =
  | "dashboard"
  | "analytics"
  | "customers"
  | "active-accounts"
  | "pending-verification"
  | "restricted-accounts"
  | "suspended-accounts"
  | "transactions"
  | "deposits"
  | "withdrawals"
  | "transfers"
  | "payment-history"
  | "admin-profile"
  | "activity-logs"
  | "security"
  | "notifications"
  | "settings"
  | "support";

interface AdminDataContextType {
  customers: CustomerRecord[];
  transactions: TransactionRecord[];
  auditLogs: AuditLogEntry[];
  admin: AdministratorProfile;
  notifications: SystemNotification[];
  currentView: AdminViewId;
  setCurrentView: (view: AdminViewId) => void;
  // Simple Back & Front Navigation
  canGoBack: boolean;
  canGoForward: boolean;
  navigateBack: () => void;
  navigateForward: () => void;
  isLoadingView: boolean;
  setIsLoadingView: (loading: boolean) => void;
  // Selection & Search
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  selectedTransactionId: string | null;
  setSelectedTransactionId: (id: string | null) => void;
  globalSearch: string;
  setGlobalSearch: (term: string) => void;
  // Actions
  updateCustomerStatus: (
    customerId: string,
    newStatus: CustomerAccountStatus,
    reason: string,
    note?: string
  ) => void;
  updateVerificationStatus: (
    customerId: string,
    docId: string,
    newStatus: "Approved" | "Rejected" | "Pending Review",
    reason: string
  ) => void;
  addCustomerNote: (customerId: string, content: string, category: AdministrativeNote["category"]) => void;
  editCustomerDetails: (customerId: string, details: Partial<CustomerRecord>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  activeAdmin: AdministratorProfile;
  approveCustomerAccount: (customerId: string, reason?: string) => void;
  deleteCustomer: (customerId: string) => void;
  creditDebitCustomer: (params: CreditDebitParams) => void;
  editTransaction: (params: EditTransactionParams) => void;
  resetToDefaults: () => void;
  refreshAllData: () => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CUSTOMERS: "pjtb_admin_customers_v3",
  TRANSACTIONS: "pjtb_admin_transactions_v3",
  AUDIT_LOGS: "pjtb_admin_audit_logs_v3",
  NOTIFICATIONS: "pjtb_admin_notifications_v3",
  DELETED_CUSTOMERS: "pjtb_deleted_customer_ids_v3",
};

function readDeletedCustomerIds(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.DELETED_CUSTOMERS) || "[]");
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function isDeletedCustomer(customer: CustomerRecord, deletedIds: string[]): boolean {
  return deletedIds.includes(customer.id) || deletedIds.includes(customer.customerId);
}

export function normalizeCustomerRecord(raw: any): CustomerRecord | null {
  if (!raw || typeof raw !== "object") return null;

  const id = String(raw.id || raw.customerId || `cust-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`);
  const customerId = String(raw.customerId || raw.id || `PJ-${Math.floor(10000 + Math.random() * 89999)}`);
  const fullName = String(raw.fullName || `${raw.firstName || ""} ${raw.lastName || ""}`.trim() || "Account Holder");

  let initials = raw.initials;
  if (!initials || typeof initials !== "string") {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      initials = `${parts[0]?.charAt(0) || "P"}${parts[1]?.charAt(0) || "J"}`.toUpperCase();
    } else if (parts.length === 1 && (parts[0]?.length || 0) >= 2) {
      initials = (parts[0] || "PJ").substring(0, 2).toUpperCase();
    } else {
      initials = "PJ";
    }
  }

  const rawAcc = String(
    raw.accountNumber ||
      `PJTB-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`
  );
  const cleanAcc = rawAcc.replace(/\s+/g, "");
  const maskedAccountNumber =
    raw.maskedAccountNumber || (cleanAcc.length >= 4 ? `PJTB-••••-${cleanAcc.slice(-4)}` : cleanAcc);

  const address =
    raw.address && typeof raw.address === "object"
      ? {
          street: String(raw.address.street || raw.residentialAddress || "N/A"),
          city: String(raw.address.city || raw.city || "N/A"),
          postalCode: String(raw.address.postalCode || raw.postalCode || "N/A"),
          country: String(raw.address.country || raw.countryOfResidence || raw.jurisdiction || "N/A"),
        }
      : {
          street: "N/A",
          city: "N/A",
          postalCode: "N/A",
          country: String(raw.jurisdiction || "N/A"),
        };

  const balance = typeof raw.balance === "number" && !isNaN(raw.balance) ? raw.balance : 0;
  const availableBalance =
    typeof raw.availableBalance === "number" && !isNaN(raw.availableBalance) ? raw.availableBalance : balance;
  const holdBalance = typeof raw.holdBalance === "number" && !isNaN(raw.holdBalance) ? raw.holdBalance : 0;

  return {
    id,
    customerId,
    fullName,
    initials,
    email: String(raw.email || "client@pinnaclejtrustbank.online"),
    phone: String(raw.phone || "+1 (555) 000-0000"),
    accountNumber: rawAcc,
    maskedAccountNumber,
    routingNumber: String(raw.routingNumber || "021000021"),
    accountType: raw.accountType || "Private Wealth Checking",
    tier: raw.tier || "Gold",
    currency: raw.currency || "USD",
    balance,
    availableBalance,
    dailyTransferLimit:
      typeof raw.dailyTransferLimit === "number" && Number.isFinite(raw.dailyTransferLimit) && raw.dailyTransferLimit >= 0
        ? raw.dailyTransferLimit
        : 50000,
    holdBalance,
    dateOpened: String(raw.dateOpened || raw.registrationDate || new Date().toISOString().substring(0, 10)),
    registrationDate: String(raw.registrationDate || raw.dateOpened || new Date().toISOString().substring(0, 10)),
    jurisdiction: String(raw.jurisdiction || "United States (FCA / FINCEN)"),
    twoFactorEnabled: Boolean(raw.twoFactorEnabled ?? true),
    ...(raw.username ? { username: String(raw.username) } : {}),
    ...(raw.applicationReference ? { applicationReference: String(raw.applicationReference) } : {}),
    verificationStatus: (raw.verificationStatus || "Pending") as VerificationStatus,
    accountStatus: (raw.accountStatus || "Pending") as CustomerAccountStatus,
    lastLogin: String(raw.lastLogin || "Pending first session"),
    address,
    documents: Array.isArray(raw.documents) ? raw.documents : [],
    notes: Array.isArray(raw.notes) ? raw.notes : [],
    securityHistory: Array.isArray(raw.securityHistory) ? raw.securityHistory : [],
  };
}

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const fetchSharedApplications = useServerFn(listAccountApplications);
  const saveSharedApproval = useServerFn(approveSharedApplication);
  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      let list: CustomerRecord[] = [];
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            list = parsed.map(normalizeCustomerRecord).filter((c): c is CustomerRecord => Boolean(c));
          }
        } catch {}
      }

      if (list.length === 0) {
        list = INITIAL_CUSTOMERS.map(normalizeCustomerRecord).filter((c): c is CustomerRecord => Boolean(c));
      }

      // Check if newly created customer in portal session or pending registration exists
      const checkKeys = ["pjtb_current_portal_customer", "pjtb_pending_registration"];
      let merged = false;
      checkKeys.forEach((key) => {
        const itemStr = localStorage.getItem(key);
        if (itemStr) {
          try {
            const parsed = JSON.parse(itemStr);
            const norm = normalizeCustomerRecord(parsed);
            if (norm) {
              const exists = list.some(
                (existing) =>
                  existing &&
                  (existing.id === norm.id ||
                    existing.customerId === norm.customerId ||
                    (existing.email && norm.email && existing.email.toLowerCase() === norm.email.toLowerCase()))
              );
              if (!exists) {
                list = [norm, ...list];
                merged = true;
              }
            }
          } catch {}
        }
      });

      const deletedIds = readDeletedCustomerIds();
      list = list.filter((customer) => !isDeletedCustomer(customer, deletedIds));
      if (merged) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
      }
      return list;
    } catch {
      return INITIAL_CUSTOMERS.map(normalizeCustomerRecord).filter((c): c is CustomerRecord => Boolean(c));
    }
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // Navigation History State for Back & Front Navigation
  const [historyStack, setHistoryStack] = useState<AdminViewId[]>(["dashboard"]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isLoadingView, setIsLoadingView] = useState<boolean>(true);

  // Initial loading simulation displaying bank logo & cleaning legacy mock storage
  useEffect(() => {
    try {
      [
        "pjtb_admin_customers_v2",
        "pjtb_admin_transactions_v2",
        "pjtb_admin_audit_logs_v2",
        "pjtb_admin_notifications_v2",
        "pjtb_admin_customers",
        "pjtb_admin_transactions",
        "pjtb_admin_audit_logs",
        "pjtb_admin_notifications",
      ].forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
    const timer = setTimeout(() => {
      setIsLoadingView(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const currentView = historyStack[historyIndex] || "dashboard";

  const changeView = useCallback((nextView: AdminViewId) => {
    if (nextView === currentView) return;
    setIsLoadingView(true);
    setHistoryStack((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, nextView];
    });
    setHistoryIndex((prev) => prev + 1);

    setTimeout(() => {
      setIsLoadingView(false);
    }, 280);
  }, [currentView, historyIndex]);

  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < historyStack.length - 1;

  const navigateBack = useCallback(() => {
    if (canGoBack) {
      setIsLoadingView(true);
      setHistoryIndex((prev) => prev - 1);
      setTimeout(() => setIsLoadingView(false), 200);
    }
  }, [canGoBack]);

  const navigateForward = useCallback(() => {
    if (canGoForward) {
      setIsLoadingView(true);
      setHistoryIndex((prev) => prev + 1);
      setTimeout(() => setIsLoadingView(false), 200);
    }
  }, [canGoForward]);

  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>("");

  const activeAdmin: AdministratorProfile = INITIAL_ADMIN;

  const syncSharedApplications = useCallback(async () => {
    try {
      const shared = await fetchSharedApplications();
      const normalized = shared
        .map(normalizeCustomerRecord)
        .filter((customer): customer is CustomerRecord => Boolean(customer));

      setCustomers((previous) => {
        const matches = (a: CustomerRecord, b: CustomerRecord) =>
          a.id === b.id || a.customerId === b.customerId ||
          (a.email && b.email && a.email.toLowerCase() === b.email.toLowerCase());
        const sharedRows = normalized.map((remote) => {
          const local = previous.find((customer) => matches(customer, remote));
          return local ? { ...local, ...remote } : remote;
        });
        const localOnly = previous.filter((local) => !normalized.some((remote) => matches(local, remote)));
        return [...sharedRows, ...localOnly];
      });

      setNotifications((previous) => {
        const additions = normalized
          .filter((customer) => !previous.some((note) => note.id === `notif-shared-${customer.id}`))
          .map((customer) => ({
            id: `notif-shared-${customer.id}`,
            title: `New Application: ${customer.fullName}`,
            message: `${customer.fullName} submitted ${customer.accountType} for administrator review.`,
            timestamp: "Shared application",
            category: "Verification" as const,
            severity: "Info" as const,
            isRead: false,
            actionUrl: "pending-verification",
          }));
        return additions.length > 0 ? [...additions, ...previous] : previous;
      });
    } catch {
      // The local dashboard remains available if the shared queue is temporarily unreachable.
    }
  }, [fetchSharedApplications]);

  useEffect(() => {
    void syncSharedApplications();
    const channel = supabase
      .channel(`admin-applications-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "account_applications" }, () => {
        void syncSharedApplications();
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [syncSharedApplications]);

  // Persistence with protection against overwriting newly created accounts from other tabs
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (stored) {
        try {
          const storedListRaw = JSON.parse(stored);
          if (Array.isArray(storedListRaw)) {
            const storedList = storedListRaw
              .map(normalizeCustomerRecord)
              .filter((c): c is CustomerRecord => Boolean(c));
            const missingInState = storedList.filter(
              (sc) => sc && !customers.some((c) => c && (c.id === sc.id || c.customerId === sc.customerId))
            );
            if (missingInState.length > 0) {
              setCustomers((prev) => [...missingInState, ...prev]);
              return;
            }
          }
        } catch {}
      }
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch {
      // ignore
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
    } catch {
      // ignore
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Reactive cross-tab and cross-view synchronization listener
  const handleSync = useCallback(() => {
    try {
      const storedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      let list: CustomerRecord[] = [];
      if (storedCustomers) {
        try {
          const parsed = JSON.parse(storedCustomers);
          if (Array.isArray(parsed)) {
            list = parsed.map(normalizeCustomerRecord).filter((c): c is CustomerRecord => Boolean(c));
          }
        } catch {}
      }

      const checkKeys = ["pjtb_current_portal_customer", "pjtb_pending_registration"];
      let modified = false;
      checkKeys.forEach((key) => {
        const itemStr = localStorage.getItem(key);
        if (itemStr) {
          try {
            const c = JSON.parse(itemStr);
            const norm = normalizeCustomerRecord(c);
            if (norm) {
              const exists = list.some(
                (existing) =>
                  existing &&
                  (existing.id === norm.id ||
                    existing.customerId === norm.customerId ||
                    (existing.email && norm.email && existing.email.toLowerCase() === norm.email.toLowerCase()))
              );
              if (!exists) {
                list = [norm, ...list];
                modified = true;
              }
            }
          } catch {}
        }
      });

      const deletedIds = readDeletedCustomerIds();
      list = list.filter((customer) => !isDeletedCustomer(customer, deletedIds));

      if (modified) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(list));
      }

      if (storedCustomers || modified) {
        setCustomers((prev) => JSON.stringify(prev) === JSON.stringify(list) ? prev : list);
      }

      const storedTx = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (storedTx) {
        try {
          const parsedTx = JSON.parse(storedTx);
          if (Array.isArray(parsedTx)) setTransactions(parsedTx);
        } catch {}
      }
      const storedNotifs = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifs) {
        try {
          const parsedNotifs = JSON.parse(storedNotifs);
          if (Array.isArray(parsedNotifs)) setNotifications(parsedNotifs);
        } catch {}
      }
      const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (storedLogs) {
        try {
          const parsedLogs = JSON.parse(storedLogs);
          if (Array.isArray(parsedLogs)) setAuditLogs(parsedLogs);
        } catch {}
      }
    } catch {}
  }, []);

  useEffect(() => {
    handleSync();

    window.addEventListener("storage", handleSync);
    window.addEventListener("pjtb_sync", handleSync);
    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);

    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      try {
        bc = new BroadcastChannel("pjtb_sync_channel");
        bc.onmessage = () => {
          handleSync();
        };
      } catch {}
    }

    const interval = setInterval(handleSync, 2000);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("pjtb_sync", handleSync);
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, [handleSync]);

  // Helper to log immutable audit entry
  const logAuditEntry = (
    action: AuditLogEntry["action"],
    targetId: string,
    targetDescription: string,
    reason: string,
    note?: string,
    severity: AuditLogEntry["severity"] = "Info"
  ) => {
    const newEntry: AuditLogEntry = {
      id: `audit-${Date.now()}`,
      adminName: activeAdmin.name,
      adminRole: activeAdmin.role,
      action,
      targetId,
      targetDescription,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      ipAddress: activeAdmin.sessionIp,
      reason,
      ...(note !== undefined ? { note } : {}),
      severity,
    };
    setAuditLogs((prev) => [newEntry, ...prev]);
  };

  const updateCustomerStatus = (
    customerId: string,
    newStatus: CustomerAccountStatus,
    reason: string,
    note?: string
  ) => {
    const target = customers.find((c) => c.id === customerId || c.customerId === customerId);
    if (!target) return;

    const updatedCustomers = customers.map((c) => {
      if (c.id === target.id || c.customerId === target.customerId) {
        const updatedNotes = [...(c.notes || [])];
        if (note) {
          updatedNotes.unshift({
            id: `note-${Date.now()}`,
            authorName: activeAdmin.name,
            authorRole: activeAdmin.role,
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
            content: `STATUS CHANGE (${c.accountStatus} -> ${newStatus}): ${note}`,
            category: "Compliance",
          });
        }
        return {
          ...c,
          accountStatus: newStatus,
          notes: updatedNotes,
        };
      }
      return c;
    });

    setCustomers(updatedCustomers);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updatedCustomers));
      const currentPortal = localStorage.getItem("pjtb_current_portal_customer");
      if (currentPortal) {
        const portalObj = JSON.parse(currentPortal);
        if (
          portalObj.id === target.id ||
          portalObj.customerId === target.customerId ||
          (portalObj.email && target.email && portalObj.email.toLowerCase() === target.email.toLowerCase())
        ) {
          portalObj.accountStatus = newStatus;
          localStorage.setItem("pjtb_current_portal_customer", JSON.stringify(portalObj));
        }
      }
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("pjtb_sync"));
    } catch {}

    let auditAction: AuditLogEntry["action"] = "FLAG_ACCOUNT";
    let severity: AuditLogEntry["severity"] = "Warning";
    if (newStatus === "Restricted") {
      auditAction = "RESTRICT_ACCOUNT";
      severity = "Critical";
    } else if (newStatus === "Suspended") {
      auditAction = "SUSPEND_ACCOUNT";
      severity = "Critical";
    } else if (newStatus === "Active") {
      auditAction = "RESTORE_ACCOUNT";
      severity = "Info";
    }

    logAuditEntry(
      auditAction,
      target.customerId,
      `Customer: ${target.fullName} (${target.maskedAccountNumber})`,
      reason,
      note,
      severity
    );

    // Create system notification
    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: `Account Status Changed: ${newStatus}`,
      message: `${target.fullName} (${target.customerId}) marked as ${newStatus} by ${activeAdmin.name}. Reason: ${reason}`,
      timestamp: "Just now",
      category: "Compliance",
      severity: severity === "Critical" ? "Critical" : "Warning",
      isRead: false,
      actionUrl: "customers",
    };
    setNotifications((prev) => [newNotif, ...prev]);

    toast.success(`Account status updated to ${newStatus}`, {
      description: `Customer ${target.fullName} (${target.customerId}) status changed. Audit entry recorded.`,
    });
  };

  const updateVerificationStatus = (
    customerId: string,
    docId: string,
    newStatus: "Approved" | "Rejected" | "Pending Review",
    reason: string
  ) => {
    const target = customers.find((c) => c.id === customerId || c.customerId === customerId);
    if (!target) return;

    let updatedVerification: VerificationStatus = "Pending";

    const updatedCustomers = customers.map((c) => {
      if (c.id === target.id || c.customerId === target.customerId) {
        const updatedDocs = (c.documents || []).map((d) => (d.id === docId ? { ...d, status: newStatus } : d));
        updatedVerification = calculateVerificationStatus(updatedDocs);

        return {
          ...c,
          documents: updatedDocs,
          verificationStatus: updatedVerification,
        };
      }
      return c;
    });

    setCustomers(updatedCustomers);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updatedCustomers));
      const currentPortal = localStorage.getItem("pjtb_current_portal_customer");
      if (currentPortal) {
        const portalObj = JSON.parse(currentPortal);
        if (
          portalObj.id === target.id ||
          portalObj.customerId === target.customerId ||
          (portalObj.email && target.email && portalObj.email.toLowerCase() === target.email.toLowerCase())
        ) {
          portalObj.verificationStatus = updatedVerification;
          portalObj.documents = (portalObj.documents || []).map((d: any) =>
            d.id === docId ? { ...d, status: newStatus } : d
          );
          localStorage.setItem("pjtb_current_portal_customer", JSON.stringify(portalObj));
        }
      }
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("pjtb_sync"));
    } catch {}

    logAuditEntry(
      newStatus === "Approved"
        ? "APPROVE_VERIFICATION"
        : newStatus === "Rejected"
        ? "REJECT_VERIFICATION"
        : "UPDATE_VERIFICATION",
      target.customerId,
      `Document ID: ${docId} for ${target.fullName}`,
      reason,
      undefined,
      newStatus === "Approved" ? "Info" : "Warning"
    );

    toast.success(`Verification document ${newStatus.toLowerCase()}`, {
      description: `${target.fullName}'s verification document status updated.`,
    });
  };

  const addCustomerNote = (customerId: string, content: string, category: AdministrativeNote["category"]) => {
    const target = customers.find((c) => c.id === customerId || c.customerId === customerId);
    if (!target) return;

    const newNote: AdministrativeNote = {
      id: `note-${Date.now()}`,
      authorName: activeAdmin.name,
      authorRole: activeAdmin.role,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      content,
      category,
    };

    const updatedCustomers = customers.map((c) =>
      c.id === target.id ? { ...c, notes: [newNote, ...(c.notes || [])] } : c
    );
    setCustomers(updatedCustomers);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updatedCustomers));
      const currentPortal = localStorage.getItem("pjtb_current_portal_customer");
      if (currentPortal) {
        const portalObj = JSON.parse(currentPortal);
        if (portalObj.id === target.id || portalObj.customerId === target.customerId) {
          portalObj.notes = [newNote, ...(portalObj.notes || [])];
          localStorage.setItem("pjtb_current_portal_customer", JSON.stringify(portalObj));
        }
      }
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("pjtb_sync"));
    } catch {}

    logAuditEntry(
      "ADD_ADMIN_NOTE",
      target.customerId,
      `Customer: ${target.fullName}`,
      `Category: ${category}`,
      content.substring(0, 80)
    );

    toast.success("Administrative note attached", {
      description: "Note logged into customer profile with administrative timestamp.",
    });
  };

  const editCustomerDetails = (customerId: string, details: Partial<CustomerRecord>) => {
    const target = customers.find((c) => c.id === customerId || c.customerId === customerId);
    if (!target) return;

    const nextCustomerId = details.customerId?.trim() || target.customerId;
    const nextAccountNumber = details.accountNumber?.trim() || target.accountNumber;
    const updated = customers.map((c) => {
      if (c.id !== target.id) return c;

      const newInitials = details.fullName
        ? details.fullName.trim().split(/\s+/).map((n) => n.charAt(0)).slice(0, 2).join("").toUpperCase()
        : c.initials;
      const newMasked = nextAccountNumber.length > 4
        ? `PJTB-••••-${nextAccountNumber.slice(-4)}`
        : nextAccountNumber;
      const verificationStatus = details.verificationStatus ||
        (details.documents ? calculateVerificationStatus(details.documents) : c.verificationStatus);

      return {
        ...c,
        ...details,
        customerId: nextCustomerId,
        accountNumber: nextAccountNumber,
        initials: details.initials || newInitials,
        maskedAccountNumber: details.maskedAccountNumber || newMasked,
        verificationStatus,
        address: details.address ? { ...c.address, ...details.address } : c.address,
      };
    });

    const updatedTransactions = transactions.map((transaction) =>
      transaction.customerId === target.customerId
        ? {
            ...transaction,
            customerId: nextCustomerId,
            customerName: details.fullName || target.fullName,
            beneficiaryAccount:
              transaction.beneficiaryAccount === target.accountNumber ? nextAccountNumber : transaction.beneficiaryAccount,
          }
        : transaction
    );

    setCustomers(updated);
    setTransactions(updatedTransactions);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));

      const oldPortalKeys = [`pjtb_portal_tx_${target.customerId}`, `pjtb_portal_tx_${target.id}`];
      const oldPortalTx = oldPortalKeys.map((key) => localStorage.getItem(key)).find(Boolean);
      if (oldPortalTx) {
        localStorage.setItem(`pjtb_portal_tx_${nextCustomerId}`, oldPortalTx);
        localStorage.setItem(`pjtb_portal_tx_${target.id}`, oldPortalTx);
      }
      if (nextCustomerId !== target.customerId) {
        localStorage.removeItem(`pjtb_portal_tx_${target.customerId}`);
        localStorage.removeItem(`pjtb_portal_beneficiaries_${target.customerId}`);
      }

      const currentPortal = localStorage.getItem("pjtb_current_portal_customer");
      if (currentPortal) {
        const portalObj = JSON.parse(currentPortal);
        if (
          portalObj.id === target.id ||
          portalObj.customerId === target.customerId ||
          (portalObj.email && target.email && portalObj.email.toLowerCase() === target.email.toLowerCase())
        ) {
          const updatedCustomer = updated.find((customer) => customer.id === target.id);
          localStorage.setItem("pjtb_current_portal_customer", JSON.stringify({
            ...portalObj,
            ...(updatedCustomer || details),
          }));
        }
      }
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("pjtb_sync"));
    } catch {}

    logAuditEntry(
      "EDIT_CUSTOMER_PROFILE",
      nextCustomerId,
      `Customer: ${details.fullName || target.fullName}`,
      "Administrator updated customer profile details",
      JSON.stringify(Object.keys(details))
    );

    toast.success("Customer details updated successfully", {
      description: `All modifications applied to ${details.fullName || target.fullName} (${nextCustomerId}).`,
    });
  };

  const deleteCustomer = (customerId: string) => {
    const target = customers.find((c) => c.id === customerId || c.customerId === customerId);
    if (!target) return;

    const updated = customers.filter((c) => c.id !== target.id);
    const updatedTransactions = transactions.filter((transaction) => transaction.customerId !== target.customerId);
    setCustomers(updated);
    setTransactions(updatedTransactions);
    try {
      const deletedIds = Array.from(new Set([...readDeletedCustomerIds(), target.id, target.customerId]));
      localStorage.setItem(STORAGE_KEYS.DELETED_CUSTOMERS, JSON.stringify(deletedIds));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));

      const currentPortal = localStorage.getItem("pjtb_current_portal_customer");
      if (currentPortal) {
        const portalObj = JSON.parse(currentPortal);
        if (
          portalObj.id === target.id ||
          portalObj.customerId === target.customerId ||
          (portalObj.email && target.email && portalObj.email.toLowerCase() === target.email.toLowerCase())
        ) {
          localStorage.removeItem("pjtb_current_portal_customer");
        }
      }
      localStorage.removeItem(`pjtb_portal_tx_${target.customerId}`);
      localStorage.removeItem(`pjtb_portal_tx_${target.id}`);
      localStorage.removeItem(`pjtb_portal_beneficiaries_${target.customerId}`);
      localStorage.removeItem(`pjtb_portal_beneficiaries_${target.id}`);
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("pjtb_sync"));
    } catch {}

    logAuditEntry(
      "DELETE_ACCOUNT",
      target.customerId,
      `Customer: ${target.fullName} (${target.customerId})`,
      "Administrator permanently deleted customer account from system registry",
      undefined,
      "Critical"
    );

    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: `Account Deleted: ${target.fullName}`,
      message: `Customer ${target.fullName} (${target.customerId}) was permanently removed by ${activeAdmin.name}.`,
      timestamp: "Just now",
      isRead: false,
      severity: "Critical",
      category: "Customer",
      actionUrl: "customers",
    };
    setNotifications((prev) => [newNotif, ...prev]);

    toast.error(`Customer account deleted`, {
      description: `${target.fullName} (${target.customerId}) permanently removed from registry.`,
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.info("All notifications marked as read");
  };

  const approveCustomerAccount = (customerId: string, reason?: string) => {
    const target = customers.find((c) => c.id === customerId || c.customerId === customerId);
    if (!target) return;

    const approvalReason = reason || "Administrator approved account application and activated banking services.";

    const updatedList = customers.map((c) => {
      if (c.id === target.id || c.customerId === target.customerId) {
        const approvedDocs = (c.documents || []).map((d) => ({ ...d, status: "Approved" as const }));
        return {
          ...c,
          accountStatus: "Active" as const,
          verificationStatus: "Verified" as const,
          documents: approvedDocs,
          balance: c.balance ?? 0.0,
          availableBalance: c.availableBalance ?? 0.0,
          notes: [
            {
              id: `note-${Date.now()}`,
              authorName: "Administrator",
              authorRole: "Sole Bank Administrator",
              timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
              content: approvalReason,
              category: "Compliance" as const,
            },
            ...(c.notes || []),
          ],
        };
      }
      return c;
    });

    setCustomers(updatedList);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updatedList));
      const currentPortal = localStorage.getItem("pjtb_current_portal_customer");
      if (currentPortal) {
        const portalObj = JSON.parse(currentPortal);
        if (
          portalObj.id === target.id ||
          portalObj.customerId === target.customerId ||
          (portalObj.email && target.email && portalObj.email.toLowerCase() === target.email.toLowerCase())
        ) {
          portalObj.accountStatus = "Active";
          portalObj.verificationStatus = "Verified";
          portalObj.balance = portalObj.balance ?? 0.0;
          portalObj.availableBalance = portalObj.availableBalance ?? 0.0;
          portalObj.documents = (portalObj.documents || []).map((d: any) => ({ ...d, status: "Approved" }));
          localStorage.setItem("pjtb_current_portal_customer", JSON.stringify(portalObj));
        }
      }
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("pjtb_sync"));
    } catch {}

    logAuditEntry(
      "ACCOUNT_APPROVED",
      target.customerId,
      `Customer: ${target.fullName} (${target.accountType})`,
      approvalReason,
      undefined,
      "Success"
    );

    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: `Account Approved: ${target.fullName}`,
      message: `Account ${target.customerId} has been approved and activated. Status is now Active / Verified.`,
      timestamp: "Just now",
      isRead: false,
      severity: "Info",
      category: "Customer",
      actionUrl: "customers",
    };
    setNotifications((prev) => [newNotif, ...prev]);

    toast.success(`Account approved and activated for ${target.fullName}`, {
      description: `Customer ID ${target.customerId} is now Active.`,
    });

    if (target.applicationReference) {
      void saveSharedApproval({ data: { customerKey: target.id } }).catch(() => {
        toast.error("The shared approval could not be saved", {
          description: "Use Refresh Data to check the connection and approve again.",
        });
      });
    }
  };


  const creditDebitCustomer = (params: CreditDebitParams) => {
    const target = customers.find((c) => c.id === params.customerId || c.customerId === params.customerId);
    if (!target) return;

    const amt = Math.abs(params.amount);
    const isCredit = params.type === "Credit";
    const adjustedBalances = getAdjustedBalances(target.balance || 0, target.availableBalance || 0, params.type, amt);
    if (!adjustedBalances) {
      toast.error(isCredit ? "Enter a valid credit amount" : "Debit exceeds the available balance", {
        description: `No ledger entry was created for ${target.fullName}.`,
      });
      return;
    }

    const { balance: newBalance, availableBalance: newAvail } = adjustedBalances;
    const timestampStr = `${params.date} ${params.time}`;

    const updatedCustomers = customers.map((c) => {
      if (c.id === target.id || c.customerId === target.customerId) {
        return {
          ...c,
          balance: newBalance,
          availableBalance: newAvail,
          notes: [
            {
              id: `note-${Date.now()}`,
              authorName: "Administrator",
              authorRole: "Sole Bank Administrator",
              timestamp: timestampStr,
              content: `Manual ${params.type}: ${c.currency} ${amt.toFixed(2)}. Narration: ${params.narration}. Counterparty: ${params.counterparty || "Direct Ledger"}`,
              category: "Audit" as const,
            },
            ...(c.notes || []),
          ],
        };
      }
      return c;
    });

    setCustomers(updatedCustomers);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updatedCustomers));
      const currentPortal = localStorage.getItem("pjtb_current_portal_customer");
      if (currentPortal) {
        const portalObj = JSON.parse(currentPortal);
        if (
          portalObj.id === target.id ||
          portalObj.customerId === target.customerId ||
          (portalObj.email && target.email && portalObj.email.toLowerCase() === target.email.toLowerCase())
        ) {
          portalObj.balance = newBalance;
          portalObj.availableBalance = newAvail;
          localStorage.setItem("pjtb_current_portal_customer", JSON.stringify(portalObj));
        }
      }
    } catch {}

    const txRef = `PJTB-ADJ-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      reference: txRef,
      customerId: target.customerId,
      customerName: target.fullName,
      type: params.category || (isCredit ? "Manual Credit" : "Manual Debit"),
      amount: amt,
      currency: target.currency,
      direction: isCredit ? "Inbound" : "Outbound",
      timestamp: timestampStr,
      status: "Settled",
      riskScore: 2,
      riskLevel: "Low",
      originatingBank: isCredit ? (params.counterparty || "Pinnacle J Trust Reserve Treasury") : "Pinnacle J Trust Bank",
      beneficiaryName: isCredit ? target.fullName : (params.counterparty || "External Institutional Settlement"),
      beneficiaryAccount: target.accountNumber,
      clearingRoute: isCredit ? "Manual Administrative Credit Entry" : "Manual Administrative Debit Order",
      purpose: params.narration,
      timeline: [
        {
          stage: "Initiated",
          timestamp: timestampStr,
          status: "Completed",
          note: `Manual entry by Administrator`,
        },
        {
          stage: "Authorized",
          timestamp: timestampStr,
          status: "Completed",
          note: `Signed with Administrative Master FIPS Key`,
        },
        {
          stage: "Settled",
          timestamp: timestampStr,
          status: "Completed",
          note: `Ledger adjusted. New balance: ${target.currency} ${newBalance.toFixed(2)}`,
        },
      ],
    };

    const updatedTransactions = [newTx, ...transactions];
    setTransactions(updatedTransactions);

    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
      const userTxKey = `pjtb_portal_tx_${target.customerId}`;
      const existingPortalTx = localStorage.getItem(userTxKey) || localStorage.getItem(`pjtb_portal_tx_${target.id}`);
      const parsedPortalTx = existingPortalTx ? JSON.parse(existingPortalTx) : [];
      const portalTxList = Array.isArray(parsedPortalTx) ? parsedPortalTx : [];
      portalTxList.unshift({
        id: newTx.id,
        reference: newTx.reference,
        date: timestampStr,
        description: params.narration,
        category: isCredit ? "Deposit" : "Withdrawal",
        amount: amt,
        currency: target.currency,
        status: "Completed",
        counterparty: params.counterparty || (isCredit ? "Pinnacle J Reserve Treasury" : "Direct Settlement"),
      });
      localStorage.setItem(userTxKey, JSON.stringify(portalTxList));
      localStorage.setItem(`pjtb_portal_tx_${target.id}`, JSON.stringify(portalTxList));

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("pjtb_sync"));
    } catch {}

    logAuditEntry(
      isCredit ? "CREDIT_ACCOUNT" : "DEBIT_ACCOUNT",
      target.customerId,
      `${params.type} ${target.currency} ${amt.toFixed(2)} — ${target.fullName}`,
      `Narration: ${params.narration} | Date/Time: ${timestampStr} | New Balance: ${target.currency} ${newBalance.toFixed(2)}`,
      undefined,
      "Info"
    );

    const newNotif: SystemNotification = {
      id: `notif-${Date.now()}`,
      title: `Account ${params.type}ed: ${target.fullName}`,
      message: `${target.fullName} (${target.customerId}) ${params.type.toLowerCase()}ed with ${target.currency} ${amt.toLocaleString("en-US", { minimumFractionDigits: 2 })}. Narration: "${params.narration}". Balance now: ${target.currency} ${newBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`,
      timestamp: "Just now",
      isRead: false,
      severity: "Info",
      category: "Transaction",
      actionUrl: "transactions",
    };
    setNotifications((prev) => [newNotif, ...prev]);

    toast.success(`Account successfully ${params.type.toLowerCase()}ed`, {
      description: `${target.fullName}: ${target.currency} ${amt.toLocaleString("en-US", { minimumFractionDigits: 2 })}. Balance: ${target.currency} ${newBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}.`,
    });
  };

  const editTransaction = (params: EditTransactionParams) => {
    const target = transactions.find((t) => t.id === params.transactionId);
    if (!target) return;

    const updatedTimestamp = params.date && params.time ? `${params.date} ${params.time}` : (params.date || target.timestamp);
    const updatedPurpose = params.purpose || params.narration || target.purpose;
    const updatedStatus = params.status || target.status;
    const updatedCounterparty = params.originatingBank || params.counterparty || target.originatingBank;
    const updatedTransactions = transactions.map((transaction) =>
      transaction.id === params.transactionId
        ? {
            ...transaction,
            timestamp: updatedTimestamp,
            purpose: updatedPurpose,
            status: updatedStatus,
            originatingBank: updatedCounterparty,
            type: params.category || transaction.type,
          }
        : transaction
    );

    setTransactions(updatedTransactions);
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
      const customer = customers.find((record) => record.customerId === target.customerId);
      const portalKeys = [`pjtb_portal_tx_${target.customerId}`];
      if (customer) portalKeys.push(`pjtb_portal_tx_${customer.id}`);

      portalKeys.forEach((key) => {
        const stored = localStorage.getItem(key);
        if (!stored) return;
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) return;
        const updatedPortalTx = parsed.map((transaction: any) =>
          transaction.id === target.id
            ? {
                ...transaction,
                date: updatedTimestamp,
                description: updatedPurpose,
                status: mapAdminTransactionStatus(updatedStatus),
                counterparty: updatedCounterparty,
              }
            : transaction
        );
        localStorage.setItem(key, JSON.stringify(updatedPortalTx));
      });

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("pjtb_sync"));
    } catch {}

    logAuditEntry(
      "EDIT_TRANSACTION",
      target.reference,
      `Transaction ${target.reference} updated`,
      `New Date/Time: ${updatedTimestamp} | Purpose: ${params.purpose || params.narration || target.purpose} | Status: ${params.status || target.status}`,
      undefined,
      "Info"
    );

    toast.success(`Transaction ${target.reference} updated`, {
      description: `Timestamp: ${updatedTimestamp}. Narration updated.`,
    });
  };

  const resetToDefaults = () => {
    const defaultCustomers = INITIAL_CUSTOMERS.map(normalizeCustomerRecord).filter((c): c is CustomerRecord => Boolean(c));
    setCustomers(defaultCustomers);
    setTransactions(INITIAL_TRANSACTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    try {
      localStorage.removeItem(STORAGE_KEYS.DELETED_CUSTOMERS);
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(defaultCustomers));
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      localStorage.setItem("pjtb_current_portal_customer", JSON.stringify(defaultCustomers[0] || null));
      localStorage.setItem(`pjtb_portal_tx_${INITIAL_CUSTOMERS[0]?.customerId || "PJ-89201"}`, JSON.stringify([]));
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("pjtb_sync"));
    } catch {
      // ignore
    }
    toast.info("System records reloaded to default state (1 testrun account)");
  };

  const refreshAllData = useCallback(() => {
    handleSync();
    void syncSharedApplications();
  }, [handleSync, syncSharedApplications]);

  return (
    <AdminDataContext.Provider
      value={{
        customers,
        transactions,
        auditLogs,
        admin: activeAdmin,
        notifications,
        currentView,
        setCurrentView: changeView,
        canGoBack,
        canGoForward,
        navigateBack,
        navigateForward,
        isLoadingView,
        setIsLoadingView,
        selectedCustomerId,
        setSelectedCustomerId,
        selectedTransactionId,
        setSelectedTransactionId,
        globalSearch,
        setGlobalSearch,
        updateCustomerStatus,
        updateVerificationStatus,
        addCustomerNote,
        editCustomerDetails,
        markNotificationRead,
        markAllNotificationsRead,
        activeAdmin,
        approveCustomerAccount,
        deleteCustomer,
        creditDebitCustomer,
        editTransaction,
        resetToDefaults,
        refreshAllData,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error("useAdminData must be used within an AdminDataProvider");
  }
  return context;
};
