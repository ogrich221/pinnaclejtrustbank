import React, { useState } from "react";
import {
  ShieldCheck,
  UserCheck,
  KeyRound,
  Check,
  X as XIcon,
  Plus,
  Mail,
  Lock,
} from "lucide-react";
import { useAdminData } from "../AdminDataContext";
import { AdminRole, StaffMember } from "../types";
import { toast } from "sonner";

export const StaffPermissionsView: React.FC = () => {
  const { staff } = useAdminData();

  const ROLE_DEFINITIONS: {
    role: AdminRole;
    description: string;
    permissions: Record<string, boolean>;
  } = [
    {
      role: "Super Admin",
      description: "Full authorized administrative, operational, and security control across all bank systems.",
      permissions: {
        "View Customers": true,
        "Edit Permitted Details": true,
        "Review Verification (KYC)": true,
        "Restrict / Suspend Accounts": true,
        "Monitor Transactions": true,
        "Security & Audit Access": true,
        "Staff & Role Management": true,
      },
    },
    {
      role: "Bank Administrator",
      description: "Customer onboarding, portfolio servicing, and permitted operational administration.",
      permissions: {
        "View Customers": true,
        "Edit Permitted Details": true,
        "Review Verification (KYC)": true,
        "Restrict / Suspend Accounts": false,
        "Monitor Transactions": true,
        "Security & Audit Access": true,
        "Staff & Role Management": false,
      },
    },
    {
      role: "Compliance Officer",
      description: "Identity verification reviews, sanctions screening, account restrictions, and AML governance.",
      permissions: {
        "View Customers": true,
        "Edit Permitted Details": false,
        "Review Verification (KYC)": true,
        "Restrict / Suspend Accounts": true,
        "Monitor Transactions": true,
        "Security & Audit Access": true,
        "Staff & Role Management": false,
      },
    },
    {
      role: "Customer Support",
      description: "Read-only profile viewing, inquiry resolution, and customer assistance.",
      permissions: {
        "View Customers": true,
        "Edit Permitted Details": false,
        "Review Verification (KYC)": false,
        "Restrict / Suspend Accounts": false,
        "Monitor Transactions": false,
        "Security & Audit Access": false,
        "Staff & Role Management": false,
      },
    },
    {
      role: "Auditor",
      description: "Strictly read-only access to approved transaction ledgers, audit packages, and governance reports.",
      permissions: {
        "View Customers": true,
        "Edit Permitted Details": false,
        "Review Verification (KYC)": false,
        "Restrict / Suspend Accounts": false,
        "Monitor Transactions": true,
        "Security & Audit Access": true,
        "Staff & Role Management": false,
      },
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-display font-bold text-ivory">Role-Based Access Control (RBAC) & Staff Roster</h2>
        <p className="text-xs text-ivory/60">
          Enforce strict administrative boundaries, multi-factor authentication, and separation of duties
        </p>
      </div>

      {/* Permissions Matrix */}
      <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
        <h3 className="text-base font-display font-semibold text-ivory mb-4">Privilege Governance Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-ivory/10 bg-navy-deep/80 text-[11px] font-semibold uppercase tracking-wider text-ivory/60">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3">Capability / Function</th>
                {ROLE_DEFINITIONS.map((r) => (
                  <th key={r.role} scope="col" className="px-3 py-3.5 text-center">
                    <span className="text-gold font-bold">{r.role}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory/5 text-ivory">
              {Object.keys(ROLE_DEFINITIONS[0].permissions).map((permKey) => (
                <tr key={permKey} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 pl-4 pr-3 font-medium text-ivory">{permKey}</td>
                  {ROLE_DEFINITIONS.map((r) => {
                    const hasPerm = r.permissions[permKey];
                    return (
                      <td key={r.role} className="px-3 py-3.5 text-center">
                        {hasPerm ? (
                          <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                            <Check className="h-3.5 w-3.5" />
                          </div>
                        ) : (
                          <div className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-ivory/5 text-ivory/30">
                            <XIcon className="h-3 w-3" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff Roster */}
      <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-display font-semibold text-ivory">Authorized Administrative Personnel</h3>
          <button
            type="button"
            onClick={() => toast.info("Staff invitation workflow requires dual Super-Admin signature")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/20 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Provision New Staff Member
          </button>
        </div>

        <div className="divide-y divide-ivory/10 rounded-xl border border-ivory/10 bg-navy/40 overflow-hidden text-xs">
          {staff.map((s) => (
            <div key={s.id} className="p-4 flex flex-wrap items-center justify-between gap-4 hover:bg-ivory/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/40 bg-gold/15 font-display font-bold text-gold">
                  {s.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold text-ivory text-sm">{s.name}</p>
                  <p className="text-ivory/50 flex items-center gap-1">
                    <Mail className="h-3 w-3 text-gold" /> {s.email} · {s.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="rounded-full border border-gold/30 bg-gold/15 px-3 py-0.5 text-[11px] font-semibold text-gold">
                  {s.role}
                </span>

                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Hardware 2FA Active</span>
                </div>

                <span className="text-[11px] text-ivory/50 font-mono">Active {s.lastActive}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
