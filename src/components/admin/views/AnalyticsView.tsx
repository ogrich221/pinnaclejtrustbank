import React, { useState } from "react";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  PieChart as PieChartIcon,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ANALYTICS_TREND_DATA } from "../mockData";

export const AnalyticsView: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>("Last 30 Days");

  const depositWithdrawalData = [
    { name: "Week 1", deposits: 48, withdrawals: 28 },
    { name: "Week 2", deposits: 62, withdrawals: 35 },
    { name: "Week 3", deposits: 85, withdrawals: 42 },
    { name: "Week 4", deposits: 93, withdrawals: 35 },
  ];

  const verificationFunnel = [
    { label: "Submitted KYC", value: "1,240", percent: 100, color: "bg-blue-400" },
    { label: "Biometric Facial Match", value: "1,180", percent: 95.1, color: "bg-cyan-400" },
    { label: "Proof of Funds Certified", value: "1,040", percent: 83.8, color: "bg-gold" },
    { label: "Fully Approved & Issued", value: "982", percent: 79.2, color: "bg-emerald-400" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Date Filter */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-ivory">Executive Analytics & Intelligence</h2>
          <p className="text-xs text-ivory/60">
            Real-time reporting across global institutional liquidity and account growth
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-1.5 rounded-xl border border-ivory/15 bg-navy-deep/80 p-1 text-xs backdrop-blur-md">
          {["Today", "Last 7 Days", "Last 30 Days", "Last 90 Days"].map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDateRange(range)}
              className={`rounded-lg px-3 py-1.5 transition-colors font-medium ${
                dateRange === range
                  ? "bg-gold text-navy-deep font-bold shadow-sm"
                  : "text-ivory/70 hover:text-ivory"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-5 backdrop-blur-md">
          <span className="text-[10px] uppercase font-mono tracking-wider text-ivory/50">Total Gross Volume</span>
          <p className="mt-2 text-2xl font-display font-bold text-gold">$428,950,210.00</p>
          <span className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +14.2% from prior period
          </span>
        </div>

        <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-5 backdrop-blur-md">
          <span className="text-[10px] uppercase font-mono tracking-wider text-ivory/50">Inbound Capital Growth</span>
          <p className="mt-2 text-2xl font-display font-bold text-emerald-400">+$288.4M</p>
          <span className="mt-1 text-xs text-ivory/60">Across 672 wire transactions</span>
        </div>

        <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-5 backdrop-blur-md">
          <span className="text-[10px] uppercase font-mono tracking-wider text-ivory/50">Client Net Retention</span>
          <p className="mt-2 text-2xl font-display font-bold text-ivory">98.4%</p>
          <span className="mt-1 text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Tier-1 wealth retention
          </span>
        </div>

        <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-5 backdrop-blur-md">
          <span className="text-[10px] uppercase font-mono tracking-wider text-ivory/50">Avg KYC Turnaround</span>
          <p className="mt-2 text-2xl font-display font-bold text-ivory">4.2 Hours</p>
          <span className="mt-1 text-xs text-emerald-400">38% faster than benchmark</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Customer Growth Trend */}
        <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-md">
          <div className="border-b border-ivory/10 pb-4">
            <h3 className="text-base font-display font-semibold text-ivory">Customer Registration Growth</h3>
            <p className="text-xs text-ivory/60">Verified private wealth & corporate client onboarding</p>
          </div>
          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ANALYTICS_TREND_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#A7B2C2" fontSize={11} tickLine={false} />
                <YAxis stroke="#A7B2C2" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#071426",
                    borderColor: "#10B981",
                    borderRadius: "0.75rem",
                    color: "#F5F7FA",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="customers" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#custGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Deposits vs Withdrawals Breakdown */}
        <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-md">
          <div className="border-b border-ivory/10 pb-4">
            <h3 className="text-base font-display font-semibold text-ivory">Deposit vs Withdrawal Activity (USD M)</h3>
            <p className="text-xs text-ivory/60">Weekly net institutional liquidity balance</p>
          </div>
          <div className="mt-6 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depositWithdrawalData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#A7B2C2" fontSize={11} tickLine={false} />
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
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="deposits" name="Inbound Deposits ($M)" fill="#D4AF6A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withdrawals" name="Outbound Wires ($M)" fill="#4B6A9B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Verification Funnel & Compliance Progress */}
      <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-md">
        <h3 className="text-base font-display font-semibold text-ivory">Onboarding & Verification Funnel Analysis</h3>
        <p className="text-xs text-ivory/60 mb-6">Stage-by-stage completion throughput for current reporting cycle</p>

        <div className="space-y-4">
          {verificationFunnel.map((step) => (
            <div key={step.label} className="space-y-1.5 text-xs">
              <div className="flex justify-between font-medium">
                <span className="text-ivory">{step.label}</span>
                <span className="text-gold font-mono">{step.value} accounts ({step.percent}%)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-ivory/10 overflow-hidden">
                <div className={`h-full rounded-full ${step.color}`} style={{ width: `${step.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
