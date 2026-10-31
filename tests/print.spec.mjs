// Print and PDF: the most thorough suite, because the printout is what the group hands round.
//
// For every combination of layout × text font × paper size (and a set of special cases) it checks:
//   - the contents page lists every piece (without page numbers), and each piece starts on a new page
//   - every unbroken block (heading with its dhrupad and first stanza, each stanza) sits on one page
//   - every piece is printed, even when it or its section is folded on screen
//   - the screen-only controls (Open all, settings, etc.) never print
//   - in layouts with English, every English line of the print view is in the PDF
//   - the page count and the page each piece starts on match the recorded baseline
//   - no line is lost, side by side rows stay in step and lines break mid-phrase only rarely (see the print audit)
//   - nothing prints in a page's bottom margin but its footer; sideways, an aarti of three stanzas fits on one page
// PDFs can only be made by Chromium, so this suite is Chromium-only.
import { test, expect, devices } from "@playwright/test";
import { openSite, SETUPS, SNAP_ENV } from "./helpers.mjs";
import { printOnce, checkPrintout, stubPrint, printFromButton, howStep, readPrintView, addMarkers, pdfPages, markerPages } from "./print-helpers.mjs";

test.describe.configure({ mode: "parallel" });

// The Print pop-up's choices: Portrait (pr1) and Landscape (pr2). One language prints in a column either way;
// both languages print side by side, on Landscape only (stacked is no longer offered).
const LAYOUTS = [
  { name: "marathi-single-column", setup: "marathi", choice: "pr1", mode: "one" },
  { name: "english-single-column", setup: "english", choice: "pr1", mode: "one" },
];
const SIDEWAYS = [
  { name: "marathi-single-column", setup: "marathi", choice: "pr2", mode: "one" },
  { name: "english-single-column", setup: "english", choice: "pr2", mode: "one" },
  { name: "both-side-by-side", setup: "both", choice: "pr2", mode: "side" },
  { name: "kannada-side-by-side", setup: "kannada-both", choice: "pr2", mode: "side" },
];
// iPhone 13 emulation in Chromium (the device entry names WebKit as its browser, which newContext does not take)
const { defaultBrowserType: _bt, ...IPHONE } = devices["iPhone 13"];
const FONTS = ["std", "classic", "hand"];
// Letter is chosen for US / Canada / Mexico / Philippines, A4 everywhere else (see LTR in js/features/print.js)
const PAPERS = [
  { paper: "Letter", locale: "en-US" },
  { paper: "A4", locale: "en-IN" },
];

// Special cases beyond the main grid (standard font, Letter unless stated)
const EXTRAS = [
  { name: "iast-english-single-column", prefs: SETUPS["english-iast"], choice: "pr1", mode: "one" },
  { name: "iast-both-side-by-side", prefs: SETUPS["both-iast"], choice: "pr2", mode: "side" },
  { name: "english-main-side-by-side", prefs: SETUPS["english-main-both"], choice: "pr2", mode: "side" },
  { name: "kannada-single-column", prefs: SETUPS.kannada, choice: "pr1", mode: "one" },
  { name: "dhrupad-every-verse-single", prefs: SETUPS["marathi-every-verse"], choice: "pr1", mode: "one" },
  { name: "marathi-menus-single-column", prefs: SETUPS["marathi-menus"], choice: "pr1", mode: "one" },
  // Folded on screen: the Vedic Chant section, the Aarti section and two pieces. All must still print.
  { name: "everything-folded", prefs: { ...SETUPS.marathi, pf: 1, xf: 1, af: ["a3", "a7"], tf: 1, fold: 1 }, choice: "pr1", mode: "one" },
  { name: "a4-kannada-single-column", prefs: SETUPS.kannada, choice: "pr1", mode: "one", paper: "A4", locale: "en-GB" },
];

for (const L of LAYOUTS)
  for (const fnt of FONTS)
    for (const P of PAPERS) {
      test(`${L.name} · ${fnt} font · ${P.paper} @chromium-only`, async ({ browser }) => {
        const r = await printOnce(browser, { prefs: { ...SETUPS[L.setup], fnt }, choice: L.choice, mode: L.mode, ...P });
        const summary = checkPrintout(r);
        expect(JSON.stringify(summary, null, 1)).toMatchSnapshot([SNAP_ENV, `${L.name}-${fnt}-${P.paper}.json`]);
      });
    }

// Landscape: every layout in every font, on Letter or A4 by turns, with the same checks.
for (const L of SIDEWAYS)
  FONTS.forEach((fnt, i) => {
    const P = PAPERS[i % 2];
    test(`sideways · ${L.name} · ${fnt} font · ${P.paper} @chromium-only`, async ({ browser }) => {
      const r = await printOnce(browser, { prefs: { ...SETUPS[L.setup], fnt, por: "land" }, choice: L.choice, mode: L.mode, ...P });
      expect(r.pdf.landscape, "the PDF pages are sideways").toBe(true);
      // the printout is set a little tighter sideways (data-land), so an aarti of three stanzas fits on one page
      const at = markerPages(r.pdf.pages);
      for (const id of ["a1", "a2", "a3"]) {
        const pages = new Set(
          Object.entries(at)
            .filter(([k]) => k.startsWith(id + ":"))
            .map(([, p]) => p),
        );
        expect([...pages], `${id} on one sideways page`).toHaveLength(1);
      }
      const summary = checkPrintout(r);
      expect(JSON.stringify(summary, null, 1)).toMatchSnapshot([SNAP_ENV, `sideways-${L.name}-${fnt}-${P.paper}.json`]);
    });
  });

