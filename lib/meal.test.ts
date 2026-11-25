import { expect, test } from "vitest";
import { mealFromHour } from "./meal";

test.each([[5, "sang"], [9, "sang"], [10, "trua"], [13, "trua"], [14, "xe"], [16, "xe"],
           [17, "toi"], [21, "toi"], [22, "khuya"], [23, "khuya"], [0, "khuya"], [4, "khuya"]] as const)
  ("mealFromHour(%i) = %s", (h, m) => expect(mealFromHour(h)).toBe(m));
