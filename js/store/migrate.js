// @ts-check
// The reader's settings (P), as plain data: the defaults, the upgrade of settings saved by every older version of
// the site (settings versions 0 to 6), and the tidy-up that keeps the choices consistent. As in Nitya Upasana
// (js/store/migrate.js there), without its profiles: this site keeps one set of settings per device.
// Pure: no page and no storage, so the unit tests (tests/unit/migrate.test.mjs) run it in Node. js/core/state.js
// uses it at start-up.

/**
 * @typedef {{ desk: boolean, fs: number }} Env  desk: a computer (no touch screen); fs: the default text size here
 * @typedef {Record<string, any>} Prefs
 */

// the settings version this code writes (P.sv)
export const SETTINGS_VERSION = 6;

/**
 * Every setting with its default
 * @param {Env} env
 * @returns {Prefs}
 */
export function defaults(env) {
  return {
    sv: 0, // settings version (see migratePrefs)
    fs: env.fs, // text size in px
    fsu: 0, // 1 = the reader chose the size (A−/A+/pinch), so auto-fit leaves it alone
    th: "auto", // theme: auto | light | sepia | dark
    lang: "mr", // shown now (the अ/A button): the main language, the second, or both
    lead: "mr", // main language (large text, first in Both): mr | en (Settings → Main language)
    l2: "en", // second language (smaller, under each line): en | mr, or "" for none (Settings → Second language)
    ui: "en", // menus, home page and buttons: en | mr (English, or the main language)
    ind: "mr", // which language the "mr" slot above shows: mr (Marathi, as written) | kn (the same words in Kannada
    // letters, made by SCR in js/render.js while the page loads). There are no Kannada menus yet, so menus stay English.
    ref: 1, // dhrupad: 1 = once at the top, 0 = repeated after every stanza
    hc: 0, // high contrast
    wake: env.desk ? 0 : 1, // keep the screen on (phones and tablets; off by default on computers)
    cols: 0, // wide screens: 0 = automatic, 1 = one column, 2 = two columns
    loc: null, // { lat, lon } from "Use my location"
    hl: "", // data-l id of the highlighted (tapped) line
    por: "", // the page last chosen in the Print pop-up: "" not yet (CHOICE in js/features/print.js) | "up" Portrait | "land" Landscape
    fnt: "std", // text font: std | classic | hand (Settings → Text font; a saved "bold", a font since dropped, reads as std)
    pref: "", // dhrupad in the printout, picked in the Print pop-up: "" as on the page (ref) | 0 after every verse | 1 once
    pfn: "", // font of the printout, picked in the Print pop-up: "" the text font above | std | classic | hand
    plang: "", // language of the printout: "" as the page shows it | mr (the original) | en | both
    ppr: "", // paper of the printout: "" as the device's region suggests (Letter in the US and Canada) | letter | a4
    pskip: [], // texts left out of the printout (their piece ids: a1, p1 …), unticked under What to print; a new text prints
    tr: "simple", // English text style: simple ("Sukhkarta") | iast ("sukhakartā", with Vedic accent marks)
    fold: 0, // home card folded to one slim line
    pf: 0, // Vedic Chant section folded (for those who come only for the aartis)
    xf: 0, // Aarti section folded
    tf: 0, // home contents list folded
    af: [], // ids of folded pieces
    rc: [], // Recent in the Library, newest first: a text's section, or its section and a line's ("a3|s3l5"), at most 8
    as: 3, // autoscroll speed for an aarti not yet adjusted, 1 (slow) to 10 (fast)
    ason: 0, // show the autoscroll button in the bottom bar (Settings switch)
    asp: {}, // autoscroll speed per piece (each has its own tempo): { a1: 3, p1: 4, … }
  };
}

/**
 * A saved value is kept only when it has the same kind as the default (a number for a number, a list for a list…),
 * so damaged or hand-edited settings can't put, say, text where the text size belongs.
 * @param {string} k
 * @param {any} v
 * @param {any} d the default
 */
function fits(k, v, d) {
  if (v === undefined) return false;
  if (k === "loc") return v === null || (!!v && typeof v === "object" && typeof v.lat === "number" && typeof v.lon === "number");
  if (k === "pref") return v === "" || v === 0 || v === 1;
  if (Array.isArray(d))
    return (
      Array.isArray(v) &&
      v.every(function (x) {
        return typeof x === "string";
      })
    );
  if (d && typeof d === "object") return !!v && typeof v === "object" && !Array.isArray(v);
  if (typeof d === "number") return typeof v === "number" && isFinite(v);
  return typeof v === typeof d;
}

/**
 * Settings saved by any version of the site, brought up to today's version: the same steps js/core/state.js has
 * always run, in order, then the tidy-up. Unknown keys are dropped.
 * @param {Prefs | null | undefined} saved  the parsed localStorage["aarti2-prefs"]
 * @param {Env} env
 * @returns {{ prefs: Prefs, changed: boolean }}  changed: the upgrade changed something that should be saved
 */
export function migratePrefs(saved, env) {
  var P = defaults(env),
    s = saved && typeof saved === "object" ? saved : {},
    changed = false,
    k;
  for (k in P) {
    if (fits(k, s[k], P[k])) P[k] = s[k];
  }
  if (P.sv < 4) {
    if (P.sv < 3) P.ref = 1; // v3: dhrupad shown once by default
    P.wake = 1; // v4: keep screen on by default
    P.sv = 4;
    changed = true;
  }
  if (P.sv < 5) {
    if (env.desk) P.wake = 0; // v5: computers no longer keep the screen on by default
    P.sv = 5;
    changed = true;
  }
  if (P.sv < 6) {
    // v6: a main and a second language; "In Both, show first" became the main language
    P.l2 = P.lead === "en" ? "mr" : "en";
    P.sv = 6;
    changed = true;
  }
  tidy(P);
  return { prefs: P, changed: changed };
}

/**
 * Keep the choices consistent: two different languages, English menus when English is the main one, only the chosen
 * languages shown, and only the themes and fonts the site offers
 * @param {Prefs} P
 */
export function tidy(P) {
  // the reading page's section rows (वैदिक मंत्र, आरती) and their folds are gone, as in Nitya Upasana (2026-10-29): a
  // section folded before then must not keep its texts hidden with no row left to open it
  P.pf = P.xf = 0;
  if (P.lead !== "en") P.lead = "mr";
  if (P.l2 === P.lead || ["mr", "en", ""].indexOf(P.l2) < 0) P.l2 = P.lead === "en" ? "mr" : "en";
  if (P.ind !== "kn") P.ind = "mr";
  if (P.por !== "land" && P.por !== "up") P.por = "";
  if (P.lead === "en" || P.ind !== "mr") P.ui = "en";
  if (!P.l2 || [P.lead, P.l2, "both"].indexOf(P.lang) < 0) P.lang = P.lead;
  if (["auto", "light", "sepia", "dark"].indexOf(P.th) < 0) P.th = "auto";
  // three text fonts since 2026-10-25: Bold (Sura) was dropped, and a saved "bold" reads as Standard
  if (["std", "classic", "hand"].indexOf(P.fnt) < 0) P.fnt = "std";
  if (["std", "classic", "hand"].indexOf(P.pfn) < 0) P.pfn = "";
  if (["mr", "en", "both"].indexOf(P.plang) < 0) P.plang = "";
  if (["letter", "a4"].indexOf(P.ppr) < 0) P.ppr = "";
  if (P.tr !== "iast") P.tr = "simple";
  if (P.ui !== "mr") P.ui = "en";
  return P;
}
