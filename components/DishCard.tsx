import { MapPin } from "lucide-react";
import { DishPhoto } from "@/components/DishImage";
import { mapsSearchUrl } from "@/lib/maps";
import type { Suggestion } from "@/lib/suggestion";

export function DishCard({ main }: { main: Suggestion["main"] }) {
  return (
    <section className="card-glow overflow-hidden rounded-3xl p-6 text-center shadow-xl shadow-ember/10">
      <DishPhoto keyword={main.searchKeyword} name={main.name} />
      <h2 className="text-gradient-warm text-3xl font-extrabold">{main.name}</h2>
      <p className="mt-3 text-base text-muted">{main.reason}</p>
      <a
        href={mapsSearchUrl(main.searchKeyword)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-herb px-5 font-semibold text-white shadow-md shadow-herb/25 transition hover:brightness-110"
      >
        <MapPin aria-hidden className="size-5" /> Tìm quán gần đây
      </a>
    </section>
  );
}
