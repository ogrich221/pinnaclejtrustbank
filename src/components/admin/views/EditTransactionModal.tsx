import React, { useState } from "react";
import {
  X,
  Calendar,
  Clock,
  FileText,
  Building2,
  CheckCircle2,
  Edit,
  Tag,
  ShieldCheck,
} from "lucide-react";
import { TransactionRecord, TransactionStatus, TransactionType } from "../types";
import { useAdminData } from "../AdminDataContext";

interface EditTransactionModalProps {
  transaction: TransactionRecord | null;
  onClose: () => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  onClose,
}) => {
  const { editTransaction } = useAdminData();

  const [date, setDate] = useState<string>(() => {
    if (!transaction) return new Date().toISOString().slice(0, 10);
    const parts = transaction.timestamp.split(" ");
    return parts[0] || new Date().toISOString().slice(0, 10);
  });

  const [time, setTime] = useState<string>(() => {
    if (!transaction) return "12:00";
    const parts = transaction.timestamp.split(" ");
    return parts[1] || "12:00";
  });

  const [purpose, setPurpose] = useState<string>(transaction?.purpose || "");
  const [status, setStatus] = useState<TransactionStatus>(transaction?.status || "Settled");
  const [counterparty, setCounterparty] = useState<string>(
    transaction?.originatingBank || transaction?.beneficiaryName || ""
  );
  const [category, setCategory] = useState<TransactionType>(transaction?.type || "Fedwire Domestic");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    editTransaction({
      transactionId: transaction.id,
      date,
      time,
      purpose: purpose.trim(),
      narration: purpose.trim(),
      status,
      ...(counterparty.trim() ? { counterparty: counterparty.trim() } : {}),
      category,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-gold/30 bg-gradient-to-b from-[#0E2140] to-[#071426] p-6 shadow-2xl text-ivory space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-ivory/10 pb-4">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-gold">
              Administrative Record Modification
            </span>
            <h3 className="text-xl font-display font-semibold text-ivory">
              Edit Transaction Record
            </h3>
            <p className="text-xs text-ivory/60 font-mono mt-0.5">
              Ref: <strong className="text-gold">{transaction.reference}</strong> · {transaction.currency} {transaction.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Customer / Ref info */}
          <div className="rounded-xl border border-ivory/10 bg-navy/60 p-3.5 flex justify-between items-center text-ivory/70">
            <div>
              <span className="text-[10px] uppercase text-ivory/40">Customer</span>
              <p className="font-semibold text-ivory text-sm">{transaction.customerName}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-ivory/40">Direction</span>
              <p className={`font-semibold text-xs ${transaction.direction === "Inbound" ? "text-emerald-400" : "text-amber-400"}`}>
                {transaction.direction === "Inbound" ? "↓ Inbound Deposit" : "↑ Outbound Transfer"}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-ivory/70 mb-1.5">
                <Calendar className="h-3.5 w-3.5 text-gold" /> Transaction Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-ivory/20 bg-navy/60 px-3 py-2 text-xs font-mono text-ivory focus:border-gold focus:outline-none"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-ivory/70 mb-1.5">
                <Clock className="h-3.5 w-3.5 text-gold" /> Transaction Time
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-ivory/20 bg-navy/60 px-3 py-2 text-xs font-mono text-ivory focus:border-gold focus:outline-none"
              />
            </div>
          </div>

          {/* Purpose / Narration */}
          <div>
            <label className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-ivory/70 mb-1.5">
              <FileText className="h-3.5 w-3.5 text-gold" /> Narration / Description / Purpose
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full rounded-xl border border-ivory/20 bg-navy/60 px-3.5 py-2 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
            />
          </div>

          {/* Counterparty / Originating Bank */}
          <div>
            <label className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-ivory/70 mb-1.5">
              <Building2 className="h-3.5 w-3.5 text-gold" /> Counterparty / Originating Bank
            </label>
            <input
              type="text"
              value={counterparty}
              onChange={(e) => setCounterparty(e.target.value)}
              className="w-full rounded-xl border border-ivory/20 bg-navy/60 px-3.5 py-2 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
            />
          </div>

          {/* Status & Routing Type */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-ivory/70 mb-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-gold" /> Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TransactionStatus)}
                className="w-full rounded-xl border border-ivory/20 bg-navy px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
              >
                <option value="Settled">Settled</option>
                <option value="Clearing">Clearing</option>
                <option value="Flagged">Flagged</option>
                <option value="Rejected">Rejected</option>
                <option value="Reversed">Reversed</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-ivory/70 mb-1.5">
                <Tag className="h-3.5 w-3.5 text-gold" /> Routing Type
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionType)}
                className="w-full rounded-xl border border-ivory/20 bg-navy px-3 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
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

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-ivory/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-ivory/20 px-4 py-2 text-xs font-semibold text-ivory/70 hover:bg-ivory/10 hover:text-ivory transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gold bg-gold px-5 py-2 text-xs font-bold text-navy-deep hover:bg-gold-light transition-all shadow-md"
            >
              <CheckCircle2 className="h-4 w-4" /> Save Modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
