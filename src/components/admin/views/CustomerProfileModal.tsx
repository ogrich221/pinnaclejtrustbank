import React, { useState, useEffect } from "react";
import {
  X,
  User,
  CreditCard,
  History,
  FileCheck2,
  ShieldCheck,
  StickyNote,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  FileText,
  Save,
  Edit,
  Trash2,
  DollarSign,
  Building,
  Globe,
  Layers,
  Check,
  XCircle,
} from "lucide-react";
import { CustomerRecord, AdministrativeNote } from "../types";
import { CreditDebitModal } from "./CreditDebitModal";
import { useAdminData } from "../AdminDataContext";

interface CustomerProfileModalProps {
  customer: CustomerRecord | null;
  initialTab?: "profile" | "account" | "transactions" | "verification" | "security" | "notes";
  initialEditMode?: boolean;
  onClose: () => void;
  onOpenStatusAction: (status: CustomerRecord["accountStatus"]) => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  customer: customerSnapshot,
  initialTab = "profile",
  initialEditMode = false,
  onClose,
  onOpenStatusAction,
}) => {
  const {
    customers,
    transactions,
    updateVerificationStatus,
    addCustomerNote,
    editCustomerDetails,
    approveCustomerAccount,
    rejectCustomerAccount,
    deleteCustomer,
  } = useAdminData();
  const customer = customers.find(
    (record) => record.id === customerSnapshot?.id || record.customerId === customerSnapshot?.customerId
  ) || customerSnapshot;
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [showCreditDebitModal, setShowCreditDebitModal] = useState(false);
  const [creditDebitModalType, setCreditDebitModalType] = useState<"Credit" | "Debit">("Credit");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Edit form state for All Profile & Account Information
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [editForm, setEditForm] = useState({
    fullName: customer?.fullName || "",
    customerId: customer?.customerId || "",
    accountNumber: customer?.accountNumber || "",
    accountType: customer?.accountType || "Premier Checking",
    currency: customer?.currency || "USD",
    balance: customer?.balance ?? 0,
    availableBalance: customer?.availableBalance ?? 0,
    dailyTransferLimit: customer?.dailyTransferLimit || 50000,
    email: customer?.email || "",
    phone: customer?.phone || "",
    street: customer?.address?.street || "",
    city: customer?.address?.city || "",
    postalCode: customer?.address?.postalCode || "",
    country: customer?.address?.country || "",
    jurisdiction: customer?.jurisdiction || "",
    accountStatus: customer?.accountStatus || "Active",
    verificationStatus: customer?.verificationStatus || "Verified",
    registrationDate: customer?.registrationDate || "",
  });

  // Sync form when customer updates or when entering edit mode
  useEffect(() => {
    if (customer) {
      setEditForm({
        fullName: customer.fullName || "",
        customerId: customer.customerId || "",
        accountNumber: customer.accountNumber || "",
        accountType: customer.accountType || "Premier Checking",
        currency: customer.currency || "USD",
        balance: customer.balance ?? 0,
        availableBalance: customer.availableBalance ?? 0,
        dailyTransferLimit: customer.dailyTransferLimit || 50000,
        email: customer.email || "",
        phone: customer.phone || "",
        street: customer.address?.street || "",
        city: customer.address?.city || "",
        postalCode: customer.address?.postalCode || "",
        country: customer.address?.country || "",
        jurisdiction: customer.jurisdiction || "",
        accountStatus: customer.accountStatus || "Active",
        verificationStatus: customer.verificationStatus || "Verified",
        registrationDate: customer.registrationDate || "",
      });
    }
  }, [customer, isEditing]);

  // New Note state
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState<AdministrativeNote["category"]>("General");

  // New Document modal state
  const [addDocModalOpen, setAddDocModalOpen] = useState(false);
  const [newDocForm, setNewDocForm] = useState({
    documentType: "Passport" as const,
    documentNumber: "",
    issueDate: "2024-01-01",
    expiryDate: "2034-01-01",
    status: "Approved" as const,
  });

  if (!customer) return null;

  const customerTransactions = transactions.filter((t) => t.customerId === customer.customerId);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = editForm.fullName.trim();
    const cleanAcct = editForm.accountNumber.trim();
    const newInitials = cleanName ? cleanName.split(/\s+/).map((n) => n[0]).slice(0, 2).join("").toUpperCase() : customer.initials;
    const newMasked = cleanAcct.length > 4 ? `PJTB-••••-${cleanAcct.slice(-4)}` : cleanAcct;

    editCustomerDetails(customer.id, {
      fullName: cleanName,
      initials: newInitials,
      customerId: editForm.customerId.trim(),
      accountNumber: cleanAcct,
      maskedAccountNumber: newMasked,
      accountType: editForm.accountType as any,
      currency: editForm.currency as any,
      balance: Number(editForm.balance),
      availableBalance: Number(editForm.availableBalance),
      dailyTransferLimit: Number(editForm.dailyTransferLimit),
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      jurisdiction: editForm.jurisdiction.trim(),
      registrationDate: editForm.registrationDate,
      accountStatus: editForm.accountStatus as any,
      verificationStatus: editForm.verificationStatus as any,
      address: {
        street: editForm.street.trim(),
        city: editForm.city.trim(),
        postalCode: editForm.postalCode.trim(),
        country: editForm.country.trim(),
      },
    });
    setIsEditing(false);
  };

  const handleDeleteCustomer = () => {
    deleteCustomer(customer.id);
    setDeleteConfirmOpen(false);
    onClose();
  };

  const handleAddCustomDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocForm.documentNumber.trim()) return;
    const newDoc = {
      id: `doc-${Date.now()}`,
      documentType: newDocForm.documentType,
      documentNumber: newDocForm.documentNumber.trim(),
      issueDate: newDocForm.issueDate,
      expiryDate: newDocForm.expiryDate,
      status: newDocForm.status,
      submittedAt: new Date().toISOString().split("T")[0] || new Date().toISOString().slice(0, 10),
    };
    editCustomerDetails(customer.id, {
      documents: [newDoc, ...(customer.documents || [])],
    });
    setAddDocModalOpen(false);
    setNewDocForm({
      documentType: "Passport",
      documentNumber: "",
      issueDate: "2024-01-01",
      expiryDate: "2034-01-01",
      status: "Approved",
    });
  };

  const handleDeleteDoc = (docId: string) => {
    const updatedDocs = (customer.documents || []).filter((d) => d.id !== docId);
    editCustomerDetails(customer.id, {
      documents: updatedDocs,
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;
    addCustomerNote(customer.id, newNoteContent.trim(), newNoteCategory);
    setNewNoteContent("");
  };

  const getStatusBadge = (status: CustomerRecord["accountStatus"]) => {
    switch (status) {
      case "Active":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
      case "Restricted":
        return "border-amber-500/30 bg-amber-500/10 text-amber-400";
      case "Suspended":
      case "Rejected":
        return "border-red-500/30 bg-red-500/10 text-red-400";
      case "Flagged":
        return "border-purple-500/30 bg-purple-500/10 text-purple-400";
      default:
        return "border-ivory/20 bg-ivory/10 text-ivory";
    }
  };

  const getVerificationBadge = (status: CustomerRecord["verificationStatus"]) => {
    switch (status) {
      case "Verified":
        return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
      case "Pending":
        return "border-amber-500/30 bg-amber-500/10 text-amber-400";
      case "Rejected":
        return "border-red-500/30 bg-red-500/10 text-red-400";
      default:
        return "border-ivory/20 bg-ivory/10 text-ivory/70";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-navy-deep/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col h-[90vh] w-full max-w-5xl rounded-2xl border border-gold/30 bg-gradient-to-b from-[#0E2140] to-[#071426] shadow-2xl text-ivory overflow-hidden">
        {/* Top Header Card */}
        <div className="border-b border-ivory/10 bg-navy/60 p-6 backdrop-blur-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {customer.avatarUrl ? (
                <img src={customer.avatarUrl} alt={customer.fullName} className="h-16 w-16 rounded-2xl border border-gold/40 object-cover shadow-md" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/20 to-navy-deep text-2xl font-display font-bold text-gold shadow-md">
                  {customer.initials}
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-display font-semibold tracking-wide text-ivory">
                    {customer.fullName}
                  </h2>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getStatusBadge(customer.accountStatus)}`}>
                    {customer.accountStatus}
                  </span>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getVerificationBadge(customer.verificationStatus)}`}>
                    KYC: {customer.verificationStatus}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ivory/60 font-mono">
                  <span>ID: <strong className="text-ivory">{customer.customerId}</strong></span>
                  <span>•</span>
                  <span>Acct: <strong className="text-gold">{customer.maskedAccountNumber}</strong></span>
                  <span>•</span>
                  <span>{customer.accountType}</span>
                </div>
              </div>
            </div>

            {/* Quick Administrative Management Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(!isEditing);
                  setActiveTab("profile");
                }}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm ${
                  isEditing
                    ? "border-gold bg-gold text-navy-deep font-bold"
                    : "border-gold/40 bg-gold/15 text-gold hover:bg-gold/25"
                }`}
                title="Manage and edit all customer details"
              >
                <Edit className="h-3.5 w-3.5" />
                <span>{isEditing ? "Exit Edit Mode" : "Edit All Details"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCreditDebitModalType("Credit");
                  setShowCreditDebitModal(true);
                }}
                className="rounded-xl border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/20 transition-colors flex items-center gap-1"
                title="Credit or Debit Customer Balance"
              >
                <DollarSign className="h-3.5 w-3.5" /> ± Balance
              </button>

              {customer.accountStatus !== "Active" ? (
                <button
                  type="button"
                  onClick={() => onOpenStatusAction("Active")}
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                >
                  Restore Account
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onOpenStatusAction("Restricted")}
                    className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/25 transition-colors"
                  >
                    Restrict
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenStatusAction("Suspended")}
                    className="rounded-xl border border-red-500/40 bg-red-500/15 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/25 transition-colors"
                  >
                    Suspend
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                className="rounded-xl border border-red-500/30 bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-colors"
                title="Permanently delete customer account"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close customer profile"
                className="rounded-xl border border-ivory/15 p-2 text-ivory/60 hover:bg-ivory/10 hover:text-ivory transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs - Horizontally scrollable on phones, wrapped on computers */}
          <div className="mt-6 flex items-center gap-2 border-t border-ivory/10 pt-4 text-xs overflow-x-auto scrollbar-none sm:flex-wrap pb-1">
            {[
              { id: "profile", label: "Profile Information", icon: User },
              { id: "account", label: "Account Information", icon: CreditCard },
              { id: "transactions", label: `Transaction History (${customerTransactions.length})`, icon: History },
              { id: "verification", label: `Verification Docs (${(customer.documents || []).length})`, icon: FileCheck2 },
              { id: "security", label: `Security & Access (${(customer.securityHistory || []).length})`, icon: ShieldCheck },
              { id: "notes", label: `Administrative Notes (${(customer.notes || []).length})`, icon: StickyNote },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 transition-all font-medium whitespace-nowrap shrink-0 ${
                    isActive
                      ? "border border-gold/40 bg-gold/15 text-gold shadow-sm font-semibold"
                      : "border border-transparent text-ivory/70 hover:bg-ivory/5 hover:text-ivory"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                    {customer.accountStatus === "Pending" && (
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-gold/40 bg-gold/10 p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-gold shrink-0" />
                <div>
                  <p className="font-semibold text-sm text-ivory">New Account Application Awaiting Administrator Approval</p>
                  <p className="text-xs text-ivory/70">
                    Review applicant documents and information. Approving will activate the account with a guaranteed 0.00 opening balance.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    approveCustomerAccount(customer.id);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-gold bg-gold px-4 py-2 text-xs font-bold text-navy-deep shadow-md transition-all hover:bg-gold-light"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve & Activate
                </button>
                <button
                  type="button"
                  onClick={() => {
                    rejectCustomerAccount(customer.id);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20"
                >
                  <XCircle className="h-4 w-4" /> Reject Application
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: PROFILE & ACCOUNT INFORMATION */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-display font-semibold text-ivory">Personal, Corporate & Banking Profile</h3>
                  <p className="text-xs text-ivory/60">Comprehensive client record, credentials, clearing parameters, and ledger balances</p>
                </div>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold/15 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/25 transition-all shadow-sm"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit All Customer Details
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-ivory/20 px-4 py-2 text-xs text-ivory/70 hover:bg-ivory/10 transition-colors"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-6">
                  {/* Identity & Contact Cards */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gold mb-3 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" /> Identity & Client Registry
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-ivory/50">Full Legal Name</p>
                        <p className="mt-1 font-semibold text-ivory text-sm">{customer.fullName}</p>
                      </div>
                      <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-ivory/50">Customer ID</p>
                        <p className="mt-1 font-mono font-semibold text-gold text-sm">{customer.customerId}</p>
                      </div>
                      <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-ivory/50">Primary Email</p>
                        <p className="mt-1 font-semibold text-ivory text-sm truncate flex items-center gap-1.5" title={customer.email}>
                          <Mail className="h-3.5 w-3.5 text-gold shrink-0" /> {customer.email}
                        </p>
                      </div>
                      <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-ivory/50">Mobile Contact</p>
                        <p className="mt-1 font-semibold text-ivory text-sm flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-gold shrink-0" /> {customer.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Account Architecture & Balances */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gold mb-3 flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" /> Account Architecture & Balances
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-xl border border-gold/30 bg-gradient-to-br from-gold/15 to-navy/50 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-gold font-semibold">Total Ledger Balance</p>
                        <p className="mt-1 text-2xl font-display font-bold text-ivory">
                          {customer.currency} {customer.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ivory/60">Custodial reserve balance</p>
                      </div>
                      <div className="rounded-xl border border-emerald-500/30 bg-navy/50 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold">Available for Transfer</p>
                        <p className="mt-1 text-2xl font-display font-bold text-emerald-400">
                          {customer.currency} {customer.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ivory/60">Liquid clearing funds</p>
                      </div>
                      <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-ivory/50">Daily Transfer Limit</p>
                        <p className="mt-1 text-2xl font-display font-bold text-ivory">
                          {customer.currency} {customer.dailyTransferLimit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </p>
                        <p className="mt-0.5 text-[11px] text-ivory/60">Authorized daily cap</p>
                      </div>
                      <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-ivory/50">Full Account Number</p>
                        <p className="mt-1 font-mono font-semibold text-ivory text-sm">{customer.accountNumber}</p>
                        <p className="mt-0.5 text-[11px] font-mono text-ivory/50">Masked: {customer.maskedAccountNumber}</p>
                      </div>
                      <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-ivory/50">Account Classification</p>
                        <p className="mt-1 font-semibold text-ivory text-sm">{customer.accountType}</p>
                        <p className="mt-0.5 text-[11px] text-gold font-medium">Base Currency: {customer.currency}</p>
                      </div>
                      <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-ivory/50">Assigned Branch Jurisdiction</p>
                        <p className="mt-1 font-semibold text-ivory text-sm">{customer.jurisdiction}</p>
                        <p className="mt-0.5 text-[11px] text-ivory/50">Registered: {customer.registrationDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Domicile */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gold mb-3 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Domicile & Regulatory Status
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4 sm:col-span-2">
                        <p className="text-[10px] uppercase tracking-wider text-ivory/50">Physical Domicile Address</p>
                        <p className="mt-1 font-semibold text-ivory text-sm">
                          {customer.address?.street || "N/A"}, {customer.address?.city || "N/A"}
                          {customer.address?.postalCode ? `, ${customer.address.postalCode}` : ""},{" "}
                          {customer.address?.country || customer.jurisdiction || "N/A"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-ivory/50">Account Operating Status</p>
                        <div className="mt-1">
                          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(customer.accountStatus)}`}>
                            {customer.accountStatus}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                        <p className="text-[10px] uppercase tracking-wider text-ivory/50">KYC Verification Status</p>
                        <div className="mt-1">
                          <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getVerificationBadge(customer.verificationStatus)}`}>
                            {customer.verificationStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-6 rounded-2xl border border-gold/40 bg-navy/70 p-6 shadow-2xl">
                  {/* Form Section 1: Legal Identity */}
                  <div>
                    <div className="flex items-center gap-2 border-b border-ivory/10 pb-2 mb-4">
                      <User className="h-4 w-4 text-gold" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gold">1. Legal Identity & Client Registration</h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className="block text-xs font-semibold text-gold mb-1">Full Legal Name *</label>
                        <input
                          type="text"
                          value={editForm.fullName}
                          onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                          required
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gold mb-1">Customer ID *</label>
                        <input
                          type="text"
                          value={editForm.customerId}
                          onChange={(e) => setEditForm({ ...editForm, customerId: e.target.value })}
                          required
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs font-mono text-ivory focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gold mb-1">Registration Date *</label>
                        <input
                          type="text"
                          value={editForm.registrationDate}
                          onChange={(e) => setEditForm({ ...editForm, registrationDate: e.target.value })}
                          required
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gold mb-1">Primary Email Address *</label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          required
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gold mb-1">Primary Mobile Contact *</label>
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          required
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Section 2: Banking Architecture & Balances */}
                  <div>
                    <div className="flex items-center gap-2 border-b border-ivory/10 pb-2 mb-4">
                      <CreditCard className="h-4 w-4 text-gold" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gold">2. Banking Architecture, Classification & Balances</h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label className="block text-xs font-semibold text-gold mb-1">Full Account Number *</label>
                        <input
                          type="text"
                          value={editForm.accountNumber}
                          onChange={(e) => setEditForm({ ...editForm, accountNumber: e.target.value })}
                          required
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs font-mono text-ivory focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gold mb-1">Account Classification</label>
                        <select
                          value={editForm.accountType}
                          onChange={(e) => setEditForm({ ...editForm, accountType: e.target.value as any })}
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                        >
                          <option value="Premier Checking">Premier Checking</option>
                          <option value="Private Wealth">Private Wealth</option>
                          <option value="Corporate Trust">Corporate Trust</option>
                          <option value="High-Yield Custody">High-Yield Custody</option>
                          <option value="Offshore Escrow">Offshore Escrow</option>
                          <option value="Institutional Treasury">Institutional Treasury</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gold mb-1">Base Currency</label>
                        <select
                          value={editForm.currency}
                          onChange={(e) => setEditForm({ ...editForm, currency: e.target.value as any })}
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="CHF">CHF (CHF)</option>
                          <option value="SGD">SGD (S$)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gold mb-1">Total Ledger Balance ({editForm.currency}) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.balance}
                          onChange={(e) => setEditForm({ ...editForm, balance: Number(e.target.value) })}
                          required
                          className="w-full rounded-xl border border-gold/40 bg-navy-deep px-3.5 py-2 text-xs font-mono text-ivory focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-emerald-400 mb-1">Available for Transfer ({editForm.currency}) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.availableBalance}
                          onChange={(e) => setEditForm({ ...editForm, availableBalance: Number(e.target.value) })}
                          required
                          className="w-full rounded-xl border border-emerald-500/40 bg-navy-deep px-3.5 py-2 text-xs font-mono text-emerald-400 focus:border-emerald-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gold mb-1">Daily Authorized Transfer Limit ({editForm.currency}) *</label>
                        <input
                          type="number"
                          step="1000"
                          value={editForm.dailyTransferLimit}
                          onChange={(e) => setEditForm({ ...editForm, dailyTransferLimit: Number(e.target.value) })}
                          required
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs font-mono text-ivory focus:border-gold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Section 3: Regulatory & Clearing Status */}
                  <div>
                    <div className="flex items-center gap-2 border-b border-ivory/10 pb-2 mb-4">
                      <ShieldCheck className="h-4 w-4 text-gold" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gold">3. Regulatory, KYC & Clearing Status</h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-semibold text-gold mb-1">Account Operating Status</label>
                        <select
                          value={editForm.accountStatus}
                          onChange={(e) => setEditForm({ ...editForm, accountStatus: e.target.value as any })}
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                        >
                          <option value="Active">Active (Fully Operational)</option>
                          <option value="Pending">Pending (Awaiting Approval)</option>
                          <option value="Restricted">Restricted (Transfers Hold)</option>
                          <option value="Suspended">Suspended (Locked)</option>
                          <option value="Flagged">Flagged (Compliance Audit)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gold mb-1">KYC Verification Status</label>
                        <select
                          value={editForm.verificationStatus}
                          onChange={(e) => setEditForm({ ...editForm, verificationStatus: e.target.value as any })}
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                        >
                          <option value="Verified">Verified</option>
                          <option value="Pending">Pending</option>
                          <option value="Unverified">Unverified</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gold mb-1">Assigned Clearing Jurisdiction *</label>
                        <input
                          type="text"
                          value={editForm.jurisdiction}
                          onChange={(e) => setEditForm({ ...editForm, jurisdiction: e.target.value })}
                          required
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Section 4: Physical Domicile */}
                  <div>
                    <div className="flex items-center gap-2 border-b border-ivory/10 pb-2 mb-4">
                      <MapPin className="h-4 w-4 text-gold" />
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-gold">4. Domicile & Physical Address</h4>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-gold mb-1">Street Address *</label>
                        <input
                          type="text"
                          value={editForm.street}
                          onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                          required
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gold mb-1">City *</label>
                        <input
                          type="text"
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                          required
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gold mb-1">Postal / ZIP Code</label>
                        <input
                          type="text"
                          value={editForm.postalCode}
                          onChange={(e) => setEditForm({ ...editForm, postalCode: e.target.value })}
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-4">
                        <label className="block text-xs font-semibold text-gold mb-1">Country *</label>
                        <input
                          type="text"
                          value={editForm.country}
                          onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                          required
                          className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save / Cancel Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ivory/10">
                    <p className="text-xs text-ivory/50">
                      Changes will persist to database, refresh local storage, and broadcast real-time sync to active sessions.
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="rounded-xl border border-ivory/20 px-5 py-2 text-xs text-ivory/70 hover:bg-ivory/10 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-2 text-xs font-bold text-navy-deep hover:bg-gold-light transition-all shadow-lg"
                      >
                        <Save className="h-4 w-4" /> Save All Customer Details
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: ACCOUNT INFORMATION */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-display font-semibold text-ivory">Account Clearing Architecture & Reserves</h3>
                  <p className="text-xs text-ivory/60">Custodial reserve positions, available liquidity thresholds, and routing parameters</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCreditDebitModalType("Credit");
                      setShowCreditDebitModal(true);
                    }}
                    className="rounded-xl border border-gold/40 bg-gold/15 px-3.5 py-1.5 text-xs font-semibold text-gold hover:bg-gold/25 transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <DollarSign className="h-3.5 w-3.5" /> ± Balance Adjustment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(true);
                      setActiveTab("profile");
                    }}
                    className="rounded-xl border border-gold/30 bg-navy/60 px-3.5 py-1.5 text-xs font-semibold text-ivory hover:bg-ivory/10 transition-colors flex items-center gap-1.5"
                  >
                    <Edit className="h-3.5 w-3.5 text-gold" /> Edit Details & Limits
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/15 to-navy/60 p-5 shadow-lg">
                  <p className="text-xs uppercase tracking-wider text-gold font-semibold">Total Ledger Balance</p>
                  <p className="mt-2 text-3xl font-display font-bold text-ivory">
                    {customer.currency} {customer.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="mt-1 text-xs text-ivory/60">Includes all custodial reserves</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/30 bg-navy/60 p-5 shadow-lg">
                  <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Available for Transfer</p>
                  <p className="mt-2 text-3xl font-display font-bold text-ivory">
                    {customer.currency} {customer.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="mt-1 text-xs text-ivory/60">
                    {customer.availableBalance === 0 ? "Subject to Compliance Hold" : "Instant settlement ready"}
                  </p>
                </div>
                <div className="rounded-2xl border border-ivory/15 bg-navy/60 p-5 shadow-lg">
                  <p className="text-xs uppercase tracking-wider text-ivory/60 font-semibold">Daily Authorized Limit</p>
                  <p className="mt-2 text-3xl font-display font-bold text-ivory">
                    {customer.currency} {customer.dailyTransferLimit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="mt-1 text-xs text-ivory/60">Tier-1 executive authorization threshold</p>
                </div>
              </div>

              <div className="rounded-xl border border-ivory/10 bg-navy/40 p-6 space-y-4">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">Account Clearing Metadata</h4>
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-ivory/50">Full Account Number (Unmasked to Authorized Admin):</span>
                    <p className="mt-1 font-mono font-semibold text-ivory">{customer.accountNumber}</p>
                  </div>
                  <div>
                    <span className="text-ivory/50">Account Classification:</span>
                    <p className="mt-1 font-semibold text-ivory">{customer.accountType}</p>
                  </div>
                  <div>
                    <span className="text-ivory/50">Base Currency:</span>
                    <p className="mt-1 font-semibold text-gold">{customer.currency}</p>
                  </div>
                  <div>
                    <span className="text-ivory/50">Assigned Branch & Jurisdiction:</span>
                    <p className="mt-1 font-semibold text-ivory">{customer.jurisdiction} Clearing Office</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-ivory/10 bg-navy/40 p-6">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-gold">Customer-Saved Beneficiaries</h4>
                  <span className="text-xs text-ivory/50">{(customer.beneficiaries || []).length} saved</span>
                </div>
                {(customer.beneficiaries || []).length === 0 ? (
                  <p className="mt-4 text-xs text-ivory/50">No beneficiaries have been added from the customer portal.</p>
                ) : (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {(customer.beneficiaries || []).map((beneficiary) => (
                      <div key={beneficiary.id} className="rounded-xl border border-ivory/10 bg-navy-deep/60 p-4 text-xs">
                        <p className="font-semibold text-ivory">{beneficiary.name}</p>
                        <p className="mt-1 text-ivory/60">{beneficiary.bankName} · {beneficiary.country}</p>
                        <p className="mt-1 font-mono text-gold">{beneficiary.accountNumber}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-wider text-ivory/40">{beneficiary.type}{beneficiary.swiftBic ? ` · ${beneficiary.swiftBic}` : ""}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TRANSACTION HISTORY */}
          {activeTab === "transactions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-semibold text-ivory">
                  Chronological Transactions ({customerTransactions.length})
                </h3>
              </div>

              {customerTransactions.length === 0 ? (
                <div className="rounded-xl border border-ivory/10 bg-navy/30 p-8 text-center text-ivory/60 text-xs">
                  No historical transactions recorded for this customer in the institution ledger.
                </div>
              ) : (
                <div className="divide-y divide-ivory/10 rounded-xl border border-ivory/10 bg-navy/40 overflow-hidden">
                  {customerTransactions.map((tx) => (
                    <div key={tx.id} className="p-4 hover:bg-ivory/5 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                              tx.direction === "Inbound"
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                : "border-gold/30 bg-gold/10 text-gold"
                            }`}
                          >
                            {tx.direction === "Inbound" ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ivory">{tx.purpose}</p>
                            <p className="text-[11px] font-mono text-ivory/60">
                              Ref: {tx.reference} • {tx.type} • {tx.clearingRoute}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p
                            className={`text-base font-display font-bold ${
                              tx.direction === "Inbound" ? "text-emerald-400" : "text-ivory"
                            }`}
                          >
                            {tx.direction === "Inbound" ? "+" : "-"}
                            {tx.currency} {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </p>
                          <div className="flex items-center justify-end gap-2 text-[10px]">
                            <span className="text-ivory/50">{tx.timestamp}</span>
                            <span
                              className={`rounded px-1.5 py-0.5 font-semibold ${
                                tx.status === "Settled"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-amber-500/20 text-amber-400"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: VERIFICATION DOCUMENTS */}
          {activeTab === "verification" && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-display font-semibold text-ivory">Compliance & KYC Documents</h3>
                  <p className="text-xs text-ivory/60">Review submitted identity credentials, corporate documents, and audit clearances</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddDocModalOpen(true)}
                  className="rounded-xl border border-gold/40 bg-gold/15 px-3.5 py-1.5 text-xs font-semibold text-gold hover:bg-gold/25 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" /> Attach Custom KYC Document
                </button>
              </div>

              {(customer.documents || []).length === 0 ? (
                <div className="rounded-xl border border-ivory/10 bg-navy/30 p-8 text-center text-ivory/60 text-xs">
                  No verification documents attached yet. Click "Attach Custom KYC Document" to register one.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {(customer.documents || []).map((doc) => (
                    <div key={doc.id} className="rounded-xl border border-ivory/15 bg-navy/50 p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-5 w-5 text-gold" />
                          <div>
                            <p className="font-semibold text-sm text-ivory">{doc.documentType}</p>
                            <p className="text-xs font-mono text-ivory/60">Doc #: {doc.documentNumber}</p>
                          </div>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                            doc.status === "Approved"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : doc.status === "Rejected"
                              ? "border-red-500/30 bg-red-500/10 text-red-400"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>

                      <div className="rounded-lg border border-ivory/10 bg-navy-deep/60 p-3 text-xs space-y-1 text-ivory/70">
                        <div className="flex justify-between">
                          <span>Submitted At:</span>
                          <span className="font-mono text-ivory">{doc.submittedAt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Valid Period:</span>
                          <span className="font-mono text-ivory">{doc.issueDate} — {doc.expiryDate}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-ivory/10">
                        {doc.status !== "Approved" && (
                          <button
                            type="button"
                            onClick={() => updateVerificationStatus(customer.id, doc.id, "Approved", "Official document validated by compliance officer")}
                            className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/15 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {doc.status !== "Rejected" && (
                          <button
                            type="button"
                            onClick={() => updateVerificationStatus(customer.id, doc.id, "Rejected", "Document expired or rejected by compliance")}
                            className="flex-1 rounded-lg border border-red-500/30 bg-red-500/15 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/25 transition-colors"
                          >
                            Reject
                          </button>
                        )}
                        {doc.status !== "Pending Review" && (
                          <button
                            type="button"
                            onClick={() => updateVerificationStatus(customer.id, doc.id, "Pending Review", "Moved back to pending review")}
                            className="flex-1 rounded-lg border border-amber-500/30 bg-amber-500/15 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/25 transition-colors"
                          >
                            Mark Pending
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="rounded-lg border border-red-500/20 p-1.5 text-red-400 hover:bg-red-500/20 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SECURITY & ACCESS */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-ivory/50">Two-Factor Authentication</p>
                  <p className="mt-1 font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> Hardware Token Active
                  </p>
                </div>
                <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-ivory/50">Last Login Timestamp</p>
                  <p className="mt-1 font-semibold text-ivory font-mono">{customer.lastLogin}</p>
                </div>
                <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                  <p className="text-[11px] uppercase tracking-wider text-ivory/50">Security Posture</p>
                  <p className="mt-1 font-semibold text-gold">Grade A+ (Encrypted Session)</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gold mb-3">Recent Access & Session Log</h4>
                <div className="divide-y divide-ivory/10 rounded-xl border border-ivory/10 bg-navy/40 overflow-hidden text-xs">
                  {(customer.securityHistory || []).map((sec) => (
                    <div key={sec.id} className="p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Lock className="h-4 w-4 text-gold" />
                        <div>
                          <p className="font-semibold text-ivory">{sec.type} — {sec.device}</p>
                          <p className="text-ivory/50 font-mono">IP: {sec.ipAddress} • {sec.location}</p>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                            sec.status === "Success"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {sec.status}
                        </span>
                        <p className="mt-1 text-[10px] text-ivory/50">{sec.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ADMINISTRATIVE NOTES */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              {/* Add Note Box */}
              <form onSubmit={handleAddNote} className="rounded-xl border border-gold/30 bg-navy/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gold">
                    Add Confidential Administrative Note
                  </label>
                  <select
                    value={newNoteCategory}
                    onChange={(e) => setNewNoteCategory(e.target.value as AdministrativeNote["category"])}
                    className="rounded-lg border border-ivory/20 bg-navy-deep px-2.5 py-1 text-xs text-ivory"
                  >
                    <option value="General">General</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Security">Security</option>
                    <option value="Audit">Audit</option>
                  </select>
                </div>
                <textarea
                  rows={2}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record internal staff observations, verification findings, or audit remarks..."
                  required
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/90 p-3 text-xs text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-navy-deep hover:bg-gold-soft transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" /> Attach Internal Note
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ivory/60">
                  Historical Records ({(customer.notes || []).length})
                </h4>
                {(customer.notes || []).length === 0 ? (
                  <p className="text-xs text-ivory/50 italic">No internal notes attached yet.</p>
                ) : (
                  (customer.notes || []).map((note) => (
                    <div key={note.id} className="rounded-xl border border-ivory/10 bg-navy/40 p-4 text-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-ivory/10 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gold">{note.authorName}</span>
                          <span className="text-[10px] text-ivory/50">({note.authorRole})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-ivory/10 px-1.5 py-0.5 text-[10px] text-ivory/70">
                            {note.category}
                          </span>
                          <span className="font-mono text-[10px] text-ivory/40">{note.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-ivory/90 leading-relaxed">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Credit / Debit Modal */}
      {showCreditDebitModal && (
        <CreditDebitModal
          customer={customer}
          initialType={creditDebitModalType}
          onClose={() => setShowCreditDebitModal(false)}
        />
      )}

      {/* Permanent Account Deletion Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-[#0A1628] p-6 shadow-2xl text-ivory space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold">Permanently Delete Customer</h3>
                <p className="text-xs text-ivory/60 font-mono">ID: {customer.customerId}</p>
              </div>
            </div>

            <p className="text-xs text-ivory/80 leading-relaxed">
              Are you sure you want to permanently delete customer account{" "}
              <strong className="text-ivory">{customer.fullName}</strong> ({customer.maskedAccountNumber})?
              This will remove all records, purge customer portal sessions, and permanently erase ledger associations.
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="rounded-xl border border-ivory/20 px-4 py-2 text-xs text-ivory/70 hover:bg-ivory/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                className="rounded-xl border border-red-500/50 bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Confirm Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom KYC Document Modal */}
      {addDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-gold/40 bg-[#0A1628] p-6 shadow-2xl text-ivory space-y-4">
            <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-gold" />
                <h3 className="text-lg font-display font-semibold text-ivory">Attach Custom KYC Document</h3>
              </div>
              <button
                type="button"
                onClick={() => setAddDocModalOpen(false)}
                className="rounded-lg p-1 text-ivory/60 hover:text-ivory"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomDoc} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">Document Type</label>
                  <select
                    value={newDocForm.documentType}
                    onChange={(e) => setNewDocForm({ ...newDocForm, documentType: e.target.value as any })}
                    className="w-full rounded-xl border border-ivory/20 bg-navy px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                  >
                    <option value="Passport">Passport</option>
                    <option value="National ID">National ID</option>
                    <option value="Proof of Address">Proof of Address</option>
                    <option value="Corporate Resolution">Corporate Resolution</option>
                    <option value="Trust Deed">Trust Deed</option>
                    <option value="Tax Certificate">Tax Certificate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">Document Identifier / Number</label>
                  <input
                    type="text"
                    value={newDocForm.documentNumber}
                    onChange={(e) => setNewDocForm({ ...newDocForm, documentNumber: e.target.value })}
                    placeholder="e.g. PASS-8902148"
                    required
                    className="w-full rounded-xl border border-ivory/20 bg-navy px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={newDocForm.issueDate}
                    onChange={(e) => setNewDocForm({ ...newDocForm, issueDate: e.target.value })}
                    required
                    className="w-full rounded-xl border border-ivory/20 bg-navy px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gold mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={newDocForm.expiryDate}
                    onChange={(e) => setNewDocForm({ ...newDocForm, expiryDate: e.target.value })}
                    required
                    className="w-full rounded-xl border border-ivory/20 bg-navy px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gold mb-1">Compliance Status</label>
                  <select
                    value={newDocForm.status}
                    onChange={(e) => setNewDocForm({ ...newDocForm, status: e.target.value as any })}
                    className="w-full rounded-xl border border-ivory/20 bg-navy px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                  >
                    <option value="Approved">Approved (Verified & Cleared)</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-ivory/10">
                <button
                  type="button"
                  onClick={() => setAddDocModalOpen(false)}
                  className="rounded-xl border border-ivory/20 px-4 py-2 text-xs text-ivory/70 hover:bg-ivory/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gold px-4 py-2 text-xs font-bold text-navy-deep hover:bg-gold-light transition-colors shadow-md"
                >
                  Attach & Register Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
