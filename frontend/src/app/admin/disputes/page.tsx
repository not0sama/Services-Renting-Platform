"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, CheckCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";

interface Dispute {
  id: number;
  booking_id: number;
  opened_by_user_id: number;
  reason: string;
  status: string;
  admin_notes: string | null;
  opened_at: string;
  resolved_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-red-100 text-red-700",
  under_review: "bg-amber-100 text-amber-700",
  resolved_refund: "bg-blue-100 text-blue-700",
  resolved_release: "bg-emerald-100 text-emerald-700",
  resolved_warning: "bg-purple-100 text-purple-700",
  closed: "bg-gray-100 text-gray-600",
};

const RESOLUTION_OPTIONS = [
  { value: "resolved_refund", label: "Refund customer" },
  { value: "resolved_release", label: "Release to provider" },
  { value: "resolved_warning", label: "Issue warning (no payment action)" },
];

function DisputeRow({ dispute, onResolved }: { dispute: Dispute; onResolved: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [resolution, setResolution] = useState("resolved_release");
  const [notes, setNotes] = useState("");
  const [resolving, setResolving] = useState(false);

  const resolve = async () => {
    if (!notes.trim()) return;
    setResolving(true);
    try {
      await api.patch(`/disputes/${dispute.id}/resolve`, { resolution, admin_notes: notes });
      onResolved();
    } finally {
      setResolving(false);
    }
  };

  const isOpen = ["open", "under_review"].includes(dispute.status);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(p => !p)}>
        <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${isOpen ? "text-red-500" : "text-gray-300"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-semibold text-gray-900">Booking #{dispute.booking_id}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[dispute.status] ?? "bg-gray-100 text-gray-600"}`}>
              {dispute.status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="text-xs text-gray-500 truncate">{dispute.reason}</p>
          <p className="text-xs text-gray-400 mt-0.5">{new Date(dispute.opened_at).toLocaleDateString()}</p>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-4 bg-gray-50 space-y-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">Full Reason</p>
            <p className="text-sm text-gray-800">{dispute.reason}</p>
          </div>

          {!isOpen ? (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Admin Notes</p>
              <p className="text-sm text-gray-700">{dispute.admin_notes ?? "—"}</p>
              {dispute.resolved_at && <p className="text-xs text-gray-400 mt-1">Resolved {new Date(dispute.resolved_at).toLocaleDateString()}</p>}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Resolution Action</label>
                <div className="space-y-1.5">
                  {RESOLUTION_OPTIONS.map(opt => (
                    <label key={opt.value} className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all text-sm ${resolution === opt.value ? "border-violet-300 bg-violet-50" : "border-gray-200"}`}>
                      <input type="radio" name={`res-${dispute.id}`} value={opt.value} checked={resolution === opt.value} onChange={() => setResolution(opt.value)} />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Admin Notes (required)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Explain your resolution decision..." className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none" />
              </div>
              <button onClick={resolve} disabled={resolving || !notes.trim()} className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Resolve Dispute
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    const params = filter ? `?dispute_status=${filter}` : "";
    api.get<Dispute[]>(`/disputes${params}`)
      .then(r => setDisputes(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" /> Disputes
        </h1>
        <span className="text-sm text-gray-400">{disputes.length} dispute{disputes.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto">
        {[
          { label: "All", value: null },
          { label: "Open", value: "open" },
          { label: "Under Review", value: "under_review" },
          { label: "Resolved", value: "resolved_release" },
        ].map(tab => (
          <button key={tab.label} onClick={() => setFilter(tab.value)}
            className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${filter === tab.value ? "bg-violet-600 text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No disputes found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map(d => <DisputeRow key={d.id} dispute={d} onResolved={load} />)}
        </div>
      )}
    </div>
  );
}
