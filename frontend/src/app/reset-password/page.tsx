"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Zap, ShieldCheck } from "lucide-react";
import type { AxiosError } from "axios";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", code: "", new_password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword({ email: form.email, code: form.code, new_password: form.new_password });
      toast.success("Password reset successfully! Please log in with your new password.");
      router.push("/login");
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>;
      toast.error(error.response?.data?.error?.message ?? "Reset failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-violet-600" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Reset your password</h1>
            <p className="text-gray-500 text-sm">
              Enter the 6-digit code from the server logs and your new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="reset-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Code */}
            <div>
              <label htmlFor="reset-code" className="block text-sm font-medium text-gray-700 mb-1.5">Reset code</label>
              <input
                id="reset-code"
                type="text"
                value={form.code}
                onChange={(e) => update("code", e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                required
              />
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={form.new_password}
                  onChange={(e) => update("new_password", e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Min 8 chars, 1 uppercase, 1 number</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="confirm-new-password"
                  type={showPassword ? "text" : "password"}
                  value={form.confirm}
                  onChange={(e) => update("confirm", e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              id="reset-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white gradient-primary shadow-lg hover:opacity-90 disabled:opacity-60 transition-all"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Reset password <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
