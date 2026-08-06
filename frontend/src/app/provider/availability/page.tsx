"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Plus, X, Check } from "lucide-react";
import api from "@/lib/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface AvailabilitySlot {
  id: number;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  is_blocked: boolean;
  blocked_date?: string;
}

function timeToDisplay(t: string) {
  // "HH:MM:SS" → "HH:MM"
  return t ? t.slice(0, 5) : "";
}

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<Record<number, { start: string; end: string; enabled: boolean }>>({});
  const [blockedDate, setBlockedDate] = useState("");
  const [blockingDate, setBlockingDate] = useState(false);

  const load = () => {
    setLoading(true);
    api.get<AvailabilitySlot[]>("/services/availability/my")
      .then((r) => {
        setSlots(r.data);
        // Build schedule from slots
        const sched: Record<number, { start: string; end: string; enabled: boolean }> = {};
        DAYS.forEach((_, i) => { sched[i] = { start: "09:00", end: "18:00", enabled: false }; });
        r.data.filter(s => !s.is_blocked && s.day_of_week !== undefined && s.day_of_week !== null).forEach(s => {
          sched[s.day_of_week!] = { start: timeToDisplay(s.start_time ?? "09:00"), end: timeToDisplay(s.end_time ?? "18:00"), enabled: true };
        });
        setSchedule(sched);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const saveDay = async (dow: number) => {
    setSaving(dow);
    try {
      const d = schedule[dow];
      await api.post("/services/availability", {
        day_of_week: dow,
        start_time: d.start + ":00",
        end_time: d.end + ":00",
        is_blocked: false,
      });
    } finally {
      setSaving(null);
    }
  };

  const blockDate = async () => {
    if (!blockedDate) return;
    setBlockingDate(true);
    try {
      await api.post("/services/availability", { is_blocked: true, blocked_date: blockedDate });
      setBlockedDate("");
      load();
    } finally {
      setBlockingDate(false);
    }
  };

  const blockedDates = slots.filter(s => s.is_blocked && s.blocked_date);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-violet-600" /> Availability
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Set your weekly working hours</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          {DAYS.map((day, dow) => {
            const d = schedule[dow] ?? { start: "09:00", end: "18:00", enabled: false };
            return (
              <div key={dow} className={`flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 ${d.enabled ? "" : "opacity-50"}`}>
                <label className="relative inline-flex items-center cursor-pointer w-10 flex-shrink-0">
                  <input type="checkbox" checked={d.enabled} onChange={e => setSchedule(p => ({ ...p, [dow]: { ...p[dow], enabled: e.target.checked } }))} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-checked:bg-violet-600 rounded-full peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
                </label>
                <span className="font-medium text-gray-800 w-24 text-sm">{day}</span>
                <input type="time" value={d.start} disabled={!d.enabled} onChange={e => setSchedule(p => ({ ...p, [dow]: { ...p[dow], start: e.target.value } }))} className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-300 disabled:bg-gray-50" />
                <span className="text-gray-400 text-sm">to</span>
                <input type="time" value={d.end} disabled={!d.enabled} onChange={e => setSchedule(p => ({ ...p, [dow]: { ...p[dow], end: e.target.value } }))} className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-violet-300 disabled:bg-gray-50" />
                {d.enabled && (
                  <button onClick={() => saveDay(dow)} disabled={saving === dow} className="ml-auto text-emerald-600 hover:text-emerald-700 p-1 rounded-lg hover:bg-emerald-50 transition-colors flex-shrink-0">
                    {saving === dow ? <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Block a specific date */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Block a Date</h2>
        <div className="flex gap-2">
          <input type="date" value={blockedDate} onChange={e => setBlockedDate(e.target.value)} className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm" />
          <button onClick={blockDate} disabled={blockingDate || !blockedDate} className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1">
            <Plus className="w-4 h-4" /> Block
          </button>
        </div>
        {blockedDates.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {blockedDates.map(bd => (
              <span key={bd.id} className="flex items-center gap-1.5 text-xs bg-red-50 text-red-600 border border-red-100 px-2.5 py-1 rounded-full">
                {bd.blocked_date}
                <X className="w-3 h-3 cursor-pointer hover:text-red-800" />
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
