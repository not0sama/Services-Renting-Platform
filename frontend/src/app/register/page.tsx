"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Eye, EyeOff, Zap, Mail, Lock, User, Phone,
  ArrowRight, CheckCircle, Users, Building2,
} from "lucide-react";
import type { AxiosError } from "axios";
import type { UserRole } from "@/types";

function RegisterForm() {
  const { register } = useAuth();
  const searchParams = useSearchParams();

  const [role, setRole] = useState<UserRole>("customer");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    referralCode: "",
    password: "",
    confirmPassword: "",
    accepted_terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Pre-select role or referral code from URL params
  useEffect(() => {
    const r = searchParams.get("role");
    const ref = searchParams.get("ref");
    if (r === "provider") {
      setTimeout(() => setRole("provider"), 0);
    }
    if (ref) {
      setTimeout(() => setForm((prev) => ({ ...prev, referralCode: ref })), 0);
    }
  }, [searchParams]);

  const updateField = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!form.accepted_terms) {
      toast.error("Please accept the Terms of Service to continue.");
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email.trim().toLowerCase(),
        phone: form.phone || undefined,
        password: form.password,
        role,
        language_pref: "en",
        accepted_terms: form.accepted_terms,
        referral_code: form.referralCode || undefined,
      });
      toast.success("Account created! Welcome to HireRent 🎉");
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>;
      const message =
        error.response?.data?.error?.message ?? "Registration failed. Please try again.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — High-Contrast Brand Panel */}
      <div
        className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12 text-white"
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #0F172A 100%)",
        }}
      >
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

        <div className="relative flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-signal)] flex items-center justify-center text-white shadow-lg">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tight">HireRent</span>
        </div>

        <div className="relative z-10 my-auto py-8">
          <h2 className="font-display text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            {role === "provider" ? "Start earning today" : "Get any job done right"}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
            {role === "provider"
              ? "Join our marketplace, showcase your skills, and connect with customers who need your expertise."
              : "Find verified professionals, compare offers, and book with confidence — backed by our escrow guarantee."}
          </p>
          <div className="flex flex-col gap-3.5">
            {(role === "provider"
              ? [
                  "Set your own rates and availability",
                  "Build your reputation with verified reviews",
                  "Earn more with transparent tier bonuses",
                  "Get matched by AI with the right customers",
                ]
              : [
                  "AI matches you with the best provider",
                  "Pay only when the job is done right",
                  "Track your provider's live location",
                  "Protected by 72-hour escrow guarantee",
                ]
            ).map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-slate-200 text-sm font-medium">
                <CheckCircle className="w-4.5 h-4.5 text-blue-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-slate-400 text-xs font-mono">
          © {new Date().getFullYear()} HireRent Platform. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">HireRent</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
            <p className="text-gray-500 text-sm">Join thousands of customers and providers</p>
          </div>

          {/* Role Toggle */}
          <div className="flex gap-2 mb-8 p-1 bg-gray-100 rounded-xl">
            <button
              id="role-customer-btn"
              type="button"
              onClick={() => setRole("customer")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === "customer"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users className="w-4 h-4" />
              I need a service
            </button>
            <button
              id="role-provider-btn"
              type="button"
              onClick={() => setRole("provider")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === "provider"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Building2 className="w-4 h-4" />
              I offer services
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="reg-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone number <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 234 567 8900"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Referral Code */}
            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-1.5">
                Referral code <span className="text-gray-400 font-normal">(optional - FR-58)</span>
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="referralCode"
                  type="text"
                  value={form.referralCode}
                  onChange={(e) => updateField("referralCode", e.target.value.toUpperCase())}
                  placeholder="e.g. A1B2C3D4"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent uppercase"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Min 8 characters, 1 uppercase letter, 1 number</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => updateField("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Terms */}
            <label htmlFor="terms" className="flex items-start gap-3 cursor-pointer">
              <input
                id="terms"
                type="checkbox"
                checked={form.accepted_terms}
                onChange={(e) => updateField("accepted_terms", e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-500">
                I agree to the{" "}
                <Link href="/terms" className="text-violet-600 hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-violet-600 hover:underline">Privacy Policy</Link>
              </span>
            </label>

            {/* Submit */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white gradient-primary shadow-lg hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create {role === "provider" ? "Provider" : "Customer"} Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-violet-600 hover:text-violet-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
