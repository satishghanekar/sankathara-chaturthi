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

// Default text size: 28px on tablets, 24px on phones and computers (auto-fit may lower it).
export function dfs() {
  var s = Math.min(screen.width || innerWidth, screen.height || innerHeight),
    co = window.matchMedia && matchMedia("(pointer:coarse)").matches;
  return co && s >= 600 ? 28 : 24;
}

// Phones (a touch screen under 600px on its short side) read best a little larger than the size at which every
// line fits on one row: their default is 110% of it (Satish's pick on an iPhone 16 Pro, 2026-10-25), and the
// size shown in the pinch bubble, Settings and the reading sheet counts that as 100%. A few long lines wrap.
export function phoneBoost() {
  var s = Math.min(screen.width || innerWidth, screen.height || innerHeight),
    co = window.matchMedia && matchMedia("(pointer:coarse)").matches;
  return co && s < 600 ? 1.1 : 1;
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
