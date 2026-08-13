"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Briefcase, Clock, DollarSign, MapPin, CheckCircle, X } from "lucide-react";
import api from "@/lib/api";
import { BookingStatusTimeline, type BookingStatusType } from "@/components/BookingStatusTimeline";

interface Booking {
  id: number;
  title: string;
  status: BookingStatusType;
  booking_type: string;
  scheduled_datetime?: string;
  price: number;
  customer_name?: string;
  duration_minutes: number;
  created_at: string;
}

const ACTIVE_STATUSES = ["confirmed", "en_route", "in_progress"] as const;
const PROVIDER_ACTIONS: Record<string, { label: string; next: string; color: string }> = {
  confirmed: { label: "I'm On My Way", next: "en_route", color: "bg-blue-600 text-white hover:bg-blue-700" },
  en_route: { label: "Start Work", next: "in_progress", color: "bg-violet-600 text-white hover:bg-violet-700" },
  in_progress: { label: "Mark Complete", next: "completed", color: "bg-emerald-600 text-white hover:bg-emerald-700" },
};

function ActiveBookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.get<Booking[]>("/bookings").then(r => {
      const active = r.data.filter(b => ACTIVE_STATUSES.includes(b.status as any) || b.status === "pending");
      setBookings(active);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (bookingId: number, newStatus: string) => {
    setUpdatingId(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      load();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Active Jobs</h1>
        <p className="text-gray-500 text-sm mt-0.5">Jobs currently assigned to you</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No active jobs right now</p>
          <p className="text-sm mt-1">Browse the job feed to find new work</p>
          <Link href="/provider/jobs" className="mt-4 inline-flex btn-primary px-4 py-2 rounded-xl text-sm">Browse Jobs</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => {
            const action = PROVIDER_ACTIONS[b.status];
            const scheduledDate = b.scheduled_datetime ? new Date(b.scheduled_datetime).toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : null;
            return (
              <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{b.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{b.customer_name ?? "Customer"}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                    b.status === "pending" ? "bg-amber-50 text-amber-700" :
                    b.status === "confirmed" ? "bg-blue-50 text-blue-700" :
                    b.status === "en_route" ? "bg-cyan-50 text-cyan-700" :
                    "bg-violet-50 text-violet-700"
                  }`}>
                    {b.status.replace("_", " ")}
                  </span>
                </div>

                <BookingStatusTimeline status={b.status} className="mb-3" />

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  {scheduledDate && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{scheduledDate}</span>}
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{b.duration_minutes} min</span>
                  <span className="font-semibold text-gray-900 ml-auto">LYD {b.price.toFixed(0)}</span>
                </div>

                {action && (
                  <button
                    onClick={() => updateStatus(b.id, action.next)}
                    disabled={updatingId === b.id}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${action.color}`}
                  >
                    {updatingId === b.id ? "Updating..." : action.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ActiveBookingsPage() {
  return <Suspense><ActiveBookingsContent /></Suspense>;
}
