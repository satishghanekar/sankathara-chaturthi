// Print and PDF: the most thorough suite, because the printout is what the group hands round.
//
// For every combination of layout × text font × paper size (and a set of special cases) it checks:
//   - the contents page lists the page each piece really starts on in the PDF
//   - every unbroken block (heading with its dhrupad and first stanza, each stanza) sits on one page
//   - every piece is printed, even when it or its section is folded on screen
//   - the screen-only controls (Open all, settings, etc.) never print
//   - in layouts with English, every English line of the print view is in the PDF
//   - the page count and contents numbers match the recorded baseline
//   - no line is lost, side by side rows stay in step and lines break mid-phrase only rarely (see the print audit)
// PDFs can only be made by Chromium, so this suite is Chromium-only.
import { test, expect, devices } from "@playwright/test";
import { openSite, SETUPS, SNAP_ENV } from "./helpers.mjs";
import { pdfMarks, auditLines } from "./print-audit-helpers.mjs";
import { printOnce, checkPrintout, stubPrint, printFromButton, readPrintView, addMarkers, pdfPages, markerPages, toInt } from "./print-helpers.mjs";

test.describe.configure({ mode: "parallel" });

// Layouts as the Print pop-up offers them: Marathi or English alone get Two columns (pr1) and Single
// column (pr2); Both gets Side by side (pr1) and Stacked (pr2).
const LAYOUTS = [
  { name: "marathi-two-columns", setup: "marathi", choice: "pr1", mode: "two" },
  { name: "marathi-single-column", setup: "marathi", choice: "pr2", mode: "one" },
  { name: "english-two-columns", setup: "english", choice: "pr1", mode: "two" },
  { name: "english-single-column", setup: "english", choice: "pr2", mode: "one" },
  { name: "both-side-by-side", setup: "both", choice: "pr1", mode: "side" },
  { name: "both-stacked", setup: "both", choice: "pr2", mode: "one" },
  { name: "kannada-side-by-side", setup: "kannada-both", choice: "pr1", mode: "side" },
];
// iPhone 13 emulation in Chromium (the device entry names WebKit as its browser, which newContext does not take)
const { defaultBrowserType: _bt, ...IPHONE } = devices["iPhone 13"];
const FONTS = ["std", "classic", "bold", "hand"];
// Letter is chosen for US / Canada / Mexico / Philippines, A4 everywhere else (see LTR in js/features/print.js)
const PAPERS = [
  { paper: "Letter", locale: "en-US" },
  { paper: "A4", locale: "en-IN" },
];

// Special cases beyond the main grid (standard font, Letter unless stated)
const EXTRAS = [
  { name: "iast-english-two-columns", prefs: SETUPS["english-iast"], choice: "pr1", mode: "two" },
  { name: "iast-both-side-by-side", prefs: SETUPS["both-iast"], choice: "pr1", mode: "side" },
  { name: "english-main-side-by-side", prefs: SETUPS["english-main-both"], choice: "pr1", mode: "side" },
  { name: "english-main-stacked", prefs: SETUPS["english-main-both"], choice: "pr2", mode: "one" },
  { name: "kannada-two-columns", prefs: SETUPS.kannada, choice: "pr1", mode: "two" },
  { name: "kannada-single-column", prefs: SETUPS.kannada, choice: "pr2", mode: "one" },
  { name: "dhrupad-every-verse-single", prefs: SETUPS["marathi-every-verse"], choice: "pr2", mode: "one" },
  { name: "dhrupad-every-verse-two", prefs: SETUPS["marathi-every-verse"], choice: "pr1", mode: "two" },
  { name: "marathi-menus-two-columns", prefs: SETUPS["marathi-menus"], choice: "pr1", mode: "two" },
  // Folded on screen: the Pooja section, the Aarti section and two pieces. All must still print.
  { name: "everything-folded", prefs: { ...SETUPS.marathi, pf: 1, xf: 1, af: ["a3", "a7"], tf: 1, fold: 1 }, choice: "pr2", mode: "one" },
  { name: "a4-kannada-two-columns", prefs: SETUPS.kannada, choice: "pr1", mode: "two", paper: "A4", locale: "en-GB" },
];

