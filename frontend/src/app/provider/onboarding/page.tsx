"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ChevronRight, Loader2, User, Grid3X3, MapPin, FileUp, Rocket } from "lucide-react";
import api from "@/lib/api";

interface Category {
  id: number;
  name_en: string;
}

const STEPS = [
  { id: 1, label: "Personal Info", icon: User },
  { id: 2, label: "Categories", icon: Grid3X3 },
  { id: 3, label: "Service Area", icon: MapPin },
  { id: 4, label: "Documents", icon: FileUp },
  { id: 5, label: "Go Live", icon: Rocket },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Step data
  const [step1, setStep1] = useState({ bio: "", years_experience: 0, city: "", country: "Saudi Arabia" });
  const [selectedCats, setSelectedCats] = useState<number[]>([]);
  const [step3, setStep3] = useState({ latitude: 24.7136, longitude: 46.6753, service_radius_km: 20 });

  useEffect(() => {
    api.get<any[]>("/categories").then((r) => {
      const flat: Category[] = [];
      function flatten(cats: any[]) { cats.forEach((c) => { flat.push(c); if (c.children) flatten(c.children); }); }
      flatten(r.data);
      setCategories(flat);
    });
  }, []);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      if (step === 1) {
        await api.post("/providers/onboarding/step/1", step1);
      } else if (step === 2) {
        await api.post("/providers/onboarding/step/2", { category_ids: selectedCats });
      } else if (step === 3) {
        await api.post("/providers/onboarding/step/3", step3);
      } else if (step === 5) {
        router.push("/provider");
        return;
      }
      setStep((s) => s + 1);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Progress header */}
        <div className="gradient-primary p-6 text-white">
          <h1 className="text-xl font-bold mb-1">Provider Onboarding</h1>
          <p className="text-violet-200 text-sm">Step {step} of {STEPS.length} — {STEPS[step - 1].label}</p>
          <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex border-b border-gray-100 px-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.id} className="flex-1 flex flex-col items-center py-3 gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  s.id < step ? "bg-emerald-100 text-emerald-600" :
                  s.id === step ? "bg-violet-100 text-violet-600" :
                  "bg-gray-100 text-gray-400"
                }`}>
                  {s.id < step ? <CheckCircle className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-[10px] font-medium hidden sm:block ${s.id === step ? "text-violet-700" : "text-gray-400"}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">Tell us about yourself</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  rows={3}
                  placeholder="Describe your skills and experience..."
                  value={step1.bio}
                  onChange={(e) => setStep1((p) => ({ ...p, bio: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                <input
                  type="number" min="0"
                  value={step1.years_experience}
                  onChange={(e) => setStep1((p) => ({ ...p, years_experience: parseInt(e.target.value) }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text" placeholder="Riyadh"
                    value={step1.city}
                    onChange={(e) => setStep1((p) => ({ ...p, city: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text" placeholder="Saudi Arabia"
                    value={step1.country}
                    onChange={(e) => setStep1((p) => ({ ...p, country: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-300 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Categories */}
          {step === 2 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-900">What services do you offer?</h2>
              <p className="text-sm text-gray-500">Select all that apply</p>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const selected = selectedCats.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCats((p) => selected ? p.filter((x) => x !== cat.id) : [...p, cat.id])}
                      className={`p-3 rounded-xl border-2 text-sm font-medium text-left transition-all ${
                        selected ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600 hover:border-violet-300"
                      }`}
                    >
                      {selected && <CheckCircle className="w-3.5 h-3.5 inline mr-1" />}
                      {cat.name_en}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Service Area */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold text-gray-900">Set your service area</h2>
              <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
                📍 Using default Riyadh coordinates. In production, integrate with a map picker.
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Radius (km)</label>
                <input
                  type="range" min="5" max="100" step="5"
                  value={step3.service_radius_km}
                  onChange={(e) => setStep3((p) => ({ ...p, service_radius_km: parseInt(e.target.value) }))}
                  className="w-full"
                />
                <p className="text-sm text-center text-violet-700 font-semibold mt-1">{step3.service_radius_km} km radius</p>
              </div>
            </div>
          )}

          {/* Step 4: Documents */}
          {step === 4 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-900">Upload your documents</h2>
              <p className="text-sm text-gray-500">Documents will be reviewed by admin for verification.</p>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                <FileUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Document upload UI</p>
                <p className="text-xs">(Use backend /providers/documents endpoint)</p>
              </div>
              <button
                onClick={() => setStep(5)}
                className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
              >
                Skip for now →
              </button>
            </div>
          )}

          {/* Step 5: Go Live */}
          {step === 5 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">You're almost ready! 🎉</h2>
              <p className="text-gray-500 text-sm mb-6">
                Your profile is being reviewed by our team. You'll receive a notification once approved.
                In the meantime, you can explore your dashboard.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-6">
            {step > 1 && step < 5 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={submit}
              disabled={loading}
              className="flex-1 btn-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              ) : step === 5 ? (
                "Go to Dashboard →"
              ) : (
                <>Continue <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
