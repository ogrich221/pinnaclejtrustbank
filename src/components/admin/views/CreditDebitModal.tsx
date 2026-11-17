import React, { useState } from "react";
import {
  X,
  PlusCircle,
  MinusCircle,
  Calendar,
  Clock,
  FileText,
  Building2,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { CustomerRecord, TransactionType } from "../types";
import { useAdminData } from "../AdminDataContext";

interface CreditDebitModalProps {
  customer: CustomerRecord | null;
  initialType?: "Credit" | "Debit";
  onClose: () => void;
}

const PRESET_NARRATIONS: Record<"Credit" | "Debit", string[]> = {
  Credit: [
    "Inbound Fedwire Domestic Settlement",
    "International SWIFT Wire Clearance",
    "Treasury Liquidity Allocation",
    "Institutional Account Capitalization",
    "Custodial Escrow Deposit Settlement",
    "Direct Administrative Balance Adjustment",
    "Portfolio Custody Dividend Credit",
  ],
  Debit: [
    "Outbound Commercial Wire Settlement",
    "Institutional Custodial Management Fee",
    "International Escrow Disbursement",
    "Regulatory Withholding Settlement",
    "Administrative Balance Correction Debit",
    "Direct Interbank Liquidity Transfer",
  ],
};

const PRESET_AMOUNTS = [1000, 5000, 25000, 100000, 500000, 1000000];

export const CreditDebitModal: React.FC<CreditDebitModalProps> = ({
  customer,
  initialType = "Credit",
  onClose,
}) => {
  const { creditDebitCustomer } = useAdminData();

  const [type, setType] = useState<"Credit" | "Debit">(initialType);
  const [amount, setAmount] = useState<string>("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState<string>(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  });
  const [narration, setNarration] = useState<string>(PRESET_NARRATIONS[initialType][0] ?? "");
  const [counterparty, setCounterparty] = useState<string>(
    initialType === "Credit" ? "Federal Reserve Wire Network" : "Barclays Commercial Clearing UK"
  );
  const [category, setCategory] = useState<TransactionType>(
    initialType === "Credit" ? "Fedwire Domestic" : "Outbound SWIFT"
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!customer) return null;

  const numAmount = parseFloat(amount) || 0;
  const currentBalance = customer.availableBalance || 0;
  const delta = type === "Credit" ? numAmount : -numAmount;
  const projectedBalance = currentBalance + delta;
  const debitExceedsBalance = type === "Debit" && numAmount > currentBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount <= 0 || debitExceedsBalance) return;
    if (!narration.trim()) return;

    setIsSubmitting(true);
    creditDebitCustomer({
      customerId: customer.id,
      type,
      amount: numAmount,
      date,
      time,
      narration: narration.trim(),
      ...(counterparty.trim() ? { counterparty: counterparty.trim() } : {}),
      category,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-gold/30 bg-gradient-to-b from-[#0E2140] to-[#071426] p-6 shadow-2xl text-ivory max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-ivory/10 pb-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-gold">
              Executive Balance Management
            </span>
            <h3 className="text-2xl font-display font-semibold text-ivory">
              {type === "Credit" ? "Credit Customer Account" : "Debit Customer Account"}
            </h3>
            <p className="text-xs text-ivory/60 mt-0.5">
              Target: <strong className="text-ivory">{customer.fullName}</strong> ({customer.customerId}) · {customer.currency}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ivory/60 hover:bg-ivory/10 hover:text-ivory transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ivory/10 bg-navy/60 p-4">
          <div>
            <span className="text-[11px] text-ivory/60 uppercase tracking-wider">Current Available Balance</span>
            <p className="text-xl font-display font-bold text-ivory">
              {customer.currency} {currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-ivory/40">Projected:</span>
            <div className="flex items-center gap-1.5 font-display text-lg font-bold">
              <span className={type === "Credit" ? "text-emerald-400" : "text-rose-400"}>
                {type === "Credit" ? "+" : "-"}
                {customer.currency} {numAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-ivory/40" />
              <span className="text-gold">
                {customer.currency} {projectedBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Action Type Toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/70 mb-2">
              Action Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setType("Credit");
                  setNarration(PRESET_NARRATIONS.Credit[0] ?? "");
                  setCategory("Fedwire Domestic");
                  setCounterparty("Federal Reserve Wire Network");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition-all border ${
                  type === "Credit"
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10"
                    : "border-ivory/15 bg-white/[0.03] text-ivory/60 hover:text-ivory hover:border-ivory/30"
                }`}
              >
                <PlusCircle className="h-4 w-4" /> Credit Account (+)
              </button>

              <button
                type="button"
                onClick={() => {
                  setType("Debit");
                  setNarration(PRESET_NARRATIONS.Debit[0] ?? "");
                  setCategory("Outbound SWIFT");
                  setCounterparty("Barclays Commercial Clearing UK");
                }}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition-all border ${
                  type === "Debit"
                    ? "border-rose-500 bg-rose-500/20 text-rose-400 shadow-lg shadow-rose-500/10"
                    : "border-ivory/15 bg-white/[0.03] text-ivory/60 hover:text-ivory hover:border-ivory/30"
                }`}
              >
                <MinusCircle className="h-4 w-4" /> Debit Account (−)
              </button>
            </div>
          </div>

          {/* Amount Input & Presets */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/70 mb-2">
              Amount ({customer.currency})
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-gold text-lg">
                {customer.currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-ivory/20 bg-navy/60 pl-16 pr-4 py-3 text-lg font-mono font-bold text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(String(amt))}
                  className="rounded-lg border border-ivory/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-mono text-ivory/70 hover:border-gold hover:text-gold transition-colors"
                >
                  +{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Settings */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ivory/70 mb-2">
                <Calendar className="h-3.5 w-3.5 text-gold" /> Transaction Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-ivory/20 bg-navy/60 px-3.5 py-2.5 text-xs font-mono text-ivory focus:border-gold focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ivory/70 mb-2">
                <Clock className="h-3.5 w-3.5 text-gold" /> Transaction Time
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-ivory/20 bg-navy/60 px-3.5 py-2.5 text-xs font-mono text-ivory focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Narration / Description */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ivory/70 mb-2">
              <FileText className="h-3.5 w-3.5 text-gold" /> Narration / Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Inbound Wire Settlement, Portfolio Capitalization"
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              className="w-full rounded-xl border border-ivory/20 bg-navy/60 px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
            />

            {/* Quick Narration Presets */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {PRESET_NARRATIONS[type].slice(0, 4).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNarration(p)}
                  className={`rounded-lg border px-2 py-0.5 text-[10px] transition-colors ${
                    narration === p
                      ? "border-gold bg-gold/20 text-gold"
                      : "border-ivory/10 bg-white/[0.02] text-ivory/60 hover:text-ivory"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Counterparty & Category */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ivory/70 mb-2">
                <Building2 className="h-3.5 w-3.5 text-gold" /> Originating Bank / Counterparty
              </label>
              <input
                type="text"
                placeholder="Originating or Receiving Institution"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                className="w-full rounded-xl border border-ivory/20 bg-navy/60 px-3.5 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/70 mb-2">
                Transaction Routing Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionType)}
                className="w-full rounded-xl border border-ivory/20 bg-navy px-3.5 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
              >
                <option value="Fedwire Domestic">Fedwire Domestic</option>
                <option value="Inbound SWIFT">Inbound SWIFT</option>
                <option value="Outbound SWIFT">Outbound SWIFT</option>
                <option value="SEPA Instant">SEPA Instant</option>
                <option value="Internal Transfer">Internal Transfer</option>
                <option value="Custodial Escrow">Custodial Escrow</option>
                <option value="Treasury Dividend">Treasury Dividend</option>
                <option value="Manual Credit">Manual Credit</option>
                <option value="Manual Debit">Manual Debit</option>
                <option value="Administrative Adjustment">Administrative Adjustment</option>
              </select>
            </div>
          </div>

          {debitExceedsBalance && (
            <p role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4" /> The debit exceeds the customer&apos;s available balance. No funds will be deducted.
            </p>
          )}

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-ivory/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ivory/20 px-4 py-2.5 text-xs font-semibold text-ivory/70 hover:bg-ivory/10 hover:text-ivory transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || numAmount <= 0 || debitExceedsBalance}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-lg ${
                type === "Credit"
                  ? "bg-emerald-500 hover:bg-emerald-400 text-navy-deep shadow-emerald-500/20"
                  : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" />
              {type === "Credit" ? `Post Credit of ${customer.currency} ${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : `Post Debit of ${customer.currency} ${numAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