for (const L of LAYOUTS)
  for (const fnt of FONTS)
    for (const P of PAPERS) {
      test(`${L.name} · ${fnt} font · ${P.paper} @chromium-only`, async ({ browser }) => {
        const r = await printOnce(browser, { prefs: { ...SETUPS[L.setup], fnt }, choice: L.choice, mode: L.mode, ...P, lines: true });
        const summary = checkPrintout(r, P.paper);
        expect(JSON.stringify(summary, null, 1)).toMatchSnapshot([SNAP_ENV, `${L.name}-${fnt}-${P.paper}.json`]);
        // the lines themselves (js/print/fit.js): nothing lost, side by side in step, lines broken mid-phrase only
        // where a line is too long even at its smallest (npm run print:audit shows every case)
        const a = auditLines(r.marked, await pdfMarks(r.pdf.buf));
        // a failure names the lines, so it can be understood from the log alone (CI keeps no PDFs)
        const which = (kind) => kind + ": " + a.findings.filter((f) => f.kind.startsWith(kind)).slice(0, 12).map((f) => `\n  ${f.sid} ${f.lines || ""} ${f.text}`).join("");
        expect(a.missing, which("text missing")).toBe(0);
        expect(a.outOfStep, which("side by side out of step")).toBeLessThanOrEqual(6);
        expect(a.brokeMidPhrase, which("line broken mid-phrase")).toBeLessThanOrEqual(12);
      });
    }

// Sideways (landscape, chosen in the Print pop-up): every layout in every font, on Letter or A4 by turns, with
// the same checks. The text is fitted to the wider line and the pages planned for the shorter page.
for (const L of LAYOUTS)
  FONTS.forEach((fnt, i) => {
    const P = PAPERS[i % 2];
    test(`sideways · ${L.name} · ${fnt} font · ${P.paper} @chromium-only`, async ({ browser }) => {
      const r = await printOnce(browser, { prefs: { ...SETUPS[L.setup], fnt, por: "land" }, choice: L.choice, mode: L.mode, ...P, lines: true });
      expect(r.pdf.landscape, "the PDF pages are sideways").toBe(true);
      const summary = checkPrintout(r, P.paper);
      expect(JSON.stringify(summary, null, 1)).toMatchSnapshot([SNAP_ENV, `sideways-${L.name}-${fnt}-${P.paper}.json`]);
      const a = auditLines(r.marked, await pdfMarks(r.pdf.buf));
      const which = (kind) => kind + ": " + a.findings.filter((f) => f.kind.startsWith(kind)).slice(0, 12).map((f) => `\n  ${f.sid} ${f.lines || ""} ${f.text}`).join("");
      expect(a.missing, which("text missing")).toBe(0);
      expect(a.outOfStep, which("side by side out of step")).toBeLessThanOrEqual(6);
      expect(a.brokeMidPhrase, which("line broken mid-phrase")).toBeLessThanOrEqual(12);
    });
  });

// Sideways special cases: the dhrupad after every verse, Kannada, and Safari's table layout
for (const X of [
  { name: "sideways-dhrupad-every-verse-two", prefs: SETUPS["marathi-every-verse"], choice: "pr1", mode: "two" },
  { name: "sideways-dhrupad-every-verse-side", prefs: { ...SETUPS["marathi-every-verse"], lang: "both" }, choice: "pr1", mode: "side" },
  { name: "sideways-kannada-two-columns", prefs: SETUPS.kannada, choice: "pr1", mode: "two" },
  { name: "sideways-kannada-single-column", prefs: SETUPS.kannada, choice: "pr2", mode: "one" },
]) {
  test(`${X.name} @chromium-only`, async ({ browser }) => {
    const r = await printOnce(browser, { prefs: { ...X.prefs, por: "land" }, choice: X.choice, mode: X.mode, paper: "Letter", locale: "en-US" });
    expect(r.pdf.landscape).toBe(true);
    const summary = checkPrintout(r, "Letter");
    expect(JSON.stringify(summary, null, 1)).toMatchSnapshot([SNAP_ENV, `${X.name}.json`]);
  });
}

for (const X of EXTRAS) {
  test(`${X.name} @chromium-only`, async ({ browser }) => {
    const paper = X.paper || "Letter";
    const r = await printOnce(browser, { prefs: X.prefs, choice: X.choice, mode: X.mode, paper, locale: X.locale || "en-US" });
    const summary = checkPrintout(r, paper);
    expect(JSON.stringify(summary, null, 1)).toMatchSnapshot([SNAP_ENV, `${X.name}.json`]);
  });
}

