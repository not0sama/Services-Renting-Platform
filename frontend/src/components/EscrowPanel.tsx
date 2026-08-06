"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Edit3, AlertTriangle, Clock, Loader2, CheckCircle } from "lucide-react";
import api from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface EscrowPanelProps {
  bookingId: number;
  paymentId?: number;
  autoReleaseAt?: string | null;
  onDecision?: () => void;
}

function Countdown({ targetIso }: { targetIso: string }) {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";
  const [secs, setSecs] = useState(() => Math.max(0, Math.floor((new Date(targetIso).getTime() - Date.now()) / 1000)));

  useEffect(() => {
    if (secs <= 0) return;
    const interval = setInterval(() => {
      setSecs(s => {
        if (s <= 1) { clearInterval(interval); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (secs <= 0) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium"
        style={{
          background: "var(--color-caution-light)",
          border: "1px solid var(--color-caution-border)",
          color: "var(--color-caution)",
        }}
        role="status"
        aria-live="polite"
      >
        <Clock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
        <span>{isAr ? "جاري الإطلاق التلقائي الآن..." : "Auto-releasing now…"}</span>
      </div>
    );
  }

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pct = Math.min(100, (secs / (72 * 3600)) * 100);
  const isLow = secs < 3600 * 4;

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: isLow ? "var(--color-caution-light)" : "var(--color-canvas)",
        border: `1px solid ${isLow ? "var(--color-caution-border)" : "var(--color-border)"}`,
      }}
      role="timer"
      aria-live="polite"
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className="flex items-center gap-1.5 text-xs font-medium"
          style={{ color: isLow ? "var(--color-caution)" : "var(--color-ink-soft)" }}
        >
          <Clock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          {isLow ? t.escrow.autoReleasesSoon : t.escrow.autoReleasesIn}
        </span>
        <span
          className="data-value font-600 text-sm"
          style={{
            fontFamily: "var(--font-mono)",
            fontWeight: 600,
            color: isLow ? "var(--color-caution)" : "var(--color-ink)",
            letterSpacing: "0.02em",
          }}
        >
          {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: isLow ? "rgba(220,38,38,0.15)" : "var(--color-border)" }}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full drain-bar-fill"
          style={{
            width: `${pct}%`,
            background: isLow ? "var(--color-caution)" : "var(--color-signal)",
          }}
        />
      </div>
      <p className="text-[11px] mt-1.5" style={{ color: "var(--color-ink-muted)", textAlign: isAr ? "right" : "left" }}>
        {t.escrow.autoReleaseHelp}
      </p>
    </div>
  );
}

export default function EscrowPanel({ bookingId, autoReleaseAt, onDecision }: EscrowPanelProps) {
  const { lang, t } = useLanguage();
  const isAr = lang === "ar";
  const [loading, setLoading] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const accept = async () => {
    setLoading("accept");
    setError(null);
    try {
      await api.post(`/bookings/${bookingId}/accept-work`);
      setDone("accepted");
      onDecision?.();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? (isAr ? "فشل القبول. يرجى المحاولة مجدداً." : "Failed to accept. Please try again."));
    } finally { setLoading(null); }
  };

  const requestRevision = async () => {
    if (!revisionNotes.trim()) return;
    setLoading("revision");
    setError(null);
    try {
      await api.post(`/bookings/${bookingId}/request-revision`, { notes: revisionNotes });
      setDone("revision");
      onDecision?.();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? (isAr ? "فشل طلب التعديل." : "Failed to request revision."));
    } finally { setLoading(null); }
  };

  const openDispute = async () => {
    if (!disputeReason.trim()) return;
    setLoading("dispute");
    setError(null);
    try {
      await api.post(`/disputes/bookings/${bookingId}/open`, { reason: disputeReason });
      setDone("dispute");
      onDecision?.();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? (isAr ? "فشل فتح النزاع." : "Failed to open dispute."));
    } finally { setLoading(null); }
  };

  if (done === "accepted") return (
    <div
      className="flex items-start gap-3 rounded-2xl p-5"
      style={{ background: "var(--color-trust-light)", border: "1.5px solid var(--color-trust-border)" }}
      role="status"
    >
      <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--color-trust)" }} aria-hidden="true" />
      <div>
        <p className="text-sm font-600 mb-0.5" style={{ fontWeight: 600, color: "var(--color-trust)", textAlign: isAr ? "right" : "left" }}>
          {isAr ? "تم قبول العمل — تم إطلاق المبلغ" : "Work accepted — payment released"}
        </p>
        <p className="text-xs" style={{ color: "var(--color-ink-soft)", textAlign: isAr ? "right" : "left" }}>
          {isAr ? "تم رفع حجز الضمان وتحويل المبلغ لمقدم الخدمة." : "The escrow hold has been lifted and payment transferred to the provider."}
        </p>
      </div>
    </div>
  );

  if (done === "revision") return (
    <div
      className="flex items-start gap-3 rounded-2xl p-5"
      style={{ background: "#F8FAFC", border: "1.5px solid #CBD5E1" }}
      role="status"
    >
      <Edit3 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#475569" }} aria-hidden="true" />
      <div>
        <p className="text-sm font-600 mb-0.5" style={{ fontWeight: 600, color: "#334155", textAlign: isAr ? "right" : "left" }}>
          {isAr ? "تم طلب التعديل — تم إخطار مقدم الخدمة" : "Revision requested — provider notified"}
        </p>
        <p className="text-xs" style={{ color: "var(--color-ink-soft)", textAlign: isAr ? "right" : "left" }}>
          {isAr ? "يبقى المبلغ محتجزاً في الضمان حتى توافق على العمل المعدل." : "Payment remains held in escrow until you accept the revised work."}
        </p>
      </div>
    </div>
  );

  if (done === "dispute") return (
    <div
      className="flex items-start gap-3 rounded-2xl p-5"
      style={{ background: "var(--color-caution-light)", border: "1.5px solid var(--color-caution-border)" }}
      role="status"
    >
      <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "var(--color-caution)" }} aria-hidden="true" />
      <div>
        <p className="text-sm font-600 mb-0.5" style={{ fontWeight: 600, color: "var(--color-caution)", textAlign: isAr ? "right" : "left" }}>
          {isAr ? "تم فتح النزاع — مراجعة الإدارة خلال 48 ساعة" : "Dispute opened — admin review within 48 hours"}
        </p>
        <p className="text-xs" style={{ color: "var(--color-ink-soft)", textAlign: isAr ? "right" : "left" }}>
          {isAr ? "المبلغ مجمع ومجمد في الضمان أثناء مراجعة النزاع." : "Payment is frozen in escrow while the dispute is under review."}
        </p>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1.5px solid var(--color-border)" }}>
      {/* Header */}
      <div
        className="px-5 py-4 flex items-start gap-3"
        style={{
          background: "var(--color-panel)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "var(--color-trust-light)" }}
        >
          <ShieldCheck className="w-4.5 h-4.5" style={{ color: "var(--color-trust)" }} aria-hidden="true" />
        </div>
        <div>
          <h3
            className="font-display font-700 text-sm mb-0.5"
            style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--color-ink)", textAlign: isAr ? "right" : "left" }}
          >
            {t.escrow.title}
          </h3>
          <p className="text-xs" style={{ color: "var(--color-ink-muted)", textAlign: isAr ? "right" : "left" }}>
            {t.escrow.subtitle}
          </p>
        </div>
      </div>

      {/* Countdown */}
      {autoReleaseAt && (
        <div className="px-5 pt-4">
          <Countdown targetIso={autoReleaseAt} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="mx-5 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
          style={{ background: "var(--color-caution-light)", color: "var(--color-caution)", border: "1px solid var(--color-caution-border)" }}
          role="alert"
        >
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="px-5 py-4 space-y-3">
        {/* ACCEPT */}
        <div>
          <button
            onClick={accept}
            disabled={!!loading}
            className="btn-trust w-full"
            style={{ padding: "12px 20px", fontSize: "14px" }}
          >
            {loading === "accept" ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            )}
            <span>{t.escrow.acceptBtn}</span>
          </button>
          <p className="text-[11px] mt-1.5 text-center" style={{ color: "var(--color-ink-muted)" }}>
            {t.escrow.acceptHelp}
          </p>
        </div>

        {/* REQUEST REVISION */}
        {!showRevisionForm ? (
          <div>
            <button
              onClick={() => setShowRevisionForm(true)}
              disabled={!!loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors hover:bg-slate-50"
              style={{
                padding: "11px 20px",
                background: "transparent",
                border: "2px dashed #94A3B8",
                color: "#334155",
                cursor: "pointer",
                fontFamily: "var(--font-display)",
                fontWeight: 500,
              }}
            >
              <Edit3 className="w-4 h-4" style={{ color: "#475569" }} aria-hidden="true" />
              {t.escrow.revisionBtn}
            </button>
            <p className="text-[11px] mt-1.5 text-center" style={{ color: "var(--color-ink-muted)" }}>
              {t.escrow.revisionHelp}
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl p-4"
            style={{ border: "2px dashed #94A3B8", background: "#F8FAFC" }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <Edit3 className="w-3.5 h-3.5" style={{ color: "#475569" }} aria-hidden="true" />
              <label
                htmlFor="revision-notes"
                className="text-xs font-600"
                style={{ fontWeight: 600, color: "#334155" }}
              >
                {isAr ? "صف ما الذي يتطلب التعديل" : "Describe what needs to be fixed"}
              </label>
            </div>
            <textarea
              id="revision-notes"
              value={revisionNotes}
              onChange={e => setRevisionNotes(e.target.value)}
              rows={3}
              className="input mb-3"
              style={{ fontSize: "13px" }}
              placeholder={isAr ? "مثال: أنبوب المياه لا يزال ينقط قليلاً من الناحية اليسرى..." : "e.g. The pipe still drips slightly on the left side near the joint…"}
              aria-required="true"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowRevisionForm(false); setRevisionNotes(""); }}
                className="btn-ghost flex-1"
                style={{ padding: "8px 16px", fontSize: "13px" }}
              >
                {t.common.cancel}
              </button>
              <button
                onClick={requestRevision}
                disabled={!!loading || !revisionNotes.trim()}
                className="flex-1 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                style={{
                  padding: "8px 16px",
                  background: "#334155",
                  color: "white",
                  border: "none",
                  cursor: revisionNotes.trim() ? "pointer" : "not-allowed",
                  opacity: !revisionNotes.trim() ? 0.5 : 1,
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                }}
              >
                {loading === "revision" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Edit3 className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                {t.common.submit}
              </button>
            </div>
          </div>
        )}

        {/* OPEN DISPUTE */}
        {!showDisputeForm ? (
          <div>
            <button
              onClick={() => setShowDisputeForm(true)}
              disabled={!!loading}
              className="btn-caution w-full"
              style={{ padding: "10px 20px", fontSize: "13px" }}
            >
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.escrow.disputeBtn}</span>
            </button>
            <p className="text-[11px] mt-1.5 text-center" style={{ color: "var(--color-ink-muted)" }}>
              {t.escrow.disputeHelp}
            </p>
          </div>
        ) : (
          <div
            className="rounded-xl p-4"
            style={{ border: "2px solid var(--color-caution-border)", background: "var(--color-caution-light)" }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: "var(--color-caution)" }} aria-hidden="true" />
              <label
                htmlFor="dispute-reason"
                className="text-xs font-600"
                style={{ fontWeight: 600, color: "var(--color-caution)" }}
              >
                {isAr ? "⚠ سبب النزاع" : "⚠ Reason for dispute"}
              </label>
            </div>
            <textarea
              id="dispute-reason"
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              rows={3}
              className="input mb-3"
              style={{ fontSize: "13px", borderColor: "var(--color-caution-border)" }}
              placeholder={isAr ? "صف المشكلة بالتفصيل — ما تم الاتفاق عليه مقارنة بما تم تسليمه..." : "Describe the issue in detail — what was promised vs. what was delivered…"}
              aria-required="true"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowDisputeForm(false); setDisputeReason(""); }}
                className="btn-ghost flex-1"
                style={{ padding: "8px 16px", fontSize: "13px" }}
              >
                {t.common.cancel}
              </button>
              <button
                onClick={openDispute}
                disabled={!!loading || !disputeReason.trim()}
                className="flex-1 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5"
                style={{
                  padding: "8px 16px",
                  background: disputeReason.trim() ? "var(--color-caution)" : "rgba(220,38,38,0.4)",
                  color: "white",
                  border: "none",
                  cursor: disputeReason.trim() ? "pointer" : "not-allowed",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                }}
              >
                {loading === "dispute" ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                {t.common.submit}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="px-5 py-3 flex items-center gap-2"
        style={{
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-canvas)",
        }}
      >
        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--color-trust)" }} aria-hidden="true" />
        <p className="text-[11px]" style={{ color: "var(--color-ink-muted)", textAlign: isAr ? "right" : "left" }}>
          {t.escrow.protectionFooter}
        </p>
      </div>
    </div>
  );
}
