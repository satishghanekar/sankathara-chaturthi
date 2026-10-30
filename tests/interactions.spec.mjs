// Interactions: what readers do, checked in every browser engine (and on phone emulation for @mobile).
import { test, expect } from "@playwright/test";
import { openSite, settle, SETUPS, PREFS_KEY, tapMore, buildAll, readText, settingsTab, langMismatches } from "./helpers.mjs";

const prefs = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k)), PREFS_KEY);
const rootAttr = (page, a) => page.evaluate((a) => document.documentElement.getAttribute(a), a);

// The top bar, as in Nitya Upasana: Print, ⋯ and Settings; the languages and the dhrupad are in the Aa sheet and in
// Settings → Reading (Show, Dhrupad)
test("the top bar has Print, ⋯ and Settings, and no language or dhrupad buttons @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  expect(await page.locator(".bar .tools button:visible").evaluateAll((l) => l.map((b) => b.id))).toEqual(["prb", "tmb", "aa"]);
  await expect(page.locator("#home-btn, #rb, #hm")).toHaveCount(0);
});

test("Settings → Show switches main → second → both and is remembered @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await buildAll(page);
  const lang = () => page.locator("#a1").getAttribute("data-lang");
  expect(await lang()).toBe("mr");
  await page.locator("#aa").click();
  await expect(page.locator("#slw button")).toHaveCount(3);
  await page.locator('#slw [data-v="en"]').click();
  expect(await lang()).toBe("en");
  await page.locator('#slw [data-v="both"]').click();
  expect(await lang()).toBe("both");
  await expect(page.locator('#slw [data-v="both"]')).toHaveAttribute("aria-pressed", "true");
  await page.locator('#slw [data-v="en"]').click();
  expect((await prefs(page)).lang).toBe("en");
  await page.reload();
  await settle(page);
  // (a text built after the reload takes the remembered language too)
  await buildAll(page);
  expect(await lang()).toBe("en");
});

test("Settings → Dhrupad switches between once and after every verse @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi, { hash: "#a1" });
  await page.evaluate(() => document.documentElement.removeAttribute("data-tuck")); // opened at a text, the bars may start tucked away
  expect(await rootAttr(page, "data-ref")).toBe("1");
  await page.locator("#aa").click();
  await page.locator('#srf [data-v="0"]').click();
  expect(await rootAttr(page, "data-ref")).toBe("0");
  await page.locator("#xc").click();
  expect(await page.locator("#a1 .item.rf").first().isVisible()).toBe(true);
  await page.locator("#aa").click();
  await page.locator('#srf [data-v="1"]').click();
  expect(await rootAttr(page, "data-ref")).toBe("1");
});

// Settings on phones, as in Nitya Upasana: Reading | Screen | More, one tab at a time, opening on Reading each time
test("Settings has the tabs Reading, Screen and More, and opens on Reading @mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSite(page, SETUPS.english);
  await page.locator("#aa").click();
  await expect(page.locator("#spv button")).toHaveText(["Reading", "Screen", "More"], { useInnerText: true });
  await expect(page.locator('#spv [data-v="read"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#sl1")).toBeVisible();
  await expect(page.locator("#st")).toBeHidden();
  await page.locator('#spv [data-v="screen"]').click();
  await expect(page.locator("#st")).toBeVisible();
  await expect(page.locator("#tw")).toBeVisible();
  await expect(page.locator("#sl1")).toBeHidden();
  await page.locator('#spv [data-v="more"]').click();
  await expect(page.locator("#hlp2")).toBeVisible();
  await expect(page.locator("#upd")).toBeVisible();
  // under the top bar, which stays in view
  const top = await page.locator("#panel").evaluate((e) => e.getBoundingClientRect().top);
  const bar = await page
    .locator("body > .bar")
    .first()
    .evaluate((e) => e.getBoundingClientRect().bottom);
  expect(Math.abs(top - bar)).toBeLessThan(2);
  await page.locator("#xc").click();
  await page.locator("#aa").click();
  await expect(page.locator('#spv [data-v="read"]')).toHaveAttribute("aria-pressed", "true");
});

// Settings on iPads and desktops, as in Nitya Upasana: no tabs, the title beside Back, every group at once in two
// columns: the preview and the reading choices on the left, the screen and about on the right (Satish, 2026-10-30);
// an iPad upright too; narrowed to a phone, the tabs are back
test("Settings on a desktop or an iPad: every group at once, in two columns, no tabs", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openSite(page, SETUPS.marathi);
  await page.locator("#aa").click();
  await expect(page.locator("#spv")).toBeHidden();
  await expect(page.locator("#spt")).toBeVisible();
  await expect(page.locator("#spt")).toHaveText("Settings");
  for (const id of ["#sl1", "#st", "#tw", "#hlp2", "#upd"]) await expect(page.locator(id)).toBeVisible();
  const x = async (sel) => (await page.locator(sel).boundingBox()).x;
  expect(await x(".sp-c1")).toBeLessThan(await x(".sp-c2"));
  for (const id of ["#sl1"]) expect(await page.locator(".sp-c1 " + id).count(), id).toBe(1);
  for (const id of ["#st", "#hlp2", "#upd"]) expect(await page.locator(".sp-c2 " + id).count(), id).toBe(1);
  await page.setViewportSize({ width: 820, height: 1180 });
  await expect(page.locator("#spv")).toBeHidden();
  for (const id of ["#sl1", "#st", "#hlp2"]) await expect(page.locator(id)).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#spv")).toBeVisible();
  await expect(page.locator("#st")).toBeHidden();
  // (the title for screen readers only: a 1px box)
  expect((await page.locator("#spt").boundingBox()).width).toBeLessThanOrEqual(1);
});

