"use client";

import { useEffect, useState } from "react";
import { User, Save, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import api from "@/lib/api";

interface Profile {
  id: number;
  bio?: string;
  city?: string;
  country?: string;
  years_experience: number;
  service_radius_km: number;
  is_online: boolean;
  verification_status: string;
  avg_rating: number;
  completed_jobs_count: number;
  trust_score: number;
}

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  language_pref: string;
}

export default function ProviderProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", bio: "", city: "", country: "", years_experience: 0, service_radius_km: 20 });

  useEffect(() => {
    Promise.all([
      api.get<UserProfile>("/users/me/profile"),
      api.get<Profile>("/providers/me/profile"),
    ]).then(([uRes, pRes]) => {
      setUser(uRes.data);
      setProfile(pRes.data);
      setForm({
        name: uRes.data.name,
        phone: uRes.data.phone ?? "",
        bio: pRes.data.bio ?? "",
        city: pRes.data.city ?? "",
        country: pRes.data.country ?? "",
        years_experience: pRes.data.years_experience,
        service_radius_km: pRes.data.service_radius_km,
      });
    }).finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await Promise.all([
        api.patch("/users/me/profile", { name: form.name, phone: form.phone || undefined }),
        api.post("/providers/onboarding/step/1", { bio: form.bio, city: form.city, country: form.country, years_experience: form.years_experience }),
        api.post("/providers/onboarding/step/3", { service_radius_km: form.service_radius_km, latitude: profile?.id ? 24.7136 : 24.7136, longitude: 46.6753 }),
      ]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const toggleOnline = async () => {
    const newStatus = !profile?.is_online;
    await api.patch("/providers/me/online-status", { is_online: newStatus });
    setProfile(p => p ? { ...p, is_online: newStatus } : p);
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8"><div className="h-96 bg-gray-100 rounded-2xl animate-pulse" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <User className="w-6 h-6 text-violet-600" /> My Profile
      </h1>

      {/* Online toggle */}
      <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Online Status</p>
          <p className="text-sm text-gray-500">{profile?.is_online ? "You are visible to customers" : "You are currently hidden"}</p>
        </div>
        <button onClick={toggleOnline} className="text-gray-400 hover:text-violet-600 transition-colors">
          {profile?.is_online ? <ToggleRight className="w-9 h-9 text-emerald-500" /> : <ToggleLeft className="w-9 h-9" />}
        </button>
      </div>

      {/* Stats */}
      {profile && (
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-violet-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-violet-700">{profile.avg_rating.toFixed(1)}</p>
            <p className="text-xs text-violet-600">Avg Rating</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-emerald-700">{profile.completed_jobs_count}</p>
            <p className="text-xs text-emerald-600">Jobs Done</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-bold text-blue-700">{profile.trust_score.toFixed(0)}</p>
            <p className="text-xs text-blue-600">Trust Score</p>
          </div>
        </div>
      )}

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <form onSubmit={save} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea rows={3} value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years Experience</label>
              <input type="number" min="0" value={form.years_experience} onChange={e => setForm(p => ({ ...p, years_experience: parseInt(e.target.value) }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Radius: {form.service_radius_km} km</label>
            <input type="range" min="5" max="100" step="5" value={form.service_radius_km} onChange={e => setForm(p => ({ ...p, service_radius_km: parseInt(e.target.value) }))} className="w-full" />
          </div>
          <button type="submit" disabled={saving} className="w-full btn-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : saved ? "✅ Saved!" : <><Save className="w-4 h-4" />Save Changes</>}
          </button>
        </form>
      </div>
    </div>
  );
}
