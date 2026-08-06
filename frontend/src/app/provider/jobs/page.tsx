"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase, Clock, Filter, Zap, ChevronRight, MapPin, DollarSign, AlertTriangle,
} from "lucide-react";
import api from "@/lib/api";

interface Job {
  id: number;
  title: string;
  description: string;
  category_id: number;
  budget_min?: number;
  budget_max?: number;
  is_urgent: boolean;
  location_address?: string;
  status: string;
  offer_count: number;
  created_at: string;
}

export default function ProviderJobFeedPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [urgentOnly, setUrgentOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = urgentOnly ? "?is_urgent=true" : "";
    api.get<Job[]>(`/jobs/feed${params}`)
      .then((r) => setJobs(r.data))
      .finally(() => setLoading(false));
  }, [urgentOnly]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Job Feed</h1>
          <p className="text-gray-500 text-sm mt-0.5">Jobs matching your categories and area</p>
        </div>
        <button
          onClick={() => setUrgentOnly((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
            urgentOnly ? "border-amber-400 bg-amber-50 text-amber-700" : "border-gray-200 text-gray-600 hover:border-amber-300"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Urgent
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No jobs in your area right now</p>
          <p className="text-sm mt-1">Check back soon or update your categories</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all p-5 ${
                job.is_urgent ? "border-amber-200" : "border-gray-100"
              }`}
            >
              {job.is_urgent && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-2">
                  <Zap className="w-3.5 h-3.5" /> URGENT — +25% premium
                </div>
              )}
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                  {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{job.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                {job.budget_min && job.budget_max && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    SAR {job.budget_min}–{job.budget_max}
                  </span>
                )}
                {job.location_address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location_address}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  {job.offer_count} offer{job.offer_count !== 1 ? "s" : ""}
                </span>
              </div>
              <Link
                href={`/provider/jobs/${job.id}`}
                className="btn-primary text-sm px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
              >
                Submit Offer <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
