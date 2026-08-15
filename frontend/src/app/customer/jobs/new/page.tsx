"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(
  () => import("@/components/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[320px] bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center text-xs text-gray-400">
        Loading Interactive Map...
      </div>
    ),
  }
);
import {
  Send,
  AlertTriangle,
  ChevronRight,
  Loader2,
  Zap,
  FileText,
  Sparkles,
  CheckCircle2,
  MapPin,
  Plus,
  Navigation,
  BookmarkCheck,
  Building2,
  Home,
  Briefcase,
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

interface Category {
  id: number;
  name_en: string;
  slug: string;
}

interface SavedAddress {
  id: number;
  label: string;
  full_address: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
}

const AI_EXAMPLES = [
  { label: "AC Repair", prompt: "My living room AC is blowing warm air and making a rattling noise" },
  { label: "Leaking Sink", prompt: "Kitchen sink pipe is leaking under the cabinet onto the floor" },
  { label: "Ceiling Fan", prompt: "Need an electrician to install a new ceiling fan in bedroom" },
  { label: "House Cleaning", prompt: "Deep cleaning for 3-bedroom apartment before moving in" },
];

const CITY_PRESETS = [
  { name: "Tripoli", lat: 32.8872, lon: 13.1913, address: "Al-Olaya, Tripoli" },
  { name: "Benghazi", lat: 32.1167, lon: 20.0667, address: "City Center, Benghazi" },
  { name: "Misrata", lat: 32.3754, lon: 15.0925, address: "Downtown, Misrata" },
  { name: "Riyadh", lat: 24.7136, lon: 46.6753, address: "Al-Olaya, Riyadh" },
  { name: "Jeddah", lat: 21.5433, lon: 39.1728, address: "Al-Hamra, Jeddah" },
];

function PostJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentMode = searchParams.get("mode") === "ai" ? "ai" : "manual";

  const [categories, setCategories] = useState<Category[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Assist State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);

  // Location State
  const [locationMode, setLocationMode] = useState<"saved" | "new">("saved");
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [detectingGps, setDetectingGps] = useState(false);
  const [saveToProfile, setSaveToProfile] = useState(true);

  const [form, setForm] = useState({
    category_id: searchParams.get("category") ?? "",
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
    is_urgent: false,
    location_address: "",
    latitude: "" as string | number,
    longitude: "" as string | number,
    scheduled_date: "",
  });

  useEffect(() => {
    setLoading(true);
    // Fetch categories and saved user addresses
    Promise.all([
      api.get<Category[]>("/categories"),
      api.get<SavedAddress[]>("/users/me/addresses").catch(() => ({ data: [] })),
    ])
      .then(([catRes, addrRes]) => {
        const flat: Category[] = [];
        function flatten(cats: any[]) {
          cats.forEach((c) => {
            flat.push(c);
            if (c.children) flatten(c.children);
          });
        }
        flatten(catRes.data as any[]);
        setCategories(flat);

        const addrs = addrRes.data || [];
        setSavedAddresses(addrs);

        // Auto-select default address if available
        if (addrs.length > 0) {
          const defaultAddr = addrs.find((a) => a.is_default) || addrs[0];
          setSelectedAddressId(defaultAddr.id);
          setForm((p) => ({
            ...p,
            location_address: defaultAddr.full_address,
            latitude: defaultAddr.latitude ?? "",
            longitude: defaultAddr.longitude ?? "",
          }));
          setLocationMode("saved");
        } else {
          setLocationMode("new");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const update = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const handleModeSwitch = (newMode: "manual" | "ai") => {
    if (newMode === "ai") {
      router.push("/customer/jobs/new?mode=ai");
    } else {
      router.push("/customer/jobs/new");
    }
  };

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setForm((p) => ({
      ...p,
      location_address: addr.full_address,
      latitude: addr.latitude ?? "",
      longitude: addr.longitude ?? "",
    }));
  };

  const handleSelectCityPreset = (preset: typeof CITY_PRESETS[0]) => {
    setForm((p) => ({
      ...p,
      latitude: preset.lat,
      longitude: preset.lon,
      location_address: p.location_address || preset.address,
    }));
    toast.success(`Set location to ${preset.name} (${preset.lat}, ${preset.lon})`);
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser. Please select a city preset or enter coordinates.");
      return;
    }

    setDetectingGps(true);

    const applyCoords = (pos: GeolocationPosition) => {
      const lat = parseFloat(pos.coords.latitude.toFixed(6));
      const lon = parseFloat(pos.coords.longitude.toFixed(6));
      setForm((p) => ({
        ...p,
        latitude: lat,
        longitude: lon,
        location_address: p.location_address || `GPS Location (${lat}, ${lon})`,
      }));
      setDetectingGps(false);
      toast.success(`GPS Location Detected: ${lat}, ${lon}`);
    };

    // Stage 1: High accuracy (fast 4s timeout)
    navigator.geolocation.getCurrentPosition(
      applyCoords,
      () => {
        // Stage 2: Fallback to low accuracy (works reliably on Desktop/macOS)
        navigator.geolocation.getCurrentPosition(
          applyCoords,
          (err) => {
            setDetectingGps(false);
            toast.error("Browser auto-detect unavailable. Select a City Preset below or enter coordinates manually.");
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: true, timeout: 4000 }
    );
  };

  const handleAiGenerate = async (promptToUse?: string) => {
    const textToAnalyze = (promptToUse || aiPrompt).trim();
    if (textToAnalyze.length < 5) {
      toast.error("Please enter a longer description of what you need done (at least 5 characters).");
      return;
    }

    setAiLoading(true);
    setError(null);
    setAiSuccess(false);

    try {
      const res = await api.post<{
        category_id?: number;
        category_name?: string;
        cost_min?: number;
        cost_max?: number;
        structured_description?: string;
      }>("/ai/assist", { text: textToAnalyze });

      const data = res.data;

      // Auto-populate form
      let matchedCatId = data.category_id ? String(data.category_id) : "";
      if (!matchedCatId && data.category_name && categories.length > 0) {
        const found = categories.find((c) =>
          c.name_en.toLowerCase().includes((data.category_name || "").toLowerCase())
        );
        if (found) matchedCatId = String(found.id);
      }

      const generatedTitle =
        textToAnalyze.length > 50 ? `${textToAnalyze.slice(0, 47)}...` : textToAnalyze;

      setForm((p) => ({
        ...p,
        category_id: matchedCatId || p.category_id,
        title: generatedTitle,
        description: data.structured_description || textToAnalyze,
        budget_min: data.cost_min ? String(data.cost_min) : p.budget_min,
        budget_max: data.cost_max ? String(data.cost_max) : p.budget_max,
      }));

      setAiSuccess(true);
      toast.success("AI auto-filled your job details! Review and post below.");
    } catch (err: any) {
      toast.error(err?.response?.data?.detail?.reason || "AI service temporarily unavailable. Please fill manually.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category_id) {
      toast.error("Please select a service category.");
      return;
    }

    if (!form.location_address.trim()) {
      toast.error("Please provide a location address.");
      return;
    }

    const latNum = typeof form.latitude === "number" ? form.latitude : parseFloat(form.latitude);
    const lonNum = typeof form.longitude === "number" ? form.longitude : parseFloat(form.longitude);

    if (isNaN(latNum) || isNaN(lonNum)) {
      toast.error("Precise GPS location is required. Please select a saved address or detect/enter GPS coordinates.");
      setError("Precise GPS location (latitude and longitude) is required. Please select one of your saved locations or detect/enter coordinates below.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // If adding a new location and saveToProfile is enabled, save to user addresses
      if (locationMode === "new" && saveToProfile) {
        try {
          await api.post("/users/me/addresses", {
            label: "Job Location",
            full_address: form.location_address.trim(),
            latitude: latNum,
            longitude: lonNum,
          });
        } catch {
          // ignore address saving errors to not block job creation
        }
      }

      const payload: Record<string, unknown> = {
        category_id: parseInt(form.category_id),
        title: form.title.trim(),
        description: form.description.trim(),
        is_urgent: form.is_urgent,
        location_address: form.location_address.trim(),
        latitude: latNum,
        longitude: lonNum,
        budget_min: form.budget_min ? parseFloat(form.budget_min) : undefined,
        budget_max: form.budget_max ? parseFloat(form.budget_max) : undefined,
        scheduled_date: form.scheduled_date ? new Date(form.scheduled_date).toISOString() : undefined,
      };

      await api.post<{ id: number }>("/jobs", payload);
      toast.success("Job posted successfully with precise GPS location!");
      router.push(`/customer/bookings?tab=jobs`);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || "Failed to post job. Please check all fields.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const hasValidGps = !isNaN(typeof form.latitude === "number" ? form.latitude : parseFloat(form.latitude)) &&
                     !isNaN(typeof form.longitude === "number" ? form.longitude : parseFloat(form.longitude));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Post a Job</h1>
        <p className="text-gray-500 mt-1">Describe what you need and receive offers from top providers</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => handleModeSwitch("manual")}
          className={`flex-1 flex items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
            currentMode === "manual"
              ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm font-bold"
              : "border-gray-200 text-gray-600 hover:border-violet-300 hover:bg-gray-50"
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-sm">Manual Form</span>
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch("ai")}
          className={`flex-1 flex items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
            currentMode === "ai"
              ? "border-violet-500 bg-violet-50 text-violet-700 shadow-sm font-bold"
              : "border-gray-200 text-gray-600 hover:border-violet-300 hover:bg-gray-50"
          }`}
        >
          <Zap className="w-5 h-5 text-violet-500" />
          <span className="text-sm">AI Assist</span>
          <span className="ml-auto text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
            Beta
          </span>
        </button>
      </div>

      {/* AI Generator Box (visible in AI Mode) */}
      {currentMode === "ai" && (
        <div className="mb-8 p-5 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 border border-violet-200 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-violet-600 text-white shadow-xs">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">AI Job Generator</h2>
              <p className="text-xs text-gray-600">Type what you need in plain words and let AI structure your job post</p>
            </div>
          </div>

          <div>
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. My living room AC stopped cooling and is making a rattling noise. Need a technician to inspect and fix it."
              className="w-full p-3.5 rounded-2xl border border-violet-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 text-sm placeholder:text-gray-400 shadow-xs resize-none"
            />
          </div>

          {/* Prompt chips */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-violet-800">Try an example prompt:</p>
            <div className="flex flex-wrap gap-2">
              {AI_EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setAiPrompt(ex.prompt);
                    handleAiGenerate(ex.prompt);
                  }}
                  className="px-2.5 py-1 rounded-xl bg-white border border-violet-200 text-violet-700 text-xs hover:bg-violet-100 transition shadow-2xs font-medium"
                >
                  ✨ {ex.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleAiGenerate()}
            disabled={aiLoading}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {aiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Job Details...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Auto-Generate Job Details</span>
              </>
            )}
          </button>

          {aiSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Job details auto-generated! Review or refine the fields below before posting.</span>
            </div>
          )}
        </div>
      )}

      {/* Main Job Post Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Category *</label>
          <select
            required
            value={form.category_id}
            onChange={(e) => update("category_id", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm bg-white"
          >
            <option value="">Select a category...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title *</label>
          <input
            type="text"
            required
            minLength={5}
            maxLength={200}
            placeholder="e.g. Fix leaking kitchen sink"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
          <textarea
            required
            minLength={10}
            rows={4}
            placeholder="Describe the work you need done in as much detail as possible..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm resize-none"
          />
        </div>

        {/* Budget */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget Min (LYD)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={form.budget_min}
              onChange={(e) => update("budget_min", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Budget Max (LYD)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={form.budget_max}
              onChange={(e) => update("budget_max", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
            />
          </div>
        </div>

        {/* ── REQUIRED PRECISE GPS & ADDRESS SECTION ── */}
        <div className="p-5 bg-gray-50/80 border border-gray-200 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-violet-100 text-violet-700">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <span>Job Location & Precise GPS</span>
                  <span className="text-xs text-rose-500 font-bold">* Required</span>
                </h3>
                <p className="text-xs text-gray-500">Provide address description and exact GPS coordinates</p>
              </div>
            </div>

            {hasValidGps && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>GPS Ready</span>
              </span>
            )}
          </div>

          {/* Location Mode Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200/60 rounded-xl">
            <button
              type="button"
              onClick={() => setLocationMode("saved")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                locationMode === "saved"
                  ? "bg-white text-violet-700 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Saved Locations ({savedAddresses.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setLocationMode("new")}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                locationMode === "new"
                  ? "bg-white text-violet-700 shadow-xs"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add / Detect GPS</span>
            </button>
          </div>

          {/* Option A: Saved Locations */}
          {locationMode === "saved" && (
            <div className="space-y-3">
              {savedAddresses.length === 0 ? (
                <div className="text-center py-6 px-4 bg-white rounded-2xl border border-dashed border-gray-300">
                  <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-medium">No saved addresses found in your profile.</p>
                  <button
                    type="button"
                    onClick={() => setLocationMode("new")}
                    className="mt-2 text-xs text-violet-600 font-bold hover:underline"
                  >
                    + Add or Detect a New GPS Location
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {savedAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isSelected
                            ? "border-violet-500 bg-white ring-2 ring-violet-200 shadow-xs"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-900 flex items-center gap-1">
                              {addr.label.toLowerCase().includes("home") ? (
                                <Home className="w-3.5 h-3.5 text-violet-600" />
                              ) : addr.label.toLowerCase().includes("office") || addr.label.toLowerCase().includes("work") ? (
                                <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                              ) : (
                                <Building2 className="w-3.5 h-3.5 text-gray-500" />
                              )}
                              {addr.label}
                            </span>
                            {isSelected && (
                              <span className="w-2 h-2 rounded-full bg-violet-600"></span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{addr.full_address}</p>
                        </div>

                        {addr.latitude && addr.longitude ? (
                          <span className="text-[10px] text-emerald-700 font-bold mt-2 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> GPS Coordinates Attached
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-medium mt-2">
                            ⚠️ Missing GPS Coordinates
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Option B: Interactive Pin Drop Map & Custom Location */}
          {locationMode === "new" && (
            <div className="space-y-4 bg-white p-4 rounded-2xl border border-gray-200">
              {/* Interactive OpenStreetMap Pin Drop Map Component */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>Pin Location on Map *</span>
                  <span className="text-[11px] text-violet-600 font-normal">Click or drag marker to set exact location</span>
                </label>
                <LocationPickerMap
                  lat={typeof form.latitude === "number" ? form.latitude : parseFloat(String(form.latitude)) || 32.8872}
                  lng={typeof form.longitude === "number" ? form.longitude : parseFloat(String(form.longitude)) || 13.1913}
                  onLocationSelect={(newLat, newLng, addressDesc) => {
                    setForm((p) => ({
                      ...p,
                      latitude: newLat,
                      longitude: newLng,
                      location_address: addressDesc || p.location_address,
                    }));
                  }}
                />
              </div>

              {/* Address Description Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Address Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Building 12, Street 15, Al-Olaya, Tripoli"
                  value={form.location_address}
                  onChange={(e) => update("location_address", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
                />
              </div>

              {/* Save to Profile Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="saveToProfile"
                  checked={saveToProfile}
                  onChange={(e) => setSaveToProfile(e.target.checked)}
                  className="w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-violet-400 cursor-pointer"
                />
                <label htmlFor="saveToProfile" className="text-xs text-gray-600 cursor-pointer font-medium">
                  Save this location to my profile addresses for future jobs
                </label>
              </div>
            </div>
          )}

          {!hasValidGps && (
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Precise location is required so matching providers near you can respond to your job.</span>
            </div>
          )}
        </div>

        {/* Preferred date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Date</label>
          <input
            type="datetime-local"
            value={form.scheduled_date}
            onChange={(e) => update("scheduled_date", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
          />
        </div>

        {/* Urgent toggle */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Mark as Urgent</p>
            <p className="text-xs text-amber-600">Adds +25% surcharge and prioritises your job</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_urgent}
              onChange={(e) => update("is_urgent", e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-gray-200 peer-checked:bg-amber-500 rounded-full peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
          </label>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Posting Job...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Post Job
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function PostJobPage() {
  return (
    <Suspense>
      <PostJobForm />
    </Suspense>
  );
}
