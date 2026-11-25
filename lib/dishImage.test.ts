import { expect, test } from "vitest";
import { pickImage, wikiSearchUrl } from "./dishImage";

const page = (title: string, thumb?: string) => ({
  query: { pages: [{ title, fullurl: `https://vi.wikipedia.org/wiki/${encodeURIComponent(title)}`, ...(thumb ? { thumbnail: { source: thumb } } : {}) }] },
});

test("wikiSearchUrl targets vi.wikipedia search with page image + url", () => {
  const u = new URL(wikiSearchUrl("bún chả"));
  expect(u.origin + u.pathname).toBe("https://vi.wikipedia.org/w/api.php");
  expect(u.searchParams.get("gsrsearch")).toBe("bún chả");
  expect(u.searchParams.get("prop")).toBe("pageimages|info");
  expect(u.searchParams.get("gsrlimit")).toBe("1");
});

test("pickImage returns image when page title matches the dish", () => {
  expect(pickImage(page("Bún chả", "https://x/a.jpg"), "bún chả")).toEqual({
    src: "https://x/a.jpg",
    pageUrl: "https://vi.wikipedia.org/wiki/B%C3%BAn%20ch%E1%BA%A3",
    title: "Bún chả",
  });
});

test("pickImage accepts the general dish page (Phở for phở bò)", () => {
  expect(pickImage(page("Phở", "https://x/p.jpg"), "phở bò")?.title).toBe("Phở");
});

test("pickImage rejects an unrelated page", () => {
  expect(pickImage(page("Lịch sử Hà Nội", "https://x/h.jpg"), "bún chả")).toBeNull();
});

test("pickImage returns null when page has no image or response is empty", () => {
  expect(pickImage(page("Bún chả"), "bún chả")).toBeNull();
  expect(pickImage({ batchcomplete: true }, "bún chả")).toBeNull();
  expect(pickImage(null, "bún chả")).toBeNull();
});
