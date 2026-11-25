"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCw, Soup } from "lucide-react";
import { DishCard } from "@/components/DishCard";
import { DishThumb } from "@/components/DishImage";
import { ThinkingLoader } from "@/components/ThinkingLoader";
import { MealChips } from "@/components/MealChips";
import { mealFromHour, type Meal } from "@/lib/meal";
import { errorText, FALLBACK_ERROR, recentExclude, type Dish, type Suggestion } from "@/lib/suggestion";

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
    let message = FALLBACK_ERROR;
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ meal: m, localTime: hhmm(new Date()), exclude: recentExclude(shown.current) }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        message = errorText(data);
        throw new Error(message);
      }
      const s = data as Suggestion;
      shown.current.push(s.main.name, ...s.alternatives.map((d) => d.name));
      setSuggestion(s);
      setStatus("ready");
    } catch {
      setError(message); // never show raw fetch/JSON errors (often English) to the user
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
        <h1 className="flex items-center justify-center gap-2 text-3xl font-extrabold">
          <span className="text-gradient-warm">
          Hôm nay ăn gì?</span> <Soup aria-hidden className="size-8 text-ember" />
        </h1>
        <p className="mt-1 text-sm text-muted">Để mình chọn giúp bạn</p>
      </header>

      <MealChips active={meal} onPick={pickMeal} disabled={status === "loading"} />

      <div aria-live="polite">
        {status === "loading" && (
          <ThinkingLoader />
        )}
        {status === "error" && (
          <div className="card-glow rounded-3xl p-6 text-center">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => meal && fetchSuggestion(meal)}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-warm px-5 font-semibold text-white shadow-md shadow-chili/25"
            >
              <RotateCw aria-hidden className="size-4" /> Thử lại
            </button>
          </div>
        )}
        {status === "ready" && suggestion && <DishCard main={suggestion.main} />}
      </div>

      {status === "ready" && suggestion && (
        <>
          {suggestion.alternatives.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-muted">Hoặc:</span>
              {suggestion.alternatives.map((d) => (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => swap(d)}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-paper py-1 pl-1.5 pr-4 transition hover:border-turmeric hover:text-chili"
                >
                  <DishThumb keyword={d.searchKeyword} />
                  {d.name}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => meal && fetchSuggestion(meal)}
            className="mx-auto inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-warm px-8 text-lg font-semibold text-white shadow-lg shadow-chili/30 transition hover:brightness-110 active:scale-[0.98]"
          >
            <RotateCw aria-hidden className="size-5" /> Đổi món
          </button>
        </>
      )}
    </main>
  );
}
