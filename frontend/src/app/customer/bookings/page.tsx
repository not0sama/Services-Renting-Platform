"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Package, Clock, CheckCircle, AlertTriangle, ChevronRight, Plus,
} from "lucide-react";
import api from "@/lib/api";
import { BookingStatusTimeline, type BookingStatusType } from "@/components/BookingStatusTimeline";

interface Booking {
  id: number;
  title: string;
  status: BookingStatusType;
  booking_type: "instant" | "quote";
  scheduled_datetime?: string;
  price: number;
  provider_name?: string;
  category_name?: string;
  payment_status?: string;
  created_at: string;
}

const STATUS_TABS = [
  { label: "All", value: null },
  { label: "Active", value: "confirmed" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function statusColor(s: BookingStatusType) {
  const map: Record<string, string> = {
    pending: "text-amber-600 bg-amber-50",
    confirmed: "text-blue-600 bg-blue-50",
    en_route: "text-cyan-600 bg-cyan-50",
    in_progress: "text-violet-600 bg-violet-50",
    completed: "text-emerald-600 bg-emerald-50",
    cancelled: "text-red-500 bg-red-50",
    revision_requested: "text-orange-600 bg-orange-50",
  };
  return map[s] ?? "text-gray-500 bg-gray-50";
}

function BookingCard({ booking }: { booking: Booking }) {
  const formattedDate = booking.scheduled_datetime
    ? new Date(booking.scheduled_datetime).toLocaleString("en-US", {
        weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      })
    : null;

  return (
    <Link
      href={`/customer/bookings/${booking.id}`}
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{booking.title}</h3>
          <p className="text-sm text-gray-500">{booking.provider_name ?? "Awaiting provider"}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColor(booking.status)}`}>
          {booking.status.replace("_", " ")}
        </span>
      </div>

      <BookingStatusTimeline status={booking.status} className="mb-3" />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3 text-gray-500">
          {formattedDate && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          )}
          <span className="capitalize text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
            {booking.booking_type}
          </span>
        </div>
        <span className="font-semibold text-gray-900">LYD {booking.price.toFixed(0)}</span>
      </div>
    </Link>
  );
}

function BookingsContent() {
  const searchParams = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = activeTab ? `?booking_status=${activeTab}` : "";
    api.get<Booking[]>(`/bookings${params}`)
      .then((r) => setBookings(r.data))
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        <div className="flex gap-2">
          <Link
            href="/customer/jobs/new"
            className="flex items-center gap-1.5 text-sm btn-primary px-3 py-2 rounded-xl"
          >
            <Plus className="w-4 h-4" /> Post Job
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.value)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.value
                ? "bg-violet-600 text-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No bookings yet</p>
          <p className="text-sm mt-1">Browse services or post a job to get started</p>
          <Link href="/customer/categories" className="mt-4 inline-flex btn-primary px-4 py-2 rounded-xl text-sm">
            Browse Services
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense>
      <BookingsContent />
    </Suspense>
  );
}
