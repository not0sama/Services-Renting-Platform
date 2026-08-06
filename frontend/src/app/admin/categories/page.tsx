"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import api from "@/lib/api";

interface Category {
  id: number;
  name_en: string;
  name_ar?: string;
  slug: string;
  booking_mode: string;
  commission_rate: number;
  is_active: boolean;
  parent_id?: number;
  children?: Category[];
}

function CategoryRow({ cat, depth = 0, onEdit, onDelete }: { cat: Category; depth?: number; onEdit: (c: Category) => void; onDelete: (id: number) => void }) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = cat.children && cat.children.length > 0;
  return (
    <>
      <tr className="hover:bg-gray-50/50 transition-colors">
        <td className="px-5 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
            {hasChildren ? (
              <button onClick={() => setExpanded(p => !p)} className="text-gray-400 hover:text-gray-600">
                {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : <span className="w-4" />}
            <span className="text-sm font-medium text-gray-900">{cat.name_en}</span>
            {!cat.is_active && <span className="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full">Inactive</span>}
          </div>
        </td>
        <td className="px-5 py-3 text-sm text-gray-500">{cat.slug}</td>
        <td className="px-5 py-3">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${
            cat.booking_mode === "instant" ? "bg-blue-50 text-blue-700" :
            cat.booking_mode === "quote" ? "bg-amber-50 text-amber-700" :
            "bg-violet-50 text-violet-700"
          }`}>{cat.booking_mode}</span>
        </td>
        <td className="px-5 py-3 text-sm text-gray-500">{cat.commission_rate}%</td>
        <td className="px-5 py-3">
          <div className="flex gap-2">
            <button onClick={() => onEdit(cat)} className="text-gray-400 hover:text-violet-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
            <button onClick={() => onDelete(cat.id)} className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        </td>
      </tr>
      {expanded && hasChildren && cat.children!.map(child => (
        <CategoryRow key={child.id} cat={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </>
  );
}

const BLANK = { id: 0, name_en: "", name_ar: "", slug: "", booking_mode: "both", commission_rate: 15, is_active: true, parent_id: undefined as number | undefined };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...BLANK });
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.get<Category[]>("/categories").then(r => setCategories(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ ...BLANK }); setEditing(false); setShowForm(true); };
  const openEdit = (c: Category) => { setForm({ ...BLANK, ...c }); setEditing(true); setShowForm(true); };
  const doDelete = async (id: number) => { if (!confirm("Delete this category?")) return; await api.delete(`/categories/${id}`); load(); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.patch(`/categories/${form.id}`, form);
      } else {
        await api.post("/categories", form);
      }
      setShowForm(false);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  const allFlat: Category[] = [];
  const flatten = (cats: Category[]) => cats.forEach(c => { allFlat.push(c); if (c.children) flatten(c.children); });
  flatten(categories);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{editing ? "Edit Category" : "New Category"}</h2>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name (EN) *</label>
                  <input required type="text" value={form.name_en} onChange={e => setForm(p => ({ ...p, name_en: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name (AR)</label>
                  <input type="text" value={form.name_ar ?? ""} onChange={e => setForm(p => ({ ...p, name_ar: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm" dir="rtl" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label>
                <input required type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Booking Mode</label>
                  <select value={form.booking_mode} onChange={e => setForm(p => ({ ...p, booking_mode: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm bg-white">
                    <option value="instant">Instant Only</option>
                    <option value="quote">Quote Only</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Commission %</label>
                  <input type="number" min="0" max="50" value={form.commission_rate} onChange={e => setForm(p => ({ ...p, commission_rate: parseFloat(e.target.value) }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Parent Category (optional)</label>
                <select value={form.parent_id ?? ""} onChange={e => setForm(p => ({ ...p, parent_id: e.target.value ? parseInt(e.target.value) : undefined }))} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm bg-white">
                  <option value="">None (root)</option>
                  {allFlat.filter(c => c.id !== form.id).map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 text-sm">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 btn-primary py-2.5 rounded-xl font-semibold text-sm">{submitting ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Slug</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Mode</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Commission</th>
              <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-5 py-3"><div className="h-5 bg-gray-100 rounded animate-pulse" /></td></tr>
              ))
            ) : (
              categories.map(cat => (
                <CategoryRow key={cat.id} cat={cat} onEdit={openEdit} onDelete={doDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
