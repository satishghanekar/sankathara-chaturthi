// Settings (P), loaded from this device
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { migratePrefs } from "../store/migrate.js";

// The language that leads, "en" or "mr": English only with both languages shown and English first. Set by apply()
// (js/features/bars.js, setLead()), read by the auto-fit and print.
export var LEAD = "mr";

export var P;
var K, DESK;

// The settings, upgraded from whichever version saved them (js/store/migrate.js keeps the defaults and the steps, as
// in Nitya Upasana)
export function init() {
  K = "aarti2-prefs";
  // the menus' sizes (css/01-theme.css, --ts) follow the reader's own text size, as the text does (as in Nitya Upasana)
  document.documentElement.style.setProperty("--ts", String(textScale()));
  // A computer (no touch screen): the screen is kept on only if the reader turns it on
  DESK = !!(window.matchMedia && !matchMedia("(any-pointer:coarse)").matches);
  var saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(K) || "null");
  } catch (e) {}
  var r = migratePrefs(saved, { desk: DESK, fs: dfs() });
  P = r.prefs;
  // written again when an older version's settings were upgraded
  if (r.changed) save();
}

// Default text size, by how far the screen is read from (Satish, 2026-11-02: 115% of the old fit, about 22px, reads well
// on an iPhone 16 Pro): a phone held close 22px (20px under 360px wide), an iPad on the puja stand 28px, a computer 24px
// (26px on a large screen); every text the same, a long line wrapping rather than the text shrinking. Times the phone's
// own text size (textScale()). (As in Nitya Upasana; it replaces the phones' 110% of the fit, 2026-10-25.)
export function dfs() {
  var s = Math.min(screen.width || innerWidth, screen.height || innerHeight),
    co = window.matchMedia && matchMedia("(pointer:coarse)").matches,
    b = co ? (s >= 600 ? 28 : s < 360 ? 20 : 22) : (screen.width || innerWidth) >= 1600 ? 26 : 24;
  return Math.round(b * textScale());
}

var TS = 0;
/**
 * The reader's own text size, as a share of the usual one (0.85 to 1.5): Larger Text on an iPhone or iPad (Dynamic
 * Type, which Safari gives as -apple-system-body, 17px as it comes), else the browser's default size (16px as it comes:
 * a browser's setting, or Android's font size where Chrome passes it on). The menus and the text both follow it.
 */
export function textScale() {
  if (TS) return TS;
  var r = 1;
  try {
    var apple = matchMedia("(pointer:coarse)").matches && CSS.supports("font", "-apple-system-body"),
      e = document.createElement("span");
    e.style.cssText = "position:absolute;visibility:hidden;font:" + (apple ? "-apple-system-body" : "medium sans-serif");
    document.documentElement.appendChild(e);
    var px = parseFloat(getComputedStyle(e).fontSize);
    e.remove();
    // (under 14px is not an iPhone's or iPad's: their smallest is 14px; a Mac's Safari gives 13px)
    if (px && !(apple && px < 14)) r = px / (apple ? 17 : 16);
  } catch (x) {}
  return (TS = Math.max(0.85, Math.min(1.5, Math.round(r * 20) / 20)));
}

export function save() {
  try {
    localStorage.setItem(K, JSON.stringify(P));
  } catch (e) {}
}

// Change settings the reader chose: the one way the parts write P (as in Nitya Upasana). The values are put into P,
// then (when given) the page is brought up to date (then: apply(), or the part's own update), then everything is
// saved. Bringing the page up to date is left to the caller because some changes deliberately wait: a text size
// from A− / A+ is laid out once the taps stop. A few writes stay direct, as none is a choice to keep yet: the text
// size while a pinch is under way (saved with change() when the fingers lift), the size the auto-fit measures
// (js/text/autofit.js), and the start-up repairs of a saved value that is missing or no longer offered.
/** @param {Record<string, any>} changes @param {() => void} [then] */
export function change(changes, then) {
  for (var k in changes) P[k] = changes[k];
  if (then) then();
  save();
}

/** @param {"mr" | "en"} l */
export function setLead(l) {
  LEAD = l;
}
