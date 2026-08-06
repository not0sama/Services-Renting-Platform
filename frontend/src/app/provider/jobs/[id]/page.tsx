"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Loader2, DollarSign, Clock } from "lucide-react";
import api from "@/lib/api";

interface Job {
  id: number;
  title: string;
  description: string;
  budget_min?: number;
  budget_max?: number;
  is_urgent: boolean;
  urgent_surcharge_pct: number;
  location_address?: string;
  scheduled_date?: string;
  status: string;
}

export default function SubmitOfferPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");
  const [message, setMessage] = useState("");
  const [urgentSurcharge, setUrgentSurcharge] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.get<Job>(`/jobs/${id}`).then((r) => {
      setJob(r.data);
      if (r.data.is_urgent) {
        setUrgentSurcharge(r.data.urgent_surcharge_pct.toString());
      }
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post(`/jobs/${id}/offers`, {
        price: parseFloat(price),
        duration_minutes: parseInt(duration),
        message: message.trim() || undefined,
        urgent_surcharge_pct: job?.is_urgent ? parseFloat(urgentSurcharge) : undefined,
      });
      setDone(true);
      setTimeout(() => router.push("/provider/offers"), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to submit offer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">💼</div>
        <h2 className="text-xl font-bold text-gray-900">Offer Submitted!</h2>
        <p className="text-gray-500 mt-2">You'll be notified if the customer accepts.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {job && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200">
          <h2 className="font-semibold text-gray-900">{job.title}</h2>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>
          {job.budget_min && job.budget_max && (
            <p className="text-sm text-violet-700 font-medium mt-2">
              Budget: SAR {job.budget_min}–{job.budget_max}
            </p>
          )}
          {job.is_urgent && (
            <p className="text-sm text-red-600 font-medium mt-1">
              🚨 URGENT: Customer requested a {job.urgent_surcharge_pct}% premium.
            </p>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Submit Your Offer</h1>
        <p className="text-sm text-gray-500 mb-5">Set your price and estimated duration</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <DollarSign className="w-4 h-4 inline mr-1" /> Your Price (SAR) *
            </label>
            <input
              type="number" required min="1"
              placeholder="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              <Clock className="w-4 h-4 inline mr-1" /> Estimated Duration (minutes) *
            </label>
            <input
              type="number" required min="15"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
            />
          </div>

          {job?.is_urgent && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Urgent Premium Surcharge (%) *
              </label>
              <input
                type="number" required min="0" max="100"
                value={urgentSurcharge}
                onChange={(e) => setUrgentSurcharge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can negotiate the premium percentage requested by the customer.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Message to Customer</label>
            <textarea
              rows={3}
              placeholder="Introduce yourself and explain why you're the best fit..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm resize-none"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Offer</>}
          </button>
        </form>
      </div>
    </div>
  );
}