// Keep screen on (Satish, 2026-10-30): Off, 15, 30, 45 or 60 minutes after the last touch, key or scroll; the old
// switch's on is 30. The browser's lock is stood in for, so the test sees when it is held and let go
test("Keep screen on: held for the minutes chosen after the last touch, then let go @mobile", async ({ page }) => {
  await page.addInitScript(() => {
    const w = (window.__wl = { held: 0 });
    Object.defineProperty(navigator, "wakeLock", {
      configurable: true,
      value: {
        request() {
          w.held++;
          const l = new EventTarget();
          l.release = () => {
            w.held--;
            l.dispatchEvent(new Event("release"));
            return Promise.resolve();
          };
          return Promise.resolve(l);
        },
      },
    });
  });
  await openSite(page, { ...SETUPS.marathi, wake: 1 }, { running: true });
  const held = () => page.evaluate(() => window.__wl.held);
  await expect.poll(held).toBe(1);
  await page.locator("#aa").click();
  await settingsTab(page, "screen");
  await expect(page.locator('#tw [data-v="30"]')).toHaveAttribute("aria-pressed", "true");
  await page.locator('#tw [data-v="15"]').click();
  await expect(page.locator('#tw [data-v="15"]')).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('#tw [data-v="30"]')).toHaveAttribute("aria-pressed", "false");
  await page.clock.runFor("14:00");
  expect(await held()).toBe(1);
  // a key starts the 15 minutes again
  await page.keyboard.press("Shift");
  await page.clock.runFor("14:00");
  expect(await held()).toBe(1);
  await page.clock.runFor("02:00");
  expect(await held(), "let go 15 minutes after the last touch").toBe(0);
  // back on the next touch, once
  await page.keyboard.press("Shift");
  await page.keyboard.press("Shift");
  await expect.poll(held).toBe(1);
  await page.locator('#tw [data-v="0"]').click();
  await expect.poll(held).toBe(0);
  await page.keyboard.press("Shift");
  await page.clock.runFor("01:00");
  expect(await held(), "Off stays off").toBe(0);
  const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).wake, PREFS_KEY);
  expect(saved).toBe(0);
  // the minutes in the menu language's digits
  await page.locator('#su [data-v="mr"]').click();
  await expect(page.locator('#tw [data-v="45"]')).toHaveText("४५");
});

// A phone held sideways is as wide as an iPad but too short for its layout: the tabs, and on Reading the preview on
// the left, staying in view while the choices scroll beside it (Satish, 2026-10-30)
test("Settings on a phone held sideways: the tabs, the preview beside the reading choices", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await openSite(page, SETUPS.marathi);
  await page.locator("#aa").click();
  await expect(page.locator("#spv")).toBeVisible();
  await expect(page.locator("#st")).toBeHidden();
  const prev = page.locator(".sp-pvg");
  const box = async (sel) => await page.locator(sel).boundingBox();
  expect((await box("#sl1")).x).toBeGreaterThan((await prev.boundingBox()).x + (await prev.boundingBox()).width);
  expect((await box("#sl1")).y, "the first choice in view beside the preview").toBeLessThan(390);
  await page.locator("#panel").evaluate((e) => (e.scrollTop = e.scrollHeight));
  const p = await prev.boundingBox();
  expect(p.y, "the preview stays in view").toBeGreaterThanOrEqual(0);
  expect(p.y + p.height).toBeLessThanOrEqual(390);
  await page.locator('#spv [data-v="screen"]').click();
  await expect(page.locator("#st")).toBeVisible();
  await expect(page.locator("#sl1")).toBeHidden();
  // turned upright, and an iPad held sideways, as before
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator("#spv")).toBeVisible();
  await page.setViewportSize({ width: 1180, height: 820 });
  await expect(page.locator("#spv")).toBeHidden();
  for (const id of ["#sl1", "#st"]) await expect(page.locator(id)).toBeVisible();
});

// ⋯ in the top bar, as in Nitya Upasana: App, Share, QR and Help; a choice closes it, Escape closes it with focus on ⋯
test("⋯ opens App, Share, QR and Help, and closes cleanly @mobile", async ({ page }) => {
  await openSite(page, SETUPS.english);
  await expect(page.locator("#shr")).toBeHidden();
  await page.locator("#tmb").click();
  await expect(page.locator("#shr")).toBeVisible();
  await expect(page.locator("#tmb")).toHaveAttribute("aria-expanded", "true");
  expect(await page.locator("#shr button:visible").evaluateAll((l) => l.map((b) => b.id).filter((i) => i !== "inb"))).toEqual(["shb", "qrb", "hlpb"]);
  await expect(page.locator("#shr span.mr:visible")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.locator("#shr")).toBeHidden();
  await expect(page.locator("#tmb")).toBeFocused();
  await tapMore(page, "#qrb");
  await expect(page.locator("#qrm")).toBeVisible();
  await expect(page.locator("#shr")).toBeHidden();
  await page.locator("#qrx").click();
  await expect(page.locator("#tmb")).toBeFocused();
  // the home card has no buttons of its own any more
  await expect(page.locator("#home #shr, #home #prb")).toHaveCount(0);
});

// The Library (the book in the bottom bar): every text by group, built from the texts; the home page has no contents
test("the Library lists every text and jumps to one", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await expect(page.locator("#home .tocg, #tfr")).toHaveCount(0);
  await page.locator("#asq").click();
  await expect(page.locator("#jump")).toBeVisible();
  await expect(page.locator("#jl a[data-go]")).toHaveCount(11);
  await page.locator('#jl a[data-go="a5"]').click();
  await page.waitForTimeout(400);
  const top = await page.locator("#a5").evaluate((e) => e.getBoundingClientRect().top);
  expect(Math.abs(top)).toBeLessThan(200);
  expect(page.url()).toContain("#a5");
});

// Home lists the evening (content/routines.json), as Nitya Upasana's Today card lists a session; a title goes to that
// text in the one scroll, and Next goes on to the next text of the evening
test("home lists the evening's texts; a title opens that text and Next goes on @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await expect(page.locator("#tsh")).toHaveText("संध्याकाळ · Evening");
  await expect(page.locator("#tsn")).toHaveText("11 texts", { useInnerText: true });
  expect(await page.locator("#tsl a").evaluateAll((l) => l.map((a) => a.getAttribute("href")))).toEqual(
    ["p1", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10"].map((x) => "./#" + x),
  );
  await expect(page.locator("#tsl li").first()).toContainText("Ganapati Atharvashirsha");
  await expect(page.locator("#tsl li").first().locator(".ttg")).toHaveText("Sanskrit", { useInnerText: true });
  await page.locator('#tsl a[href="./#a3"]').click();
  await page.waitForTimeout(400);
  const top = await page.locator("#a3").evaluate((e) => e.getBoundingClientRect().top);
  expect(Math.abs(top)).toBeLessThan(200);
  await page.locator("#asn").click();
  await page.waitForTimeout(500);
  expect(page.url()).toContain("#a4");
});

