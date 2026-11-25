import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { Meal } from "@/lib/meal";
import { buildPrompt } from "@/lib/prompt";
import { SuggestionSchema } from "@/lib/suggestion";

const DEFAULT_MODEL = "gpt-5.4-mini";

export async function suggestDish(meal: Meal, localTime: string, exclude: string[]): Promise<unknown> {
  const client = new OpenAI(); // reads OPENAI_API_KEY
  const { instructions, input } = buildPrompt(meal, localTime, exclude);
  const res = await client.responses.parse({
    model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
    instructions,
    input,
    text: { format: zodTextFormat(SuggestionSchema, "suggestion") },
  });
  return res.output_parsed;
}
