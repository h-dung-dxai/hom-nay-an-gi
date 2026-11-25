import { mapsSearchUrl } from "@/lib/maps";
import type { Suggestion } from "@/lib/suggestion";

export function DishCard({ main }: { main: Suggestion["main"] }) {
  return (
    <section className="rounded-3xl bg-white p-6 text-center shadow-lg ring-1 ring-orange-100 dark:bg-stone-900 dark:ring-stone-800">
      <h2 className="text-3xl font-extrabold text-orange-700 dark:text-orange-400">{main.name}</h2>
      <p className="mt-3 text-base opacity-80">{main.reason}</p>
      <a
        href={mapsSearchUrl(main.searchKeyword)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-600 px-5 font-semibold text-white hover:bg-emerald-700"
      >
        📍 Tìm quán gần đây
      </a>
    </section>
  );
}
