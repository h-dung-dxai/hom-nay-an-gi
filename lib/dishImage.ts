export type DishImage = { src: string; pageUrl: string; title: string };

export function wikiSearchUrl(keyword: string): string {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    generator: "search",
    gsrsearch: keyword,
    gsrlimit: "1",
    prop: "pageimages|info",
    inprop: "url",
    piprop: "thumbnail",
    pithumbsize: "640",
  });
  return `https://vi.wikipedia.org/w/api.php?${params}`;
}

const norm = (s: string) => s.normalize("NFC").trim().toLowerCase();

type WikiPage = { title?: string; fullurl?: string; thumbnail?: { source?: string } };

/** Image of the top search hit, only if its title and the dish name overlap ("Phở" ↔ "phở bò"), so a stray article never shows a wrong photo. */
export function pickImage(json: unknown, keyword: string): DishImage | null {
  const p = (json as { query?: { pages?: WikiPage[] } } | null)?.query?.pages?.[0];
  const src = p?.thumbnail?.source;
  if (!p?.title || !p.fullurl || !src) return null;
  const t = norm(p.title);
  const k = norm(keyword);
  if (!t || !k || !(k.includes(t) || t.includes(k))) return null;
  return { src, pageUrl: p.fullurl, title: p.title };
}