// Sideways special cases: the dhrupad after every verse, and Kannada
for (const X of [
  { name: "sideways-dhrupad-every-verse-single", prefs: SETUPS["marathi-every-verse"], choice: "pr2", mode: "one" },
  { name: "sideways-dhrupad-every-verse-side", prefs: { ...SETUPS["marathi-every-verse"], lang: "both" }, choice: "pr2", mode: "side" },
  { name: "sideways-kannada-single-column", prefs: SETUPS.kannada, choice: "pr2", mode: "one" },
]) {
  test(`${X.name} @chromium-only`, async ({ browser }) => {
    const r = await printOnce(browser, { prefs: { ...X.prefs, por: "land" }, choice: X.choice, mode: X.mode, paper: "Letter", locale: "en-US" });
    expect(r.pdf.landscape).toBe(true);
    const summary = checkPrintout(r);
    expect(JSON.stringify(summary, null, 1)).toMatchSnapshot([SNAP_ENV, `${X.name}.json`]);
  });
}

for (const X of EXTRAS) {
  test(`${X.name} @chromium-only`, async ({ browser }) => {
    const paper = X.paper || "Letter";
    const r = await printOnce(browser, { prefs: X.prefs, choice: X.choice, mode: X.mode, paper, locale: X.locale || "en-US" });
    const summary = checkPrintout(r);
    expect(JSON.stringify(summary, null, 1)).toMatchSnapshot([SNAP_ENV, `${X.name}.json`]);
  });
}

// Printing from the browser's own menu (Ctrl/⌘ P, or Share → Print on a phone) doesn't go through
// the pop-up: the page builds the print view of every text in "beforeprint", whatever is ticked under What to print.
test("browser menu print gives every text @chromium-only", async ({ browser }) => {
  const context = await browser.newContext({ locale: "en-US", serviceWorkers: "block" });
  const page = await context.newPage();
  await openSite(page, { ...SETUPS.marathi, pskip: ["a2", "a3"] });
  // page.pdf() fires beforeprint exactly as the browser's Print menu does; the markers go in after
  // the site's own handler has built the print view
  await addMarkers(page, "beforeprint");
  const pdf = await pdfPages(page, "Letter");
  // afterprint (fired when page.pdf finished) puts the page back to normal
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-print"))).toBe(false);
  const at = markerPages(pdf.pages);
  const pieces = await page.evaluate(() => [...document.querySelectorAll("#pv .pvs")].map((s) => s.dataset.sid));
  expect(pieces).toHaveLength(11);
  for (const id of pieces) expect(at[id + ":0:s"], `${id} printed`).toBeGreaterThan(0);
  await context.close();
});

// ---- The print builder (as in Nitya Upasana): What, then How ----
// A phone shows one step at a time: What first, every text ticked, with how many in the bar; Next goes on to How,
// ‹ What to print comes back. What is ticked is what prints, with its own contents, and is remembered (P.pskip).
test("print builder: pick texts on a phone, then print just those @chromium-only", async ({ browser }) => {
  const context = await browser.newContext({ ...IPHONE, locale: "en-US", serviceWorkers: "block" });
  const page = await context.newPage();
  await stubPrint(page);
  await openSite(page, SETUPS.marathi);
  await page.locator("#prb").click();
  await expect(page.locator("#prwh")).toBeVisible();
  await expect(page.locator("#prhw")).toBeHidden();
  await expect(page.locator("#prgp")).toBeHidden();
  await expect(page.locator("#prnx")).toBeFocused();
  const boxes = page.locator("#prwl .tpkl input");
  await expect(boxes).toHaveCount(11);
  expect(await boxes.evaluateAll((l) => l.every((x) => x.checked))).toBe(true);
  await expect(page.locator("#prsum")).toContainText("11 texts");
  // the groups of the reading page, in its order
  await expect(page.locator("#prwl .prgr")).toHaveCount(2);
  expect(await page.locator("#prwl .prgr").evaluateAll((l) => l.map((x) => x.dataset.cat))).toEqual(["vedic-chant", "aarti"]);
  // Clear everything: nothing to print, so Next waits
  await page.locator('.prcb[data-cat=""]').click();
  await expect(page.locator("#prsum")).toContainText("Pick at least one text");
  await expect(page.locator("#prnx")).toBeDisabled();
  await expect(page.locator('.prcb[data-cat=""]')).toHaveText("Select all");
  // two texts, one found by search
  await page.locator(".prwq").fill("datta");
  await expect(page.locator("#prwl .tpkl li:visible")).toHaveCount(1);
  await page.locator("#prwl .tpkl li:visible input").check();
  await page.locator(".prwq").fill("");
  await page.locator('#prwl .tpkl li[data-id="p1"] input').check();
  await expect(page.locator("#prsum span").first()).toHaveText("2 texts");
  // Next, and back
  await page.locator("#prnx").click();
  await expect(page.locator("#prhw")).toBeVisible();
  await expect(page.locator("#prwh")).toBeHidden();
  await expect(page.locator("#prgp")).toBeFocused();
  await page.locator("#prbk").click();
  await expect(page.locator("#prwh")).toBeVisible();
  await expect(page.locator('#prwl .tpkl li[data-id="p1"] input')).toBeChecked();
  await page.locator("#prnx").click();
  await page.locator("#prgp").click();
  await page.waitForFunction(() => window.__printed > 0 || !document.getElementById("prgo").hidden, null, { timeout: 15_000 });
  if (await page.locator("#prgo").isVisible()) await page.locator("#prgo").click();
  await page.waitForFunction(() => window.__printed > 0, null, { timeout: 15_000 });
  await page.emulateMedia({ media: "print" });
  const pv = await readPrintView(page);
  expect(pv.pieces).toEqual(["p1", "a5"]);
  expect(pv.toc.map((x) => x.id)).toEqual(["p1", "a5"]);
  await addMarkers(page);
  const pdf = await pdfPages(page, "Letter");
  const at = markerPages(pdf.pages);
  expect(at["a5:0:s"]).toBeGreaterThan(at["p1:0:s"]);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("aarti2-prefs")).pskip.length)).toBe(9);
  await page.emulateMedia({ media: "screen" });
  // Safari laying the page out again after afterprint (its print sheet) still prints the two
  await page.evaluate(() => dispatchEvent(new Event("afterprint")));
  await page.evaluate(() => dispatchEvent(new Event("beforeprint")));
  expect(await page.evaluate(() => document.querySelectorAll("#pv .pvs").length)).toBe(2);
  // the browser's own menu, once the reader is back on the page, prints every text again
  await page.evaluate(() => dispatchEvent(new Event("afterprint")));
  await page.locator("body").dispatchEvent("pointerdown");
  await page.evaluate(() => dispatchEvent(new Event("beforeprint")));
  expect(await page.evaluate(() => document.querySelectorAll("#pv .pvs").length)).toBe(11);
  // and the builder keeps the two ticked
  await page.evaluate(() => dispatchEvent(new Event("afterprint")));
  await page.locator("#prb").click();
  await expect(page.locator("#prsum span").first()).toHaveText("2 texts");
  await context.close();
});

