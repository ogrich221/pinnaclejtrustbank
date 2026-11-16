import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldAlert,
  CheckCircle2,
  Clock,
  X,
  Eye,
  Building,
  RefreshCw,
  Edit,
} from "lucide-react";
import { useAdminData } from "../AdminDataContext";
import { TransactionRecord, TransactionType, TransactionStatus } from "../types";

interface TransactionMonitoringProps {
  initialFilter?: string;
}

export const TransactionMonitoring: React.FC<TransactionMonitoringProps> = ({ initialFilter = "All" }) => {
  const { transactions } = useAdminData();
  const [filterType, setFilterType] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [editingTx, setEditingTx] = useState<TransactionRecord | null>(null);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type/Direction filter
      if (filterType === "Deposits" && t.direction !== "Inbound") return false;
      if (filterType === "Withdrawals" && t.direction !== "Outbound") return false;
      if (filterType === "Settled" && t.status !== "Settled") return false;
      if (filterType === "Flagged" && t.status !== "Flagged") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = t.reference.toLowerCase().includes(q);
        const matchesName = t.customerName.toLowerCase().includes(q);
        const matchesId = t.customerId.toLowerCase().includes(q);
        const matchesPurpose = t.purpose.toLowerCase().includes(q);
        if (!matchesRef && !matchesName && !matchesId && !matchesPurpose) return false;
      }

      return true;
    });
  }, [transactions, filterType, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Filter Controls */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-ivory">Global Transaction Monitoring</h2>
          <p className="text-xs text-ivory/60">
            Real-time multi-currency settlement & cross-border wire inspection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ivory/50" />
            <input
              type="text"
              placeholder="Search reference, customer, purpose..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-ivory/15 bg-white/[0.05] pl-10 pr-4 py-2 text-xs text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none w-64 md:w-80 backdrop-blur-md"
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-ivory/10 pb-4 text-xs">
        {[
          { id: "All", label: "All Records", count: transactions.length },
          { id: "Deposits", label: "Inbound Deposits", count: transactions.filter((t) => t.direction === "Inbound").length },
          { id: "Withdrawals", label: "Outbound Wires", count: transactions.filter((t) => t.direction === "Outbound").length },
          { id: "Settled", label: "Settled", count: transactions.filter((t) => t.status === "Settled").length },
          { id: "Flagged", label: "Flagged Activities", count: transactions.filter((t) => t.status === "Flagged").length },
        ].map((tab) => {
          const isActive = filterType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
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

      {/* Transactions Table */}
      <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-ivory/10 bg-navy-deep/80 text-[11px] font-semibold uppercase tracking-wider text-ivory/60 font-mono">
              <tr>
                <th scope="col" className="py-4 pl-6 pr-3">Reference / Route</th>
                <th scope="col" className="px-3 py-4">Customer</th>
                <th scope="col" className="px-3 py-4">Type</th>
                <th scope="col" className="px-3 py-4">Amount</th>
                <th scope="col" className="px-3 py-4">Timestamp (UTC)</th>
                <th scope="col" className="px-3 py-4">Risk Review</th>
                <th scope="col" className="px-3 py-4">Status</th>
                <th scope="col" className="py-4 pl-3 pr-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory/5 text-ivory">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-ivory/50">
                    No transactions found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                  onClick={() => setSelectedTx(tx)}
                >
                  {/* Reference */}
                  <td className="py-4 pl-6 pr-3 font-mono">
                    <p className="font-semibold text-gold group-hover:underline">{tx.reference}</p>
                    <p className="text-[10px] text-ivory/50">{tx.clearingRoute}</p>
                  </td>

                  {/* Customer */}
                  <td className="px-3 py-4">
                    <p className="font-semibold text-ivory">{tx.customerName}</p>
                    <p className="font-mono text-[10px] text-ivory/50">ID: {tx.customerId}</p>
                  </td>

                  {/* Type */}
                  <td className="px-3 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-ivory/10 bg-navy/60 px-2 py-0.5 text-[11px]">
                      {tx.direction === "Inbound" ? (
                        <ArrowDownLeft className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="h-3 w-3 text-gold" />
                      )}
                      {tx.type}
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="px-3 py-4 font-mono font-medium">
                    <span className={tx.direction === "Inbound" ? "text-emerald-400 font-bold" : "text-ivory"}>
                      {tx.direction === "Inbound" ? "+" : "-"}
                      {tx.currency} {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </td>

                  {/* Timestamp */}
                  <td className="px-3 py-4 font-mono text-ivory/60 text-[11px]">
                    {tx.timestamp}
                  </td>

                  {/* Risk Score */}
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-ivory/10 overflow-hidden">
                        <div
                          className={`h-full ${
                            tx.riskScore > 70
                              ? "bg-red-500"
                              : tx.riskScore > 30
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                          }`}
                          style={{ width: `${tx.riskScore}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] text-ivory/60">
                        {tx.riskScore}/100 ({tx.riskLevel})
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                        tx.status === "Settled"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : tx.status === "Flagged"
                          ? "border-red-500/30 bg-red-500/10 text-red-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-4 pl-3 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(tx);
                        }}
                        className="rounded-lg p-1.5 text-ivory/60 hover:bg-ivory/10 hover:text-ivory"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTx(tx);
                        }}
                        className="rounded-lg p-1.5 text-gold/80 hover:bg-gold/15 hover:text-gold transition-colors"
                        title="Edit Date, Time & Narration"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-gold/30 bg-gradient-to-b from-[#0E2140] to-[#071426] p-6 shadow-2xl text-ivory space-y-5">
            <div className="flex items-start justify-between border-b border-ivory/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-gold">
                  Transaction Audit Inspector
                </span>
                <h3 className="text-2xl font-display font-semibold text-ivory">{selectedTx.reference}</h3>
                <p className="text-xs text-ivory/60 font-mono">Purpose: {selectedTx.purpose}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="rounded-lg p-1.5 text-ivory/60 hover:bg-ivory/10 hover:text-ivory"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* High-Level Amount & Status Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-ivory/10 bg-navy/60 p-4">
              <div>
                <span className="text-xs text-ivory/60">Cleared Principal Amount</span>
                <p className="text-2xl font-display font-bold text-ivory">
                  {selectedTx.currency} {selectedTx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-ivory/60">Verification Status</span>
                <p className="text-sm font-semibold text-gold">{selectedTx.status} · Risk Score: {selectedTx.riskScore}/100</p>
              </div>
            </div>

            {/* Parties & Clearing Route */}
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-ivory/10 bg-navy-deep/60 p-3.5 space-y-1">
                <span className="text-[10px] uppercase text-ivory/50">Originating Institution</span>
                <p className="font-semibold text-ivory">{selectedTx.originatingBank}</p>
                <p className="font-mono text-[10px] text-ivory/60">Customer: {selectedTx.customerName}</p>
              </div>
              <div className="rounded-xl border border-ivory/10 bg-navy-deep/60 p-3.5 space-y-1">
                <span className="text-[10px] uppercase text-ivory/50">Beneficiary Destination</span>
                <p className="font-semibold text-ivory">{selectedTx.beneficiaryName}</p>
                <p className="font-mono text-[10px] text-gold">{selectedTx.beneficiaryAccount}</p>
              </div>
            </div>

            {/* Chronological Event Timeline */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gold mb-3">
                Lifecycle Clearing Timeline
              </h4>
              <div className="space-y-3">
                {selectedTx.timeline.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-gold/15 text-gold text-[10px] font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 rounded-lg border border-ivory/10 bg-navy/40 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ivory">{step.stage}</span>
                        <span className="font-mono text-[10px] text-ivory/50">{step.timestamp}</span>
                      </div>
                      {step.note && <p className="mt-1 text-[11px] text-amber-300">{step.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-ivory/10">
              <button
                type="button"
                onClick={() => {
                  const t = selectedTx;
                  setSelectedTx(null);
                  setEditingTx(t);
                }}
                className="rounded-xl border border-gold/40 bg-gold/15 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/25 transition-colors flex items-center gap-1.5"
              >
                <Edit className="h-3.5 w-3.5" /> Edit Date, Time & Narration
              </button>
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="rounded-xl border border-ivory/20 px-4 py-2 text-xs text-ivory/80 hover:bg-ivory/10"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
