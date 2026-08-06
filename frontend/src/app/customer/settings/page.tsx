"use client";

import { useEffect, useState } from "react";
import { Settings, Save, Loader2, Plus, Trash2, MapPin } from "lucide-react";
import api from "@/lib/api";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  language_pref: string;
}

interface Address {
  id: number;
  label: string;
  address_line1: string;
  city: string;
  is_default: boolean;
}

export default function CustomerSettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", language_pref: "en" });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrForm, setAddrForm] = useState({ label: "Home", address_line1: "", city: "", is_default: false });
  const [addingAddr, setAddingAddr] = useState(false);

  const loadAddresses = () => api.get<Address[]>("/users/me/addresses").then(r => setAddresses(r.data));

  useEffect(() => {
    Promise.all([
      api.get<UserProfile>("/users/me/profile"),
      api.get<Address[]>("/users/me/addresses"),
    ]).then(([uRes, aRes]) => {
      setUser(uRes.data);
      setAddresses(aRes.data);
      setForm({ name: uRes.data.name, phone: uRes.data.phone ?? "", language_pref: uRes.data.language_pref ?? "en" });
    }).finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/users/me/profile", form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingAddr(true);
    try {
      await api.post("/users/me/addresses", addrForm);
      setShowAddAddress(false);
      setAddrForm({ label: "Home", address_line1: "", city: "", is_default: false });
      await loadAddresses();
    } finally {
      setAddingAddr(false);
    }
  };

  const deleteAddress = async (id: number) => {
    await api.delete(`/users/me/addresses/${id}`);
    await loadAddresses();
  };

  if (loading) return <div className="max-w-xl mx-auto px-4 py-8"><div className="h-80 bg-gray-100 rounded-2xl animate-pulse" /></div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6 text-violet-600" /> Settings
      </h1>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Profile Information</h2>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" disabled value={user?.email ?? ""} className="w-full px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+966 5XX XXX XXXX" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select value={form.language_pref} onChange={e => setForm(p => ({ ...p, language_pref: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm bg-white">
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
          <button type="submit" disabled={saving} className="w-full btn-primary py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 text-sm">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : saved ? "✅ Saved!" : <><Save className="w-4 h-4" />Save Profile</>}
          </button>
        </form>
      </div>

      {/* Addresses */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Saved Addresses</h2>
          <button onClick={() => setShowAddAddress(p => !p)} className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 font-medium">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {showAddAddress && (
          <form onSubmit={addAddress} className="space-y-3 mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                <input type="text" value={addrForm.label} onChange={e => setAddrForm(p => ({ ...p, label: e.target.value }))} placeholder="Home / Work" className="w-full px-2.5 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-300 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                <input type="text" value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))} placeholder="Riyadh" className="w-full px-2.5 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-300 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
              <input type="text" required value={addrForm.address_line1} onChange={e => setAddrForm(p => ({ ...p, address_line1: e.target.value }))} placeholder="Street, building, district..." className="w-full px-2.5 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-violet-300 text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={addrForm.is_default} onChange={e => setAddrForm(p => ({ ...p, is_default: e.target.checked }))} className="rounded" />
              Set as default address
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowAddAddress(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600">Cancel</button>
              <button type="submit" disabled={addingAddr} className="flex-1 btn-primary py-2 rounded-lg text-sm font-semibold">{addingAddr ? "Saving..." : "Add Address"}</button>
            </div>
          </form>
        )}

        {addresses.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No saved addresses</p>
        ) : (
          <div className="space-y-2">
            {addresses.map(a => (
              <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl border ${a.is_default ? "border-violet-200 bg-violet-50" : "border-gray-100"}`}>
                <MapPin className={`w-4 h-4 flex-shrink-0 ${a.is_default ? "text-violet-600" : "text-gray-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{a.label}</span>
                    {a.is_default && <span className="text-[10px] bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full font-semibold">Default</span>}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{a.address_line1}, {a.city}</p>
                </div>
                <button onClick={() => deleteAddress(a.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