// Select all and Clear for one group leave the other as it is; one text on its own prints without a contents page.
// Wide screens show What and How side by side, with Print in reach at once.
test("print builder: a group's Select all and Clear, and one text alone @chromium-only", async ({ page }) => {
  await stubPrint(page);
  await openSite(page, SETUPS.english);
  await page.locator("#prb").click();
  await expect(page.locator("#prwh")).toBeVisible();
  await expect(page.locator("#prhw")).toBeVisible();
  await expect(page.locator("#prnx")).toBeHidden();
  await expect(page.locator("#prgp")).toBeFocused();
  const first = page.locator('#prwl .prgr[data-cat="vedic-chant"]'),
    second = page.locator('#prwl .prgr[data-cat="aarti"]');
  await first.locator(".prcb").click();
  expect(await first.locator("input").evaluateAll((l) => l.every((x) => !x.checked))).toBe(true);
  expect(await second.locator("input").evaluateAll((l) => l.every((x) => x.checked))).toBe(true);
  await expect(first.locator(".prcb")).toHaveText("Select all");
  await expect(page.locator('.prcb[data-cat=""]')).toHaveText("Select all");
  await first.locator(".prcb").click();
  await expect(first.locator(".prcb")).toHaveText("Clear");
  await expect(page.locator('.prcb[data-cat=""]')).toHaveText("Clear");
  // one text alone: its name in the bar, and it prints without contents
  await page.locator('.prcb[data-cat=""]').click();
  await page.locator('#prwl .tpkl li[data-id="a1"] input').check();
  await expect(page.locator("#prsum span").first()).toHaveText("सुखकर्ता दुःखहर्ता");
  await page.locator("#prgp").click();
  await page.waitForFunction(() => window.__printed > 0, null, { timeout: 15_000 });
  const pv = await page.evaluate(() => ({
    pieces: [...document.querySelectorAll("#pv .pvs")].map((s) => s.dataset.sid),
    toc: !!document.querySelector("#pv .pvcov"),
  }));
  expect(pv).toEqual({ pieces: ["a1"], toc: false });
});

// The words follow the menu language: Marathi menus, Marathi words and digits
test("print builder: Marathi menus @chromium-only", async ({ browser }) => {
  const context = await browser.newContext({ ...IPHONE, locale: "en-US", serviceWorkers: "block" });
  const page = await context.newPage();
  await stubPrint(page);
  await openSite(page, SETUPS["marathi-menus"]);
  await page.locator("#prb").click();
  await expect(page.locator(".prwq")).toHaveAttribute("placeholder", "रचना शोधा");
  await expect(page.locator('.prcb[data-cat=""]')).toHaveText("सर्व काढा");
  await expect(page.locator("#prsum span").first()).toHaveText(/^[०-९]+ रचना$/);
  await expect(page.locator("#prx")).toHaveAttribute("aria-label", "रद्द");
  await context.close();
});

// The printout's language, picked under How: for the printout only, the reading page keeps its own
test("print builder: the printout's language @chromium-only", async ({ browser }) => {
  const context = await browser.newContext({ ...IPHONE, locale: "en-US", serviceWorkers: "block" });
  const page = await context.newPage();
  await stubPrint(page);
  await openSite(page, SETUPS.marathi);
  await page.locator("#prb").click();
  await howStep(page);
  await expect(page.locator("#prlg button")).toHaveText(["Marathi", "English", "Both"]);
  await expect(page.locator("#prlg [aria-pressed=true]")).toHaveText("Marathi");
  await expect(page.locator("#prpg")).toBeVisible();
  await page.locator('#prlg [data-v="both"]').click();
  await expect(page.locator("#prpg")).toBeHidden();
  await expect(page.locator("#prpv")).toHaveText("Landscape, side by side");
  await page.locator('#prlg [data-v="en"]').click();
  await expect(page.locator("#prpg")).toBeVisible();
  await expect(page.locator("#prfn .prfx").first()).toHaveText("Sukhkarta");
  const prefs = await page.evaluate(() => JSON.parse(localStorage.getItem("aarti2-prefs")));
  expect([prefs.plang, prefs.lang]).toEqual(["en", "mr"]);
  // just one text, in English; the reading page stays in Marathi
  await page.locator("#prbk").click();
  await page.locator('.prcb[data-cat=""]').click();
  await page.locator('#prwl .tpkl li[data-id="a1"] input').check();
  await page.locator("#prnx").click();
  await page.locator("#prgp").click();
  await page.waitForFunction(() => window.__printed > 0 || !document.getElementById("prgo").hidden, null, { timeout: 15_000 });
  if (await page.locator("#prgo").isVisible()) await page.locator("#prgo").click();
  await page.waitForFunction(() => window.__printed > 0, null, { timeout: 15_000 });
  expect(await page.evaluate(() => document.getElementById("pv").getAttribute("data-lang"))).toBe("en");
  expect(await page.evaluate(() => /Sukhkarta/.test(document.getElementById("pv").textContent))).toBe(true);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("aarti2-prefs")).lang)).toBe("mr");
  await context.close();
});

