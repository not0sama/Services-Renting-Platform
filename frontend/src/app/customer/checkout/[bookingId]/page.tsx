"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditCard, Lock, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import api from "@/lib/api";

interface Booking {
  id: number;
  title: string;
  price: number;
  provider_name?: string;
  status: string;
}

export default function CheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const router = useRouter();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardNum, setCardNum] = useState("4111 1111 1111 1111");
  const [expiry, setExpiry] = useState("12/27");
  const [cvv, setCvv] = useState("123");
  const [name, setName] = useState("");

  useEffect(() => {
    api.get<Booking>(`/bookings/${bookingId}`)
      .then(r => setBooking(r.data))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaying(true);
    setError(null);
    try {
      await api.post("/payments/checkout", { booking_id: parseInt(bookingId) });
      setDone(true);
      setTimeout(() => router.push(`/customer/bookings/${bookingId}`), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-9 h-9 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
        <p className="text-gray-500 mt-2">Funds are held in escrow and will be released once you accept the completed work.</p>
      </div>
    );
  }

  if (loading) return <div className="max-w-md mx-auto px-4 py-8"><div className="h-80 bg-gray-100 rounded-2xl animate-pulse" /></div>;
  if (!booking) return <div className="p-8 text-center text-gray-400">Booking not found.</div>;

  const commission = booking.price * 0.15;
  const total = booking.price;

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-5 border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-3 text-sm">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-700">
            <span className="truncate pr-2">{booking.title}</span>
            <span className="font-medium">SAR {booking.price.toFixed(2)}</span>
          </div>
          {booking.provider_name && (
            <p className="text-xs text-gray-400">by {booking.provider_name}</p>
          )}
          <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
            <span>Total (held in escrow)</span>
            <span>SAR {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Simulated Card Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-violet-600" />
          <h2 className="font-semibold text-gray-900">Payment Details</h2>
          <span className="ml-auto text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">Simulated</span>
        </div>

        <form onSubmit={pay} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Cardholder Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Card Number</label>
            <input type="text" value={cardNum} onChange={e => setCardNum(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expiry</label>
              <input type="text" value={expiry} onChange={e => setExpiry(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm font-mono" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">CVV</label>
              <input type="text" value={cvv} onChange={e => setCvv(e.target.value)} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm font-mono" />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
          )}

          <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl p-3">
            <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>Funds are held in secure escrow and released to the provider only after you confirm the work is complete.</span>
          </div>

          <button type="submit" disabled={paying} className="w-full btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-base">
            {paying ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : <>Pay SAR {total.toFixed(2)}</>}
          </button>
        </form>
      </div>
    </div>
  );
}
