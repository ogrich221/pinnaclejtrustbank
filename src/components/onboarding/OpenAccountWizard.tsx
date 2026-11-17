import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  User,
  Building2,
  Lock,
  ShieldCheck,
  KeyRound,
  FileCheck2,
  CheckCircle2,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Globe,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { saveCustomerCredentials } from "@/lib/customer-access";

export interface OnboardingData {
  // Step 1: Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string;
  gender: string;
  nationality: string;
  countryOfResidence: string;
  residentialAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email: string;

  // Step 2: Banking Information
  accountType: "Personal Checking Account" | "Personal Savings Account" | "Premium Account" | "Business Account";
  currency: "USD" | "EUR" | "GBP" | "CHF" | "SGD";
  employmentStatus: string;
  occupation: string;
  sourceOfFunds: string;
  expectedActivity: string;
  intendedPurpose: string;

  // Step 3: Access Credentials
  username: string;
  password: string;
  confirmPassword: string;

  // Step 4: Two Security Questions
  securityQuestion1: string;
  securityAnswer1: string;
  securityQuestion2: string;
  securityAnswer2: string;

  // Step 5: Transfer Security PIN
  transferPin: string;
  confirmTransferPin: string;

  // Step 6: Consents
  consentTerms: boolean;
  consentPrivacy: boolean;
  consentDisclosures: boolean;
  consentCompliance: boolean;
}

const INITIAL_FORM: OnboardingData = {
  firstName: "",
  middleName: "",
  lastName: "",
  dob: "",
  gender: "Prefer not to say",
  nationality: "United States",
  countryOfResidence: "United States",
  residentialAddress: "",
  city: "",
  stateProvince: "",
  postalCode: "",
  phoneCountryCode: "+1",
  phoneNumber: "",
  email: "",

  accountType: "Personal Checking Account",
  currency: "USD",
  employmentStatus: "Employed",
  occupation: "",
  sourceOfFunds: "Employment Income / Salary",
  expectedActivity: "$25,000 – $100,000 monthly",
  intendedPurpose: "Personal Wealth Management & Everyday Banking",

  username: "",
  password: "",
  confirmPassword: "",

  securityQuestion1: "What was the name of your first school?",
  securityAnswer1: "",
  securityQuestion2: "What was the first street you lived on?",
  securityAnswer2: "",

  transferPin: "",
  confirmTransferPin: "",

  consentTerms: false,
  consentPrivacy: false,
  consentDisclosures: false,
  consentCompliance: false,
};

const QUESTION_1_OPTIONS = [
  "What was the name of your first school?",
  "What was the name of your childhood best friend?",
  "What city were you born in?",
  "What was the name of your first pet?",
  "What was your childhood nickname?",
];

const QUESTION_2_OPTIONS = [
  "What was the name of your favourite childhood teacher?",
  "What was the first street you lived on?",
  "What was the name of your first employer?",
  "What was your favourite childhood subject?",
  "What was the model of your first car?",
];

const ACCOUNT_TYPE_DETAILS = {
  "Personal Checking Account": {
    badge: "Everyday Liquidity",
    desc: "Seamless everyday transactions, multi-currency debit access, and zero domestic clearance fees.",
    minDeposit: "$1,000",
  },
  "Personal Savings Account": {
    badge: "Yield & Preservation",
    desc: "High-yield interest bearing treasury reserves, automated savings vaults, and capital protection.",
    minDeposit: "$5,000",
  },
  "Premium Account": {
    badge: "Private Wealth",
    desc: "Dedicated trust officer, priority international SWIFT clearing, and bespoke investment custody.",
    minDeposit: "$50,000",
  },
  "Business Account": {
    badge: "Corporate & Trade",
    desc: "Corporate treasury management, multi-signatory permissions, payroll, and merchant settlement.",
    minDeposit: "$25,000",
  },
};

