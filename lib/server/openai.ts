import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { MEAL_LABELS, type Meal } from "@/lib/meal";
import { SuggestionSchema } from "@/lib/suggestion";

const DEFAULT_MODEL = "gpt-5.4-mini";

export async function suggestDish(meal: Meal, localTime: string, exclude: string[]): Promise<unknown> {
  const client = new OpenAI(); // reads OPENAI_API_KEY
  const avoid = exclude.length ? `Không gợi ý lại các món: ${exclude.join(", ")}.` : "";
  const res = await client.responses.parse({
    model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
    instructions:
      "Bạn giúp người Việt quyết định hôm nay ăn gì. Gợi ý 1 món chính phổ biến ở Việt Nam, hợp với bữa và giờ hiện tại, " +
      "kèm 1 câu lý do ngắn, thân thiện, và đúng 2 món dự phòng khác nhau. " +
      "searchKeyword là tên món ngắn gọn để tìm quán trên Google Maps. Không nêu tên quán ăn cụ thể.",
    input: `Bữa: ${MEAL_LABELS[meal]}. Giờ hiện tại: ${localTime}. ${avoid}`,
    text: { format: zodTextFormat(SuggestionSchema, "suggestion") },
  });
  return res.output_parsed;
}
