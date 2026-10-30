// @ts-check
// The menu words in English, every part's under its name (js/core/strings.js menuWords()). English is the complete
// set: another language's file has the same words, and a word it lacks is taken from here.

import { DAYS, MONTHS } from "../core/words.js";

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
  // The session on Home: its names, how many texts it has, its end (js/features/session-card.js)
  session: {
    sessions: { morning: "Morning", afternoon: "Afternoon", evening: "Evening" },
    /** @param {number} n */
    texts: function (n) {
      return n + (n === 1 ? " text" : " texts");
    },
    ended: "End of the session",
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
    update: { check: "Check for updates", busy: "Checking…", ok: "Up to date", off: "No internet", restart: "Close and reopen" },
    usingSaved: "No internet. Using the saved copy.",
    loading: "New version, loading…",
    ready: "Ready to use offline",
    /** @param {string} v the new version ("v1.37.17") */
    reopen: function (v) {
      return "Updated to " + v + ". Close the app and open it again to finish.";
    },
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
    langs: { mr: "Marathi", kn: "Kannada", te: "Telugu", gu: "Gujarati", en: "English" },
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
  // The page's own words (index.html: data-w="page.…", filled by fillWords(), js/core/strings.js); {icon} is the
  // icon written in the page, kept where each language puts it
  page: {
    appAddToHomeScreen: 'App<span class="sr"> (add to Home Screen)</span>',
    share: "Share",
    qrCode: 'QR<span class="sr"> code</span>',
    help: "Help",
    back: "Back",
    recent: "Recent",
    clear: "Clear",
    nothingFound: "Nothing found",
    reading: "Reading",
    screen: "Screen",
    more: "More",
    preview: "Preview",
    languageAndText: "Language and text",
    mainLanguage: "Main language",
    largeText: "Large text",
    secondLanguage: "Second language",
    smallerUnderEachLine: "Smaller, under each line",
    show: "Show",
    textSize: "Text size",
    textFont: "Text font",
    standard: "Standard",
    classic: "Classic",
    handwritten: "Handwritten",
    verses: "Verses",
    dhrupad: "Dhrupad",
    once: "Once",
    everyVerse: "Every verse",
    layout: "Layout",
    n1Column: "1 column",
    n2Columns: "2 columns",
    menusAndButtons: "Menus and buttons",
    theme: "Theme",
    auto: "Auto",
    light: "Light",
    sepia: "Sepia",
    dark: "Dark",
    highContrast: "High contrast",
    keepScreenOn: "Keep screen on",
    afterLastTouch: "Minutes after the last touch",
    off: "Off",
    about: "About",
    helpAndHowToUse: "Help and how to use",
    addToHomeScreen: "Add to Home Screen",
    sankatharaChaturthi: "Sankathara Chaturthi",
    scanWithTheCameraTo: "Scan with the camera to open",
    close: "Close",
    whatToPrint: "‹ What to print",
    printPdf: "Print / PDF",
    whatToPrint2: "What to print",
    howToPrint: "How to print",
    language: "Language",
    dhrupad2: 'Dhrupad (<span lang="mr">धृ</span>)',
    once2: "Once",
    page: "Page",
    printFont: "Print font",
    everyTextStartsOnA: 'Every text starts on a new page. Paper: <b class="prpaper">Letter</b>',
    forLandscapePickItIn: "For Landscape, pick it in Safari's dialog too.",
    pickA4PaperInSafari: 'Pick <span class="przp">A4</span> paper in Safari\'s dialog too.',
    chromePrintsItBest: "Chrome prints it best.",
    readyPrintNow: "Ready: Print now",
    openInSafari: "Open in Safari",
    copyLink: "Copy link",
    printingDoesNotOpenFrom:
      "Printing does not open from the Home Screen app on iPhone. Tap <b>Open in Safari</b>: your choices go with it and the printout is made ready there. If Safari does not open, copy the link and paste it into Safari.",
    thisBrowserDidNotOpen:
      "This browser did not open the print dialog. Tap the browser's <b>Share</b> button and choose <b>Print</b>. If this page opened inside another app, tap <b>Open in Safari</b>: your choices go with it.",
    nextHowToPrint: "Next: how to print ›",
    print: "Print",
    addToHomeScreen2: "Add to Home Screen",
    tapTheShareButtonAt: 'Tap the <b lang="en">Share</b> button {icon} (at the bottom in Safari, top right in Chrome).',
    scrollDownAndTapAdd: 'Scroll down and tap <b lang="en">Add to Home Screen</b>.',
    tapAdd: 'Tap <b lang="en">Add</b>.',
    openThisPageInSafari: 'Open this page in <b lang="en">Safari</b> or <b lang="en">Chrome</b> (⋯ or Share → Open in Safari/Chrome).',
    thenShareAddToHome: 'Then Share {icon} → <b lang="en">Add to Home Screen</b> → <b lang="en">Add</b>.',
    openChromeSMenuTop: "Open Chrome's <b>⋮</b> menu (top right).",
    tapAddToHomeScreen: 'Tap <b lang="en">Add to Home screen</b> or <b lang="en">Install app</b>.',
    tapInstallOrAdd: 'Tap <b lang="en">Install</b> or <b lang="en">Add</b>.',
    clickTheInstallIconAt: 'Click the install icon at the right end of the address bar, or choose <b lang="en">Install</b> from the browser menu.',
    clickTheShareButtonIn: 'Click the <b lang="en">Share</b> button {icon} in Safari\'s toolbar, or open the <b lang="en">File</b> menu.',
    chooseAddToDockThen: 'Choose <b lang="en">Add to Dock</b>, then click <b lang="en">Add</b>.',
    firefoxCanTAddThis: "Firefox can't add this site as an app. Open this page in Chrome, Edge or Safari and tap this button again.",
    itWillThenOpenLike: "It will then open like an app, even without internet.",
    ok: "OK",
    home: "Home",
    library: "Library",
    smaller: " smaller",
    larger: " larger",
    allSettings: "All settings",
    settings: "Settings",
    fontThemeLayout: "Font, theme, layout",
    defaultSize: "↺ Default size",
  },
  // The language's own name, in its own letters: Settings → Menus and buttons (js/features/settings-panel.js)
  language: {
    name: "English",
  },
  // The place and the Sankashti dates, as in Nitya Upasana (js/features/date-card.js: skFmt, the place, its messages)
  sankashti: {
    /** "Tue, Oct 28" (with the year when not this year: "Tue, Oct 28, 2027")
     * @param {number} wd the weekday (0 = Sunday) @param {number} d @param {number} m (0 = January) @param {number} y or 0 */
    day: function (wd, d, m, y) {
      return DAYS.en[wd].slice(0, 3) + ", " + MONTHS.en[m].slice(0, 3) + " " + d + (y ? ", " + y : "");
    },
    /** A moonrise: "8:47 pm" @param {number} h 0–23 @param {string} mi two digits */
    time: function (h, mi) {
      return ((h + 11) % 12) + 1 + ":" + mi + (h >= 12 ? " pm" : " am");
    },
    late: " (after midnight)",
    yourPlace: "Your location",
    /** @param {string} place */
    near: function (place) {
      return "near " + place;
    },
    noGeo: "Location is not available in this browser",
    noPlace: "Could not get your location",
  },
  // The Sankathara card on Home (js/features/date-card.js)
  card: {
    next: "Next Sankathara Chaturthi",
    useLocation: "Use my location to show the date and moonrise",
    heads: {
      today: "Sankathara Chaturthi today",
      tomorrow: "Sankathara Chaturthi tomorrow",
      next: "Next Chaturthi date",
      previous: "Previous Sankathara Chaturthi",
      upcoming: "Upcoming Sankathara Chaturthi",
    },
    /** A heading on a Tuesday: Angaraki before "Sankathara", or before "Chaturthi" where there is no "Sankathara"
     * @param {string} t */
    angaraki: function (t) {
      return t.indexOf("Sankathara") >= 0 ? t.replace("Sankathara", "Angaraki Sankathara") : t.replace("Chaturthi", "Angaraki Chaturthi");
    },
    /** @param {string} date */
    today: function (date) {
      return "Today: " + date;
    },
    /** "Thu, Oct 30, 2026" @param {number} wd @param {number} d @param {number} m @param {number} y */
    fullDate: function (wd, d, m, y) {
      return DAYS.en[wd].slice(0, 3) + ", " + MONTHS.en[m].slice(0, 3) + " " + d + ", " + y;
    },
    monthsShort: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    /** A date in the strip, spoken: "28 Oct 2026, Tuesday" @param {number} d @param {number} m @param {number} y @param {number} wd */
    chip: function (d, m, y, wd) {
      return d + " " + MONTHS.en[m].slice(0, 3) + " " + y + ", " + DAYS.en[wd];
    },
    chipAng: ", Angaraki",
    more: "More dates",
    dates: "Sankathara Chaturthi dates",
    back: "↩ Back to next Sankathara Chaturthi",
    addAll: "Add all upcoming dates to calendar",
    addOne: "Add to calendar",
    /** @param {number} n */
    inDays: function (n) {
      return "in " + n + " days";
    },
    /** @param {string} time */
    moonrise: function (time) {
      return "Moonrise " + time;
    },
    useMy: "Use my location",
    updateMy: "Update my location",
    open: "Open the card",
    fold: "Fold the card",
    folded: "Card folded · tap its line to open it",
    poojaAt: "Pooja today at 7:00 pm",
    poojaNow: "Pooja in progress",
    /** "Moonrise in 2 h 10 min" @param {number} h the hours, or 0 @param {number} m */
    moonIn: function (h, m) {
      return "Moonrise in " + (h > 0 ? h + " h " : "") + m + " min";
    },
    downloadedOne: "Calendar file downloaded; open it to add the event",
    downloadedAll: "Calendar file downloaded; open it to add the events",
  },
};
