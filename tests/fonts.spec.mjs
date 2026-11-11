// The text fonts as drawn: what Chrome actually draws each line in, for every font choice and script, on screen and
// in print (as in Nitya Upasana's fonts.spec.mjs, 2026-11-11)
import { test, expect } from "@playwright/test";
import { openSite, SETUPS } from "./helpers.mjs";
import { stubPrint } from "./print-helpers.mjs";

// What Chrome actually draws each line in (its own report, fallbacks included), not the first font asked for: the CSS
// asked for Traditional's family while its English was drawn in Inter, the menus' face, and its IAST marks in the
// phone's fonts (2026-11-11, css/00-fonts.css). Every font choice, every script, on screen and in print: each column
// mostly in its font, and nothing from the phone's own fonts.
const DRAWN = {
  std: { en: "Noto Sans", mr: "Noto Sans Devanagari", kn: "Noto Sans Kannada", te: "Noto Sans Telugu", gu: "Noto Sans Gujarati" },
  classic: { en: "Noto Serif", mr: "Tiro Devanagari Marathi", kn: "Tiro Kannada", te: "Tiro Telugu", gu: "Noto Serif Gujarati" },
  bold: { en: "Noto Serif", mr: "Noto Serif Devanagari", kn: "Noto Serif Kannada", te: "Noto Serif Telugu", gu: "Noto Serif Gujarati" },
};
/** each font Chrome drew the nodes in, with its glyphs; a phone's own font marked */
async function drawn(page, cdp, sel) {
  const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
  const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: sel });
  const out = {};
  for (const nodeId of nodeIds)
    for (const f of (await cdp.send("CSS.getPlatformFontsForNode", { nodeId })).fonts) {
      const k = f.isCustomFont ? f.familyName : "PHONE: " + f.familyName;
      out[k] = (out[k] || 0) + f.glyphCount;
    }
  return out;
}
const share = (fonts, name) => (fonts[name] || 0) / Object.values(fonts).reduce((a, b) => a + b, 0);
for (const fnt of ["std", "classic", "bold"])
  for (const script of ["mr", "kn", "te", "gu"])
    test(`${fnt}, ${script} letters with English and IAST: each drawn in its own font, on screen and in print @chromium-only`, async ({ browser }) => {
      test.setTimeout(180_000);
      for (const tr of ["simple", "iast"]) {
        const c = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: "block" });
        const page = await c.newPage();
        const cdp = await c.newCDPSession(page);
        await cdp.send("DOM.enable");
        await cdp.send("CSS.enable");
        await stubPrint(page);
        await openSite(page, { ...SETUPS.both, ind: script, fnt, tr }, { hash: "#a1" });
        await page.waitForSelector("#a1 .items", { state: "attached" });
        await page.evaluate(() => document.fonts.ready);
        // the aarti's lines (its spaces and commas drawn by the next font in the list, as the Indian fonts leave them out)
        const mr = await drawn(page, cdp, "#a1 .items .mr p, #a1 .rftop .mr p");
        const en = await drawn(page, cdp, "#a1 .items .en p, #a1 .rftop .en p");
        const want = DRAWN[fnt];
        expect(
          Object.keys(mr)
            .concat(Object.keys(en))
            .filter((k) => k.startsWith("PHONE")),
          `${fnt} ${script} ${tr}`,
        ).toEqual([]);
        expect(share(en, want.en), `${fnt} ${tr} English: ${JSON.stringify(en)}`).toBeGreaterThan(0.95);
        expect(share(mr, want[script]), `${fnt} ${script}: ${JSON.stringify(mr)}`).toBeGreaterThan(0.6);
        // the bold dhrupad at the top: in Traditional, the family's own bold (Noto Serif Devanagari), not the Modern font
        if (fnt !== "std" && script === "mr") {
          const top = await drawn(page, cdp, "#a1 .rftop .mr p");
          expect(share(top, "Noto Serif Devanagari"), `${fnt} dhrupad: ${JSON.stringify(top)}`).toBeGreaterThan(0.6);
        }
        // every word on the page: Home's list, the titles, credits, menus and symbols too (a file input, never seen, aside)
        const all = await drawn(page, cdp, "body *:not(input)");
        expect(
          Object.keys(all).filter((k) => k.startsWith("PHONE")),
          `page ${fnt} ${script} ${tr}: ${JSON.stringify(all)}`,
        ).toEqual([]);
        // and every word of the printout: its contents, and the first texts' titles, lines, markers and credits
        await page.evaluate(() => window.dispatchEvent(new Event("beforeprint")));
        await page.emulateMedia({ media: "print" });
        await page.waitForFunction(() => document.querySelector("#pv .pve"));
        await page.evaluate(() => document.fonts.ready);
        const pv = await drawn(page, cdp, "#pv .pvtoc *, #pv .pvs:nth-of-type(-n + 3) *");
        expect(
          Object.keys(pv).filter((k) => k.startsWith("PHONE")),
          `print ${fnt} ${script} ${tr}: ${JSON.stringify(pv)}`,
        ).toEqual([]);
        await c.close();
      }
    });
