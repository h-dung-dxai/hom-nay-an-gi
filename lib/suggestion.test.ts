import { expect, test } from "vitest";
import { cleanSuggestion } from "./suggestion";

const valid = {
  main: { name: "Phở bò", reason: "Trưa ăn nước cho nhẹ bụng.", searchKeyword: "phở bò" },
  alternatives: [
    { name: "Cơm tấm", searchKeyword: "cơm tấm" },
    { name: "Bún chả", searchKeyword: "bún chả" },
  ],
};

test("valid input returns suggestion", () => {
  expect(cleanSuggestion(valid, [])).toEqual(valid);
});

test("invalid shape returns null", () => {
  expect(cleanSuggestion({ main: { name: "Phở" } }, [])).toBeNull();
});

test("excluded main returns null", () => {
  expect(cleanSuggestion(valid, [" phở bò "])).toBeNull();
});

test("drops excluded and duplicate alternatives", () => {
  const raw = {
    ...valid,
    alternatives: [
      { name: "Cơm tấm", searchKeyword: "cơm tấm" },
      { name: "Phở bò", searchKeyword: "phở bò" },
    ],
  };
  expect(cleanSuggestion(raw, ["cơm tấm"])?.alternatives).toEqual([]);
});
