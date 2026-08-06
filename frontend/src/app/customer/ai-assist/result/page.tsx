"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Star, MapPin, ArrowRight, Edit2, Loader2, CheckCircle, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface Provider {
  provider_id: number;
  user_id: number;
  avg_rating: number;
  trust_score: number;
  tier: string;
  city: string;
  completed_jobs_count: number;
}

interface AIResult {
  category_id: number | null;
  category_slug: string;
  category_name: string;
  cost_min: number;
  cost_max: number;
  duration_minutes: number;
  structured_description: string;
  confidence: number;
  top_providers: Provider[];
  category_suggestions: { slug: string; name: string }[];
  fallback?: string;
}

const TIER_STYLES: Record<string, string> = {
  platinum: "bg-cyan-100 text-cyan-800",
  gold: "bg-amber-100 text-amber-800",
  silver: "bg-gray-100 text-gray-700",
  bronze: "bg-orange-100 text-orange-800",
};

export default function AIAssistResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState(false);
  const [posting, setPosting] = useState(false);

  const originalText = typeof window !== "undefined" ? sessionStorage.getItem("ai_assist_text") ?? "" : "";

  const analyze = async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.post<AIResult>("/ai/assist", { text });
      setResult(r.data);
      setDescription(r.data.structured_description ?? text);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      if (detail?.fallback === "manual") {
        setError("AI is temporarily unavailable. Please post your job manually.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!originalText) {
      router.replace("/customer/ai-assist");
      return;
    }
    analyze(originalText);
  }, []);

  const postJob = async () => {
    if (!result) return;
    setPosting(true);
    try {
      const jobData = {
        title: description.slice(0, 100),
        description,
        category_id: result.category_id,
        estimated_budget_min: result.cost_min,
        estimated_budget_max: result.cost_max,
        ai_generated: true,
      };
      const jobRes = await api.post("/jobs", jobData);
      router.push(`/customer/bookings?job=${jobRes.data.id}`);
    } finally {
      setPosting(false);
    }
  };

  const bookProvider = async (providerId: number) => {
    if (!result) return;
    setPosting(true);
    try {
      const res = await api.post("/bookings", {
        provider_profile_id: providerId,
        category_id: result.category_id,
        title: description.slice(0, 100),
        description,
        booking_type: "instant",
        price: Math.round((result.cost_min + result.cost_max) / 2),
      });
      router.push(`/customer/bookings/${res.data.id}`);
    } finally {
      setPosting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
        </div>
        <p className="font-semibold text-lg mb-1">Analyzing your request...</p>
        <p className="text-white/50 text-sm">AI is matching you with the best services</p>
        <Loader2 className="w-6 h-6 animate-spin mx-auto mt-4 text-violet-400" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">AI Unavailable</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => analyze(originalText)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
          <Link href="/customer/jobs/new" className="btn-primary px-4 py-2 rounded-xl text-sm font-medium">
            Post Manually
          </Link>
        </div>
      </div>
    </div>
  );

  if (!result) return null;

  const confidence = Math.round((result.confidence ?? 0.5) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* AI Badge */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1.5 bg-violet-100 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5" /> AI Generated
        </div>
        <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${confidence >= 75 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {confidence}% confidence
        </div>
        <button onClick={() => analyze(originalText)} className="ml-auto text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
          <RefreshCw className="w-3 h-3" /> Re-analyze
        </button>
      </div>

      {/* Category & Estimate */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Detected Service</p>
            <h2 className="text-xl font-bold text-gray-900">{result.category_name}</h2>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Estimated Cost</p>
            <p className="text-xl font-bold text-violet-600">SAR {result.cost_min}–{result.cost_max}</p>
            <p className="text-xs text-gray-400">{result.duration_minutes} min est.</p>
          </div>
        </div>

        {/* Editable description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-gray-600">Job Description</p>
            <button onClick={() => setEditing(p => !p)} className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1">
              <Edit2 className="w-3 h-3" /> {editing ? "Done" : "Edit"}
            </button>
          </div>
          {editing ? (
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm resize-none"
            />
          ) : (
            <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2.5">{description}</p>
          )}
        </div>
      </div>

      {/* Top Providers */}
      {result.top_providers.length > 0 ? (
        <div className="mb-5">
          <h3 className="font-semibold text-gray-900 mb-3">Top Matched Providers</h3>
          <div className="space-y-3">
            {result.top_providers.map((p, i) => (
              <div key={p.provider_id} className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 ${i === 0 ? "border-violet-200 ring-1 ring-violet-100" : "border-gray-100"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${i === 0 ? "bg-violet-600" : i === 1 ? "bg-gray-500" : "bg-gray-400"}`}>
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-900">Provider #{p.provider_id}</span>
                    {p.tier && <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${TIER_STYLES[p.tier] ?? "bg-gray-100 text-gray-600"}`}>{p.tier}</span>}
                    {i === 0 && <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-bold">Best Match</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-current" /> {p.avg_rating.toFixed(1)}</span>
                    <span>{p.completed_jobs_count} jobs</span>
                    {p.city && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{p.city}</span>}
                  </div>
                </div>
                <button
                  onClick={() => bookProvider(p.provider_id)}
                  disabled={posting}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  Book <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-5 text-sm text-amber-800">
          No providers available in this category yet. Post a job and providers will send you offers.
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-3">
        <button
          onClick={postJob}
          disabled={posting || !result.category_id}
          className="flex-1 btn-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
        >
          {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Post as Job Request
        </button>
        <Link href="/customer/ai-assist" className="flex items-center justify-center px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
          ← Try again
        </Link>
      </div>
    </div>
  );
}
