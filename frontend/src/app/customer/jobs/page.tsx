"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import api from "@/lib/api";
import {
  Briefcase,
  Plus,
  Clock,
  MapPin,
  ChevronRight,
  AlertCircle,
  Loader2,
  Sparkles,
  Zap,
  Tag,
} from "lucide-react";

interface JobItem {
  id: number;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  is_urgent: boolean;
  status: string;
  created_at: string;
  offers_count?: number;
}

const STATUS_BADGES: Record<string, { labelEn: string; labelAr: string; bg: string; text: string }> = {
  open: { labelEn: "Open for Bids", labelAr: "مفتوح للعروض", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  accepted: { labelEn: "Offer Accepted", labelAr: "تم قبول العرض", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  in_progress: { labelEn: "In Progress", labelAr: "قيد التنفيذ", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  completed: { labelEn: "Completed", labelAr: "مكتمل", bg: "bg-gray-100 border-gray-200", text: "text-gray-700" },
  cancelled: { labelEn: "Cancelled", labelAr: "ملغى", bg: "bg-red-50 border-red-200", text: "text-red-700" },
};

export default function CustomerJobsPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get<JobItem[]>("/jobs");
      setJobs(res.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          (isAr ? "فشل في تحميل الوظائف" : "Failed to load jobs.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[var(--color-border)] shadow-2xs">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-[var(--color-ink)] flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-[var(--color-signal)]" />
            <span>{isAr ? "طلباتي وعروض الأسعار" : "My Jobs & Bids"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            {isAr
              ? "متابعة الطلبات المخصصة وعروض المحترفين وتأكيد الاتفاقات"
              : "Track custom job requests, compare bids from professionals, and hire"}
          </p>
        </div>

        <Link
          href="/customer/jobs/new"
          className="btn-primary"
          style={{ padding: "10px 20px", fontSize: "14px", whiteSpace: "nowrap" }}
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? "طلب عرض سعر جديد" : "Post a New Job"}</span>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-[var(--color-border)]">
          <Loader2 className="w-8 h-8 text-[var(--color-signal)] animate-spin mb-3" />
          <p className="text-xs font-semibold text-[var(--color-ink-muted)]">
            {isAr ? "جاري تحميل الطلبات..." : "Loading your jobs & bids..."}
          </p>
        </div>
      ) : jobs.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-white rounded-2xl border border-[var(--color-border)] text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[var(--color-signal)] flex items-center justify-center mb-4">
            <Briefcase className="w-7 h-7" />
          </div>

          <h2 className="font-display font-bold text-lg text-[var(--color-ink)] mb-1">
            {isAr ? "لا توجد طلبات عروض أسعار حتى الآن" : "No Job Requests Posted Yet"}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] max-w-md mb-6">
            {isAr
              ? "قم بوصف مشروعك أو الخدمة التي تحتاجها ليقوم المحترفون بتقديم عروض أسعار تنافسية خلال دقائق."
              : "Describe your job request or service needs to get custom bids from verified experts in minutes."}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/customer/jobs/new"
              className="btn-primary"
              style={{ padding: "10px 22px", fontSize: "14px" }}
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? "نشر طلب جديد" : "Post a Job Request"}</span>
            </Link>

            <Link
              href="/customer/jobs/new?mode=ai"
              className="btn-ai"
              style={{ padding: "10px 22px", fontSize: "14px" }}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAr ? "طلب بالذكاء الاصطناعي" : "Post via AI Assist"}</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Jobs List */
        <div className="space-y-4">
          {jobs.map((job) => {
            const badge = STATUS_BADGES[job.status] || STATUS_BADGES.open;
            return (
              <Link
                key={job.id}
                href={`/customer/jobs/${job.id}`}
                className="bg-white p-5 rounded-2xl border border-[var(--color-border)] hover:border-[var(--color-signal)] transition-all hover:shadow-md block text-decoration-none group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-display font-bold text-base text-[var(--color-ink)] group-hover:text-[var(--color-signal)] transition-colors">
                      {job.title}
                    </h3>

                    {job.is_urgent && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-red-100 text-red-700 border border-red-200">
                        <Zap className="w-3 h-3 fill-red-600" />
                        {isAr ? "عاجل (+25%)" : "Urgent (+25%)"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.text}`}
                    >
                      {isAr ? badge.labelAr : badge.labelEn}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[var(--color-ink-soft)] line-clamp-2 mb-4">
                  {job.description}
                </p>

                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-ink-muted)]">
                  <div className="flex items-center gap-4">
                    {(job.budget_min || job.budget_max) && (
                      <span className="flex items-center gap-1 font-bold text-[var(--color-ink)] font-mono">
                        <Tag className="w-3.5 h-3.5 text-[var(--color-signal)]" />
                        LYD {job.budget_min ?? 0} - {job.budget_max ?? 0}
                      </span>
                    )}

                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-[var(--color-signal)] group-hover:underline">
                    <span>{isAr ? "عرض التفاصيل والعروض" : "View Bids & Details"}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
