import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  ShieldAlert,
  FileCheck2,
  AlertTriangle,
  Info,
  ExternalLink,
  Filter,
} from "lucide-react";
import { useAdminData, AdminViewId } from "../AdminDataContext";

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setCurrentView } = useAdminData();
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const safeNotifs = Array.isArray(notifications) ? notifications.filter(Boolean) : [];
  const unreadCount = safeNotifs.filter((n) => !n.isRead).length;

  const filteredNotifications = safeNotifs.filter((n) => {
    if (filterCategory === "Unread") return !n.isRead;
    if (filterCategory === "Security") return n.category === "Security";
    if (filterCategory === "Verification") return n.category === "Verification";
    if (filterCategory === "Compliance") return n.category === "Compliance";
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Security":
        return <ShieldAlert className="h-5 w-5 text-red-400" />;
      case "Verification":
        return <FileCheck2 className="h-5 w-5 text-emerald-400" />;
      case "Compliance":
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
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
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold mb-2">
            <Bell className="h-3.5 w-3.5" /> Administrative Feed
          </div>
          <h2 className="text-2xl font-display font-bold text-ivory">Operational Notifications & Alerts</h2>
          <p className="text-xs text-ivory/60">
            Real-time critical events, compliance escalations, and KYC queue submissions
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/15 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/25 transition-all shadow-md"
          >
            <CheckCheck className="h-4 w-4" /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-ivory/10 pb-4 text-xs">
        {[
          { id: "All", label: "All Alerts", count: notifications.length },
          { id: "Unread", label: "Unread", count: unreadCount },
          { id: "Verification", label: "Verification", count: notifications.filter((n) => n.category === "Verification").length },
          { id: "Security", label: "Security", count: notifications.filter((n) => n.category === "Security").length },
          { id: "Compliance", label: "Compliance", count: notifications.filter((n) => n.category === "Compliance").length },
        ].map((tab) => {
          const isActive = filterCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterCategory(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 transition-all font-medium flex items-center gap-1.5 ${
                isActive
                  ? "border border-gold/40 bg-gold/15 text-gold font-semibold shadow-sm"
                  : "border border-transparent text-ivory/70 hover:bg-ivory/5 hover:text-ivory"
              }`}
            >
              <span>{tab.label}</span>
              <span className="rounded-full bg-ivory/10 px-1.5 py-0.2 text-[10px] text-ivory/60 font-mono">
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-2xl border border-ivory/10 bg-white/[0.04] p-12 text-center text-xs text-ivory/50">
            No notifications matching the selected filter. All alert channels clear.
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`rounded-2xl border p-5 transition-all backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !n.isRead
                  ? "border-gold/40 bg-gold/10 hover:border-gold hover:bg-gold/15 shadow-lg shadow-gold/5"
                  : "border-ivory/10 bg-white/[0.04] hover:bg-white/[0.07]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-ivory/10 bg-navy-deep/80">
                  {getCategoryIcon(n.category)}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-sm text-ivory">{n.title}</h3>
                    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${getSeverityBadge(n.severity)}`}>
                      {n.severity}
                    </span>
                    {!n.isRead && (
                      <span className="rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold text-navy-deep">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ivory/80 leading-relaxed max-w-2xl">{n.message}</p>
                  <p className="text-[10px] text-ivory/40 font-mono pt-1">
                    Logged: {n.timestamp} · Category: {n.category}
                  </p>
                </div>
              </div>

              {n.actionUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    markNotificationRead(n.id);
                    setCurrentView(n.actionUrl as AdminViewId);
                  }}
                  className="inline-flex items-center gap-1.5 self-start sm:self-center shrink-0 rounded-xl border border-gold/40 bg-gold/15 px-3.5 py-1.5 text-xs font-semibold text-gold hover:bg-gold/25 transition-all shadow-sm"
                >
                  View Details <ExternalLink className="h-3 w-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
