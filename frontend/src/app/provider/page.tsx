"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Zap, Bell, LayoutDashboard, Briefcase, Package, DollarSign,
  Star, MessageCircle, Settings, LogOut, ChevronRight, TrendingUp,
  Clock, CheckCircle, Award, ToggleLeft, ToggleRight,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/provider", active: true },
  { icon: Briefcase, label: "Job Feed", href: "/provider/jobs" },
  { icon: Package, label: "My Offers", href: "/provider/offers" },
  { icon: CheckCircle, label: "Active Jobs", href: "/provider/bookings/active" },
  { icon: Package, label: "My Services", href: "/provider/services" },
  { icon: Clock, label: "Availability", href: "/provider/availability" },
  { icon: DollarSign, label: "Earnings", href: "/provider/earnings" },
  { icon: Star, label: "Reviews", href: "/provider/reviews" },
  { icon: MessageCircle, label: "Messages", href: "/provider/messages" },
  { icon: Settings, label: "Settings", href: "/provider/settings" },
];

const tierColors: Record<string, string> = {
  bronze: "tier-bronze",
  silver: "tier-silver",
  gold: "tier-gold",
  platinum: "tier-platinum",
};

export default function ProviderDashboard() {
  const { user, logout } = useAuth();
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col py-6 px-4 fixed left-0 top-0 h-full z-30">
        <Link href="/" className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-gray-900">HireRent</span>
        </Link>

        {/* Online Toggle */}
        <div className="mx-3 mb-6 p-3 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-700">Status</p>
              <p className={`text-xs font-medium ${isOnline ? "text-emerald-600" : "text-gray-400"}`}>
                {isOnline ? "Online — accepting jobs" : "Offline"}
              </p>
            </div>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`transition-colors ${isOnline ? "text-emerald-500" : "text-gray-300"}`}
            >
              {isOnline ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.active ? "bg-violet-50 text-violet-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() ?? "P"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-violet-600 font-medium">Provider</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="font-display text-xl font-bold text-gray-900">Provider Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Hello, {user?.name?.split(" ")[0]}! Here's your overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/provider/notifications" className="relative w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Bell className="w-4 h-4 text-gray-600" />
            </Link>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto">
          {/* Trust Score Widget */}
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 mb-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white blur-2xl" />
            </div>
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span className="text-amber-300 text-xs font-semibold">Reputation Score</span>
                </div>
                <div className="text-5xl font-extrabold font-display mb-1">—</div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white/80 text-xs font-semibold border border-white/20 mb-3">
                  <div className="w-2 h-2 rounded-full bg-amber-300" />
                  Bronze Tier — Getting started
                </div>
                <p className="text-white/70 text-xs">
                  Complete your first bookings to build your Trust Score and climb the tiers.
                </p>
              </div>
              <Link
                href="/provider/profile"
                className="shrink-0 text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1 transition-colors"
              >
                View details <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Progress Bar */}
            <div className="mt-4 relative">
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-white rounded-full" />
              </div>
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>Bronze</span>
                <span>Silver (50)</span>
                <span>Gold (70)</span>
                <span>Platinum (85)</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Completed Jobs", value: "0", icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
              { label: "Avg Rating", value: "—", icon: Star, color: "text-amber-600 bg-amber-50" },
              { label: "Response Rate", value: "—", icon: Clock, color: "text-blue-600 bg-blue-50" },
              { label: "Total Earned", value: "$0", icon: DollarSign, color: "text-violet-600 bg-violet-50" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div className="font-display text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Job Feed + Quick Links */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-gray-900">Available Jobs</h3>
                <Link href="/provider/jobs" className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1">
                  View feed <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <Briefcase className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">No jobs yet</p>
                <p className="text-xs text-gray-400 mb-4">Complete your onboarding to start receiving job requests</p>
                <Link href="/provider/onboarding" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                  Complete Onboarding →
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-display font-bold text-gray-900 mb-5">Quick Setup</h3>
              <div className="space-y-3">
                {[
                  { label: "Complete your profile", href: "/provider/profile", done: false },
                  { label: "Add your service packages", href: "/provider/services", done: false },
                  { label: "Set your availability", href: "/provider/availability", done: false },
                  { label: "Go online to receive jobs", href: "/provider", done: false },
                ].map((item, i) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${item.done ? "border-emerald-400 bg-emerald-400 text-white" : "border-gray-300 text-gray-500"}`}>
                        {item.done ? <CheckCircle className="w-3 h-3" /> : i + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-violet-700">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-500" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
