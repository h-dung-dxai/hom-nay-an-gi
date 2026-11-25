"use client";

import { Soup } from "lucide-react";
import { useEffect, useState } from "react";
import type { DishImage as Img } from "@/lib/dishImage";

/** undefined = loading, null = no photo */
export function useDishImage(keyword: string): Img | null | undefined {
  const [state, setState] = useState<{ key: string; image: Img | null } | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`/api/dish-image?q=${encodeURIComponent(keyword)}`)
      .then((r) => r.json())
      .then((d) => alive && setState({ key: keyword, image: d.image ?? null }))
      .catch(() => alive && setState({ key: keyword, image: null }));
    return () => {
      alive = false;
    };
  }, [keyword]);
  return state?.key === keyword ? state.image : undefined;
}

export function DishPhoto({ keyword, name }: { keyword: string; name: string }) {
  const image = useDishImage(keyword);
  const [broken, setBroken] = useState<string | null>(null);
  const show = image && broken !== image.src;
  return (
    <figure className="relative -mx-6 -mt-6 mb-5 overflow-hidden rounded-t-3xl">
      <div className="aspect-[4/3] w-full bg-gradient-to-br from-line to-paper">
        {image === undefined && <div className="h-full w-full animate-pulse" aria-label="Đang tải ảnh" />}
        {show && (
          // eslint-disable-next-line @next/next/no-img-element -- plain img: Wikimedia serves sized thumbs already
          <img src={image.src} alt={name} onError={() => setBroken(image.src)} className="h-full w-full object-cover" />
        )}
        {image !== undefined && !show && (
          <div className="flex h-full w-full items-center justify-center">
            <Soup aria-hidden className="size-16 text-ember/60" />
          </div>
        )}
      </div>
      {show && (
        <figcaption className="absolute bottom-2 right-3 rounded-full bg-black/45 px-2 py-0.5 text-[11px] text-white backdrop-blur">
          <a href={image.pageUrl} target="_blank" rel="noopener noreferrer">
            Ảnh: Wikipedia
          </a>
        </figcaption>
      )}
    </figure>
  );
}

export function DishThumb({ keyword }: { keyword: string }) {
  const image = useDishImage(keyword);
  if (!image) return <Soup aria-hidden className="size-5 text-ember" />;
  // eslint-disable-next-line @next/next/no-img-element -- tiny decorative thumb from Wikimedia
  return <img src={image.src} alt="" className="size-7 rounded-full object-cover" />;
}
