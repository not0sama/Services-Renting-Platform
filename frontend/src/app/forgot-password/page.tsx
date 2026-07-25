"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Mail, ArrowRight, ArrowLeft, Zap, KeyRound } from "lucide-react";
import type { AxiosError } from "axios";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await forgotPassword({ email });
      setSent(true);
      toast.success("Reset code sent! Check the server logs (dev mode).");
    } catch (err) {
      const error = err as AxiosError<{ error: { message: string } }>;
      toast.error(error.response?.data?.error?.message ?? "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <div className="w-14 h-14 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-7 h-7 text-violet-600" />
                </div>
                <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Forgot your password?</h1>
                <p className="text-gray-500 text-sm">
                  Enter your email address and we'll send you a reset code.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <button
                  id="forgot-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white gradient-primary shadow-lg hover:opacity-90 disabled:opacity-60 transition-all"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Send reset code <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-emerald-600" />
              </div>
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Check server logs</h2>
              <p className="text-gray-500 text-sm mb-6">
                In development mode, the 6-digit reset code is printed to the FastAPI server console. Use it on the reset page.
              </p>
              <Link
                href="/reset-password"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white gradient-primary shadow-lg hover:opacity-90 transition-all"
              >
                Enter reset code <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