// The preview under How: the first page of the first text ticked, made small; it follows the ticks. The paper: Letter
// in the US (this locale), A4 a tap away; the choice is kept and the printout asks the browser for that paper
test("print builder: the preview and the paper @chromium-only", async ({ browser }) => {
  const context = await browser.newContext({ ...IPHONE, locale: "en-US", serviceWorkers: "block" });
  const page = await context.newPage();
  await stubPrint(page);
  await openSite(page, SETUPS.english);
  await page.locator("#prb").click();
  await howStep(page);
  await expect(page.locator("#prsheet")).toHaveAttribute("aria-label", "Preview of the first page");
  const title = () => page.frameLocator("#prsheet iframe").locator("#pv .pvs h2").first();
  await expect(title()).toContainText("Ganapati Atharvashirsha", { timeout: 20_000 });
  // the first text only
  expect(await page.frameLocator("#prsheet iframe").locator("#pv .pvs").count()).toBe(1);
  await expect(page.locator(".prpaper").first()).toHaveText("Letter");
  await expect(page.locator("#prpa")).toHaveText("Use A4");
  // Letter is taller for its width than A4
  const ratio = () => page.locator("#prsheet").evaluate((e) => e.offsetHeight / e.offsetWidth);
  expect(await ratio()).toBeCloseTo(279.4 / 215.9, 1);
  await page.locator("#prpa").click();
  await expect(page.locator(".prpaper").first()).toHaveText("A4");
  await expect(page.locator("#prpa")).toHaveText("Use Letter");
  expect(await ratio()).toBeCloseTo(297 / 210, 1);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("aarti2-prefs")).ppr)).toBe("a4");
  // one aarti ticked: the preview shows it
  await page.locator("#prbk").click();
  await page.locator('.prcb[data-cat=""]').click();
  await page.locator('#prwl .tpkl li[data-id="a1"] input').check();
  await page.locator("#prnx").click();
  await expect(title()).toContainText("Sukhkarta Dukhharta", { timeout: 20_000 });
  await page.locator("#prgp").click();
  await page.waitForFunction(() => window.__printed > 0 || !document.getElementById("prgo").hidden, null, { timeout: 15_000 });
  const rules = await page.evaluate(() => [...document.querySelectorAll("style[media=print]")].map((s) => s.textContent).join(" "));
  expect(rules).toContain("@page { size: A4 portrait }");
  await context.close();
});

// The iPhone Home Screen app hands the printout to Safari: the link carries the texts ticked, and Safari prints those
test("print builder: Open in Safari carries the texts ticked @chromium-only", async ({ browser }) => {
  const context = await browser.newContext({ ...IPHONE, locale: "en-US", serviceWorkers: "block" });
  const page = await context.newPage();
  await page.addInitScript(() => {
    if (!location.search) Object.defineProperty(navigator, "standalone", { value: true });
    window.__printed = 0;
    window.print = () => window.__printed++;
  });
  await openSite(page, SETUPS.english);
  await page.locator("#prb").click();
  await page.locator('.prcb[data-cat=""]').click();
  await page.locator('#prwl .tpkl li[data-id="a3"] input').check();
  await howStep(page);
  await page.locator("#prgp").click();
  await expect(page.locator("#prsf")).toBeVisible();
  await page
    .locator("#prsf")
    .click()
    .catch(() => {});
  const to = await page.locator("#prsf").getAttribute("data-to");
  const s = JSON.parse(decodeURIComponent(/&s=([^&]*)/.exec(to)[1]));
  expect(s.pskip).toHaveLength(10);
  expect(s.pskip).not.toContain("a3");
  // Safari, opened at that address, prints just that text
  const sf = await browser.newContext({ ...IPHONE, locale: "en-US", serviceWorkers: "block" });
  const sp = await sf.newPage();
  await sp.addInitScript(() => {
    window.__printed = 0;
    window.print = () => {
      window.__printed++;
      dispatchEvent(new Event("beforeprint"));
    };
  });
  await sp.goto(to.replace(/^x-safari-/, ""));
  await sp.waitForFunction(() => window.__printed > 0 || !document.getElementById("prgo").hidden, null, { timeout: 20_000 });
  if (await sp.locator("#prgo").isVisible()) await sp.locator("#prgo").click();
  await sp.waitForFunction(() => window.__printed > 0, null, { timeout: 15_000 });
  expect(await sp.evaluate(() => [...document.querySelectorAll("#pv .pvs")].map((x) => x.dataset.sid))).toEqual(["a3"]);
  await sf.close();
  await context.close();
});

