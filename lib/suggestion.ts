import { z } from "zod";

const DishSchema = z.object({ name: z.string().min(1), searchKeyword: z.string().min(1) });

export const SuggestionSchema = z.object({
  main: DishSchema.extend({ reason: z.string().min(1) }),
  alternatives: z.array(DishSchema),
});

export type Suggestion = z.infer<typeof SuggestionSchema>;
export type Dish = { name: string; reason?: string; searchKeyword: string };

const norm = (s: string) => s.normalize("NFC").trim().toLowerCase();

export function cleanSuggestion(raw: unknown, exclude: string[]): Suggestion | null {
  const parsed = SuggestionSchema.safeParse(raw);
  if (!parsed.success) return null;
  const { main, alternatives } = parsed.data;
  const seen = new Set(exclude.map(norm));
  if (seen.has(norm(main.name))) return null;
  seen.add(norm(main.name));
  return { main, alternatives: alternatives.filter((d) => !seen.has(norm(d.name))) };
}
