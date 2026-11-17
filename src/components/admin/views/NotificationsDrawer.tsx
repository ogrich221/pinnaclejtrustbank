import React from "react";
import {
  Bell,
  X,
  CheckCheck,
  ShieldAlert,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  Info,
} from "lucide-react";
import { useAdminData, AdminViewId } from "../AdminDataContext";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setCurrentView } = useAdminData();

  if (!isOpen) return null;

  const safeNotifs = Array.isArray(notifications) ? notifications.filter(Boolean) : [];
  const unreadCount = safeNotifs.filter((n) => !n.isRead).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Security":
        return <ShieldAlert className="h-4 w-4 text-red-400" />;
      case "Verification":
        return <FileCheck2 className="h-4 w-4 text-emerald-400" />;
      case "Compliance":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  const handleNotificationClick = (id: string, actionUrl?: string) => {
    markNotificationRead(id);
    if (actionUrl) {
      const validViews: AdminViewId[] = ["customers", "transactions", "pending-verification", "security", "notifications"];
      const destination = validViews.includes(actionUrl as AdminViewId) ? actionUrl as AdminViewId : "customers";
      setCurrentView(destination);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy-deep/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative flex h-full w-full max-w-md flex-col border-l border-gold/30 bg-gradient-to-b from-[#0C1B30] to-[#071426] p-6 shadow-2xl text-ivory">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-ivory/10 pb-4">
          <div className="flex items-center gap-2.5">
            <Bell className="h-5 w-5 text-gold" />
            <h3 className="text-lg font-display font-semibold text-ivory">Operational Alerts</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-navy-deep">
                {unreadCount} New
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-xs text-gold hover:underline flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-ivory/60 hover:bg-ivory/10 hover:text-ivory"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin">
          {safeNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n.id, n.actionUrl)}
              className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                !n.isRead
                  ? "border-gold/30 bg-gold/10 hover:border-gold hover:bg-gold/15"
                  : "border-ivory/10 bg-navy/40 hover:border-ivory/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">{getCategoryIcon(n.category)}</div>
                <div className="flex-1 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ivory">{n.title}</span>
                    <span className="font-mono text-[10px] text-ivory/40">{n.timestamp}</span>
                  </div>
                  <p className="text-ivory/70 leading-relaxed text-[11px]">{n.message}</p>
                  {n.actionUrl && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gold mt-1">
                      Inspect Record <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-ivory/10 pt-4 text-center text-xs text-ivory/50">
          Real-time notification engine active · 24/7 AML monitoring
        </div>
      </div>
    </div>
  );
};