// Home on its own, as in Nitya Upasana: the page ends after the evening's list; while reading, Home is not above the texts
test("Home is on its own; a text shows the reading page, Home and Back bring Home back @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await expect(page.locator("#tsc")).toBeVisible();
  await expect(page.locator("#p1")).toBeHidden();
  await expect(page.locator("#a1")).toBeHidden();
  // a title on Home reads the evening from there: its texts, one after another in one scroll (data-run)
  await page.locator('#tsl a[href="./#a2"]').click();
  await expect(page.locator("#a2")).toBeVisible();
  await expect(page.locator("#a1")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.getAttribute("data-run"))).toBe("1");
  await expect(page.locator("#home")).toBeHidden();
  await page.goBack();
  await expect(page.locator("#tsc")).toBeVisible();
  await expect(page.locator("#a2")).toBeHidden();
  await page.goForward();
  await expect(page.locator("#a2")).toBeVisible();
  await page.evaluate(() => document.documentElement.removeAttribute("data-tuck"));
  await page.locator("#ash").click();
  await expect(page.locator("#tsc")).toBeVisible();
  await expect(page.locator("#a2")).toBeHidden();
  // Home left the evening; the Library opens one text on its own, as in Nitya Upasana (.solo)
  expect(await page.evaluate(() => document.documentElement.getAttribute("data-run"))).toBeNull();
  await readText(page, "a5");
  await expect(page.locator("#a5")).toHaveClass(/\bsolo\b/);
  await expect(page.locator("#a4")).toBeHidden();
  await expect(page.locator("#a6")).toBeHidden();
  // a link to a text opens the reading page
  await openSite(page, SETUPS.marathi, { hash: "#a5" });
  await expect(page.locator("#a5")).toBeVisible();
  await expect(page.locator("#home")).toBeHidden();
});

test("the evening's list follows the menu language @mobile", async ({ page }) => {
  await openSite(page, { ...SETUPS.marathi, ui: "mr" });
  await expect(page.locator("#tsn")).toHaveText("११ रचना", { useInnerText: true });
  await expect(page.locator("#tsl li").first().locator(".ttg")).toHaveText("संस्कृत", { useInnerText: true });
});

// the titles in Kannada, Telugu or Gujarati letters (js/render.js SCRIPTS), as Nitya Upasana shows them; the session
// in that language's own word, not Marathi's संध्याकाळ written in its letters (Satish, 2026-10-30)
for (const [setup, head, title] of [
  ["kannada", "ಸಂಜೆ", "ಸುಖಕರ್ತಾ ದುಃಖಹರ್ತಾ"],
  ["telugu", "సాయంత్రం", "సుఖకర్తా దుఃఖహర్తా"],
  ["gujarati", "સાંજ", "સુખકર્તા દુઃખહર્તા"],
])
  test(`the evening's list is in ${setup} letters when they are chosen @mobile`, async ({ page }) => {
    await openSite(page, SETUPS[setup]);
    await expect(page.locator("#tsh span").first()).toHaveText(head);
    await expect(page.locator("#tsl .t1").nth(1)).toHaveText(title);
  });

// The session follows the reading languages (Settings → Reading), as Nitya Upasana's Home card: the main one first,
// the main one alone when there is no second; the top bar's title in the first language shown; every word marked
// with its language, in Kannada, Telugu and Gujarati menus too (Satish, 2026-10-30)
test("English as the main language: the session and its titles in English first, the top bar's title too @mobile", async ({ page }) => {
  await openSite(page, SETUPS["english-main-both"]);
  await expect(page.locator("#tsh")).toHaveText("Evening · संध्याकाळ");
  await expect(page.locator("#tsl li").first().locator(".tno")).toHaveText("1.");
  await expect(page.locator("#tsl .t1").nth(1)).toHaveText("Sukhkarta Dukhharta");
  await expect(page.locator("#tsl .t1").nth(1)).toHaveAttribute("lang", "en");
  await expect(page.locator("#btt")).toHaveText("Sankathara Chaturthi");
  await expect(page.locator("#btt")).toHaveAttribute("lang", "en");
});

test("English alone: no Marathi in the session @mobile", async ({ page }) => {
  await openSite(page, { lead: "en", l2: "", lang: "en" });
  await expect(page.locator("#tsh")).toHaveText("Evening");
  await expect(page.locator("#tsl .t2")).toHaveCount(0);
  expect(await page.locator("#tsc").innerText()).not.toMatch(/[\u0900-\u097F]/);
});

for (const k of ["kn", "te", "gu"])
  test(`${k} letters and menus: Home's words each marked with their language @mobile`, async ({ page }) => {
    await openSite(page, { lang: "both", lead: "mr", l2: "en", ind: k, ui: k, loc: { lat: 39.96, lon: -83.0 } });
    await expect(page.locator("#tsc")).toHaveAttribute("lang", k);
    expect(await langMismatches(page, ["#home", "body > .bar"])).toEqual([]);
  });

test("search finds a line with forgiving spelling and opens it @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await page.locator("#asq").click();
  await expect(page.locator("#jump")).toBeVisible();
  await page.locator("#q").fill("sukhakarta");
  await expect(page.locator("#res li").first()).toBeVisible();
  const n = await page.locator("#res li").count();
  expect(n).toBeGreaterThan(0);
  await page.locator("#q").fill("zzzzqqq");
  await expect(page.locator("#none")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#jump")).toBeHidden();
});

test("search in Marathi letters finds the line", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await page.locator("#asq").click();
  await page.locator("#q").fill("सुखकर्ता");
  await expect(page.locator("#res li").first()).toBeVisible();
});

test("Settings opens, changes theme, high contrast and font, and closes with Back", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await page.locator("#aa").click();
  await expect(page.locator("#panel")).toBeVisible();
  // the theme and contrast are on the Screen tab, the font on Reading (no tabs on desktops: every group at once)
  await settingsTab(page, "screen");
  await page.locator('#st button[data-v="dark"]').click();
  expect(await rootAttr(page, "data-pref")).toBe("dark");
  await page.locator('#st button[data-v="sepia"]').click();
  expect(await rootAttr(page, "data-pref")).toBe("sepia");
  await page.locator("#tc").click();
  expect(await rootAttr(page, "data-hc")).toBe("1");
  await settingsTab(page, "read");
  await page.locator('#sfn button[data-v="classic"]').click();
  expect(await rootAttr(page, "data-font")).toBe("classic");
  await page.locator("#xc").click();
  await expect(page.locator("#panel")).toBeHidden();
  const p = await prefs(page);
  expect([p.th, p.hc, p.fnt]).toEqual(["sepia", 1, "classic"]);
});

test("text size A+ / A− / reset", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await page.locator("#aa").click();
  const fs = () => prefs(page).then((p) => p.fs);
  // the size the page uses now (saved settings only hold it once the reader has changed something)
  const start = await page.evaluate(() => parseFloat(document.documentElement.style.getPropertyValue("--fs")));
  await page.locator("#lg").click();
  await page.locator("#lg").click();
  expect(await fs()).toBe(start + 4);
  await page.locator("#sm").click();
  expect(await fs()).toBe(start + 2);
  await page.locator("#sr").click();
  expect((await prefs(page)).fsu).toBe(0);
  await expect(page.locator("#szv")).toHaveText(/%$/);
});

