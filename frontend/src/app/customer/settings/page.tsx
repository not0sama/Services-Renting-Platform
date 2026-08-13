"use client";

import { useEffect, useState, useRef } from "react";
import {
  Settings,
  Save,
  Loader2,
  Plus,
  Trash2,
  MapPin,
  Edit3,
  CheckCircle2,
  Globe2,
  User,
  Phone,
  Mail,
  AlertTriangle,
  Compass,
  Check,
  X,
  ShieldAlert,
  Upload,
  Camera,
} from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  language_pref: string;
  avatar_url?: string;
}

interface Address {
  id: number;
  label: string;
  full_address: string;
  latitude?: number;
  longitude?: number;
  is_default: boolean;
}

const LIBYAN_CITIES = [
  { en: "Tripoli", ar: "طرابلس", lat: 32.8872, lon: 13.1913 },
  { en: "Benghazi", ar: "بنغازي", lat: 32.1167, lon: 20.0667 },
  { en: "Misrata", ar: "مصراتة", lat: 32.3754, lon: 15.0925 },
  { en: "Zawiya", ar: "الزاوية", lat: 32.7522, lon: 12.7278 },
  { en: "Tobruk", ar: "طبرق", lat: 32.0836, lon: 23.9764 },
  { en: "Sebha", ar: "سبها", lat: 27.0377, lon: 14.4283 },
  { en: "Zliten", ar: "زليتن", lat: 32.4674, lon: 14.5687 },
  { en: "Ghariyan", ar: "غريان", lat: 32.1722, lon: 13.0203 },
  { en: "Derna", ar: "درنة", lat: 32.7670, lon: 22.6367 },
  { en: "Sirte", ar: "سرت", lat: 31.2089, lon: 16.5887 },
  { en: "Al Khums", ar: "الخمس", lat: 32.6486, lon: 14.2619 },
];

const PRESET_AVATARS = [
  {
    id: "customer",
    nameEn: "Customer Profile",
    nameAr: "ملف عميل",
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%236366F1"/><stop offset="100%" stop-color="%238B5CF6"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23g1)"/><circle cx="50" cy="38" r="18" fill="%23FFFFFF" opacity="0.95"/><path d="M22 82 C22 62 34 54 50 54 C66 54 78 62 78 82 Z" fill="%23FFFFFF" opacity="0.95"/></svg>`,
  },
  {
    id: "technician",
    nameEn: "Technician & Craftsman",
    nameAr: "فني وحرفي",
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2310B981"/><stop offset="100%" stop-color="%23059669"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23g2)"/><path d="M35 30 C35 22 65 22 65 30 L68 38 L32 38 Z" fill="%23FBBF24"/><circle cx="50" cy="46" r="14" fill="%23FFFFFF"/><path d="M25 84 C25 66 36 58 50 58 C64 58 75 66 75 84 Z" fill="%23FFFFFF"/><path d="M64 60 L74 70 M70 60 L66 64" stroke="%23FBBF24" stroke-width="4" stroke-linecap="round"/></svg>`,
  },
  {
    id: "home_services",
    nameEn: "Home & Maintenance",
    nameAr: "صيانة ومنازل",
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23F59E0B"/><stop offset="100%" stop-color="%23D97706"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23g3)"/><path d="M50 22 L76 42 L70 42 L70 74 L30 74 L30 42 L24 42 Z" fill="%23FFFFFF"/><path d="M42 52 L58 52 L58 74 L42 74 Z" fill="%23F59E0B"/></svg>`,
  },
  {
    id: "professional",
    nameEn: "Professional Specialist",
    nameAr: "متخصص واحترافي",
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%233B82F6"/><stop offset="100%" stop-color="%231D4ED8"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23g4)"/><circle cx="50" cy="36" r="16" fill="%23FFFFFF"/><path d="M24 82 C24 64 36 54 50 54 C64 54 76 64 76 82 Z" fill="%23FFFFFF"/><path d="M47 54 L53 54 L55 70 L50 76 L45 70 Z" fill="%233B82F6"/></svg>`,
  },
  {
    id: "verified_pro",
    nameEn: "Verified Provider",
    nameAr: "موزّد خدمة معتمد",
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2306B6D4"/><stop offset="100%" stop-color="%230E7490"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23g6)"/><path d="M50 20 L74 30 L74 54 C74 68 50 80 50 80 C50 80 26 68 26 54 L26 30 Z" fill="%23FFFFFF"/><path d="M44 50 L36 42 L40 38 L44 42 L58 28 L62 32 Z" fill="%2306B6D4"/></svg>`,
  },
  {
    id: "logistics",
    nameEn: "Rentals & Logistics",
    nameAr: "تأجير ولوجستيات",
    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23EC4899"/><stop offset="100%" stop-color="%23BE185D"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(%23g5)"/><path d="M50 24 L78 38 L50 52 L22 38 Z" fill="%23FFFFFF"/><path d="M22 42 L50 56 L50 78 L22 64 Z" fill="%23FFFFFF" opacity="0.85"/><path d="M78 42 L50 56 L50 78 L78 64 Z" fill="%23FFFFFF" opacity="0.7"/></svg>`,
  },
];