// The Print pop-up itself: the right choices for each language, the paper named, Escape and Cancel close it.
test("print pop-up offers the right choices and closes cleanly @chromium-only", async ({ page }) => {
  await stubPrint(page);
  await openSite(page, SETUPS.both);
  await page.locator("#prb").click();
  await howStep(page);
  await expect(page.locator("#prpg")).toBeHidden();
  await expect(page.locator("#prpv")).toHaveText("Landscape, side by side");
  await expect(page.locator(".prpaper").first()).toHaveText("Letter");
  await expect(page.locator("#prgp")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#prm")).toBeHidden();
  await expect(page.locator("#prb")).toBeFocused();
  await page.locator("#prb").click();
  await howStep(page);
  await page.locator("#prx").click();
  await expect(page.locator("#prm")).toBeHidden();
  expect(await page.evaluate(() => window.__printed)).toBe(0);
});

// iPhone: Safari opens the print dialog only in answer to a tap, and laying the print view out takes longer
// than a tap counts for, so window.print() is quietly ignored (no beforeprint). The pop-up then offers
// Print now, whose own tap prints.
test("iPhone: an ignored print offers Print now @chromium-only", async ({ browser }) => {
  const context = await browser.newContext({ ...IPHONE, locale: "en-US", serviceWorkers: "block" });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__printed = 0;
    // the first call is ignored, as iOS does once the tap has expired; a later one opens the dialog
    window.print = () => {
      if (window.__printed++) dispatchEvent(new Event("beforeprint"));
    };
  });
  await openSite(page, SETUPS.english);
  await page.locator("#prb").click();
  await howStep(page);
  await page.locator("#pr1").click();
  await page.locator("#prgp").click();
  await expect(page.locator("#prgo")).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("#pr1")).toBeHidden();
  await expect(page.locator("#prgo")).toBeFocused();
  await page.locator("#prgo").click();
  expect(await page.evaluate(() => window.__printed)).toBe(2);
  await page.waitForTimeout(1300);
  await expect(page.locator("#prm")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.getAttribute("data-print"))).toBe("one");
  // the next Print shows the layout choices again
  await page.evaluate(() => dispatchEvent(new Event("afterprint")));
  await page.locator("#prb").click();
  await howStep(page);
  await expect(page.locator("#pr1")).toBeVisible();
  await expect(page.locator("#prgo")).toBeHidden();
  await expect(page.locator("#prw")).toBeHidden();
  await context.close();
});

// When Print now does not open the dialog either (an app's own browser, from a link in a chat app), the pop-up
// says to use Share → Print, or to open the page in Safari
test("iPhone: when Print now does not print either, Share → Print and Open in Safari are offered @chromium-only", async ({ browser }) => {
  const context = await browser.newContext({ ...IPHONE, locale: "en-US", serviceWorkers: "block" });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__printed = 0;
    window.print = () => window.__printed++;
  });
  await openSite(page, SETUPS.english);
  await page.locator("#prb").click();
  await howStep(page);
  await page.locator("#pr1").click();
  await page.locator("#prgp").click();
  await expect(page.locator("#prgo")).toBeVisible({ timeout: 15_000 });
  await page.locator("#prgo").click();
  await expect(page.locator("#prv")).toBeVisible({ timeout: 5_000 });
  await expect(page.locator("#prv")).toContainText("Share");
  await expect(page.locator("#prsf")).toBeVisible();
  await expect(page.locator("#prcp")).toBeVisible();
  await expect(page.locator("#prw")).toBeHidden();
  await expect(page.locator("#prgo")).toBeHidden();
  expect(await page.evaluate(() => window.__printed)).toBe(2);
  // the next Print shows the layout choices again
  await page.locator("#prx").click();
  await page.locator("#prb").click();
  await howStep(page);
  await expect(page.locator("#pr1")).toBeVisible();
  await expect(page.locator("#prv")).toBeHidden();
  await context.close();
});

// The iPhone Home Screen app cannot print (neither tap opens the dialog there): choosing a layout goes straight
// to Open in Safari, without trying to print
test("iPhone Home Screen app: a layout choice goes straight to Open in Safari @chromium-only", async ({ browser }) => {
  const context = await browser.newContext({ ...IPHONE, locale: "en-US", serviceWorkers: "block" });
  const page = await context.newPage();
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "standalone", { value: true });
    window.__printed = 0;
    window.print = () => window.__printed++;
  });
  await openSite(page, SETUPS.english);
  await page.locator("#prb").click();
  await howStep(page);
  await page.locator("#pr1").click();
  await page.locator("#prgp").click();
  await expect(page.locator("#prsf")).toBeVisible();
  await expect(page.locator("#prsf")).toBeFocused();
  await expect(page.locator("#prcp")).toBeVisible();
  await expect(page.locator("#prw")).toBeVisible();
  await expect(page.locator("#prgo")).toBeHidden();
  expect(await page.evaluate(() => window.__printed)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-print"))).toBe(false);
  await page.locator("#prx").click();
  await expect(page.locator("#prm")).toBeHidden();
  await page.locator("#prb").click();
  await howStep(page);
  await expect(page.locator("#pr1")).toBeVisible();
  await expect(page.locator("#prw")).toBeHidden();
  await context.close();
});

// Laid out ahead: once the page has been open a few seconds, the single-column printout is ready, so on an
// iPhone the Print button prints on its first tap (no Print now), while the tap still counts
test("iPhone: a printout laid out ahead prints on the first tap @chromium-only", async ({ browser }) => {
  const context = await browser.newContext({ ...IPHONE, locale: "en-US", serviceWorkers: "block" });
  const page = await context.newPage();
  await page.addInitScript(() => {
    window.__printed = 0;
    window.print = () => {
      window.__printed++;
      dispatchEvent(new Event("beforeprint"));
    };
  });
  await openSite(page, SETUPS.english);
  await page.waitForTimeout(9000);
  await page.locator("#prb").click();
  await howStep(page);
  await page.locator("#pr1").click();
  await page.locator("#prgp").click();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__printed)).toBe(1);
  await expect(page.locator("#prgo")).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.getAttribute("data-print"))).toBe("one");
  await context.close();
});

