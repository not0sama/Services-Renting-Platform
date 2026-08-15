"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Clock, Star, CheckCircle, ShieldCheck, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import PaymentModal from "@/components/PaymentModal";

interface Offer {
  id: number;
  provider_id: number;
  price: number;
  duration_minutes: number;
  message?: string;
  urgent_surcharge_pct?: number;
  status: string;
  provider_name?: string;
  provider_rating?: number;
  provider_completed_jobs?: number;
}

interface Job {
  id: number;
  title: string;
  description?: string;
  status: string;
  is_urgent: boolean;
  budget_min?: number;
  budget_max?: number;
}

export default function JobOffersPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedOfferForPayment, setSelectedOfferForPayment] = useState<Offer | null>(null);

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

  const handleConfirmPayment = async (method: "cash" | "transfer" | "card") => {
    if (!selectedOfferForPayment) return;
    const offer = selectedOfferForPayment;
    setAcceptingId(offer.id);
    setError(null);

    try {
      const res = await api.post(`/jobs/${id}/offers/${offer.id}/accept?payment_method=${method}`);
      const bookingId = res.data.id;

      if (method === "card") {
        toast.success("Offer accepted! Redirecting to checkout page...");
        router.push(`/customer/checkout/${bookingId}`);
      } else {
        const label = method === "cash" ? "Cash on Delivery" : "Bank Transfer";
        toast.success(`Offer accepted! Booking confirmed with ${label}.`);
        router.push(`/customer/bookings`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to accept offer.");
      toast.error(err?.response?.data?.error || "Failed to accept offer.");
    } finally {
      setAcceptingId(null);
      setSelectedOfferForPayment(null);
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

        {(job.budget_min || job.budget_max) && (
          <div className="mt-4 pt-4 border-t border-gray-100 text-sm font-medium text-gray-600">
            Budget Range: LYD {job.budget_min ?? 0} - LYD {job.budget_max ?? "Any"}
          </div>
        )}
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Received Offers ({offers.length})
      </h2>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
          {error}
        </div>
      )}

      {offers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-gray-400">
          No offers submitted yet. Providers near you are reviewing your post.
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => {
            const surchargePct = offer.urgent_surcharge_pct ?? 0;
            const surchargeAmount = job.is_urgent && surchargePct ? offer.price * (surchargePct / 100) : 0;
            const finalTotal = offer.price + surchargeAmount;

            return (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 transition-all hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {offer.provider_name ?? `Provider #${offer.provider_id}`}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      {offer.provider_rating && (
                        <span className="flex items-center gap-1 text-amber-500 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {offer.provider_rating.toFixed(1)}
                        </span>
                      )}
                      {offer.provider_completed_jobs !== undefined && (
                        <span>{offer.provider_completed_jobs} jobs done</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-violet-600">
                      LYD {finalTotal.toFixed(2)}
                    </div>
                    {job.is_urgent && surchargePct > 0 && (
                      <div className="text-xs text-red-500 mt-0.5">
                        Includes {surchargePct}% urgent premium (LYD {surchargeAmount.toFixed(0)})
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
                    onClick={() => setSelectedOfferForPayment(offer)}
                    disabled={acceptingId !== null || job.status !== "open"}
                    className="btn-primary py-2 px-6 rounded-xl font-semibold flex items-center gap-2"
                  >
                    {acceptingId === offer.id ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Accepting...</>
                    ) : (
                      "Accept Offer"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Selection Modal */}
      <PaymentModal
        isOpen={selectedOfferForPayment !== null}
        onClose={() => setSelectedOfferForPayment(null)}
        onConfirm={handleConfirmPayment}
        title="Accept Offer & Select Payment"
        amount={selectedOfferForPayment ? selectedOfferForPayment.price : undefined}
        submitting={acceptingId !== null}
      />
    </div>
  );
}
