import { pickImage, wikiSearchUrl, type DishImage } from "@/lib/dishImage";

// Wikimedia asks API clients to identify themselves; generic name, no personal contact info.
const USER_AGENT = "HomNayAnGi/0.1 (hobby food-suggestion web app)";

// shortcut: per-process memory cache, lost on restart; upgrade to a shared cache (KV/DB) for multi-user deploys.
const cache = new Map<string, DishImage | null>();

export async function findDishImage(keyword: string): Promise<DishImage | null> {
  const key = keyword.normalize("NFC").trim().toLowerCase();
  if (cache.has(key)) return cache.get(key)!;
  const res = await fetch(wikiSearchUrl(keyword), {
    headers: { "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`wikipedia ${res.status}`); // e.g. 429: don't cache, retry later
  const image = pickImage(await res.json(), keyword);
  cache.set(key, image);
  return image;
}