test("main and second language from the Settings dropdowns", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await page.locator("#aa").click();
  // the English (scholarly spelling) entry of the main-language list
  const opts = await page.locator("#sl1s option").evaluateAll((o) => o.map((x) => [x.value, x.textContent]));
  expect(opts.length).toBeGreaterThanOrEqual(4);
  const kn = opts.find((o) => o[1].includes("ಕನ್ನಡ"));
  await page.locator("#sl1s").selectOption(kn[0]);
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => document.documentElement.lang)).toBe("kn");
  expect(await page.locator("#a1 .verse .mr p").first().textContent()).toMatch(/[ಀ-೿]/);
});

test("piece fold is remembered across a reload @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi, { hash: "#a1" });
  await readText(page, "a2");
  await page.locator("#a2 header").click();
  await page.waitForTimeout(200);
  expect((await prefs(page)).af).toContain("a2");
  await expect(page.locator("#a2 .items")).toBeHidden();
  await page.reload();
  await settle(page);
  await expect(page.locator("#a2 .items")).toBeHidden();
  // going to a folded piece from the Library opens it (the bars, tucked away while reading, are brought back first)
  await page.evaluate(() => document.documentElement.removeAttribute("data-tuck"));
  await page.locator("#asq").click();
  await page.locator('#jl a[data-go="a2"]').click();
  await expect(page.locator("#a2 .items")).toBeVisible();
});

// The section rows (वैदिक मंत्र, आरती) are gone from the reading page, as in Nitya Upasana; a section folded before then
// keeps none of its texts hidden
test("no section rows while reading, and an old section fold hides nothing @mobile", async ({ page }) => {
  await openSite(page, { ...SETUPS.marathi, pf: 1, xf: 1 }, { hash: "#a1" });
  await expect(page.locator(".grp")).toHaveCount(0);
  expect(await rootAttr(page, "data-pf")).toBeNull();
  expect(await rootAttr(page, "data-xf")).toBeNull();
  await expect(page.locator("#a1 .items")).toBeVisible();
  await readText(page, "p1");
  await expect(page.locator("#p1 .items")).toBeVisible();
});

test("home card folds to one line and opens again @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await page.locator("#cvb").click();
  await expect(page.locator("#slim")).toBeVisible();
  await expect(page.locator("#skc")).toBeHidden();
  // no "Card folded" message over the page (Satish, 2026-10-30)
  await expect(page.locator("#fl")).not.toHaveClass(/\bon\b/);
  await page.locator("#slim").click();
  await expect(page.locator("#skc")).toBeVisible();
});

// The month line, the moonrise and the place sit beside the ring, one line each (Satish, 2026-10-30): a longer place
// name ("Lewis Center, OH" after Update my location) used to wrap the chips onto a second line and make the card taller
test("a longer place name keeps the card's height; the place line is one button @mobile", async ({ page }) => {
  const now = { now: new Date("2026-10-30T09:00:00-04:00") };
  const height = (p) => p.locator("#skc").evaluate((c) => Math.round(c.getBoundingClientRect().height));
  await openSite(page, SETUPS.marathi, now);
  await expect(page.locator("#skc .skp")).toContainText("Columbus, OH");
  const columbus = await height(page);
  const lc = await page.context().newPage();
  await openSite(lc, { ...SETUPS.marathi, loc: { lat: 40.2, lon: -83.01 } }, now);
  const place = lc.locator("#skc .skp");
  await expect(place).toContainText("Lewis Center, OH");
  expect(await height(lc)).toBe(columbus);
  // beside the ring, not under it, and one line
  const ring = await lc.locator("#skc .skr").boundingBox();
  const box = await place.boundingBox();
  expect(box.x).toBeGreaterThan(ring.x + ring.width);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await expect(place.locator(".skpl")).toHaveCSS("white-space", "nowrap");
  // named by the place first, then what it does (WCAG 2.5.3)
  await expect(place).toHaveAccessibleName(/^Lewis Center, OH, Update my location$/);
});

// An adhika month is named so: 3 Jun 2026 is in Adhika Jyeshtha
test("the month line names an adhika month @mobile", async ({ page }) => {
  await openSite(page, SETUPS["marathi-menus"], { now: new Date("2026-05-20T09:00:00-04:00") });
  await expect(page.locator("#skc .skpn")).toHaveText("अधिक ज्येष्ठ वद्य चतुर्थी");
});

// Sankashti day (28 Oct 2026 in Columbus): the card opens on tonight's moonrise; the date strip, the calendar
// links wait under More dates
test("on Sankashti day the card leads with moonrise, and More dates opens the rest @mobile", async ({ page }) => {
  // (a phone: desktops show the dates beside the card, with no More dates)
  await page.setViewportSize({ width: 390, height: 844 });
  await openSite(page, SETUPS.marathi, { now: new Date("2026-10-28T17:30:00-04:00") });
  await expect(page.locator("#home")).toHaveClass(/\bpday\b/);
  // the card as on any day, its moonrise lit with the time left, the place outlined, the ring full; no pooja line
  // (Satish, 2026-10-30)
  await expect(page.locator("#skc .skmr.hot b")).toHaveText(/pm/);
  await expect(page.locator("#skc .skmr.hot .skcd")).toHaveText(/^ · in (\d+ h )?\d+ min$/);
  await expect(page.locator("#skc .skp.hot")).toBeVisible();
  await expect(page.locator("#skrc")).toContainText("Today");
  await expect(page.locator("#skc")).not.toContainText("Pooja");
  const more = page.locator("#skmore");
  await expect(more).toBeVisible();
  await expect(more).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#skc .sks")).toBeHidden();
  await more.click();
  await expect(more).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#skc .sks")).toBeVisible();
  // Add all in the foot, in Add to calendar's place, while More dates is open
  await expect(page.locator("#skc .skft #skall")).toBeVisible();
  await expect(page.locator("#skcal")).toBeHidden();
});

