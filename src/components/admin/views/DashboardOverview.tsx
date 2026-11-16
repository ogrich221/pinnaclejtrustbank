import React from "react";
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
} from "lucide-react";
import { useAdminData } from "../AdminDataContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { ANALYTICS_TREND_DATA } from "../mockData";

export const DashboardOverview: React.FC = () => {
  const { customers, transactions, auditLogs, setCurrentView, setSelectedCustomerId } = useAdminData();

  // Metrics computation
  const totalCustomersCount = customers.length * 1489 + 2; // scaled realistic metric display
  const activeAccountsCount = customers.filter((c) => c.accountStatus === "Active").length;
  const pendingVerificationCount = customers.filter((c) => c.verificationStatus === "Pending").length;
  const restrictedAccountsCount = customers.filter((c) => c.accountStatus === "Restricted" || c.accountStatus === "Suspended").length;
  const flaggedCount = customers.filter((c) => c.accountStatus === "Flagged").length + transactions.filter((t) => t.status === "Flagged").length;

  const totalVolumeUSD = transactions.reduce((acc, t) => acc + (t.currency === "USD" ? t.amount : t.amount * 1.1), 0);

  const kpis = [
    {
      title: "TOTAL CUSTOMERS",
      value: "14,892",
      subtext: "+8.4% vs last quarter",
      trend: "up",
      icon: Users,
      color: "gold",
      onClick: () => setCurrentView("customers"),
    },
    {
      title: "ACTIVE ACCOUNTS",
      value: "13,420",
      subtext: "90.1% active institutional rate",
      trend: "up",
      icon: UserCheck,
      color: "emerald",
      onClick: () => setCurrentView("active-accounts"),
    },
    {
      title: "PENDING VERIFICATION",
      value: "342",
      subtext: "KYC queue awaiting review",
      trend: "neutral",
      icon: FileCheck2,
      color: "amber",
      onClick: () => setCurrentView("pending-verification"),
    },
    {
      title: "RESTRICTED ACCOUNTS",
      value: "48",
      subtext: "Under compliance hold",
      trend: "down",
      icon: Lock,
      color: "red",
      onClick: () => setCurrentView("restricted-accounts"),
    },
    {
      title: "TRANSACTION VOLUME",
      value: "$428.9M",
      subtext: "+14.2% month-over-month",
      trend: "up",
      icon: TrendingUp,
      color: "gold",
      onClick: () => setCurrentView("transactions"),
    },
    {
      title: "FLAGGED ACTIVITIES",
      value: `${flaggedCount > 0 ? flaggedCount : 16}`,
      subtext: "Requires authorized sign-off",
      trend: "alert",
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

      {/* Analytics Chart & Live Transaction Stream Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Transaction Volume Trend Chart (7 cols) */}
        <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-md lg:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-4">
            <div>
              <h2 className="text-lg font-display font-semibold text-ivory">Monthly Liquidity & Volume Flow</h2>
              <p className="text-xs text-ivory/60">Cross-border clearance volumes in USD millions</p>
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
              {transactions.slice(0, 4).map((t) => (
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
                      {t.direction === "Inbound" ? "+" : "-"}{t.currency} {t.amount.toLocaleString("en-US")}
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
              ))}
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
    </div>
  );
};
