import React, { createContext, useContext, useState, useEffect } from "react";
import {
  CustomerRecord,
  TransactionRecord,
  AuditLogEntry,
  StaffMember,
  SystemNotification,
  CustomerAccountStatus,
  VerificationStatus,
  AdministrativeNote,
} from "./types";
import {
  INITIAL_CUSTOMERS,
  INITIAL_TRANSACTIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_STAFF,
  INITIAL_NOTIFICATIONS,
} from "./mockData";
import { toast } from "sonner";

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
  | "permissions"
  | "staff"
  | "activity-logs"
  | "security"
  | "notifications"
  | "settings"
  | "support";

interface AdminDataContextType {
  customers: CustomerRecord[];
  transactions: TransactionRecord[];
  auditLogs: AuditLogEntry[];
  staff: StaffMember[];
  notifications: SystemNotification[];
  currentView: AdminViewId;
  setCurrentView: (view: AdminViewId) => void;
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
    newStatus: "Approved" | "Rejected",
    reason: string
  ) => void;
  addCustomerNote: (customerId: string, content: string, category: AdministrativeNote["category"]) => void;
  editCustomerDetails: (customerId: string, details: Partial<CustomerRecord>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  activeAdmin: StaffMember;
  resetToDefaults: () => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CUSTOMERS: "pjtb_admin_customers_v1",
  TRANSACTIONS: "pjtb_admin_transactions_v1",
  AUDIT_LOGS: "pjtb_admin_audit_logs_v1",
  STAFF: "pjtb_admin_staff_v1",
  NOTIFICATIONS: "pjtb_admin_notifications_v1",
};

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  const [notifications, setNotifications] = useState<SystemNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [currentView, setCurrentView] = useState<AdminViewId>("dashboard");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState<string>("");

  const activeAdmin = staff[0]; // Alexander Vance, Super Admin

  // Persistence
  useEffect(() => {
    try {
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
      ipAddress: "10.14.0.52 (Admin Console)",
      reason,
      note,
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
    const target = customers.find((c) => c.id === customerId);
    if (!target) return;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updatedNotes = [...c.notes];
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
      })
    );

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
    newStatus: "Approved" | "Rejected",
    reason: string
  ) => {
    const target = customers.find((c) => c.id === customerId);
    if (!target) return;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updatedDocs = c.documents.map((d) => (d.id === docId ? { ...d, status: newStatus } : d));
          const allApproved = updatedDocs.every((d) => d.status === "Approved");
          const anyRejected = updatedDocs.some((d) => d.status === "Rejected");
          const overallVerification: VerificationStatus = anyRejected
            ? "Rejected"
            : allApproved
            ? "Verified"
            : "Pending";

          return {
            ...c,
            documents: updatedDocs,
            verificationStatus: overallVerification,
          };
        }
        return c;
      })
    );

    logAuditEntry(
      newStatus === "Approved" ? "APPROVE_VERIFICATION" : "REJECT_VERIFICATION",
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
    const target = customers.find((c) => c.id === customerId);
    if (!target) return;

    const newNote: AdministrativeNote = {
      id: `note-${Date.now()}`,
      authorName: activeAdmin.name,
      authorRole: activeAdmin.role,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      content,
      category,
    };

    setCustomers((prev) =>
      prev.map((c) => (c.id === customerId ? { ...c, notes: [newNote, ...c.notes] } : c))
    );

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
    const target = customers.find((c) => c.id === customerId);
    if (!target) return;

    setCustomers((prev) => prev.map((c) => (c.id === customerId ? { ...c, ...details } : c)));

    logAuditEntry(
      "EDIT_CUSTOMER_PROFILE",
      target.customerId,
      `Customer: ${target.fullName}`,
      "Authorized administrative update of profile metadata",
      JSON.stringify(Object.keys(details))
    );

    toast.success("Customer details updated", {
      description: "Changes applied successfully to customer registry.",
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.info("All notifications marked as read");
  };

  const resetToDefaults = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setStaff(INITIAL_STAFF);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    toast.info("Demonstration database reset to default state");
  };

  return (
    <AdminDataContext.Provider
      value={{
        customers,
        transactions,
        auditLogs,
        staff,
        notifications,
        currentView,
        setCurrentView,
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
        resetToDefaults,
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
