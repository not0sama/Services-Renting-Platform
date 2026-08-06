"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, Upload, Loader2, ArrowLeft } from "lucide-react";
import api from "@/lib/api";

const REASONS = [
  "Provider did not complete the work as agreed",
  "Provider did not show up for the appointment",
  "Work quality is unacceptable / dangerous",
  "Provider demanded extra payment not agreed upon",
  "Provider was abusive or unprofessional",
  "Other",
];

export default function DisputePage() {
  const { id: bookingId } = useParams<{ id: string }>();
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReason) return;
    setSubmitting(true);
    setError(null);
    try {
      const reason = selectedReason === "Other" ? details : `${selectedReason}${details ? ` — ${details}` : ""}`;
      await api.post(`/disputes/bookings/${bookingId}/open`, { reason, evidence_urls: [] });
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to open dispute. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-9 h-9 text-red-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Dispute Submitted</h2>
      <p className="text-gray-500 mb-6">Our team will review your case within 48 hours. Payment is now frozen pending resolution.</p>
      <button onClick={() => router.push(`/customer/bookings/${bookingId}`)} className="btn-primary px-6 py-2.5 rounded-xl font-semibold text-sm">
        Back to Booking
      </button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Open a Dispute</h1>
          <p className="text-sm text-gray-500">Booking #{bookingId}</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 mb-6 text-sm text-amber-800">
        <strong>Before opening a dispute</strong>, try requesting a revision first. Disputes freeze payment and involve admin review.
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What is the issue?</label>
          <div className="space-y-2">
            {REASONS.map(r => (
              <label key={r} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedReason === r ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                <input type="radio" name="reason" value={r} checked={selectedReason === r} onChange={() => setSelectedReason(r)} className="text-red-600" />
                <span className="text-sm text-gray-700">{r}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {selectedReason === "Other" ? "Please describe the issue *" : "Additional details (optional)"}
          </label>
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            rows={4}
            required={selectedReason === "Other"}
            placeholder="Provide specific details that will help us resolve the dispute..."
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !selectedReason || (selectedReason === "Other" && !details.trim())}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
        >
          {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting...</> : "Submit Dispute"}
        </button>
      </form>
    </div>
  );
}
