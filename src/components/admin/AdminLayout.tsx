import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  UserCheck,
  FileCheck2,
  Lock,
  UserX,
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  History,
  ShieldCheck,
  FileText,
  ShieldAlert,
  Bell,
  Settings,
  HelpCircle,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  RotateCcw,
  Clock,
  User,
} from "lucide-react";
import { LogoMark } from "@/components/site/Logo";
import { BankLoadingScreen } from "@/components/site/BankLoadingScreen";
import { useAdminData, AdminViewId } from "./AdminDataContext";
import { DashboardOverview } from "./views/DashboardOverview";
import { CustomerManagement } from "./views/CustomerManagement";
import { TransactionMonitoring } from "./views/TransactionMonitoring";
import { AnalyticsView } from "./views/AnalyticsView";
import { SecurityAuditView } from "./views/SecurityAuditView";
import { AdministratorProfileView } from "./views/AdministratorProfileView";
import { NotificationsDrawer } from "./views/NotificationsDrawer";

export const AdminLayout: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    canGoBack,
    canGoForward,
    navigateBack,
    navigateForward,
    isLoadingView,
    globalSearch,
    setGlobalSearch,
    notifications,
    activeAdmin,
    resetToDefaults,
  } = useAdminData();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [currentTimeStr, setCurrentTimeStr] = useState("");

  const unreadNotifsCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        new Intl.DateTimeFormat("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }).format(now)
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navSections: {
    section: string;
    items: { id: AdminViewId; label: string; icon: React.ElementType }[];
  }[] = [
    {
      section: "OVERVIEW",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "analytics", label: "Analytics", icon: BarChart3 },
      ],
    },
    {
      section: "CUSTOMER MANAGEMENT",
      items: [
        { id: "customers", label: "All Customers", icon: Users },
        { id: "active-accounts", label: "Active Accounts", icon: UserCheck },
        { id: "pending-verification", label: "Pending Verification", icon: FileCheck2 },
        { id: "restricted-accounts", label: "Restricted Accounts", icon: Lock },
        { id: "suspended-accounts", label: "Suspended Accounts", icon: UserX },
      ],
    },
    {
      section: "FINANCIAL OPERATIONS",
      items: [
        { id: "transactions", label: "Transactions", icon: CreditCard },
        { id: "deposits", label: "Deposits", icon: ArrowDownLeft },
        { id: "withdrawals", label: "Withdrawals", icon: ArrowUpRight },
        { id: "transfers", label: "Transfers", icon: ArrowLeftRight },
        { id: "payment-history", label: "Payment History", icon: History },
      ],
    },
    {
      section: "ADMINISTRATION",
      items: [
        { id: "admin-profile", label: "Administrator Profile", icon: ShieldCheck },
        { id: "activity-logs", label: "Activity Logs", icon: FileText },
        { id: "security", label: "Security Center", icon: ShieldAlert },
      ],
    },
    {
      section: "SYSTEM",
      items: [
        { id: "notifications", label: "Notifications", icon: Bell },
        { id: "settings", label: "Settings", icon: Settings },
        { id: "support", label: "Support Center", icon: HelpCircle },
      ],
    },
  ];

  const getViewTitle = (id: AdminViewId) => {
    for (const sec of navSections) {
      const found = sec.items.find((item) => item.id === id);
      if (found) return { title: found.label, section: sec.section };
    }
    return { title: "Dashboard", section: "OVERVIEW" };
  };

  const { title: currentTitle, section: currentSection } = getViewTitle(currentView);

  return (
    <div className="min-h-screen bg-[#071426] text-[#F5F7FA] font-sans flex antialiased overflow-x-hidden selection:bg-gold/30 selection:text-gold">
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-ivory/10 bg-gradient-to-b from-[#0C1B30]/95 via-[#071426]/95 to-[#0C1B30]/95 backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between border-b border-ivory/10 px-6 py-5">
            <Link to="/" className="flex items-center gap-3 group">
              <span className="text-gold transition-transform group-hover:scale-105">
                <LogoMark className="h-9 w-9" />
              </span>
              <div className="leading-none">
                <span className="block font-display text-base font-bold tracking-[0.18em] text-ivory">
                  PINNACLE J
                </span>
                <span className="block text-[0.6rem] tracking-[0.45em] text-gold font-medium">
                  TRUST BANK
                </span>
                <span className="block text-[8px] font-mono tracking-widest text-ivory/40 uppercase mt-0.5">
                  Single Admin Mode
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden rounded-lg p-1 text-ivory/60 hover:bg-ivory/10 hover:text-ivory"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-thin text-xs" aria-label="Admin Navigation">
            {navSections.map((sec) => (
              <div key={sec.section}>
                <p className="px-3 text-[10px] font-semibold uppercase tracking-widest text-gold/70 font-mono mb-2">
                  {sec.section}
                </p>
                <div className="space-y-1">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (item.id === "notifications") {
                            setNotifDrawerOpen(true);
                          } else {
                            setCurrentView(item.id);
                          }
                          setSidebarOpen(false);
                        }}
                        className={`group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-gold/20 to-gold/5 text-gold font-semibold border-l-2 border-gold shadow-sm"
                            : "text-ivory/70 hover:bg-white/[0.05] hover:text-ivory"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                            isActive ? "text-gold" : "text-ivory/50 group-hover:text-gold"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>

                        {item.id === "notifications" && unreadNotifsCount > 0 && (
                          <span className="ml-auto rounded-full bg-gold px-1.5 py-0.2 text-[9px] font-bold text-navy-deep">
                            {unreadNotifsCount}
                          </span>
                        )}

                        {item.id === "restricted-accounts" && (
                          <span className="ml-auto rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold text-amber-400">
                            Hold
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer Link */}
          <div className="border-t border-ivory/10 p-4 bg-navy-deep/60">
            <Link
              to="/"
              className="flex items-center justify-between rounded-xl border border-ivory/10 bg-white/[0.03] p-3 text-xs text-ivory/70 hover:border-gold/40 hover:text-gold transition-colors"
            >
              <span>Back to Client Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Backdrop overlay for mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* TOP TRANSPARENT GLASS NAVIGATION BAR */}
        <header className="sticky top-0 z-20 border-b border-ivory/10 bg-[#071426]/85 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between gap-4">
          {/* Left: Simple Back & Front Navigation Arrows + Title & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-xl border border-ivory/15 p-2 text-ivory hover:bg-ivory/10"
              aria-label="Toggle navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Simple Back & Front Navigation Arrows */}
            <div className="flex items-center gap-1 rounded-xl border border-ivory/15 bg-white/[0.04] p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={navigateBack}
                disabled={!canGoBack}
                title="Go Back"
                aria-label="Go Back"
                className="rounded-lg p-1.5 text-ivory/70 hover:bg-ivory/10 hover:text-gold transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-ivory/70 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="h-3 w-px bg-ivory/15" />
              <button
                type="button"
                onClick={navigateForward}
                disabled={!canGoForward}
                title="Go Front / Forward"
                aria-label="Go Front"
                className="rounded-lg p-1.5 text-ivory/70 hover:bg-ivory/10 hover:text-gold transition-colors disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-ivory/70 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 text-[11px] text-ivory/50 font-mono">
                <span>PJTB ADMIN</span>
                <span>/</span>
                <span className="text-gold uppercase">{currentSection}</span>
              </div>
              <h1 className="text-lg font-display font-bold text-ivory leading-tight">
                {currentTitle}
              </h1>
            </div>
          </div>

          {/* Right: Clock, Search, Notification, Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-2 text-xs font-mono text-ivory/60 bg-white/[0.03] border border-ivory/10 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5 text-gold" />
              <span>{currentTimeStr || "Syncing clearing time..."}</span>
            </div>

            <div className="hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ivory/40" />
              <input
                type="text"
                placeholder="Global admin lookup..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="rounded-full border border-ivory/15 bg-white/[0.04] pl-9 pr-4 py-1.5 text-xs text-ivory placeholder:text-ivory/40 focus:border-gold focus:outline-none w-44 md:w-60 backdrop-blur-md"
              />
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setNotifDrawerOpen(true)}
              className="relative rounded-full border border-ivory/15 bg-white/[0.04] p-2 text-ivory/80 hover:border-gold hover:text-gold transition-colors"
              aria-label="Open notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-navy-deep">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Reload System Records */}
            <button
              type="button"
              onClick={resetToDefaults}
              title="Reload system records"
              className="hidden md:flex rounded-full border border-ivory/15 bg-white/[0.04] p-2 text-ivory/60 hover:border-gold hover:text-gold transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Sole Administrator Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 rounded-full border border-gold/30 bg-white/[0.04] pl-2 pr-3 py-1 text-xs hover:border-gold transition-colors backdrop-blur-md"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-navy-deep font-display">
                  AD
                </div>
                <div className="hidden sm:block text-left leading-tight">
                  <p className="font-semibold text-ivory text-xs">{activeAdmin.name}</p>
                  <p className="text-[10px] text-gold">{activeAdmin.role}</p>
                </div>
                <ChevronDown className="h-3 w-3 text-ivory/60" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-gold/30 bg-[#0C1B30]/95 p-1.5 text-ivory shadow-2xl backdrop-blur-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="border-b border-ivory/10 px-3 py-2 text-xs">
                    <p className="font-semibold text-ivory">{activeAdmin.name}</p>
                    <p className="text-[10px] text-gold font-mono">{activeAdmin.email}</p>
                    <p className="text-[10px] text-emerald-400 mt-1">● Hardware YubiKey Active</p>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView("admin-profile");
                        setProfileDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-ivory/80 hover:bg-ivory/10"
                    >
                      <User className="h-3.5 w-3.5 text-gold" /> Administrator Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView("security");
                        setProfileDropdownOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-ivory/80 hover:bg-ivory/10"
                    >
                      <ShieldAlert className="h-3.5 w-3.5 text-gold" /> Security Center
                    </button>
                  </div>
                  <div className="border-t border-ivory/10 pt-1">
                    <Link
                      to="/login"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/15"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign Out Session
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN BODY CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {isLoadingView ? (
            <div className="py-16">
              <BankLoadingScreen
                fullScreen={false}
                message="PINNACLE J TRUST BANK"
                subtext="Loading administrative registry..."
              />
            </div>
          ) : (
            <>
              {currentView === "dashboard" && <DashboardOverview />}

              {(currentView === "customers" ||
                currentView === "active-accounts" ||
                currentView === "pending-verification" ||
                currentView === "restricted-accounts" ||
                currentView === "suspended-accounts") && (
                <CustomerManagement
                  initialFilter={
                    currentView === "active-accounts"
                      ? "Active"
                      : currentView === "pending-verification"
                      ? "Pending"
                      : currentView === "restricted-accounts"
                      ? "Restricted"
                      : currentView === "suspended-accounts"
                      ? "Suspended"
                      : "All"
                  }
                />
              )}

              {(currentView === "transactions" ||
                currentView === "deposits" ||
                currentView === "withdrawals" ||
                currentView === "transfers" ||
                currentView === "payment-history") && (
                <TransactionMonitoring
                  initialFilter={
                    currentView === "deposits"
                      ? "Deposits"
                      : currentView === "withdrawals" || currentView === "transfers"
                      ? "Withdrawals"
                      : currentView === "payment-history"
                      ? "Settled"
                      : "All"
                  }
                />
              )}

              {currentView === "analytics" && <AnalyticsView />}

              {(currentView === "security" || currentView === "activity-logs") && <SecurityAuditView />}

              {currentView === "admin-profile" && <AdministratorProfileView />}

              {currentView === "settings" && (
                <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-8 shadow-xl backdrop-blur-md space-y-6">
                  <h2 className="text-2xl font-display font-bold text-ivory">System Parameters & Clearing Rules</h2>
                  <p className="text-xs text-ivory/60">Configure global transaction limits, velocity rules, and KYC thresholds</p>
                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                      <p className="font-semibold text-gold">OFAC Automated Screening</p>
                      <p className="text-ivory/70 mt-1">Continuous synchronization enabled with SDN Delta feeds</p>
                    </div>
                    <div className="rounded-xl border border-ivory/10 bg-navy/40 p-4">
                      <p className="font-semibold text-gold">Administrator Authority</p>
                      <p className="text-ivory/70 mt-1">Single Administrator holds universal signoff authority</p>
                    </div>
                  </div>
                </div>
              )}

              {currentView === "support" && (
                <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-8 shadow-xl backdrop-blur-md space-y-6">
                  <h2 className="text-2xl font-display font-bold text-ivory">Administrative Support & Technical Escalation</h2>
                  <p className="text-xs text-ivory/60">Direct secure channel to engineering and risk governance desk</p>
                  <div className="rounded-xl border border-gold/30 bg-navy/60 p-5 text-xs text-ivory/80 space-y-2">
                    <p><strong className="text-gold">Internal Hotline:</strong> +44 (0)20 7946 0999 (Secure Desk Ext 402)</p>
                    <p><strong className="text-gold">Encrypted Comms:</strong> support-internal@pinnaclejtrust.com</p>
                    <p><strong className="text-gold">Operations Center:</strong> 24/7 Global Clearing & Compliance Monitoring</p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer isOpen={notifDrawerOpen} onClose={() => setNotifDrawerOpen(false)} />
    </div>
  );
};
