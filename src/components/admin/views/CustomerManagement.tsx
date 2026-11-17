import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Eye,
  FileCheck2,
  Edit,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Plus,
  DollarSign,
  PlusCircle,
  MinusCircle,
  Trash2,
} from "lucide-react";
import { useAdminData } from "../AdminDataContext";
import { CustomerRecord, CustomerAccountStatus, VerificationStatus } from "../types";
import { CustomerProfileModal } from "./CustomerProfileModal";
import { StatusActionModal } from "./StatusActionModal";
import { CreditDebitModal } from "./CreditDebitModal";

interface CustomerManagementProps {
  initialFilter?: string;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({ initialFilter = "All" }) => {
  const { customers, globalSearch, setGlobalSearch, setCurrentView, approveCustomerAccount, deleteCustomer, refreshAllData } = useAdminData();

  // Search & Filter state
  const [filterTab, setFilterTab] = useState<string>(initialFilter);
  const [sortField, setSortField] = useState<"name" | "date" | "status" | "verification">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Sync filterTab when initialFilter prop changes (e.g. from sidebar view switch)
  React.useEffect(() => {
    setFilterTab(initialFilter);
    setCurrentPage(1);
  }, [initialFilter]);

  // Active Menu / Modals state
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [profileModalEditMode, setProfileModalEditMode] = useState<boolean>(false);
  const [customerToDelete, setCustomerToDelete] = useState<CustomerRecord | null>(null);
  const [profileModalInitialTab, setProfileModalInitialTab] = useState<
    "profile" | "account" | "transactions" | "verification" | "security" | "notes"
  >("profile");
  const [statusModalOpen, setStatusModalOpen] = useState<boolean>(false);
  const [targetStatus, setTargetStatus] = useState<CustomerAccountStatus | null>(null);
  const [creditDebitTarget, setCreditDebitTarget] = useState<CustomerRecord | null>(null);
  const [creditDebitType, setCreditDebitType] = useState<"Credit" | "Debit">("Credit");
  const [creditDebitOpen, setCreditDebitOpen] = useState(false);

  const openCreditDebit = (c: CustomerRecord, type: "Credit" | "Debit" = "Credit") => {
    setCreditDebitTarget(c);
    setCreditDebitType(type);
    setCreditDebitOpen(true);
    setActiveMenuId(null);
  };

  // Filter & Search Logic
  const filteredCustomers = useMemo(() => {
    if (!Array.isArray(customers)) return [];
    return customers.filter((c) => {
      if (!c) return false;
      // Filter tab
      if (filterTab === "Active" && c.accountStatus !== "Active") return false;
      if (filterTab === "Pending" && c.accountStatus !== "Pending" && c.verificationStatus !== "Pending") return false;
      if (filterTab === "Verified" && c.verificationStatus !== "Verified") return false;
      if (filterTab === "Unverified" && c.verificationStatus !== "Unverified") return false;
      if (filterTab === "Restricted" && c.accountStatus !== "Restricted") return false;
      if (filterTab === "Suspended" && c.accountStatus !== "Suspended") return false;

      // Search term
      if (globalSearch.trim()) {
        const query = globalSearch.toLowerCase();
        const matchesName = (c.fullName || "").toLowerCase().includes(query);
        const matchesEmail = (c.email || "").toLowerCase().includes(query);
        const matchesId = (c.customerId || "").toLowerCase().includes(query);
        const matchesAccount = (c.accountNumber || "").toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesId && !matchesAccount) return false;
      }

      return true;
    });
  }, [customers, filterTab, globalSearch]);