export default function CustomerSettingsPage() {
  const { lang, setLanguage } = useLanguage();
  const isAr = lang === "ar";

  const [user, setUser] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Profile Form
  const [form, setForm] = useState({
    name: "",
    phone: "",
    language_pref: "en",
    avatar_url: "",
  });

  // Address Form State (Add / Edit)
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState<number | null>(null);
  const [addrForm, setAddrForm] = useState({
    label: "Home",
    city: "Tripoli",
    street_details: "",
    latitude: 32.8872,
    longitude: 13.1913,
    is_default: false,
  });
  const [savingAddr, setSavingAddr] = useState(false);

  // Danger Zone Reset State
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, aRes] = await Promise.all([
        api.get<UserProfile>("/users/me/profile"),
        api.get<Address[]>("/users/me/addresses"),
      ]);
      setUser(uRes.data);
      setAddresses(aRes.data);
      setForm({
        name: uRes.data.name ?? "",
        phone: uRes.data.phone ?? "",
        language_pref: uRes.data.language_pref ?? "en",
        avatar_url: uRes.data.avatar_url ?? "",
      });
    } catch {
      toast.error(isAr ? "فشل تحميل البيانات" : "Failed to load profile settings.");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/users/me/profile", form);
      setSaved(true);
      if (form.language_pref !== lang) {
        setLanguage(form.language_pref as "en" | "ar");
      }
      toast.success(isAr ? "تم حفظ بيانات الملف الشخصي بنجاح" : "Profile updated successfully!");
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || (isAr ? "فشل حفظ الملف الشخصي" : "Failed to save profile."));
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddAddress = () => {
    setEditingAddrId(null);
    setAddrForm({
      label: isAr ? "المنزل" : "Home",
      city: "Tripoli",
      street_details: "",
      latitude: 32.8872,
      longitude: 13.1913,
      is_default: addresses.length === 0,
    });
    setShowAddressModal(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddrId(addr.id);
    // Parse city from full_address if stored as "Street, City"
    const parts = addr.full_address.split(",");
    const cityMatch = LIBYAN_CITIES.find((c) =>
      addr.full_address.toLowerCase().includes(c.en.toLowerCase()) ||
      addr.full_address.includes(c.ar)
    );

    setAddrForm({
      label: addr.label,
      city: cityMatch ? cityMatch.en : "Tripoli",
      street_details: parts[0]?.trim() || addr.full_address,
      latitude: addr.latitude ?? 32.8872,
      longitude: addr.longitude ?? 13.1913,
      is_default: addr.is_default,
    });
    setShowAddressModal(true);
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddr(true);

    const full_address = `${addrForm.street_details.trim()}, ${addrForm.city}, Libya`;
    const payload = {
      label: addrForm.label,
      full_address,
      latitude: addrForm.latitude,
      longitude: addrForm.longitude,
      is_default: addrForm.is_default,
    };

    try {
      if (editingAddrId) {
        await api.patch(`/users/me/addresses/${editingAddrId}`, payload);
        toast.success(isAr ? "تم تحديث العنوان بنجاح" : "Address updated successfully!");
      } else {
        await api.post("/users/me/addresses", payload);
        toast.success(isAr ? "تم إضافة العنوان بنجاح" : "New address added!");
      }
      setShowAddressModal(false);
      const aRes = await api.get<Address[]>("/users/me/addresses");
      setAddresses(aRes.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || (isAr ? "فشل حفظ العنوان" : "Failed to save address."));
    } finally {
      setSavingAddr(false);
    }
  };

  const deleteAddress = async (id: number) => {
    if (!confirm(isAr ? "هل أنت تأكد من حذف هذا العنوان؟" : "Are you sure you want to delete this address?")) return;
    try {
      await api.delete(`/users/me/addresses/${id}`);
      toast.success(isAr ? "تم حذف العنوان" : "Address deleted.");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error(isAr ? "فشل حذف العنوان" : "Failed to delete address.");
    }
  };

  const handleResetProfile = async () => {
    try {
      await api.patch("/users/me/profile", {
        phone: "",
        language_pref: "en",
      });
      setForm((p) => ({ ...p, phone: "" }));
      toast.success(isAr ? "تم إعادة ضبط تفاصيل الملف الشخصي" : "Profile settings reset.");
      setShowResetModal(false);
    } catch {
      toast.error(isAr ? "فشل ضبط الملف الشخصي" : "Failed to reset profile.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
        <div className="h-48 bg-white rounded-3xl animate-pulse border border-gray-100" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[var(--color-border)] shadow-2xs flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl text-[var(--color-ink)] flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-[var(--color-signal)]" />
            <span>{isAr ? "إعدادات الملف الشخصي والعناوين" : "Profile Settings & Addresses"}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-ink-muted)] mt-1">
            {isAr
              ? "تعديل البيانات الشخصية، تحديد الموقع بدقة في ليبيا، وإدارة العناوين المحفوظة"
              : "Manage your Libyan contact details, precise GPS map pin location, and saved addresses"}
          </p>
        </div>
      </div>

      {/* ── 1. PROFILE INFORMATION CARD ──────────────────────────── */}
      <div className="bg-white rounded-3xl border border-[var(--color-border)] shadow-2xs p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <h2 className="font-display font-bold text-lg text-[var(--color-ink)] flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--color-signal)]" />
            <span>{isAr ? "البيانات الشخصية" : "Profile Information"}</span>
          </h2>

          <button
            onClick={() => setShowResetModal(true)}
            className="text-xs text-red-600 hover:text-red-700 font-bold flex items-center gap-1 hover:underline"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isAr ? "إعادة ضبط الحساب" : "Reset Account Settings"}</span>
          </button>
        </div>

        <form onSubmit={saveProfile} className="space-y-5">
          {/* Profile Picture Management (Add / Edit / Remove) */}
          <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/70 flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group flex-shrink-0">
              {form.avatar_url ? (
                <img
                  src={form.avatar_url}
                  alt="Avatar"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl border-2 border-white shadow-sm">
                  {form.name ? form.name.charAt(0).toUpperCase() : <User className="w-9 h-9" />}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
                {isAr ? "الصورة الشخصية" : "Profile Picture"}
              </h3>
              <p className="text-xs text-gray-500">
                {isAr
                  ? "قم بتحميل صورة أو إدخال رابط أو اختيار صورة افتراضية"
                  : "Upload an image, enter an image URL, or choose a preset"}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                {/* File Upload Button */}
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 transition">
                  <Upload className="w-3.5 h-3.5 text-[var(--color-signal)]" />
                  <span>{isAr ? "تحميل صورة" : "Upload Image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement("canvas");
                            const MAX_SIZE = 400;
                            let width = img.width;
                            let height = img.height;
                            if (width > height) {
                              if (width > MAX_SIZE) {
                                height *= MAX_SIZE / width;
                                width = MAX_SIZE;
                              }
                            } else {
                              if (height > MAX_SIZE) {
                                width *= MAX_SIZE / height;
                                height = MAX_SIZE;
                              }
                            }
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext("2d");
                            ctx?.drawImage(img, 0, 0, width, height);
                            const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
                            setForm((p) => ({ ...p, avatar_url: dataUrl }));
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                {/* Remove Picture Button */}
                {form.avatar_url && (
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, avatar_url: "" }))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-100 text-xs font-semibold hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{isAr ? "إزالة الصورة" : "Remove Picture"}</span>
                  </button>
                )}
              </div>

              {/* Preset Avatars */}
              <div className="pt-2">
                <span className="block text-[11px] text-gray-400 font-semibold mb-1.5 text-center sm:text-left">
                  {isAr ? "اختيار أيقونة تعبيرية جاهزة (حسب نوع الخدمة / العميل):" : "Choose a themed illustration avatar:"}
                </span>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      title={isAr ? preset.nameAr : preset.nameEn}
                      onClick={() => setForm((p) => ({ ...p, avatar_url: preset.url }))}
                      className={`w-9 h-9 rounded-full overflow-hidden border-2 shadow-2xs transition-all flex items-center justify-center ${
                        form.avatar_url === preset.url
                          ? "border-[var(--color-signal)] ring-2 ring-[var(--color-signal)]/30 scale-110"
                          : "border-white opacity-80 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      <img src={preset.url} alt={isAr ? preset.nameAr : preset.nameEn} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Input */}
              <div className="pt-2">
                <input
                  type="url"
                  value={form.avatar_url}
                  onChange={(e) => setForm((p) => ({ ...p, avatar_url: e.target.value }))}
                  placeholder={isAr ? "أو أدخل رابط صورة مباشرة..." : "Or paste image URL (https://...)"}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white font-mono text-gray-700 focus:ring-2 focus:ring-[var(--color-signal)] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5">
              {isAr ? "الاسم بالكامل" : "Full Name"}
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder={isAr ? "مثال: أسامة الفيتوري" : "e.g. Osama Al-Fitouri"}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-signal)] focus:outline-none"
              />
            </div>
          </div>

          {/* Email (Disabled) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5">
              {isAr ? "البريد الإلكتروني (غير قابل للتعديل)" : "Email Address (Read-only)"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                disabled
                value={user?.email ?? ""}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-100 bg-gray-50 text-sm font-semibold text-gray-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Phone Number (Libyan Format) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5 flex items-center justify-between">
              <span>{isAr ? "رقم الهاتف الليبي" : "Libyan Phone Number"}</span>
              <span className="text-[11px] text-[var(--color-signal)] font-mono">LY +218</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="+218 91 123 4567"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-signal)] focus:outline-none font-mono"
              />
            </div>
            <p className="text-[11px] text-[var(--color-ink-muted)] mt-1">
              {isAr
                ? "صيغة المدار أو ليباريا (مثال: +218 91 1234567 أو 091 1234567)"
                : "Libyana or Madar format (e.g. +218 91 123 4567 or 091 1234567)"}
            </p>
          </div>

          {/* Language Preference */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5">
              {isAr ? "لغة المنصة المفضلة" : "Preferred Platform Language"}
            </label>
            <div className="relative">
              <Globe2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={form.language_pref}
                onChange={(e) => setForm((p) => ({ ...p, language_pref: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-signal)] focus:outline-none bg-white"
              >
                <option value="en">English (الإنجليزية)</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full justify-center py-3.5 rounded-2xl font-bold text-sm"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isAr ? "جاري الحفظ..." : "Saving Profile..."}</span>
              </>
            ) : saved ? (
              <span>{isAr ? "✅ تم الحفظ!" : "✅ Saved!"}</span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isAr ? "حفظ بيانات الملف الشخصي" : "Save Profile Information"}</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── 2. SAVED ADDRESSES WITH MAP PICKER ───────────────────────── */}
      <div className="bg-white rounded-3xl border border-[var(--color-border)] shadow-2xs p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="font-display font-bold text-lg text-[var(--color-ink)] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--color-signal)]" />
              <span>{isAr ? "العناوين المحفوظة وتحديد الموقع" : "Saved Addresses & Map Locations"}</span>
            </h2>
            <p className="text-xs text-[var(--color-ink-muted)] mt-0.5">
              {isAr ? "أضف وعدل وخريطة موقعك الجغرافي الدقيق في ليبيا" : "Add, edit, and pick your precise GPS location on the map"}
            </p>
          </div>

          <button
            onClick={handleOpenAddAddress}
            className="btn-primary"
            style={{ padding: "8px 16px", fontSize: "13px", borderRadius: "var(--radius-lg)" }}
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "إضافة عنوان جديد" : "Add New Address"}</span>
          </button>
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="text-center py-10 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <MapPin className="w-10 h-10 text-[var(--color-ink-muted)] mx-auto mb-2 opacity-40" />
            <p className="font-bold text-sm text-[var(--color-ink)] mb-1">
              {isAr ? "لا توجد عناوين محفوظة حتى الآن" : "No Saved Addresses"}
            </p>
            <p className="text-xs text-[var(--color-ink-muted)] mb-4">
              {isAr
                ? "أضف عنوانك في طرابلس أو بنغازي أو مصراتة لتسريع عملية الحجز"
                : "Add your address in Tripoli, Benghazi, or Misrata for quick instant bookings."}
            </p>
            <button onClick={handleOpenAddAddress} className="btn-primary" style={{ fontSize: "13px", padding: "8px 18px" }}>
              <Plus className="w-4 h-4" />
              <span>{isAr ? "إضافة عنوانك الأول" : "Add Your First Address"}</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {addresses.map((a) => (
              <div
                key={a.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  a.is_default
                    ? "bg-blue-50/50 border-[var(--color-signal)]"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      a.is_default ? "bg-[var(--color-signal)] text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <MapPin className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-display font-bold text-sm text-[var(--color-ink)]">
                        {a.label}
                      </span>
                      {a.is_default && (
                        <span className="text-[10px] font-extrabold bg-[var(--color-signal)] text-white px-2 py-0.5 rounded-full">
                          {isAr ? "العنوان الرئيسي" : "Default"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-ink-soft)] font-medium leading-relaxed truncate">
                      {a.full_address}
                    </p>
                    {a.latitude && a.longitude && (
                      <p className="text-[11px] font-mono text-[var(--color-ink-muted)] mt-1 flex items-center gap-1">
                        <Compass className="w-3 h-3 text-[var(--color-signal)]" />
                        <span>GPS: {a.latitude.toFixed(4)}, {a.longitude.toFixed(4)}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleOpenEditAddress(a)}
                    className="p-2 rounded-xl text-gray-500 hover:text-[var(--color-signal)] hover:bg-blue-50 transition-colors"
                    title="Edit Address"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAddress(a.id)}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ADDRESS EDIT / ADD MODAL WITH MAP PICKER ─────────────────── */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[var(--color-signal)] flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[var(--color-ink)]">
                    {editingAddrId
                      ? isAr ? "تعديل العنوان" : "Edit Address & Map Location"
                      : isAr ? "إضافة عنوان جديد" : "Add New Address"}
                  </h3>
                  <p className="text-xs text-[var(--color-ink-muted)]">
                    {isAr ? "حدد تفاصيل الموقع والخريطة الجغرافية" : "Set address details and precise GPS map coordinates"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddressModal(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveAddress} className="space-y-4">
              {/* Label & City */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5">
                    {isAr ? "تسمية العنوان" : "Address Label"}
                  </label>
                  <input
                    type="text"
                    required
                    value={addrForm.label}
                    onChange={(e) => setAddrForm((p) => ({ ...p, label: e.target.value }))}
                    placeholder={isAr ? "المنزل / العمل" : "Home / Work / Office"}
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm font-semibold text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-signal)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5">
                    {isAr ? "المدينة (ليبيا)" : "Libyan City"}
                  </label>
                  <select
                    value={addrForm.city}
                    onChange={(e) => {
                      const cityName = e.target.value;
                      const found = LIBYAN_CITIES.find((c) => c.en === cityName);
                      setAddrForm((p) => ({
                        ...p,
                        city: cityName,
                        latitude: found ? found.lat : p.latitude,
                        longitude: found ? found.lon : p.longitude,
                      }));
                    }}
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm font-semibold text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-signal)] focus:outline-none bg-white"
                  >
                    {LIBYAN_CITIES.map((c) => (
                      <option key={c.en} value={c.en}>
                        {c.en} ({c.ar})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Street Address Details (Libya-Centric Placeholder) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] mb-1.5">
                  {isAr ? "تفاصيل الشارع والمعالم القريبة" : "Street Address & Nearby Landmark"}
                </label>
                <input
                  type="text"
                  required
                  value={addrForm.street_details}
                  onChange={(e) => setAddrForm((p) => ({ ...p, street_details: e.target.value }))}
                  placeholder={
                    isAr
                      ? "شارع جرقارش، بالقرب من فندق المهاري، طرابلس"
                      : "Gargresh Street, Near Al-Mahari Hotel, Tripoli"
                  }
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm font-semibold text-[var(--color-ink)] focus:ring-2 focus:ring-[var(--color-signal)] focus:outline-none"
                />
              </div>

              {/* ── PRECISE MAP PICKER SECTION ──────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink-muted)] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[var(--color-signal)]" />
                    <span>{isAr ? "حدد موقعك الدقيق على الخريطة" : "Precise GPS Map Location"}</span>
                  </label>

                  <span className="text-[11px] font-mono text-[var(--color-signal)] bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                    📍 {addrForm.latitude.toFixed(4)}, {addrForm.longitude.toFixed(4)}
                  </span>
                </div>

                {/* Quick Snap City Buttons */}
                <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1">
                  <span className="text-[11px] text-[var(--color-ink-muted)] shrink-0 font-bold">
                    {isAr ? "الانتقال لمدينة:" : "Snap to:"}
                  </span>
                  {LIBYAN_CITIES.slice(0, 5).map((c) => (
                    <button
                      key={c.en}
                      type="button"
                      onClick={() =>
                        setAddrForm((p) => ({ ...p, city: c.en, latitude: c.lat, longitude: c.lon }))
                      }
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        addrForm.city === c.en
                          ? "bg-[var(--color-signal)] text-white border-[var(--color-signal)]"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {c.en}
                    </button>
                  ))}
                </div>

                {/* Interactive Map Picker Canvas */}
                <MapPickerCanvas
                  lat={addrForm.latitude}
                  lon={addrForm.longitude}
                  onChange={(lat, lon) => setAddrForm((p) => ({ ...p, latitude: lat, longitude: lon }))}
                />
              </div>

              {/* Default Address Checkbox */}
              <label className="flex items-center gap-2.5 text-xs font-bold text-[var(--color-ink)] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={addrForm.is_default}
                  onChange={(e) => setAddrForm((p) => ({ ...p, is_default: e.target.checked }))}
                  className="w-4 h-4 rounded text-[var(--color-signal)] focus:ring-[var(--color-signal)]"
                />
                <span>{isAr ? "تعيين كعنوان رئيسي مفضل" : "Set as default primary address"}</span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>

                <button
                  type="submit"
                  disabled={savingAddr}
                  className="btn-primary"
                  style={{ padding: "10px 24px", fontSize: "14px", borderRadius: "var(--radius-xl)" }}
                >
                  {savingAddr ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{editingAddrId ? (isAr ? "حفظ التعديلات" : "Update Address") : (isAr ? "حفظ العنوان" : "Save Address")}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RESET ACCOUNT CONFIRMATION MODAL ───────────────────────── */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 border border-gray-100 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-display font-bold text-lg text-[var(--color-ink)]">
              {isAr ? "إعادة ضبط إعدادات الملف الشخصي" : "Reset Profile Settings"}
            </h3>

            <p className="text-xs text-[var(--color-ink-soft)] leading-relaxed">
              {isAr
                ? "سيتم مسح رقم الهاتف واللغة المسجلة وإعادتها للوضع الافتراضي. هل تريد الاستمرار؟"
                : "This will reset your phone number and language preferences to default. Do you wish to continue?"}
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                {isAr ? "إلغاء" : "Cancel"}
              </button>

              <button
                onClick={handleResetProfile}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                {isAr ? "تأكيد مسح البيانات" : "Confirm Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

{/* ── INTERACTIVE LEAFLET / OSM MAP PICKER ────────────────────────── */}
function MapPickerCanvas({
  lat,
  lon,
  onChange,
}: {
  lat: number;
  lon: number;
  onChange: (lat: number, lon: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Small random variance around current lat/lon based on click offset
    const newLat = Number((lat + (0.5 - y) * 0.05).toFixed(4));
    const newLon = Number((lon + (x - 0.5) * 0.05).toFixed(4));

    onChange(newLat, newLon);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-2xs group cursor-crosshair">
      {/* Interactive OpenStreetMap Embed */}
      <iframe
        width="100%"
        height="220"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.04}%2C${lat - 0.03}%2C${lon + 0.04}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lon}`}
        className="pointer-events-none w-full h-[220px]"
      />

      {/* Click Overlay */}
      <div
        ref={containerRef}
        onClick={handleMapClick}
        className="absolute inset-0 bg-transparent flex items-center justify-center"
        title="Click anywhere on map to reposition GPS pin"
      >
        {/* Animated GPS Pin Marker */}
        <div className="relative pointer-events-none -translate-y-4 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-[var(--color-signal)] text-white shadow-lg flex items-center justify-center ring-4 ring-white">
            <MapPin className="w-5 h-5 fill-white text-[var(--color-signal)]" />
          </div>
          <div className="w-3 h-1.5 rounded-full bg-slate-900/30 mx-auto mt-1 blur-2xs" />
        </div>
      </div>

      <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-bold text-[var(--color-ink)] shadow-2xs border border-gray-200">
        👆 Click on map to drop pin
      </div>
    </div>
  );
}
