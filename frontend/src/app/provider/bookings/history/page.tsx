"use client";

import { useEffect, useState } from "react";
import { History, Star, DollarSign, Clock } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Booking {
  id: number;
  title: string;
  status: string;
  price: number;
  customer_name?: string;
  scheduled_datetime?: string;
  created_at: string;
}

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Booking[]>("/bookings?booking_status=completed")
      .then(r => setBookings(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <History className="w-6 h-6 text-violet-600" /> Job History
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">{bookings.length} completed jobs</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No completed jobs yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Star className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">{b.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <span>{b.customer_name ?? "Customer"}</span>
                  {b.scheduled_datetime && (
                    <><span>·</span><span>{new Date(b.scheduled_datetime).toLocaleDateString()}</span></>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-gray-900 text-sm">SAR {b.price.toFixed(0)}</p>
                <span className="text-xs text-emerald-600 font-medium">Completed</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
