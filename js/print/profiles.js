// Print typography: every number the print layout chooses sizes with, in one place
// Read by js/print/fit.js. The sizes of each part of a printout (a stanza line, the English under it, a
// heading) are set by the print styles (css/03-menus-print-view.css); this file says how each script may
// be adjusted from there to fit the paper, so that lines stay whole and side by side stays in step.
//
// To print a new language or script, give it an entry in SCRIPTS (and its fonts in css/00-fonts.css).
// Nothing else needs tuning: the fitting measures the actual text, in the reader's font, on the paper size.

// Each script the printed text can be in:
//   size:   its size against the print styles' size for that line (1 = as styled), in the standard font.
//           A script whose letters look large for their point size is set a little smaller, so that on
//           paper it looks the size of the others.
//   font:   the same, for the other text fonts (Settings → Text font) where they differ from size: the
//           fonts of one script are not all drawn the same size. Measured, not guessed: the height of the
//           script's ordinary letters at one point size (tests/print-audit.spec.mjs prints the table:
//           "font sizes"). At the same point size Devanagari is about 63 in every font, while Kannada is
//           80 (standard), 82 (classic), 74 (bold) and 54 (handwritten). Kannada is set to look a little
//           larger than Devanagari, about 70 (its letters read better a little larger); the handwritten
//           one is drawn small but wide, so it stays at its own size: any larger and its lines no longer
//           fit beside their English (checked with npm run print:audit).
//   minFit: the smallest the fitting may set a piece in it, against that size, to keep a line whole
//           (0.85: never more than 15% smaller). A line that would need more wraps instead, at a
//           preferred break where it has one.
export var SCRIPTS = {
  deva: { size: 1, minFit: 0.85 }, // Devanagari: Marathi, Hindi, Sanskrit
  knda: { size: 0.9, font: { classic: 0.86, hand: 1 }, minFit: 0.85 }, // Kannada letters (Settings → Main language → ಕನ್ನಡ)
  latn: { size: 1, minFit: 0.85 }, // English, in either spelling (simple or IAST)
};

// The size a script is set at in a text font (std, classic, bold or hand)
export function sizeOf(sc, fnt) {
  return (sc.font && sc.font[fnt]) || sc.size;
}

// Which script a printed line is in. Lines are marked lang="mr" (the original, in whichever letters it is
// shown) or lang="en"; data-scr on <html> says which letters the original is shown in (js/render.js).
export function scriptOf(lang, scr) {
  if (lang === "en") return "latn";
  return scr === "kn" ? "knda" : "deva";
}

export var LAYOUT = {
  // Side by side: the share of the width the original's column may take. For each piece, the fitting tries
  // every share in this range (in steps of 1%) and keeps the one that leaves the fewest rows out of step.
  // (One share for a whole piece, so its dividing rule runs straight down every page of it.)
  side: { min: 0.36, max: 0.62, step: 0.01 },
  // A line counts as fitting only with this much to spare. The page-sized copy the text is measured in
  // predicts the paper to within 1% (checked against Chrome's PDFs: a line measured at 99% of its column
  // never wrapped on paper, one at 101% always did).
  margin: 0.99,
  // Pages: a piece is set smaller as a whole (to no less than this) when that makes it take fewer pages:
  // when it would spill a little onto another page, or its stanzas are too big to share a page.
  page: { minZoom: 0.8 },
  // How bad each outcome is, when choosing sizes. A row out of step side by side is the worst (the reader
  // loses their place), then a line broken in the middle of a phrase, then a line that wraps at a
  // preferred break; setting a piece smaller costs a little for every 1% (shrink, per 1%).
  cost: { outOfStep: 10, midPhrase: 3, wrap: 1, shrink: 0.04 },
};
