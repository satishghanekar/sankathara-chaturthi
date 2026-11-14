// Layout across screen sizes: from the smallest phones to large monitors, in portrait and landscape.
// Checks the things that break first on an unfamiliar screen: a sideways scroll, a bar that is off
// screen, text that is too small to read, and controls too small to tap.
import { readdirSync, readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { openSite, hasSidewaysScroll, SETUPS, readText, settingsTab, tapPrint, axeEveryTheme, noViolations } from "./helpers.mjs";

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

// The page uses the room it has, on today's screens (Satish 2026-11-13: an upright iPad kept a phone's column, an iPad held
// sideways broke its lines in two columns, a 13-inch iPad read a narrow column beside Home). The tests above check that
// nothing overflows; this one fails when a breakpoint misses a device and leaves the room unused. The text's column, on
// Home and in an aarti: the screen less its edges, or its own cap (46rem; 60rem on a large tablet held upright); beside
// Home or the list, at least 58% of the screen; and in two columns no stanza line broken in two.
const ROOM = [
  ["Galaxy S25", 360, 780],
  ["iPhone 17", 402, 874],
  ["iPhone 17 Pro Max", 440, 956],
  ["iPhone 17 sideways", 874, 402],
  ["iPad mini", 744, 1133],
  ["iPad", 810, 1080],
  ["iPad Air", 820, 1180],
  ["iPad Pro 11", 834, 1210],
  ["iPad 13", 1032, 1376],
  ["Galaxy Fold, open", 884, 1104],
  ["iPad mini sideways", 1133, 744],
  ["iPad Air sideways", 1180, 820],
  ["iPad 13 sideways", 1376, 1032],
  ["half a Mac's screen", 960, 1000],
  ["laptop", 1280, 720],
  ["laptop 1366", 1366, 768],
  ["MacBook Air", 1440, 900],
  ["MacBook Pro 16", 1728, 1080],
  ["1080p monitor", 1920, 1080],
];
for (const [name, width, height] of ROOM)
  test(`${name} (${width} × ${height}): the text's column uses the room it has`, async ({ browser, browserName }) => {
    const context = await browser.newContext({
      viewport: { width, height },
      ...(browserName !== "firefox" ? { isMobile: width < 1440, hasTouch: width < 1440 } : {}),
      serviceWorkers: "block",
    });
    const page = await context.newPage();
    await openSite(page, SETUPS.marathi);
    const room = (where) =>
      page.evaluate((where) => {
        const vw = innerWidth;
        const root = document.documentElement;
        const col = document.querySelector(where === "home" && !root.hasAttribute("data-rail") ? "#home" : "main.wrap");
        const w = col.getBoundingClientRect().width;
        const rem = parseFloat(getComputedStyle(root).fontSize) || 16;
        const cap = (vw >= 1024 && innerHeight > vw ? 60 : vw >= 600 ? 46 : 34) * rem;
        const lines = [...document.querySelectorAll(".ash:not([hidden]) .verse p")].filter((p) => {
          const r = p.getBoundingClientRect();
          return r.height && r.bottom > 0 && r.top < innerHeight;
        });
        const broken = lines.filter((p) => p.getBoundingClientRect().height > parseFloat(getComputedStyle(p).lineHeight) * 1.5).length;
        return { vw, w, cap, rail: root.hasAttribute("data-rail"), cols: root.getAttribute("data-cols"), broken, lines: lines.length };
      }, where);
    const check = (m, where) => {
      if (m.rail) expect(m.w, `${where}: the text beside Home or the list`).toBeGreaterThanOrEqual(m.vw * 0.58);
      else expect(m.w, `${where}: the column`).toBeGreaterThanOrEqual(Math.min(m.cap, m.vw - 50) - 1);
    };
    check(await room("home"), "Home");
    await page.locator("#hm, #asq").first().click();
    await page.locator("#jl a[data-go]", { hasText: "देवीची आरती" }).first().click();
    await page.waitForTimeout(400);
    const text = await room("text");
    check(text, "a text");
    expect(text.lines, "stanza lines on screen").toBeGreaterThan(3);
    // (the zoom on monitors from 2200px makes lines measure taller than they are; none is in this list)
    if (text.cols === "2") expect(text.broken, "stanza lines broken in two columns").toBe(0);
    await context.close();
  });

// Satish, 2026-11-12 (mockup E): the top bar and the bottom bar are each one solid, rounded pill floating over the page
// (css/16-floating-bars.css), their buttons without boxes; Prev and Next are round buttons of their own
for (const s of [
  { name: "a 320px phone", width: 320, height: 640 },
  { name: "a phone", width: 390, height: 844 },
  { name: "an iPad", width: 820, height: 1180 },
  { name: "a computer", width: 1440, height: 900 },
])
  test(`the top and bottom bars are floating pills on ${s.name}`, async ({ page }) => {
    await page.setViewportSize({ width: s.width, height: s.height });
    await openSite(page, SETUPS.marathi, { hash: "#a1" });
    const look = (sel) =>
      page.locator(sel).evaluate((e) => {
        const c = getComputedStyle(e),
          r = e.getBoundingClientRect();
        return {
          bg: c.backgroundColor,
          radius: parseFloat(c.borderTopLeftRadius),
          shadow: c.boxShadow,
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
          h: r.height,
        };
      });
    for (const sel of ["body > .bar", "#asi"]) {
      const p = await look(sel);
      // rounded ends, a shadow, a solid colour (no see-through: the words on it keep their contrast over any text)
      expect(p.radius, sel).toBeGreaterThanOrEqual(p.h / 2 - 1);
      expect(p.shadow, sel).not.toBe("none");
      expect(p.bg, sel).toMatch(/^rgb\(/);
      // floating: clear of the screen's edges
      expect(p.left, sel).toBeGreaterThanOrEqual(7);
      expect(p.right, sel).toBeLessThanOrEqual(s.width - 7);
      expect(p.top, sel).toBeGreaterThanOrEqual(5);
      expect(p.bottom, sel).toBeLessThanOrEqual(s.height - 11);
    }
    // the strip behind the bottom pill is gone, and lets taps through to the page beside the pill
    const strip = await page.locator("#asc").evaluate((e) => [getComputedStyle(e).backgroundColor, getComputedStyle(e).pointerEvents]);
    expect(strip).toEqual(["rgba(0, 0, 0, 0)", "none"]);
    // a button at rest has no box; Prev and Next are round, and every button is in its pill
    expect((await look("#asq")).bg).toBe("rgba(0, 0, 0, 0)");
    expect((await look("#tmb")).bg).toBe("rgba(0, 0, 0, 0)");
    const pill = await look("#asi");
    for (const id of ["#asv", "#asn"]) {
      const b = await look(id);
      expect(b.radius, id).toBeGreaterThanOrEqual(b.h / 2 - 1);
      expect(b.bg, id).not.toBe("rgba(0, 0, 0, 0)");
    }
    for (const b of await page.locator("#asi button:visible").all()) {
      const r = await b.boundingBox();
      expect(r.x).toBeGreaterThanOrEqual(pill.left);
      expect(r.x + r.width).toBeLessThanOrEqual(pill.right);
      expect(r.height).toBeGreaterThanOrEqual(44);
      expect(r.width).toBeGreaterThanOrEqual(44);
      // no word cut or run into its neighbour
      expect(await b.evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
    }
    // the button in use keeps its filled tile, so it still stands out
    await page.locator("#rsb").click();
    expect((await look("#rsb")).bg).not.toBe("rgba(0, 0, 0, 0)");
    await page.keyboard.press("Escape");
    // the last line of the text ends above the pill
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    const end = await page.evaluate(() => document.querySelector("#a1").getBoundingClientRect().bottom);
    expect(end).toBeLessThanOrEqual((await look("#asi")).top);
  });

test("the bars' words keep their contrast on the pills in every theme", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSite(page, SETUPS.marathi, { hash: "#a1" });
  expect(await axeEveryTheme(page, ["body > .bar", "#asc"])).toEqual(noViolations());
});

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
    await tapPrint(page);
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
