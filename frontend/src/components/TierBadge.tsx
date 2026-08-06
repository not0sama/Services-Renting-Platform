"use client";

const TIER_CONFIG = {
  platinum: { label: "Platinum", tierClass: "tier-platinum" },
  gold: { label: "Gold", tierClass: "tier-gold" },
  silver: { label: "Silver", tierClass: "tier-silver" },
  bronze: { label: "Bronze", tierClass: "tier-bronze" },
};

const TIER_EMOJIS: Record<string, string> = {
  platinum: "💎",
  gold: "🥇",
  silver: "🥈",
  bronze: "🥉",
};

interface TierBadgeProps {
  tier: string;
  size?: "sm" | "md" | "lg";
}

export default function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const config = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] ?? TIER_CONFIG.bronze;
  const emoji = TIER_EMOJIS[tier] ?? "🥉";

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1 font-semibold",
    md: "text-xs px-2.5 py-1 gap-1 font-semibold",
    lg: "text-sm px-3 py-1.5 gap-1.5 font-bold",
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full ${sizeClasses} ${config.tierClass}`}>
      <span>{emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
