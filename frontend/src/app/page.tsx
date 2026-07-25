import type { Metadata } from "next";
import Link from "next/link";
import {
  Star,
  Shield,
  Zap,
  MapPin,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle,
  ArrowRight,
  Search,
  Wrench,
  Home,
  Camera,
  Laptop,
  Brush,
  Truck,
  Heart,
} from "lucide-react";

export const metadata: Metadata = {
  title: "HireRent — Find Trusted Professionals for Every Need",
  description:
    "Browse thousands of verified professionals. Compare offers by price, distance, and rating. Book instantly or post a job for custom quotes — with AI-powered matching.",
};

const categories = [
  { icon: Wrench, label: "Home Repairs", color: "bg-blue-100 text-blue-600" },
  { icon: Home, label: "Cleaning", color: "bg-green-100 text-green-600" },
  { icon: Camera, label: "Photography", color: "bg-purple-100 text-purple-600" },
  { icon: Laptop, label: "Tech Support", color: "bg-indigo-100 text-indigo-600" },
  { icon: Brush, label: "Painting", color: "bg-orange-100 text-orange-600" },
  { icon: Truck, label: "Moving", color: "bg-red-100 text-red-600" },
  { icon: Heart, label: "Personal Care", color: "bg-pink-100 text-pink-600" },
  { icon: Zap, label: "Electrical", color: "bg-yellow-100 text-yellow-600" },
];

const steps = [
  {
    step: "01",
    title: "Post or Browse",
    description:
      "Describe your job in plain language or browse available services near you. Our AI understands what you need.",
    icon: Search,
    color: "from-violet-500 to-purple-600",
  },
  {
    step: "02",
    title: "Compare & Choose",
    description:
      "Get offers from verified providers. Compare by price, rating, and distance. AI highlights the best match.",
    icon: Star,
    color: "from-blue-500 to-indigo-600",
  },
  {
    step: "03",
    title: "Book & Pay Safely",
    description:
      "Pay via our secure escrow system. Funds are released only when you're fully satisfied with the work.",
    icon: Shield,
    color: "from-emerald-500 to-teal-600",
  },
];

const stats = [
  { value: "10,000+", label: "Verified Providers" },
  { value: "50,000+", label: "Jobs Completed" },
  { value: "4.9 ★", label: "Average Rating" },
  { value: "100%", label: "Escrow Protected" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-gray-900">HireRent</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                How it works
              </Link>
              <Link href="#categories" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Categories
              </Link>
              <Link href="/help" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Help
              </Link>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors hidden sm:block"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-primary shadow-lg hover:opacity-90 transition-opacity"
              >
                Get started
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-16 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] rounded-full bg-violet-100/40 blur-3xl -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-amber-100/30 blur-3xl translate-y-1/4 -translate-x-1/4" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold mb-6 animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Professional Matching
            </div>

            {/* Headline */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6 animate-slide-up">
              Find trusted{" "}
              <span className="text-gradient">professionals</span>{" "}
              for any job
            </h1>

            <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up animate-delay-100">
              Compare offers by price, distance, and rating. Book instantly or let AI match you
              with the best provider — payments secured by escrow.
            </p>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-6 animate-slide-up animate-delay-200">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="What service do you need?"
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="relative sm:w-44">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                />
              </div>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-bold text-white gradient-primary shadow-lg hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Find Services
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* AI Shortcut */}
            <div className="animate-slide-up animate-delay-300">
              <Link
                href="/register?mode=ai"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium hover:bg-amber-100 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Or just describe your problem — let AI do the rest
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-16 animate-slide-up animate-delay-400">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-2xl font-extrabold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Strip ─────────────────────────────────────────────── */}
      <section className="py-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Verified providers with ID checks
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Two-way ratings & reviews
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-violet-500" />
              Escrow-protected payments
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Urgent same-day service available
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────────────── */}
      <section id="categories" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Browse by category
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From home repairs to professional services — find exactly what you need.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.label}
                href="/register"
                className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 card-hover"
              >
                <div className={`w-12 h-12 rounded-xl ${cat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-gray-700 text-center">{cat.label}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              View all categories
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              How it works
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              From finding the right professional to getting the job done — we've made it simple.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-gray-200 to-transparent -translate-x-8 z-0" />
                )}
                <div className="relative bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-bold text-gray-400 tracking-widest mb-2">
                    STEP {step.step}
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Provider CTA ────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl gradient-primary overflow-hidden p-10 md:p-16 text-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-white blur-3xl" />
            </div>
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to grow your business?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of providers who earn more by connecting with customers who need their skills.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register?role=provider"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-violet-700 font-bold hover:bg-gray-50 transition-colors shadow-xl"
                >
                  Become a Provider
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 text-white font-semibold border border-white/30 hover:bg-white/20 transition-colors"
                >
                  Find a Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-white">HireRent</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link href="/help" className="hover:text-white transition-colors">Help Center</Link>
              <Link href="/register?role=provider" className="hover:text-white transition-colors">Become a Provider</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-xs text-gray-600">
            © {new Date().getFullYear()} HireRent. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
