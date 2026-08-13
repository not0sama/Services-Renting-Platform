"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import {
  Zap,
  Home,
  Grid,
  Briefcase,
  Calendar,
  Sparkles,
  Heart,
  Bell,
  Settings,
  DollarSign,
  Star,
  UserCheck,
  Shield,
  ShieldAlert,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Wrench,
  Clock,
  FileText,
} from "lucide-react";

interface SidebarProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";

  // Sidebar collapse state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("hrp_sidebar_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem("hrp_sidebar_collapsed", String(nextState));
  };

  // Determine navigation items based on current path / user role
  const role = user?.role || (pathname.startsWith("/provider") ? "provider" : pathname.startsWith("/admin") ? "admin" : "customer");

  const customerNav = [
    { label: isAr ? "الرئيسية" : "Dashboard", href: "/customer", icon: Home },
    { label: isAr ? "تصفح الخدمات" : "Browse Services", href: "/customer/categories", icon: Grid },
    { label: isAr ? "طلباتي وعروضي" : "Jobs & Bids", href: "/customer/jobs", icon: Briefcase },
    { label: isAr ? "حجوزاتي" : "Bookings & Escrow", href: "/customer/bookings", icon: Calendar },
    { label: isAr ? "المساعد الذكي" : "AI Smart Assist", href: "/customer/ai-assist", icon: Sparkles },
    { label: isAr ? "المفضلة" : "Saved Providers", href: "/customer/favorites", icon: Heart },
    { label: isAr ? "الإشعارات" : "Notifications", href: "/customer/notifications", icon: Bell },
    { label: isAr ? "الإعدادات" : "Account Settings", href: "/customer/settings", icon: Settings },
  ];

  const providerNav = [
    { label: isAr ? "لوحة التحكم" : "Dashboard", href: "/provider", icon: Home },
    { label: isAr ? "باقات الخدمات" : "My Services", href: "/provider/services", icon: Wrench },
    { label: isAr ? "فرص العمل" : "Job Opportunities", href: "/provider/jobs", icon: Briefcase },
    { label: isAr ? "العروض المقدمة" : "My Offers", href: "/provider/offers", icon: FileText },
    { label: isAr ? "التقويم والمواعيد" : "Availability", href: "/provider/availability", icon: Clock },
    { label: isAr ? "الأرباح والإسكرو" : "Earnings & Escrow", href: "/provider/earnings", icon: DollarSign },
    { label: isAr ? "التقييمات" : "Reviews & Rating", href: "/provider/reviews", icon: Star },
    { label: isAr ? "الملف الشخصي" : "Provider Profile", href: "/provider/profile", icon: UserCheck },
    { label: isAr ? "الإشعارات" : "Notifications", href: "/provider/notifications", icon: Bell },
  ];

  const adminNav = [
    { label: isAr ? "نظرة عامة" : "Overview", href: "/admin", icon: Home },
    { label: isAr ? "إدارة النزاعات" : "Disputes Escrow", href: "/admin/disputes", icon: ShieldAlert },
    { label: isAr ? "توثيق المحترفين" : "Verifications", href: "/admin/verification", icon: Shield },
    { label: isAr ? "إدارة المستخدمين" : "Users Management", href: "/admin/users", icon: Users },
    { label: isAr ? "التقارير والتحليلات" : "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  const navItems = role === "admin" ? adminNav : role === "provider" ? providerNav : customerNav;

  return (
    <div className="min-h-screen flex bg-[var(--color-canvas)] text-[var(--color-ink)]">
      {/* ── PERSISTENT EXPANDABLE / COLLAPSIBLE SIDEBAR ────────── */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-[var(--color-border)] flex flex-col justify-between transition-all duration-300 ease-in-out shadow-xs ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Top Header & Brand */}
        <div>
          <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--color-border)]">
            <Link href="/" className="flex items-center gap-3 overflow-hidden text-decoration-none">
              <div className="w-9 h-9 rounded-xl bg-[var(--color-signal)] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                <Zap className="w-4.5 h-4.5 fill-white" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="font-display font-bold text-base text-[var(--color-ink)] leading-none">
                    HireRent
                  </span>
                  <span className="text-[10px] font-semibold tracking-wider text-[var(--color-ink-muted)] uppercase mt-0.5">
                    {role} portal
                  </span>
                </div>
              )}
            </Link>

            {/* Expand / Collapse Button */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-[var(--color-ink-soft)] hover:text-[var(--color-ink)] hover:bg-gray-100 transition-colors cursor-pointer"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const isActive = pathname === item.href || (item.href !== "/customer" && item.href !== "/provider" && item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all relative group ${
                    isActive
                      ? "bg-[var(--color-signal)] text-white shadow-xs"
                      : "text-[var(--color-ink-soft)] hover:bg-gray-100 hover:text-[var(--color-ink)]"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <IconComp className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-white" : "text-[var(--color-ink-soft)] group-hover:text-[var(--color-ink)]"}`} />
                  
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}

                  {/* Active Indicator Bar */}
                  {isActive && !isCollapsed && (
                    <div className="w-1.5 h-4 bg-white/40 rounded-full ml-auto" />
                  )}

                  {/* Tooltip on Collapsed Mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-md">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Section */}
        <div className="p-3 border-t border-[var(--color-border)] bg-gray-50/50">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                {!isCollapsed && (
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--color-ink)] truncate">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-[var(--color-ink-muted)] truncate capitalize">
                      {user.role}
                    </p>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold text-[var(--color-signal)] hover:bg-blue-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {!isCollapsed && <span>{isAr ? "تسجيل الدخول" : "Log In"}</span>}
            </Link>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT WRAPPER WITH DYNAMIC MARGIN ──────────── */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Persistent Top Header */}
        <header className="h-16 bg-white border-b border-[var(--color-border)] px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--color-ink-muted)]">
              {role.toUpperCase()} WORKSPACE
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${role}/notifications`}
              className="relative p-2 rounded-xl border border-[var(--color-border)] text-[var(--color-ink-soft)] hover:bg-gray-100 transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--color-signal)]" />
            </Link>
            <LanguageSwitcher />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
