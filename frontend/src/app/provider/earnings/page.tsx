"use client";

import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, ChevronDown, ChevronUp, ArrowUpRight } from "lucide-react";
import api from "@/lib/api";

interface Earning {
  invoice_number: string;
  booking_id: number;
  customer_name: string;
  service_title: string;
  gross_amount: number;
  commission_amount: number;
  net_amount: number;
  status: string;
  released_at?: string;
  created_at: string;
}

const STATUS_STYLES: Record<string, string> = {
  held: "bg-amber-50 text-amber-700",
  released: "bg-emerald-50 text-emerald-700",
  auto_released: "bg-emerald-50 text-emerald-700",
  refunded: "bg-red-50 text-red-600",
};

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Earning[]>("/payments/me/earnings").then(r => setEarnings(r.data)).finally(() => setLoading(false));
  }, []);

  const totalReleased = earnings.filter(e => e.status === "released" || e.status === "auto_released").reduce((s, e) => s + e.net_amount, 0);
  const totalPending = earnings.filter(e => e.status === "held").reduce((s, e) => s + e.net_amount, 0);
  const totalGross = earnings.reduce((s, e) => s + e.gross_amount, 0);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-violet-600" /> Earnings
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Your payment history and balance</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-emerald-700 mb-1">Released</p>
          <p className="text-xl font-bold text-emerald-800">SAR {totalReleased.toFixed(0)}</p>
        </div>
        <div className="bg-amber-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-amber-700 mb-1">Pending</p>
          <p className="text-xl font-bold text-amber-800">SAR {totalPending.toFixed(0)}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Gross Total</p>
          <p className="text-xl font-bold text-gray-800">SAR {totalGross.toFixed(0)}</p>
        </div>
      </div>

      {/* Transactions */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : earnings.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No earnings yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {earnings.map((e, idx) => (
            <div key={e.invoice_number} className={`flex items-center gap-3 px-5 py-3 ${idx !== earnings.length - 1 ? "border-b border-gray-50" : ""}`}>
              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                <ArrowUpRight className="w-4 h-4 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{e.service_title}</p>
                <p className="text-xs text-gray-400">{e.customer_name} · {new Date(e.created_at).toLocaleDateString()}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-900">SAR {e.net_amount.toFixed(0)}</p>
                <p className="text-xs text-gray-400 line-through">SAR {e.gross_amount.toFixed(0)}</p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${STATUS_STYLES[e.status] ?? "bg-gray-50 text-gray-500"}`}>
                  {e.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {earnings.length > 0 && (
        <p className="text-xs text-gray-400 text-center mt-3">
          Commission is deducted from gross. Net = what you receive.
        </p>
      )}
    </div>
  );
}
