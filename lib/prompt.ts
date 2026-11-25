import { MEAL_LABELS, mealFromHour, type Meal } from "@/lib/meal";

type Guide = { desc: string; styles: string[]; avoid: string };

export const MEAL_GUIDE: Record<Meal, Guide> = {
  sang: {
    desc: "bữa sáng (5h–10h): món nhẹ, ăn nhanh, quen thuộc buổi sáng ở Việt Nam",
    styles: [
      "món nước buổi sáng (bún, hủ tiếu, bánh canh, mì, phở)",
      "bánh mì hoặc xôi",
      "bánh cuốn, bánh ướt, bánh bèo, bánh bột lọc",
      "cháo hoặc súp buổi sáng",
      "món sáng đặc trưng vùng miền ít gặp hơn",
    ],
    avoid: "cơm phần, lẩu, đồ nướng, đồ nhậu, món chiên nhiều dầu mỡ",
  },
  trua: {
    desc: "bữa trưa (10h–14h): ăn no, phục vụ nhanh, hợp người đi làm",
    styles: [
      "cơm (cơm tấm, cơm gà, cơm văn phòng, cơm rang)",
      "bún hoặc mì khô, trộn",
      "món nước ăn trưa",
      "đặc sản vùng miền hay ăn trưa (bún chả, mì Quảng, cao lầu, bún đậu)",
      "món thanh nhẹ ít dầu mỡ (gỏi, bún thịt nướng, cuốn)",
    ],
    avoid: "lẩu, đồ nhậu, món phải ngồi ăn lâu",
  },
  xe: {
    desc: "bữa xế (14h–17h): ăn vặt nhẹ giữa chiều, KHÔNG phải bữa chính",
    styles: [
      "đồ ngọt (chè, bánh flan, tào phớ, sữa chua)",
      "ăn vặt mặn (bánh tráng trộn, bột chiên, nem chua rán, khoai lắc)",
      "bánh ăn chơi (bánh khọt, bánh tráng nướng, bánh tiêu, bánh bao)",
      "trái cây, đồ uống kèm món ăn nhẹ",
    ],
    avoid: "cơm, phở, bún và các món ăn no như bữa chính",
  },
  toi: {
    desc: "bữa tối (17h–22h): bữa chính thong thả, có thể ăn cùng gia đình hoặc bạn bè",
    styles: [
      "cơm nhà, cơm niêu với món mặn",
      "lẩu",
      "đồ nướng",
      "hải sản hoặc ốc",
      "món nước thịnh soạn (bánh canh cua, bún bò, bún mắm)",
    ],
    avoid: "món chỉ hợp bữa sáng như xôi, bánh mì ốp la, bánh cuốn",
  },
  khuya: {
    desc: "ăn khuya (22h–5h): nóng, nhẹ bụng, dễ tìm quán mở muộn",
    styles: [
      "cháo (cháo sườn, cháo lòng, cháo gà)",
      "mì, hủ tiếu gõ hoặc phở khuya",
      "bánh mì nướng, xúc xích nướng",
      "súp, bánh canh",
    ],
    avoid: "lẩu, đồ nướng nhiều, đồ nhiều dầu mỡ, đồ ngọt nặng",
  },
};

export const INSTRUCTIONS =
  "Bạn giúp người Việt quyết định ăn gì. Gợi ý 1 món chính phổ biến ở Việt Nam, đúng với bữa được yêu cầu và thuộc kiểu món được chỉ định, " +
  "kèm 1 câu lý do ngắn, thân thiện, nói về bữa đó (không bịa ra giờ). Thêm đúng 2 món dự phòng hợp bữa đó, mỗi món theo kiểu được chỉ định. " +
  "Tên món viết kiểu câu: chỉ viết hoa chữ cái đầu và tên địa danh (ví dụ: Chè thập cẩm, Bún bò Huế, Mì Quảng; không viết Bánh Tráng Trộn). " +
  "Đa dạng: đừng mặc định chọn phở. searchKeyword là tên món ngắn gọn để tìm quán trên Google Maps. Không nêu tên quán ăn cụ thể.";

export function buildPrompt(meal: Meal, localTime: string, exclude: string[], rand: () => number = Math.random) {
  const g = MEAL_GUIDE[meal];
  const n = g.styles.length;
  const start = Math.floor(rand() * n);
  const [style, alt1, alt2] = [0, 1, 2].map((k) => g.styles[(start + k) % n]); // every meal has >= 3 styles
  const hour = Number(localTime.slice(0, 2));
  const lines = [
    `Bữa: ${MEAL_LABELS[meal]} — ${g.desc}.`,
    // Only mention the clock when it agrees with the chosen meal; a manual chip pick must win.
    mealFromHour(hour) === meal ? `Giờ hiện tại: ${localTime}.` : "",
    `Món chính thuộc kiểu: ${style}.`,
    `Món dự phòng 1 thuộc kiểu: ${alt1}. Món dự phòng 2 thuộc kiểu: ${alt2}.`,
    `Tránh: ${g.avoid}.`,
    exclude.length ? `Không gợi ý lại các món: ${exclude.join(", ")}.` : "",
  ];
  return { instructions: INSTRUCTIONS, input: lines.filter(Boolean).join("\n") };
}
