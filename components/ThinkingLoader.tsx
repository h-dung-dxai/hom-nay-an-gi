"use client";

import { Beef, CakeSlice, Coffee, EggFried, Fish, Salad, Sandwich, Shrimp, Soup } from "lucide-react";
import { useEffect, useState } from "react";

const ICONS = [Soup, Sandwich, EggFried, Salad, Fish, Beef, Shrimp, CakeSlice, Coffee];
const HINTS = ["Đang lật thực đơn…", "Đang hỏi ý bếp trưởng…", "Đang nếm thử vài món…", "Sắp xong rồi…"];

/** "Flipping through the menu": food icons pop in turn on a plate with rising steam. */
export function ThinkingLoader() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 550);
    return () => clearInterval(id);
  }, []);
  const Icon = ICONS[tick % ICONS.length];
  const hint = HINTS[Math.floor(tick / 4) % HINTS.length];

  return (
    <div className="card-glow flex h-56 flex-col items-center justify-center gap-4 rounded-3xl" role="status">
      <div className="relative" aria-hidden>
        <div className="absolute -top-7 left-1/2 flex -translate-x-1/2 gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="steam h-5 w-1 rounded-full bg-ember/40" style={{ animationDelay: `${i * 0.35}s` }} />
          ))}
        </div>
        <div className="plate flex size-20 items-center justify-center rounded-full">
          <Icon key={tick} className="pop size-9 text-chili" />
        </div>
      </div>
      <p className="flex items-end gap-1 font-semibold text-ink">
        Đang chọn món
        <span className="mb-1.5 flex gap-1" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="dot size-1.5 rounded-full bg-ember" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </span>
      </p>
      <p key={hint} className="fade-in -mt-2 text-sm text-muted">
        {hint}
      </p>
    </div>
  );
}