// Other days: the card leads with the next Chaturthi date and its moonrise too, with the date strip under More dates
test("on other days the card leads with the next Chaturthi date, and More dates opens the strip @mobile", async ({ page }) => {
  // (in the menu language: English here, Marathi with Marathi menus; a phone)
  await page.setViewportSize({ width: 390, height: 844 });
  await openSite(page, SETUPS.marathi);
  await expect(page.locator("#home")).not.toHaveClass(/\bpday\b/);
  await expect(page.locator("#skc .skh").first()).toHaveText(/^(Angaraki )?Next Chaturthi date$/);
  // today's date waits under More dates with the strip (the ring's count says how far the date is)
  await expect(page.locator("#skc .sktd")).toBeHidden();
  const more = page.locator("#skmore");
  await expect(more).toBeVisible();
  await expect(more).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#skc .sks")).toBeHidden();
  await more.click();
  await expect(more).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#skc .sks")).toBeVisible();
  await expect(page.locator("#skc .sktd")).toBeVisible();
  // (a page of its own: the set-up is given on a page's first visit)
  const mr = await page.context().newPage();
  await openSite(mr, SETUPS["marathi-menus"]);
  await expect(mr.locator("#skc .skh").first()).toHaveText(/^पुढील (अंगारकी )?चतुर्थी$/);
});

// More dates (Satish, 2026-10-30), on a phone: a date in another year keeps the large date on one line, its year on
// the month line; "↩ Next date" sits at the end of today's line, not on a line of its own; Add all to calendar takes
// Add to calendar's place in the foot while More dates is open, so it needs no line under the strip either
test("More dates on a phone: the year on the month line, Next date beside today's, Add all in the foot @mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSite(page, SETUPS.marathi, { now: new Date("2026-10-30T09:00:00-04:00") });
  await expect(page.locator("#skcal")).toBeVisible();
  await expect(page.locator("#skall")).toBeHidden();
  await page.locator("#skmore").click();
  await expect(page.locator("#skall")).toBeVisible();
  await expect(page.locator("#skcal")).toBeHidden();
  await expect(page.locator("#skb")).toBeHidden();
  const line = page.locator("#skc .sktd");
  const lineH = await line.evaluate((e) => e.getBoundingClientRect().height);
  // 25 Jan 2027, two dates on
  await page.locator('#skc .skch[aria-label^="25 Jan 2027"]').click();
  await expect(page.locator("#skc .skd")).toHaveText("Mon, Jan 25");
  await expect(page.locator("#skc .skpn")).toHaveText("Paush Krishna Chaturthi · 2027");
  const one = await page.locator("#skc .skd").evaluate((e) => e.getBoundingClientRect().height < parseFloat(getComputedStyle(e).fontSize) * 2);
  expect(one).toBe(true);
  // Next date at the end of today's line, which keeps its height
  const back = page.locator("#skc .sktd #skb");
  await expect(back).toBeVisible();
  await expect(back).toHaveText("↩ Next date");
  expect(await line.evaluate((e) => e.getBoundingClientRect().height)).toBe(lineH);
  await back.click();
  await expect(page.locator("#skc .skd")).toHaveText("Fri, Nov 27");
  await expect(page.locator("#skc .skpn")).toHaveText("Kartik Krishna Chaturthi");
  await expect(back).toBeHidden();
  // the old lines under the strip are gone
  await expect(page.locator("#skc")).not.toContainText("Back to next");
  await expect(page.locator("#skc")).not.toContainText("upcoming dates");
});

// iPads (600px and wider): under More dates every date at once, a row a year with its label, no strip to scroll;
// last year's dates behind "Last year's dates"
test("More dates on an iPad: a row a year, last year's behind a link", async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await openSite(page, SETUPS.marathi, { now: new Date("2026-10-30T09:00:00-04:00") });
  await page.locator("#skmore").click();
  const years = page.locator("#skc .skyr:not(.old) .sky");
  await expect(years).toHaveText(["2026", "2027"]);
  expect(await page.locator("#skc .sks").evaluate((s) => s.scrollWidth <= s.clientWidth)).toBe(true);
  await expect(page.locator("#skc .skyr.old")).toBeHidden();
  const old = page.locator("#skold");
  await expect(old).toHaveText("‹ Last year's dates");
  await expect(old).toHaveAttribute("aria-expanded", "false");
  await old.click();
  await expect(old).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#skc .skyr.old .sky")).toHaveText("2025");
});

// Desktops (1100px and wider): the dates beside the card's details, always shown; no More dates, and the foot has
// both Add to calendar and Add all to calendar
test("on a desktop the dates sit beside the card, always open", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openSite(page, SETUPS.marathi, { now: new Date("2026-10-30T09:00:00-04:00") });
  await expect(page.locator("#skmore")).toBeHidden();
  await expect(page.locator("#skc .sks")).toBeVisible();
  await expect(page.locator("#skc .sktd")).toBeVisible();
  await expect(page.locator("#skcal")).toBeVisible();
  await expect(page.locator("#skall")).toBeVisible();
  const dates = await page.locator("#skc .skdp").boundingBox();
  const details = await page.locator("#skc .skd").boundingBox();
  expect(dates.x).toBeGreaterThan(details.x + details.width);
  expect(dates.y).toBeLessThan(details.y + details.height);
});

// The card in one piece (Satish, 2026-10-30): the picture in a ring that fills as the next Sankathara Chaturthi comes
// nearer, how far it is under it in the reading languages; beside it the month line, the moonrise and the place;
// Add to calendar and More dates at its foot. 30 Oct 2026: the next is 27 Nov, 28 days off, the ring a little filled
test("the card: the picture in a ring that fills as the day comes nearer, the count under it @mobile", async ({ page }) => {
  await openSite(page, { ...SETUPS.marathi, lang: "both" }, { now: new Date("2026-10-30T09:00:00-04:00") });
  await expect(page.locator("#skrc .skrc1")).toHaveText("२८ दिवस");
  await expect(page.locator("#skrc .skrc2")).toHaveText("28 days");
  const fill = () => page.locator("#skc .skr1").evaluate((c) => parseFloat(c.getAttribute("stroke-dasharray")));
  const early = await fill();
  expect(early).toBeGreaterThan(0);
  expect(early).toBeLessThan(40);
  // the picture still opens full screen
  await expect(page.locator("#skc #iconb")).toBeVisible();
  // beside the ring: the month line, the moonrise and the place; and the foot
  await expect(page.locator("#skc .skpn")).toHaveText("Kartik Krishna Chaturthi");
  await expect(page.locator("#skc .skmr")).toContainText("Moonrise");
  await expect(page.locator("#skc .skp")).toContainText("Columbus");
  await expect(page.locator("#skcal")).toHaveText(/Add to calendar/);
  // the day before: nearly full, Tomorrow
  await page.clock.setFixedTime(new Date("2026-11-26T09:00:00-05:00"));
  await page.reload();
  await settle(page);
  await expect(page.locator("#skrc .skrc1")).toHaveText("उद्या");
  expect(await fill()).toBeGreaterThan(200);
  // no "Ready to use offline" over the card (the badge in Settings → About says it)
  await expect(page.locator("#fl")).not.toHaveText("Ready to use offline");
});