// The Home Screen app's Open in Safari: Safari, opened at that
// address, takes the print choices, cleans the address and lays the printout out, ready to print
test("iPhone Home Screen app: Open in Safari carries the print choices @chromium-only", async ({ browser }) => {
  const context = await browser.newContext({ ...IPHONE, locale: "en-US", serviceWorkers: "block" });
  const page = await context.newPage();
  await page.addInitScript(() => {
    if (!location.search) Object.defineProperty(navigator, "standalone", { value: true });
    window.__printed = 0;
    window.print = () => {
      if (window.__printed++ && !navigator.standalone) dispatchEvent(new Event("beforeprint"));
    };
  });
  await openSite(page, SETUPS.english);
  await page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem("aarti2-prefs"));
    p.ref = 0;
    p.por = "land";
    localStorage.setItem("aarti2-prefs", JSON.stringify(p));
  });
  await page.reload();
  await page.locator("#prb").click();
  await howStep(page);
  await page.locator("#pr2").click();
  await page.locator("#prgp").click();
  await expect(page.locator("#prsf")).toBeVisible();
  expect(await page.evaluate(() => window.__printed)).toBe(0);
  // the address Open in Safari goes to (Chromium has no x-safari-https, so the page stays)
  await page.locator("#prsf").click();
  const href = await page.locator("#prsf").getAttribute("data-to");
  expect(href).toMatch(/^x-safari-http.*\?print=as&s=/);
  const url = href.replace(/^x-safari-/, "");
  // Safari: a fresh browser with its own storage
  const sf = await browser.newContext({ ...IPHONE, locale: "en-US", serviceWorkers: "block" });
  const sp = await sf.newPage();
  await sp.addInitScript(() => {
    window.__printed = 0;
    window.print = () => {
      if (window.__printed++) dispatchEvent(new Event("beforeprint"));
    };
  });
  await sp.goto(url);
  await expect(sp.locator("#prgo")).toBeVisible({ timeout: 15_000 });
  expect(await sp.evaluate(() => location.search)).toBe("");
  const prefs = await sp.evaluate(() => JSON.parse(localStorage.getItem("aarti2-prefs")));
  expect([prefs.lang, prefs.ref, prefs.por]).toEqual(["en", 0, "land"]);
  await sp.locator("#prgo").click();
  await sp.waitForTimeout(1300);
  expect(await sp.evaluate(() => document.documentElement.getAttribute("data-print"))).toBe("one");
  // English
  expect(await sp.evaluate(() => /Sukhkarta/.test(document.getElementById("pv").textContent))).toBe(true);
  await sf.close();
  await context.close();
});

