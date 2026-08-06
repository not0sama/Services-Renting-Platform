"use client";

import EscrowPanel from "@/components/EscrowPanel";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft, Clock, DollarSign, FileText } from "lucide-react";

export default function EscrowDemoPage() {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";
  const autoReleaseAt = new Date(Date.now() + (18 * 3600 + 42 * 60) * 1000).toISOString();

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: "var(--color-canvas)" }}>
      <div className="max-w-2xl mx-auto">
        <Link
          href="/customer/bookings"
          className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 hover:text-[var(--color-ink)] transition-colors"
          style={{ color: "var(--color-ink-muted)", textDecoration: "none" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> {t.nav.backToBookings}
        </Link>

        {/* Header context card */}
        <div className="card p-6 mb-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="badge badge-trust mb-2">
                {t.escrow.demoStatus}
              </span>
              <h1 className="font-display font-800 text-xl mb-1" style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--color-ink)", textAlign: isAr ? "right" : "left" }}>
                {t.escrow.demoTitle}
              </h1>
              <p className="text-xs mt-1" style={{ color: "var(--color-ink-soft)", textAlign: isAr ? "right" : "left" }}>
                {t.escrow.demoProviderLabel} <span className="font-semibold text-[var(--color-ink)]">Ahmad Al-Karimi</span> ({t.escrow.demoGoldTier})
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="data-value text-xl font-700" style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--color-ink)" }}>
                SAR 280.00
              </span>
              <p className="text-[11px]" style={{ color: "var(--color-trust)", fontWeight: 600 }}>
                {t.escrow.demoEscrowHeld}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--color-border)] text-xs">
            <div className="flex items-center gap-1.5" style={{ color: "var(--color-ink-soft)" }}>
              <Clock className="w-3.5 h-3.5" style={{ color: "var(--color-signal)" }} />
              {t.escrow.demoCompletedTime}
            </div>
            <div className="flex items-center gap-1.5" style={{ color: "var(--color-ink-soft)" }}>
              <DollarSign className="w-3.5 h-3.5" style={{ color: "var(--color-trust)" }} />
              {t.escrow.demoInvoice}
            </div>
            <div className="flex items-center gap-1.5" style={{ color: "var(--color-ink-soft)" }}>
              <FileText className="w-3.5 h-3.5" style={{ color: "var(--color-ink-muted)" }} />
              {t.escrow.demoCategory}
            </div>
          </div>
        </div>

        {/* Flagship Escrow Decision Panel */}
        <EscrowPanel
          bookingId={1042}
          autoReleaseAt={autoReleaseAt}
          onDecision={() => console.log("Decision updated")}
        />
      </div>
    </div>
  );
}
