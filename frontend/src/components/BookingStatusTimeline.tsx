"use client";

import { CheckCircle, Clock, MapPin, Wrench, Star, AlertCircle } from "lucide-react";

export type BookingStatusType =
  | "pending"
  | "confirmed"
  | "en_route"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "revision_requested";

const STEPS: Array<{ key: BookingStatusType; label: string; icon: React.ElementType }> = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "en_route", label: "En Route", icon: MapPin },
  { key: "in_progress", label: "In Progress", icon: Wrench },
  { key: "completed", label: "Completed", icon: Star },
];

const STATUS_ORDER: BookingStatusType[] = [
  "pending", "confirmed", "en_route", "in_progress", "completed",
];

interface Props {
  status: BookingStatusType;
  className?: string;
}

export function BookingStatusTimeline({ status, className = "" }: Props) {
  const isCancelled = status === "cancelled";
  const isRevision = status === "revision_requested";

  const activeIndex = STATUS_ORDER.indexOf(
    isRevision ? "completed" : (STATUS_ORDER.includes(status) ? status : "pending")
  );

  return (
    <div className={`w-full ${className}`}>
      {isCancelled ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Booking Cancelled</span>
        </div>
      ) : isRevision ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Revision Requested</span>
        </div>
      ) : (
        <div className="flex items-center">
          {STEPS.map((step, index) => {
            const isActive = index === activeIndex;
            const isDone = index < activeIndex;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isActive
                        ? "bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-200"
                        : "bg-gray-100 border-gray-200 text-gray-400"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive ? "text-violet-700" : isDone ? "text-emerald-600" : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mb-5 mx-1 rounded-full transition-all ${
                      index < activeIndex ? "bg-emerald-400" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
