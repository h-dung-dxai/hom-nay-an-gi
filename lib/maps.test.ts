import { expect, test } from "vitest";
import { mapsSearchUrl } from "./maps";

test("mapsSearchUrl encodes Vietnamese and appends gần đây", () => {
  expect(mapsSearchUrl("bún chả")).toBe(
    "https://www.google.com/maps/search/?api=1&query=b%C3%BAn%20ch%E1%BA%A3%20g%E1%BA%A7n%20%C4%91%C3%A2y",
  );
});
