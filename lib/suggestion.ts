import { z } from "zod";

// No .min(1): OpenAI strict structured outputs don't accept minLength; blanks are rejected in cleanSuggestion.
const DishSchema = z.object({ name: z.string(), searchKeyword: z.string() });

export const SuggestionSchema = z.object({
  main: DishSchema.extend({ reason: z.string() }),
  alternatives: z.array(DishSchema),
});

export type Suggestion = z.infer<typeof SuggestionSchema>;
export type Dish = { name: string; reason?: string; searchKeyword: string };

export const MAX_EXCLUDE = 100;
export const FALLBACK_ERROR = "Không gợi ý được, thử lại nhé";

const norm = (s: string) => s.normalize("NFC").trim().toLowerCase();
const filled = (d: { name: string; searchKeyword: string }) => norm(d.name) !== "" && norm(d.searchKeyword) !== "";

export function cleanSuggestion(raw: unknown, exclude: string[]): Suggestion | null {
  const parsed = SuggestionSchema.safeParse(raw);
  if (!parsed.success) return null;
  const { main, alternatives } = parsed.data;
  if (!filled(main) || !main.reason.trim()) return null;
  const seen = new Set(exclude.map(norm));
  if (seen.has(norm(main.name))) return null;
  seen.add(norm(main.name));
  return { main, alternatives: alternatives.filter((d) => filled(d) && !seen.has(norm(d.name))) };
}

/** Last MAX_EXCLUDE dish names, so a long "Đổi món" streak never exceeds the API's limit. */
export const recentExclude = (shown: string[]) => shown.slice(-MAX_EXCLUDE);

/** Only a string `error` from our own API is shown; anything else (network, HTML page) gets the Vietnamese fallback. */
export const errorText = (body: unknown) => {
  const e = (body as { error?: unknown } | null)?.error;
  return typeof e === "string" && e ? e : FALLBACK_ERROR;
};
