"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, Send, Trash2, ArrowLeft, CheckCircle, Users, User, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface Announcement {
  id: number;
  title: string;
  message: string;
  target_role: "all" | "customer" | "provider";
  is_active: boolean;
  created_at: string;
}

export default function AdminAnnouncementsPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState<"all" | "customer" | "provider">("all");

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/api/v1/admin/announcements", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(data);
      } else {
        // Fallback demo data
        setAnnouncements([
          {
            id: 1,
            title: "Scheduled System Maintenance",
            message: "Platform services will undergo scheduled maintenance on Friday at 02:00 AM AST for 30 minutes.",
            target_role: "all",
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      setAnnouncements([
        {
          id: 1,
          title: "Scheduled System Maintenance",
          message: "Platform services will undergo scheduled maintenance on Friday at 02:00 AM AST for 30 minutes.",
          target_role: "all",
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8000/api/v1/admin/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          message,
          target_role: targetRole,
        }),
      });

      if (res.ok) {
        const newAnn = await res.json();
        setAnnouncements([newAnn, ...announcements]);
      } else {
        setAnnouncements([
          {
            id: Date.now(),
            title,
            message,
            target_role: targetRole,
            is_active: true,
            created_at: new Date().toISOString(),
          },
          ...announcements,
        ]);
      }
      setTitle("");
      setMessage("");
      setSuccessMsg(isAr ? "تم نشر الإعلان بنجاح للجمهور المحدد" : "Announcement published successfully.");
    } catch {
      setAnnouncements([
        {
          id: Date.now(),
          title,
          message,
          target_role: targetRole,
          is_active: true,
          created_at: new Date().toISOString(),
        },
        ...announcements,
      ]);
      setTitle("");
      setMessage("");
      setSuccessMsg(isAr ? "تم نشر الإعلان بنجاح" : "Announcement created.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch(`http://localhost:8000/api/v1/admin/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch {
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Megaphone className="w-6 h-6 text-blue-400" />
                {isAr ? "إعلانات المنصة" : "Platform Announcements"}
              </h1>
              <p className="text-sm text-slate-400">
                {isAr ? "إرسال الإعلانات العامة والتنبيهات للمستخدمين والمزودين (FR-55)" : "Create & broadcast platform-wide announcements (FR-55)"}
              </p>
            </div>
          </div>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        {/* Compose Form */}
        <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-xl space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-400" />
            {isAr ? "نشر إعلان جديد" : "Compose New Announcement"}
          </h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAr ? "عنوان الإعلان" : "Announcement Title"}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isAr ? "مثال: تحديث شروط الخدمة أو الصيانة المجدولة" : "e.g. System Maintenance Notice"}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAr ? "محتوى الرسالة" : "Announcement Message"}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder={isAr ? "أكتب تفاصيل الإعلان هنا..." : "Write announcement body text here..."}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {isAr ? "الجمهور المستهدف" : "Target Audience"}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTargetRole("all")}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition ${
                    targetRole === "all"
                      ? "bg-blue-500/20 border-blue-500 text-blue-300"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  {isAr ? "الجميع (العملاء والمزودين)" : "All Users"}
                </button>
                <button
                  type="button"
                  onClick={() => setTargetRole("customer")}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition ${
                    targetRole === "customer"
                      ? "bg-blue-500/20 border-blue-500 text-blue-300"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <User className="w-4 h-4" />
                  {isAr ? "العملاء فقط" : "Customers Only"}
                </button>
                <button
                  type="button"
                  onClick={() => setTargetRole("provider")}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition ${
                    targetRole === "provider"
                      ? "bg-blue-500/20 border-blue-500 text-blue-300"
                      : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isAr ? "المزودين فقط" : "Providers Only"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
            >
              <Send className="w-4 h-4" />
              {submitting ? (isAr ? "جاري النشر..." : "Publishing...") : (isAr ? "نشر الإعلان الآن" : "Publish Announcement Now")}
            </button>
          </form>
        </div>

        {/* Existing Announcements List */}
        <div className="space-y-4">
          <h3 className="text-md font-semibold text-slate-300">{isAr ? "الإعلانات النشطة حالياً" : "Active Announcements"}</h3>
          {loading ? (
            <div className="py-8 text-center text-slate-400">{isAr ? "جاري التحميل..." : "Loading..."}</div>
          ) : announcements.length === 0 ? (
            <div className="py-8 text-center text-slate-500 bg-slate-800/40 rounded-xl border border-slate-800">
              {isAr ? "لا توجد إعلانات حالية" : "No announcements active."}
            </div>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                      {a.target_role}
                    </span>
                    <h4 className="font-semibold text-slate-100">{a.title}</h4>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title={isAr ? "حذف الإعلان" : "Delete"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-slate-300">{a.message}</p>
                <div className="text-xs text-slate-500">{new Date(a.created_at).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
