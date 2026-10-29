// Interactions: what readers do, checked in every browser engine (and on phone emulation for @mobile).
import { test, expect } from "@playwright/test";
import { openSite, settle, SETUPS, PREFS_KEY, tapMore } from "./helpers.mjs";

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

// Settings, as in Nitya Upasana: Reading | Screen | More, one tab at a time, opening on Reading each time
test("Settings has the tabs Reading, Screen and More, and opens on Reading @mobile", async ({ page }) => {
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
  const bar = await page.locator("body > .bar").first().evaluate((e) => e.getBoundingClientRect().bottom);
  expect(Math.abs(top - bar)).toBeLessThan(2);
  await page.locator("#xc").click();
  await page.locator("#aa").click();
  await expect(page.locator('#spv [data-v="read"]')).toHaveAttribute("aria-pressed", "true");
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
  expect(await page.locator("#tsl a").evaluateAll((l) => l.map((a) => a.dataset.go))).toEqual(["p1", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10"]);
  await expect(page.locator("#tsl li").first()).toContainText("Ganapati Atharvashirsha");
  await expect(page.locator("#tsl li").first().locator(".ttg")).toHaveText("Sanskrit", { useInnerText: true });
  await page.locator('#tsl a[data-go="a3"]').click();
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
  await expect(page.locator("#g-aarti")).toBeHidden();
  await page.locator('#tsl a[data-go="a2"]').click();
  await expect(page.locator("#a2")).toBeVisible();
  await expect(page.locator("#a1")).toBeVisible();
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

test("the evening's list is in Kannada letters when they are chosen @mobile", async ({ page }) => {
  await openSite(page, SETUPS.kannada);
  await expect(page.locator("#tsh span").first()).toHaveText("ಸಂಧ್ಯಾಕಾಳ");
  await expect(page.locator("#tsl .t1").nth(1)).toHaveText("ಸುಖಕರ್ತಾ ದುಃಖಹರ್ತಾ");
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
  // the theme and contrast are on the Screen tab, the font on Reading
  await page.locator('#spv [data-v="screen"]').click();
  await page.locator('#st button[data-v="dark"]').click();
  expect(await rootAttr(page, "data-pref")).toBe("dark");
  await page.locator('#st button[data-v="sepia"]').click();
  expect(await rootAttr(page, "data-pref")).toBe("sepia");
  await page.locator("#tc").click();
  expect(await rootAttr(page, "data-hc")).toBe("1");
  await page.locator('#spv [data-v="read"]').click();
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
  await expect(page.locator(".grp")).toHaveCount(2);
  for (const g of await page.locator(".grp").all()) await expect(g).toBeHidden();
  expect(await rootAttr(page, "data-pf")).toBeNull();
  expect(await rootAttr(page, "data-xf")).toBeNull();
  await expect(page.locator("#a1 .items")).toBeVisible();
  await page.evaluate(() => document.getElementById("p1").scrollIntoView());
  await expect(page.locator("#p1 .items")).toBeVisible();
});

test("home card folds to one line and opens again @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await page.locator("#cvb").click();
  await expect(page.locator("#slim")).toBeVisible();
  await expect(page.locator("#skc")).toBeHidden();
  await page.locator("#slim").click();
  await expect(page.locator("#skc")).toBeVisible();
});

// Sankashti day (28 Oct 2026 in Columbus): the card opens on tonight's moonrise; the date strip, the calendar
// links wait under More dates
test("on Sankashti day the card leads with moonrise, and More dates opens the rest @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi, { now: new Date("2026-10-28T17:30:00-04:00") });
  await expect(page.locator("#home")).toHaveClass(/\bpday\b/);
  await expect(page.locator("#skc .skm b").last()).toHaveText(/pm/);
  const more = page.locator("#skmore");
  await expect(more).toBeVisible();
  await expect(more).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#skc .sks")).toBeHidden();
  await more.click();
  await expect(more).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#skc .sks")).toBeVisible();
  await expect(page.locator("#skall")).toBeVisible();
});

// Other days: the card leads with the next Chaturthi date and its moonrise too, with the date strip under More dates
test("on other days the card leads with the next Chaturthi date, and More dates opens the strip @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await expect(page.locator("#home")).not.toHaveClass(/\bpday\b/);
  await expect(page.locator("#skc .skh").first()).toContainText("पुढील चतुर्थी");
  await expect(page.locator("#skc .sktd")).toBeVisible();
  const more = page.locator("#skmore");
  await expect(more).toBeVisible();
  await expect(more).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator("#skc .sks")).toBeHidden();
  await more.click();
  await expect(more).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#skc .sks")).toBeVisible();
});

// Reading sheet: Aa in the bottom bar; language, text size and dhrupad in one place, within thumb reach
test("Aa opens the reading sheet: language, text size and dhrupad, then Escape closes it @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
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
  await openSite(page, SETUPS.english);
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
    page.locator(selector).first().evaluate((el) => {
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
    page.locator(selector).first().evaluate(async (el) => {
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
    await openSite(page, SETUPS.marathi);
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
