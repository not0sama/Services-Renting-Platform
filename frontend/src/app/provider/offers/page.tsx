"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Clock,
  DollarSign,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Eye,
} from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

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

export default function MySubmittedOffersPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get<Offer[]>("/offers/my");
      setOffers(res.data);
    } catch {
      toast.error(isAr ? "فشل تحميل العروض المقدمة" : "Failed to load submitted offers.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (offerId: number) => {
    if (!confirm(isAr ? "هل أنت تأكد من سحب هذا العرض؟" : "Are you sure you want to withdraw this offer?")) return;
    setActionId(offerId);
    try {
      await api.delete(`/offers/${offerId}`);
      toast.success(isAr ? "تم سحب العرض بنجاح" : "Offer withdrawn successfully.");
      loadOffers();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || (isAr ? "فشل سحب العرض" : "Failed to withdraw offer."));
    } finally {
      setActionId(null);
    }
  };

  const filteredOffers = offers.filter((o) => {
    if (filter === "all") return true;
    return o.status === filter;
  });

  const getStatusBadge = (status: Offer["status"]) => {
    switch (status) {
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isAr ? "مقبول" : "Accepted"}</span>
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            <span>{isAr ? "مرفوض" : "Rejected"}</span>
          </span>
        );
      case "withdrawn":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? "مسحوب" : "Withdrawn"}</span>
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            <span>{isAr ? "قيد الانتظار" : "Pending"}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold font-display text-[var(--color-ink)] flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-[var(--color-signal)]" />
            <span>{isAr ? "العروض المقدمة" : "My Submitted Offers"}</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAr
              ? "متابعة وإدارة كافة العروض والأسعار المقدمة على طلبات العملاء"
              : "Track and manage all your proposals and bids submitted for customer jobs"}
          </p>
        </div>

        <Link
          href="/provider/jobs"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-signal)] text-white font-semibold text-sm shadow-sm hover:opacity-95 transition"
        >
          <Briefcase className="w-4 h-4" />
          <span>{isAr ? "تصفح الفرص المتاحة" : "Browse Job Feed"}</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
        {[
          { id: "all", labelEn: "All Offers", labelAr: "كافة العروض", count: offers.length },
          { id: "pending", labelEn: "Pending", labelAr: "قيد الانتظار", count: offers.filter(o => o.status === "pending").length },
          { id: "accepted", labelEn: "Accepted", labelAr: "المقبولة", count: offers.filter(o => o.status === "accepted").length },
          { id: "rejected", labelEn: "Rejected", labelAr: "المرفوضة", count: offers.filter(o => o.status === "rejected").length },
          { id: "withdrawn", labelEn: "Withdrawn", labelAr: "المسحوبة", count: offers.filter(o => o.status === "withdrawn").length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
              filter === tab.id
                ? "bg-[var(--color-ink)] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                filter === tab.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-100 shadow-2xs">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">
            {isAr ? "لا توجد عروض في هذه الفئة" : "No offers found"}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-5">
            {isAr
              ? "لم تقم بتقديم عروض مطابقة لهذه التصفية حتى الآن. تصفح فرص العمل المتاحة وقدم عرضك الأول!"
              : "You haven't submitted any offers in this tab yet. Explore open job requests and submit your bid!"}
          </p>
          <Link
            href="/provider/jobs"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-xs shadow-xs hover:bg-gray-800 transition"
          >
            <span>{isAr ? "استعراض طلبات العمل" : "Explore Job Feed"}</span>
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>
      ) : (
        /* Offers List */
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-xs ${
                offer.status === "accepted"
                  ? "border-emerald-200 bg-emerald-50/20"
                  : offer.status === "withdrawn"
                  ? "border-gray-200 opacity-70"
                  : "border-gray-100"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(offer.status)}

                    <Link
                      href={`/provider/jobs/${offer.job_id}`}
                      className="font-bold text-base text-[var(--color-ink)] hover:text-[var(--color-signal)] transition flex items-center gap-1.5"
                    >
                      <span>{offer.job_title || (isAr ? `طلب عمل #${offer.job_id}` : `Job Request #${offer.job_id}`)}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                    </Link>
                  </div>

                  {offer.message && (
                    <p className="text-xs text-gray-600 bg-gray-50/80 p-3 rounded-xl border border-gray-100 leading-relaxed italic">
                      "{offer.message}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 pt-1">
                    <span className="flex items-center gap-1 text-[var(--color-ink)] font-bold text-sm">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>{offer.price} LYD</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{offer.duration_minutes} {isAr ? "دقيقة" : "mins"}</span>
                    </span>

                    {offer.urgent_surcharge_pct ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[11px] font-bold">
                        +{offer.urgent_surcharge_pct}% {isAr ? "رسوم طارئة" : "Urgent Fee"}
                      </span>
                    ) : null}

                    <span className="text-[11px] text-gray-400 font-normal ml-auto">
                      {new Date(offer.submitted_at).toLocaleDateString(isAr ? "ar-LY" : "en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {offer.status === "accepted" && (
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-100 justify-end shrink-0">
                    <Link
                      href={`/provider/offers/${offer.id}`}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{isAr ? "عرض" : "View"}</span>
                    </Link>
                  </div>
                )}

                {offer.status === "pending" && (
                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 justify-end">
                    <button
                      onClick={() => handleWithdraw(offer.id)}
                      disabled={actionId === offer.id}
                      className="px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-bold hover:bg-red-100 transition disabled:opacity-50"
                    >
                      {actionId === offer.id ? (isAr ? "جاري السحب..." : "Withdrawing...") : (isAr ? "سحب العرض" : "Withdraw")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
