import { findDishImage } from "@/lib/server/wikipedia";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (!q || q.length > 100) return Response.json({ error: "Thiếu tên món" }, { status: 400 });
  try {
    const image = await findDishImage(q);
    return Response.json({ image }, { headers: { "Cache-Control": "public, max-age=86400" } });
  } catch (err) {
    console.error("dish image failed", err);
    return Response.json({ image: null }); // no photo is fine; the card shows an icon instead
  }
}