  // Sorting
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      if (!a || !b) return 0;
      let comp = 0;
      if (sortField === "name") {
        comp = (a.fullName || "").localeCompare(b.fullName || "");
      } else if (sortField === "date") {
        const timeA = a.registrationDate ? new Date(a.registrationDate).getTime() : 0;
        const timeB = b.registrationDate ? new Date(b.registrationDate).getTime() : 0;
        comp = (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
      } else if (sortField === "status") {
        comp = (a.accountStatus || "").localeCompare(b.accountStatus || "");
      } else if (sortField === "verification") {
        comp = (a.verificationStatus || "").localeCompare(b.verificationStatus || "");
      }
      return sortOrder === "asc" ? comp : -comp;
    });
  }, [filteredCustomers, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedCustomers.length / rowsPerPage) || 1;
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const toggleSort = (field: "name" | "date" | "status" | "verification") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const openProfile = (
    c: CustomerRecord,
    tab: "profile" | "account" | "transactions" | "verification" | "security" | "notes" = "profile",
    editMode: boolean = false
  ) => {
    setSelectedCustomer(c);
    setProfileModalInitialTab(tab);
    setProfileModalEditMode(editMode);
    setProfileModalOpen(true);
    setActiveMenuId(null);
  };

  const openStatusChange = (c: CustomerRecord, status: CustomerAccountStatus) => {
    setSelectedCustomer(c);
    setTargetStatus(status);
    setStatusModalOpen(true);
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Title & Filters Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-ivory">Customer Management Registry</h2>
          <p className="text-xs text-ivory/60">
            Total of {customers.length} registered institutional and private accounts · Database backed
          </p>
        </div>

        {/* Global Search & Sync inside view */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ivory/50" />
            <input
              type="text"
              placeholder="Search by name, ID, email..."
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-xl border border-ivory/15 bg-white/[0.05] pl-10 pr-4 py-2 text-xs text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none w-60 sm:w-72 backdrop-blur-md"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              refreshAllData();
            }}
            className="rounded-xl border border-gold/40 bg-gold/15 px-3 py-2 text-xs font-semibold text-gold hover:bg-gold/25 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
            title="Synchronize registry with latest registrations"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sync Registry</span>
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ivory/10 pb-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: "All", label: "All Customers", count: Array.isArray(customers) ? customers.filter(Boolean).length : 0 },
            {
              id: "Active",
              label: "Active",
              count: Array.isArray(customers)
                ? customers.filter((c) => Boolean(c && c.accountStatus === "Active")).length
                : 0,
            },
            {
              id: "Pending",
              label: "Pending Approval",
              count: Array.isArray(customers)
                ? customers.filter((c) => Boolean(c && (c.accountStatus === "Pending" || c.verificationStatus === "Pending")))
                    .length
                : 0,
            },
            {
              id: "Verified",
              label: "Verified",
              count: Array.isArray(customers)
                ? customers.filter((c) => Boolean(c && c.verificationStatus === "Verified")).length
                : 0,
            },
            {
              id: "Restricted",
              label: "Restricted",
              count: Array.isArray(customers)
                ? customers.filter((c) => Boolean(c && c.accountStatus === "Restricted")).length
                : 0,
            },
            {
              id: "Suspended",
              label: "Suspended",
              count: Array.isArray(customers)
                ? customers.filter((c) => Boolean(c && c.accountStatus === "Suspended")).length
                : 0,
            },
          ].map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilterTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`rounded-xl px-3.5 py-1.5 transition-all font-medium flex items-center gap-1.5 ${
                  isActive
                    ? "border border-gold/40 bg-gold/15 text-gold font-semibold shadow-sm"
                    : "border border-transparent text-ivory/70 hover:bg-ivory/5 hover:text-ivory"
                }`}
              >
                <span>{tab.label}</span>
                <span className="rounded-full bg-ivory/10 px-1.5 py-0.2 text-[10px] text-ivory/60 font-mono">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Rows per page selector */}
        <div className="flex items-center gap-2 text-xs text-ivory/60">
          <span>Rows:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded-lg border border-ivory/20 bg-navy-deep px-2 py-1 text-xs text-ivory focus:border-gold focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Main Glassmorphic Customer Table */}
      <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-ivory/10 bg-navy-deep/80 text-[11px] font-semibold uppercase tracking-wider text-ivory/60">
              <tr>
                <th scope="col" className="py-4 pl-6 pr-3">
                  <button
                    type="button"
                    onClick={() => toggleSort("name")}
                    className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
                  >
                    Customer Profile <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th scope="col" className="px-3 py-4">Customer ID</th>
                <th scope="col" className="px-3 py-4">Masked Account</th>
                <th scope="col" className="px-3 py-4">Account Type</th>
                <th scope="col" className="px-3 py-4">Total Balance</th>
                <th scope="col" className="px-3 py-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("date")}
                    className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
                  >
                    Registered <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th scope="col" className="px-3 py-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("verification")}
                    className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
                  >
                    Verification <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th scope="col" className="px-3 py-4">
                  <button
                    type="button"
                    onClick={() => toggleSort("status")}
                    className="inline-flex items-center gap-1.5 hover:text-gold transition-colors"
                  >
                    Status <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th scope="col" className="py-4 pl-3 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory/5 text-ivory">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-ivory/50">
                    No customer accounts match the selected criteria or search term.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => {
                  const isMenuOpen = activeMenuId === c.id;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-white/[0.04] transition-colors group cursor-pointer"
                      onClick={() => openProfile(c, "profile")}
                    >
                      {/* Name & Initials */}
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 font-display font-semibold text-gold">
                            {c.initials}
                          </div>
                          <div>
                            <p className="font-semibold text-ivory group-hover:text-gold transition-colors">
                              {c.fullName}
                            </p>
                            <p className="text-[11px] text-ivory/50">{c.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Customer ID */}
                      <td className="px-3 py-4 font-mono font-medium text-ivory/80">
                        {c.customerId}
                      </td>

                      {/* Masked Account Number */}
                      <td className="px-3 py-4 font-mono text-gold">
                        {c.maskedAccountNumber}
                      </td>

                      {/* Account Type */}
                      <td className="px-3 py-4">
                        <span className="rounded-lg border border-ivory/10 bg-navy/50 px-2 py-0.5 text-[11px] text-ivory/80">
                          {c.accountType}
                        </span>
                      </td>

                      {/* Balance */}
                      <td className="px-3 py-4 font-mono font-medium text-ivory">
                        {c.currency} {c.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Registration Date */}
                      <td className="px-3 py-4 font-mono text-ivory/60">
                        {c.registrationDate}
                      </td>

                      {/* Verification Status */}
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            c.verificationStatus === "Verified"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : c.verificationStatus === "Pending"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                              : "border-red-500/30 bg-red-500/10 text-red-400"
                          }`}
                        >
                          {c.verificationStatus}
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                            c.accountStatus === "Active"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : c.accountStatus === "Pending"
                              ? "border-gold/40 bg-gold/15 text-gold"
                              : c.accountStatus === "Restricted"
                              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                              : c.accountStatus === "Suspended"
                              ? "border-red-500/30 bg-red-500/10 text-red-400"
                              : "border-purple-500/30 bg-purple-500/10 text-purple-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              c.accountStatus === "Active"
                                ? "bg-emerald-400 animate-pulse"
                                : c.accountStatus === "Pending"
                                ? "bg-gold animate-ping"
                                : c.accountStatus === "Restricted"
                                ? "bg-amber-400"
                                : "bg-red-400"
                            }`}
                          />
                          {c.accountStatus}
                        </span>
                      </td>

                      {/* Three-Dot Actions Menu */}
                      <td className="py-4 pl-3 pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {(c.accountStatus === "Pending" || c.verificationStatus === "Pending") && (
                            <button
                              type="button"
                              onClick={() => approveCustomerAccount(c.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/30 transition-all shadow-sm"
                              title="Approve Customer Application & Activate Account"
                            >
                              <CheckCircle2 className="h-3 w-3" /> Approve
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openCreditDebit(c, "Credit")}
                            className="inline-flex items-center gap-1 rounded-lg border border-gold/30 bg-gold/10 px-2 py-1 text-[11px] font-semibold text-gold hover:bg-gold/20 transition-all shadow-sm"
                            title="Credit or Debit Customer Account"
                          >
                            <DollarSign className="h-3 w-3" /> Funds
                          </button>
                          <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(isMenuOpen ? null : c.id)}
                            className="rounded-lg p-1.5 text-ivory/60 hover:bg-ivory/10 hover:text-ivory transition-colors"
                            aria-label="Administrative action menu"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 mt-1 w-56 origin-top-right rounded-xl border border-gold/30 bg-navy-deep/95 p-1.5 text-ivory shadow-2xl backdrop-blur-xl z-30 animate-in fade-in zoom-in-95 duration-150">
                              <button
                                type="button"
                                onClick={() => openProfile(c, "profile", false)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-ivory/90 hover:bg-ivory/10"
                              >
                                <Eye className="h-3.5 w-3.5 text-gold" /> View Customer Profile
                              </button>
                              <button
                                type="button"
                                onClick={() => openProfile(c, "profile", true)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-gold hover:bg-gold/15 font-semibold"
                              >
                                <Edit className="h-3.5 w-3.5 text-gold" /> Manage & Edit All Details
                              </button>
                              <button
                                type="button"
                                onClick={() => openProfile(c, "verification", false)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-ivory/90 hover:bg-ivory/10"
                              >
                                <FileCheck2 className="h-3.5 w-3.5 text-emerald-400" /> Review Verification
                              </button>
                              <button
                                type="button"
                                onClick={() => openProfile(c, "transactions", false)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-ivory/90 hover:bg-ivory/10"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-gold" /> Review Account Activity
                              </button>

                                                            <button
                                type="button"
                                onClick={() => openCreditDebit(c, "Credit")}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-emerald-400 hover:bg-emerald-500/15 font-semibold"
                              >
                                <PlusCircle className="h-3.5 w-3.5" /> + Credit Account
                              </button>
                              <button
                                type="button"
                                onClick={() => openCreditDebit(c, "Debit")}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/15 font-semibold"
                              >
                                <MinusCircle className="h-3.5 w-3.5" /> − Debit Account
                              </button>

                              <div className="my-1 border-t border-ivory/10" />

                              {c.accountStatus !== "Active" ? (
                                <button
                                  type="button"
                                  onClick={() => openStatusChange(c, "Active")}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-emerald-400 hover:bg-emerald-500/15"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" /> Restore Account
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openStatusChange(c, "Restricted")}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-amber-400 hover:bg-amber-500/15"
                                  >
                                    <AlertTriangle className="h-3.5 w-3.5" /> Restrict Account
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openStatusChange(c, "Suspended")}
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/15"
                                  >
                                    <ShieldAlert className="h-3.5 w-3.5" /> Suspend Account
                                  </button>
                                </>
                              )}

                              <div className="my-1 border-t border-ivory/10" />

                              <button
                                type="button"
                                onClick={() => {
                                  setCustomerToDelete(c);
                                  setActiveMenuId(null);
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/15 font-semibold"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-red-400" /> Delete Customer
                              </button>
                            </div>
                          )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-ivory/10 bg-navy-deep/60 px-6 py-4 text-xs text-ivory/60">
          <div>
            Showing <strong className="text-ivory">{(currentPage - 1) * rowsPerPage + 1}</strong> to{" "}
            <strong className="text-ivory">
              {Math.min(currentPage * rowsPerPage, sortedCustomers.length)}
            </strong>{" "}
            of <strong className="text-gold">{sortedCustomers.length}</strong> accounts
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-ivory/15 p-1.5 hover:bg-ivory/10 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono text-ivory">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-ivory/15 p-1.5 hover:bg-ivory/10 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {profileModalOpen && selectedCustomer && (
        <CustomerProfileModal
          customer={selectedCustomer}
          initialTab={profileModalInitialTab}
          initialEditMode={profileModalEditMode}
          onClose={() => setProfileModalOpen(false)}
          onOpenStatusAction={(status) => {
            setProfileModalOpen(false);
            openStatusChange(selectedCustomer, status);
          }}
        />
      )}

      {/* Credit / Debit Modal */}
      {creditDebitOpen && creditDebitTarget && (
        <CreditDebitModal
          customer={creditDebitTarget}
          initialType={creditDebitType}
          onClose={() => setCreditDebitOpen(false)}
        />
      )}

      {/* Status Action Modal */}
      {statusModalOpen && selectedCustomer && (
        <StatusActionModal
          customer={selectedCustomer}
          targetStatus={targetStatus}
          onClose={() => {
            setStatusModalOpen(false);
            setTargetStatus(null);
          }}
        />
      )}

      {/* Permanent Account Deletion Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-[#0A1628] p-6 shadow-2xl text-ivory space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 border border-red-500/30">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold">Permanently Delete Customer</h3>
                <p className="text-xs text-ivory/60 font-mono">ID: {customerToDelete.customerId}</p>
              </div>
            </div>

            <p className="text-xs text-ivory/80 leading-relaxed">
              Are you sure you want to permanently delete customer account{" "}
              <strong className="text-ivory">{customerToDelete.fullName}</strong> ({customerToDelete.maskedAccountNumber})?
              This will remove all records, purge customer portal sessions, and permanently erase ledger associations.
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="rounded-xl border border-ivory/20 px-4 py-2 text-xs text-ivory/70 hover:bg-ivory/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCustomer(customerToDelete.id);
                  setCustomerToDelete(null);
                }}
                className="rounded-xl border border-red-500/50 bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                Confirm Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
