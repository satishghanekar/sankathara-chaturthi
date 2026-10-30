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
  // Offline use and Check for updates (js/features/offline.js): Settings → More → About
  offline: {
    state: { idle: "ಆಫ್‌ಲೈನ್‌ಗೆ ಸಿದ್ಧ", save: "ಆಫ್‌ಲೈನ್‌ಗಾಗಿ ಉಳಿಸಲಾಗುತ್ತಿದೆ…", off: "ಉಳಿಸಿದ ಪ್ರತಿ ಬಳಕೆಯಲ್ಲಿದೆ" },
    update: {
      check: "ಅಪ್‌ಡೇಟ್‌ಗಳಿಗಾಗಿ ಪರಿಶೀಲಿಸಿ",
      busy: "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…",
      ok: "ಇತ್ತೀಚಿನ ಆವೃತ್ತಿ",
      off: "ಇಂಟರ್ನೆಟ್ ಇಲ್ಲ",
      restart: "ಮುಚ್ಚಿ ಮತ್ತೆ ತೆರೆಯಿರಿ",
    },
    usingSaved: "ಇಂಟರ್ನೆಟ್ ಇಲ್ಲ. ಉಳಿಸಿದ ಪ್ರತಿಯನ್ನು ಬಳಸಲಾಗುತ್ತಿದೆ.",
    loading: "ಹೊಸ ಆವೃತ್ತಿ, ತೆರೆಯುತ್ತಿದೆ…",
    /** @param {string} v the new version ("v1.37.17") */
    reopen: function (v) {
      return "ಆವೃತ್ತಿ " + v + " ಉಳಿಸಲಾಗಿದೆ. ಪೂರ್ಣಗೊಳಿಸಲು ಆ್ಯಪ್ ಮುಚ್ಚಿ ಮತ್ತೆ ತೆರೆಯಿರಿ.";
    },
  },
  // Search and Recent (js/text/search.js)
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
  // Share (js/features/share.js): the message for the group chat
  share: {
    tip: "\nಸಲಹೆ: ಫೋನಿನಲ್ಲಿ ಆ್ಯಪ್‌ನಂತೆ ಇಟ್ಟುಕೊಳ್ಳಲು ಲಿಂಕ್ ತೆರೆದು Add to Home Screen ಒತ್ತಿ.",
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
  },
  // The page's own words (index.html: data-w="page.…"); {icon} is the icon written in the page
  page: {
    appAddToHomeScreen: 'ಆ್ಯಪ್<span class="sr"> (ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ)</span>',
    share: "ಹಂಚಿಕೊಳ್ಳಿ",
    qrCode: 'QR<span class="sr"> ಕೋಡ್</span>',
    help: "ಸಹಾಯ",
    back: "ಹಿಂದೆ",
    recent: "ಇತ್ತೀಚಿನವು",
    clear: "ತೆರವುಗೊಳಿಸಿ",
    nothingFound: "ಏನೂ ಸಿಗಲಿಲ್ಲ",
    reading: "ಓದು",
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
    standard: "ಸಾಮಾನ್ಯ",
    classic: "ಸಾಂಪ್ರದಾಯಿಕ",
    handwritten: "ಕೈಬರಹ",
    verses: "ಪದ್ಯಗಳು",
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
    everyTextStartsOnA: 'ಪ್ರತಿ ಪಠ್ಯ ಹೊಸ ಪುಟದಲ್ಲಿ ಆರಂಭವಾಗುತ್ತದೆ. ಕಾಗದ: <b class="prpaper">Letter</b>',
    forLandscapePickItIn: "ಅಡ್ಡ ಮುದ್ರಣಕ್ಕೆ, Safari ಯ ಸಂವಾದದಲ್ಲೂ ಅದನ್ನೇ ಆರಿಸಿ.",
    pickA4PaperInSafari: 'Safari ಯ ಸಂವಾದದಲ್ಲೂ <span class="przp">A4</span> ಕಾಗದವನ್ನು ಆರಿಸಿ.',
    chromePrintsItBest: "Chrome ಇದನ್ನು ಅತ್ಯುತ್ತಮವಾಗಿ ಮುದ್ರಿಸುತ್ತದೆ.",
    readyPrintNow: "ಸಿದ್ಧ: ಈಗ ಮುದ್ರಿಸಿ",
    openInSafari: "Safari ಯಲ್ಲಿ ತೆರೆಯಿರಿ",
    copyLink: "ಲಿಂಕ್ ನಕಲಿಸಿ",
    printingDoesNotOpenFrom:
      "iPhone ನಲ್ಲಿ ಹೋಮ್ ಸ್ಕ್ರೀನ್ ಆ್ಯಪ್‌ನಿಂದ ಮುದ್ರಣ ತೆರೆಯುವುದಿಲ್ಲ. <b>Safari ಯಲ್ಲಿ ತೆರೆಯಿರಿ</b> ಒತ್ತಿ: ನಿಮ್ಮ ಆಯ್ಕೆಗಳು ಜೊತೆಗೆ ಹೋಗುತ್ತವೆ ಮತ್ತು ಮುದ್ರಣ ಅಲ್ಲಿ ಸಿದ್ಧವಾಗುತ್ತದೆ. Safari ತೆರೆಯದಿದ್ದರೆ, ಲಿಂಕ್ ನಕಲಿಸಿ Safari ಯಲ್ಲಿ ಅಂಟಿಸಿ.",
    thisBrowserDidNotOpen:
      'ಈ ಬ್ರೌಸರ್ ಮುದ್ರಣ ಸಂವಾದವನ್ನು ತೆರೆಯಲಿಲ್ಲ. ಬ್ರೌಸರ್‌ನ <b lang="en">Share</b> ಬಟನ್ ಒತ್ತಿ <b lang="en">Print</b> ಆರಿಸಿ. ಈ ಪುಟ ಬೇರೆ ಆ್ಯಪ್‌ನೊಳಗೆ ತೆರೆದಿದ್ದರೆ, <b>Safari ಯಲ್ಲಿ ತೆರೆಯಿರಿ</b> ಒತ್ತಿ: ನಿಮ್ಮ ಆಯ್ಕೆಗಳು ಜೊತೆಗೆ ಹೋಗುತ್ತವೆ.',
    nextHowToPrint: "ಮುಂದೆ: ಹೇಗೆ ಮುದ್ರಿಸಬೇಕು ›",
    print: "ಮುದ್ರಿಸಿ",
    addToHomeScreen2: "ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ",
    tapTheShareButtonAt: '<b lang="en">Share</b> ಬಟನ್ {icon} ಒತ್ತಿ (Safari ಯಲ್ಲಿ ಕೆಳಗೆ, Chrome ನಲ್ಲಿ ಮೇಲೆ ಬಲಕ್ಕೆ).',
    scrollDownAndTapAdd: 'ಕೆಳಗೆ ಸರಿಸಿ <b lang="en">Add to Home Screen</b> ಒತ್ತಿ.',
    tapAdd: '<b lang="en">Add</b> ಒತ್ತಿ.',
    openThisPageInSafari: 'ಈ ಪುಟವನ್ನು <b lang="en">Safari</b> ಅಥವಾ <b lang="en">Chrome</b> ನಲ್ಲಿ ತೆರೆಯಿರಿ (⋯ ಅಥವಾ Share → Open in Safari/Chrome).',
    thenShareAddToHome: 'ನಂತರ Share {icon} → <b lang="en">Add to Home Screen</b> → <b lang="en">Add</b>.',
    openChromeSMenuTop: "Chrome ನ <b>⋮</b> ಮೆನು ತೆರೆಯಿರಿ (ಮೇಲೆ ಬಲಕ್ಕೆ).",
    tapAddToHomeScreen: '<b lang="en">Add to Home screen</b> ಅಥವಾ <b lang="en">Install app</b> ಒತ್ತಿ.',
    tapInstallOrAdd: '<b lang="en">Install</b> ಅಥವಾ <b lang="en">Add</b> ಒತ್ತಿ.',
    clickTheInstallIconAt: 'ವಿಳಾಸ ಪಟ್ಟಿಯ ಬಲ ತುದಿಯಲ್ಲಿರುವ ಇನ್‌ಸ್ಟಾಲ್ ಐಕಾನ್ ಕ್ಲಿಕ್ ಮಾಡಿ, ಅಥವಾ ಬ್ರೌಸರ್ ಮೆನುವಿನಿಂದ <b lang="en">Install</b> ಆರಿಸಿ.',
    clickTheShareButtonIn: 'Safari ಯ ಟೂಲ್‌ಬಾರ್‌ನಲ್ಲಿ <b lang="en">Share</b> ಬಟನ್ {icon} ಕ್ಲಿಕ್ ಮಾಡಿ, ಅಥವಾ <b lang="en">File</b> ಮೆನು ತೆರೆಯಿರಿ.',
    chooseAddToDockThen: '<b lang="en">Add to Dock</b> ಆರಿಸಿ, ನಂತರ <b lang="en">Add</b> ಕ್ಲಿಕ್ ಮಾಡಿ.',
    firefoxCanTAddThis: "Firefox ಈ ತಾಣವನ್ನು ಆ್ಯಪ್ ಆಗಿ ಸೇರಿಸಲಾರದು. ಈ ಪುಟವನ್ನು Chrome, Edge ಅಥವಾ Safari ಯಲ್ಲಿ ತೆರೆದು ಮತ್ತೆ ಈ ಬಟನ್ ಒತ್ತಿ.",
    itWillThenOpenLike: "ನಂತರ ಇದು ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದಿದ್ದರೂ ಆ್ಯಪ್‌ನಂತೆ ತೆರೆಯುತ್ತದೆ.",
    ok: "ಸರಿ",
    home: "ಮುಖಪುಟ",
    library: "ಸಂಗ್ರಹ",
    smaller: " ಚಿಕ್ಕದು",
    larger: " ದೊಡ್ಡದು",
    allSettings: "ಎಲ್ಲ ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    fontThemeLayout: "ಅಕ್ಷರಶೈಲಿ, ಥೀಮ್, ವಿನ್ಯಾಸ",
    defaultSize: "↺ ಮೂಲ ಗಾತ್ರ",
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
    back: "↩ ಮುಂದಿನ ಸಂಕಟಹರ ಚತುರ್ಥಿಗೆ ಹಿಂತಿರುಗಿ",
    addAll: "ಮುಂಬರುವ ಎಲ್ಲ ದಿನಾಂಕಗಳನ್ನು ಕ್ಯಾಲೆಂಡರ್‌ಗೆ ಸೇರಿಸಿ",
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
    folded: "ಕಾರ್ಡ್ ಮಡಚಲಾಗಿದೆ · ತೆರೆಯಲು ಅದರ ಸಾಲನ್ನು ಒತ್ತಿ",
    /** the time left before the moonrise, in the moonrise chip on the day @param {number} h @param {number} m */
    moonLeft: function (h, m) {
      return (h > 0 ? h + " ಗಂ " : "") + m + " ನಿಮಿಷದಲ್ಲಿ";
    },
    downloadedOne: "ಕ್ಯಾಲೆಂಡರ್ ಫೈಲ್ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ; ಘಟನೆಯನ್ನು ಸೇರಿಸಲು ಅದನ್ನು ತೆರೆಯಿರಿ",
    downloadedAll: "ಕ್ಯಾಲೆಂಡರ್ ಫೈಲ್ ಡೌನ್‌ಲೋಡ್ ಆಗಿದೆ; ಘಟನೆಗಳನ್ನು ಸೇರಿಸಲು ಅದನ್ನು ತೆರೆಯಿರಿ",
  },
};