// Printing from the browser's own menu (Ctrl/⌘ P, or Share → Print on a phone) doesn't go through
// the pop-up: the page builds the single-column print view in "beforeprint".
test("browser menu print gives the single-column print view @chromium-only", async ({ browser }) => {
  const context = await browser.newContext({ locale: "en-US", serviceWorkers: "block" });
  const page = await context.newPage();
  await openSite(page, SETUPS.marathi);
  // the contents numbers for the menu print are worked out in the background ~3 s after load
  await page.waitForTimeout(4000);
  // page.pdf() fires beforeprint exactly as the browser's Print menu does; the markers go in after
  // the site's own handler has built the print view
  await addMarkers(page, "beforeprint");
  const pdf = await pdfPages(page, "Letter");
  await page.emulateMedia({ media: "print" });
  const pv = await readPrintView(page);
  expect(pv.pieces).toHaveLength(11);
  expect(pv.toc.every((t) => t.page)).toBe(true);
  const at = markerPages(pdf.pages);
  for (const t of pv.toc) expect(at[t.id + ":0:s"], `${t.id} page`).toBe(toInt(t.page));
  expect(JSON.stringify({ pages: pdf.pages.length, contents: Object.fromEntries(pv.toc.map((t) => [t.id, toInt(t.page)])) }, null, 1))
    .toMatchSnapshot([SNAP_ENV, "browser-menu.json"]);
  // afterprint (fired when page.pdf finished) puts the page back to normal
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-print"))).toBe(false);
  await context.close();
});

// Safari and iOS ignore CSS columns when printing, so for them (class "wk") two-column print is
// built as a table of blocks instead. Chromium can lay that table out too, which checks the
// Safari code path: nothing lost, contents numbers present, no block split.
for (const [setup, por] of [["marathi", ""], ["english", ""], ["marathi", "land"]]) {
  test(`Safari two-column table layout (${setup}${por ? ", sideways" : ""}) @chromium-only`, async ({ browser }) => {
    // Safari's user agent makes the site take its Safari print path (class "wk" on <html>)
    const context = await browser.newContext({ locale: "en-US", serviceWorkers: "block", userAgent: devices["Desktop Safari"].userAgent });
    const page = await context.newPage();
    await stubPrint(page);
    await openSite(page, { ...SETUPS[setup], por });
    await printFromButton(page, "pr1");
    const pv = await readPrintView(page);
    expect(pv.mode).toBe("two");
    expect(await page.locator("#pv table.pv2").count()).toBeGreaterThan(0);
    expect(pv.pieces).toHaveLength(11);
    expect(pv.toc.every((t) => t.page)).toBe(true);
    await addMarkers(page);
    const pdf = await pdfPages(page, "Letter");
    const at = markerPages(pdf.pages);
    expect(Object.keys(at).length).toBe(pv.blocks * 2);
    expect(JSON.stringify({ pages: pdf.pages.length, contents: Object.fromEntries(pv.toc.map((t) => [t.id, toInt(t.page)])) }, null, 1))
      .toMatchSnapshot([SNAP_ENV, `safari-table-${setup}${por ? "-sideways" : ""}.json`]);
    await context.close();
  });
}

// The Print pop-up itself: the right choices for each language, the paper named, Escape and Cancel close it.
test("print pop-up offers the right choices and closes cleanly @chromium-only", async ({ page }) => {
  await stubPrint(page);
  await openSite(page, SETUPS.both);
  await page.locator("#prb").click();
  await expect(page.locator("#pr1")).toHaveText("Side by side: Marathi | English");
  await expect(page.locator("#pr2")).toHaveText("Stacked: Marathi above English");
  await expect(page.locator("#prq")).toHaveText("Letter");
  await expect(page.locator("#pr1")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.locator("#prm")).toBeHidden();
  await expect(page.locator("#prb")).toBeFocused();
  await page.locator("#prb").click();
  await page.locator("#prx").click();
  await expect(page.locator("#prm")).toBeHidden();
  expect(await page.evaluate(() => window.__printed)).toBe(0);
});

