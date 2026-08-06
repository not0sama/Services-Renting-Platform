"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, FileText } from "lucide-react";
import api from "@/lib/api";

interface ProviderProfile {
  id: number;
  user_id: number;
  bio?: string;
  city?: string;
  verification_status: string;
  avg_rating: number;
  created_at: string;
}

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.get<ProviderProfile[]>("/admin/providers/pending")
      .then((r) => setProviders(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const decide = async (profileId: number, approve: boolean, notes?: string) => {
    setActing(profileId);
    try {
      await api.post(`/admin/providers/${profileId}/verify`, {
        status: approve ? "approved" : "rejected",
        notes,
      });
      load();
    } finally {
      setActing(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Provider Approval Queue</h1>
      <p className="text-gray-500 text-sm mb-6">Review and approve or reject provider verification requests</p>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {providers.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-gray-900">Provider #{p.id}</p>
                  <p className="text-sm text-gray-500">{p.city ?? "No city set"}</p>
                  {p.bio && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.bio}</p>}
                </div>
                <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full font-medium">
                  Pending
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={acting === p.id}
                  onClick={() => decide(p.id, true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button
                  disabled={acting === p.id}
                  onClick={() => decide(p.id, false, "Documents insufficient")}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors border border-red-100 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
