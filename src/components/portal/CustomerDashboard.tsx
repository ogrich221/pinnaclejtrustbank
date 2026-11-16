import React, { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Globe,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  User,
  Users,
  History,
  Settings,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Download,
  Plus,
  Trash2,
  Clock,
  Printer,
  ThumbsUp,
  Copy,
  Check,
  MapPin,
  ChevronRight,
  ExternalLink,
  Building,
  KeyRound,
  FileText,
  Camera,
  Upload,
  Search,
} from "lucide-react";
import { LogoMark } from "@/components/site/Logo";
import { toast } from "sonner";

interface Beneficiary {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  swiftBic?: string;
  country: string;
  type: "Domestic" | "International";
}

interface PortalTransaction {
  id: string;
  reference: string;
  date: string;
  description: string;
  category: "Deposit" | "Withdrawal" | "Domestic" | "International";
  amount: number;
  currency: string;
  status: "Completed" | "Processing" | "Flagged";
  counterparty: string;
}

export const CustomerDashboard: React.FC = () => {
  // Active Customer data
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem("pjtb_current_portal_customer");
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      fullName: "Testrun Customer",
      customerId: "PJ-89201",
      accountNumber: "PJTB-8492-3841-09",
      maskedAccountNumber: "PJTB-••••-3841",
      accountType: "Premier Checking",
      currency: "USD",
      balance: 0.0,
      availableBalance: 0.0,
      accountStatus: "Pending",
      verificationStatus: "Pending",
      email: "testrun@pinnaclejtrust.com",
      phone: "+1 (212) 555-0199",
      address: {
        street: "28 Wall Street, Suite 4400",
        city: "New York",
        country: "United States",
      },
    };
  });

  const [activeTab, setActiveTab] = useState<
    "overview" | "transfers" | "transactions" | "beneficiaries" | "security" | "settings"
  >("overview");
  const [transferType, setTransferType] = useState<"domestic" | "international">("domestic");
  const [showBalance, setShowBalance] = useState(true);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size exceeds 5MB limit");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCustomer((prev: any) => {
        const updated = { ...prev, avatarUrl: dataUrl };
        localStorage.setItem("pjtb_current_portal_customer", JSON.stringify(updated));
        try {
          const adminCusts = localStorage.getItem("pjtb_admin_customers_v2");
          if (adminCusts) {
            const list = JSON.parse(adminCusts);
            const idx = list.findIndex((c: any) => c.id === prev.id || c.customerId === prev.customerId || c.email === prev.email);
            if (idx >= 0) {
              list[idx].avatarUrl = dataUrl;
              localStorage.setItem("pjtb_admin_customers_v2", JSON.stringify(list));
            }
          }
        } catch {}
        return updated;
      });
      toast.success("Profile picture updated successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (url: string) => {
    setCustomer((prev: any) => {
      const updated = { ...prev, avatarUrl: url };
      localStorage.setItem("pjtb_current_portal_customer", JSON.stringify(updated));
      try {
        const adminCusts = localStorage.getItem("pjtb_admin_customers_v2");
        if (adminCusts) {
          const list = JSON.parse(adminCusts);
          const idx = list.findIndex((c: any) => c.id === prev.id || c.customerId === prev.customerId || c.email === prev.email);
          if (idx >= 0) {
            list[idx].avatarUrl = url;
            localStorage.setItem("pjtb_admin_customers_v2", JSON.stringify(list));
          }
        }
      } catch {}
      return updated;
    });
    toast.success("Identity avatar selected");
  };

  const handleRemoveAvatar = () => {
    setCustomer((prev: any) => {
      const updated = { ...prev, avatarUrl: undefined };
      localStorage.setItem("pjtb_current_portal_customer", JSON.stringify(updated));
      try {
        const adminCusts = localStorage.getItem("pjtb_admin_customers_v2");
        if (adminCusts) {
          const list = JSON.parse(adminCusts);
          const idx = list.findIndex((c: any) => c.id === prev.id || c.customerId === prev.customerId || c.email === prev.email);
          if (idx >= 0) {
            delete list[idx].avatarUrl;
            localStorage.setItem("pjtb_admin_customers_v2", JSON.stringify(list));
          }
        }
      } catch {}
      return updated;
    });
    toast.info("Profile picture removed");
  };

  // Beneficiaries
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([
    {
      id: "ben-1",
      name: "Barclays Private Escrow",
      bankName: "Barclays Bank UK",
      accountNumber: "•••• 4410",
      swiftBic: "BARCGB22",
      country: "United Kingdom",
      type: "International",
    },
    {
      id: "ben-2",
      name: "Solaria Capital Holdings",
      bankName: "DBS Bank Singapore",
      accountNumber: "•••• 9921",
      swiftBic: "DBSSSGSG",
      country: "Singapore",
      type: "International",
    },
    {
      id: "ben-3",
      name: "Metropolitan Custody Services",
      bankName: "JPMorgan Chase Bank, N.A.",
      accountNumber: "•••• 3810",
      country: "United States",
      type: "Domestic",
    },
  ]);

  // Transactions list
  const [transactions, setTransactions] = useState<PortalTransaction[]>([
    {
      id: "tx-1",
      reference: "PJTB-TR-9941",
      date: "2026-11-16 09:35",
      description: "Portfolio Custody Allocation",
      category: "International",
      amount: 2500000.0,
      currency: "USD",
      status: "Completed",
      counterparty: "Barclays Private Bank London",
    },
    {
      id: "tx-2",
      date: "2026-11-15 14:10",
      reference: "PJTB-TR-8812",
      description: "Treasury Clearing Dividend",
      category: "Deposit",
      amount: 145000.0,
      currency: "USD",
      status: "Completed",
      counterparty: "Federal Reserve IMAD",
    },
    {
      id: "tx-3",
      date: "2026-11-14 11:20",
      reference: "PJTB-TR-7729",
      description: "Commercial Real Estate Escrow",
      category: "Domestic",
      amount: 450000.0,
      currency: "USD",
      status: "Completed",
      counterparty: "JPMorgan Escrow Services",
    },
    {
      id: "tx-4",
      date: "2026-11-12 16:45",
      reference: "PJTB-TR-6610",
      description: "Advisory & Custody Fee",
      category: "Withdrawal",
      amount: 12500.0,
      currency: "USD",
      status: "Completed",
      counterparty: "Pinnacle J Trust Fee Settlement",
    },
  ]);

  // Transfer Forms
  const [domesticForm, setDomesticForm] = useState({
    beneficiaryBank: "JPMorgan Chase Bank, N.A.",
    beneficiaryBankAddress: "270 Park Avenue, Financial District, New York, NY 10017",
    accountNumber: "",
    beneficiaryName: "",
    amount: "",
    description: "",
  });

  const [intlForm, setIntlForm] = useState({
    beneficiaryName: "",
    beneficiaryAddress: "",
    bankName: "UBS Switzerland AG",
    bankAddress: "Paradeplatz 6, 8001 Zurich, Switzerland",
    country: "Switzerland",
    swiftBic: "UBSWCHZH80A",
    ibanAccount: "",
    amount: "",
    currency: "USD",
    purpose: "Commercial Wealth Allocation",
  });

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // PIN Authorization Modal State
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pendingTransfer, setPendingTransfer] = useState<{
    type: "Domestic" | "International";
    amount: number;
    currency: string;
    beneficiary: string;
    bankName: string;
    bankAddress: string;
    accountNumber: string;
    swiftBic?: string;
    purpose: string;
    fee: number;
    currentBalance: number;
    newBalance: number;
    details: any;
  } | null>(null);

  // Transfer Receipt Modal
  const [receiptData, setReceiptData] = useState<any | null>(null);

  // Handle Domestic Transfer Submit
  const handleInitiateDomestic = (e: React.FormEvent) => {
    e.preventDefault();
    if (customer.balance <= 0) {
      toast.error("Account balance is 0.00. Please deposit funds before initiating an outbound transfer.");
      return;
    }
    const amt = parseFloat(domesticForm.amount);
    if (!amt || amt <= 0) return void toast.error("Please enter a valid transfer amount");
    if (amt > customer.availableBalance) return void toast.error("Transfer amount exceeds available balance");
    if (!domesticForm.beneficiaryName || !domesticForm.accountNumber || !domesticForm.beneficiaryBankAddress) {
      return void toast.error("Recipient Bank Address and Beneficiary details are required");
    }

    setPendingTransfer({
      type: "Domestic",
      amount: amt,
      currency: customer.currency,
      beneficiary: domesticForm.beneficiaryName,
      bankName: domesticForm.beneficiaryBank,
      bankAddress: domesticForm.beneficiaryBankAddress,
      accountNumber: domesticForm.accountNumber,
      purpose: domesticForm.description || "Domestic Commercial Settlement",
      fee: 0.0,
      currentBalance: customer.balance,
      newBalance: Math.max(0, customer.balance - amt),
      details: { ...domesticForm },
    });
    setPreviewModalOpen(true);
  };

  // Handle International Wire Submit
  const handleInitiateIntl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customer.balance <= 0) {
      toast.error("Account balance is 0.00. Please deposit funds before initiating an outbound transfer.");
      return;
    }
    const amt = parseFloat(intlForm.amount);
    if (!amt || amt <= 0) return void toast.error("Please enter a valid transfer amount");
    const fee = 15.0;
    if (amt + fee > customer.availableBalance) return void toast.error("Transfer amount + $15.00 network fee exceeds available balance");
    if (!intlForm.beneficiaryName || !intlForm.swiftBic || !intlForm.ibanAccount) {
      return void toast.error("Please complete all mandatory international wire fields");
    }
    if (!intlForm.bankAddress || !intlForm.bankAddress.trim()) {
      return void toast.error("Recipient Bank Address is required when initiating wire transfer");
    }

    setPendingTransfer({
      type: "International",
      amount: amt,
      currency: intlForm.currency,
      beneficiary: intlForm.beneficiaryName,
      bankName: intlForm.bankName || "Receiving Financial Institution",
      bankAddress: intlForm.bankAddress,
      accountNumber: intlForm.ibanAccount,
      swiftBic: intlForm.swiftBic,
      purpose: intlForm.purpose,
      fee: fee,
      currentBalance: customer.balance,
      newBalance: Math.max(0, customer.balance - amt - fee),
      details: { ...intlForm },
    });
    setPreviewModalOpen(true);
  };

  // Execute transfer after PIN verified
  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length !== 6) return void toast.error("PIN must be exactly 6 digits");

    const ref = "PJTB-UETR-" + Math.floor(10000000 + Math.random() * 90000000);
    const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    const newTx: PortalTransaction = {
      id: `tx-${Date.now()}`,
      reference: ref,
      date: dateStr,
      description: pendingTransfer?.type === "Domestic" ? domesticForm.description || "Domestic Transfer" : intlForm.purpose,
      category: pendingTransfer?.type as any,
      amount: pendingTransfer?.amount || 0,
      currency: pendingTransfer?.currency || "USD",
      status: "Completed",
      counterparty: pendingTransfer?.beneficiary || "Beneficiary",
    };

    setTransactions((prev) => [newTx, ...prev]);
    setCustomer((prev: any) => ({
      ...prev,
      balance: prev.balance - (pendingTransfer?.amount || 0),
      availableBalance: prev.availableBalance - (pendingTransfer?.amount || 0),
    }));

    const finalBalance = Math.max(0, customer.balance - (pendingTransfer?.amount || 0) - (pendingTransfer?.fee || 0));
    setReceiptData({
      ...newTx,
      fee: pendingTransfer?.fee || 0.0,
      originAccount: customer.maskedAccountNumber,
      clearingTime: "Settled via SWIFT GPI / Fedwire Rails",
      newBalance: finalBalance,
      bankName: pendingTransfer?.bankName,
      bankAddress: pendingTransfer?.bankAddress,
      accountNumber: pendingTransfer?.accountNumber,
      swiftBic: pendingTransfer?.swiftBic,
    });

    setPinModalOpen(false);
    toast.success("Transfer authorized & executed successfully", {
      description: `Reference: ${ref}. Receipt generated.`,
    });
  };

  return (
    <div className="min-h-screen bg-[#071426] text-[#F5F7FA] font-sans antialiased selection:bg-gold/30 selection:text-gold pb-24">
      {/* Top Customer Portal Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-ivory/10 bg-[#071426]/85 backdrop-blur-xl px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="text-gold">
              <LogoMark className="h-9 w-9" />
            </span>
            <div className="leading-none">
              <span className="block font-display text-base font-bold tracking-[0.18em] text-ivory">
                PINNACLE J
              </span>
              <span className="block text-[0.6rem] tracking-[0.45em] text-gold font-medium">
                ONLINE BANKING
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 font-mono text-gold">
              <ShieldCheck className="h-3.5 w-3.5" /> 256-Bit Encrypted Session
            </div>

            <div className="flex items-center gap-3 border-l border-ivory/15 pl-4">
              {customer.avatarUrl ? (
                <img
                  src={customer.avatarUrl}
                  alt={customer.fullName}
                  className="h-8 w-8 rounded-full object-cover border border-gold/50 shadow-sm"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-gold/15 text-xs font-bold text-gold">
                  {customer.fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                </div>
              )}
              <div className="text-right hidden md:block">
                <p className="font-semibold text-ivory text-xs">{customer.fullName}</p>
                <p className="text-[10px] text-ivory/60 font-mono">ID: {customer.customerId}</p>
              </div>
              <Link
                to="/login"
                className="rounded-xl border border-ivory/15 px-3 py-1.5 text-xs text-ivory/70 hover:bg-ivory/10 hover:text-ivory"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Layout with Side Navigation */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center gap-2 border-b border-ivory/10 pb-4 mb-8 text-xs">
          {[
            { id: "overview", label: "Account Overview", icon: CreditCard },
            { id: "transfers", label: "Transfer Centre", icon: ArrowLeftRight },
            { id: "transactions", label: `Transaction History (${transactions.length})`, icon: History },
            { id: "beneficiaries", label: `Beneficiaries (${beneficiaries.length})`, icon: Users },
            { id: "security", label: "Security & Credentials", icon: Lock },
            { id: "settings", label: "Profile & Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all font-medium ${
                  isActive
                    ? "border border-gold/40 bg-gold/15 text-gold font-semibold shadow-md shadow-gold/10"
                    : "border border-transparent text-ivory/70 hover:bg-white/[0.04] hover:text-ivory"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

                {/* Pending Administrator Approval Banner */}
        {customer.accountStatus === "Pending" && (
          <div className="mb-8 rounded-2xl border border-gold/40 bg-gold/10 p-5 backdrop-blur-xl flex items-start gap-4 animate-in fade-in">
            <Clock className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gold text-sm font-display tracking-wide uppercase">
                Account Application Under Administrative Review
              </h3>
              <p className="mt-1 text-xs text-ivory/80 leading-relaxed">
                Thank you for applying to Pinnacle J Trust Bank. Your application has been logged and is awaiting formal approval from the Bank Administrator. Your opening balance is currently <span className="font-mono font-bold text-gold">$0.00</span>. Outbound transfers will activate once approval is granted.
              </p>
            </div>
          </div>
        )}

        {/* TAB 1: CUSTOMER ACCOUNT OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Overview Glass Banner */}
            <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-[#0C1B30] via-[#071426] to-[#0C1B30] p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />

              <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-gold uppercase">
                      {customer.accountType}
                    </span>
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                      ● {customer.accountStatus}
                    </span>
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                      KYC: {customer.verificationStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {customer.avatarUrl ? (
                      <img
                        src={customer.avatarUrl}
                        alt={customer.fullName}
                        className="h-16 w-16 rounded-full object-cover border-2 border-gold/60 shadow-xl"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold/40 bg-gold/15 font-display text-2xl font-bold text-gold shadow-xl">
                        {customer.fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                      </div>
                    )}
                    <div>
                      <h1 className="text-3xl font-display font-bold text-ivory">{customer.fullName}</h1>
                    </div>
                  </div>

                  {/* Masked Account Number with Toggle */}
                  <div className="mt-2 flex items-center gap-2 text-xs font-mono text-ivory/70">
                    <span>Account Number:</span>
                    <strong className="text-gold">
                      {showAccountNumber ? customer.accountNumber : customer.maskedAccountNumber}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                      className="text-ivory/50 hover:text-gold p-1"
                      title={showAccountNumber ? "Mask account" : "Reveal account"}
                    >
                      {showAccountNumber ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Balance Display with Visibility Toggle */}
                <div className="rounded-2xl border border-ivory/10 bg-navy-deep/80 p-6 backdrop-blur-md min-w-[260px]">
                  <div className="flex items-center justify-between text-xs text-ivory/60 mb-1">
                    <span>Available Liquidity</span>
                    <button
                      type="button"
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-ivory/50 hover:text-gold flex items-center gap-1"
                    >
                      {showBalance ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span className="text-[10px]">{showBalance ? "Hide" : "Show"}</span>
                    </button>
                  </div>

                  <p className="text-3xl font-display font-bold text-gold tracking-tight">
                    {showBalance
                      ? `${customer.currency} ${customer.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                      : "••••••••••"}
                  </p>

                  <div className="mt-3 flex items-center justify-between border-t border-ivory/10 pt-2 text-[11px] text-ivory/50 font-mono">
                    <span>Total Custody Balance:</span>
                    <span>
                      {showBalance
                        ? `${customer.currency} ${customer.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                        : "••••••••••"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="mt-8 flex flex-wrap gap-3 border-t border-ivory/10 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("transfers");
                    setTransferType("domestic");
                  }}
                  className="rounded-xl bg-gold px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-navy-deep hover:bg-gold-soft transition-all shadow-md flex items-center gap-2"
                >
                  <ArrowUpRight className="h-4 w-4" /> Domestic Transfer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("transfers");
                    setTransferType("international");
                  }}
                  className="rounded-xl border border-gold/40 bg-gold/15 px-5 py-2.5 text-xs font-semibold text-gold hover:bg-gold/25 transition-all shadow-md flex items-center gap-2"
                >
                  <Globe className="h-4 w-4" /> International Wire
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("beneficiaries")}
                  className="rounded-xl border border-ivory/20 px-5 py-2.5 text-xs font-medium text-ivory/80 hover:bg-ivory/10 transition-colors"
                >
                  Manage Beneficiaries
                </button>
              </div>
            </div>

            {/* Recent Account Activity */}
            <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-bold text-ivory">Recent Transactions</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab("transactions")}
                  className="text-xs text-gold hover:underline flex items-center gap-1 font-semibold"
                >
                  Full Statement <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              <div className="divide-y divide-ivory/10">
                {transactions.slice(0, 3).map((tx) => (
                  <div key={tx.id} className="py-3.5 flex items-center justify-between hover:bg-ivory/5 px-2 rounded-lg transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                          tx.category === "Deposit"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-gold/30 bg-gold/10 text-gold"
                        }`}
                      >
                        {tx.category === "Deposit" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-xs text-ivory">{tx.description}</p>
                        <p className="text-[10px] text-ivory/50 font-mono">{tx.reference} · {tx.date}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-mono text-sm font-bold ${tx.category === "Deposit" ? "text-emerald-400" : "text-ivory"}`}>
                        {tx.category === "Deposit" ? "+" : "-"}{tx.currency} {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSFER CENTRE */}
        {activeTab === "transfers" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Transfer Sub-Tabs */}
            <div className="flex gap-3 border-b border-ivory/10 pb-4">
              <button
                type="button"
                onClick={() => setTransferType("domestic")}
                className={`rounded-xl px-5 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                  transferType === "domestic"
                    ? "bg-gold text-navy-deep font-bold shadow-lg"
                    : "border border-ivory/15 text-ivory/70 hover:bg-ivory/5"
                }`}
              >
                A. Domestic Transfers
              </button>
              <button
                type="button"
                onClick={() => setTransferType("international")}
                className={`rounded-xl px-5 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                  transferType === "international"
                    ? "bg-gold text-navy-deep font-bold shadow-lg"
                    : "border border-ivory/15 text-ivory/70 hover:bg-ivory/5"
                }`}
              >
                B. International Wire Transfers
              </button>
            </div>

            {/* SECTION A: DOMESTIC TRANSFERS */}
            {transferType === "domestic" && (
              <div className="rounded-3xl border border-ivory/15 bg-gradient-to-b from-[#0C1B30]/90 to-[#071426]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
                <div className="border-b border-ivory/10 pb-4 mb-6">
                  <h3 className="text-2xl font-display font-bold text-ivory">Domestic Account Clearance</h3>
                  <p className="text-xs text-ivory/60 mt-1">
                    Send funds to supported domestic financial institutions with real-time settlement and $0.00 clearance fees.
                  </p>
                </div>

                <form onSubmit={handleInitiateDomestic} className="space-y-5 max-w-2xl">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                        Beneficiary Bank *
                      </label>
                      <select
                        value={domesticForm.beneficiaryBank}
                        onChange={(e) => setDomesticForm({ ...domesticForm, beneficiaryBank: e.target.value })}
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                      >
                        <option value="JPMorgan Chase Bank, N.A.">JPMorgan Chase Bank, N.A.</option>
                        <option value="Bank of America, N.A.">Bank of America, N.A.</option>
                        <option value="Citibank, N.A.">Citibank, N.A.</option>
                        <option value="Wells Fargo Bank, N.A.">Wells Fargo Bank, N.A.</option>
                        <option value="Goldman Sachs Bank USA">Goldman Sachs Bank USA</option>
                        <option value="Barclays Bank UK">Barclays Bank UK</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                        Beneficiary Full Name *
                      </label>
                      <input
                        type="text"
                        value={domesticForm.beneficiaryName}
                        onChange={(e) => setDomesticForm({ ...domesticForm, beneficiaryName: e.target.value })}
                        placeholder="Legal individual or entity name"
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        value={domesticForm.accountNumber}
                        onChange={(e) => setDomesticForm({ ...domesticForm, accountNumber: e.target.value })}
                        placeholder="Routing or account number"
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                        Transfer Amount ({customer.currency}) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={domesticForm.amount}
                        onChange={(e) => setDomesticForm({ ...domesticForm, amount: e.target.value })}
                        placeholder="0.00"
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none font-mono font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                        Payment Reference / Description
                      </label>
                      <input
                        type="text"
                        value={domesticForm.description}
                        onChange={(e) => setDomesticForm({ ...domesticForm, description: e.target.value })}
                        placeholder="e.g. Invoice settlement, contract deposit"
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Fee Disclosure & Authorization CTA */}
                  <div className="rounded-xl border border-ivory/10 bg-navy/60 p-4 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-ivory/60">Applicable Clearance Fee:</span>
                      <p className="font-mono text-emerald-400 font-bold">$0.00 (Standard Domestic Network)</p>
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-gold px-6 py-3 text-xs font-bold uppercase tracking-wider text-navy-deep hover:bg-gold-soft transition-all shadow-lg"
                    >
                      Authorize Domestic Wire
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SECTION B: INTERNATIONAL WIRE TRANSFERS */}
            {transferType === "international" && (
              <div className="rounded-3xl border border-ivory/15 bg-gradient-to-b from-[#0C1B30]/90 to-[#071426]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
                <div className="border-b border-ivory/10 pb-4 mb-6">
                  <h3 className="text-2xl font-display font-bold text-ivory">International SWIFT / Cross-Border Wire</h3>
                  <p className="text-xs text-ivory/60 mt-1">
                    Execute cross-border foreign exchange and custodial payments via global SWIFT GPI rails with real-time tracking.
                  </p>
                </div>

                <form onSubmit={handleInitiateIntl} className="space-y-5 max-w-2xl">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                        Beneficiary Full Legal Name *
                      </label>
                      <input
                        type="text"
                        value={intlForm.beneficiaryName}
                        onChange={(e) => setIntlForm({ ...intlForm, beneficiaryName: e.target.value })}
                        placeholder="Exact entity or personal name"
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                        Beneficiary Country *
                      </label>
                      <select
                        value={intlForm.country}
                        onChange={(e) => setIntlForm({ ...intlForm, country: e.target.value })}
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                      >
                        <option value="Switzerland">Switzerland (CH)</option>
                        <option value="United Kingdom">United Kingdom (GB)</option>
                        <option value="Germany">Germany (DE)</option>
                        <option value="Singapore">Singapore (SG)</option>
                        <option value="United Arab Emirates">United Arab Emirates (AE)</option>
                        <option value="Japan">Japan (JP)</option>
                        <option value="Luxembourg">Luxembourg (LU)</option>
                        <option value="France">France (FR)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                        SWIFT / BIC Code *
                      </label>
                      <input
                        type="text"
                        value={intlForm.swiftBic}
                        onChange={(e) => setIntlForm({ ...intlForm, swiftBic: e.target.value.toUpperCase() })}
                        placeholder="e.g. UBSWCHZH80A"
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                        IBAN or International Account *
                      </label>
                      <input
                        type="text"
                        value={intlForm.ibanAccount}
                        onChange={(e) => setIntlForm({ ...intlForm, ibanAccount: e.target.value })}
                        placeholder="e.g. CH93 0024 0240 1928 33"
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                        Transfer Amount *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={intlForm.amount}
                        onChange={(e) => setIntlForm({ ...intlForm, amount: e.target.value })}
                        placeholder="0.00"
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                        Transfer Currency
                      </label>
                      <select
                        value={intlForm.currency}
                        onChange={(e) => setIntlForm({ ...intlForm, currency: e.target.value })}
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none font-mono"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="CHF">CHF (Fr.)</option>
                        <option value="SGD">SGD (S$)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                        Recipient Bank Name *
                      </label>
                      <input
                        type="text"
                        value={intlForm.bankName}
                        onChange={(e) => setIntlForm({ ...intlForm, bankName: e.target.value })}
                        placeholder="e.g. UBS Switzerland AG"
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                        Recipient Bank Address *
                      </label>
                      <input
                        type="text"
                        value={intlForm.bankAddress}
                        onChange={(e) => setIntlForm({ ...intlForm, bankAddress: e.target.value })}
                        placeholder="e.g. Paradeplatz 6, 8001 Zurich, Switzerland"
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                        Payment Purpose / Regulatory Declaration *
                      </label>
                      <input
                        type="text"
                        value={intlForm.purpose}
                        onChange={(e) => setIntlForm({ ...intlForm, purpose: e.target.value })}
                        placeholder="e.g. Private asset acquisition, family trust settlement"
                        required
                        className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* International Wire Fee & Quotation */}
                  <div className="rounded-xl border border-gold/30 bg-gold/10 p-4 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-ivory/60">SWIFT GPI Network Fee:</span>
                      <p className="font-mono text-gold font-bold">$15.00 Flat (Same-Day Global Settlement)</p>
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-gold px-6 py-3 text-xs font-bold uppercase tracking-wider text-navy-deep hover:bg-gold-soft transition-all shadow-lg"
                    >
                      Authorize International Wire
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: TRANSACTION HISTORY */}
        {activeTab === "transactions" && (
          <div className="rounded-3xl border border-ivory/15 bg-white/[0.04] p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-4">
              <div>
                <h3 className="text-2xl font-display font-bold text-ivory">Comprehensive Transaction Ledger</h3>
                <p className="text-xs text-ivory/60">Download official statements and inspect cleared transactions</p>
              </div>

              <button
                type="button"
                onClick={() => toast.success("PDF Monthly Account Statement downloaded successfully")}
                className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/15 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/25 transition-all shadow-md"
              >
                <Download className="h-4 w-4" /> Export Official Statement
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-ivory/10 bg-navy-deep/80 text-[11px] font-semibold uppercase tracking-wider text-ivory/60 font-mono">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3">Reference</th>
                    <th scope="col" className="px-3 py-3.5">Date & Time</th>
                    <th scope="col" className="px-3 py-3.5">Description</th>
                    <th scope="col" className="px-3 py-3.5">Category</th>
                    <th scope="col" className="px-3 py-3.5">Amount</th>
                    <th scope="col" className="py-3.5 pl-3 pr-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ivory/5 text-ivory">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-white/[0.03] transition-colors cursor-pointer" onClick={() => setReceiptData(tx)}>
                      <td className="py-3.5 pl-4 pr-3 font-mono font-medium text-gold">{tx.reference}</td>
                      <td className="px-3 py-3.5 font-mono text-ivory/60">{tx.date}</td>
                      <td className="px-3 py-3.5 font-semibold text-ivory">{tx.description}</td>
                      <td className="px-3 py-3.5">
                        <span className="rounded-lg border border-ivory/10 bg-navy/60 px-2 py-0.5 text-[10px]">
                          {tx.category}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 font-mono font-bold">
                        <span className={tx.category === "Deposit" ? "text-emerald-400" : "text-ivory"}>
                          {tx.category === "Deposit" ? "+" : "-"}{tx.currency} {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3.5 pl-3 pr-4 text-right">
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: BENEFICIARY MANAGEMENT */}
        {activeTab === "beneficiaries" && (
          <div className="rounded-3xl border border-ivory/15 bg-white/[0.04] p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-ivory/10 pb-4">
              <div>
                <h3 className="text-2xl font-display font-bold text-ivory">Saved Transfer Beneficiaries</h3>
                <p className="text-xs text-ivory/60">Whitelisted accounts for expedited clearance</p>
              </div>

              <button
                type="button"
                onClick={() => toast.info("New beneficiary creation requires 6-digit Transfer PIN verification")}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gold px-4 py-2 text-xs font-semibold text-navy-deep hover:bg-gold-soft transition-all"
              >
                <Plus className="h-4 w-4" /> Add Beneficiary
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {beneficiaries.map((b) => (
                <div key={b.id} className="rounded-2xl border border-ivory/10 bg-navy-deep/60 p-5 space-y-2 relative group">
                  <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-mono text-gold border border-gold/30">
                    {b.type}
                  </span>
                  <h4 className="font-semibold text-ivory text-sm">{b.name}</h4>
                  <p className="text-xs text-ivory/60">{b.bankName} · {b.country}</p>
                  <p className="font-mono text-xs text-gold">{b.accountNumber}</p>
                  {b.swiftBic && <p className="font-mono text-[10px] text-ivory/40">SWIFT: {b.swiftBic}</p>}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setBeneficiaries((prev) => prev.filter((item) => item.id !== b.id));
                        toast.info("Beneficiary removed from whitelist");
                      }}
                      className="text-ivory/40 hover:text-red-400 p-1"
                      title="Remove beneficiary"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SECURITY SETTINGS */}
        {activeTab === "security" && (
          <div className="rounded-3xl border border-ivory/15 bg-white/[0.04] p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-ivory/10 pb-4">
              <h3 className="text-2xl font-display font-bold text-ivory">Security & Authentication Controls</h3>
              <p className="text-xs text-ivory/60">Configure your hardware token, transfer PIN, and password</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-ivory/10 bg-navy-deep/60 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <KeyRound className="h-5 w-5 text-gold" />
                  <h4 className="font-semibold text-ivory text-sm">Transfer Security PIN</h4>
                </div>
                <p className="text-xs text-ivory/60">
                  Your private six-digit PIN authorizes high-value transfers. Never disclosed to bank administrators.
                </p>
                <button
                  type="button"
                  onClick={() => toast.info("Transfer PIN update requires authenticated recovery verification")}
                  className="rounded-xl border border-gold/40 bg-gold/15 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/25"
                >
                  Change Transfer PIN
                </button>
              </div>

              <div className="rounded-2xl border border-ivory/10 bg-navy-deep/60 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <h4 className="font-semibold text-ivory text-sm">Two-Factor Authentication</h4>
                </div>
                <p className="text-xs text-ivory/60">
                  Hardware security key (FIDO2 / YubiKey) and biometric Face ID enabled for instant session verification.
                </p>
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> Active on Current Device
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: PROFILE AND ACCOUNT SETTINGS (ULTRA GLASSLIKE) */}
        {activeTab === "settings" && (
          <div className="relative rounded-3xl border border-white/20 bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-white/[0.06] p-6 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-8 animate-in fade-in duration-200 overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative z-10 border-b border-white/10 pb-5">
              <span className="text-[10px] font-mono tracking-widest text-gold uppercase">Institutional Credentials</span>
              <h3 className="text-3xl font-display font-bold text-ivory mt-1">Profile & Identification Settings</h3>
              <p className="text-xs text-ivory/60 mt-0.5">Glassmorphic security dashboard for personal data and verified account credentials</p>
            </div>

            {/* Profile Avatar Management Card */}
            <div className="relative z-10 rounded-2xl border border-white/15 bg-white/[0.04] p-6 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative group">
                  {customer.avatarUrl ? (
                    <img
                      src={customer.avatarUrl}
                      alt={customer.fullName}
                      className="h-20 w-20 rounded-full object-cover border-2 border-gold shadow-xl"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold/40 bg-gold/15 text-2xl font-bold font-display text-gold shadow-xl">
                      {customer.fullName.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Change Profile Picture"
                    className="absolute inset-0 rounded-full bg-navy-deep/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-gold transition-opacity cursor-pointer"
                  >
                    <Camera className="h-6 w-6" />
                  </button>
                </div>
                <div>
                  <h4 className="font-display font-bold text-lg text-ivory">{customer.fullName}</h4>
                  <p className="text-xs text-gold font-mono">{customer.accountNumber}</p>
                  <p className="text-[11px] text-ivory/50 mt-1">Supported formats: JPEG, PNG, WebP (Max 5MB)</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl border border-gold/40 bg-gold/15 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/25 transition-all shadow-md flex items-center gap-2"
                >
                  <Upload className="h-3.5 w-3.5" /> Upload Photo
                </button>
                {customer.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-all"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="relative z-10 grid gap-5 sm:grid-cols-2 text-xs">
              <div className="group rounded-2xl border border-white/15 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl hover:border-gold/50 transition-all">
                <span className="text-[10px] text-gold/80 font-mono uppercase tracking-wider">Legal Full Name</span>
                <p className="font-display font-bold text-lg text-ivory mt-1">{customer.fullName}</p>
                <span className="text-[10px] text-ivory/40">Verified via Primary Identity KYC</span>
              </div>

              <div className="group rounded-2xl border border-white/15 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl hover:border-gold/50 transition-all">
                <span className="text-[10px] text-gold/80 font-mono uppercase tracking-wider">Registered Email</span>
                <p className="font-mono text-sm text-ivory mt-1">{customer.email}</p>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3" /> Two-Factor Enabled
                </span>
              </div>

              <div className="group rounded-2xl border border-white/15 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl hover:border-gold/50 transition-all">
                <span className="text-[10px] text-gold/80 font-mono uppercase tracking-wider">Registered Mobile</span>
                <p className="font-mono text-sm text-ivory mt-1">{customer.phone}</p>
                <span className="text-[10px] text-ivory/40">Encrypted SMS Gateway Active</span>
              </div>

              <div className="group rounded-2xl border border-white/15 bg-white/[0.04] p-5 shadow-xl backdrop-blur-xl hover:border-gold/50 transition-all">
                <span className="text-[10px] text-gold/80 font-mono uppercase tracking-wider">Primary Residence</span>
                <p className="font-medium text-xs text-ivory mt-1">{customer.address.street}, {customer.address.city}, {customer.address.country}</p>
                <span className="text-[10px] text-ivory/40">Jurisdiction: {customer.address.country}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PIN AUTHORIZATION MODAL */}
      {pinModalOpen && pendingTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-md rounded-3xl border border-gold/40 bg-gradient-to-b from-[#0C1B30] to-[#071426] p-6 shadow-2xl text-ivory space-y-5">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-gold/15 text-gold">
                <Lock className="h-7 w-7" />
              </div>
              <h3 className="mt-3 text-xl font-display font-bold text-ivory">Transfer Security Authorization</h3>
              <p className="mt-1 text-xs text-ivory/60">
                Authorizing {pendingTransfer.type} transfer of <strong className="text-gold">{pendingTransfer.currency} {pendingTransfer.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> to <span className="text-ivory">{pendingTransfer.beneficiary}</span>.
              </p>
            </div>

            <form onSubmit={handleConfirmPin} className="space-y-4">
              <div>
                <label className="block text-center text-xs font-semibold uppercase tracking-wider text-gold mb-2">
                  Enter 6-Digit Transfer PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  autoFocus
                  required
                  className="w-full rounded-2xl border border-gold/40 bg-navy-deep p-3 text-center text-2xl font-mono tracking-[0.5em] text-gold focus:border-gold focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPinModalOpen(false)}
                  className="flex-1 rounded-xl border border-ivory/20 py-2.5 text-xs text-ivory/70 hover:bg-ivory/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pinInput.length !== 6}
                  className="flex-1 rounded-xl bg-gold py-2.5 text-xs font-bold uppercase tracking-wider text-navy-deep hover:bg-gold-soft disabled:opacity-40"
                >
                  Confirm & Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSFER RECEIPT MODAL */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg rounded-3xl border border-gold/40 bg-gradient-to-b from-[#0C1B30] to-[#071426] p-8 shadow-2xl text-ivory space-y-6">
            <div className="flex items-start justify-between border-b border-ivory/10 pb-4">
              <div className="flex items-center gap-3">
                <LogoMark className="h-8 w-8 text-gold" />
                <div>
                  <h3 className="font-display font-bold text-lg text-ivory">Transfer Confirmation Receipt</h3>
                  <p className="text-[10px] font-mono text-gold">PINNACLE J TRUST BANK CLEARING</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReceiptData(null)}
                className="rounded-lg p-1 text-ivory/60 hover:bg-ivory/10"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl border border-ivory/10 bg-navy-deep/80 p-5 space-y-3 text-xs">
              <div className="flex justify-between border-b border-ivory/10 pb-2">
                <span className="text-ivory/60">Reference Code:</span>
                <span className="font-mono font-bold text-gold">{receiptData.reference}</span>
              </div>
              <div className="flex justify-between border-b border-ivory/10 pb-2">
                <span className="text-ivory/60">Amount Cleared:</span>
                <span className="font-mono font-bold text-ivory">
                  {receiptData.currency} {receiptData.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between border-b border-ivory/10 pb-2">
                <span className="text-ivory/60">Beneficiary:</span>
                <span className="font-semibold text-ivory">{receiptData.counterparty}</span>
              </div>
              <div className="flex justify-between border-b border-ivory/10 pb-2">
                <span className="text-ivory/60">Execution Timestamp:</span>
                <span className="font-mono text-ivory/80">{receiptData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ivory/60">Clearance Status:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Settled & Logged
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-ivory/20 px-4 py-2 text-xs text-ivory hover:bg-ivory/10"
              >
                <Printer className="h-3.5 w-3.5" /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setReceiptData(null)}
                className="rounded-xl bg-gold px-5 py-2 text-xs font-bold text-navy-deep hover:bg-gold-soft"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
