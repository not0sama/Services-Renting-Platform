"use client";

import { useAuth } from "@/context/AuthContext";
import {
  Search, Bell, Sparkles, MapPin, Clock, Star, Shield,
  Zap, TrendingUp, Package, MessageCircle, Settings, LogOut, ChevronRight, ArrowRight,
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  { icon: Search, label: "Find a Service", href: "/customer/categories", color: "bg-violet-50 text-violet-600 border-violet-100" },
  { icon: Sparkles, label: "AI Assistant", href: "/customer/jobs/new?mode=ai", color: "bg-amber-50 text-amber-600 border-amber-100" },
  { icon: Package, label: "My Bookings", href: "/customer/bookings", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { icon: MessageCircle, label: "Messages", href: "/customer/messages", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
];

const navItems = [
  { icon: TrendingUp, label: "Dashboard", href: "/customer", active: true },
  { icon: Search, label: "Browse", href: "/customer/categories" },
  { icon: Package, label: "Bookings", href: "/customer/bookings" },
  { icon: MessageCircle, label: "Messages", href: "/customer/messages" },
  { icon: Bell, label: "Notifications", href: "/customer/notifications" },
  { icon: Settings, label: "Settings", href: "/customer/settings" },
];

export default function CustomerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col py-6 px-4 fixed left-0 top-0 h-full z-30">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 px-3 mb-8">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg text-gray-900">HireRent</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.active
                  ? "bg-violet-50 text-violet-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-100 pt-4 mt-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
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
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="font-display text-xl font-bold text-gray-900">
              Welcome back, {user?.name?.split(" ")[0]} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">What do you need help with today?</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/customer/notifications" className="relative w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Bell className="w-4.5 h-4.5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-violet-500 rounded-full" />
            </Link>
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto">
          {/* AI Assistant Banner */}
          <div className="relative bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 mb-6 overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white blur-2xl" />
            </div>
            <div className="relative flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-amber-300 text-xs font-semibold">AI Smart Assistant</span>
                </div>
                <h2 className="font-display text-xl font-bold text-white mb-1">
                  Just describe your problem
                </h2>
                <p className="text-white/75 text-sm">
                  Our AI will identify what you need, estimate costs, and match you with the top 3 providers instantly.
                </p>
              </div>
              <Link
                href="/customer/jobs/new?mode=ai"
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-violet-700 text-sm font-bold hover:bg-gray-50 transition-colors shadow-lg"
              >
                Try it <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={`flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border ${action.color.split(" ").find(c => c.startsWith("border"))!} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all`}
              >
                <div className={`w-11 h-11 rounded-xl ${action.color.split(" ").slice(0, 2).join(" ")} flex items-center justify-center border ${action.color.split(" ").find(c => c.startsWith("border"))!}`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-gray-700 text-center">{action.label}</span>
              </Link>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-gray-900">Recent Bookings</h3>
                <Link href="/customer/bookings" className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {/* Empty state */}
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <Package className="w-7 h-7 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">No bookings yet</p>
                <p className="text-xs text-gray-400 mb-4">Find a service and make your first booking</p>
                <Link href="/customer/categories" className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                  Browse Services →
                </Link>
              </div>
            </div>

            {/* Trust & Safety Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-display font-bold text-gray-900 mb-5">Why HireRent?</h3>
              <div className="space-y-4">
                {[
                  { icon: Shield, title: "Escrow Protection", desc: "Pay securely — funds released only when you're satisfied", color: "text-emerald-600 bg-emerald-50" },
                  { icon: Star, title: "Verified Providers", desc: "All providers go through identity & document verification", color: "text-amber-600 bg-amber-50" },
                  { icon: Sparkles, title: "AI Best Match", desc: "Our AI ranks offers by price, distance, rating & speed", color: "text-violet-600 bg-violet-50" },
                  { icon: MapPin, title: "Live Tracking", desc: "Track your provider's location in real time", color: "text-blue-600 bg-blue-50" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
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
