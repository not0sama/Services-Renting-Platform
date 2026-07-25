"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Zap, LayoutDashboard, Users, Briefcase, BookOpen, AlertTriangle,
  Star, DollarSign, BarChart2, Megaphone, Shield, LogOut, ChevronRight,
  TrendingUp, Package, Clock, CheckCircle, Bell,
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin", active: true },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Shield, label: "Providers", href: "/admin/providers" },
  { icon: BookOpen, label: "Categories", href: "/admin/categories" },
  { icon: Package, label: "Bookings", href: "/admin/bookings" },
  { icon: AlertTriangle, label: "Disputes", href: "/admin/disputes" },
  { icon: Star, label: "Reviews", href: "/admin/reviews" },
  { icon: DollarSign, label: "Payments", href: "/admin/payments" },
  { icon: BarChart2, label: "Analytics", href: "/admin/analytics" },
  { icon: Megaphone, label: "Announcements", href: "/admin/announcements" },
  { icon: Shield, label: "Admin Roles", href: "/admin/roles" },
];

const kpis = [
  { label: "Total Users", value: "0", icon: Users, delta: "+0 today", color: "text-blue-600 bg-blue-50" },
  { label: "Active Bookings", value: "0", icon: Package, delta: "0 pending", color: "text-violet-600 bg-violet-50" },
  { label: "Revenue (Month)", value: "$0", icon: DollarSign, delta: "+0%", color: "text-emerald-600 bg-emerald-50" },
  { label: "Open Disputes", value: "0", icon: AlertTriangle, delta: "Requires attention", color: "text-red-600 bg-red-50" },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-gray-900 border-r border-gray-800 flex-col py-6 px-4 fixed left-0 top-0 h-full z-30">
        <Link href="/" className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display font-bold text-base text-white block leading-tight">HireRent</span>
            <span className="text-xs text-gray-500">Admin Panel</span>
          </div>
        </Link>

        <nav className="flex-1 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.active ? "bg-violet-600/20 text-violet-400" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-800 pt-4 mt-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name ?? "Admin"}</p>
              <p className="text-xs text-gray-500">Platform Admin</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64">
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="font-display text-xl font-bold text-white">Platform Overview</h1>
            <p className="text-sm text-gray-500 mt-0.5">Admin dashboard — full platform visibility</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
              <Bell className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
                <div className={`w-9 h-9 rounded-xl ${kpi.color} flex items-center justify-center mb-3`}>
                  <kpi.icon className="w-4 h-4" />
                </div>
                <div className="font-display text-2xl font-bold text-white">{kpi.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
                <div className="text-xs text-gray-600 mt-1">{kpi.delta}</div>
              </div>
            ))}
          </div>

          {/* Quick Access Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Shield, label: "Provider Approvals", desc: "0 pending review", href: "/admin/providers", urgent: false },
              { icon: AlertTriangle, label: "Open Disputes", desc: "0 need attention", href: "/admin/disputes", urgent: false },
              { icon: Star, label: "Flagged Reviews", desc: "0 awaiting moderation", href: "/admin/reviews", urgent: false },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between p-5 rounded-2xl border transition-all group ${
                  item.urgent
                    ? "bg-red-900/20 border-red-800 hover:border-red-600"
                    : "bg-gray-900 border-gray-800 hover:border-gray-700"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${item.urgent ? "bg-red-900/50" : "bg-gray-800"} flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${item.urgent ? "text-red-400" : "text-gray-400"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>

          {/* Charts Placeholder */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-white">Booking Trends</h3>
                <Link href="/admin/analytics" className="text-xs text-violet-400 flex items-center gap-1">
                  Full analytics <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
                📊 Charts available in Phase 3 (FR-54)
              </div>
            </div>

            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-white">Reputation Tier Distribution</h3>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { tier: "Platinum", color: "tier-platinum", count: 0 },
                  { tier: "Gold", color: "tier-gold", count: 0 },
                  { tier: "Silver", color: "tier-silver", count: 0 },
                  { tier: "Bronze", color: "tier-bronze", count: 0 },
                ].map((t) => (
                  <div key={t.tier} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-sm ${t.color}`} />
                    <span className="text-xs text-gray-400 w-16">{t.tier}</span>
                    <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full w-0 bg-gray-700 rounded-full" />
                    </div>
                    <span className="text-xs text-gray-600 w-8 text-right">{t.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