// Kannada menus (js/strings/kn.js), with the texts in Kannada letters: the card, the bars and Settings in Kannada,
// marked lang="kn" so the Kannada font and a screen reader's Kannada voice are used; Settings offers English and
// Kannada only (the menus are English or the language the texts are shown in)
test("Kannada menus: the card, the bars and Settings in Kannada, marked as Kannada @mobile", async ({ page }) => {
  await openSite(page, SETUPS["kannada-menus"]);
  await expect(page.locator("#skc .skh").first()).toHaveText(/^ಮುಂದಿನ (ಅಂಗಾರಕ )?ಚತುರ್ಥಿ$/);
  await expect(page.locator("#rsb")).toHaveAccessibleName("ಓದು");
  await expect(page.locator("#rsb [data-w]")).toHaveAttribute("lang", "kn");
  await page.locator("#aa").click();
  await settingsTab(page, "screen");
  await expect(page.locator("#su button:not([hidden])")).toHaveText(["English", "ಕನ್ನಡ"]);
  await expect(page.locator('#su button[data-v="kn"]')).toHaveAttribute("aria-pressed", "true");
  // back to English, at once
  await page.locator('#su button[data-v="en"]').click();
  await page.locator("#xc").click();
  await expect(page.locator("#rsb")).toHaveAccessibleName("Reading");
});

// Each script's own faces for each text font (css/09-settings-page.css --ks, --kc, --kh): Standard, Classic, and for
// Handwritten Hubballi for Kannada, the Classic face for Telugu and Gujarati; the Atharvashirsha (#p1) keeps a face
// that draws its Vedic marks
for (const [setup, sans, classic, hand] of [
  ["kannada", "Noto Sans Kannada", "SC Kn Classic", "SC Kn Hand"],
  ["telugu", "Noto Sans Telugu", "SC Te Classic", "SC Te Classic"],
  ["gujarati", "Noto Sans Gujarati", "SC Gu Classic", "SC Gu Classic"],
])
  for (const [fnt, aarti, vedic] of [
    ["std", sans, sans],
    ["classic", classic, classic],
    ["hand", hand, sans],
  ])
    test(`${setup} letters in the ${fnt} text font: their own faces`, async ({ page }) => {
      await openSite(page, { ...SETUPS[setup], fnt });
      await buildAll(page);
      const first = (sel) =>
        page
          .locator(sel)
          .first()
          .evaluate((e) => getComputedStyle(e).fontFamily.split(",")[0].replace(/"/g, ""));
      expect(await first(".ash:not(#p1) .verse .mr p")).toBe(aarti);
      expect(await first("#p1 .verse .mr p")).toBe(vedic);
    });

// The menus are English or the language the texts are shown in, never mixed (as in Nitya Upasana): picking other
// letters puts the menus back to English, and Settings then offers English and the new letters' language
for (const [from, ind, pick] of [
  ["mr", "mr", "kn"],
  ["mr", "mr", "te"],
  ["kn", "kn", "gu"],
  ["en", "mr", "te"],
])
  test(`${from} menus, then ${pick} letters picked in Settings: the menus go back to English`, async ({ page }) => {
    const want = "Reading";
    await openSite(page, { ...SETUPS.marathi, ind, ui: from });
    await page.locator("#aa").click();
    await page.locator("#sl1s").selectOption(pick);
    await page.locator("#xc").click();
    await expect(page.locator("#rsb")).toHaveAccessibleName(want);
    expect((await prefs(page)).ind).toBe(pick);
    await page.locator("#aa").click();
    await settingsTab(page, "screen");
    await expect(page.locator("#su button:not([hidden])")).toHaveText(["English", { kn: "ಕನ್ನಡ", te: "తెలుగు", gu: "ગુજરાતી" }[pick]]);
  });

// Menus in another language than the texts (saved before this rule) open in English; with English as the main
// language there is no choice of menus
test("menus never mixed: Telugu menus over Marathi letters open in English; English texts offer no menu choice", async ({ page }) => {
  await openSite(page, { ...SETUPS.marathi, ui: "te" });
  // (the saved settings are tidied as they load: js/store/migrate.js tidy())
  await expect(page.locator("#rsb")).toHaveAccessibleName("Reading");
  await page.locator("#aa").click();
  await settingsTab(page, "screen");
  await expect(page.locator("#su button:not([hidden])")).toHaveText(["English", "मराठी"]);
  await settingsTab(page, "read");
  await page.locator("#sl1s").selectOption("en:simple");
  await settingsTab(page, "screen");
  await expect(page.locator("#surow")).toBeHidden();
});

// Reading sheet: Aa in the bottom bar; language, text size and dhrupad in one place, within thumb reach
test("Aa opens the reading sheet: language, text size and dhrupad, then Escape closes it @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await buildAll(page);
  const rsb = page.locator("#rsb");
  await rsb.click();
  await expect(page.locator("#rsh")).toBeVisible();
  await expect(rsb).toHaveAttribute("aria-expanded", "true");
  const langs = page.locator("#rsl button");
  await expect(langs).toHaveCount(3);
  await expect(langs.first()).toHaveAttribute("aria-pressed", "true");
  await langs.nth(1).click();
  expect(await page.locator("#a1").getAttribute("data-lang")).toBe("en");
  await expect(langs.nth(1)).toHaveAttribute("aria-pressed", "true");
  await langs.nth(2).click();
  expect(await page.locator("#a1").getAttribute("data-lang")).toBe("both");
  const fs0 = (await prefs(page)).fs;
  await page.locator("#rsp").click();
  await page.locator("#rsp").click();
  expect((await prefs(page)).fs).toBe(fs0 + 4);
  await expect(page.locator("#rsv")).toHaveText(/%$/);
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => document.documentElement.style.getPropertyValue("--fs"))).toBe(fs0 + 4 + "px");
  await page.locator("#rsr").click();
  await page.waitForTimeout(600);
  expect((await prefs(page)).fsu).toBe(0);
  await page.locator("#rsf button[data-v='0']").click();
  expect(await rootAttr(page, "data-ref")).toBe("0");
  await expect(page.locator("#rsf button[data-v='0']")).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");
  await expect(page.locator("#rsh")).toBeHidden();
  await expect(rsb).toHaveAttribute("aria-expanded", "false");
  await expect(rsb).toBeFocused();
});

