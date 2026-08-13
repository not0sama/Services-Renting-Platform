"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Star, MapPin, CheckCircle2, Clock, Heart, MessageSquare,
  Zap, Calendar, ShieldCheck, Check, AlertCircle, Loader2, X, Plus,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { RatingInput } from "@/components/RatingInput";
import TrustScorePanel from "@/components/TrustScorePanel";
import TierBadge from "@/components/TierBadge";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

interface ProviderProfile {
  id: number;
  user_id: number;
  name?: string;
  bio?: string;
  city?: string;
  country?: string;
  is_online: boolean;
  avg_rating: number;
  completed_jobs_count: number;
  trust_score: number;
  tier: string;
  avatar_url?: string;
  years_experience: number;
  service_radius_km: number;
  verification_status: string;
}

interface ServicePackage {
  id: number;
  title: string;
  description?: string;
  price: number;
  duration_minutes: number;
  category_id?: number;
}

interface Review {
  id: number;
  rating: number;
  comment?: string;
  reviewer_name?: string;
  created_at: string;
}

export default function ProviderProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServicePackage | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    // Set default tomorrow date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split("T")[0]);

    Promise.all([
      api.get<ProviderProfile>(`/providers/${id}`),
      api.get<Review[]>(`/reviews/provider/${id}`).catch(() => ({ data: [] })),
      api.get<ServicePackage[]>(`/services/provider/${id}`).catch(() => ({ data: [] })),
      api.get<{ provider_id: number }[]>("/me/favorites").catch(() => ({ data: [] })),
    ])
      .then(([pRes, rRes, sRes, favRes]) => {
        setProfile(pRes.data);
        setReviews(rRes.data);
        setServices(sRes.data);
        if (sRes.data.length > 0) {
          setSelectedService(sRes.data[0]);
        }
        setIsFavorited(favRes.data.some((f) => f.provider_id === Number(id)));
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleFavorite = async () => {
    try {
      if (isFavorited) {
        await api.delete(`/me/favorites/${id}`);
        setIsFavorited(false);
        toast.success(isAr ? "تم الإزالة من المفضلة" : "Removed from favorites");
      } else {
        await api.post(`/me/favorites/${id}`, {});
        setIsFavorited(true);
        toast.success(isAr ? "تم الإضافة إلى المفضلة" : "Added to favorites");
      }
    } catch {}
  };

  const handleOpenBookingModal = (service?: ServicePackage) => {
    if (service) {
      setSelectedService(service);
    }
    setBookingError("");
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate || !scheduledTime) {
      setBookingError(isAr ? "يرجى تحديد التاريخ والوقت" : "Please select date and time.");
      return;
    }

    setIsSubmittingBooking(true);
    setBookingError("");

    try {
      const scheduled_datetime = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

      let res;
      if (selectedService?.id) {
        // Instant Book schema matching backend InstantBookCreate
        res = await api.post("/bookings/instant", {
          service_id: selectedService.id,
          scheduled_datetime,
          location_address: notes || undefined,
        });
      } else {
        // Direct Booking schema matching backend DirectBookingCreate
        res = await api.post("/bookings", {
          provider_profile_id: Number(id),
          category_id: 1,
          title: `${isAr ? "حجز مباشر مع" : "Direct Service Booking —"} ${profile?.name ?? "Provider"}`,
          description: notes || undefined,
          booking_type: "instant",
          price: 150.0,
          scheduled_datetime,
        });
      }

      toast.success(isAr ? "تم إنشاء الحجز بنجاح! جاري تحويلك للإسكرو..." : "Booking created! Redirecting to checkout...");
      setShowBookingModal(false);
      router.push(`/customer/checkout/${res.data.id}`);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error?.message ||
        (isAr ? "فشل إنشاء الحجز" : "Failed to create booking.");
      setBookingError(msg);
      toast.error(msg);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <div className="h-48 bg-white rounded-2xl animate-pulse border border-gray-200" />
        <div className="h-28 bg-white rounded-2xl animate-pulse border border-gray-200" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-gray-500 font-medium mb-4">
          {isAr ? "لم يتم العثور على محترف" : "Provider not found."}
        </p>
        <button onClick={() => router.back()} className="btn-primary">
          {isAr ? "العودة" : "Go Back"}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Top Back Navigation & Primary Booking Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isAr ? "رجوع" : "Back"}</span>
        </button>

        <button
          onClick={() => handleOpenBookingModal()}
          className="btn-primary"
          style={{ padding: "10px 24px", fontSize: "14px", borderRadius: "var(--radius-lg)" }}
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>{isAr ? "احجز المحترف الآن" : "Book Service Now"}</span>
        </button>
      </div>

      {/* Provider Profile Header Card */}
      <div className="bg-white rounded-3xl border border-[var(--color-border)] shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-xs border border-gray-100" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-signal)] to-blue-700 flex items-center justify-center text-white text-3xl font-bold shadow-md">
                  {profile.name?.[0]?.toUpperCase() ?? "P"}
                </div>
              )}
              {profile.is_online && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--color-trust)] rounded-full border-2 border-white shadow-xs" title="Online" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-extrabold text-2xl text-[var(--color-ink)]">
                  {profile.name ?? `Provider #${id}`}
                </h1>

                {profile.verification_status === "approved" && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-[var(--color-trust)] px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isAr ? "موثق" : "Verified"}
                  </span>
                )}

                <TierBadge tier={profile.tier} size="sm" />
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-[var(--color-ink-muted)] flex-wrap">
                {profile.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-[var(--color-signal)]" />
                    {profile.city}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-[var(--color-trust)]" />
                  {profile.years_experience} {isAr ? "سنوات خبرة" : "yrs experience"}
                </span>
              </div>

              {/* Rating & Completed Jobs */}
              <div className="flex items-center gap-3 pt-1">
                <span className="flex items-center gap-1 font-bold text-[var(--color-ink)] text-sm">
                  <Star className="w-4 h-4 fill-[var(--color-ai-bright)] text-[var(--color-ai-bright)]" />
                  {profile.avg_rating.toFixed(1)}
                  <span className="font-normal text-[var(--color-ink-muted)]">({reviews.length} {isAr ? "تقييمات" : "reviews"})</span>
                </span>
                <span className="text-[var(--color-border)]">•</span>
                <span className="text-xs sm:text-sm font-semibold text-[var(--color-ink-soft)]">
                  {profile.completed_jobs_count} {isAr ? "خدمة مكتملة" : "jobs completed"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleFavorite}
              className={`p-3 rounded-2xl border transition-all ${
                isFavorited
                  ? "bg-red-50 text-red-500 border-red-200"
                  : "bg-white text-gray-400 border-gray-200 hover:text-red-500 hover:bg-red-50"
              }`}
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
            </button>

            <button
              onClick={() => handleOpenBookingModal()}
              className="btn-primary px-6 py-3 rounded-2xl font-bold text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>{isAr ? "احجز الخدمة" : "Book Service"}</span>
            </button>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-6 pt-5 text-sm text-[var(--color-ink-soft)] leading-relaxed border-t border-[var(--color-border)]">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Trust Score Panel */}
      <TrustScorePanel
        data={{
          trust_score: profile.trust_score,
          tier: profile.tier,
          avg_rating: profile.avg_rating,
        }}
      />

      {/* Services & Packages Offered */}
      <div className="bg-white rounded-3xl border border-[var(--color-border)] p-6 sm:p-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-lg text-[var(--color-ink)] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[var(--color-signal)]" />
              <span>{isAr ? "باقات الخدمات المتاحة" : "Available Service Packages"}</span>
            </h2>
            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
              {isAr ? "اختر باقة محددة السعر للحجز المباشر" : "Select a fixed-price service package for instant booking"}
            </p>
          </div>
        </div>

        {services.length === 0 ? (
          <div className="p-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-xs text-[var(--color-ink-muted)] mb-3">
              {isAr ? "يقبل هذا المحترف الحجوزات المباشرة والتسليم المخصص" : "This provider accepts direct custom bookings."}
            </p>
            <button
              onClick={() => handleOpenBookingModal()}
              className="btn-primary"
              style={{ fontSize: "13px", padding: "8px 18px" }}
            >
              <Calendar className="w-4 h-4" />
              <span>{isAr ? "احجز موعد مباشر" : "Book Direct Appointment"}</span>
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-signal)] transition-all bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display font-bold text-base text-[var(--color-ink)]">
                      {s.title}
                    </h3>
                    <span className="data-value text-lg font-bold text-[var(--color-signal)] font-mono">
                      LYD {s.price}
                    </span>
                  </div>
                  {s.description && (
                    <p className="text-xs text-[var(--color-ink-soft)] leading-relaxed mb-3">
                      {s.description}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--color-ink-muted)] mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    {s.duration_minutes} {isAr ? "دقيقة" : "mins duration"}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenBookingModal(s)}
                  className="btn-primary w-full justify-center"
                  style={{ fontSize: "13px", padding: "8px 16px" }}
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{isAr ? "احجز هذه الباقة" : "Book Package"}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-3xl border border-[var(--color-border)] p-6 sm:p-8">
        <h2 className="font-display font-bold text-lg text-[var(--color-ink)] mb-5 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[var(--color-signal)]" />
          <span>{isAr ? "تقييمات العملاء" : "Customer Reviews"}</span>
        </h2>

        {reviews.length === 0 ? (
          <div className="text-center py-8 text-xs text-[var(--color-ink-muted)]">
            {isAr ? "لا توجد تقييمات حتى الآن." : "No reviews yet for this provider."}
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0 space-y-1">
                <div className="flex items-center gap-2">
                  <RatingInput value={r.rating} onChange={() => {}} readonly size="sm" />
                  <span className="text-xs font-semibold text-[var(--color-ink-soft)]">
                    {r.reviewer_name ?? (isAr ? "عميل" : "Customer")}
                  </span>
                  <span className="text-xs text-[var(--color-ink-muted)]">• {new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {r.comment && <p className="text-xs text-[var(--color-ink-soft)] leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── INSTANT BOOKING MODAL ────────────────────────────────── */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-signal-light)] text-[var(--color-signal)] flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[var(--color-ink)]">
                    {isAr ? "تأكيد موعد الحجز" : "Confirm Booking Slot"}
                  </h3>
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    {isAr ? "مع" : "With"} {profile.name}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Booking Form */}
            <form onSubmit={handleConfirmBooking} className="space-y-5">
              {/* Service Selection */}
              {services.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-2">
                    {isAr ? "اختر الباقة المطلوبة" : "Selected Service Package"}
                  </label>
                  <select
                    value={selectedService?.id ?? ""}
                    onChange={(e) => {
                      const found = services.find((s) => s.id === Number(e.target.value));
                      if (found) setSelectedService(found);
                    }}
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm font-semibold text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-signal)] focus:outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} — LYD {s.price} ({s.duration_minutes} mins)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date & Time Picker */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5">
                    {isAr ? "تاريخ الموعد" : "Scheduled Date"}
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm font-semibold text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-signal)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5">
                    {isAr ? "الوقت" : "Scheduled Time"}
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm font-semibold text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-signal)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Special Instructions / Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5">
                  {isAr ? "ملاحظات إضافية أو تفاصيل العنوان" : "Special Notes / Address Details"}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder={isAr ? "أضف تفاصيل الموقع أو أي طلب خاص..." : "Add location instructions or special requests..."}
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs text-[var(--color-ink)] placeholder-gray-400 focus:ring-2 focus:ring-[var(--color-signal)] focus:outline-none"
                />
              </div>

              {/* Escrow Guarantee Notice */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[var(--color-trust)] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-950 mb-0.5">
                    {isAr ? "ضمان مالي 100% (Escrow Protection)" : "100% Escrow Protected Booking"}
                  </p>
                  <p className="text-[11px] leading-relaxed text-emerald-800">
                    {isAr
                      ? "تظل أموالك محفوطة في حساب الضمان ولا يتم إطلاقها للمحترف إلا بعد إتمام العمل ورضاك."
                      : "Your payment is held safely in escrow and released to the provider only after you approve completed work."}
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {bookingError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Submit Action */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="btn-primary"
                  style={{ padding: "10px 24px", fontSize: "14px", borderRadius: "var(--radius-xl)" }}
                >
                  {isSubmittingBooking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{isAr ? "تأكيد والانتقال لرفع المبلغ والإسكرو" : "Confirm & Proceed to Escrow Checkout"}</span>
                      <Zap className="w-4 h-4 fill-white" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