export const OpenAccountWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [form, setForm] = useState<OnboardingData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingData, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAnswer1, setShowAnswer1] = useState(false);
  const [showAnswer2, setShowAnswer2] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [applicationRef, setApplicationRef] = useState<string | null>(null);
  const [submissionDate, setSubmissionDate] = useState<string>("");

  const updateField = (field: keyof OnboardingData, val: any) => {
    setForm((prev) => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const errs: Partial<Record<keyof OnboardingData, string>> = {};
    if (!form.firstName.trim()) errs.firstName = "First name is required";
    if (!form.lastName.trim()) errs.lastName = "Last name is required";
    if (!form.dob) errs.dob = "Date of birth is required";
    if (!form.residentialAddress.trim()) errs.residentialAddress = "Residential address is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.postalCode.trim()) errs.postalCode = "Postal code is required";
    if (!form.phoneNumber.trim()) errs.phoneNumber = "Phone number is required";
    if (!form.email.trim() || !form.email.includes("@")) errs.email = "Valid email address is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const errs: Partial<Record<keyof OnboardingData, string>> = {};
    if (!form.occupation.trim()) errs.occupation = "Occupation is required for KYC compliance";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 3 Validation (Login Credentials)
  const validateStep3 = (): boolean => {
    const errs: Partial<Record<keyof OnboardingData, string>> = {};
    if (!form.username.trim() || form.username.length < 5) {
      errs.username = "Username must be at least 5 alphanumeric characters";
    }
    if (!form.password || form.password.length < 8) {
      errs.password = "Password must be at least 8 characters with numbers and symbols";
    }
    if (form.password !== form.confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 4 Validation (Security Questions)
  const validateStep4 = (): boolean => {
    const errs: Partial<Record<keyof OnboardingData, string>> = {};
    if (form.securityQuestion1 === form.securityQuestion2) {
      errs.securityQuestion2 = "Question 2 must be different from Question 1";
    }
    if (!form.securityAnswer1.trim()) {
      errs.securityAnswer1 = "Answer to Question 1 is required";
    }
    if (!form.securityAnswer2.trim()) {
      errs.securityAnswer2 = "Answer to Question 2 is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 5 Validation (Transfer PIN)
  const validateStep5 = (): boolean => {
    const errs: Partial<Record<keyof OnboardingData, string>> = {};
    const pinRegex = /^\d{6}$/;
    if (!pinRegex.test(form.transferPin)) {
      errs.transferPin = "PIN must be exactly 6 digits";
    } else if (
      form.transferPin === "123456" ||
      form.transferPin === "654321" ||
      /^(\d)\1{5}$/.test(form.transferPin)
    ) {
      errs.transferPin = "Sequential or repetitive PINs (e.g. 123456, 111111) are not permitted";
    }
    if (form.transferPin !== form.confirmTransferPin) {
      errs.confirmTransferPin = "PIN entries do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Step 6 Validation (Review & Consents)
  const validateStep6 = (): boolean => {
    const errs: Partial<Record<keyof OnboardingData, string>> = {};
    if (!form.consentTerms) errs.consentTerms = "You must agree to the Terms and Conditions";
    if (!form.consentPrivacy) errs.consentPrivacy = "You must agree to the Privacy Policy";
    if (!form.consentDisclosures) errs.consentDisclosures = "You must accept the banking disclosures";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    if (currentStep === 1) isValid = validateStep1();
    if (currentStep === 2) isValid = validateStep2();
    if (currentStep === 3) isValid = validateStep3();
    if (currentStep === 4) isValid = validateStep4();
    if (currentStep === 5) isValid = validateStep5();
    if (currentStep === 6) isValid = validateStep6();

    if (isValid) {
      if (currentStep < 6) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        void submitApplication();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const submitApplication = async () => {
    const ref = "PJ-APP-" + Math.floor(100000 + Math.random() * 900000);
    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    setApplicationRef(ref);
    setSubmissionDate(dateStr);

    // Save into Admin Customers Registry as "Pending Review" so the single Administrator can inspect & approve!
    try {
      const cleanFirst = (form.firstName || "").trim();
      const cleanLast = (form.lastName || "").trim();
      const init1 = (cleanFirst[0] || "U").toUpperCase();
      const init2 = (cleanLast[0] || "C").toUpperCase();
      const initials = `${init1}${init2}`;

      const existing = localStorage.getItem("pjtb_admin_customers_v3") || localStorage.getItem("pjtb_admin_customers_v2");
      let list = existing ? JSON.parse(existing) : [];
      if (!Array.isArray(list)) list = [];

      const newCustomer = {
        id: `cust-${Date.now()}`,
        customerId: `PJ-${Math.floor(89200 + Math.random() * 800)}`,
        fullName: `${cleanFirst} ${cleanLast}`,
        initials,
        email: form.email.trim(),
        username: form.username.trim(),
        phone: `${form.phoneCountryCode} ${form.phoneNumber}`.trim(),
        accountNumber: `PJTB-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(10 + Math.random() * 90)}`,
        maskedAccountNumber: `PJTB-••••-${Math.floor(1000 + Math.random() * 9000)}`,
        accountType: form.accountType,
        jurisdiction: form.countryOfResidence,
        currency: form.currency,
        balance: 0.0,
        availableBalance: 0.0,
        dailyTransferLimit: form.accountType === "Premium Account" ? 2500000.0 : 50000.0,
        registrationDate: new Date().toISOString().split("T")[0],
        verificationStatus: "Pending",
        accountStatus: "Pending",
        lastLogin: "Pending first session",
        address: {
          street: form.residentialAddress.trim(),
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          country: form.countryOfResidence.trim(),
        },
        notes: [
          {
            id: `note-${Date.now()}`,
            authorName: "Onboarding Gateway",
            authorRole: "System",
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
            content: `Online application submitted via Portal. Ref: ${ref}. Expected activity: ${form.expectedActivity}. Intended purpose: ${form.intendedPurpose}. Awaiting Administrator approval.`,
            category: "Compliance",
          },
        ],
        documents: [
          {
            id: `doc-${Date.now()}`,
            documentType: "National ID",
            documentNumber: `APP-DOC-${Math.floor(10000 + Math.random() * 90000)}`,
            issueDate: "2024-01-01",
            expiryDate: "2034-01-01",
            status: "Pending Review",
            submittedAt: new Date().toISOString().split("T")[0],
          },
        ],
        securityHistory: [
          {
            id: `sec-${Date.now()}`,
            type: "Registration",
            ipAddress: "User Client IP",
            location: form.countryOfResidence,
            device: "Web Browser",
            timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
            status: "Success",
          },
        ],
      };

      list = [newCustomer, ...list.filter((c: any) => c.id !== newCustomer.id && c.customerId !== newCustomer.customerId && (!c.email || c.email.toLowerCase() !== newCustomer.email.toLowerCase()))];
      localStorage.setItem("pjtb_admin_customers_v3", JSON.stringify(list));
      await saveCustomerCredentials(newCustomer, form.username, form.password);

      // Also persist the customer for the online banking portal session and pending registration backup
      localStorage.setItem("pjtb_current_portal_customer", JSON.stringify(newCustomer));
      localStorage.setItem("pjtb_pending_registration", JSON.stringify(newCustomer));
      
      // Initialize zero transaction history for the new user profile
      localStorage.setItem(`pjtb_portal_tx_${newCustomer.customerId}`, JSON.stringify([]));
      localStorage.setItem(`pjtb_portal_tx_${newCustomer.id}`, JSON.stringify([]));

      // Add notification to admin queue
      try {
        const notifKey = "pjtb_admin_notifications_v3";
        const storedNotifs = localStorage.getItem(notifKey);
        const notifs = storedNotifs ? JSON.parse(storedNotifs) : [];
        notifs.unshift({
          id: `notif-${Date.now()}`,
          title: `New Application: ${newCustomer.fullName}`,
          message: `${newCustomer.fullName} registered for ${newCustomer.accountType} (${newCustomer.currency}). Opening balance: $0.00. Awaiting administrator approval.`,
          timestamp: "Just now",
          isRead: false,
          severity: "Info",
          category: "Verification",
          actionUrl: "customers",
        });
        localStorage.setItem(notifKey, JSON.stringify(notifs));
      } catch {}

      // Add audit log entry
      try {
        const auditKey = "pjtb_admin_audit_logs_v3";
        const storedLogs = localStorage.getItem(auditKey);
        const logs = storedLogs ? JSON.parse(storedLogs) : [];
        logs.unshift({
          id: `audit-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          adminName: "Registration Gateway",
          adminRole: "Administrator",
          action: "NEW_ACCOUNT_APPLICATION",
          targetDescription: `Customer: ${newCustomer.fullName} (${newCustomer.customerId})`,
          targetId: newCustomer.customerId,
          reason: "Online account registration completed by customer",
          note: `Application submitted for ${newCustomer.fullName}. Opening balance: 0.00.`,
          ipAddress: "Customer Remote IP",
          severity: "Info",
        });
        localStorage.setItem(auditKey, JSON.stringify(logs));
      } catch {}

      // Modern BroadcastChannel for instant cross-tab notification to Admin dashboard
      try {
        if (typeof BroadcastChannel !== "undefined") {
          const bc = new BroadcastChannel("pjtb_sync_channel");
          bc.postMessage({ type: "NEW_CUSTOMER", customer: newCustomer });
          bc.close();
        }
      } catch {}

      try {
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("pjtb_sync"));
      } catch {}
    } catch (err) {
      console.error("Account registration error:", err);
      toast.error("We couldn't save your application and login credentials", {
        description: "Please check your browser storage settings and submit again.",
      });
      return;
    }

    setCurrentStep(7);
    toast.success("Application successfully submitted", {
      description: `Application Reference: ${ref}. Awaiting Administrator review.`,
    });
  };

  const stepsList = [
    { num: 1, title: "Personal Details" },
    { num: 2, title: "Banking Profile" },
    { num: 3, title: "Online Access" },
    { num: 4, title: "Security Questions" },
    { num: 5, title: "Transfer PIN" },
    { num: 6, title: "Review & Terms" },
  ];

  return (
    <div className="min-h-screen bg-[#071426] text-[#F5F7FA] font-sans antialiased selection:bg-gold/30 selection:text-gold pb-24">
      {/* Hero Header Strip */}
      <section className="relative overflow-hidden border-b border-ivory/10 bg-gradient-to-b from-[#0C1B30] to-[#071426] px-6 pb-16 pt-16 text-center text-ivory">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gold/15 blur-3xl animate-drift" />
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-blue-600/15 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">
            <ShieldCheck className="h-3.5 w-3.5" /> Institutional Security & KYC Compliance
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight text-ivory">
            Begin Your Financial Journey.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-ivory/70 max-w-2xl mx-auto leading-relaxed">
            Open your Pinnacle J Trust Bank account and experience a smarter, more secure approach to modern banking.
          </p>
        </div>
      </section>

      {/* Main Form Body Container */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 -mt-8">
        {/* Step Progress Indicator (when not on Step 7 - Success) */}
        {currentStep <= 6 && (
          <div className="mb-8 rounded-2xl border border-ivory/10 bg-[#0C1B30]/80 p-5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between text-xs text-ivory/60 mb-3">
              <span className="font-mono uppercase tracking-wider text-gold font-semibold">
                Step {currentStep} of 6: {stepsList[currentStep - 1]?.title ?? "Application"}
              </span>
              <span className="font-mono">
                {Math.round(((currentStep - 1) / 5) * 100)}% Complete
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-ivory/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold/60 to-gold transition-all duration-300 rounded-full"
                style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
              />
            </div>

            {/* Steps Circle Row */}
            <div className="mt-4 hidden sm:grid grid-cols-6 gap-2 text-center text-[11px]">
              {stepsList.map((s) => {
                const isPassed = s.num < currentStep;
                const isCurrent = s.num === currentStep;
                return (
                  <div key={s.num} className="flex flex-col items-center">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                        isPassed
                          ? "border-gold bg-gold text-navy-deep"
                          : isCurrent
                          ? "border-gold bg-gold/20 text-gold shadow-md shadow-gold/20"
                          : "border-ivory/20 bg-navy/60 text-ivory/40"
                      }`}
                    >
                      {isPassed ? <Check className="h-3.5 w-3.5" /> : s.num}
                    </div>
                    <span
                      className={`mt-1.5 truncate max-w-[80px] font-medium ${
                        isCurrent ? "text-gold font-semibold" : "text-ivory/50"
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 1: PERSONAL INFORMATION */}
        {currentStep === 1 && (
          <div className="rounded-3xl border border-ivory/15 bg-gradient-to-b from-[#0C1B30]/90 to-[#071426]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
            <div className="border-b border-ivory/10 pb-5 mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold font-mono">Stage 1 · Identity</p>
              <h2 className="text-3xl font-display font-bold text-ivory mt-1">Let&apos;s Get to Know You.</h2>
              <p className="text-xs text-ivory/60 mt-1">
                All legal name and residential information will be validated against official civil registries.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  First Name *
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="e.g. Charles"
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                />
                {errors.firstName && <p className="mt-1 text-[11px] text-red-400">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Middle Name <span className="text-ivory/40 lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.middleName}
                  onChange={(e) => updateField("middleName", e.target.value)}
                  placeholder="e.g. Henry"
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="e.g. Kensington"
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                />
                {errors.lastName && <p className="mt-1 text-[11px] text-red-400">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => updateField("dob", e.target.value)}
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2 text-xs text-ivory focus:border-gold focus:outline-none"
                />
                {errors.dob && <p className="mt-1 text-[11px] text-red-400">{errors.dob}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Gender <span className="text-ivory/40 lowercase">(optional)</span>
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Nationality *
                </label>
                <select
                  value={form.nationality}
                  onChange={(e) => updateField("nationality", e.target.value)}
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Japan">Japan</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other Sovereign Jurisdiction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Country of Residence *
                </label>
                <select
                  value={form.countryOfResidence}
                  onChange={(e) => updateField("countryOfResidence", e.target.value)}
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                >
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Japan">Japan</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                  <option value="Other">Other Sovereign Jurisdiction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Residential Street Address *
                </label>
                <input
                  type="text"
                  value={form.residentialAddress}
                  onChange={(e) => updateField("residentialAddress", e.target.value)}
                  placeholder="Street and building number"
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                />
                {errors.residentialAddress && <p className="mt-1 text-[11px] text-red-400">{errors.residentialAddress}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="e.g. New York"
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                />
                {errors.city && <p className="mt-1 text-[11px] text-red-400">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  State / Province
                </label>
                <input
                  type="text"
                  value={form.stateProvince}
                  onChange={(e) => updateField("stateProvince", e.target.value)}
                  placeholder="e.g. NY"
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Postal / ZIP Code *
                </label>
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => updateField("postalCode", e.target.value)}
                  placeholder="e.g. 10005"
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                />
                {errors.postalCode && <p className="mt-1 text-[11px] text-red-400">{errors.postalCode}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Mobile Phone Number *
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.phoneCountryCode}
                    onChange={(e) => updateField("phoneCountryCode", e.target.value)}
                    className="w-24 rounded-xl border border-ivory/20 bg-navy-deep/80 px-2 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none font-mono"
                  >
                    <option value="+1">+1 (US/CA)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+41">+41 (CH)</option>
                    <option value="+49">+49 (DE)</option>
                    <option value="+33">+33 (FR)</option>
                    <option value="+65">+65 (SG)</option>
                    <option value="+81">+81 (JP)</option>
                    <option value="+971">+971 (AE)</option>
                  </select>
                  <input
                    type="tel"
                    value={form.phoneNumber}
                    onChange={(e) => updateField("phoneNumber", e.target.value)}
                    placeholder="212 555 0199"
                    className="flex-1 rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none font-mono"
                  />
                </div>
                {errors.phoneNumber && <p className="mt-1 text-[11px] text-red-400">{errors.phoneNumber}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                />
                {errors.email && <p className="mt-1 text-[11px] text-red-400">{errors.email}</p>}
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-ivory/10 pt-6">
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-xs font-bold uppercase tracking-wider text-navy-deep hover:bg-gold-soft transition-all shadow-lg"
              >
                Proceed to Banking Profile <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BANKING INFORMATION */}
        {currentStep === 2 && (
          <div className="rounded-3xl border border-ivory/15 bg-gradient-to-b from-[#0C1B30]/90 to-[#071426]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
            <div className="border-b border-ivory/10 pb-5 mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold font-mono">Stage 2 · Banking</p>
              <h2 className="text-3xl font-display font-bold text-ivory mt-1">Set Up Your Banking Profile.</h2>
              <p className="text-xs text-ivory/60 mt-1">
                Select your account type and currency preferences. All accounts are backed by 24/7 global clearing.
              </p>
            </div>

            {/* Account Type Grid Selector */}
            <div className="space-y-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gold">
                Select Preferred Account Type *
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                {(Object.keys(ACCOUNT_TYPE_DETAILS) as (keyof typeof ACCOUNT_TYPE_DETAILS)[]).map((typeKey) => {
                  const details = ACCOUNT_TYPE_DETAILS[typeKey];
                  const isSelected = form.accountType === typeKey;
                  return (
                    <div
                      key={typeKey}
                      onClick={() => updateField("accountType", typeKey)}
                      className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 ${
                        isSelected
                          ? "border-gold bg-gold/15 shadow-xl shadow-gold/10 -translate-y-0.5"
                          : "border-ivory/10 bg-navy-deep/60 hover:border-gold/40 hover:bg-navy-deep"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-gold border border-gold/30">
                          {details.badge}
                        </span>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            isSelected ? "border-gold bg-gold text-navy-deep" : "border-ivory/20"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                      <h3 className="mt-3 text-base font-display font-bold text-ivory">{typeKey}</h3>
                      <p className="mt-1 text-xs text-ivory/65 leading-relaxed">{details.desc}</p>
                      <p className="mt-3 text-[11px] font-mono text-gold font-medium">
                        Target Initial Reserve: {details.minDeposit}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Currency & Financial Details */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 border-t border-ivory/10 pt-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Preferred Base Currency *
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => updateField("currency", e.target.value)}
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none font-mono"
                >
                  <option value="USD">USD — United States Dollar ($)</option>
                  <option value="EUR">EUR — European Euro (€)</option>
                  <option value="GBP">GBP — British Pound Sterling (£)</option>
                  <option value="CHF">CHF — Swiss Franc (Fr.)</option>
                  <option value="SGD">SGD — Singapore Dollar (S$)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Employment Status *
                </label>
                <select
                  value={form.employmentStatus}
                  onChange={(e) => updateField("employmentStatus", e.target.value)}
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                >
                  <option value="Employed">Employed (Corporate / Professional)</option>
                  <option value="Self-Employed">Self-Employed / Business Owner</option>
                  <option value="Executive / Officer">Executive / Corporate Officer</option>
                  <option value="Private Investor">Private Investor / Family Office</option>
                  <option value="Retired">Retired</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Occupation / Industry Title *
                </label>
                <input
                  type="text"
                  value={form.occupation}
                  onChange={(e) => updateField("occupation", e.target.value)}
                  placeholder="e.g. Managing Director / Partner"
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                />
                {errors.occupation && <p className="mt-1 text-[11px] text-red-400">{errors.occupation}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Primary Source of Funds *
                </label>
                <select
                  value={form.sourceOfFunds}
                  onChange={(e) => updateField("sourceOfFunds", e.target.value)}
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                >
                  <option value="Employment Income / Salary">Employment Income / Salary</option>
                  <option value="Business Profits & Dividends">Business Profits & Dividends</option>
                  <option value="Inheritance & Trust Assets">Inheritance & Trust Assets</option>
                  <option value="Sale of Property / Real Estate">Sale of Property / Real Estate</option>
                  <option value="Investment Liquidation">Investment Liquidation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Expected Monthly Transaction Volume
                </label>
                <select
                  value={form.expectedActivity}
                  onChange={(e) => updateField("expectedActivity", e.target.value)}
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                >
                  <option value="Under $25,000 monthly">Under $25,000 monthly</option>
                  <option value="$25,000 – $100,000 monthly">$25,000 – $100,000 monthly</option>
                  <option value="$100,000 – $500,000 monthly">$100,000 – $500,000 monthly</option>
                  <option value="Over $500,000 monthly">Over $500,000 monthly (Tier-1 Volume)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Intended Banking Purpose
                </label>
                <input
                  type="text"
                  value={form.intendedPurpose}
                  onChange={(e) => updateField("intendedPurpose", e.target.value)}
                  placeholder="e.g. Wealth custody, international payments"
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-between border-t border-ivory/10 pt-6">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-xl border border-ivory/20 px-5 py-3 text-xs font-medium text-ivory/70 hover:bg-ivory/10 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-xs font-bold uppercase tracking-wider text-navy-deep hover:bg-gold-soft transition-all shadow-lg"
              >
                Proceed to Online Access <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ACCESS CREDENTIALS */}
        {currentStep === 3 && (
          <div className="rounded-3xl border border-ivory/15 bg-gradient-to-b from-[#0C1B30]/90 to-[#071426]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
            <div className="border-b border-ivory/10 pb-5 mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold font-mono">Stage 3 · Credentials</p>
              <h2 className="text-3xl font-display font-bold text-ivory mt-1">Create Your Secure Login.</h2>
              <p className="text-xs text-ivory/60 mt-1">
                Your online banking credentials are protected with salted PBKDF2 cryptography and are never visible to administrators.
              </p>
            </div>

            <div className="space-y-5 max-w-lg">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Online Banking Username *
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => updateField("username", e.target.value)}
                  placeholder="Choose unique username (min 5 chars)"
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                />
                {errors.username && <p className="mt-1 text-[11px] text-red-400">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Master Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 pr-10 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/50 hover:text-gold"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-[11px] text-red-400">{errors.password}</p>}

                {/* Password Strength Meter */}
                {form.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[10px] text-ivory/50">
                      <span>Password Security Strength</span>
                      <span className="text-gold font-mono">
                        {form.password.length >= 10 ? "Strong (High Entropy)" : "Standard"}
                      </span>
                    </div>
                    <div className="h-1 w-full rounded-full bg-ivory/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          form.password.length >= 10 ? "w-full bg-emerald-400" : "w-1/2 bg-amber-400"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Confirm Master Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-2.5 pr-10 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/50 hover:text-gold"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-[11px] text-red-400">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="mt-8 flex justify-between border-t border-ivory/10 pt-6">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-xl border border-ivory/20 px-5 py-3 text-xs font-medium text-ivory/70 hover:bg-ivory/10 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-xs font-bold uppercase tracking-wider text-navy-deep hover:bg-gold-soft transition-all shadow-lg"
              >
                Proceed to Security Questions <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: TWO SECURITY QUESTIONS */}
        {currentStep === 4 && (
          <div className="rounded-3xl border border-ivory/15 bg-gradient-to-b from-[#0C1B30]/90 to-[#071426]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
            <div className="border-b border-ivory/10 pb-5 mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold font-mono">Stage 4 · Recovery</p>
              <h2 className="text-3xl font-display font-bold text-ivory mt-1">
                Add an Extra Layer of Account Protection.
              </h2>
              <p className="text-xs text-ivory/60 mt-1">
                Select TWO distinct security recovery questions. Answers are masked by default and protected using secure salted hashing.
              </p>
            </div>

            <div className="space-y-6 max-w-xl">
              {/* Question 1 */}
              <div className="rounded-2xl border border-ivory/10 bg-navy-deep/60 p-5 space-y-3">
                <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-gold">
                  Recovery Question 1
                </span>
                <select
                  value={form.securityQuestion1}
                  onChange={(e) => updateField("securityQuestion1", e.target.value)}
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                >
                  {QUESTION_1_OPTIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>

                <div>
                  <label className="block text-xs font-semibold text-ivory/70 mb-1">Your Answer *</label>
                  <div className="relative">
                    <input
                      type={showAnswer1 ? "text" : "password"}
                      value={form.securityAnswer1}
                      onChange={(e) => updateField("securityAnswer1", e.target.value)}
                      placeholder="Enter private answer"
                      className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 pr-10 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAnswer1(!showAnswer1)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/50 hover:text-gold"
                    >
                      {showAnswer1 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.securityAnswer1 && <p className="mt-1 text-[11px] text-red-400">{errors.securityAnswer1}</p>}
                </div>
              </div>

              {/* Question 2 */}
              <div className="rounded-2xl border border-ivory/10 bg-navy-deep/60 p-5 space-y-3">
                <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-gold">
                  Recovery Question 2
                </span>
                <select
                  value={form.securityQuestion2}
                  onChange={(e) => updateField("securityQuestion2", e.target.value)}
                  className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 text-xs text-ivory focus:border-gold focus:outline-none"
                >
                  {QUESTION_2_OPTIONS.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </select>
                {errors.securityQuestion2 && <p className="mt-1 text-[11px] text-red-400">{errors.securityQuestion2}</p>}

                <div>
                  <label className="block text-xs font-semibold text-ivory/70 mb-1">Your Answer *</label>
                  <div className="relative">
                    <input
                      type={showAnswer2 ? "text" : "password"}
                      value={form.securityAnswer2}
                      onChange={(e) => updateField("securityAnswer2", e.target.value)}
                      placeholder="Enter private answer"
                      className="w-full rounded-xl border border-ivory/20 bg-navy-deep px-4 py-2.5 pr-10 text-xs text-ivory placeholder:text-ivory/30 focus:border-gold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAnswer2(!showAnswer2)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/50 hover:text-gold"
                    >
                      {showAnswer2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.securityAnswer2 && <p className="mt-1 text-[11px] text-red-400">{errors.securityAnswer2}</p>}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-between border-t border-ivory/10 pt-6">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-xl border border-ivory/20 px-5 py-3 text-xs font-medium text-ivory/70 hover:bg-ivory/10 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-xs font-bold uppercase tracking-wider text-navy-deep hover:bg-gold-soft transition-all shadow-lg"
              >
                Proceed to Transfer PIN Setup <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: TRANSFER SECURITY PIN */}
        {currentStep === 5 && (
          <div className="rounded-3xl border border-ivory/15 bg-gradient-to-b from-[#0C1B30]/90 to-[#071426]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
            <div className="border-b border-ivory/10 pb-5 mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold font-mono">Stage 5 · Authorization</p>
              <h2 className="text-3xl font-display font-bold text-ivory mt-1">Create Your Transfer Security PIN.</h2>
              <p className="text-xs text-ivory/60 mt-1">
                Your private six-digit PIN authorizes domestic wires and international cross-border transfers. It is never displayed to bank staff.
              </p>
            </div>

            <div className="space-y-6 max-w-md">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Create Six-Digit Transfer PIN *
                </label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    maxLength={6}
                    value={form.transferPin}
                    onChange={(e) => updateField("transferPin", e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-3 text-center text-xl font-mono tracking-[0.5em] text-gold focus:border-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/50 hover:text-gold"
                  >
                    {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.transferPin && <p className="mt-1 text-[11px] text-red-400">{errors.transferPin}</p>}
                <p className="mt-1 text-[10px] text-ivory/50">
                  Sequential patterns (e.g. 123456) or repetitive digits are automatically rejected.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ivory/80 mb-1.5">
                  Confirm Six-Digit Transfer PIN *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPin ? "text" : "password"}
                    maxLength={6}
                    value={form.confirmTransferPin}
                    onChange={(e) => updateField("confirmTransferPin", e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    className="w-full rounded-xl border border-ivory/20 bg-navy-deep/80 px-4 py-3 text-center text-xl font-mono tracking-[0.5em] text-gold focus:border-gold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory/50 hover:text-gold"
                  >
                    {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmTransferPin && <p className="mt-1 text-[11px] text-red-400">{errors.confirmTransferPin}</p>}
              </div>
            </div>

            <div className="mt-8 flex justify-between border-t border-ivory/10 pt-6">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-xl border border-ivory/20 px-5 py-3 text-xs font-medium text-ivory/70 hover:bg-ivory/10 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-6 py-3 text-xs font-bold uppercase tracking-wider text-navy-deep hover:bg-gold-soft transition-all shadow-lg"
              >
                Proceed to Review & Verification <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: TERMS & FINAL REVIEW */}
        {currentStep === 6 && (
          <div className="rounded-3xl border border-ivory/15 bg-gradient-to-b from-[#0C1B30]/90 to-[#071426]/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
            <div className="border-b border-ivory/10 pb-5 mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-gold font-mono">Stage 6 · Final Review</p>
              <h2 className="text-3xl font-display font-bold text-ivory mt-1">Review Your Application.</h2>
              <p className="text-xs text-ivory/60 mt-1">
                Please verify all entered details. Upon submission, your file will be encrypted and placed in the compliance approval queue.
              </p>
            </div>

            {/* Application Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl border border-ivory/10 bg-navy-deep/60 p-5 space-y-2">
                <span className="font-semibold text-gold uppercase tracking-wider text-[10px]">Personal Information</span>
                <p className="font-semibold text-ivory text-sm">{form.firstName} {form.middleName} {form.lastName}</p>
                <p className="text-ivory/60">DOB: {form.dob} · Nationality: {form.nationality}</p>
                <p className="text-ivory/60">{form.residentialAddress}, {form.city}, {form.countryOfResidence}</p>
                <p className="text-ivory/60">{form.phoneCountryCode} {form.phoneNumber} · {form.email}</p>
              </div>

              <div className="rounded-2xl border border-ivory/10 bg-navy-deep/60 p-5 space-y-2">
                <span className="font-semibold text-gold uppercase tracking-wider text-[10px]">Banking Preferences</span>
                <p className="font-semibold text-ivory text-sm">{form.accountType}</p>
                <p className="text-ivory/60">Base Currency: <strong className="text-gold font-mono">{form.currency}</strong></p>
                <p className="text-ivory/60">Source of Funds: {form.sourceOfFunds}</p>
                <p className="text-ivory/60">Expected Activity: {form.expectedActivity}</p>
              </div>

              <div className="rounded-2xl border border-ivory/10 bg-navy-deep/60 p-5 space-y-2 sm:col-span-2">
                <span className="font-semibold text-gold uppercase tracking-wider text-[10px]">Security Credentials</span>
                <div className="grid gap-2 sm:grid-cols-3">
                  <div>
                    <span className="text-ivory/50">Online Username:</span>
                    <p className="font-mono font-semibold text-ivory">{form.username}</p>
                  </div>
                  <div>
                    <span className="text-ivory/50">Security Questions:</span>
                    <p className="text-emerald-400 font-semibold">2 Questions Configured</p>
                  </div>
                  <div>
                    <span className="text-ivory/50">Transfer Security PIN:</span>
                    <p className="font-mono text-gold font-bold">•••••• (6-Digit Salted PIN)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Administrator Approval Notice */}
            <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/10 p-4 text-xs text-ivory/80 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gold">Regulatory Compliance & Administrator Sign-off Notice</p>
                <p className="mt-1 leading-relaxed text-ivory/70">
                  In compliance with international banking regulations, all accounts are held in pending status until
                  identity and AML verifications are formally reviewed and approved by the Bank Administrator. No account is fully operational until administrative clearance is granted.
                </p>
              </div>
            </div>

            {/* Consent Checkboxes */}
            <div className="mt-6 space-y-3 border-t border-ivory/10 pt-6 text-xs">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.consentTerms}
                  onChange={(e) => updateField("consentTerms", e.target.checked)}
                  className="mt-0.5 rounded border-ivory/30 bg-navy-deep text-gold focus:ring-gold"
                />
                <span className="text-ivory/80 leading-relaxed">
                  I have read and agree to the{" "}
                  <Link to="/terms" className="text-gold underline hover:text-gold-soft">
                    Terms and Conditions
                  </Link>{" "}
                  governing Pinnacle J Trust Bank accounts.
                </span>
              </label>
              {errors.consentTerms && <p className="text-[11px] text-red-400 ml-6">{errors.consentTerms}</p>}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.consentPrivacy}
                  onChange={(e) => updateField("consentPrivacy", e.target.checked)}
                  className="mt-0.5 rounded border-ivory/30 bg-navy-deep text-gold focus:ring-gold"
                />
                <span className="text-ivory/80 leading-relaxed">
                  I consent to the processing of my personal and financial data in accordance with the{" "}
                  <Link to="/privacy" className="text-gold underline hover:text-gold-soft">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {errors.consentPrivacy && <p className="text-[11px] text-red-400 ml-6">{errors.consentPrivacy}</p>}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.consentDisclosures}
                  onChange={(e) => updateField("consentDisclosures", e.target.checked)}
                  className="mt-0.5 rounded border-ivory/30 bg-navy-deep text-gold focus:ring-gold"
                />
                <span className="text-ivory/80 leading-relaxed">
                  I understand that this application is subject to final review and approved sign-off by the Bank Administrator before account activation.
                </span>
              </label>
              {errors.consentDisclosures && <p className="text-[11px] text-red-400 ml-6">{errors.consentDisclosures}</p>}
            </div>

            <div className="mt-8 flex justify-between border-t border-ivory/10 pt-6">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 rounded-xl border border-ivory/20 px-5 py-3 text-xs font-medium text-ivory/70 hover:bg-ivory/10 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-navy-deep hover:bg-gold-soft transition-all shadow-xl font-display text-sm"
              >
                SUBMIT APPLICATION <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: SUCCESSFUL APPLICATION */}
        {currentStep === 7 && (
          <div className="rounded-3xl border border-gold/40 bg-gradient-to-b from-[#0C1B30] to-[#071426] p-8 sm:p-14 text-center shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-gold bg-gradient-to-br from-gold/20 to-navy-deep text-gold shadow-2xl">
              <CheckCircle2 strokeWidth={1.4} className="h-10 w-10 text-gold" />
            </div>

            <h2 className="mt-6 text-3xl sm:text-4xl font-display font-bold text-ivory">
              Welcome to Pinnacle J Trust Bank.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-ivory/75 max-w-xl mx-auto leading-relaxed">
              Your application has been received successfully. Our team will review your information and notify you of the next steps.
            </p>

            {/* Application Receipt Details */}
            <div className="mt-8 mx-auto max-w-lg rounded-2xl border border-ivory/10 bg-navy-deep/80 p-6 text-xs text-left space-y-3">
              <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
                <span className="text-ivory/60">Application Reference:</span>
                <span className="font-mono text-base font-bold text-gold">{applicationRef}</span>
              </div>
              <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
                <span className="text-ivory/60">Submission Timestamp:</span>
                <span className="font-mono text-ivory font-medium">{submissionDate}</span>
              </div>
              <div className="flex items-center justify-between border-b border-ivory/10 pb-3">
                <span className="text-ivory/60">Application Status:</span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
                  Under Administrator Review
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ivory/60">Selected Account:</span>
                <span className="text-ivory font-medium">{form.accountType} ({form.currency})</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/portal"
                className="rounded-xl bg-gold px-6 py-3 text-xs font-bold uppercase tracking-wider text-navy-deep hover:bg-gold-soft transition-all shadow-lg flex items-center gap-2"
              >
                Access Customer Online Banking <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/"
                className="rounded-xl border border-ivory/20 px-6 py-3 text-xs font-semibold text-ivory/80 hover:bg-ivory/10 transition-colors"
              >
                Return to Homepage
              </Link>
            </div>

            <p className="mt-8 text-xs text-ivory/50">
              Need assistance? Contact our private client desk at{" "}
              <a href="mailto:contactsupport@pinnaclejtrustbank.online" className="text-gold underline hover:text-gold-soft font-medium">
                contactsupport@pinnaclejtrustbank.online
              </a>
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
