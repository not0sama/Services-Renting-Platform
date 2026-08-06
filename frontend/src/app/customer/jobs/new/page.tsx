"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Send, AlertTriangle, ChevronRight, Loader2, Zap, FileText,
} from "lucide-react";
import api from "@/lib/api";

interface Category {
  id: number;
  name_en: string;
  slug: string;
}

function PostJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    category_id: searchParams.get("category") ?? "",
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
    is_urgent: false,
    location_address: "",
    scheduled_date: "",
  });

  useEffect(() => {
    setLoading(true);
    api.get<Category[]>("/categories")
      .then((r) => {
        // Flatten tree
        const flat: Category[] = [];
        function flatten(cats: any[]) {
          cats.forEach((c) => {
            flat.push(c);
            if (c.children) flatten(c.children);
          });
        }
        flatten(r.data as any[]);
        setCategories(flat);
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        category_id: parseInt(form.category_id),
        title: form.title.trim(),
        description: form.description.trim(),
        is_urgent: form.is_urgent,
        location_address: form.location_address || undefined,
        budget_min: form.budget_min ? parseFloat(form.budget_min) : undefined,
        budget_max: form.budget_max ? parseFloat(form.budget_max) : undefined,
        scheduled_date: form.scheduled_date ? new Date(form.scheduled_date).toISOString() : undefined,
      };

      const res = await api.post<{ id: number }>("/jobs", payload);
      router.push(`/customer/bookings?tab=jobs`);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to post job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
        <p className="text-gray-500 mt-1">Describe what you need and receive offers from providers</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          className="flex-1 flex items-center gap-2 p-4 rounded-2xl border-2 border-violet-500 bg-violet-50 text-violet-700"
        >
          <FileText className="w-5 h-5" />
          <span className="font-semibold text-sm">Manual Form</span>
        </button>
        <button
          type="button"
          onClick={() => router.push("/customer/jobs/new?mode=ai")}
          className="flex-1 flex items-center gap-2 p-4 rounded-2xl border-2 border-gray-200 hover:border-violet-300 hover:bg-violet-50 transition-all text-gray-600"
        >
          <Zap className="w-5 h-5 text-violet-500" />
          <span className="font-semibold text-sm">AI Assist</span>
          <span className="ml-auto text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">Beta</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Category *</label>
          <select
            required
            value={form.category_id}
            onChange={(e) => update("category_id", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm bg-white"
          >
            <option value="">Select a category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name_en}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title *</label>
          <input
            type="text"
            required
            minLength={5}
            maxLength={200}
            placeholder="e.g. Fix leaking kitchen sink"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
          <textarea
            required
            minLength={10}
            rows={4}
            placeholder="Describe the work you need done in as much detail as possible..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm resize-none"
          />
        </div>

        {/* Budget */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget Min (SAR)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={form.budget_min}
              onChange={(e) => update("budget_min", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget Max (SAR)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={form.budget_max}
              onChange={(e) => update("budget_max", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
          <input
            type="text"
            placeholder="e.g. Al-Olaya, Riyadh"
            value={form.location_address}
            onChange={(e) => update("location_address", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
          />
        </div>

        {/* Preferred date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Date</label>
          <input
            type="datetime-local"
            value={form.scheduled_date}
            onChange={(e) => update("scheduled_date", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
          />
        </div>

        {/* Urgent toggle */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Mark as Urgent</p>
            <p className="text-xs text-amber-600">Adds +25% surcharge and prioritises your job</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_urgent}
              onChange={(e) => update("is_urgent", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-checked:bg-amber-500 rounded-full peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </label>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Posting Job...</>
          ) : (
            <><Send className="w-4 h-4" /> Post Job</>
          )}
        </button>
      </form>
    </div>
  );
}

export default function PostJobPage() {
  return (
    <Suspense>
      <PostJobForm />
    </Suspense>
  );
}
