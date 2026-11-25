# "Hôm nay ăn gì?" Implementation Plan (bản 1, chưa có danh sách quán)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A one-page Vietnamese web app. It reads the meal from the device clock and has OpenAI pick 1 dish plus 2 alternatives. Each dish gets a "Tìm quán gần đây" link that opens Google Maps.

**Architecture:** A single Next.js (App Router) project. Pure logic lives in `lib/` and is unit-tested. One server route, `/api/suggest`, is the only code that reads the OpenAI key. The page is a client component.

**Tech Stack:** Next.js (latest, App Router), TypeScript, Tailwind CSS, `openai` SDK, `zod`, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-25-hom-nay-an-gi-design.md`. Read the "Điều chỉnh phạm vi" note at the top: everything about Places, geolocation, address input and `/api/places` is **out of scope** for this plan.

## Global Constraints

- All UI copy is in Vietnamese.
- `OPENAI_API_KEY` and `OPENAI_MODEL` are read only in server code (`app/api/**`, `lib/server/**`). Nothing is prefixed `NEXT_PUBLIC_`.
- `.env.local` is gitignored. `.env.example` is committed.
- The meal is computed in the browser from the device clock, never from the server clock.
- The AI output schema has no restaurant field. The app never shows restaurant names in bản 1.
- Maps link format: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchKeyword + " gần đây")}`, opened in a new tab.
- Check current library APIs (Next.js, openai SDK structured outputs) through context7 or the official docs before writing calls. Do not write them from memory.

## Review Focus

1. **Hours that cross midnight.** 22:00–04:59 is "khuya", and 04:59 → 05:00 switches to "sáng". Tested in Task 1.
2. **AI returns an excluded or duplicated dish.** The server drops alternatives that are in `exclude` or duplicate the main dish. If the main dish itself is excluded, the server returns 502 and the UI shows "Thử lại". Tested in Task 2.
3. **Vietnamese diacritics in the Maps URL.** "bún chả" must be percent-encoded correctly. Tested in Task 3.
4. **OpenAI key missing or invalid.** `/api/suggest` returns 502 with friendly copy, and the page shows "Thử lại" instead of crashing. Checked by hand in Task 2.
5. **"Đổi món" many times.** The exclude list grows each time, so the prompt must still produce new dishes and the request must stay valid. Checked by hand in Task 3 (5 taps, no repeats).

---

### Task 1: Scaffold + meal-from-hour

**Files:**
- Create: the project via `create-next-app` in the repo root, `vitest.config.ts`, `.env.example`, `README.md`
- Create: `lib/meal.ts`
- Test: `lib/meal.test.ts`

**Interfaces:**
- Produces: `type Meal = "sang" | "trua" | "xe" | "toi" | "khuya"`; `MEAL_LABELS: Record<Meal, string>` = `{sang:"Sáng", trua:"Trưa", xe:"Xế", toi:"Tối", khuya:"Khuya"}`; `mealFromHour(hour: number): Meal`

- [ ] **Step 1:** Run `git init`, then `npx create-next-app@latest . --ts --tailwind --app --eslint --no-src-dir --import-alias "@/*"`. If `create-next-app` refuses to run because `docs/` already exists, scaffold into a temp folder and move the files in. Run `npm i openai zod` and `npm i -D vitest`. Add `"test": "vitest run"` to `package.json`. Write `.env.example` with `OPENAI_API_KEY` and `OPENAI_MODEL`. Write a README with install, `.env.local` and `npm run dev` steps.
- [ ] **Step 2: Write the failing test** in `lib/meal.test.ts`:

```ts
test.each([[5,"sang"],[9,"sang"],[10,"trua"],[13,"trua"],[14,"xe"],[16,"xe"],
           [17,"toi"],[21,"toi"],[22,"khuya"],[23,"khuya"],[0,"khuya"],[4,"khuya"]])
  ("mealFromHour(%i) = %s", (h, m) => expect(mealFromHour(h)).toBe(m));
```

- [ ] **Step 3:** Run `npm test`. Expected: FAIL (module not found).
- [ ] **Step 4:** Implement `mealFromHour` and `MEAL_LABELS` in `lib/meal.ts`.
- [ ] **Step 5:** Run `npm test`. Expected: 12 passed. Run `npm run build`. Expected: success.
- [ ] **Step 6:** Commit: `git add -A && git commit -m "feat: scaffold app and meal-from-hour"`

### Task 2: Dish suggestion (`/api/suggest`)

**Files:**
- Create: `lib/suggestion.ts` (schema + post-processing, pure)
- Create: `lib/server/openai.ts` (OpenAI call)
- Create: `app/api/suggest/route.ts`
- Test: `lib/suggestion.test.ts`

**Interfaces:**
- Consumes: `Meal`, `MEAL_LABELS` from Task 1
- Produces:
  - `type Dish = { name: string; reason?: string; searchKeyword: string }`
  - `type Suggestion = { main: Dish & { reason: string }; alternatives: Dish[] }`
  - `SuggestionSchema` (zod): `main {name, reason, searchKeyword}`, `alternatives` array of `{name, searchKeyword}`, length 2.
  - `cleanSuggestion(raw: unknown, exclude: string[]): Suggestion | null`. Validates against the schema and returns `null` if invalid or if `main` is in `exclude`. Drops alternatives that are in `exclude` or equal `main`. Comparison is case-insensitive and trims whitespace. Applies Unicode NFC, but does not strip diacritics.
  - `suggestDish(meal: Meal, localTime: string, exclude: string[]): Promise<unknown>` in `lib/server/openai.ts`.
  - `POST /api/suggest` body `{ meal: Meal, localTime: string, exclude: string[] }` → `200 Suggestion` | `400 {error}` on a bad body | `502 {error:"Không gợi ý được, thử lại nhé"}` when `cleanSuggestion` returns `null` or OpenAI throws.

- [ ] **Step 1: Write failing tests** in `lib/suggestion.test.ts`:
  - `valid input returns suggestion`: a valid object → equals the same object.
  - `invalid shape returns null`: `{main:{name:"Phở"}}` → `null`.
  - `excluded main returns null`: main "Phở bò" with exclude `[" phở bò "]` → `null`.
  - `drops excluded and duplicate alternatives`: alternatives `["Cơm tấm","Phở bò"]`, main "Phở bò", exclude `["cơm tấm"]` → `alternatives` is `[]`.
- [ ] **Step 2:** Run `npm test`. Expected: FAIL.
- [ ] **Step 3:** Implement `SuggestionSchema` and `cleanSuggestion` in `lib/suggestion.ts`.
- [ ] **Step 4:** Implement `suggestDish` with the openai SDK's structured-output helper and the zod schema. Read the model from `process.env.OPENAI_MODEL`. If it is unset, default to a current small, cheap OpenAI model that supports structured outputs, and put its name in `.env.example`. The prompt is in Vietnamese and says: suggest a dish that is popular in Vietnam and fits `MEAL_LABELS[meal]` at `localTime`; give a 1-sentence reason; `searchKeyword` is the short dish name used to search on Maps; do not repeat any of `exclude`; do not name restaurants.
- [ ] **Step 5:** Implement `app/api/suggest/route.ts`: validate the body with zod (400 on failure), call `suggestDish`, then `cleanSuggestion`, and map errors per the Interfaces block. Log the error on the server but never return it to the client.
- [ ] **Step 6:** Run `npm test`. Expected: all pass. Manual check with `.env.local` set: `curl -s -XPOST localhost:3000/api/suggest -H 'content-type: application/json' -d '{"meal":"trua","localTime":"12:05","exclude":[]}'` → JSON with `main` and 2 `alternatives`. Set a wrong key and repeat → 502 with the friendly message.
- [ ] **Step 7:** Commit: `feat: AI dish suggestion endpoint`

### Task 3: The page

**Files:**
- Create: `lib/maps.ts`; Test: `lib/maps.test.ts`
- Modify: `app/page.tsx` (client component), `app/layout.tsx` (`lang="vi"`, title "Hôm nay ăn gì?")
- Create: `components/MealChips.tsx`, `components/DishCard.tsx`

**Interfaces:**
- Consumes: `mealFromHour`, `MEAL_LABELS`, `Meal` (Task 1); `Suggestion`, `Dish` and `POST /api/suggest` (Task 2)
- Produces: `mapsSearchUrl(keyword: string): string` using the format in Global Constraints.

- [ ] **Step 1: Write failing test:** `mapsSearchUrl("bún chả")` equals `"https://www.google.com/maps/search/?api=1&query=b%C3%BAn%20ch%E1%BA%A3%20g%E1%BA%A7n%20%C4%91%C3%A2y"`. Run `npm test` and confirm it fails, implement the function, then confirm it passes.
- [ ] **Step 2:** Build the page. It follows the spec's layout sketch, with the "Quán gần bạn" list replaced by a link button:
  - On load: compute `mealFromHour(new Date().getHours())` and fetch a suggestion with `localTime` formatted as `HH:mm` from the device.
  - Meal chips: the active chip is highlighted. Tapping a chip refetches a suggestion for that meal and resets the session exclude list.
  - The main dish card shows the name, the reason and a "📍 Tìm quán gần đây" button (`mapsSearchUrl(main.searchKeyword)`, opens in a new tab).
  - "Hoặc:" alternatives: tapping one swaps it in as the main dish, with no AI call.
  - "Đổi món": adds every dish shown so far (main + alternatives) to the session `exclude` and refetches.
  - The card has a loading state. Errors show friendly copy plus a "Thử lại" button.
  - Mobile-first, single column, max width about 480px, large tap targets.
- [ ] **Step 3:** Run `npm run build` and `npm test`. Expected: both succeed.
- [ ] **Step 4:** Manual check with `npm run dev` at a 375px viewport: (a) a dish appears for the current meal; (b) tapping a chip changes the meal; (c) "Đổi món" 5 times → no repeats; (d) tapping an alternative swaps it in; (e) "Tìm quán gần đây" opens Google Maps searching "<món> gần đây".
- [ ] **Step 5:** Commit: `feat: main page UI`
