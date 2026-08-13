"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Package, DollarSign, Clock, ToggleLeft, ToggleRight } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Service {
  id: number;
  category_id: number;
  title: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

interface Category {
  id: number;
  name_en: string;
}

export default function ProviderServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ category_id: "", title: "", description: "", price: "", duration_minutes: "60" });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get<Service[]>("/services/my"),
      api.get<any[]>("/categories"),
    ]).then(([sRes, cRes]) => {
      setServices(sRes.data);
      const flat: Category[] = [];
      const flatten = (cats: any[]) => cats.forEach(c => { flat.push(c); if (c.children) flatten(c.children); });
      flatten(cRes.data);
      setCategories(flat);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ category_id: "", title: "", description: "", price: "", duration_minutes: "60" }); setShowForm(true); };
  const openEdit = (s: Service) => { setEditing(s); setForm({ category_id: String(s.category_id), title: s.title, description: s.description ?? "", price: String(s.price), duration_minutes: String(s.duration_minutes) }); setShowForm(true); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { category_id: parseInt(form.category_id), title: form.title, description: form.description || undefined, price: parseFloat(form.price), duration_minutes: parseInt(form.duration_minutes) };
      if (editing) {
        await api.patch(`/services/${editing.id}`, payload);
      } else {
        await api.post("/services", payload);
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to save service.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (s: Service) => {
    try {
      await api.patch(`/services/${s.id}`, { is_active: !s.is_active });
      toast.success(s.is_active ? "Service deactivated" : "Service activated!");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to update service status.");
    }
  };

  const remove = async (s: Service) => {
    if (!confirm("Delete this service?")) return;
    try {
      await api.delete(`/services/${s.id}`);
      toast.success("Service deleted successfully.");
      load();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to delete service.");
    }
  };

  const catName = (id: number) => categories.find(c => c.id === id)?.name_en ?? "—";

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your Instant Book packages</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? "Edit Service" : "Add New Service"}</h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select required value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm bg-white">
                  <option value="">Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Basic Plumbing Fix" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (LYD) *</label>
                  <input required type="number" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min) *</label>
                  <input required type="number" min="15" value={form.duration_minutes} onChange={e => setForm(p => ({ ...p, duration_minutes: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 text-sm">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary py-2.5 rounded-xl font-semibold text-sm">{submitting ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Services List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No services yet</p>
          <p className="text-sm mt-1">Add your first service package to start receiving Instant Book requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(s => (
            <div key={s.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${!s.is_active ? "opacity-60" : "border-gray-100"}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{s.title}</h3>
                    {!s.is_active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
                  </div>
                  <p className="text-xs text-violet-600 font-medium mt-0.5">{catName(s.category_id)}</p>
                  {s.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{s.description}</p>}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="flex items-center gap-1 text-gray-700 font-semibold"><DollarSign className="w-3.5 h-3.5 text-violet-500" />LYD {s.price.toFixed(0)}</span>
                    <span className="flex items-center gap-1 text-gray-500"><Clock className="w-3.5 h-3.5" />{s.duration_minutes} min</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button onClick={() => toggleActive(s)} className="text-gray-400 hover:text-violet-600 transition-colors" title={s.is_active ? "Deactivate" : "Activate"}>
                    {s.is_active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-violet-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => remove(s)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
