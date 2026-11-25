import { MEAL_LABELS, type Meal } from "@/lib/meal";

export function MealChips({ active, onPick, disabled }: { active: Meal | null; onPick: (m: Meal) => void; disabled: boolean }) {
  return (
    <div role="group" aria-label="Chọn bữa" className="flex flex-wrap justify-center gap-2">
      {(Object.keys(MEAL_LABELS) as Meal[]).map((m) => (
        <button
          key={m}
          type="button"
          aria-pressed={m === active}
          disabled={disabled}
          onClick={() => onPick(m)}
          className={`min-h-11 rounded-full px-4 text-sm font-semibold transition disabled:opacity-60 ${
            m === active
              ? "bg-orange-600 text-white shadow"
              : "bg-orange-100 text-orange-900 hover:bg-orange-200 dark:bg-orange-950 dark:text-orange-100"
          }`}
        >
          {MEAL_LABELS[m]}
        </button>
      ))}
    </div>
  );
}
