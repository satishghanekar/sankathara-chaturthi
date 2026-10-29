// The Library (#jump), as in Nitya Upasana (its tests/library.spec.mjs): the search box at the foot of the screen on
// phones and tablets (at the top on wide screens), each search's best results at the top, and Recent.
import { test, expect } from "@playwright/test";
import { openSite, settle, SETUPS } from "./helpers.mjs";

// the piece at the top of the screen
const onPiece = (page) =>
  page.evaluate(() => {
    let c = "";
    document.querySelectorAll(".ash").forEach((x) => {
      if (x.offsetParent !== null && x.getBoundingClientRect().top <= 90) c = x.id;
    });
    return c;
  });
// the wide layout (1100px and wider here): the search box at the top
const wide = (page) => page.evaluate(() => document.documentElement.hasAttribute("data-rail"));

test("the Library covers the page to the foot of the screen, its search box inside it, while a text is open @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await page.locator("#asq").click();
  await page.locator("#jl a").nth(1).click();
  await expect(page.locator("#jump")).toBeHidden();
  await page.evaluate(() => document.getElementById("asq").click());
  await expect(page.locator("#jump")).toBeVisible();
  const w = await wide(page);
  const m = () =>
    page.evaluate(() => {
      const j = document.getElementById("jump"),
        b = document.getElementById("qbar"),
        jr = j.getBoundingClientRect(),
        br = b.getBoundingClientRect();
      // no scroll between the box and the Library on phones (on wide screens the whole Library scrolls)
      let sc = false;
      for (let e = b.parentElement; e && e !== j; e = e.parentElement) if (/auto|scroll/.test(getComputedStyle(e).overflowY)) sc = true;
      return { jb: jr.bottom, bt: br.top, bb: br.bottom, sc, pos: getComputedStyle(b).position, h: innerHeight, sx: j.scrollWidth - j.clientWidth };
    });
  for (const end of [false, true]) {
    if (end) await page.locator("#jump").evaluate((j) => [j, j.querySelector(".libsc")].forEach((e) => (e.scrollTop = e.scrollHeight)));
    const r = await m();
    expect(r.pos).not.toBe("fixed");
    expect(r.sc).toBe(false);
    expect(r.sx).toBe(0);
    if (!w) {
      expect(Math.abs(r.jb - r.h)).toBeLessThan(1);
      expect(Math.abs(r.bb - r.jb)).toBeLessThan(1);
      expect(r.bt).toBeGreaterThan(r.h - 120);
    } else expect(r.bb).toBeLessThan(r.jb);
  }
  // a short list of results: the box stays at the foot
  await page.locator("#q").fill("nurvi");
  await expect(page.locator("#res button").first()).toBeVisible();
  const r = await m();
  if (!w) expect(Math.abs(r.bb - r.h)).toBeLessThan(1);
});

// On an iPhone the first results went out of reach in Nitya Upasana, the list scrolled to its end: each search shows
// its list from the top, and the keyboard's lift leaves no room for the home bar under the box
test("each search shows its best results at the top, above the box and the keyboard @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  await page.locator("#asq").click();
  await page.locator("#q").fill("aarti");
  await expect(page.locator("#res li.rt").first()).toBeVisible();
  const sc = page.locator("#jump .libsc");
  // scrolled to the end of a long list, then typing on
  await page.locator("#jump").evaluate((j) => [j, j.querySelector(".libsc")].forEach((e) => (e.scrollTop = e.scrollHeight)));
  await page.locator("#q").pressSequentially(" jagdish");
  await expect(page.locator("#res li.rt .rl").first()).toHaveText("आरती जय जगदीश हरे");
  await expect.poll(() => sc.evaluate((e) => e.scrollTop)).toBe(0);
  await expect(page.locator("#res li.rt").first()).toBeInViewport();
  if (await wide(page)) return;
  // the keyboard open (its height as --kb): the box just above it, the Library still covering the page under it
  await page.locator("#jump").evaluate((j) => j.style.setProperty("--kb", "300px"));
  const r = await page.evaluate(() => ({
    j: document.getElementById("jump").getBoundingClientRect().bottom,
    b: document.getElementById("qbar").getBoundingClientRect().bottom,
    pb: getComputedStyle(document.getElementById("qbar")).paddingBottom,
    h: innerHeight,
  }));
  expect(Math.abs(r.j - r.h)).toBeLessThan(1);
  expect(Math.abs(r.b - (r.h - 300))).toBeLessThan(1);
  expect(r.pb).toBe("10px");
});

test("Recent: the places gone to from search, newest first; × takes one away, Clear all; kept after a reload @mobile", async ({ page }) => {
  await openSite(page, SETUPS.marathi);
  // the Library is in the bottom bar on Home too, and its search box at the foot of the screen
  await page.locator("#asq").click();
  await expect(page.locator("#rcn")).toBeHidden();
  const vp = page.viewportSize(),
    qb = await page.locator("#q").boundingBox();
  // (at the top on wide screens)
  if (!(await wide(page))) expect(qb.y + qb.height).toBeGreaterThan(vp.height - 90);
  else expect(qb.y).toBeLessThan(260);
  // a text, then a line
  await page.locator("#q").fill("sukhakarta");
  await page.locator("#res li.rt button").first().click();
  await expect.poll(() => onPiece(page)).toBe("a1");
  await page.evaluate(() => document.getElementById("asq").click());
  await page.locator("#q").fill("nurvi");
  await page.locator("#res li:not(.rh):not(.rt) button").first().click();
  await expect(page.locator("#jump")).toBeHidden();
  await page.evaluate(() => document.getElementById("asq").click());
  await expect(page.locator("#rcn")).toBeVisible();
  await expect(page.locator("#rcl li")).toHaveCount(2);
  await expect(page.locator("#rcl li").first()).toHaveClass("rln");
  await expect(page.locator("#rcl li").first()).toContainText("नुरवी");
  await expect(page.locator("#rcl li").nth(1)).toHaveClass("rt");
  // typing hides it; an empty box brings it back
  await page.locator("#q").fill("deva");
  await expect(page.locator("#rcn")).toBeHidden();
  await page.locator("#q").fill("");
  await expect(page.locator("#rcn")).toBeVisible();
  // × takes the line away; the text stays, also after a reload
  await page.locator("#rcl .rcx").first().click();
  await expect(page.locator("#rcl li")).toHaveCount(1);
  await settle(page);
  await page.reload();
  await page.waitForSelector("html[data-ready]");
  await page.evaluate(() => document.getElementById("asq").click());
  await expect(page.locator("#rcl li")).toHaveCount(1);
  // a tap on it opens the text
  await page.locator("#rcl .rcg").click();
  await expect.poll(() => onPiece(page)).toBe("a1");
  // Clear empties it
  await page.evaluate(() => document.getElementById("asq").click());
  await page.locator("#rcc").click();
  await expect(page.locator("#rcn")).toBeHidden();
});
