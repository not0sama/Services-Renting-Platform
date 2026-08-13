"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, DollarSign, FileText, Star, X,
  MessageCircle, MapPin, AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";
import { BookingStatusTimeline, type BookingStatusType } from "@/components/BookingStatusTimeline";
import EscrowPanel from "@/components/EscrowPanel";

interface BookingDetail {
  id: number;
  title: string;
  description?: string;
  status: BookingStatusType;
  booking_type: "instant" | "quote";
  scheduled_datetime?: string;
  duration_minutes: number;
  price: number;
  provider_name?: string;
  customer_name?: string;
  category_name?: string;
  payment_status?: string;
  auto_release_at?: string | null;
  invoice_number?: string;
  revision_notes?: string;
  revision_count: number;
  cancellation_reason?: string;
  created_at: string;
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get<BookingDetail>(`/bookings/${id}`)
      .then((r) => setBooking(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const doAction = async (endpoint: string, body?: object) => {
    setActionLoading(true);
    setError(null);
    try {
      await api.post(`/bookings/${id}/${endpoint}`, body ?? {});
      load();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message ?? err?.response?.data?.detail ?? "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!booking) return <div className="p-8 text-center text-gray-400">Booking not found.</div>;

  const canCancel = ["pending", "confirmed", "en_route", "in_progress"].includes(booking.status);
  const canReview = booking.status === "completed";
  const showEscrowPanel =
    (booking.status === "completed" || booking.status === "revision_requested") &&
    booking.payment_status === "held";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{booking.title}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {booking.provider_name ? `With ${booking.provider_name}` : "Awaiting assignment"}
            </p>
          </div>
          <span className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-full ${
            booking.status === "completed" ? "bg-emerald-50 text-emerald-700" :
            booking.status === "revision_requested" ? "bg-amber-50 text-amber-700" :
            booking.status === "cancelled" ? "bg-red-50 text-red-600" :
            "bg-violet-50 text-violet-700"
          }`}>
            {booking.status.replace(/_/g, " ")}
          </span>
        </div>

        <BookingStatusTimeline status={booking.status} className="mb-4" />

        <div className="grid grid-cols-2 gap-3 text-sm">
          {booking.scheduled_datetime && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-violet-400" />
              {new Date(booking.scheduled_datetime).toLocaleString()}
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-4 h-4 text-violet-400" />
            LYD {booking.price.toFixed(2)}
          </div>
          {booking.duration_minutes && (
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4 text-violet-400" />
              {booking.duration_minutes} min
            </div>
          )}
          {booking.category_name && (
            <div className="flex items-center gap-2 text-gray-600">
              <FileText className="w-4 h-4 text-violet-400" />
              {booking.category_name}
            </div>
          )}
        </div>

        {booking.description && (
          <p className="mt-4 text-sm text-gray-600 border-t border-gray-100 pt-4">{booking.description}</p>
        )}
      </div>

      {/* Payment status (when NOT in escrow decision state) */}
      {booking.payment_status && !showEscrowPanel && (
        <div className={`rounded-2xl border p-4 mb-4 ${
          booking.payment_status === "held" ? "bg-amber-50 border-amber-200" :
          booking.payment_status === "released" || booking.payment_status === "auto_released"
            ? "bg-emerald-50 border-emerald-200"
          : "bg-gray-50 border-gray-200"
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4" />
            <p className="font-semibold text-sm capitalize">
              Payment: {booking.payment_status.replace(/_/g, " ")}
            </p>
          </div>
          {booking.invoice_number && (
            <p className="text-xs text-gray-500">Invoice #{booking.invoice_number}</p>
          )}
        </div>
      )}

      {/* Full Escrow Panel (FR-63-65) — shown when completed/revision_requested + payment held */}
      {showEscrowPanel && (
        <div className="mb-4">
          <EscrowPanel
            bookingId={booking.id}
            autoReleaseAt={booking.auto_release_at}
            onDecision={load}
          />
        </div>
      )}

      {/* Revision notes (when provider is notified of revision) */}
      {booking.revision_notes && booking.status === "revision_requested" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-4">
          <p className="text-sm font-semibold text-amber-800 mb-1">
            Revision Requested {booking.revision_count > 1 ? `(${booking.revision_count}×)` : ""}
          </p>
          <p className="text-sm text-amber-700">{booking.revision_notes}</p>
        </div>
      )}

      {/* Quick action links */}
      <div className="flex gap-2 mb-4">
        <Link
          href={`/customer/bookings/${booking.id}/chat`}
          className="flex items-center gap-1.5 text-xs bg-violet-50 text-violet-700 hover:bg-violet-100 px-3 py-2 rounded-xl font-medium transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" /> Chat
        </Link>
        {booking.status === "en_route" && (
          <Link
            href={`/customer/bookings/${booking.id}/location`}
            className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-xl font-medium transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" /> Live Location
          </Link>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Other action buttons */}
      <div className="space-y-2">
        {canReview && (
          <Link
            href={`/customer/bookings/${booking.id}/review`}
            className="w-full block text-center border-2 border-violet-200 text-violet-700 py-3 rounded-xl font-semibold hover:bg-violet-50 transition-colors"
          >
            <Star className="w-4 h-4 inline mr-1" /> Leave a Review
          </Link>
        )}

        {/* Open dispute link (only for completed/revision_requested + payment held) */}
        {showEscrowPanel && (
          <Link
            href={`/customer/bookings/${booking.id}/dispute`}
            className="w-full block text-center border border-red-100 text-red-500 py-2.5 rounded-xl font-medium text-sm hover:bg-red-50 transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 inline mr-1" /> Open Dispute
          </Link>
        )}

        {canCancel && (
          <button
            disabled={actionLoading}
            onClick={() => doAction("cancel", { reason: "" })}
            className="w-full border-2 border-red-100 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" /> Cancel Booking
          </button>
        )}

        {booking.invoice_number && (
          <Link
            href={`/api/v1/payments/${booking.id}/invoice`}
            target="_blank"
            className="w-full block text-center text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            <FileText className="w-3.5 h-3.5 inline mr-1" /> View Invoice
          </Link>
        )}
      </div>
    </div>
  );
}
