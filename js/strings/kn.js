// @ts-check
// The menu words in Kannada (ಕನ್ನಡ), every part's under its name, as in js/strings/en.js (js/core/strings.js).
// Digits stay as they are (1, 2, 3): Kannada menus on phones write them so.

import { DAYS, MONTHS } from "../core/words.js";

/** "1 ಪಠ್ಯ", "3 ಪಠ್ಯಗಳು" @param {number} n */
function texts(n) {
  return n + (n === 1 ? " ಪಠ್ಯ" : " ಪಠ್ಯಗಳು");
}

export default {
  // The print builder's What step: Texts, Today, Routine (js/print/what.js)
  printWhat: {
    what: "ಏನನ್ನು ಮುದ್ರಿಸಬೇಕು",
    search: "ಪಠ್ಯಗಳಲ್ಲಿ ಹುಡುಕಿ",
    all: "ಎಲ್ಲ ಪಠ್ಯಗಳು",
    selectAll: "ಎಲ್ಲವನ್ನೂ ಆರಿಸಿ",
    clear: "ತೆರವುಗೊಳಿಸಿ",
    none: "ಯಾವ ಪಠ್ಯವೂ ಹೊಂದುವುದಿಲ್ಲ",
    texts: texts,
    pick: "ಕನಿಷ್ಠ ಒಂದು ಪಠ್ಯವನ್ನು ಆರಿಸಿ",
  },
  // The session on Home: its names, how many texts it has, its end (js/features/session-card.js)
  session: {
    sessions: { morning: "ಬೆಳಿಗ್ಗೆ", afternoon: "ಮಧ್ಯಾಹ್ನ", evening: "ಸಂಜೆ" },
    kinds: { all: "ಎಲ್ಲ", pooja: "ಪೂಜೆ", bhajan: "ಭಜನೆ", aarti: "ಆರತಿ" },
    texts: texts,
    ended: "ಈ ಸಮಯ ಮುಗಿಯಿತು",
  },
  // The top bar (js/features/bars.js)
  bar: {
    /** @param {string} t */
    home: function (t) {
      return "ಮುಖಪುಟ: " + t;
    },
    find: "ಪಠ್ಯ ಅಥವಾ ಸಾಲನ್ನು ಹುಡುಕಿ",
  },
  // The bottom bar's Prev and Next (js/features/bottom-bar.js)
  bottomBar: {
    prev: "‹ ಹಿಂದೆ",
    next: "ಮುಂದೆ ›",
  },
  // A piece's fold button (js/core/apply.js)
  fold: {
    open: "ಈ ಭಾಗವನ್ನು ತೋರಿಸಿ",
    fold: "ಈ ಭಾಗವನ್ನು ಮಡಚಿ",
  },
  // The reading sheet (js/features/reading-sheet.js) and Settings → Languages (js/features/languages.js)
  languages: {
    both: "ಎರಡೂ",
    second: "+ ಎರಡನೇ ಭಾಷೆ",
    none: "ಯಾವುದೂ ಇಲ್ಲ",
    simple: "ಸರಳ",
    scholarly: "ಶಾಸ್ತ್ರೀಯ",
    refrain: "↻ ಪಲ್ಲವಿ",
    close: "ಮುಚ್ಚಿ",
    reset: "ಅಕ್ಷರದ ಗಾತ್ರ ಮರುಹೊಂದಿಸಿ",
    /** @param {string} pct */
    size: function (pct) {
      return "ಅಕ್ಷರದ ಗಾತ್ರ " + pct + "%";
    },
  },
  // Dhrupad once or after every verse (js/features/dhrupad-button.js)
  dhrupad: {
    once: "ಧ್ರುಪದ ಒಮ್ಮೆ ತೋರಿಸಲಾಗಿದೆ",
    every: "ಪ್ರತಿ ಪದ್ಯದ ನಂತರ ಧ್ರುಪದ",
  },
  // Settings (js/features/settings-panel.js)
  settings: {
    /** @param {string} why */
    failed: function (why) {
      return "ಬದಲಾವಣೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಆಗಲಿಲ್ಲ (" + why + ")";
    },
  },
  // The full-screen picture (js/features/picture-viewer.js)
  pictureViewer: {
    hint: "ಹಿಗ್ಗಿಸಲು ಎರಡು ಬೆರಳಿನಿಂದ ಅಗಲಿಸಿ ಅಥವಾ ಎರಡು ಬಾರಿ ಒತ್ತಿ",
  },
  // Offline use and Check for updates (js/features/offline.js): Settings → About
  offline: {
    state: { idle: "ಆಫ್‌ಲೈನ್‌ಗೆ ಸಿದ್ಧ", save: "ಆಫ್‌ಲೈನ್‌ಗಾಗಿ ಉಳಿಸಲಾಗುತ್ತಿದೆ…", off: "ಉಳಿಸಿದ ಪ್ರತಿ ಬಳಕೆಯಲ್ಲಿದೆ" },
    // the version line in Settings → About: what Check for updates found (under the version), and the round
    // button's name in each state
    update: {
      check: "ಅಪ್‌ಡೇಟ್‌ಗಳಿಗಾಗಿ ಪರಿಶೀಲಿಸಿ",
      busy: "ಹೊಸ ಆವೃತ್ತಿಗಾಗಿ ಹುಡುಕಲಾಗುತ್ತಿದೆ…",
      ok: "ನಿಮ್ಮಲ್ಲಿ ಇತ್ತೀಚಿನ ಆವೃತ್ತಿ ಇದೆ",
      off: "ಇಂಟರ್ನೆಟ್ ಇಲ್ಲ · ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಲು ಒತ್ತಿ",
      restart: "ಉಳಿಸಲಾಗಿದೆ. ಆ್ಯಪ್ ಮುಚ್ಚಿ ಮತ್ತೆ ತೆರೆಯಿರಿ",
      failed: "ಹೊಸ ಆವೃತ್ತಿಯನ್ನು ಉಳಿಸಲಾಗಲಿಲ್ಲ · ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಲು ಒತ್ತಿ",
    },
    button: {
      check: "ಅಪ್‌ಡೇಟ್‌ಗಳಿಗಾಗಿ ಪರಿಶೀಲಿಸಿ",
      busy: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…",
      ok: "ಮತ್ತೆ ಪರಿಶೀಲಿಸಿ",
      off: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
      restart: "ಅಪ್‌ಡೇಟ್ ಪೂರ್ಣಗೊಳಿಸುವುದು ಹೇಗೆ",
      failed: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    },
    version: "ಆವೃತ್ತಿ",
    how: "ಹೇಗೆ?",
    // How? after an update saved on Safari, iPhone or iPad: how to close the app and open it again, for each device
    finish: {
      title: "ಅಪ್‌ಡೇಟ್ ಪೂರ್ಣಗೊಳಿಸಿ",
      /** @param {string} v the new version ("1.39.3") */
      saved: function (v) {
        return "ಆವೃತ್ತಿ " + v + " ಈ ಸಾಧನದಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ";
      },
      device: "ನಿಮ್ಮ ಸಾಧನ",
      kept: "ನಿಮ್ಮ ಸೆಟ್ಟಿಂಗ್‌ಗಳು ಹಾಗೆಯೇ ಇರುತ್ತವೆ.",
      ok: "ಸರಿ",
      close: "ಮುಚ್ಚಿ",
      iphone: {
        s1: "ಪರದೆಯ ಕೆಳಗಿನಿಂದ ಮೇಲಕ್ಕೆ ಸರಿಸಿ ನಿಲ್ಲಿಸಿ",
        h1: "ತೆರೆದಿರುವ ಆ್ಯಪ್‌ಗಳು ಪಕ್ಕಪಕ್ಕದಲ್ಲಿ ಕಾಣುತ್ತವೆ.",
        s2: "ಈ ಆ್ಯಪ್ ಅನ್ನು ಮೇಲಕ್ಕೆ ಸರಿಸಿ ಮುಚ್ಚಿ",
        h2: "ಅಥವಾ ಸೈಟ್ ಅಲ್ಲಿ ತೆರೆದಿದ್ದರೆ Safari. ಏನೂ ಕಳೆದುಹೋಗುವುದಿಲ್ಲ.",
        s3: "ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ನಲ್ಲಿ ಅದರ ಐಕಾನ್ ಒತ್ತಿ",
        h3: "ಅದು ಹೊಸ ಆವೃತ್ತಿಯೊಂದಿಗೆ ತೆರೆಯುತ್ತದೆ.",
      },
      ipad: {
        s1: "ಪರದೆಯ ಕೆಳಗಿನಿಂದ ಮೇಲಕ್ಕೆ ಸರಿಸಿ ನಿಲ್ಲಿಸಿ",
        h1: "ಹೋಮ್ ಬಟನ್ ಇರುವ iPad ನಲ್ಲಿ ಅದನ್ನು ಎರಡು ಬಾರಿ ಒತ್ತಿ.",
        s2: "ಈ ಆ್ಯಪ್ ಅನ್ನು ಮೇಲಕ್ಕೆ ಸರಿಸಿ ಮುಚ್ಚಿ",
        h2: "ಅಥವಾ ಸೈಟ್ ಅಲ್ಲಿ ತೆರೆದಿದ್ದರೆ Safari. ಏನೂ ಕಳೆದುಹೋಗುವುದಿಲ್ಲ.",
        s3: "ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ನಲ್ಲಿ ಅದರ ಐಕಾನ್ ಒತ್ತಿ",
        h3: "ಅದು ಹೊಸ ಆವೃತ್ತಿಯೊಂದಿಗೆ ತೆರೆಯುತ್ತದೆ.",
      },
      mac: {
        s1: "ಮುಚ್ಚಲು ⌘Q ಒತ್ತಿ",
        h1: "Safari, ಅಥವಾ Dock ಗೆ ಸೇರಿಸಿದ್ದರೆ ಈ ಆ್ಯಪ್.",
        s2: "ಅದನ್ನು ಮತ್ತೆ ತೆರೆಯಿರಿ",
        h2: "Dock ನಿಂದ, ಅಥವಾ Safari ತೆರೆದು ಈ ಸೈಟ್.",
      },
    },
    usingSaved: "ಇಂಟರ್ನೆಟ್ ಇಲ್ಲ. ಉಳಿಸಿದ ಪ್ರತಿಯನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ.",
    loading: "ಹೊಸ ಆವೃತ್ತಿ, ತೆರೆಯುತ್ತಿದೆ…",
    notSaved: "ಹೊಸ ಆವೃತ್ತಿಯನ್ನು ಉಳಿಸಲಾಗಲಿಲ್ಲ. ಇದೇ ಆವೃತ್ತಿ ಬಳಕೆಯಲ್ಲಿರುತ್ತದೆ.",
    notSavedWhy: "ಅಪ್‌ಡೇಟ್ ಉಳಿಸಲಾಗಲಿಲ್ಲ",
    /** @param {string} v the new version ("v1.37.17") */
    reopen: function (v) {
      return "ಆವೃತ್ತಿ " + v + " ಉಳಿಸಲಾಗಿದೆ. ಪೂರ್ಣಗೊಳಿಸಲು ಆ್ಯಪ್ ಮುಚ್ಚಿ ಮತ್ತೆ ತೆರೆಯಿರಿ.";
    },
  },
  // Search and Recent (js/features/search.js)
  search: {
    /** @param {string} name */
    remove: function (name) {
      return "ತೆಗೆದುಹಾಕಿ: " + name;
    },
    nothing: "ಏನೂ ಸಿಗಲಿಲ್ಲ",
    /** @param {number} n -1: 40 or more */
    lines: function (n) {
      return (n < 0 ? "40 ಅಥವಾ ಹೆಚ್ಚು" : n) + (n == 1 ? " ಫಲಿತಾಂಶ" : " ಫಲಿತಾಂಶಗಳು");
    },
    /** @param {number} t @param {number} n the lines; -1: 40 or more */
    both: function (t, n) {
      return texts(t) + " ಮತ್ತು " + (n < 0 ? "40 ಅಥವಾ ಹೆಚ್ಚು" : n) + (n == 1 ? " ಸಾಲು" : " ಸಾಲುಗಳು");
    },
    texts: "ಪಠ್ಯಗಳು",
    linesHead: "ಸಾಲುಗಳು",
  },
  install: {
    what: "ಸಂಕಷ್ಟ ಚತುರ್ಥಿಯ ಪೂಜೆ ಮತ್ತು ಆರತಿಗಳು, ಮುಂದಿನ ದಿನಾಂಕ ಮತ್ತು ಚಂದ್ರೋದಯದೊಂದಿಗೆ. ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ ಕೆಲಸ ಮಾಡುತ್ತದೆ.",
    install: "ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ",
    installDesk: "ಈ ಕಂಪ್ಯೂಟರ್‌ನಲ್ಲಿ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ",
    oneTap: "ಒಂದೇ ಒತ್ತಿನಲ್ಲಿ ಇತರ ಆ್ಯಪ್‌ಗಳಂತೆ ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಬರುತ್ತದೆ. ಉಚಿತ: ಆ್ಯಪ್ ಸ್ಟೋರ್ ಇಲ್ಲ, ಸೈನ್-ಇನ್ ಇಲ್ಲ.",
    orMenu: "ಅಥವಾ ಬ್ರೌಸರ್‌ನ ಮೆನುವಿನಿಂದ",
    add: "ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ",
    addMac: "Dock ಗೆ ಸೇರಿಸಿ",
    steps: {
      ios26: [
        'ಕೆಳಗಿನ ವಿಳಾಸ ಪಟ್ಟಿಯಲ್ಲಿ {more} ಒತ್ತಿ (ಅಥವಾ {share} <b lang="en">Share</b> ಕಾಣಿಸಿದರೆ ಅದನ್ನು)',
        '{share} <b lang="en">Share</b> ಒತ್ತಿ',
        'ಕೆಳಗೆ ಸರಿಸಿ <b lang="en">Add to Home Screen</b> ಒತ್ತಿ (ಅಥವಾ ಮೊದಲು <b lang="en">View More</b>)',
        '<b lang="en">Open as Web App</b> ಆನ್ ಇರಲಿ, ನಂತರ <b lang="en">Add</b> ಒತ್ತಿ',
      ],
      ios: ["ಪರದೆಯ ಕೆಳಗೆ {share} ಒತ್ತಿ", 'ಕೆಳಗೆ ಸರಿಸಿ <b lang="en">Add to Home Screen</b> ಒತ್ತಿ', 'ಮೇಲೆ ಬಲಭಾಗದಲ್ಲಿ <b lang="en">Add</b> ಒತ್ತಿ'],
      ipad: ["ಮೇಲೆ ಬಲಭಾಗದಲ್ಲಿ {share} ಒತ್ತಿ", '<b lang="en">Add to Home Screen</b> ಒತ್ತಿ', '<b lang="en">Add</b> ಒತ್ತಿ'],
      iosBrowser: [
        "ಮೇಲೆ ಬಲಭಾಗದಲ್ಲಿ, ವಿಳಾಸದ ಪಕ್ಕ {share} ಒತ್ತಿ",
        '<b lang="en">Add to Home Screen</b> ಒತ್ತಿ (ಕಾಣದಿದ್ದರೆ ಕೆಳಗೆ ಸರಿಸಿ)',
        '<b lang="en">Add</b> ಒತ್ತಿ',
      ],
      android: [
        "ಮೇಲೆ ಬಲಭಾಗದಲ್ಲಿ {menu} ಒತ್ತಿ",
        '<b lang="en">Install app</b> ಅಥವಾ <b lang="en">Add to Home screen</b> ಒತ್ತಿ',
        '<b lang="en">Install</b> ಒತ್ತಿ',
      ],
      samsung: ["ಕೆಳಗೆ ಬಲಭಾಗದಲ್ಲಿ {lines} ಒತ್ತಿ", '<b lang="en">Add page to</b>, ನಂತರ <b lang="en">Home screen</b> ಒತ್ತಿ', '<b lang="en">Add</b> ಒತ್ತಿ'],
      androidFirefox: ["ಮೇಲೆ ಬಲಭಾಗದಲ್ಲಿ {menu} ಒತ್ತಿ", '<b lang="en">Add app to Home screen</b> ಒತ್ತಿ', '<b lang="en">Add</b> ಒತ್ತಿ'],
      desktop: ["ವಿಳಾಸ ಪಟ್ಟಿಯ ಬಲತುದಿಯ ಇನ್‌ಸ್ಟಾಲ್ ಚಿಹ್ನೆ ಕ್ಲಿಕ್ ಮಾಡಿ, ಅಥವಾ ಬ್ರೌಸರ್‌ನ ಮೆನು ತೆರೆಯಿರಿ", '<b lang="en">Install</b> ಕ್ಲಿಕ್ ಮಾಡಿ'],
      mac: [
        'ಮೆನು ಬಾರ್‌ನ <b lang="en">File</b> ಅಥವಾ Safari ಟೂಲ್‌ಬಾರ್‌ನ {share} ಕ್ಲಿಕ್ ಮಾಡಿ',
        '<b lang="en">Add to Dock…</b>, ನಂತರ <b lang="en">Add</b> ಕ್ಲಿಕ್ ಮಾಡಿ',
      ],
    },
    safariFirst: "ಮೊದಲು ಈ ಪುಟವನ್ನು Safari ಯಲ್ಲಿ ತೆರೆಯಿರಿ",
    safariWhy: "ಈ ಆ್ಯಪ್‌ನ ಸ್ವಂತ ಬ್ರೌಸರ್ ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಆ್ಯಪ್ ಸೇರಿಸಲಾರದು. Safari ಕೆಲವು ಒತ್ತುಗಳಲ್ಲಿ ಸೇರಿಸುತ್ತದೆ.",
    safariOld: '⋯ ಅಥವಾ ದಿಕ್ಸೂಚಿ ಚಿಹ್ನೆ ಒತ್ತಿ <b lang="en">Open in Safari</b> ಆರಿಸಿ. ಅಥವಾ ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ Safari ಯಲ್ಲಿ ಅಂಟಿಸಿ.',
    openSafari: "Safari ಯಲ್ಲಿ ತೆರೆಯಿರಿ",
    chromeFirst: "ಮೊದಲು ಈ ಪುಟವನ್ನು Chrome ನಲ್ಲಿ ತೆರೆಯಿರಿ",
    chromeWhy: "ಈ ಆ್ಯಪ್‌ನ ಸ್ವಂತ ಬ್ರೌಸರ್ ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಲಾರದು. Chrome ಒಂದೇ ಒತ್ತಿನಲ್ಲಿ ಮಾಡುತ್ತದೆ.",
    openChrome: "Chrome ನಲ್ಲಿ ತೆರೆಯಿರಿ",
    copy: "ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ",
    copied: "ಲಿಂಕ್ ಕಾಪಿ ಆಯಿತು: ಬ್ರೌಸರ್‌ನ ವಿಳಾಸ ಪಟ್ಟಿಯಲ್ಲಿ ಅಂಟಿಸಿ",
    firefox: "Firefox ಆ್ಯಪ್ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಲಾರದು. ಈ ಪುಟವನ್ನು Chrome, Edge ಅಥವಾ Safari ಯಲ್ಲಿ ತೆರೆಯಿರಿ, ಅಥವಾ ಕೆಳಗಿನ ಕೋಡ್‌ನಿಂದ ಫೋನಿಗೆ ತೆಗೆದುಕೊಳ್ಳಿ.",
    phone: "ಫೋನಿನಲ್ಲಿ ಬೇಕೇ?",
    phoneHow: "ಫೋನಿನ ಕ್ಯಾಮೆರಾವನ್ನು ಈ ಕೋಡ್‌ಗೆ ಹಿಡಿಯಿರಿ: ಆ ಫೋನಿನ ಹಂತಗಳೊಂದಿಗೆ ಇದೇ ಪುಟ ತೆರೆಯುತ್ತದೆ.",
    done: "ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಬಂದಿದೆ",
    doneHow: "ಅಲ್ಲಿಂದ ತೆರೆಯಿರಿ: ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ ಕೆಲಸ ಮಾಡುತ್ತದೆ.",
    added: "ಸೇರಿಸಿದ್ದೇನೆ",
    addedHow: "ಈಗ ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ನ ಅದರ ಚಿಹ್ನೆಯಿಂದ ತೆರೆಯಿರಿ: ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ ಕೆಲಸ ಮಾಡುತ್ತದೆ.",
    later: "ಈಗ ಬೇಡ, ಬ್ರೌಸರ್‌ನಲ್ಲೇ ಓದಿ",
    close: "ಮುಚ್ಚಿ",
  },
  // Share (js/features/share.js): the message for the group chat
  share: {
    tip: "\nಲಿಂಕ್ ತೆರೆಯಿರಿ: ಆ್ಯಪ್ ಅನ್ನು ಫೋನಿಗೆ ಹೇಗೆ ಹಾಕುವುದೆಂದು ಅಲ್ಲೇ ತೋರಿಸುತ್ತದೆ.",
    /** @param {string} title */
    plain: function (title) {
      return title;
    },
    temple: " · ಪೂಜೆ ಸಂಜೆ 7:00–8:30, ಭಾರತೀಯ ಹಿಂದೂ ದೇವಾಲಯ, ಪೊವೆಲ್",
    /** @param {string} ang @param {string} date @param {string} temple @param {string} rise */
    next: function (ang, date, temple, rise) {
      return ang + "Sankathara Chaturthi: " + date + temple + (rise ? " · ಚಂದ್ರೋದಯ " + rise : "");
    },
    /** @param {string} url */
    link: function (url) {
      return "\nಆರತಿಗಳು: " + url;
    },
    copied: "ಸಂದೇಶ ನಕಲಾಗಿದೆ",
  },
  // Print (js/features/print.js): the Print pop-up in the menu language, the printout's own words in its language
  print: {
    langs: { mr: "ಮರಾಠಿ", kn: "ಕನ್ನಡ", te: "ತೆಲುಗು", gu: "ಗುಜರಾತಿ", en: "ಇಂಗ್ಲಿಷ್" },
    portrait: "ಲಂಬ",
    landscape: "ಅಡ್ಡ",
    both: "ಎರಡೂ",
    /** @param {string} l1 @param {string} l2 */
    stacked: function (l1, l2) {
      return "ಲಂಬ: ಮೇಲೆ " + l1 + ", ಕೆಳಗೆ " + l2;
    },
    side: "ಅಡ್ಡ, ಅಕ್ಕಪಕ್ಕದಲ್ಲಿ",
    preview: "ಮೊದಲ ಪುಟದ ಮುನ್ನೋಟ",
    /** @param {string} paper */
    use: function (paper) {
      return paper + " ಬಳಸಿ";
    },
    cancel: "ರದ್ದುಮಾಡಿ",
    linkCopied: "ಲಿಂಕ್ ನಕಲಾಗಿದೆ: ಅದನ್ನು Safari ಯಲ್ಲಿ ಅಂಟಿಸಿ",
    pick: "ಕನಿಷ್ಠ ಒಂದು ಪಠ್ಯವನ್ನು ಆರಿಸಿ",
    /** @param {number} n */
    about: function (n) {
      return "ಸುಮಾರು " + n + (+n === 1 ? " ಪುಟ" : " ಪುಟಗಳು");
    },
    onceHint: "ಕಡಿಮೆ ಪುಟಗಳು: ಧ್ರುಪದ ಮೇಲೆ ಒಮ್ಮೆ.",
    /** @param {number} n */
    everyHint: function (n) {
      return +n > 0 ? "ಹಾಡುವಂತೆ: ‘ಒಮ್ಮೆ’ ಗಿಂತ ಸುಮಾರು " + n + (+n === 1 ? " ಪುಟ" : " ಪುಟಗಳು") + " ಹೆಚ್ಚು." : "ಹಾಡುವಂತೆ ಪ್ರತಿ ಪದ್ಯದ ನಂತರ ಧ್ರುಪದ.";
    },
    upHint: "ಒಂದು ಭಾಷೆಗೆ ಉತ್ತಮ: ಪುಟದಲ್ಲಿ ಹೆಚ್ಚು ಪಠ್ಯ.",
    /** @param {number} n */
    landHint: function (n) {
      return +n > 0 ? "ದೊಡ್ಡ ಸಾಲುಗಳು: ಸುಮಾರು " + n + (+n === 1 ? " ಪುಟ" : " ಪುಟಗಳು") + " ಹೆಚ್ಚು." : "ದೊಡ್ಡ, ಅಗಲವಾದ ಸಾಲುಗಳು.";
    },
    /** @param {string} l2 */
    sideHint: function (l2) {
      return "ಪ್ರತಿ ಸಾಲಿನ ಪಕ್ಕ ಅದರ " + l2 + " ಸಾಲು, ಜೊತೆಯಾಗಿ.";
    },
    // the cover and the closing page of a printout of more than one text (js/print/write.js)
    /** How many texts @param {number} n */
    texts: function (n) {
      return n + " ಪಠ್ಯಗಳು";
    },
    sources: "ಮೂಲಗಳು",
    /** The day it was printed @param {string} d */
    printed: function (d) {
      return "ಮುದ್ರಣ: " + d;
    },
  },
  // The page's own words (index.html: data-w="page.…"); {icon} is the icon written in the page
  // Go to (js/features/where.js): the top bar's title in a long text or a session, and its sheet (#goto)
  goto: {
    title: "ಇಲ್ಲಿಗೆ ಹೋಗಿ",
    here: "ನೀವು ಇಲ್ಲಿದ್ದೀರಿ",
    /** @param {string} where  the text and the places the reading is in */
    open: function (where) {
      return "ಇಲ್ಲಿಗೆ ಹೋಗಿ: " + where;
    },
    /** @param {string} name  a heading or a text of the session */
    more: function (name) {
      return name + " ಇಲ್ಲಿನ ಸ್ಥಳಗಳನ್ನು ತೋರಿಸಿ";
    },
    /** @param {string} n  the verse number typed */
    none: function (n) {
      return "ಶ್ಲೋಕ " + n + " ಇಲ್ಲಿ ಇಲ್ಲ";
    },
  },
  page: {
    appAddToHomeScreen: 'ಆ್ಯಪ್<span class="sr"> (ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ)</span>',
    share: "ಹಂಚಿಕೊಳ್ಳಿ",
    qrCode: 'QR<span class="sr"> ಕೋಡ್</span>',
    help: "ಸಹಾಯ",
    back: "ಹಿಂದೆ",
    recent: "ಇತ್ತೀಚಿನವು",
    clear: "ತೆರವುಗೊಳಿಸಿ",
    nothingFound: "ಏನೂ ಸಿಗಲಿಲ್ಲ",
    nothingHint: "ಕಡಿಮೆ ಅಕ್ಷರಗಳು ಅಥವಾ ಬೇರೆ ಕಾಗುಣಿತ ಪ್ರಯತ್ನಿಸಿ. ಮರಾಠಿ ಮತ್ತು ಇಂಗ್ಲಿಷ್ ಅಕ್ಷರಗಳು ಎರಡೂ ನಡೆಯುತ್ತವೆ.",
    reading: "ಓದು",
    goTo: "ಇಲ್ಲಿಗೆ ಹೋಗಿ",
    verseNumber: "ಶ್ಲೋಕ ಸಂಖ್ಯೆ",
    go: "ಹೋಗಿ",
    screen: "ಪರದೆ",
    more: "ಇನ್ನಷ್ಟು",
    preview: "ಮುನ್ನೋಟ",
    languageAndText: "ಭಾಷೆ ಮತ್ತು ಪಠ್ಯ",
    mainLanguage: "ಮುಖ್ಯ ಭಾಷೆ",
    largeText: "ದೊಡ್ಡ ಅಕ್ಷರ",
    secondLanguage: "ಎರಡನೇ ಭಾಷೆ",
    smallerUnderEachLine: "ಚಿಕ್ಕದಾಗಿ, ಪ್ರತಿ ಸಾಲಿನ ಕೆಳಗೆ",
    show: "ತೋರಿಸಿ",
    textSize: "ಅಕ್ಷರದ ಗಾತ್ರ",
    textFont: "ಅಕ್ಷರಶೈಲಿ",
    traditional: "ಸಾಂಪ್ರದಾಯಿಕ",
    modern: "ಆಧುನಿಕ",
    bold: "ದಪ್ಪ",
    dhrupad: "ಧ್ರುಪದ",
    once: "ಒಮ್ಮೆ",
    everyVerse: "ಪ್ರತಿ ಪದ್ಯ",
    layout: "ವಿನ್ಯಾಸ",
    n1Column: "1 ಕಾಲಮ್",
    n2Columns: "2 ಕಾಲಮ್‌ಗಳು",
    menusAndButtons: "ಮೆನುಗಳು ಮತ್ತು ಬಟನ್‌ಗಳು",
    theme: "ಥೀಮ್",
    auto: "ಸ್ವಯಂ",
    light: "ತಿಳಿ",
    sepia: "ಸೆಪಿಯಾ",
    dark: "ಗಾಢ",
    highContrast: "ಹೆಚ್ಚಿನ ಕಾಂಟ್ರಾಸ್ಟ್",
    keepScreenOn: "ಪರದೆ ಆನ್ ಇರಲಿ",
    afterLastTouch: "ಕೊನೆಯ ಸ್ಪರ್ಶದ ನಂತರ, ನಿಮಿಷಗಳು",
    off: "ಆಫ್",
    about: "ಕುರಿತು",
    contact: "ಸಂಪರ್ಕ",
    termsOfUse: "ಬಳಕೆಯ ನಿಯಮಗಳು",
    helpAndHowToUse: "ಸಹಾಯ ಮತ್ತು ಬಳಸುವ ವಿಧಾನ",
    addToHomeScreen: "ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ",
    sankatharaChaturthi: "ಸಂಕಟಹರ ಚತುರ್ಥಿ",
    scanWithTheCameraTo: "ತೆರೆಯಲು ಕ್ಯಾಮೆರಾದಿಂದ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ",
    close: "ಮುಚ್ಚಿ",
    whatToPrint: "‹ ಏನನ್ನು ಮುದ್ರಿಸಬೇಕು",
    printPdf: "ಮುದ್ರಿಸಿ / PDF",
    whatToPrint2: "ಏನನ್ನು ಮುದ್ರಿಸಬೇಕು",
    howToPrint: "ಹೇಗೆ ಮುದ್ರಿಸಬೇಕು",
    language: "ಭಾಷೆ",
    dhrupad2: 'ಧ್ರುಪದ (<span lang="mr">धृ</span>)',
    once2: "ಒಮ್ಮೆ",
    page: "ಪುಟ",
    printFont: "ಮುದ್ರಣದ ಅಕ್ಷರಶೈಲಿ",
    everyTextStartsOnA: 'ದೀರ್ಘ ಪಠ್ಯಗಳು ಹೊಸ ಪುಟದಲ್ಲಿ ಆರಂಭವಾಗುತ್ತವೆ; ಚಿಕ್ಕವು ಅದೇ ಪುಟದಲ್ಲಿ ಮುಂದುವರಿಯುತ್ತವೆ. ಕಾಗದ: <b class="prpaper">Letter</b>',
    coverAndClosingPage: "ಮುಖಪುಟ ಮತ್ತು ಕೊನೆಯ ಪುಟ",
    forLandscapePickItIn: "ಅಡ್ಡ ಮುದ್ರಣಕ್ಕೆ, Safari ಯ ಸಂವಾದದಲ್ಲೂ ಅದನ್ನೇ ಆರಿಸಿ.",
    pickA4PaperInSafari: 'Safari ಯ ಸಂವಾದದಲ್ಲೂ <span class="przp">A4</span> ಕಾಗದವನ್ನು ಆರಿಸಿ.',
    chromePrintsItBest: "Chrome ಇದನ್ನು ಪುಟ ಸಂಖ್ಯೆಗಳೊಂದಿಗೆ ಅತ್ಯುತ್ತಮವಾಗಿ ಮುದ್ರಿಸುತ್ತದೆ.",
    safariPrintsSmaller: "Safari ಸ್ವಲ್ಪ ಚಿಕ್ಕದಾಗಿ, ಪುಟ ಸಂಖ್ಯೆಗಳಿಲ್ಲದೆ ಮುದ್ರಿಸುತ್ತದೆ.",
    recommended: "ಶಿಫಾರಸು",
    readyPrintNow: "ಸಿದ್ಧ: ಈಗ ಮುದ್ರಿಸಿ",
    openInSafari: "Safari ಯಲ್ಲಿ ತೆರೆಯಿರಿ",
    copyLink: "ಲಿಂಕ್ ನಕಲಿಸಿ",
    printingDoesNotOpenFrom:
      "iPhone ನಲ್ಲಿ ಹೋಮ್ ಸ್ಕ್ರೀನ್ ಆ್ಯಪ್‌ನಿಂದ ಮುದ್ರಣ ತೆರೆಯುವುದಿಲ್ಲ. <b>Safari ಯಲ್ಲಿ ತೆರೆಯಿರಿ</b> ಒತ್ತಿ: ನಿಮ್ಮ ಆಯ್ಕೆಗಳು ಜೊತೆಗೆ ಹೋಗುತ್ತವೆ ಮತ್ತು ಮುದ್ರಣ ಅಲ್ಲಿ ಸಿದ್ಧವಾಗುತ್ತದೆ. Safari ತೆರೆಯದಿದ್ದರೆ, ಲಿಂಕ್ ನಕಲಿಸಿ Safari ಯಲ್ಲಿ ಅಂಟಿಸಿ.",
    thisBrowserDidNotOpen:
      'ಈ ಬ್ರೌಸರ್ ಮುದ್ರಣ ಸಂವಾದವನ್ನು ತೆರೆಯಲಿಲ್ಲ. ಬ್ರೌಸರ್‌ನ <b lang="en">Share</b> ಬಟನ್ ಒತ್ತಿ <b lang="en">Print</b> ಆರಿಸಿ. ಈ ಪುಟ ಬೇರೆ ಆ್ಯಪ್‌ನೊಳಗೆ ತೆರೆದಿದ್ದರೆ, <b>Safari ಯಲ್ಲಿ ತೆರೆಯಿರಿ</b> ಒತ್ತಿ: ನಿಮ್ಮ ಆಯ್ಕೆಗಳು ಜೊತೆಗೆ ಹೋಗುತ್ತವೆ.',
    nextHowToPrint: "ಮುಂದೆ: ಹೇಗೆ ಮುದ್ರಿಸಬೇಕು ›",
    print: "ಮುದ್ರಿಸಿ",
    home: "ಮುಖಪುಟ",
    library: "ಸಂಗ್ರಹ",
    smaller: " ಚಿಕ್ಕದು",
    larger: " ದೊಡ್ಡದು",
    allSettings: "ಎಲ್ಲ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    fontThemeLayout: "ಅಕ್ಷರಶೈಲಿ, ಥೀಮ್, ವಿನ್ಯಾಸ",
    defaultSize: "↺ ಮೂಲ ಗಾತ್ರ",
  },
  // The launch animation (js/features/launch.js): the first opening of the day
  launch: {
    skip: "ಮುಂದೆ ಹೋಗಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
  },
  // The language's own name, in its own letters: Settings → Menus and buttons (js/features/settings-panel.js)
  language: {
    name: "ಕನ್ನಡ",
  },
  // The Sankashti line on Home, its place and its dates (js/features/sankashti.js)
  sankashti: {
    /** @param {number} wd @param {number} d @param {number} m @param {number} y */
    day: function (wd, d, m, y) {
      return DAYS.kn[wd] + ", " + d + " " + MONTHS.kn[m] + (y ? " " + y : "");
    },
    /** @param {number} h @param {string} mi */
    time: function (h, mi) {
      return (h >= 20 || h < 4 ? "ರಾತ್ರಿ " : h >= 16 ? "ಸಂಜೆ " : "") + (((h + 11) % 12) + 1) + ":" + mi;
    },
    late: " (ಮಧ್ಯರಾತ್ರಿಯ ನಂತರ)",
    yourPlace: "ನಿಮ್ಮ ಸ್ಥಳ",
    /** @param {string} place */
    near: function (place) {
      return place + " ಹತ್ತಿರ";
    },
    noGeo: "ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಸ್ಥಳ ಲಭ್ಯವಿಲ್ಲ",
    noPlace: "ನಿಮ್ಮ ಸ್ಥಳ ಸಿಗಲಿಲ್ಲ",
  },
  welcome: {
    title: "ಸಂಕಟಹರ ಚತುರ್ಥಿಗೆ ಸ್ವಾಗತ",
    app: "ಸಂಕಟಹರ ಚತುರ್ಥಿ",
    points: ["ಮುಂದಿನ ಸಂಕಷ್ಟಿ ಚತುರ್ಥಿ ಮತ್ತು ಮುಂದಿನ ಎಲ್ಲ ದಿನಾಂಕಗಳು", "ಉಪವಾಸ ಮುಗಿಸಲು ನಿಮ್ಮ ಊರಿನ ಚಂದ್ರೋದಯ", "ಸಂಜೆಯ ಪಠ್ಯಗಳು: ಅಥರ್ವಶೀರ್ಷ, ಸ್ತೋತ್ರಗಳು ಮತ್ತು ಆರತಿಗಳು"],
    facts: ["ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ ಕೆಲಸ ಮಾಡುತ್ತದೆ", "ಮಾಹಿತಿ ನಿಮ್ಮ ಫೋನಿನಲ್ಲೇ ಇರುತ್ತದೆ", "ಖಾತೆ ತೆರೆಯುವ ಅಗತ್ಯವಿಲ್ಲ"],
    first: "ಪಠ್ಯ",
    second: "ಮತ್ತು ಇಂಗ್ಲಿಷ್",
    next: "ಮುಂದೆ",
    back: "ಹಿಂದೆ",
    place: "ಇದು ನಿಮ್ಮ ಊರೇ?",
    placeNote: "ಉಪವಾಸ ಮುಗಿಸುವ ಸಮಯ, ಅಂದರೆ ಚಂದ್ರೋದಯ, ನೀವು ಎಲ್ಲಿದ್ದೀರಿ ಎಂಬುದನ್ನು ಅವಲಂಬಿಸಿದೆ. ನಿಮ್ಮ ಫೋನಿನ ಸಮಯ ವಲಯದಿಂದ ಊಹಿಸಲಾಗಿದೆ.",
    noPlace: "ಇನ್ನೂ ಊರು ಆರಿಸಿಲ್ಲ: ಕೆಳಗಿನಿಂದ ಆರಿಸಿ.",
    /** The next date and its moonrise, as the card writes them @param {string} day @param {string} time */
    nextLine: function (day, time) {
      return "ಮುಂದಿನ ಚತುರ್ಥಿ: " + day + " · ಚಂದ್ರೋದಯ " + time;
    },
    mine: "ನನ್ನ ನಿಖರ ಸ್ಥಳ ಬಳಸಿ",
    mineNote: "ಹೆಚ್ಚು ನಿಖರ ಚಂದ್ರೋದಯ. ಫೋನ್ ಒಮ್ಮೆ ಮಾತ್ರ ಕೇಳುತ್ತದೆ.",
    city: "ಅಥವಾ ನಗರ ಆರಿಸಿ",
    change: "ಯಾವಾಗ ಬೇಕಾದರೂ ಬದಲಿಸಿ",
    changeTip: "ನಿಖರ ಸ್ಥಳ ಬಳಸಲು ಚತುರ್ಥಿ ಕಾರ್ಡ್‌ನಲ್ಲಿರುವ ಊರನ್ನು ಒತ್ತಿ.",
    start: "ಹೌದು, ಪ್ರಾರಂಭಿಸಿ",
  },
  // The Sankathara card on Home (js/features/date-card.js)
  card: {
    next: "ಮುಂದಿನ ಸಂಕಟಹರ ಚತುರ್ಥಿ",
    useLocation: "ದಿನಾಂಕ ಮತ್ತು ಚಂದ್ರೋದಯ ತೋರಿಸಲು ನನ್ನ ಸ್ಥಳ ಬಳಸಿ",
    heads: {
      today: "ಇಂದು ಸಂಕಟಹರ ಚತುರ್ಥಿ",
      tomorrow: "ನಾಳೆ ಸಂಕಟಹರ ಚತುರ್ಥಿ",
      next: "ಮುಂದಿನ ಚತುರ್ಥಿ",
      previous: "ಹಿಂದಿನ ಸಂಕಟಹರ ಚತುರ್ಥಿ",
      upcoming: "ಮುಂಬರುವ ಸಂಕಟಹರ ಚತುರ್ಥಿ",
    },
    /** @param {string} t */
    angaraki: function (t) {
      return t.indexOf("ಸಂಕಟಹರ") >= 0 ? t.replace("ಸಂಕಟಹರ", "ಅಂಗಾರಕ ಸಂಕಟಹರ") : t.replace("ಚತುರ್ಥಿ", "ಅಂಗಾರಕ ಚತುರ್ಥಿ");
    },
    /** @param {string} date */
    today: function (date) {
      return "ಇಂದು: " + date;
    },
    /** @param {number} wd @param {number} d @param {number} m @param {number} y */
    fullDate: function (wd, d, m, y) {
      return DAYS.kn[wd] + ", " + d + " " + MONTHS.kn[m] + " " + y;
    },
    monthsShort: MONTHS.kn,
    /** @param {number} d @param {number} m @param {number} y @param {number} wd */
    chip: function (d, m, y, wd) {
      return d + " " + MONTHS.kn[m] + " " + y + ", " + DAYS.kn[wd];
    },
    chipAng: ", ಅಂಗಾರಕ",
    more: "ಇನ್ನಷ್ಟು ದಿನಾಂಕಗಳು",
    dates: "ಸಂಕಟಹರ ಚತುರ್ಥಿಯ ದಿನಾಂಕಗಳು",
    back: "↩ ಮುಂದಿನ ದಿನಾಂಕ",
    addAll: "ಎಲ್ಲವನ್ನೂ ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ",
    older: "‹ ಕಳೆದ ವರ್ಷದ ದಿನಾಂಕಗಳು",
    addOne: "ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ",
    // the count under the card's ring (js/features/date-card.js): how far the date shown is from today
    /** @param {number} n */
    ringDays: function (n) {
      return n + " ದಿನ";
    },
    ringToday: "ಇಂದು",
    ringTomorrow: "ನಾಳೆ",
    /** @param {number} n */
    ringAgo: function (n) {
      return n === 1 ? "ನಿನ್ನೆ" : n + " ದಿನಗಳ ಹಿಂದೆ";
    },
    /** @param {number} n */
    inDays: function (n) {
      return n + " ದಿನಗಳಲ್ಲಿ";
    },
    /** @param {string} time */
    moonrise: function (time) {
      return "ಚಂದ್ರೋದಯ " + time;
    },
    useMy: "ನನ್ನ ಸ್ಥಳ ಬಳಸಿ",
    updateMy: "ನನ್ನ ಸ್ಥಳವನ್ನು ನವೀಕರಿಸಿ",
    open: "ಕಾರ್ಡ್ ತೆರೆಯಿರಿ",
    fold: "ಕಾರ್ಡ್ ಮಡಚಿ",
    /** the time left before the moonrise, in the moonrise chip on the day @param {number} h @param {number} m */
    moonLeft: function (h, m) {
      return (h > 0 ? h + " ಗಂ " : "") + m + " ನಿಮಿಷದಲ್ಲಿ";
    },
    downloadedOne: "ಕ್ಯಾಲೆಂಡರ್ ಫೈಲ್ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ; ಘಟನೆಯನ್ನು ಸೇರಿಸಲು ಅದನ್ನು ತೆರೆಯಿರಿ",
    downloadedAll: "ಕ್ಯಾಲೆಂಡರ್ ಫೈಲ್ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ; ಘಟನೆಗಳನ್ನು ಸೇರಿಸಲು ಅದನ್ನು ತೆರೆಯಿರಿ",
  },
  // Wikipedia, named for screen readers (js/core/wiki.js wikiLabel)
  wiki: {
    mr: "ಮರಾಠಿ ವಿಕಿಪೀಡಿಯ",
    hi: "ಹಿಂದಿ ವಿಕಿಪೀಡಿಯ",
    en: "ಇಂಗ್ಲಿಷ್ ವಿಕಿಪೀಡಿಯ",
    kn: "ವಿಕಿಪೀಡಿಯ",
    te: "ತೆಲುಗು ವಿಕಿಪೀಡಿಯ",
    gu: "ಗುಜರಾತಿ ವಿಕಿಪೀಡಿಯ",
    tab: "ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆಯುತ್ತದೆ",
  },
  // The words the site adds to a text (js/strings/en.js)
  text: {
    refrainWord: "ಧ್ರುಪದ",
    refrainHow: "(ಪ್ರತಿ ಚರಣದ ನಂತರ ಹೇಳಿ)",
    version: "ಪಾಠಭೇದ",
    refrainNote: "↻ ಧ್ರುಪದ",
    prev: "ಹಿಂದಿನ",
    next: "ಮುಂದಿನ",
    by: "ರಚನೆ :",
    // a name in a sentence, at {name}, so each language puts it where it goes
    attributed: "{name} ಅವರದೆಂದು ಹೇಳಲಾಗುತ್ತದೆ",
    also: "(ಇವರದೆಂದೂ ಹೇಳಲಾಗುತ್ತದೆ : {name})",
    compiledBy: "ಸಂಕಲನ :",
    traditional: "ಸಾಂಪ್ರದಾಯಿಕ",
    lang: { sa: "ಸಂಸ್ಕೃತ", mr: "ಮರಾಠಿ", hi: "ಹಿಂದಿ" },
  },
};
