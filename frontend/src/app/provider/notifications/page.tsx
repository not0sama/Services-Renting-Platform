"use client";

import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck } from "lucide-react";
import api from "@/lib/api";

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at: string;
}

const TYPE_ICONS: Record<string, string> = {
  booking_confirmed: "📅",
  offer_received: "💼",
  offer_accepted: "✅",
  offer_declined: "❌",
  payment_received: "💰",
  review_received: "⭐",
  system: "🔔",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api.get<Notification[]>("/notifications?limit=50").then(r => setNotifications(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(p => p.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
  };

  const markAllRead = async () => {
    await api.patch("/notifications/read-all");
    setNotifications(p => p.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-violet-600" /> Notifications
          </h1>
          {unreadCount > 0 && <p className="text-sm text-violet-600 mt-0.5 font-medium">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${!n.read_at ? "bg-violet-50 border-violet-100" : "bg-white border-gray-100"}`}>
              <div className="text-2xl flex-shrink-0">{TYPE_ICONS[n.type] ?? "🔔"}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{n.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.read_at && (
                <button onClick={() => markRead(n.id)} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-violet-100 text-violet-600 transition-colors">
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
