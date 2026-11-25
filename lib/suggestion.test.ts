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

import { zodTextFormat } from "openai/helpers/zod";
import { SuggestionSchema, recentExclude, MAX_EXCLUDE, errorText, FALLBACK_ERROR } from "./suggestion";

test("schema sent to OpenAI has no minLength (not allowed in strict mode)", () => {
  expect(JSON.stringify(zodTextFormat(SuggestionSchema, "s"))).not.toContain("minLength");
});

test("blank dish name returns null", () => {
  expect(cleanSuggestion({ ...valid, main: { ...valid.main, name: "  " } }, [])).toBeNull();
});

test("recentExclude keeps only the last MAX_EXCLUDE names", () => {
  const list = Array.from({ length: 150 }, (_, i) => `m${i}`);
  expect(recentExclude(list)).toEqual(list.slice(50));
  expect(recentExclude(list)).toHaveLength(MAX_EXCLUDE);
});

test("errorText shows server message only when it is a string", () => {
  expect(errorText({ error: "Yêu cầu không hợp lệ" })).toBe("Yêu cầu không hợp lệ");
  expect(errorText(null)).toBe(FALLBACK_ERROR);
  expect(errorText({ error: 42 })).toBe(FALLBACK_ERROR);
});
