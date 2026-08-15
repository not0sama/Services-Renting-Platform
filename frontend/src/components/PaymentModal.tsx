"use client";

import { useState } from "react";
import { Banknote, CreditCard, ArrowRight, ShieldCheck, Check, X, Building2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (paymentMethod: "cash" | "transfer" | "card") => void;
  title?: string;
  amount?: number;
  submitting?: boolean;
}

export default function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  amount,
  submitting = false,
}: PaymentModalProps) {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const [selectedMethod, setSelectedMethod] = useState<"cash" | "transfer" | "card">("card");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-md relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center mb-3">
            <CreditCard className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            {title || (isAr ? "اختر طريقة الدفع" : "Select Payment Method")}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isAr
              ? "اختر وسيلة الدفع المناسبة لإتمام الحجز بنجاح"
              : "Choose your preferred payment option to complete your booking"}
          </p>
          {amount !== undefined && (
            <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 flex justify-between items-center text-sm font-bold">
              <span className="text-gray-600">{isAr ? "المبلغ الإجمالي:" : "Total Amount:"}</span>
              <span className="text-violet-700 text-base">{amount} LYD</span>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {/* Cash */}
          <button
            type="button"
            onClick={() => setSelectedMethod("cash")}
            className={`w-full p-4 rounded-2xl border-2 transition text-left rtl:text-right flex items-center gap-3.5 ${
              selectedMethod === "cash"
                ? "border-emerald-500 bg-emerald-50/50 shadow-2xs"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className={`p-3 rounded-xl ${
                selectedMethod === "cash" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              <Banknote className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 flex items-center justify-between">
                <span>{isAr ? "الدفع نقداً (كاش)" : "Cash on Delivery / In Person"}</span>
                {selectedMethod === "cash" && <Check className="w-4 h-4 text-emerald-600" />}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isAr ? "ادفع مباشرة للمحترف نقداً عند إتمام الخدمة" : "Pay the provider directly after service completion"}
              </p>
            </div>
          </button>

          {/* Transfer */}
          <button
            type="button"
            onClick={() => setSelectedMethod("transfer")}
            className={`w-full p-4 rounded-2xl border-2 transition text-left rtl:text-right flex items-center gap-3.5 ${
              selectedMethod === "transfer"
                ? "border-indigo-500 bg-indigo-50/50 shadow-2xs"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className={`p-3 rounded-xl ${
                selectedMethod === "transfer" ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-700"
              }`}
            >
              <Building2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 flex items-center justify-between">
                <span>{isAr ? "تحويل بنكي / محفظة" : "Bank Transfer / Local Wallet"}</span>
                {selectedMethod === "transfer" && <Check className="w-4 h-4 text-indigo-600" />}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isAr ? "تحويل مباشر عبر المصرف أو المحفظة الإلكترونية" : "Direct local bank or digital wallet transfer"}
              </p>
            </div>
          </button>

          {/* Card */}
          <button
            type="button"
            onClick={() => setSelectedMethod("card")}
            className={`w-full p-4 rounded-2xl border-2 transition text-left rtl:text-right flex items-center gap-3.5 ${
              selectedMethod === "card"
                ? "border-violet-500 bg-violet-50/50 shadow-2xs"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className={`p-3 rounded-xl ${
                selectedMethod === "card" ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-700"
              }`}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>{isAr ? "بطاقة ائتمان / مدى (إسكرو)" : "Credit / Debit Card (Escrow)"}</span>
                  <span className="text-[10px] bg-violet-100 text-violet-700 font-semibold px-2 py-0.5 rounded-full">
                    {isAr ? "دفع آمن" : "Checkout"}
                  </span>
                </span>
                {selectedMethod === "card" && <Check className="w-4 h-4 text-violet-600" />}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isAr
                  ? "تحويل إلى صفحة الدفع وتجميد المبلغ في الإسكرو لحمايتك"
                  : "Redirect to checkout page with Escrow protection"}
              </p>
            </div>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition"
          >
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selectedMethod)}
            disabled={submitting}
            className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? (
              <span>{isAr ? "جاري المعالجة..." : "Processing..."}</span>
            ) : (
              <>
                <span>{isAr ? "متابعة" : "Confirm"}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
