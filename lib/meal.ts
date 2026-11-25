export type Meal = "sang" | "trua" | "xe" | "toi" | "khuya";

export const MEAL_LABELS: Record<Meal, string> = {
  sang: "Sáng",
  trua: "Trưa",
  xe: "Xế",
  toi: "Tối",
  khuya: "Khuya",
};

export function mealFromHour(hour: number): Meal {
  if (hour >= 5 && hour < 10) return "sang";
  if (hour >= 10 && hour < 14) return "trua";
  if (hour >= 14 && hour < 17) return "xe";
  if (hour >= 17 && hour < 22) return "toi";
  return "khuya";
}
