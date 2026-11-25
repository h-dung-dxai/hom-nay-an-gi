import { expect, test } from "vitest";
import { buildPrompt, MEAL_GUIDE } from "./prompt";

const first = () => 0;

test("includes local time when it matches the chosen meal", () => {
  expect(buildPrompt("sang", "07:15", [], first).input).toContain("07:15");
});

test("omits local time when user picked a different meal (no 'gần trưa' for Sáng)", () => {
  expect(buildPrompt("sang", "11:30", [], first).input).not.toContain("11:30");
  expect(buildPrompt("toi", "07:15", [], first).input).not.toContain("07:15");
});

test("picks a dish style from the meal's own list", () => {
  expect(buildPrompt("xe", "15:00", [], first).input).toContain(MEAL_GUIDE.xe.styles[0]);
  const last = () => 0.999;
  expect(buildPrompt("xe", "15:00", [], last).input).toContain(MEAL_GUIDE.xe.styles.at(-1)!);
});

test("states the meal's description and what to avoid", () => {
  const { input } = buildPrompt("sang", "07:15", [], first);
  expect(input).toContain(MEAL_GUIDE.sang.desc);
  expect(input).toContain(MEAL_GUIDE.sang.avoid);
});

test("lists excluded dishes only when there are some", () => {
  expect(buildPrompt("trua", "12:00", ["Phở bò", "Cơm tấm"], first).input).toContain("Phở bò, Cơm tấm");
  expect(buildPrompt("trua", "12:00", [], first).input).not.toContain("Không gợi ý lại");
});

test("main and alternatives get different styles from the meal's list", () => {
  const { input } = buildPrompt("toi", "19:00", [], first);
  const used = MEAL_GUIDE.toi.styles.filter((s) => input.includes(s));
  expect(used).toHaveLength(3);
});
