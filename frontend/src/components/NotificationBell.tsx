"use client";

import { useState } from "react";
import { Bell, Check, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read_at?: string | null;
  created_at: string;
}

interface NotificationBellProps {
  notifications: Notification[];
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
}

export function NotificationBell({ notifications, onMarkRead, onMarkAllRead }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  function getLink(n: Notification): string | null {
    const d = n.data;
    if (!d) return null;
    if (d.booking_id) return `/customer/bookings/${d.booking_id}`;
    if (d.job_id) return `/customer/jobs`;
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  No notifications yet
                </div>
              ) : (
                notifications.slice(0, 15).map((n) => {
                  const link = getLink(n);
                  const content = (
                    <div
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                        !n.read_at ? "bg-violet-50/40" : ""
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.read_at ? "bg-violet-500" : "bg-transparent"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{n.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(n.created_at).toLocaleString()}
                          </p>
                        </div>
                        {!n.read_at && (
                          <button
                            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onMarkRead(n.id); }}
                            className="ml-1 text-gray-400 hover:text-violet-600"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );

                  return link ? (
                    <Link key={n.id} href={link} onClick={() => { onMarkRead(n.id); setOpen(false); }}>
                      {content}
                    </Link>
                  ) : (
                    <div key={n.id}>{content}</div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
