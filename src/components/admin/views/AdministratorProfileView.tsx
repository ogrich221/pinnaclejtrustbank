import React from "react";
import {
  ShieldCheck,
  KeyRound,
  Check,
  Server,
  Lock,
  Mail,
  Fingerprint,
  Cpu,
  Clock,
  Terminal,
} from "lucide-react";
import { useAdminData } from "../AdminDataContext";
import { toast } from "sonner";

export const AdministratorProfileView: React.FC = () => {
  const { activeAdmin } = useAdminData();

  const handleRotateKey = () => {
    toast.success("Cryptographic Admin Key rotated", {
      description: "New 4096-bit master signing key issued. Active session confirmed.",
    });
  };

  const UNIFIED_POWERS = [
    {
      title: "Universal Account Control",
      desc: "Sole authority to activate, restrict, flag, or suspend any private or institutional account.",
      status: "Unrestricted",
    },
    {
      title: "KYC & Compliance Final Sign-off",
      desc: "Direct verification authority over passports, company registries, and proof-of-funds credentials.",
      status: "Unrestricted",
    },
    {
      title: "High-Value Transaction Release",
      desc: "Full operational clearance for unlimited wire transfers, SWIFT GPI, CHIPS, and Fedwire transactions.",
      status: "Unrestricted",
    },
    {
      title: "Cryptographic Audit & Ledger Access",
      desc: "Direct immutable access to all financial transaction trails and forensic activity logs.",
      status: "Unrestricted",
    },
    {
      title: "Emergency Network Lockdown",
      desc: "Sole authority to freeze gateway clearing queues or trigger automated containment.",
      status: "Unrestricted",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold mb-2">
          <ShieldCheck className="h-3.5 w-3.5" /> Single Administrator Mode
        </div>
        <h2 className="text-2xl font-display font-bold text-ivory">Administrator Profile & Security Governance</h2>
        <p className="text-xs text-ivory/60">
          Single administrative authority. All secondary roles, staff delegations, and distributed controllers are decommissioned.
        </p>
      </div>

      {/* Administrator Master Credential Card */}
      <div className="rounded-3xl border border-gold/40 bg-gradient-to-br from-[#0E2140] via-[#071426] to-[#0E2140] p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-gold bg-gradient-to-br from-gold/30 to-navy-deep font-display text-3xl font-bold text-gold shadow-xl">
              AD
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-display font-bold text-ivory">{activeAdmin.name}</h3>
                <span className="rounded-full border border-gold/50 bg-gold/15 px-3 py-0.5 text-xs font-semibold text-gold font-mono">
                  SOLE ADMINISTRATOR
                </span>
              </div>
              <p className="text-xs text-gold/90 font-medium mt-1">{activeAdmin.title}</p>
              <p className="text-xs text-ivory/60 flex items-center gap-2 mt-2 font-mono">
                <Mail className="h-3.5 w-3.5 text-gold" /> {activeAdmin.email}
                <span>•</span>
                <span>{activeAdmin.department}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleRotateKey}
              className="rounded-xl border border-gold/40 bg-gold/15 px-4 py-2.5 text-xs font-semibold text-gold hover:bg-gold/25 transition-all shadow-md flex items-center gap-2"
            >
              <KeyRound className="h-4 w-4" /> Rotate Master Key
            </button>
          </div>
        </div>

        {/* Security Meta Strip */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3 border-t border-ivory/10 pt-6 text-xs">
          <div className="rounded-xl border border-ivory/10 bg-navy/60 p-4">
            <p className="text-[10px] uppercase tracking-wider text-ivory/50">Multi-Factor Hardware Token</p>
            <p className="mt-1 font-semibold text-emerald-400 flex items-center gap-1.5">
              <Fingerprint className="h-4 w-4" /> Hardware YubiKey 5 FIPS Enforced
            </p>
          </div>
          <div className="rounded-xl border border-ivory/10 bg-navy/60 p-4">
            <p className="text-[10px] uppercase tracking-wider text-ivory/50">Session IP & Bastion</p>
            <p className="mt-1 font-semibold text-ivory font-mono flex items-center gap-1.5">
              <Server className="h-4 w-4 text-gold" /> {activeAdmin.sessionIp}
            </p>
          </div>
          <div className="rounded-xl border border-ivory/10 bg-navy/60 p-4">
            <p className="text-[10px] uppercase tracking-wider text-ivory/50">Active Session Status</p>
            <p className="mt-1 font-semibold text-gold flex items-center gap-1.5 font-mono">
              <Clock className="h-4 w-4" /> Authenticated · 256-Bit TLS
            </p>
          </div>
        </div>
      </div>

      {/* Unified Administrator Operational Powers */}
      <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
        <div className="border-b border-ivory/10 pb-4 mb-4">
          <h3 className="text-base font-display font-semibold text-ivory">Exclusive Administrative Powers</h3>
          <p className="text-xs text-ivory/60">
            Because all other roles and staff controllers are deleted, this single administrator possesses full consolidated executive authority.
          </p>
        </div>

        <div className="divide-y divide-ivory/10">
          {UNIFIED_POWERS.map((power) => (
            <div key={power.title} className="py-4 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-ivory">{power.title}</p>
                <p className="text-xs text-ivory/60 max-w-xl leading-relaxed">{power.desc}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 font-mono flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5" /> {power.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Architecture Confirmation */}
      <div className="rounded-2xl border border-ivory/10 bg-navy/40 p-6 text-xs text-ivory/70 space-y-2">
        <p className="font-semibold text-gold flex items-center gap-2">
          <Terminal className="h-4 w-4" /> Single-Tenant Governance Confirmation
        </p>
        <p className="leading-relaxed">
          The system is configured in strict Single Administrator mode. No secondary logins, delegate accounts, or restricted staff
          controllers exist in the database. All sensitive customer actions, transaction approvals, and compliance overrides require only
          the master credentials of this Administrator.
        </p>
      </div>
    </div>
  );
};
