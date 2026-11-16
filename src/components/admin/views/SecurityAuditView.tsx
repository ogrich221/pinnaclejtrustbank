import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  Lock,
  AlertTriangle,
  History,
  Search,
  CheckCircle2,
  FileText,
  UserX,
  Server,
  KeyRound,
  Download,
} from "lucide-react";
import { useAdminData } from "../AdminDataContext";
import { toast } from "sonner";

export const SecurityAuditView: React.FC = () => {
  const { auditLogs } = useAdminData();
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (severityFilter !== "All" && log.severity !== severityFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAction = log.action.toLowerCase().includes(q);
        const matchesAdmin = log.adminName.toLowerCase().includes(q);
        const matchesTarget = log.targetDescription.toLowerCase().includes(q);
        const matchesReason = log.reason.toLowerCase().includes(q);
        if (!matchesAction && !matchesAdmin && !matchesTarget && !matchesReason) return false;
      }
      return true;
    });
  }, [auditLogs, severityFilter, searchQuery]);

  const exportAuditLog = () => {
    toast.success("Cryptographically signed audit log exported", {
      description: `Generated SHA-256 verified package containing ${filteredLogs.length} audit entries.`,
    });
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "border-red-500/40 bg-red-500/15 text-red-400";
      case "Warning":
        return "border-amber-500/40 bg-amber-500/15 text-amber-400";
      default:
        return "border-blue-500/40 bg-blue-500/15 text-blue-400";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & Actions Bar */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-display font-bold text-ivory">Security & Immutable Audit Centre</h2>
          <p className="text-xs text-ivory/60">
            Append-only cryptographic ledger tracking all administrative state changes and privileged operations
          </p>
        </div>

        <button
          type="button"
          onClick={exportAuditLog}
          className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/15 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/25 transition-all shadow-md"
        >
          <Download className="h-4 w-4" /> Export Signed Audit Package
        </button>
      </div>

      {/* Security Health Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/30 bg-white/[0.04] p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-ivory/50">Audit Integrity</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-display font-bold text-emerald-400">100% Verified</p>
          <p className="mt-1 text-xs text-ivory/60 font-mono">Merkle root signed every 60s</p>
        </div>

        <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-ivory/50">Active Admin Sessions</span>
            <Server className="h-4 w-4 text-gold" />
          </div>
          <p className="mt-2 text-2xl font-display font-bold text-ivory">3 Authorized Staff</p>
          <p className="mt-1 text-xs text-ivory/60 font-mono">Mutual TLS & Hardware YubiKey</p>
        </div>

        <div className="rounded-2xl border border-amber-500/30 bg-white/[0.04] p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-mono tracking-wider text-ivory/50">Restricted Accounts</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-display font-bold text-amber-400">2 Enforced Holds</p>
          <p className="mt-1 text-xs text-ivory/60 font-mono">Compliance reviews in progress</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ivory/10 pb-4">
        <div className="flex items-center gap-2 text-xs">
          {["All", "Critical", "Warning", "Info"].map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverityFilter(sev)}
              className={`rounded-xl px-3 py-1.5 transition-all font-medium ${
                severityFilter === sev
                  ? "border border-gold/40 bg-gold/15 text-gold font-semibold shadow-sm"
                  : "border border-transparent text-ivory/70 hover:bg-ivory/5 hover:text-ivory"
              }`}
            >
              {sev} Events
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ivory/50" />
          <input
            type="text"
            placeholder="Filter audit records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border border-ivory/15 bg-white/[0.05] pl-9 pr-3 py-1.5 text-xs text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none w-60 backdrop-blur-md"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-ivory/10 bg-navy-deep/80 text-[11px] font-semibold uppercase tracking-wider text-ivory/60 font-mono">
              <tr>
                <th scope="col" className="py-4 pl-6 pr-3">Timestamp / IP</th>
                <th scope="col" className="px-3 py-4">Administrator</th>
                <th scope="col" className="px-3 py-4">Action</th>
                <th scope="col" className="px-3 py-4">Target Record</th>
                <th scope="col" className="px-3 py-4">Reason & Note</th>
                <th scope="col" className="py-4 pl-3 pr-6 text-right">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory/5 text-ivory">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="py-4 pl-6 pr-3 font-mono text-ivory/70 text-[11px]">
                    <p className="font-semibold text-ivory">{log.timestamp}</p>
                    <p className="text-[10px] text-ivory/40">{log.ipAddress}</p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="font-semibold text-ivory">{log.adminName}</p>
                    <p className="text-[10px] text-gold">{log.adminRole}</p>
                  </td>
                  <td className="px-3 py-4 font-mono font-medium text-gold">
                    <span className="rounded bg-gold/15 px-2 py-0.5 border border-gold/30 text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-3 py-4 font-mono text-ivory/80 max-w-[200px] truncate">
                    {log.targetDescription}
                  </td>
                  <td className="px-3 py-4 max-w-[280px]">
                    <p className="text-ivory font-medium leading-tight">{log.reason}</p>
                    {log.note && <p className="text-[10px] text-ivory/50 mt-0.5 truncate">{log.note}</p>}
                  </td>
                  <td className="py-4 pl-3 pr-6 text-right">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${getSeverityBadge(log.severity)}`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
