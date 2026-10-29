import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, XCircle, EyeOff, Store, ShoppingBag, X } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const typeIcon = (type: string) => {
  if (type === "product_approved") return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
  if (type === "product_rejected") return <XCircle className="h-4 w-4 text-red-500 shrink-0" />;
  if (type === "product_hidden")   return <EyeOff className="h-4 w-4 text-amber-500 shrink-0" />;
  if (type === "seller_approved")  return <Store className="h-4 w-4 text-emerald-500 shrink-0" />;
  if (type === "seller_rejected")  return <Store className="h-4 w-4 text-red-500 shrink-0" />;
  return <ShoppingBag className="h-4 w-4 text-blue-500 shrink-0" />;
};

export default function NotificationBell() {
  const { isLoggedIn } = useAuth();
  const [open, setOpen]           = useState(false);
  const [notifications, setNots]  = useState<any[]>([]);
  const [unread, setUnread]       = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const d: any = await api.getNotifications();
      setNots(d.notifications);
      setUnread(d.unreadCount);
    } catch {}
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = async () => {
    setOpen(v => !v);
    if (!open && unread > 0) {
      try {
        await api.markAllRead();
        setUnread(0);
        setNots(prev => prev.map(n => ({ ...n, read: true })));
      } catch {}
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-stone-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-stone-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-stone-50">
            <h3 className="font-semibold text-stone-900 text-sm">Notifications</h3>
            <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-stone-400">
                <Bell className="h-8 w-8 opacity-20 mb-2" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n._id} className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors ${n.read ? "bg-white" : "bg-emerald-50/50"}`}>
                  <div className="mt-0.5">{typeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight ${n.read ? "text-stone-700" : "text-stone-900"}`}>{n.title}</p>
                    <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-stone-400 mt-1">{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  {!n.read && <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
