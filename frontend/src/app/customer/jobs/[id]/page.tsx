"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Clock, DollarSign, Loader2, Sparkles, AlertTriangle, Star } from "lucide-react";
import api from "@/lib/api";

interface Offer {
  id: number;
  job_id: number;
  provider_id: number;
  price: number;
  duration_minutes: number;
  message?: string;
  urgent_surcharge_pct?: number;
  status: string;
  best_match_score?: number;
  provider_name?: string;
  provider_rating?: number;
  provider_tier?: string;
  provider_avatar?: string;
  distance_km?: number;
}

interface Job {
  id: number;
  title: string;
  description: string;
  is_urgent: boolean;
  urgent_surcharge_pct: number;
  status: string;
}

export default function JobOffersPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Job>(`/jobs/${id}`),
      api.get<Offer[]>(`/jobs/${id}/offers`),
    ])
      .then(([jRes, oRes]) => {
        setJob(jRes.data);
        setOffers(oRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAccept = async (offerId: number) => {
    setAcceptingId(offerId);
    setError(null);
    try {
      const res = await api.post(`/jobs/${id}/offers/${offerId}/accept`);
      // Redirect to the newly created booking checkout or details
      router.push(`/customer/checkout/${res.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to accept offer.");
      setAcceptingId(null);
    }
  };

  if (loading) {
    return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-600" /></div>;
  }

  if (!job) return <div className="p-8 text-center">Job not found.</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-sm text-gray-500 mt-2">{job.description}</p>
          </div>
          <span className={`text-xs font-semibold capitalize px-2.5 py-1 rounded-full ${
            job.status === "open" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700"
          }`}>
            {job.status.replace("_", " ")}
          </span>
        </div>
        {job.is_urgent && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
            <AlertTriangle className="w-4 h-4" />
            Urgent Job: You requested a {job.urgent_surcharge_pct}% premium for faster service.
          </div>
        )}
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">
        {offers.length} {offers.length === 1 ? "Offer" : "Offers"} Received
      </h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {offers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500">No offers yet. Providers will be notified soon.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer, index) => {
            const isBestMatch = index === 0 && offer.best_match_score && offer.best_match_score > 0;
            
            // Calculate final price with negotiated urgent surcharge
            const surchargePct = offer.urgent_surcharge_pct || 0;
            const surchargeAmount = job.is_urgent ? (offer.price * (surchargePct / 100)) : 0;
            const finalPrice = offer.price + surchargeAmount;

            return (
              <div key={offer.id} className={`bg-white rounded-2xl border ${isBestMatch ? 'border-violet-200 shadow-md' : 'border-gray-100 shadow-sm'} p-6 transition-all`}>
                {isBestMatch && (
                  <div className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> AI Best Match
                  </div>
                )}
                
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    {offer.provider_avatar ? (
                      <img src={offer.provider_avatar} alt="" className="w-12 h-12 rounded-xl object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white font-bold">
                        {offer.provider_name?.[0] ?? "P"}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900">{offer.provider_name}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-current" /> {offer.provider_rating?.toFixed(1) ?? "New"}</span>
                        <span>·</span>
                        <span className="capitalize">{offer.provider_tier ?? "Bronze"}</span>
                        {offer.distance_km !== undefined && (
                          <>
                            <span>·</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {offer.distance_km} km</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">SAR {finalPrice.toFixed(0)}</div>
                    {job.is_urgent && surchargePct > 0 && (
                      <div className="text-xs text-red-500 mt-0.5">
                        Includes {surchargePct}% urgent premium (SAR {surchargeAmount.toFixed(0)})
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-1 text-sm text-gray-500 mt-1">
                      <Clock className="w-3.5 h-3.5" /> {offer.duration_minutes} min
                    </div>
                  </div>
                </div>

                {offer.message && (
                  <div className="mt-4 bg-gray-50 rounded-xl p-3 text-sm text-gray-600">
                    "{offer.message}"
                  </div>
                )}

                <div className="mt-5 pt-5 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => handleAccept(offer.id)}
                    disabled={acceptingId !== null || job.status !== "open"}
                    className="btn-primary py-2 px-6 rounded-xl font-semibold flex items-center gap-2"
                  >
                    {acceptingId === offer.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Accepting...</>
                    ) : (
                      "Accept & Checkout"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