test("reading sheet: a tap outside closes it, and All settings opens Settings @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await page.locator("#rsb").click();
  await page.locator("#rsh").click({ position: { x: 20, y: 20 } });
  await expect(page.locator("#rsh")).toBeHidden();
  await page.locator("#rsb").click();
  await page.locator("#rsall").click();
  await expect(page.locator("#rsh")).toBeHidden();
  await expect(page.locator("#panel")).toBeVisible();
});

test("tapping a line highlights it and is remembered @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi, { hash: "#a1" });
  const line = page.locator("#a1 .items .verse .mr p[data-l]").first();
  await line.scrollIntoViewIfNeeded();
  await line.click();
  await expect(line).toHaveClass(/hl/);
  const id = await line.getAttribute("data-l");
  expect((await prefs(page)).hl).toBe(id);
  await line.click();
  await expect(line).not.toHaveClass(/hl/);
});

// On an iPhone a fixed bar made visible while the page still scrolls can be drawn in the middle of the page: scrolling
// up brings the bars back only once the page stops moving; scrolling down hides them at once
test("scrolling up brings the bars back once the page stops, not mid-scroll @mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSite(page, SETUPS.marathi, { hash: "#p1" }); // the Atharvashirsha, a long text, so the page goes on scrolling
  await page.waitForTimeout(800);
  const tucked = () => page.evaluate(() => document.documentElement.hasAttribute("data-tuck"));
  const steps = (dy) =>
    page.evaluate(async (dy) => {
      for (let i = 0; i < 6; i++) {
        scrollBy(0, dy);
        await new Promise((r) => requestAnimationFrame(r));
      }
    }, dy);
  await steps(60);
  await expect.poll(tucked).toBe(true);
  await steps(-30);
  expect(await tucked()).toBe(true);
  await expect.poll(tucked).toBe(false);
});

test("bottom bar Next goes to the next piece", async ({ page }) => {
  await openSite(page, SETUPS.marathi, { hash: "#a1" });
  await page.waitForTimeout(300);
  await page.locator("#asn").click();
  await page.waitForTimeout(500);
  expect(page.url()).toContain("#a2");
});

test("dialogs: QR, Help and Add to Home Screen open and close with Escape", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await tapMore(page, "#qrb");
  await expect(page.locator("#qrm")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#qrm")).toBeHidden();
  await tapMore(page, "#hlpb");
  await expect(page.locator("#help")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#help")).toBeHidden();
});

test("picture opens full screen and closes", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await page.locator("#iconb").click();
  await expect(page.locator("#pzv")).toBeVisible();
  await expect(page.locator("#pzi")).toBeVisible();
  await page.locator("#pzx").click();
  await expect(page.locator("#pzv")).toBeHidden();
});

test("IAST spelling switches in place without a reload", async ({ page }) => {
  await openSite(page, SETUPS.english, { hash: "#a1" });
  const first = () => page.locator("#a1 .items .verse .en p").first().textContent();
  expect(await first()).toContain("Sukhkarta");
  await page.evaluate((k) => {
    // what Settings does when "English · sukhakartā" is picked
    const s = document.getElementById("sl2s");
    const o = [...s.options].find((x) => /ā/.test(x.textContent));
    s.value = o.value;
    s.dispatchEvent(new Event("change", { bubbles: true }));
  }, PREFS_KEY);
  await page.waitForTimeout(300);
  expect(await first()).toMatch(/sukhakartā/);
});

test("the date card shows the next Sankashti with moonrise", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  const card = await page.locator("#skc").innerText();
  expect(card).toMatch(/Moonrise|moonrise|चंद्रोदय/);
});

test("reopens where the reader was (within 12 hours)", async ({ page }) => {
  await openSite(page, SETUPS.marathi, { hash: "#a6" });
  await page.waitForTimeout(500);
  await page.evaluate(() => dispatchEvent(new Event("pagehide")));
  await page.goto("./");
  await settle(page);
  await page.waitForTimeout(300);
  const top = await page.locator("#a6").evaluate((e) => e.getBoundingClientRect().top);
  expect(Math.abs(top)).toBeLessThan(400);
});

// Pinch never zooms the page, wherever it starts (a page that zooms only in some places looks broken on a
// phone). It resizes the text, except on the home card, where it does nothing.
// Chromium only: Firefox has no mobile emulation and desktop WebKit cannot create Touch objects
test.describe("pinch @chromium-only", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  // fires a two-finger touchstart on the element and reports whether the site stopped the browser's zoom
  const pinchStart = (page, selector) =>
    page
      .locator(selector)
      .first()
      .evaluate((el) => {
        const r = el.getBoundingClientRect();
        const t = (id, dx) => new Touch({ identifier: id, target: el, clientX: r.left + 20 + dx, clientY: r.top + 10 });
        const touches = [t(1, 0), t(2, 60)];
        const ev = new TouchEvent("touchstart", { touches, targetTouches: touches, changedTouches: touches, bubbles: true, cancelable: true });
        el.dispatchEvent(ev);
        const end = new TouchEvent("touchend", { touches: [], targetTouches: [], changedTouches: touches, bubbles: true, cancelable: true });
        el.dispatchEvent(end);
        return ev.defaultPrevented;
      });

  // spreads two fingers apart on the element and returns the text size before and after
  const pinchOut = (page, selector) =>
    page
      .locator(selector)
      .first()
      .evaluate(async (el) => {
        const fs = () => document.documentElement.style.getPropertyValue("--fs");
        const before = fs();
        const r = el.getBoundingClientRect();
        const t = (id, x) => new Touch({ identifier: id, target: el, clientX: r.left + x, clientY: r.top + 10 });
        const fire = (type, touches) =>
          el.dispatchEvent(new TouchEvent(type, { touches, targetTouches: touches, changedTouches: touches, bubbles: true, cancelable: true }));
        fire("touchstart", [t(1, 20), t(2, 80)]);
        fire("touchmove", [t(1, 10), t(2, 200)]);
        await new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)));
        const after = fs();
        el.dispatchEvent(new TouchEvent("touchend", { touches: [], targetTouches: [], changedTouches: [t(1, 10), t(2, 200)], bubbles: true }));
        return { before, after };
      });

  test("on the home card a pinch does nothing", async ({ page }) => {
    await openSite(page, SETUPS.marathi);
    const r = await pinchOut(page, "#home .top .hero");
    expect(r.after).toBe(r.before);
    await expect(page.locator("#szt")).not.toHaveClass(/\bon\b/);
  });
  test("on a verse it resizes the text, with the size shown on screen", async ({ page }) => {
    await openSite(page, SETUPS.marathi, { hash: "#a1" });
    await page.locator("#a1 .items .verse p").first().scrollIntoViewIfNeeded();
    const r = await pinchOut(page, "#a1 .items .verse p");
    expect(parseFloat(r.after)).toBeGreaterThan(parseFloat(r.before));
    const box = await page.locator("#szt").boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(844);
  });
  test("on a verse it resizes the text instead of zooming", async ({ page }) => {
    await openSite(page, SETUPS.marathi, { hash: "#a1" });
    expect(await pinchStart(page, "#a1 .items .verse p")).toBe(true);
  });
  test("on the home card, Settings and Help the page does not zoom either", async ({ page }) => {
    await openSite(page, SETUPS.marathi);
    expect(await pinchStart(page, "#home .top .hero")).toBe(true);
    await page.locator("#aa").click();
    expect(await pinchStart(page, "#panel .sp-card")).toBe(true);
    await page.locator("#xc").click();
    await tapMore(page, "#hlpb");
    expect(await pinchStart(page, "#help .hlpin")).toBe(true);
  });
});

