"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface RatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

const SIZES = { sm: "w-5 h-5", md: "w-7 h-7", lg: "w-9 h-9" };

export function RatingInput({ value, onChange, size = "md", readonly = false }: RatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const iconClass = SIZES[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hovered || value);
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            onClick={() => !readonly && onChange(star)}
            className={`transition-transform ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
          >
            <Star
              className={`${iconClass} transition-colors ${
                filled ? "fill-amber-400 text-amber-400" : "fill-transparent text-gray-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
