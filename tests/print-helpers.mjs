// Print / PDF helpers.
//
// How a print test works:
//  1. window.print is replaced with a stub, so the site's own Print button runs exactly as for a
//     reader (build the print view #pv, work out the contents page numbers, then call print()).
//  2. When print() is called, invisible markers are added at the start and end of every unbroken
//     block (.pvk) of every piece. They are absolutely positioned, so they take no space and the
//     page breaks are the ones a reader gets.
//  3. Chromium prints the page to PDF at the reader's paper size (Letter for US/Canada, A4 elsewhere)
//     and pdf.js reads the text of every page back, so the test can check where each piece and each
//     block actually landed.
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const DIGITS = { "०": 0, "१": 1, "२": 2, "३": 3, "४": 4, "५": 5, "६": 6, "७": 7, "८": 8, "९": 9,
  "೦": 0, "೧": 1, "೨": 2, "೩": 3, "೪": 4, "೫": 5, "೬": 6, "೭": 7, "೮": 8, "೯": 9 };
/** "१२" or "೧೨" or "12" → 12 */
export const toInt = (s) => Number(String(s).replace(/./g, (c) => (c in DIGITS ? DIGITS[c] : c)));

/** Stub window.print before the site loads; calls are counted in window.__printed. */
export async function stubPrint(page) {
  await page.addInitScript(() => {
    window.__printed = 0;
    window.print = () => {
      window.__printed++;
    };
  });
}

/** Press Print on the home page, then the given choice ("pr1" = first button, "pr2" = second). */
export async function printFromButton(page, choice) {
  await page.evaluate(() => scrollTo(0, 0));
  // a folded home card hides its buttons: open it first, as a reader would (tap the slim line)
  if (!(await page.locator("#prb").isVisible())) await page.locator("#slim").click();
  await page.locator("#prb").click();
  await page.locator("#prm").waitFor({ state: "visible" });
  await page.locator("#" + choice).click();
  await page.waitForFunction(() => window.__printed > 0, null, { timeout: 15_000 });
  // From here on the page is styled as the printer sees it, so "shown" means shown on paper
  await page.emulateMedia({ media: "print" });
}

/** What the site built: contents numbers, the text of each piece in the print view, block count. */
export async function readPrintView(page) {
  return page.evaluate(() => {
    const pv = document.getElementById("pv");
    return {
      mode: document.documentElement.getAttribute("data-print"),
      toc: [...pv.querySelectorAll(".pvtoc li[data-sid]")].map((li) => ({
        id: li.dataset.sid,
        page: (li.querySelector(".pgn") || {}).textContent || "",
      })),
      pieces: [...pv.querySelectorAll(".pvs")].map((s) => s.dataset.sid),
      blocks: pv.querySelectorAll(".pvk").length,
      // the English lines that are actually shown in the print view (for the text check)
      english: [...pv.querySelectorAll(".en p, td.pve")]
        // shown unless the line or a parent inside the print view is display:none (the print view
        // itself is hidden on screen until printing, so it is not counted)
        .filter((e) => {
          for (let x = e; x && x !== pv; x = x.parentElement) if (getComputedStyle(x).display === "none") return false;
          return true;
        })
        .map((e) => e.textContent.trim())
        .filter(Boolean),
    };
  });
}

/**
 * Add the start/end markers described above to every block of every piece.
 * when = "now" (after the Print button has built the print view), or "beforeprint" to add them
 * each time the browser is about to print, just after the site's own beforeprint handler has built
 * the view (for printing from the browser menu, which rebuilds it).
 */
export async function addMarkers(page, when = "now") {
  await page.evaluate((when) => {
    const run = () => {
    const mk = (t) => {
      const s = document.createElement("span");
      s.className = "__pm";
      s.textContent = " [[" + t + "]] ";
      // white 1px text: printed (so pdf.js can read it) but invisible and taking no space
      s.style.cssText = "position:absolute;font:1px/1 monospace;letter-spacing:0;word-spacing:0;text-transform:none;color:#fff;white-space:nowrap";
      return s;
    };
    const shown = (n) => {
      for (let e = n.parentElement; e && e.id !== "pv"; e = e.parentElement)
        if (getComputedStyle(e).display === "none") return false;
      return true;
    };
    document.querySelectorAll("#pv .pvs").forEach((sec) => {
      sec.querySelectorAll(".pvk").forEach((k, j) => {
        const w = document.createTreeWalker(k, NodeFilter.SHOW_TEXT, {
          acceptNode: (n) => (n.data.trim() && shown(n) ? 1 : 3),
        });
        const first = w.nextNode();
        if (!first) return;
        let last = first, n;
        while ((n = w.nextNode())) last = n;
        first.parentNode.insertBefore(mk(sec.dataset.sid + ":" + j + ":s"), first);
        last.parentNode.insertBefore(mk(sec.dataset.sid + ":" + j + ":e"), last.nextSibling);
      });
    });
    };
    if (when === "now") run();
    else addEventListener("beforeprint", run);
  }, when);
}

/** Print to PDF and return the text of every page. */
export async function pdfPages(page, paper) {
  const buf = await page.pdf({ format: paper, preferCSSPageSize: true, printBackground: true });
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), useSystemFonts: false, verbosity: 0 }).promise;
  const out = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const tc = await (await doc.getPage(i)).getTextContent();
    out.push(tc.items.map((x) => x.str).join(""));
  }
  return { pages: out, bytes: buf.length };
}

/** Where each marker landed: { "a1:0:s": 5, … } (page numbers from 1). */
export function markerPages(pages) {
  const at = {};
  pages.forEach((t, i) => {
    for (const m of t.replace(/\s+/g, "").matchAll(/\[\[([^\]]+)\]\]/g)) if (!(m[1] in at)) at[m[1]] = i + 1;
  });
  return at;
}

/** Text compared without spaces, line breaks or Unicode composition differences. */
// Accent marks (Vedic svara marks, macrons below) are dropped before comparing: they come from whichever
// fallback font the machine has, and PDF text extraction places them differently from one machine to
// the next. The letters they sit on are still compared.
export const squash = (s) => s.normalize("NFD").replace(/\p{M}/gu, "").replace(/[\s​­]+/g, "");