// Morning | Afternoon | Evening, as in Nitya Upasana: a session with no texts is left out, and the switch shows only once
// two or more sessions have texts (js/features/session-card.js). Today only the evening has texts: no switch
test("Home's session: the evening alone has no switch; with a morning too, the switch shows the sessions with texts @mobile", async ({ page }) => {
  await openSite(page, SETUPS.english);
  await expect(page.locator("#tss")).toBeHidden();
  await expect(page.locator("#tsh")).toContainText("Evening");
  await expect(page.locator("#tsl li")).toHaveCount(11);
  // a routine with a morning as well, opened at 9 in the morning
  await page.route("**/content/routines.json", (r) =>
    r.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        morning: { mode: "fixed", texts: ["vedic-chant-atharvashirsha", "aarti-sukhkarta"] },
        evening: { mode: "fixed", texts: ["aarti-sukhkarta", "aarti-ghalin-lotangan", "aarti-jai-jagdish-hare"] },
      }),
    }),
  );
  await page.clock.setFixedTime(new Date("2026-10-15T09:00:00-04:00"));
  await page.reload();
  await page.waitForSelector("html[data-ready]");
  await expect(page.locator("#tss")).toBeVisible();
  await expect(page.locator('#tss [role="tab"]:visible')).toHaveCount(2);
  await expect(page.locator("#tss-afternoon")).toBeHidden();
  await expect(page.locator("#tss-morning")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tsh")).toContainText("Morning");
  await expect(page.locator("#tsl li")).toHaveCount(2);
  await page.locator("#tss-evening").click();
  await expect(page.locator("#tss-evening")).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#tsh")).toContainText("Evening");
  await expect(page.locator("#tsl li")).toHaveCount(3);
  await expect(page.locator("#tsl li .t2").first()).toHaveText("Sukhkarta Dukhharta");
});

// Reading the evening, as a session is read in Nitya Upasana: Next › goes on through it, and after its last text goes
// back Home and says the session is over
test("reading the evening: Next › after the last text goes Home and ends it @mobile", async ({ page }) => {
  await openSite(page, SETUPS.english);
  await page.locator('#tsl a[href="./#a9"]').click();
  await expect(page.locator("#a9")).toBeVisible();
  await page.evaluate(() => document.documentElement.removeAttribute("data-tuck"));
  await expect(page.locator("#asn")).toHaveAttribute("aria-label", /Aarti Jai Jagdish Hare/);
  await page.locator("#asn").click();
  await expect.poll(() => page.url()).toContain("#a10");
  await page.evaluate(() => document.documentElement.removeAttribute("data-tuck"));
  await expect(page.locator("#asn")).toHaveAttribute("aria-label", "Next: Home");
  await page.locator("#asn").click();
  await expect(page.locator("#tsc")).toBeVisible();
  await expect(page.locator("#fl")).toHaveText("End of the session");
  expect(await page.evaluate(() => document.documentElement.getAttribute("data-run"))).toBeNull();
});

// A session is read in the routine's order (content/routines.json), which need not be the Library's: Home lists it so,
// and Next › follows it, as in Nitya Upasana
test("a session in another order than the Library's: Home lists it so, and Next › follows it @mobile", async ({ page }) => {
  await page.route("**/content/routines.json", (r) =>
    r.fulfill({ json: { evening: { mode: "fixed", texts: ["aarti-jai-jagdish-hare", "vedic-chant-atharvashirsha", "aarti-sukhkarta"] } } }),
  );
  await openSite(page, SETUPS.english);
  await expect(page.locator("#tsl a.tgo")).toHaveCount(3);
  expect(await page.locator("#tsl a.tgo").evaluateAll((as) => as.map((a) => a.getAttribute("href")))).toEqual(["./#a10", "./#p1", "./#a1"]);
  await page.locator('#tsl a[href="./#a10"]').click();
  await expect(page.locator("#a10")).toBeVisible();
  for (const next of ["#p1", "#a1"]) {
    await page.evaluate(() => document.documentElement.removeAttribute("data-tuck"));
    await page.locator("#asn").click();
    await expect.poll(() => page.url()).toContain(next);
    await expect(page.locator(next)).toBeVisible();
  }
  // on the page too, the session's texts are one after another in its order
  const tops = await page.evaluate(() => ["a10", "p1", "a1"].map((id) => document.getElementById(id).getBoundingClientRect().top));
  expect(tops[0]).toBeLessThan(tops[1]);
  expect(tops[1]).toBeLessThan(tops[2]);
  await page.evaluate(() => document.documentElement.removeAttribute("data-tuck"));
  await expect(page.locator("#asn")).toHaveAttribute("aria-label", "Next: Home");
});

// About's version line: "Close and reopen" (the longest word there) beside the version on a phone; on the narrowest
// phone, under it at its start, never stranded at the right
test("the version line keeps Check for updates beside it, or under its start", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSite(page, SETUPS.english);
  await page.locator("#aa").click();
  await settingsTab(page, "more");
  // as on the phone in the report: saved for offline, and an update waiting
  await page.locator("#offv").evaluate((e) => (e.textContent = "Offline ready"));
  await page.locator("#updv").evaluate((e) => (e.textContent = "Close and reopen"));
  const box = async (sel) => await page.locator(sel).boundingBox();
  expect(Math.abs((await box("#upd .sp-l")).y - (await box("#updv")).y), "one line").toBeLessThan(4);
  await page.setViewportSize({ width: 280, height: 640 });
  const l = await box("#upd .sp-l"),
    v = await box("#updv");
  if (v.y > l.y + 4) expect(Math.abs(v.x - l.x), "under the version, at its start").toBeLessThan(2);
});
