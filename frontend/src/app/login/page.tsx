"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, Zap, Mail, Lock, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      const msg = "Please enter both your email address and password.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      await login({ email, password });
      toast.success("Welcome back!");
    } catch (err: any) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        "Invalid email or password. Please check your credentials.";
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — High-Contrast Premium Brand Showcase */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 text-white"
        style={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 60%, #0F172A 100%)",
        }}
      >
        {/* Glow Spheres */}
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

        {/* Logo Header */}
        <div className="relative flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-signal)] flex items-center justify-center text-white shadow-lg">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tight">
            HireRent
          </span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-blue-200 text-xs font-bold mb-6 border border-white/15 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>AI-Powered Marketplace</span>
          </div>

          <h2 className="font-display text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            The smarter way to hire trusted professionals
          </h2>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8">
            Browse thousands of verified experts, compare transparent bids in seconds, and pay safely with guaranteed escrow protection.
          </p>

          <div className="flex flex-col gap-3.5">
            {[
              "AI-powered best match recommendations",
              "Escrow-protected milestone payments",
              "Real-time location & status updates",
              "Multi-criteria provider verification",
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-slate-200 text-sm font-medium">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center shrink-0">
                  <ArrowRight className="w-3 h-3" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 text-slate-400 text-xs font-mono">
          © {new Date().getFullYear()} HireRent Platform. All rights reserved.
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-signal)] flex items-center justify-center text-white">
              <Zap className="w-4 h-4 fill-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">HireRent</span>
          </div>

          <div className="mb-8">
            <h1 className="font-display text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Welcome back
            </h1>
            <p className="text-gray-500 text-sm">
              Sign in to your account to manage bookings & jobs
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-center gap-2.5 mb-6 animate-shake">
              <AlertCircle className="w-4.5 h-4.5 text-red-600 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] focus:border-transparent transition-all"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[var(--color-signal)] hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-signal)] focus:border-transparent transition-all"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white bg-[var(--color-signal)] hover:bg-[var(--color-signal-dark)] shadow-md hover:shadow-lg disabled:opacity-60 transition-all cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <p className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-[var(--color-signal)] hover:underline transition-colors"
            >
              Sign up
            </Link>
          </p>

          {/* Admin link */}
          <div className="mt-8 text-center">
            <Link
              href="/admin/login"
              className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
            >
              Admin Portal Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
