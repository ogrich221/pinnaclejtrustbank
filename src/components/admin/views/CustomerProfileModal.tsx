import React, { useState } from "react";
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
} from "lucide-react";
import { CustomerRecord, AdministrativeNote } from "../types";
import { useAdminData } from "../AdminDataContext";

interface CustomerProfileModalProps {
  customer: CustomerRecord | null;
  initialTab?: "profile" | "account" | "transactions" | "verification" | "security" | "notes";
  onClose: () => void;
  onOpenStatusAction: (status: CustomerRecord["accountStatus"]) => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  customer,
  initialTab = "profile",
  onClose,
  onOpenStatusAction,
}) => {
  const { transactions, updateVerificationStatus, addCustomerNote, editCustomerDetails } = useAdminData();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Edit form state for Profile Information
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: customer?.phone || "",
    email: customer?.email || "",
    street: customer?.address.street || "",
    city: customer?.address.city || "",
    country: customer?.address.country || "",
    dailyTransferLimit: customer?.dailyTransferLimit || 0,
  });

  // New Note state
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState<AdministrativeNote["category"]>("General");

  if (!customer) return null;

  const customerTransactions = transactions.filter((t) => t.customerId === customer.customerId);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    editCustomerDetails(customer.id, {
      phone: editForm.phone,
      email: editForm.email,
      dailyTransferLimit: Number(editForm.dailyTransferLimit),
      address: {
        ...customer.address,
        street: editForm.street,
        city: editForm.city,
        country: editForm.country,
      },
    });
    setIsEditing(false);
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
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/40 bg-gradient-to-br from-gold/20 to-navy-deep text-2xl font-display font-bold text-gold shadow-md">
                {customer.initials}
              </div>
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

            {/* Quick Status Control Buttons & Close */}
            <div className="flex items-center gap-2">
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
                onClick={onClose}
                className="rounded-xl border border-ivory/15 p-2 text-ivory/60 hover:bg-ivory/10 hover:text-ivory transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-ivory/10 pt-4 text-xs">
            {[
              { id: "profile", label: "Profile Information", icon: User },
              { id: "account", label: "Account Information", icon: CreditCard },
              { id: "transactions", label: `Transaction History (${customerTransactions.length})`, icon: History },
              { id: "verification", label: `Verification Docs (${customer.documents.length})`, icon: FileCheck2 },
              { id: "security", label: `Security & Access (${customer.securityHistory.length})`, icon: ShieldCheck },
              { id: "notes", label: `Administrative Notes (${customer.notes.length})`, icon: StickyNote },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 transition-all font-medium ${
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
          {/* TAB 1: PROFILE INFORMATION */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-semibold text-ivory">Personal / Corporate Profile</h3>
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="rounded-xl border border-gold/30 bg-gold/10 px-3.5 py-1.5 text-xs font-semibold text-gold hover:bg-gold/20 transition-colors"
                  >
                    Edit Permitted Fields
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-ivory/20 px-3.5 py-1.5 text-xs text-ivory/70 hover:bg-ivory/10"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-ivory/50">Full Legal Name</p>
                    <p className="mt-1 font-semibold text-ivory">{customer.fullName}</p>
                  </div>
                  <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-ivory/50">Email Address</p>
                    <p className="mt-1 font-semibold text-ivory flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-gold" /> {customer.email}
                    </p>
                  </div>
                  <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-ivory/50">Phone Number</p>
                    <p className="mt-1 font-semibold text-ivory flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-gold" /> {customer.phone}
                    </p>
                  </div>
                  <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-ivory/50">Residential / Corporate Address</p>
                    <p className="mt-1 font-semibold text-ivory flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                      <span>{customer.address.street}, {customer.address.city}, {customer.address.country}</span>
                    </p>
                  </div>
                  <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-ivory/50">Jurisdiction & Domicile</p>
                    <p className="mt-1 font-semibold text-ivory">{customer.jurisdiction}</p>
                  </div>
                  <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                    <p className="text-[11px] uppercase tracking-wider text-ivory/50">Registration Date</p>
                    <p className="mt-1 font-semibold text-ivory flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gold" /> {customer.registrationDate}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4 rounded-xl border border-gold/30 bg-navy/60 p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold text-gold mb-1">Email Address</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gold mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gold mb-1">Street Address</label>
                      <input
                        type="text"
                        value={editForm.street}
                        onChange={(e) => setEditForm({ ...editForm, street: e.target.value })}
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gold mb-1">City</label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gold mb-1">Country</label>
                      <input
                        type="text"
                        value={editForm.country}
                        onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gold mb-1">Daily Transfer Limit ({customer.currency})</label>
                      <input
                        type="number"
                        value={editForm.dailyTransferLimit}
                        onChange={(e) => setEditForm({ ...editForm, dailyTransferLimit: Number(e.target.value) })}
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-3.5 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-xl border border-ivory/20 px-4 py-2 text-xs text-ivory/70 hover:bg-ivory/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-navy-deep hover:bg-gold-soft"
                    >
                      <Save className="h-3.5 w-3.5" /> Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: ACCOUNT INFORMATION */}
          {activeTab === "account" && (
            <div className="space-y-6">
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
                  No historical transactions recorded for this customer in the demonstration ledger.
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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-display font-semibold text-ivory">Compliance & KYC Documents</h3>
                  <p className="text-xs text-ivory/60">Review submitted identity credentials and cryptographic verification records</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {customer.documents.map((doc) => (
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
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
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

                    {doc.status === "Pending Review" && (
                      <div className="flex items-center gap-2 pt-2 border-t border-ivory/10">
                        <button
                          type="button"
                          onClick={() => updateVerificationStatus(customer.id, doc.id, "Approved", "Official document validated by compliance officer")}
                          className="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/15 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                        >
                          Approve KYC Document
                        </button>
                        <button
                          type="button"
                          onClick={() => updateVerificationStatus(customer.id, doc.id, "Rejected", "Document expired or illegible; resubmission required")}
                          className="flex-1 rounded-lg border border-red-500/30 bg-red-500/15 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/25 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
                  {customer.securityHistory.map((sec) => (
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
                  Historical Records ({customer.notes.length})
                </h4>
                {customer.notes.length === 0 ? (
                  <p className="text-xs text-ivory/50 italic">No internal notes attached yet.</p>
                ) : (
                  customer.notes.map((note) => (
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
    </div>
  );
};
