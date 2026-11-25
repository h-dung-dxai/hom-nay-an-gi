import { z } from "zod";
import { cleanSuggestion } from "@/lib/suggestion";
import { suggestDish } from "@/lib/server/openai";

const Body = z.object({
  meal: z.enum(["sang", "trua", "xe", "toi", "khuya"]),
  localTime: z.string().regex(/^\d{2}:\d{2}$/),
  exclude: z.array(z.string().max(100)).max(100),
});

const FAIL = { error: "Không gợi ý được, thử lại nhé" };

export async function POST(request: Request) {
  const body = Body.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "Yêu cầu không hợp lệ" }, { status: 400 });
  const { meal, localTime, exclude } = body.data;
  try {
    const suggestion = cleanSuggestion(await suggestDish(meal, localTime, exclude), exclude);
    if (!suggestion) return Response.json(FAIL, { status: 502 });
    return Response.json(suggestion);
  } catch (err) {
    console.error("suggest failed", err);
    return Response.json(FAIL, { status: 502 });
  }
}