// iPhone: Safari opens the print dialog only in answer to a tap, and laying the print view out takes longer
// than a tap counts for, so window.print() is quietly ignored (no beforeprint). The pop-up then offers
// Print now, whose own tap prints. In the Home Screen app, where even that may not open it, it says so.
for (const standalone of [false, true]) {
  test(`iPhone: an ignored print offers Print now${standalone ? " (Home Screen app)" : ""} @chromium-only`, async ({ browser }) => {
    const context = await browser.newContext({ ...IPHONE, locale: "en-US", serviceWorkers: "block" });
    const page = await context.newPage();
    await page.addInitScript((sa) => {
      if (sa) Object.defineProperty(navigator, "standalone", { value: true });
      window.__printed = 0;
      // the first call is ignored, as iOS does once the tap has expired; a later one opens the dialog,
      // except in the Home Screen app
      window.print = () => {
        if (window.__printed++ && !sa) dispatchEvent(new Event("beforeprint"));
      };
    }, standalone);
    await openSite(page, SETUPS.english);
    await page.locator("#prb").click();
    await page.locator("#pr2").click();
    await expect(page.locator("#prgo")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("#pr1")).toBeHidden();
    await expect(page.locator("#prgo")).toBeFocused();
    await page.locator("#prgo").click();
    expect(await page.evaluate(() => window.__printed)).toBe(2);
    if (standalone) {
      await expect(page.locator("#prw")).toBeVisible();
      await expect(page.locator("#prgo")).toBeHidden();
      await page.locator("#prx").click();
      expect(await page.evaluate(() => document.documentElement.hasAttribute("data-print"))).toBe(false);
    } else {
      await page.waitForTimeout(1300);
      await expect(page.locator("#prm")).toBeHidden();
      expect(await page.evaluate(() => document.documentElement.getAttribute("data-print"))).toBe("one");
    }
    // the next Print shows the layout choices again
    await page.evaluate(() => dispatchEvent(new Event("afterprint")));
    await page.locator("#prb").click();
    await expect(page.locator("#pr1")).toBeVisible();
    await expect(page.locator("#prgo")).toBeHidden();
    await expect(page.locator("#prw")).toBeHidden();
    await context.close();
  });
}

// Upright or Sideways: the choice is remembered, the note names it, the browser is told (@page), and Safari,
// which keeps the sheet picked in its own dialog, is told to pick Landscape there too
test("print pop-up: Upright or Sideways @chromium-only", async ({ browser }) => {
  for (const ua of [undefined, devices["Desktop Safari"].userAgent]) {
    const context = await browser.newContext({ locale: "en-US", serviceWorkers: "block", userAgent: ua });
    const page = await context.newPage();
    await stubPrint(page);
    await openSite(page, SETUPS.marathi);
    await page.locator("#prb").click();
    await expect(page.locator("#pou")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#proe")).toHaveText("upright");
    await page.locator("#pol").click();
    await expect(page.locator("#pol")).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#pou")).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("#proe")).toHaveText("sideways");
    await expect(page.locator("#prl")).toBeVisible({ visible: !!ua });
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem("aarti2-prefs")).por)).toBe("land");
    // the page size rules in effect (the site's own "portrait", then the pop-up's choice after it)
    const sizes = () =>
      page.evaluate(() => {
        const all = (rules) => [...rules].flatMap((r) => (r.cssRules && r.type !== 6 ? all(r.cssRules) : [r]));
        return [...document.styleSheets].flatMap((s) => all(s.cssRules)).filter((r) => r.type === 6 && r.style.size).map((r) => r.style.size);
      });
    expect((await sizes()).pop()).toBe("landscape");
    await page.locator("#pou").click();
    expect((await sizes()).pop()).toBe("portrait");
    await expect(page.locator("#prl")).toBeHidden();
    await context.close();
  }
});

test("print pop-up in Marathi-only and English-only offers two and one column @chromium-only", async ({ page }) => {
  await stubPrint(page);
  await openSite(page, SETUPS.english);
  await page.locator("#prb").click();
  await expect(page.locator("#pr1")).toHaveText("Two columns (English)");
  await expect(page.locator("#pr2")).toHaveText("Single column (English)");
});

// The choices name the languages actually printed, in the order printed (the main language first)
for (const [setup, one, two] of [
  ["kannada", "Two columns (Kannada)", "Single column (Kannada)"],
  ["kannada-both", "Side by side: Kannada | English", "Stacked: Kannada above English"],
  ["english-main-both", "Side by side: English | Marathi", "Stacked: English above Marathi"],
]) {
  test(`print pop-up names the languages printed: ${setup} @chromium-only`, async ({ page }) => {
    await stubPrint(page);
    await openSite(page, SETUPS[setup]);
    await page.locator("#prb").click();
    await expect(page.locator("#pr1")).toHaveText(one);
    await expect(page.locator("#pr2")).toHaveText(two);
  });
}