// What the pop-up offers (CHOICE in js/features/print.js): one language, Portrait or Landscape on one line,
// Portrait until the reader has chosen a page, and the font tiles' word in that language; both languages, Landscape (side
// by side) only, the language row with the main language first. The focus is on Print.
for (const [setup, words] of [
  ["marathi", "सुखकर्ता दुःखहर्ता"],
  ["english", "Sukhkarta Dukhharta"],
  ["kannada", "ಸುಖಕರ್ತಾ"],
  ["telugu", "సుఖకర్తా"],
  ["gujarati", "સુખકર્તા"],
]) {
  test(`print pop-up offers Portrait and Landscape: ${setup} @chromium-only`, async ({ page }) => {
    await stubPrint(page);
    await openSite(page, SETUPS[setup]);
    await page.locator("#prb").click();
    await howStep(page);
    await expect(page.locator("#pr1")).toHaveText("Portrait");
    await expect(page.locator("#pr2")).toHaveText("Landscape");
    await expect(page.locator("#pr1")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#prpv")).toBeHidden();
    // each font's tile (the three of Settings → Text font) shows the text's first word in that font, in the language printed
    await expect(page.locator("#prfn .prfx")).toHaveText(Array(3).fill(words.split(" ")[0]));
    await expect(page.locator("#prgp")).toBeFocused();
  });
}
for (const [setup, a] of [
  ["both", "सुखकर्ता"],
  ["kannada-both", "ಸುಖಕರ್ತಾ"],
  ["english-main-both", "Sukhkarta"],
]) {
  test(`print pop-up offers only Landscape side by side: ${setup} @chromium-only`, async ({ page }) => {
    await stubPrint(page);
    await openSite(page, { ...SETUPS[setup], por: "up" });
    await page.locator("#prb").click();
    await howStep(page);
    await expect(page.locator("#prpg")).toBeHidden();
    await expect(page.locator("#prpv")).toHaveText("Landscape, side by side");
    // the language row: the main language first, then the other, then Both (chosen); the tiles show the main language
    await expect(page.locator("#prlg [aria-pressed=true]")).toHaveAttribute("data-v", "both");
    expect(await page.locator("#prlg button").evaluateAll((l) => l.map((x) => x.dataset.v))).toEqual(
      setup === "english-main-both" ? ["en", "mr", "both"] : ["mr", "en", "both"],
    );
    await expect(page.locator("#prfn .prfx").first()).toHaveText(a);
    await expect(page.locator("#prgp")).toBeFocused();
  });
}

// The browser's own menu (Ctrl/⌘ P) prints what the pop-up offers: both languages side by side, sideways
test("printing from the browser's menu: both languages print side by side @chromium-only", async ({ page }) => {
  await stubPrint(page);
  await openSite(page, SETUPS.both);
  await page.evaluate(() => dispatchEvent(new Event("beforeprint")));
  expect(await page.evaluate(() => document.documentElement.getAttribute("data-print"))).toBe("side");
  expect(await page.evaluate(() => [...document.querySelectorAll("style[media=print]")].some((e) => /size: landscape/.test(e.textContent)))).toBe(true);
});

// Each choice prints on its page: Portrait upright, Landscape sideways
for (const [setup, choice, mode, landscape] of [
  ["both", "pr2", "side", true],
  ["marathi", "pr1", "one", false],
  ["marathi", "pr2", "one", true],
]) {
  test(`each choice prints on its own page: ${setup} ${choice} @chromium-only`, async ({ browser }) => {
    const r = await printOnce(browser, { prefs: { ...SETUPS[setup], por: "" }, choice, mode, paper: "Letter", locale: "en-US" });
    expect(r.pdf.landscape).toBe(landscape);
    checkPrintout(r);
  });
}

// The page chosen is remembered (shown chosen next time), the printer is told the page size, and Safari,
// which keeps the sheet picked in its own dialog, is told, once Landscape is chosen, to pick it there too (and, on a
// Mac, that Chrome prints it best; Firefox is told that too: it prints no page numbers)
test("print pop-up: the page chosen is remembered and printed that way @chromium-only", async ({ browser }) => {
  for (const ua of [undefined, devices["Desktop Safari"].userAgent]) {
    const context = await browser.newContext({ locale: "en-US", serviceWorkers: "block", userAgent: ua });
    const page = await context.newPage();
    await stubPrint(page);
    await openSite(page, SETUPS.marathi);
    await page.locator("#prb").click();
    await howStep(page);
    await expect(page.locator("#prl")).toBeHidden();
    await expect(page.locator("#prc")).toBeVisible({ visible: !!ua });
    await expect(page.locator("#prs")).toBeVisible({ visible: !!ua });
    if (ua) {
      // Firefox: the same note, and nothing about Safari's dialog
      const ff = await browser.newContext({ locale: "en-US", serviceWorkers: "block", userAgent: devices["Desktop Firefox"].userAgent });
      const fp = await ff.newPage();
      await stubPrint(fp);
      await openSite(fp, SETUPS.marathi);
      await fp.locator("#prb").click();
      await howStep(fp);
      await expect(fp.locator("#prc")).toBeVisible();
      for (const id of ["#prl", "#prz", "#prs"]) await expect(fp.locator(id)).toBeHidden();
      await ff.close();
    }
    const sizes = () =>
      page.evaluate(() => {
        const all = (rules) => [...rules].flatMap((r) => (r.cssRules && r.type !== 6 ? all(r.cssRules) : [r]));
        return [...document.styleSheets]
          .flatMap((s) => all(s.cssRules))
          .filter((r) => r.type === 6 && r.style.size)
          .map((r) => r.style.size);
      });
    await page.locator("#pr2").click();
    await expect(page.locator("#prl")).toBeVisible({ visible: !!ua });
    await page.locator("#prgp").click();
    await page.waitForFunction(() => window.__printed > 0 || !document.getElementById("prgo").hidden, null, { timeout: 15_000 });
    expect((await sizes()).pop()).toBe("landscape");
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("aarti2-prefs")).por)).toBe("land");
    await page.evaluate(() => dispatchEvent(new Event("afterprint")));
    await page.locator("#prb").click();
    await howStep(page);
    await expect(page.locator("#pr2")).toHaveAttribute("aria-pressed", "true");
    await context.close();
  }
});

// How to print best (the print audit, 2026-10-30): Once and Portrait take the fewest pages, so they carry a star (as does
// the book-style font, Traditional / Classic) and are
// described as recommended), and the hint under each row says what the choice made gives; a choice that takes more
// pages says about how many more. The bottom bar says about how many pages, counted as Chrome breaks them: here, the
// printout has exactly that many
test("print pop-up: the recommended choices, the hints and about how many pages @chromium-only", async ({ page }) => {
  await stubPrint(page);
  await openSite(page, { ...SETUPS.marathi, por: "up", pref: 1, ppr: "letter" });
  await page.locator("#prb").click();
  await howStep(page);
  for (const b of [page.locator('#prdg [data-v="1"]'), page.locator("#pr1"), page.locator('#prfn [data-v="classic"]')]) {
    await expect(b.locator(".prbest")).toHaveCount(1);
    await expect(b).toHaveAccessibleDescription("Recommended");
  }
  await expect(page.locator('#prdg [data-v="0"] .prbest, #pr2 .prbest')).toHaveCount(0);
  await expect(page.locator("#prdhh")).toHaveText(/^Fewest pages/);
  await expect(page.locator("#prpgh")).toHaveText(/^Best for one language/);
  await expect(page.locator("#prdhh .prbest, #prpgh .prbest")).toHaveCount(2);
  const about = page.locator("#prsum b");
  await expect(about).toHaveText(/^about \d+ pages$/);
  const once = Number((await about.textContent()).replace(/\D/g, ""));
  // Every verse: no star in the hint, and how many pages more than Once
  await page.locator('#prdg [data-v="0"]').click();
  await expect(page.locator("#prdhh")).toHaveText(/^As sung: about \d+ pages? more than Once\.$/);
  await expect(page.locator("#prdhh .prbest")).toHaveCount(0);
  await expect(about).not.toHaveText(`about ${once} pages`);
  // Landscape: how many more than Portrait
  await page.locator('#prdg [data-v="1"]').click();
  await page.locator("#pr2").click();
  await expect(page.locator("#prpgh")).toHaveText(/^Larger lines: about \d+ pages? more\.$/);
  // both languages: side by side, and why
  await page.locator('#prlg [data-v="both"]').click();
  await expect(page.locator("#prpgh")).toHaveText(/^Each line beside its English, rows in step\.$/);
  await expect(page.locator("#prpgh .prbest")).toHaveCount(1);
  // the count is the printout's: back to one language upright, then printed
  await page.locator('#prlg [data-v="mr"]').click();
  await page.locator("#pr1").click();
  await expect(about).toHaveText(`about ${once} pages`);
  await page.locator("#prgp").click();
  await page.waitForFunction(() => window.__printed > 0);
  await page.emulateMedia({ media: "print" });
  expect((await pdfPages(page, "Letter")).pages.length).toBe(once);
});

