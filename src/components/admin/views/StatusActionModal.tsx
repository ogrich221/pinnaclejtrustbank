import React, { useState } from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2, X } from "lucide-react";
import { CustomerRecord, CustomerAccountStatus } from "../types";
import { useAdminData } from "../AdminDataContext";

interface StatusActionModalProps {
  customer: CustomerRecord | null;
  targetStatus: CustomerAccountStatus | null;
  onClose: () => void;
}

const PRESET_REASONS: Record<CustomerAccountStatus, string[]> = {
  Restricted: [
    "AML & Sanctions Velocity Screening Flag",
    "Unusual Cross-Border Inbound Wire Source",
    "Missing Recertification of Beneficial Ownership",
    "Temporary Regulatory Inquiry / Compliance Hold",
    "Disputed Transaction Counterparty Notification",
  ],
  Suspended: [
    "Confirmed Fraudulent or Altered Verification Documents",
    "Judicial Restraining Order or Statutory Freezing Directive",
    "Severe Breach of Private Banking Terms & Conditions",
    "Direct OFAC / EU / UN Sanctions List Identifier Match",
  ],
  Pending: [
    "Application submitted - awaiting administrative document verification",
    "Additional compliance inquiry pending review",
  ],
  Active: [
    "Administrator approved new account application and activated services",
    "Compliance Review Successfully Completed & Cleared",
    "Beneficial Ownership Documents Validated & Countersigned",
    "Legitimate Transaction Source of Wealth Verified",
    "Restraining Order / Inquiry Formally Lifted",
  ],
  Flagged: [
    "Unusual Login Velocity from New Geographic Location",
    "Large Outbound Wire Volume Approaching Daily Limit",
    "Awaiting Second-Level Executive Authorization",
  ],
};

export const StatusActionModal: React.FC<StatusActionModalProps> = ({
  customer,
  targetStatus,
  onClose,
}) => {
  const { updateCustomerStatus } = useAdminData();
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customNote, setCustomNote] = useState<string>("");
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!customer || !targetStatus) return null;

  const reasons = PRESET_REASONS[targetStatus] || [];
  const isDangerous = targetStatus === "Suspended" || targetStatus === "Restricted";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason && !customNote) return;
    if (isDangerous && !confirmed) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const finalReason = selectedReason || "Administrative Executive Order";
      updateCustomerStatus(customer.id, targetStatus, finalReason, customNote);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-ivory/15 bg-gradient-to-b from-[#0E2140] to-[#071426] p-6 shadow-2xl text-ivory">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-ivory/10 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                targetStatus === "Suspended"
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : targetStatus === "Restricted"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {targetStatus === "Suspended" ? (
                <ShieldAlert className="h-6 w-6" />
              ) : targetStatus === "Restricted" ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <CheckCircle2 className="h-6 w-6" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-display font-semibold tracking-wide text-ivory">
                {targetStatus === "Active"
                  ? "Restore Account to Active"
                  : `${targetStatus} Account`}
              </h3>
              <p className="text-xs text-ivory/60">
                Customer: <span className="text-gold font-medium">{customer.fullName}</span> ({customer.customerId})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-ivory/60 hover:bg-ivory/10 hover:text-ivory transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Warning Banner for Restricting/Suspending */}
        {isDangerous && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-200">
            <p className="font-semibold text-red-300">
              {targetStatus === "Suspended" ? "Critical Operational Freeze" : "Administrative Restriction Notice"}
            </p>
            <p className="mt-1 leading-relaxed text-red-200/80">
              This action takes immediate effect across all global clearing gateways. All pending outbound transactions
              and API keys for this customer account will be suspended. An immutable audit trail entry will be recorded.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Reason Select */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gold mb-1.5">
              Select Primary Regulatory Reason *
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              required
              className="w-full rounded-xl border border-ivory/20 bg-navy-deep/90 px-3.5 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
            >
              <option value="">-- Choose formal administrative reason --</option>
              {reasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
              <option value="Other Regulatory Directive">Other Regulatory Directive (Specify Below)</option>
            </select>
          </div>

          {/* Internal Administrative Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
              Internal Administrative Note & Context *
            </label>
            <textarea
              rows={3}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Provide detailed context for this action. Required for compliance audit records..."
              required
              className="w-full rounded-xl border border-ivory/20 bg-navy-deep/90 p-3 text-xs text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none"
            />
          </div>

          {/* Confirmation Checkbox for Dangerous Actions */}
          {isDangerous && (
            <label className="flex items-start gap-3 rounded-xl border border-ivory/10 bg-navy/60 p-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 rounded border-ivory/30 bg-navy-deep text-gold focus:ring-gold"
                required
              />
              <span className="text-xs text-ivory/80 leading-relaxed">
                I hereby certify that I am an authorized administrator exercising sanctioned powers under Pinnacle J
                Trust Bank compliance policy.
              </span>
            </label>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-ivory/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ivory/20 px-4 py-2.5 text-xs font-medium text-ivory/80 hover:bg-ivory/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (isDangerous && !confirmed)}
              className={`rounded-xl px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition-all shadow-lg ${
                targetStatus === "Suspended"
                  ? "bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
                  : targetStatus === "Restricted"
                  ? "bg-amber-600 text-white hover:bg-amber-500 disabled:opacity-50"
                  : "bg-gold text-navy-deep hover:bg-gold-soft font-bold disabled:opacity-50"
              }`}
            >
              {isSubmitting
                ? "Recording Audit..."
                : targetStatus === "Active"
                ? "Confirm Restoration"
                : `Apply ${targetStatus}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
