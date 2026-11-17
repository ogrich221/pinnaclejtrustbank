import React, { useState } from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  AlertOctagon,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  FileCheck2,
  Lock,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAdminData } from "../AdminDataContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ANALYTICS_TREND_DATA } from "../mockData";
import { CustomerProfileModal } from "./CustomerProfileModal";
import { CustomerRecord } from "../types";

export const DashboardOverview: React.FC = () => {
  const { customers, transactions, auditLogs, setCurrentView, setSelectedCustomerId, approveCustomerAccount, rejectCustomerAccount } = useAdminData();
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState<CustomerRecord | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Metrics computation from real live state with complete null safety
  const totalCustomersCount = Array.isArray(customers) ? customers.filter(Boolean).length : 0;
  const activeAccountsCount = Array.isArray(customers)
    ? customers.filter((c) => Boolean(c && c.accountStatus === "Active")).length
    : 0;
  const pendingCustomers = Array.isArray(customers)
    ? customers.filter(
        (c) => Boolean(c && (c.verificationStatus === "Pending" || c.accountStatus === "Pending"))
      )
    : [];
  const pendingVerificationCount = pendingCustomers.length;
  const restrictedAccountsCount = Array.isArray(customers)
    ? customers.filter(
        (c) => Boolean(c && (c.accountStatus === "Restricted" || c.accountStatus === "Suspended"))
      ).length
    : 0;
  const flaggedCount =
    (Array.isArray(customers)
      ? customers.filter((c) => Boolean(c && c.accountStatus === "Flagged")).length
      : 0) +
    (Array.isArray(transactions)
      ? transactions.filter((t) => Boolean(t && t.status === "Flagged")).length
      : 0);

  const totalVolumeUSD = Array.isArray(transactions)
    ? transactions.reduce(
        (acc, t) => acc + (t && t.currency === "USD" ? t.amount || 0 : (t?.amount || 0) * 1.1),
        0
      )
    : 0;

  const kpis = [
    {
      title: "TOTAL CUSTOMERS",
      value: totalCustomersCount.toLocaleString(),
      subtext: `${totalCustomersCount} registered account${totalCustomersCount === 1 ? "" : "s"}`,
      trend: "neutral",
      icon: Users,
      color: "gold",
      onClick: () => setCurrentView("customers"),
    },
    {
      title: "ACTIVE ACCOUNTS",
      value: activeAccountsCount.toLocaleString(),
      subtext: `${totalCustomersCount > 0 ? Math.round((activeAccountsCount / totalCustomersCount) * 100) : 0}% active rate`,
      trend: activeAccountsCount > 0 ? "up" : "neutral",
      icon: UserCheck,
      color: "emerald",
      onClick: () => setCurrentView("active-accounts"),
    },
    {
      title: "PENDING VERIFICATION",
      value: pendingVerificationCount.toLocaleString(),
      subtext: pendingVerificationCount > 0 ? `${pendingVerificationCount} awaiting review` : "No pending verification",
      trend: pendingVerificationCount > 0 ? "neutral" : "up",
      icon: FileCheck2,
      color: "amber",
      onClick: () => setCurrentView("pending-verification"),
    },
    {
      title: "RESTRICTED ACCOUNTS",
      value: restrictedAccountsCount.toLocaleString(),
      subtext: restrictedAccountsCount > 0 ? `${restrictedAccountsCount} on hold` : "No restricted accounts",
      trend: "down",
      icon: Lock,
      color: "red",
      onClick: () => setCurrentView("restricted-accounts"),
    },
    {
      title: "TRANSACTION VOLUME",
      value: `$${totalVolumeUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: `${transactions.length} wire transaction${transactions.length === 1 ? "" : "s"}`,
      trend: "up",
      icon: TrendingUp,
      color: "gold",
      onClick: () => setCurrentView("transactions"),
    },
    {
      title: "FLAGGED ACTIVITIES",
      value: `${flaggedCount}`,
      subtext: flaggedCount > 0 ? "Requires authorized sign-off" : "All systems clear",
      trend: flaggedCount > 0 ? "alert" : "neutral",
      icon: AlertOctagon,
      color: "purple",
      onClick: () => setCurrentView("security"),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-r from-[#0C1B30]/90 via-[#071426]/90 to-[#0C1B30]/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold mb-3">
              <ShieldCheck className="h-3.5 w-3.5" /> High-Security Core Platform
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-ivory">
              Good day, Administrator.
            </h1>
            <p className="mt-2 text-sm text-ivory/70 max-w-2xl leading-relaxed">
              Welcome to the Pinnacle J Trust Bank management centre. Here&apos;s your institution&apos;s
              real-time operational overview across private wealth, corporate trusts, and global clearance networks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setCurrentView("customers")}
              className="rounded-xl border border-gold/40 bg-gold/15 px-4 py-2.5 text-xs font-semibold text-gold hover:bg-gold/25 transition-all shadow-md"
            >
              Customer Directory
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("transactions")}
              className="rounded-xl bg-gold px-4 py-2.5 text-xs font-semibold text-navy-deep hover:bg-gold-soft transition-all font-bold shadow-md"
            >
              Monitor Transactions
            </button>
          </div>
        </div>
      </div>

      {/* 6 Elegant Glass KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              onClick={kpi.onClick}
              className="group cursor-pointer rounded-2xl border border-ivory/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-white/[0.07] relative overflow-hidden"
            >
              {/* Subtle top indicator line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-ivory/60 font-mono">
                  {kpi.title}
                </span>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-ivory/10 bg-navy/60 text-gold transition-transform group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4">
                <p className="text-3xl font-display font-bold text-ivory tracking-tight group-hover:text-gold transition-colors">
                  {kpi.value}
                </p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-ivory/60">{kpi.subtext}</span>
                  <ChevronRight className="h-4 w-4 text-ivory/40 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actionable Pending Applications Queue */}
      {pendingCustomers.length > 0 && (
        <div className="rounded-3xl border border-gold/40 bg-gradient-to-br from-gold/15 via-[#0C1B30] to-gold/5 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gold/20 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-navy-deep font-bold shadow-md">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-display font-bold text-ivory">
                  New Customer Applications Awaiting Approval ({pendingCustomers.length})
                </h3>
                <p className="text-xs text-ivory/70">
                  Review applicant credentials and click &quot;Approve Account&quot; to activate with $0.00 opening balance.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView("pending-verification")}
              className="text-xs text-gold hover:underline font-semibold flex items-center gap-1"
            >
              View in Registry <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="divide-y divide-ivory/10 rounded-2xl border border-ivory/10 bg-navy-deep/60 overflow-hidden">
            {pendingCustomers.map((pc) => {
              if (!pc) return null;
              const initials = pc.initials || (pc.fullName ? pc.fullName.slice(0, 2).toUpperCase() : "PJ");
              const fullName = pc.fullName || "Applicant";
              const customerId = pc.customerId || pc.id || "N/A";
              const accountNumber = pc.accountNumber || "N/A";
              const accountType = pc.accountType || "Checking";
              const currency = pc.currency || "USD";
              const email = pc.email || "N/A";

              return (
                <div
                  key={pc.id || customerId}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/40 bg-gold/15 text-sm font-bold text-gold font-display shrink-0">
                      {initials}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-sm text-ivory">{fullName}</p>
                        <span className="rounded-full border border-gold/40 bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold">
                          Awaiting Approval
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-ivory/60 font-mono mt-0.5">
                        <span>
                          ID: <strong className="text-ivory">{customerId}</strong>
                        </span>
                        <span>•</span>
                        <span>{accountNumber}</span>
                        <span>•</span>
                        <span>
                          {accountType} ({currency})
                        </span>
                        <span>•</span>
                        <span>{email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => approveCustomerAccount(pc.id || customerId)}
                      className="rounded-xl border border-emerald-500 bg-emerald-500/20 px-4 py-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/30 transition-all shadow-md flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Approve & Activate Account
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectCustomerAccount(pc.id || customerId)}
                      className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2 text-xs font-semibold text-red-400 transition-all hover:bg-red-500/20"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomerForModal(pc);
                        setProfileModalOpen(true);
                      }}
                      className="rounded-xl border border-ivory/20 px-3.5 py-2 text-xs text-ivory/70 hover:bg-ivory/10 transition-colors"
                    >
                      Inspect Profile
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Analytics Chart & Live Transaction Stream Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Transaction Volume Trend Chart (7 cols) */}
        <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-md lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-4">
            <div>
              <h2 className="text-lg font-display font-semibold text-ivory">Monthly Liquidity & Volume Flow</h2>
              <p className="text-xs text-ivory/60">Cross-border clearance volumes in USD</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView("analytics")}
              className="text-xs text-gold hover:underline flex items-center gap-1 font-semibold"
            >
              Full Analytics <ExternalLink className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ANALYTICS_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF6A" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#D4AF6A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#A7B2C2" fontSize={11} tickLine={false} />
                <YAxis stroke="#A7B2C2" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#071426",
                    borderColor: "#D4AF6A",
                    borderRadius: "0.75rem",
                    color: "#F5F7FA",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="volume" stroke="#D4AF6A" strokeWidth={2} fillOpacity={1} fill="url(#volGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Operational Activity Stream (5 cols) */}
        <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-md lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-ivory/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h2 className="text-lg font-display font-semibold text-ivory">Recent High-Value Wires</h2>
              </div>
              <button
                type="button"
                onClick={() => setCurrentView("transactions")}
                className="text-xs text-gold hover:underline font-semibold"
              >
                View All
              </button>
            </div>

            <div className="mt-4 divide-y divide-ivory/10">
              {transactions.length === 0 ? (
                <div className="py-12 text-center text-xs text-ivory/50">
                  No wire transactions recorded. Clearing network in standby.
                </div>
              ) : (
                transactions.slice(0, 4).map((t) => (
                  <div key={t.id} className="py-3 flex items-center justify-between hover:bg-ivory/5 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs ${
                          t.direction === "Inbound"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-gold/30 bg-gold/10 text-gold"
                        }`}
                      >
                        {t.direction === "Inbound" ? <ArrowDownLeft className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-ivory truncate max-w-[160px]">{t.customerName}</p>
                        <p className="text-[10px] font-mono text-ivory/50">{t.reference} · {t.type}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`text-xs font-semibold font-mono ${t.direction === "Inbound" ? "text-emerald-400" : "text-ivory"}`}>
                        {t.direction === "Inbound" ? "+" : "-"}{t.currency} {t.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <span
                        className={`text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                          t.status === "Settled"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Regulatory Safety Status */}
          <div className="mt-6 rounded-xl border border-ivory/10 bg-navy/60 p-3.5 text-xs flex items-center justify-between">
            <span className="text-ivory/70 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              SWIFT / CHIPS Gateway
            </span>
            <span className="font-mono text-emerald-400 font-semibold">100% OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Inspect Customer Profile Modal */}
      {profileModalOpen && selectedCustomerForModal && (
        <CustomerProfileModal
          customer={selectedCustomerForModal}
          initialTab="profile"
          onClose={() => {
            setProfileModalOpen(false);
            setSelectedCustomerForModal(null);
          }}
          onOpenStatusAction={() => {
            setProfileModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
