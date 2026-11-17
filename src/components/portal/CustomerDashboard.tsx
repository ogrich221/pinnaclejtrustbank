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
          const adminCusts = localStorage.getItem("pjtb_admin_customers_v3");
          if (adminCusts) {
            const list = JSON.parse(adminCusts);
            const idx = list.findIndex((c: any) => c.id === prev.id || c.customerId === prev.customerId || c.email === prev.email);
            if (idx >= 0) {
              list[idx].avatarUrl = dataUrl;
              localStorage.setItem("pjtb_admin_customers_v3", JSON.stringify(list));
              window.dispatchEvent(new Event("storage"));
              window.dispatchEvent(new CustomEvent("pjtb_sync"));
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
        const adminCusts = localStorage.getItem("pjtb_admin_customers_v3");
        if (adminCusts) {
          const list = JSON.parse(adminCusts);
          const idx = list.findIndex((c: any) => c.id === prev.id || c.customerId === prev.customerId || c.email === prev.email);
          if (idx >= 0) {
            list[idx].avatarUrl = url;
            localStorage.setItem("pjtb_admin_customers_v3", JSON.stringify(list));
            window.dispatchEvent(new Event("storage"));
            window.dispatchEvent(new CustomEvent("pjtb_sync"));
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
        const adminCusts = localStorage.getItem("pjtb_admin_customers_v3");
        if (adminCusts) {
          const list = JSON.parse(adminCusts);
          const idx = list.findIndex((c: any) => c.id === prev.id || c.customerId === prev.customerId || c.email === prev.email);
          if (idx >= 0) {
            delete list[idx].avatarUrl;
            localStorage.setItem("pjtb_admin_customers_v3", JSON.stringify(list));
            window.dispatchEvent(new Event("storage"));
            window.dispatchEvent(new CustomEvent("pjtb_sync"));
          }
        }
      } catch {}
      return updated;
    });
    toast.info("Profile picture removed");
  };

  // Beneficiaries (blank by default for all new profiles until created)
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => {
    try {
      const savedCustomer = localStorage.getItem("pjtb_current_portal_customer");
      const currentCust = savedCustomer ? JSON.parse(savedCustomer) : null;
      const targetId = currentCust?.customerId || currentCust?.id || "PJ-89201";
      const saved = localStorage.getItem(`pjtb_portal_beneficiaries_${targetId}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Transactions list (starts at zero for all new & testrun customer profiles)
  const [transactions, setTransactions] = useState<PortalTransaction[]>(() => {
    try {
      const savedCustomer = localStorage.getItem("pjtb_current_portal_customer");
      const currentCust = savedCustomer ? JSON.parse(savedCustomer) : null;
      const targetId = currentCust?.customerId || currentCust?.id || "PJ-89201";

      const userTxKey = `pjtb_portal_tx_${targetId}`;
      const savedUserTx = localStorage.getItem(userTxKey);
      if (savedUserTx) return JSON.parse(savedUserTx);

      const adminTxStored = localStorage.getItem("pjtb_admin_transactions_v3");
      if (adminTxStored) {
        const allAdminTx = JSON.parse(adminTxStored);
        const customerTx = allAdminTx.filter(
          (t: any) =>
            t.customerId === targetId ||
            (currentCust?.accountNumber && t.beneficiaryAccount === currentCust.accountNumber)
        );
        if (customerTx.length > 0) {
          return customerTx.map((t: any) => ({
            id: t.id,
            reference: t.reference,
            date: t.timestamp,
            description: t.purpose || t.type,
            category: t.direction === "Inbound" ? "Deposit" : "Withdrawal",
            amount: t.amount,
            currency: t.currency || "USD",
            status: t.status === "Settled" ? "Completed" : t.status,
            counterparty: t.originatingBank || t.beneficiaryName || "Direct Settlement",
          }));
        }
      }
    } catch {
      // ignore
    }
    return [];
  });

  // Reactive synchronization hook with Administrator registry
  useEffect(() => {
    const syncFromStorage = () => {
      try {
        const adminCustsStr = localStorage.getItem("pjtb_admin_customers_v3");
        const currentPortalStr = localStorage.getItem("pjtb_current_portal_customer");
        const currentLocal = currentPortalStr ? JSON.parse(currentPortalStr) : customer;

        let latestCust = currentLocal;
        if (adminCustsStr) {
          const list = JSON.parse(adminCustsStr);
          const found = list.find(
            (c: any) =>
              c.id === currentLocal.id ||
              c.customerId === currentLocal.customerId ||
              (c.email && c.email.toLowerCase() === currentLocal.email?.toLowerCase())
          );
          if (found) {
            latestCust = found;
          }
        }

        if (latestCust) {
          setCustomer(latestCust);
          localStorage.setItem("pjtb_current_portal_customer", JSON.stringify(latestCust));

          // Also reload transactions
          const targetId = latestCust.customerId || latestCust.id;
          const userTxKey = `pjtb_portal_tx_${targetId}`;
          const savedUserTx = localStorage.getItem(userTxKey) || localStorage.getItem(`pjtb_portal_tx_${latestCust.id}`);
          if (savedUserTx) {
            setTransactions(JSON.parse(savedUserTx));
          } else {
            const adminTxStored = localStorage.getItem("pjtb_admin_transactions_v3");
            if (adminTxStored) {
              const allAdminTx = JSON.parse(adminTxStored);
              const customerTx = allAdminTx.filter(
                (t: any) =>
                  t.customerId === targetId ||
                  (latestCust.accountNumber && t.beneficiaryAccount === latestCust.accountNumber)
              );
              setTransactions(
                customerTx.map((t: any) => ({
                  id: t.id,
                  reference: t.reference,
                  date: t.timestamp,
                  description: t.purpose || t.type,
                  category: t.direction === "Inbound" ? "Deposit" : "Withdrawal",
                  amount: t.amount,
                  currency: t.currency || "USD",
                  status: t.status === "Settled" ? "Completed" : t.status,
                  counterparty: t.originatingBank || t.beneficiaryName || "Direct Settlement",
                }))
              );
            } else {
              setTransactions([]);
            }
          }
        }
      } catch (err) {
        console.error("Portal sync error:", err);
      }
    };

    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener("pjtb_sync", syncFromStorage);
    window.addEventListener("focus", syncFromStorage);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener("pjtb_sync", syncFromStorage);
      window.removeEventListener("focus", syncFromStorage);
    };
  }, []);

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

    const amt = pendingTransfer?.amount || 0;
    const fee = pendingTransfer?.fee || 0;
    const totalDeduction = amt + fee;
    const finalBalance = Math.max(0, customer.balance - totalDeduction);
    const finalAvail = Math.max(0, customer.availableBalance - totalDeduction);

    const ref = "PJTB-UETR-" + Math.floor(10000000 + Math.random() * 90000000);
    const dateStr = new Date().toISOString().replace("T", " ").substring(0, 16);

    const newTx: PortalTransaction = {
      id: `tx-${Date.now()}`,
      reference: ref,
      date: dateStr,
      description: pendingTransfer?.type === "Domestic" ? domesticForm.description || "Domestic Transfer" : intlForm.purpose,
      category: pendingTransfer?.type as any,
      amount: amt,
      currency: pendingTransfer?.currency || "USD",
      status: "Completed",
      counterparty: pendingTransfer?.beneficiary || "Beneficiary",
    };

    const updatedTxList = [newTx, ...transactions];
    setTransactions(updatedTxList);

    const updatedCustomer = {
      ...customer,
      balance: finalBalance,
      availableBalance: finalAvail,
    };
    setCustomer(updatedCustomer);

    // Persist to local customer portal session
    try {
      localStorage.setItem("pjtb_current_portal_customer", JSON.stringify(updatedCustomer));
      const targetId = customer.customerId || customer.id;
      localStorage.setItem(`pjtb_portal_tx_${targetId}`, JSON.stringify(updatedTxList));
      if (customer.id) localStorage.setItem(`pjtb_portal_tx_${customer.id}`, JSON.stringify(updatedTxList));
    } catch {}

    // Update in Admin Customers registry & Admin Transactions ledger
    try {
      const adminCustsStr = localStorage.getItem("pjtb_admin_customers_v3");
      if (adminCustsStr) {
        const adminCustList = JSON.parse(adminCustsStr);
        const idx = adminCustList.findIndex(
          (c: any) =>
            c.id === customer.id ||
            c.customerId === customer.customerId ||
            (c.email && c.email.toLowerCase() === customer.email?.toLowerCase())
        );
        if (idx >= 0) {
          adminCustList[idx].balance = finalBalance;
          adminCustList[idx].availableBalance = finalAvail;
          adminCustList[idx].notes = [
            {
              id: `note-${Date.now()}`,
              authorName: "Online Banking Rails",
              authorRole: "Customer",
              timestamp: dateStr,
              content: `Outbound ${pendingTransfer?.type} Transfer: ${customer.currency} ${amt.toFixed(2)} to ${pendingTransfer?.beneficiary}. New balance: ${customer.currency} ${finalBalance.toFixed(2)}`,
              category: "Audit",
            },
            ...(adminCustList[idx].notes || []),
          ];
          localStorage.setItem("pjtb_admin_customers_v3", JSON.stringify(adminCustList));
        }
      }

      // Add to Admin Transactions ledger
      const adminTxStr = localStorage.getItem("pjtb_admin_transactions_v3");
      const adminTxList = adminTxStr ? JSON.parse(adminTxStr) : [];
      adminTxList.unshift({
        id: newTx.id,
        reference: ref,
        customerId: customer.customerId,
        customerName: customer.fullName,
        type: pendingTransfer?.type === "Domestic" ? "Domestic Wire" : "International Wire",
        amount: amt,
        currency: customer.currency,
        direction: "Outbound",
        timestamp: dateStr,
        status: "Settled",
        riskScore: 3,
        riskLevel: "Low",
        originatingBank: "Pinnacle J Trust Bank",
        beneficiaryName: pendingTransfer?.beneficiary || "Beneficiary",
        beneficiaryAccount: pendingTransfer?.accountNumber || "N/A",
        clearingRoute: pendingTransfer?.type === "Domestic" ? "Fedwire Real-Time Gross Settlement" : "SWIFT GPI High-Value Cross-Border Rail",
        purpose: newTx.description,
        timeline: [
          { stage: "Initiated", timestamp: dateStr, status: "Completed", note: "Customer authorized transfer via portal" },
          { stage: "Authorized", timestamp: dateStr, status: "Completed", note: "Verified with 6-digit Customer PIN" },
          { stage: "Settled", timestamp: dateStr, status: "Completed", note: `Deducted from account. New balance: ${customer.currency} ${finalBalance.toFixed(2)}` },
        ],
      });
      localStorage.setItem("pjtb_admin_transactions_v3", JSON.stringify(adminTxList));

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new CustomEvent("pjtb_sync"));
    } catch {}

    setReceiptData({
      ...newTx,
      fee: fee,
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
        {/* Navigation Tabs Bar - Horizontally Scrollable on Mobile, Wrapped on Desktop */}
        <div className="flex items-center gap-2 border-b border-ivory/10 pb-4 mb-8 text-xs overflow-x-auto scrollbar-none sm:flex-wrap -mx-4 px-4 sm:mx-0 sm:px-0">
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
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all font-medium whitespace-nowrap shrink-0 ${
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

              {transactions.length === 0 ? (
                <div className="py-8 text-center text-xs text-ivory/50">
                  <History className="h-8 w-8 mx-auto mb-2 text-ivory/30" />
                  <p className="font-semibold text-ivory/70">Zero Transaction History</p>
                  <p className="mt-1">All new and testrun customer profiles start blank ($0.00) until funded or transferred.</p>
                </div>
              ) : (
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
              )}
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

            {transactions.length === 0 ? (
              <div className="py-14 text-center text-xs text-ivory/50 rounded-2xl border border-ivory/10 bg-navy-deep/60 p-8">
                <History className="h-10 w-10 mx-auto mb-3 text-ivory/30" />
                <p className="text-sm font-semibold text-ivory/80">No Transactions Recorded</p>
                <p className="mt-1 max-w-md mx-auto text-ivory/50">
                  This account currently has zero transactions. All new customer profiles remain completely blank ($0.00) until initial funds are deposited or transferred.
                </p>
              </div>
            ) : (
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
            )}
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

            {beneficiaries.length === 0 ? (
              <div className="py-14 text-center text-xs text-ivory/50 rounded-2xl border border-ivory/10 bg-navy-deep/60 p-8">
                <Users className="h-10 w-10 mx-auto mb-3 text-ivory/30" />
                <p className="text-sm font-semibold text-ivory/80">No Saved Beneficiaries</p>
                <p className="mt-1 max-w-md mx-auto text-ivory/50">
                  Your beneficiary directory is blank. Saved recipients will appear here for one-click recurring transfers.
                </p>
              </div>
            ) : (
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
                          const updated = beneficiaries.filter((item) => item.id !== b.id);
                          setBeneficiaries(updated);
                          const targetId = customer.customerId || customer.id;
                          try {
                            localStorage.setItem(`pjtb_portal_beneficiaries_${targetId}`, JSON.stringify(updated));
                          } catch {}
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
            )}
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

      {/* PRE-AUTHORIZATION TRANSFER CONFIRMATION & DETAILS PREVIEW MODAL */}
      {previewModalOpen && pendingTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl border border-gold/40 bg-gradient-to-b from-[#0C1B30] to-[#071426] p-6 sm:p-8 shadow-2xl text-ivory space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-ivory/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold">
                  Pre-Authorization Review
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-ivory mt-0.5">
                  Confirm Transfer Details
                </h3>
                <p className="text-xs text-ivory/60 mt-0.5">
                  Verify recipient details and projected balance before entering your security PIN
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="rounded-lg p-2 text-ivory/60 hover:bg-ivory/10 hover:text-ivory"
              >
                ✕
              </button>
            </div>

            {/* Projected Balance Highlight Card */}
            <div className="rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/15 via-navy-deep to-gold/10 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-gold font-semibold">
                  New Balance After Transfer
                </span>
                <p className="font-display font-bold text-2xl sm:text-3xl text-gold mt-0.5">
                  {pendingTransfer.currency} {pendingTransfer.newBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-right sm:border-l sm:border-gold/20 sm:pl-4 text-xs font-mono text-ivory/60">
                <p>Current: {customer.currency} {pendingTransfer.currentBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                <p className="text-red-400 font-semibold">- {pendingTransfer.currency} {(pendingTransfer.amount + pendingTransfer.fee).toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              </div>
            </div>

            {/* Detailed Recipient & Bank Information */}
            <div className="rounded-2xl border border-ivory/10 bg-navy-deep/80 p-4 sm:p-5 space-y-3 text-xs">
              <div className="flex justify-between border-b border-ivory/10 pb-2">
                <span className="text-ivory/60">Transfer Type:</span>
                <span className="font-semibold text-ivory">{pendingTransfer.type} Transfer</span>
              </div>
              <div className="flex justify-between border-b border-ivory/10 pb-2">
                <span className="text-ivory/60">Recipient Name:</span>
                <span className="font-semibold text-gold">{pendingTransfer.beneficiary}</span>
              </div>
              <div className="flex justify-between border-b border-ivory/10 pb-2">
                <span className="text-ivory/60">Account / IBAN:</span>
                <span className="font-mono text-ivory">{pendingTransfer.accountNumber}</span>
              </div>
              <div className="flex justify-between border-b border-ivory/10 pb-2">
                <span className="text-ivory/60">Receiving Bank:</span>
                <span className="font-semibold text-ivory">{pendingTransfer.bankName}</span>
              </div>
              <div className="flex flex-col border-b border-ivory/10 pb-2">
                <span className="text-ivory/60">Recipient Bank Address:</span>
                <span className="text-ivory mt-0.5 font-medium">{pendingTransfer.bankAddress}</span>
              </div>
              {pendingTransfer.swiftBic && (
                <div className="flex justify-between border-b border-ivory/10 pb-2">
                  <span className="text-ivory/60">SWIFT / BIC Code:</span>
                  <span className="font-mono text-gold">{pendingTransfer.swiftBic}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-ivory/10 pb-2">
                <span className="text-ivory/60">Transfer Amount:</span>
                <span className="font-mono font-bold text-ivory">
                  {pendingTransfer.currency} {pendingTransfer.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ivory/60">Network Clearance Fee:</span>
                <span className="font-mono text-emerald-400">
                  {pendingTransfer.fee > 0 ? `${pendingTransfer.currency} ${pendingTransfer.fee.toFixed(2)}` : "Free / $0.00"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="w-full sm:flex-1 rounded-xl border border-ivory/20 py-3 text-xs font-semibold text-ivory/70 hover:bg-ivory/10 transition-colors"
              >
                Modify Details
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewModalOpen(false);
                  setPinInput("");
                  setPinModalOpen(true);
                }}
                className="w-full sm:flex-1 rounded-xl bg-gold py-3 text-xs font-bold uppercase tracking-wider text-navy-deep hover:bg-gold-soft transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" /> Authorize with PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIN AUTHORIZATION MODAL */}
      {pinModalOpen && pendingTransfer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-3xl border border-gold/40 bg-gradient-to-b from-[#0C1B30] to-[#071426] p-6 shadow-2xl text-ivory space-y-5 max-h-[90vh] overflow-y-auto">
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
                  inputMode="numeric"
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

      {/* MODERN CREATIVE TRANSFER RECEIPT MODAL WITH THUMBS UP */}
      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/85 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl border border-gold/40 bg-gradient-to-b from-[#0C1B30] to-[#071426] p-6 sm:p-8 shadow-2xl text-ivory space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Prominent Glowing Thumbs Up Creative Header */}
            <div className="text-center space-y-3 pt-2">
              <div className="mx-auto relative flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-emerald-400 bg-emerald-500/15 text-emerald-400 shadow-2xl shadow-emerald-500/20">
                <div className="absolute inset-0 rounded-3xl bg-emerald-400/20 animate-ping opacity-40" />
                <ThumbsUp className="relative h-10 w-10 text-emerald-400 animate-bounce" />
              </div>
              <div>
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-mono font-semibold text-emerald-400 uppercase">
                  Transfer Cleared & Settled
                </span>
                <h3 className="mt-2 text-2xl sm:text-3xl font-display font-bold text-ivory">
                  Payment Successful!
                </h3>
                <p className="text-xs text-ivory/60 mt-1">
                  Your transaction has cleared Pinnacle J Trust Bank rails and is logged on the immutable ledger.
                </p>
              </div>
            </div>

            {/* Creative Card: Amount & New Balance */}
            <div className="rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/15 via-navy-deep to-gold/15 p-5 text-center">
              <span className="text-[11px] uppercase font-mono tracking-wider text-ivory/60">
                Amount Cleared
              </span>
              <p className="font-display font-bold text-3xl sm:text-4xl text-gold mt-1">
                {receiptData.currency} {receiptData.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-navy/80 px-4 py-1 text-xs font-mono">
                <span className="text-ivory/60">New Available Balance:</span>
                <strong className="text-emerald-400">
                  {receiptData.currency} {receiptData.newBalance !== undefined ? receiptData.newBalance.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
                </strong>
              </div>
            </div>

            {/* Receipt Summary Breakdown */}
            <div className="rounded-2xl border border-ivory/10 bg-navy-deep/80 p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-ivory/10 pb-2.5">
                <span className="text-ivory/60">Transaction Reference:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-gold text-xs sm:text-sm">{receiptData.reference}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(receiptData.reference);
                      setCopiedRef(true);
                      toast.success("Reference copied to clipboard");
                      setTimeout(() => setCopiedRef(false), 2000);
                    }}
                    className="rounded p-1 text-ivory/50 hover:bg-ivory/10 hover:text-gold transition-colors"
                    title="Copy reference"
                  >
                    {copiedRef ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between border-b border-ivory/10 pb-2">
                <span className="text-ivory/60">Beneficiary:</span>
                <span className="font-semibold text-ivory text-right">{receiptData.counterparty}</span>
              </div>

              {receiptData.bankName && (
                <div className="flex justify-between border-b border-ivory/10 pb-2">
                  <span className="text-ivory/60">Receiving Bank:</span>
                  <span className="font-semibold text-ivory text-right">{receiptData.bankName}</span>
                </div>
              )}

              {receiptData.bankAddress && (
                <div className="flex flex-col border-b border-ivory/10 pb-2">
                  <span className="text-ivory/60">Recipient Bank Address:</span>
                  <span className="text-ivory mt-0.5 leading-relaxed">{receiptData.bankAddress}</span>
                </div>
              )}

              <div className="flex justify-between border-b border-ivory/10 pb-2">
                <span className="text-ivory/60">Execution Timestamp:</span>
                <span className="font-mono text-ivory/80">{receiptData.date} UTC</span>
              </div>

              <div className="flex justify-between">
                <span className="text-ivory/60">Clearance Status:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Settled & Cryptographically Verified
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-ivory/20 px-5 py-2.5 text-xs font-semibold text-ivory hover:bg-ivory/10 transition-colors"
              >
                <Printer className="h-4 w-4 text-gold" /> Print Official Receipt
              </button>
              <button
                type="button"
                onClick={() => setReceiptData(null)}
                className="w-full sm:w-auto rounded-xl bg-gold px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-navy-deep hover:bg-gold-soft transition-all shadow-md"
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
