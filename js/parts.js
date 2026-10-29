// The files the site is built from, listed once. Read by:
// - js/features/offline.js: "Check for updates" compares them with the saved copy, and the offline badge waits for them;
// - sw.js (importScripts): the files saved on the phone for offline use;
// - tests/site-files.spec.mjs: checks this list against the <link> and <script> tags in index.html.
// When adding a file, add it here AND to index.html (the page loads files from its tags, not from this list).
// eslint-disable-next-line no-unused-vars, no-redeclare -- declared here, read as a global by the site script and sw.js
var SITE_PARTS = (function () {
  // The styles, in the order index.html loads them. The order matters: a later rule refines an earlier one.
  var css = [
    "00-fonts",
    "01-theme",
    "02-core",
    "03-menus-print-view",
    "04-columns-rail",
    "05-home-card",
    "06-help-polish",
    "07-bottom-bar-folds",
    "08-contents-book",
    "09-settings-page",
    "15-print",
    "99-fallbacks",
  ].map(function (f) {
    return "css/" + f + ".css";
  });
  // The plain scripts, in load order: this list, the code that builds the pieces
  var scripts = ["js/parts.js", "js/render.js"];
  // The site script: js/main.js (loaded with <script type="module">) and the parts it imports
  var modules = [
    "main",
    "text/load",
    "text/content",
    "text/format",
    "core/page",
    "core/state",
    "core/words",
    "store/migrate",
    "core/features",
    "text/iast",
    "text/layout",
    "features/astronomy",
    "features/date-card",
    "text/dhrupad-markers",
    "text/stanza-numbers",
    "text/line-breaks",
    "text/autofit",
    "core/apply",
    "features/bottom-bar",
    "features/tilt",
    "features/bars",
    "features/settings-panel",
    "features/dhrupad-button",
    "features/reading-sheet",
    "features/wake-lock",
    "features/overlays",
    "features/history",
    "features/languages",
    "core/routine",
    "features/session-card",
    "features/contents-list",
    "features/clicks",
    "features/pinch",
    "text/search-core",
    "text/search",
    "core/startup",
    "features/picture-viewer",
    "features/help",
    "print/what",
    "features/print",
    "features/share",
    "features/more-menu",
    "features/offline",
  ].map(function (f) {
    return "js/" + f + ".js";
  });
  // The texts: the list of texts, the categories (the reading page's sections) and the evening routine, then one file per text, as listed in content/library.json
  // (js/text/load.js reads them; tests/site-files.spec.mjs checks this list against library.json)
  var content = [
    "library.json",
    "categories.json",
    "routines.json",
    "texts/vedic-chant-atharvashirsha.txt",
    "texts/aarti-sukhkarta.txt",
    "texts/aarti-shendur-lal-chadhayo.txt",
    "texts/aarti-durge-durghat-bhari.txt",
    "texts/aarti-lavathavati-vikrala.txt",
    "texts/aarti-trigunatmak-traimurti.txt",
    "texts/aarti-dnyanaraja.txt",
    "texts/aarti-yei-o-vitthale.txt",
    "texts/aarti-ghalin-lotangan.txt",
    "texts/aarti-jai-ganesh-deva.txt",
    "texts/aarti-jai-jagdish-hare.txt",
  ].map(function (f) {
    return "content/" + f;
  });
  // Font files kept for offline use: all of them, including the optional text fonts (Classic, Handwritten,
  // in Marathi and Kannada), so a font picked in Settings shows at once, even with a weak signal or none
  var fonts = [
    "inter-latin",
    "inter-latin-ext",
    "noto-sans-deva-devanagari",
    "noto-sans-deva-latin",
    "noto-sans-deva-latin-ext",
    "tiro-marathi-devanagari",
    "tiro-marathi-latin",
    "tiro-marathi-latin-ext",
    "tiro-sanskrit-devanagari",
    "tiro-sanskrit-latin",
    "tiro-sanskrit-latin-ext",
    "noto-sans-kannada-kannada",
    // the optional text fonts
    "noto-serif-deva-devanagari",
    "noto-serif-latin",
    "noto-serif-latin-ext",
    "kalam-devanagari-400",
    "kalam-devanagari-700",
    "kalam-latin-400",
    "kalam-latin-700",
    "kalam-latin-ext-400",
    "kalam-latin-ext-700",
    "noto-serif-kannada-kannada",
    "hubballi-kannada",
  ].map(function (f) {
    return "fonts/" + f + ".woff2";
  });
  return { css: css, scripts: scripts, modules: modules, content: content, fonts: fonts, all: css.concat(scripts, modules, content) };
})();
