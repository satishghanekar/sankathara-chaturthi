// @ts-check
// The menu words in English, every part's under its name (js/core/strings.js menuWords()). English is the complete
// set: another language's file has the same words, and a word it lacks is taken from here.

export default {
  // The print builder's What step: Texts, Today, Routine (js/print/what.js)
  printWhat: {
    what: "What to print",
    search: "Search the texts",
    all: "All texts",
    selectAll: "Select all",
    clear: "Clear",
    none: "No text matches",
    /** @param {number} n */
    texts: function (n) {
      return n + (n === 1 ? " text" : " texts");
    },
    pick: "Pick at least one text",
  },
  // The top bar (js/features/bars.js)
  bar: {
    /** The title's spoken name: what it does, then the words shown @param {string} t */
    home: function (t) {
      return "Home: " + t;
    },
    find: "Find a text or a line",
  },
  // The bottom bar's Prev and Next (js/features/bottom-bar.js): the arrow stays, the word may be left out on small phones
  bottomBar: {
    prev: "‹ Prev",
    next: "Next ›",
  },
  // A piece's fold button (js/core/apply.js)
  fold: {
    open: "Show this piece",
    fold: "Fold this piece",
  },
  // The reading sheet (js/features/reading-sheet.js) and Settings → Languages (js/features/languages.js)
  languages: {
    both: "Both",
    second: "+ Second language",
    none: "None",
    refrain: "↻ Refrain",
    close: "Close",
    reset: "Reset text size",
    /** @param {string} pct */
    size: function (pct) {
      return "Text size " + pct + "%";
    },
  },
  // Dhrupad once or after every verse (js/features/dhrupad-button.js)
  dhrupad: {
    once: "Dhrupad shown once",
    every: "Dhrupad after every verse",
  },
  // Settings (js/features/settings-panel.js)
  settings: {
    /** @param {string} why */
    failed: function (why) {
      return "Could not finish the change (" + why + ")";
    },
  },
  // The full-screen picture (js/features/picture-viewer.js)
  pictureViewer: {
    hint: "Pinch or double-tap to zoom",
  },
  // Offline use and Check for updates (js/features/offline.js): Settings → More → About
  offline: {
    state: { idle: "Offline ready", save: "Saving for offline…", off: "Saved copy in use" },
    update: { "": "Check for updates", busy: "Checking…", ok: "Up to date", off: "No internet" },
    usingSaved: "No internet. Using the saved copy.",
    loading: "New version, loading…",
    ready: "Ready to use offline",
  },
  // Search and Recent (js/text/search.js)
  search: {
    /** @param {string} name */
    remove: function (name) {
      return "Remove: " + name;
    },
    nothing: "Nothing found",
    /** How many lines were found; -1: 40 or more @param {number} n */
    lines: function (n) {
      return (n < 0 ? "40 or more" : n) + (n == 1 ? " result" : " results");
    },
    /** Texts and lines found @param {number} t @param {number} n the lines; -1: 40 or more */
    both: function (t, n) {
      return t + (t == 1 ? " text" : " texts") + " and " + (n < 0 ? "40 or more" : n) + (n == 1 ? " line" : " lines");
    },
    texts: "Texts",
    linesHead: "Lines",
  },
  // Share (js/features/share.js): the message for the group chat
  share: {
    tip: "\nTip: open the link and tap Add to Home Screen to keep it on your phone like an app.",
    /** @param {string} title */
    plain: function (title) {
      return title;
    },
    temple: " · Pooja 7:00–8:30 pm at Bharatiya Hindu Temple, Powell",
    /** @param {string} ang "Angaraki " or "" @param {string} date @param {string} temple the line above, or ""
     * @param {string} rise the moonrise, or "" */
    next: function (ang, date, temple, rise) {
      return ang + "Sankathara Chaturthi: " + date + temple + (rise ? " · Moonrise " + rise : "");
    },
    /** @param {string} url */
    link: function (url) {
      return "\nAartis: " + url;
    },
    copied: "Message copied",
  },
  // Print (js/features/print.js): the Print pop-up in the menu language, the printout's own words in its language
  print: {
    langs: { mr: "Marathi", kn: "Kannada", en: "English" },
    portrait: "Portrait",
    landscape: "Landscape",
    both: "Both",
    /** @param {string} l1 @param {string} l2 */
    stacked: function (l1, l2) {
      return "Portrait: " + l1 + " above " + l2;
    },
    side: "Landscape, side by side",
    preview: "Preview of the first page",
    /** @param {string} paper */
    use: function (paper) {
      return "Use " + paper;
    },
    cancel: "Cancel",
    linkCopied: "Link copied: paste it into Safari",
    pick: "Pick at least one text",
  },
};
