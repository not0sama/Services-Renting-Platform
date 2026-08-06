"use client";

import { useEffect, useState } from "react";
import { Package, X, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { BookingStatusTimeline, type BookingStatusType } from "@/components/BookingStatusTimeline";

interface Booking {
  id: number;
  title: string;
  status: BookingStatusType;
  booking_type: string;
  price: number;
  customer_name?: string;
  provider_name?: string;
  scheduled_datetime?: string;
  created_at: string;
}

const STATUS_TABS = [
  { label: "All", value: null },
  { label: "Pending", value: "pending" },
  { label: "Active", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [cancelling, setCancelling] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (activeTab) params.set("booking_status", activeTab);
    api.get<Booking[]>(`/admin/bookings?${params}`)
      .then(r => setBookings(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, activeTab]);

  const adminCancel = async (id: number) => {
    if (!confirm("Force-cancel this booking?")) return;
    setCancelling(id);
    try {
      await api.post(`/admin/bookings/${id}/cancel`);
      load();
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bookings</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto">
        {STATUS_TABS.map(tab => (
          <button key={tab.label} onClick={() => { setActiveTab(tab.value); setPage(1); }}
            className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.value ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Booking</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Customer</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Provider</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Amount</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="h-5 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : bookings.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No bookings found</td></tr>
            ) : (
              bookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-900 max-w-40 truncate">{b.title}</p>
                    <p className="text-xs text-gray-400 capitalize">{b.booking_type} · {new Date(b.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{b.customer_name ?? "—"}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{b.provider_name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
                      b.status === "completed" ? "bg-emerald-50 text-emerald-700" :
                      b.status === "cancelled" ? "bg-red-50 text-red-600" :
                      b.status === "confirmed" ? "bg-blue-50 text-blue-700" :
                      "bg-amber-50 text-amber-700"
                    }`}>{b.status.replace("_", " ")}</span>
                  </td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">SAR {b.price.toFixed(0)}</td>
                  <td className="px-5 py-3">
                    {!["completed", "cancelled"].includes(b.status) && (
                      <button
                        onClick={() => adminCancel(b.id)}
                        disabled={cancelling === b.id}
                        className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 border border-red-100 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
          <span className="text-xs text-gray-400">Page {page}</span>
          <div className="flex gap-1">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
            <button disabled={bookings.length < 20} onClick={() => setPage(p => p + 1)} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
