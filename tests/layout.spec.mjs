// Layout across screen sizes: from the smallest phones to large monitors, in portrait and landscape.
// Checks the things that break first on an unfamiliar screen: a sideways scroll, a bar that is off
// screen, text that is too small to read, and controls too small to tap.
import { readdirSync, readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { openSite, hasSidewaysScroll, SETUPS, readText, settingsTab } from "./helpers.mjs";

export const SCREENS = [
  { name: "phone-320", width: 320, height: 640, mobile: true },
  { name: "iphone-se", width: 375, height: 667, mobile: true },
  { name: "iphone-15", width: 393, height: 852, mobile: true },
  { name: "android-412", width: 412, height: 915, mobile: true },
  { name: "phone-landscape", width: 844, height: 390, mobile: true },
  { name: "ipad-mini", width: 768, height: 1024, mobile: true },
  { name: "ipad-air", width: 820, height: 1180, mobile: true },
  { name: "ipad-landscape", width: 1180, height: 820, mobile: true },
  { name: "android-tablet", width: 800, height: 1280, mobile: true },
  { name: "laptop", width: 1280, height: 800, mobile: false },
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "full-hd", width: 1920, height: 1080, mobile: false },
  { name: "monitor-1440p", width: 2560, height: 1440, mobile: false },
];

for (const s of SCREENS)
  for (const setup of ["marathi", "both", "kannada-both"]) {
    test(`${s.name} · ${setup}: fits the screen`, async ({ browser, browserName }) => {
      const context = await browser.newContext({
        viewport: { width: s.width, height: s.height },
        // Firefox has no mobile emulation; it still checks the sizes
        ...(browserName !== "firefox" ? { isMobile: s.mobile, hasTouch: s.mobile } : {}),
        serviceWorkers: "block",
      });
      const page = await context.newPage();
      const errors = [];
      await openSite(page, SETUPS[setup], { errors });
      expect(errors).toEqual([]);
      expect(await hasSidewaysScroll(page), "no sideways scroll on the home page").toBe(false);
      // the top bar is on screen and fully inside it
      const bar = await page.locator(".bar").boundingBox();
      expect(bar.y).toBeGreaterThanOrEqual(0);
      expect(bar.x + bar.width).toBeLessThanOrEqual(s.width + 1);
      // open a piece: still no sideways scroll, and the text is readable
      await readText(page, "a1");
      await page.waitForTimeout(150);
      expect(await hasSidewaysScroll(page), "no sideways scroll in a piece").toBe(false);
      const size = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector("#a1 .verse p")).fontSize));
      expect(size, "verse text at least 16px").toBeGreaterThanOrEqual(16);
      // no verse line is wider than the screen
      const wide = await page.evaluate(
        (w) =>
          [...document.querySelectorAll(".verse p")].filter((p) => {
            const r = p.getBoundingClientRect();
            return r.width && r.right > w + 1;
          }).length,
        s.width,
      );
      expect(wide, "verse lines wider than the screen").toBe(0);
      await context.close();
    });
  }

test("tap targets in the top and bottom bars are at least 44px @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  const small = await page.evaluate(() =>
    [...document.querySelectorAll(".bar button, .bar a, #asc button")]
      .filter((b) => b.offsetParent !== null)
      .map((b) => ({ id: b.id, ...b.getBoundingClientRect().toJSON() }))
      .filter((r) => r.width < 44 || r.height < 44)
      .map((r) => `${r.id} ${Math.round(r.width)}×${Math.round(r.height)}`),
  );
  expect(small).toEqual([]);
});

// Tap targets that look smaller than 44px (Settings' choices, 32px, so the Reading tab fits one iPhone screen; Use A4)
// reach 44px with an invisible area above and below (from Nitya Upasana's 2026-11-02 walk-through): a tap 5.5px outside
// what is drawn still reaches the button, and no button's own middle is taken by another's area
async function reach(page, sel) {
  return page.evaluate((s) => {
    const out = [];
    const bs = [...document.querySelectorAll(s)].filter((b) => b.getClientRects().length && !b.closest("[hidden]"));
    for (const b of bs) {
      b.scrollIntoView({ block: "center" });
      const r = b.getBoundingClientRect(),
        x = r.left + r.width / 2,
        name = b.textContent.trim().slice(0, 20);
      for (const y of [r.top - 5.5, r.bottom + 5.5, r.top + r.height / 2]) {
        const hit = document.elementFromPoint(x, y);
        if (!hit || !(hit === b || b.contains(hit)))
          out.push(`${name} at ${Math.round(y - r.top)}: ${hit ? hit.tagName + "#" + hit.id + "." + hit.className : "nothing"}`);
      }
    }
    return { n: bs.length, out };
  }, sel);
}
for (const [name, size] of [
  ["a phone", { width: 390, height: 844 }],
  ["an upright iPad", { width: 820, height: 1180 }],
  ["a computer", { width: 1440, height: 900 }],
])
  test(`tap targets: Settings' choices and Use A4 reach 44px, ${name}`, async ({ page }) => {
    await page.setViewportSize(size);
    await openSite(page, SETUPS.marathi);
    await page.locator("#aa").click();
    for (const tab of ["read", "screen"]) {
      await settingsTab(page, tab);
      const r = await reach(page, "#panel .sp-seg button");
      expect(r.n, tab).toBeGreaterThan(5);
      expect(r.out, tab).toEqual([]);
    }
    await page.keyboard.press("Escape");
    if (!(await page.locator("#prb").isVisible())) await page.locator("#slim").click();
    await page.locator("#prb").click();
    await page.locator("#prm").waitFor({ state: "visible" });
    if (await page.locator("#prnx").isVisible()) await page.locator("#prnx").click();
    await expect(page.locator("#prpa")).toBeVisible();
    expect((await reach(page, "#prpa")).out).toEqual([]);
    for (const b of await page.locator(".wide:visible").all()) expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);
    // the preview and page-count frames have no <base> (Safari refuses one there, with a console error)
    for (const f of await page.locator('iframe[title="Preview"], iframe[title="Pages"]').all())
      expect(await f.evaluate((x) => x.contentDocument.querySelectorAll("base").length)).toBe(0);
  });

// A line too long for its row wraps with the rest of it at the left edge, not indented (an indented rest looked like
// stray spaces on a phone, Satish 2026-11-10): no stylesheet indents the rest of a wrapped line, on screen or printed
test("no text's wrapped line is indented, on screen or printed", () => {
  const dir = new URL("../css/", import.meta.url);
  const hanging = readdirSync(dir).filter((f) => f.endsWith(".css") && /text-indent:\s*-/.test(readFileSync(new URL(f, dir), "utf8")));
  expect(hanging).toEqual([]);
});
