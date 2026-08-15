"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageSquare,
  Clock,
  DollarSign,
  CheckCircle2,
  Navigation,
  Car,
  Wrench,
  CheckCircle,
  AlertCircle,
  Banknote,
  CreditCard,
  Building2,
  Loader2,
  ShieldCheck,
  User,
  Sparkles,
} from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[260px] bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-xs text-gray-400">
        Loading Location Map...
      </div>
    ),
  }
);

interface Booking {
  id: number;
  customer_id: number;
  provider_id: number;
  job_offer_id?: number;
  title: string;
  description?: string;
  location_address?: string;
  latitude?: number;
  longitude?: number;
  scheduled_datetime?: string;
  duration_minutes: number;
  price: number;
  status: "pending" | "confirmed" | "en_route" | "in_progress" | "completed" | "cancelled";
  payment_method?: "cash" | "transfer" | "card";
  customer_name?: string;
  customer_phone?: string;
  category_name?: string;
  payment_status?: string;
}

interface Offer {
  id: number;
  job_id: number;
  price: number;
  duration_minutes: number;
  message?: string;
  urgent_surcharge_pct?: number;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  submitted_at: string;
  job_title?: string;
  job_status?: string;
}

export default function AcceptedOfferDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [offer, setOffer] = useState<Offer | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch offers to match id
      const offersRes = await api.get<Offer[]>("/offers/my");
      const matchedOffer = offersRes.data.find((o) => String(o.id) === String(id));
      if (matchedOffer) {
        setOffer(matchedOffer);
      }

      // 2. Fetch bookings list to find associated booking
      const bookingsRes = await api.get<Booking[]>("/bookings");
      const matchedBooking = bookingsRes.data.find(
        (b) => String(b.job_offer_id) === String(id) || String(b.id) === String(id)
      );

      if (matchedBooking) {
        // Fetch detailed enriched booking
        const detailRes = await api.get<Booking>(`/bookings/${matchedBooking.id}`);
        setBooking(detailRes.data);
      }
    } catch (err: any) {
      toast.error(isAr ? "فشل تحميل تفاصيل العرض" : "Failed to load offer details.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: Booking["status"]) => {
    if (!booking) return;
    setUpdatingStatus(true);

    try {
      const res = await api.patch<Booking>(`/bookings/${booking.id}/status`, {
        status: newStatus,
      });
      setBooking(res.data);
      const statusLabels: Record<string, string> = {
        en_route: isAr ? "أنت الآن في الطريق إلى العميل" : "Status updated: En Route to customer",
        in_progress: isAr ? "تم بدء العمل على الخدمة" : "Status updated: Work In Progress",
        completed: isAr ? "تم إكمال العمل بنجاح" : "Status updated: Work Completed!",
      };
      toast.success(statusLabels[newStatus] || (isAr ? "تم تحديث الحالة بنجاح" : "Status updated successfully"));
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || (isAr ? "فشل تحديث الحالة" : "Failed to update status.");
      toast.error(msg);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <div className="h-40 bg-white rounded-3xl animate-pulse border border-gray-100" />
        <div className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
      </div>
    );
  }

  if (!offer && !booking) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900">{isAr ? "العرض غير موجود" : "Offer not found"}</h2>
        <button
          onClick={() => router.push("/provider/offers")}
          className="mt-4 px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-bold"
        >
          {isAr ? "العودة للعروض" : "Back to My Offers"}
        </button>
      </div>
    );
  }

  const currentStatus = booking?.status || "confirmed";
  const lat = booking?.latitude || 32.8872;
  const lon = booking?.longitude || 13.1913;
  const hasGps = Boolean(booking?.latitude && booking?.longitude);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/provider/offers")}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        <span>{isAr ? "العودة للعروض المقدمة" : "Back to My Offers"}</span>
      </button>

      {/* Header Info Banner */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isAr ? "عرض مقبول" : "Accepted Offer"}</span>
              </span>
              {booking && (
                <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                  Booking #{booking.id}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {booking?.title || offer?.job_title || `Job #${offer?.job_id}`}
            </h1>
            {booking?.description && (
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{booking.description}</p>
            )}
          </div>

          <div className="text-right rtl:text-left sm:shrink-0 bg-violet-50/70 p-3.5 rounded-2xl border border-violet-100">
            <p className="text-[11px] font-bold text-violet-800 uppercase tracking-wider">{isAr ? "السعر المتفق عليه" : "Agreed Price"}</p>
            <p className="text-xl font-bold text-violet-700">{booking?.price || offer?.price} LYD</p>
          </div>
        </div>
      </div>

      {/* ── STATUS UPDATE & WORK TRACKER SECTION ── */}
      {booking && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-violet-600" />
              <span>{isAr ? "مراحل تنفيذ الخدمة وتحديث الحالة" : "Job Execution Tracker & Status Updates"}</span>
            </h2>
          </div>

          {/* Stepper Bar */}
          <div className="grid grid-cols-4 gap-2 text-center">
            {/* Step 1: Confirmed */}
            <div
              className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                ["confirmed", "en_route", "in_progress", "completed"].includes(currentStatus)
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-gray-50 border-gray-200 text-gray-400"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? "1. تأكيد الحجز" : "1. Confirmed"}</span>
            </div>

            {/* Step 2: En Route */}
            <div
              className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                ["en_route", "in_progress", "completed"].includes(currentStatus)
                  ? "bg-indigo-50 border-indigo-200 text-indigo-800"
                  : "bg-gray-50 border-gray-200 text-gray-400"
              }`}
            >
              <Car className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? "2. في الطريق" : "2. En Route"}</span>
            </div>

            {/* Step 3: In Progress */}
            <div
              className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                ["in_progress", "completed"].includes(currentStatus)
                  ? "bg-purple-50 border-purple-200 text-purple-800"
                  : "bg-gray-50 border-gray-200 text-gray-400"
              }`}
            >
              <Wrench className="w-4 h-4 text-purple-600" />
              <span>{isAr ? "3. جاري العمل" : "3. In Progress"}</span>
            </div>

            {/* Step 4: Completed */}
            <div
              className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 ${
                currentStatus === "completed"
                  ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                  : "bg-gray-50 border-gray-200 text-gray-400"
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isAr ? "4. مكتمل" : "4. Completed"}</span>
            </div>
          </div>

          {/* Interactive Status Transition Buttons */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <p className="text-xs font-bold text-gray-700">{isAr ? "تحديث حالة العمل الحالية:" : "Update Current Status:"}</p>

            {currentStatus === "confirmed" && (
              <button
                type="button"
                onClick={() => handleUpdateStatus("en_route")}
                disabled={updatingStatus}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updatingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Car className="w-4 h-4" />
                    <span>{isAr ? "أنا في الطريق للعميل الآن (En Route)" : "I'm On My Way (En Route)"}</span>
                  </>
                )}
              </button>
            )}

            {currentStatus === "en_route" && (
              <button
                type="button"
                onClick={() => handleUpdateStatus("in_progress")}
                disabled={updatingStatus}
                className="w-full py-3.5 px-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updatingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Wrench className="w-4 h-4" />
                    <span>{isAr ? "البدء في تنفيذ الخدمة (In Progress)" : "Start Work (In Progress)"}</span>
                  </>
                )}
              </button>
            )}

            {currentStatus === "in_progress" && (
              <button
                type="button"
                onClick={() => handleUpdateStatus("completed")}
                disabled={updatingStatus}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updatingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>{isAr ? "إكمال الخدمة وتسليم العمل" : "Mark Job as Completed"}</span>
                  </>
                )}
              </button>
            )}

            {currentStatus === "completed" && (
              <div className="p-3 bg-emerald-100/70 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>{isAr ? "تم إكمال هذه الخدمة بنجاح" : "This job has been successfully completed"}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── CUSTOMER & LOCATION DETAILS (MAP & GPS) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Details Box */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <User className="w-4 h-4 text-violet-600" />
            <span>{isAr ? "بيانات التواصل مع العميل" : "Customer Contact Details"}</span>
          </h2>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="text-xs text-gray-500 font-medium">{isAr ? "اسم العميل:" : "Customer Name:"}</span>
              <span className="text-xs font-bold text-gray-900">{booking?.customer_name || "Customer"}</span>
            </div>

            {booking?.customer_phone && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs text-gray-500 font-medium">{isAr ? "رقم الهاتف:" : "Phone:"}</span>
                <a
                  href={`tel:${booking.customer_phone}`}
                  className="text-xs font-bold text-violet-700 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{booking.customer_phone}</span>
                </a>
              </div>
            )}

            {booking && (
              <Link
                href={`/provider/chat?booking_id=${booking.id}`}
                className="w-full py-2.5 px-4 rounded-xl border border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 font-bold text-xs transition flex items-center justify-center gap-2 shadow-2xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{isAr ? "محادثة العميل مباشرة" : "Chat with Customer"}</span>
              </Link>
            )}
          </div>

          {/* Payment Method Banner */}
          <div className="pt-2">
            <p className="text-xs font-bold text-gray-900 mb-2">{isAr ? "طريقة الدفع المختارة:" : "Selected Payment Method:"}</p>
            {booking?.payment_method === "cash" ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center gap-2.5">
                <Banknote className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">{isAr ? "الدفع نقداً (كاش)" : "Cash on Delivery"}</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    {isAr ? "تحصيل المبلغ نقداً مباشرة من العميل بعد الإتمام" : "Collect payment in cash directly from customer"}
                  </p>
                </div>
              </div>
            ) : booking?.payment_method === "transfer" ? (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-indigo-900 text-xs flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">{isAr ? "تحويل بنكي / محفظة" : "Bank Transfer / Local Wallet"}</p>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    {isAr ? "تحويل بنكي محلي مباشر" : "Direct local bank or wallet transfer"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-violet-50 border border-violet-200 rounded-2xl text-violet-900 text-xs flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-violet-600 flex-shrink-0" />
                <div>
                  <p className="font-bold">{isAr ? "بطاقة ائتمان (إسكرو)" : "Credit / Debit Card (Escrow)"}</p>
                  <p className="text-[11px] text-violet-700 mt-0.5">
                    {isAr ? "المبلغ مجمد في الإسكرو وسيتم تحويله بعد الاعتماد" : "Funds held safely in Escrow until completion"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location & GPS Map Box (Read-Only) */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-violet-600" />
              <span>{isAr ? "موقع الخدمة والخريطة (للعرض فقط)" : "Customer Location & Map (View Only)"}</span>
            </h2>

            {hasGps && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-xl bg-violet-600 text-white font-bold text-[11px] hover:bg-violet-700 transition flex items-center gap-1 shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Google Maps</span>
              </a>
            )}
          </div>

          {/* Location Address Text (Read-Only) */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-800 leading-relaxed font-medium">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">{isAr ? "وصف عنوان العميل:" : "Customer Address Description:"}</p>
            <p className="font-semibold text-gray-900">{booking?.location_address || (isAr ? "لم يتم تحديد وصف نصي للعنوان" : "No textual address description specified")}</p>
          </div>

          {/* Location Picker Map Display (Read-Only) */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 pointer-events-none">
            <LocationPickerMap
              lat={lat}
              lng={lon}
              height="220px"
              readOnly={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