// A saved page is kept from one visit to the next
test("print pop-up: a saved Landscape choice is kept @chromium-only", async ({ page }) => {
  await stubPrint(page);
  await openSite(page, SETUPS.marathi);
  await page.evaluate(() => {
    const p = JSON.parse(localStorage.getItem("aarti2-prefs"));
    p.por = "land";
    localStorage.setItem("aarti2-prefs", JSON.stringify(p));
  });
  await page.reload();
  await page.locator("#prb").click();
  await howStep(page);
  await expect(page.locator("#pr2")).toHaveAttribute("aria-pressed", "true");
});

// A card taller than the screen (a phone on its side, in the iPhone's Open in Safari state) starts at the top and
// the pop-up scrolls to Cancel, rather than running off both edges
test("print pop-up scrolls when taller than the screen @chromium-only", async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  await stubPrint(page);
  await openSite(page, SETUPS.marathi);
  await page.locator("#prb").click();
  await howStep(page);
  await page.evaluate(() => ["prw", "prsf", "prcp"].forEach((i) => (document.getElementById(i).hidden = false)));
  expect(await page.locator("#prm .qrc").evaluate((e) => e.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
  await page.locator("#prx").scrollIntoViewIfNeeded();
  await expect(page.locator("#prx")).toBeInViewport();
});

// Above the choices: the printout's dhrupad and font (a tap picks another, for the printout only: the reading
// page keeps its own), with a line of the text in it, centred for one language
test("print pop-up shows the dhrupad and font settings @chromium-only", async ({ page }) => {
  await stubPrint(page);
  await openSite(page, { ...SETUPS.marathi, fnt: "classic" });
  await page.locator("#prb").click();
  await howStep(page);
  await expect(page.locator("#prdg [aria-pressed=true]")).toHaveText("Once", { useInnerText: true });
  // the same three fonts as Settings, in the same order, each a tile with the text's first word in that font; the
  // printout's starts as the text font (Classic here)
  await expect(page.locator("#prfn .prfm")).toHaveText(["Standard", "Classic", "Handwritten"], { useInnerText: true });
  await expect(page.locator("#prfn [aria-pressed=true] .prfm")).toHaveText("Classic", { useInnerText: true });
  await expect(page.locator('#prfn [data-v="classic"] .prfx')).toHaveText("सुखकर्ता");
  const font = (v) => page.locator(`#prfn [data-v="${v}"] .prfx`).evaluate((e) => getComputedStyle(e).fontFamily);
  expect(await font("classic")).toContain("SC Classic");
  expect(await font("hand")).toContain("SC Hand");
  expect(await font("std")).not.toContain("SC ");
  // a font picked here is the printout's only: the reading page keeps its own,
  // and the page takes it just while it prints
  await page.locator('#prfn [data-v="hand"]').click();
  await expect(page.locator("#prfn [aria-pressed=true] .prfm")).toHaveText("Handwritten", { useInnerText: true });
  const prefs = await page.evaluate(() => JSON.parse(localStorage.getItem("aarti2-prefs")));
  expect([prefs.pfn, prefs.fnt]).toEqual(["hand", "classic"]);
  expect(await page.evaluate(() => document.documentElement.getAttribute("data-font"))).toBe("classic");
  expect(
    await page.evaluate(() => {
      window.dispatchEvent(new Event("beforeprint"));
      const f = document.documentElement.getAttribute("data-font");
      window.dispatchEvent(new Event("afterprint"));
      return [f, document.documentElement.getAttribute("data-font")];
    }),
  ).toEqual(["hand", "classic"]);
  // the dhrupad likewise: every verse in the printout, once on the reading page
  await page.locator('#prdg [data-v="0"]').click();
  await expect(page.locator("#prdg [aria-pressed=true]")).toHaveText("Every verse", { useInnerText: true });
  const p2 = await page.evaluate(() => JSON.parse(localStorage.getItem("aarti2-prefs")));
  expect([p2.pref, p2.ref]).toEqual([0, 1]);
  expect(
    await page.evaluate(() => {
      const r = () => document.documentElement.getAttribute("data-ref");
      const was = r();
      window.dispatchEvent(new Event("beforeprint"));
      const f = r();
      window.dispatchEvent(new Event("afterprint"));
      return [was, f, r()];
    }),
  ).toEqual(["1", "0", "1"]);
  await expect(page.locator("#prm")).toBeVisible();
});

// The builder's language buttons in the order Settings has them: English first when English is the main language,
// even with English alone shown (the order came from both being shown before; Satish, 2026-10-30)
test("print builder: English as the main language lists English first @chromium-only", async ({ browser }) => {
  const context = await browser.newContext({ ...IPHONE, locale: "en-US", serviceWorkers: "block" });
  const page = await context.newPage();
  await openSite(page, { lang: "en", lead: "en", l2: "mr" });
  if (!(await page.locator("#prb").isVisible())) await page.locator("#slim").click();
  await page.locator("#prb").click();
  await page.locator("#prm").waitFor({ state: "visible" });
  await howStep(page);
  await expect(page.locator("#prlg button")).toHaveText(["English", "Marathi", "Both"]);
  await expect(page.locator("#prlg [aria-pressed=true]")).toHaveText("English");
  await context.close();
});
