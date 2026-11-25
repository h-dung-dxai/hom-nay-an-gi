"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DishCard } from "@/components/DishCard";
import { MealChips } from "@/components/MealChips";
import { mealFromHour, type Meal } from "@/lib/meal";
import type { Dish, Suggestion } from "@/lib/suggestion";

type Status = "loading" | "ready" | "error";

const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

export default function Home() {
  const [meal, setMeal] = useState<Meal | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");
  const shown = useRef<string[]>([]); // every dish shown this session for this meal

  const fetchSuggestion = useCallback(async (m: Meal) => {
    setStatus("loading");
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ meal: m, localTime: hhmm(new Date()), exclude: shown.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const s = data as Suggestion;
      shown.current.push(s.main.name, ...s.alternatives.map((d) => d.name));
      setSuggestion(s);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "Không gợi ý được, thử lại nhé");
      setStatus("error");
    }
  }, []);

  const pickMeal = useCallback(
    (m: Meal) => {
      setMeal(m);
      shown.current = [];
      fetchSuggestion(m);
    },
    [fetchSuggestion],
  );

  // Meal comes from the device clock, so it must be computed after hydration, in the browser.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    pickMeal(mealFromHour(new Date().getHours()));
  }, [pickMeal]);

  const swap = (alt: Dish) => {
    if (!suggestion) return;
    const { main } = suggestion;
    setSuggestion({
      main: { ...alt, reason: alt.reason ?? "Đổi gió với món này nhé!" },
      alternatives: suggestion.alternatives.map((d) => (d === alt ? main : d)),
    });
  };

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-col gap-6 px-4 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold">Hôm nay ăn gì? 🍜</h1>
        <p className="mt-1 text-sm opacity-70">Để mình chọn giúp bạn</p>
      </header>

      <MealChips active={meal} onPick={pickMeal} disabled={status === "loading"} />

      <div aria-live="polite">
        {status === "loading" && (
          <div className="h-48 animate-pulse rounded-3xl bg-orange-100 dark:bg-stone-800" aria-label="Đang chọn món" />
        )}
        {status === "error" && (
          <div className="rounded-3xl bg-red-50 p-6 text-center dark:bg-red-950">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => meal && fetchSuggestion(meal)}
              className="mt-4 min-h-11 rounded-full bg-orange-600 px-5 font-semibold text-white"
            >
              Thử lại
            </button>
          </div>
        )}
        {status === "ready" && suggestion && <DishCard main={suggestion.main} />}
      </div>

      {status === "ready" && suggestion && (
        <>
          {suggestion.alternatives.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="opacity-70">Hoặc:</span>
              {suggestion.alternatives.map((d) => (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => swap(d)}
                  className="min-h-11 rounded-full border border-orange-300 px-4 hover:bg-orange-50 dark:border-stone-700 dark:hover:bg-stone-800"
                >
                  {d.name}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => meal && fetchSuggestion(meal)}
            className="mx-auto min-h-12 rounded-full bg-orange-600 px-8 text-lg font-semibold text-white shadow hover:bg-orange-700"
          >
            🔄 Đổi món
          </button>
        </>
      )}
    </main>
  );
}
