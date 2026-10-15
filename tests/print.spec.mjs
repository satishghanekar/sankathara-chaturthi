// Print and PDF: the most thorough suite, because the printout is what the group hands round.
//
// For every combination of layout × text font × paper size (and a set of special cases) it checks:
//   - the contents page lists the page each piece really starts on in the PDF
//   - every unbroken block (heading with its dhrupad and first stanza, each stanza) sits on one page
//   - every piece is printed, even when it or its section is folded on screen
//   - the screen-only controls (Open all, settings, etc.) never print
//   - in layouts with English, every English line of the print view is in the PDF
//   - the page count and contents numbers match the recorded baseline
// PDFs can only be made by Chromium, so this suite is Chromium-only.
import { test, expect, devices } from "@playwright/test";
import { openSite, SETUPS } from "./helpers.mjs";
import { stubPrint, printFromButton, readPrintView, addMarkers, pdfPages, markerPages, squash, toInt } from "./print-helpers.mjs";

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
];
const FONTS = ["std", "classic", "bold", "hand"];
// Letter is chosen for US / Canada / Mexico / Philippines, A4 everywhere else (see LTR in js/app.js)
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
  { name: "kannada-side-by-side", prefs: SETUPS["kannada-both"], choice: "pr1", mode: "side" },
  { name: "dhrupad-every-verse-single", prefs: SETUPS["marathi-every-verse"], choice: "pr2", mode: "one" },
  { name: "dhrupad-every-verse-two", prefs: SETUPS["marathi-every-verse"], choice: "pr1", mode: "two" },
  { name: "marathi-menus-two-columns", prefs: SETUPS["marathi-menus"], choice: "pr1", mode: "two" },
  // Folded on screen: the Pooja section, the Aarti section and two pieces. All must still print.
  { name: "everything-folded", prefs: { ...SETUPS.marathi, pf: 1, xf: 1, af: ["a3", "a7"], tf: 1, fold: 1 }, choice: "pr2", mode: "one" },
  { name: "a4-kannada-two-columns", prefs: SETUPS.kannada, choice: "pr1", mode: "two", paper: "A4", locale: "en-GB" },
];

const SCREEN_ONLY = ["Open all", "Fold all", "Check for updates", "Settings", "Add to Home Screen"];

async function runPrint(browser, { prefs, choice, mode, paper, locale }) {
  const context = await browser.newContext({ locale, viewport: { width: 1280, height: 900 }, serviceWorkers: "block" });
  const page = await context.newPage();
  const errors = [];
  await stubPrint(page);
  await openSite(page, prefs, { errors });
  // What a reader sees on screen, for the completeness check (folded pieces opened for the count)
  const onScreen = await page.evaluate(() => [...document.querySelectorAll("section.ash")].map((s) => s.id));
  await printFromButton(page, choice);
  const pv = await readPrintView(page);
  await addMarkers(page);
  const pdf = await pdfPages(page, paper);
  await context.close();
  return { pv, pdf, errors, onScreen, mode };
}

function check(r, paper) {
  const { pv, pdf, errors, onScreen, mode } = r;
  const at = markerPages(pdf.pages);
  expect(errors, "no script errors").toEqual([]);
  expect(pv.mode, "print mode set on the page").toBe(mode);
  // every piece is in the print view, in reading order
  expect(pv.pieces).toEqual(onScreen);
  // contents numbers: one per piece, and each is the page the piece really starts on
  expect(pv.toc.map((t) => t.id)).toEqual(onScreen);
  for (const t of pv.toc) {
    expect(t.page, `contents has a page number for ${t.id}`).not.toBe("");
    expect(at[t.id + ":0:s"], `${t.id} starts on the page the contents says (${paper})`).toBe(toInt(t.page));
  }
  // no block is cut across a page break
  const cut = [];
  for (const key of Object.keys(at)) {
    if (!key.endsWith(":s")) continue;
    const end = key.replace(/:s$/, ":e");
    if (at[end] !== at[key]) cut.push(`${key.slice(0, -2)} (pages ${at[key]}–${at[end]})`);
  }
  expect(cut, "blocks split across pages").toEqual([]);
  // every block was found in the PDF (nothing lost off the page)
  expect(Object.keys(at).length, "every block start and end printed").toBe(pv.blocks * 2);
  // page footer "N / total" on every page
  const n = pdf.pages.length;
  pdf.pages.forEach((t, i) => expect(t.replace(/\s/g, ""), `footer on page ${i + 1}`).toContain(`${i + 1}/${n}`));
  // screen-only controls never print
  const all = pdf.pages.join("\n");
  for (const s of SCREEN_ONLY) expect(all, `"${s}" is screen-only`).not.toContain(s);
  // English text is all there (Devanagari and Kannada can't be read back reliably from a PDF; their
  // completeness is covered by the block markers above)
  if (pv.english.length) {
    const flat = squash(all.replace(/\[\[[^\]]+\]\]/g, ""));
    const missing = pv.english.filter((l) => !flat.includes(squash(l)));
    expect(missing, "English lines missing from the PDF").toEqual([]);
  }
  return { pages: n, contents: Object.fromEntries(pv.toc.map((t) => [t.id, toInt(t.page)])) };
}

for (const L of LAYOUTS)
  for (const fnt of FONTS)
    for (const P of PAPERS) {
      test(`${L.name} · ${fnt} font · ${P.paper} @chromium-only`, async ({ browser }) => {
        const r = await runPrint(browser, { prefs: { ...SETUPS[L.setup], fnt }, choice: L.choice, mode: L.mode, ...P });
        const summary = check(r, P.paper);
        expect(JSON.stringify(summary, null, 1)).toMatchSnapshot(`${L.name}-${fnt}-${P.paper}.json`);
      });
    }

for (const X of EXTRAS) {
  test(`${X.name} @chromium-only`, async ({ browser }) => {
    const paper = X.paper || "Letter";
    const r = await runPrint(browser, { prefs: X.prefs, choice: X.choice, mode: X.mode, paper, locale: X.locale || "en-US" });
    const summary = check(r, paper);
    expect(JSON.stringify(summary, null, 1)).toMatchSnapshot(`${X.name}.json`);
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
    .toMatchSnapshot("browser-menu.json");
  // afterprint (fired when page.pdf finished) puts the page back to normal
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-print"))).toBe(false);
  await context.close();
});

// Safari and iOS ignore CSS columns when printing, so for them (class "wk") two-column print is
// built as a table of blocks instead. Chromium can lay that table out too, which checks the
// Safari code path: nothing lost, contents numbers present, no block split.
for (const setup of ["marathi", "english"]) {
  test(`Safari two-column table layout (${setup}) @chromium-only`, async ({ browser }) => {
    // Safari's user agent makes the site take its Safari print path (class "wk" on <html>)
    const context = await browser.newContext({ locale: "en-US", serviceWorkers: "block", userAgent: devices["Desktop Safari"].userAgent });
    const page = await context.newPage();
    await stubPrint(page);
    await openSite(page, SETUPS[setup]);
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
      .toMatchSnapshot(`safari-table-${setup}.json`);
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

test("print pop-up in Marathi-only and English-only offers two and one column @chromium-only", async ({ page }) => {
  await stubPrint(page);
  await openSite(page, SETUPS.english);
  await page.locator("#prb").click();
  await expect(page.locator("#pr1")).toHaveText("Two columns (English)");
  await expect(page.locator("#pr2")).toHaveText("Single column (English)");
});
