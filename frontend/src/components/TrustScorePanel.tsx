"use client";

import { Shield } from "lucide-react";
import TierBadge from "./TierBadge";

interface ReputationData {
  trust_score: number;
  tier: string;
  avg_rating: number;
  on_time_rate?: number;
  completion_rate?: number;
  cancellation_rate?: number;
  avg_response_minutes?: number;
}

interface TrustScorePanelProps {
  data: ReputationData;
}

function MetricBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-medium text-gray-700">{pct}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function TrustScorePanel({ data }: TrustScorePanelProps) {
  const score = Math.round(data.trust_score ?? 0);
  const scoreColor =
    score >= 85 ? "text-cyan-600" :
    score >= 70 ? "text-amber-600" :
    score >= 50 ? "text-gray-500" : "text-orange-600";

  // Ring progress
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-violet-600" />
        <h3 className="font-semibold text-gray-900">Trust Score</h3>
        {data.tier && <TierBadge tier={data.tier} size="sm" />}
      </div>

      <div className="flex items-center gap-6 mb-5">
        {/* Circular score */}
        <div className="relative flex-shrink-0">
          <svg width="88" height="88" className="-rotate-90">
            <circle cx="44" cy="44" r="36" fill="none" stroke="#f3f4f6" strokeWidth="8" />
            <circle
              cx="44" cy="44" r="36"
              fill="none"
              stroke={score >= 85 ? "#06b6d4" : score >= 70 ? "#f59e0b" : score >= 50 ? "#9ca3af" : "#f97316"}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${scoreColor}`}>{score}</span>
          </div>
        </div>

        {/* Sub-metrics */}
        <div className="flex-1 space-y-2.5">
          <MetricBar label="Rating" value={Math.min((data.avg_rating ?? 0) / 5, 1)} color="bg-amber-400" />
          <MetricBar label="On-time rate" value={data.on_time_rate ?? 0.5} color="bg-blue-400" />
          <MetricBar label="Completion" value={data.completion_rate ?? 0.5} color="bg-emerald-400" />
          <MetricBar label="Low cancellations" value={1 - (data.cancellation_rate ?? 0)} color="bg-violet-400" />
        </div>
      </div>

      <div className="text-xs text-gray-400 border-t border-gray-50 pt-3">
        Trust score is calculated from rating, punctuality, job completion rate, and cancellation history.
      </div>
    </div>
  );
}
