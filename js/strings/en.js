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
    // English's two spellings in the language list: English · Simple (Sukhkarta), English · Scholarly (sukhakartā)
    simple: "Simple",
    scholarly: "Scholarly",
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
    // the version line in Settings → More → About: what Check for updates found (under the version), and the round
    // button's name in each state
    update: {
      check: "Check for updates",
      busy: "Looking for a new version…",
      ok: "You have the latest version",
      off: "No internet · tap to try again",
      restart: "Saved. Close the app and open it again",
      failed: "Couldn't save the new version · tap to try again",
    },
    button: { check: "Check for updates", busy: "Checking…", ok: "Check again", off: "Try again", restart: "How to finish the update", failed: "Try again" },
    version: "Version",
    how: "How?",
    // How? after an update saved on Safari, iPhone or iPad: how to close the app and open it again, for each device
    finish: {
      title: "Finish the update",
      /** @param {string} v the new version ("1.39.3") */
      saved: function (v) {
        return "Version " + v + " is saved on this device";
      },
      device: "Your device",
      kept: "Your settings stay as they are.",
      ok: "Got it",
      close: "Close",
      iphone: {
        s1: "Swipe up from the bottom of the screen and pause",
        h1: "Your open apps appear side by side.",
        s2: "Swipe this app up and away",
        h2: "Or Safari, if the site is open there. Nothing is lost.",
        s3: "Tap its icon on the Home Screen",
        h3: "It opens with the new version.",
      },
      ipad: {
        s1: "Swipe up from the bottom of the screen and pause",
        h1: "On an iPad with a Home button, press it twice.",
        s2: "Swipe this app up and away",
        h2: "Or Safari, if the site is open there. Nothing is lost.",
        s3: "Tap its icon on the Home Screen",
        h3: "It opens with the new version.",
      },
      mac: {
        s1: "Press ⌘Q to quit",
        h1: "Safari, or this app if you added it to the Dock.",
        s2: "Open it again",
        h2: "From the Dock, or open Safari and this site.",
      },
    },
    usingSaved: "No internet. Using the saved copy.",
    loading: "New version, loading…",
    notSaved: "The new version couldn't be saved. This one stays in use.",
    notSavedWhy: "Update not saved",
    /** @param {string} v the new version ("v1.37.17") */
    reopen: function (v) {
      return "Updated to " + v + ". Close the app and open it again to finish.";
    },
  },
  // Search and Recent (js/features/search.js)
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
  // The install page (js/features/install-page.js): {more} {share} {menu} {lines} are the browser's buttons, drawn
  // by the script
  install: {
    what: "The pooja and aartis for Sankathara Chaturthi, with the next date and moonrise. Works without internet.",
    install: "Install the app",
    installDesk: "Install on this computer",
    oneTap: "One tap puts it on your home screen like any other app. Free: no app store, no sign-in.",
    orMenu: "Or from the browser's menu",
    add: "Add it to your Home Screen",
    addMac: "Add it to your Dock",
    steps: {
      ios26: [
        'Tap {more} in the address bar at the bottom (or {share} <b lang="en">Share</b>, if you see it)',
        'Tap {share} <b lang="en">Share</b>',
        'Scroll down and tap <b lang="en">Add to Home Screen</b> (or <b lang="en">View More</b> first)',
        'Leave <b lang="en">Open as Web App</b> on, then tap <b lang="en">Add</b>',
      ],
      ios: ["Tap {share} at the bottom of the screen", 'Scroll down and tap <b lang="en">Add to Home Screen</b>', 'Tap <b lang="en">Add</b> at the top right'],
      ipad: ["Tap {share} at the top right", 'Tap <b lang="en">Add to Home Screen</b>', 'Tap <b lang="en">Add</b>'],
      iosBrowser: [
        "Tap {share} at the top right, beside the address",
        'Tap <b lang="en">Add to Home Screen</b> (scroll down if it isn\'t there)',
        'Tap <b lang="en">Add</b>',
      ],
      android: ["Tap {menu} at the top right", 'Tap <b lang="en">Install app</b> or <b lang="en">Add to Home screen</b>', 'Tap <b lang="en">Install</b>'],
      samsung: ["Tap {lines} at the bottom right", 'Tap <b lang="en">Add page to</b>, then <b lang="en">Home screen</b>', 'Tap <b lang="en">Add</b>'],
      androidFirefox: ["Tap {menu} at the top right", 'Tap <b lang="en">Add app to Home screen</b>', 'Tap <b lang="en">Add</b>'],
      desktop: ["Click the install icon at the right of the address bar, or open the browser's menu", 'Click <b lang="en">Install</b>'],
      mac: ['Click <b lang="en">File</b> in the menu bar, or {share} in Safari\'s toolbar', 'Click <b lang="en">Add to Dock…</b>, then <b lang="en">Add</b>'],
    },
    safariFirst: "First, open this page in Safari",
    safariWhy: "This app's own browser can't add apps to your Home Screen. Safari can, in a few taps.",
    safariOld: 'Tap ⋯ or the compass and choose <b lang="en">Open in Safari</b>. Or copy the link and paste it into Safari.',
    openSafari: "Open in Safari",
    chromeFirst: "First, open this page in Chrome",
    chromeWhy: "This app's own browser can't install apps. Chrome can, in one tap.",
    openChrome: "Open in Chrome",
    copy: "Copy link",
    copied: "Link copied: paste it into the browser's address bar",
    firefox: "Firefox can't install apps. Open this page in Chrome, Edge or Safari, or put it on your phone with the code below.",
    phone: "On your phone?",
    phoneHow: "Point its camera at this code: the same page opens with the steps for that phone.",
    done: "It's on your home screen",
    doneHow: "Open it from there: it works without internet.",
    added: "I've added it",
    addedHow: "Now open it from its icon on your Home Screen: it works without internet.",
    // the label beside the arrow, with the browser's button drawn in: in English in every language (Satish, 2026-11-19)
    tip: "Tap this",
    tipAddress: "Tap this in the address bar",
    tipEither: "Tap whichever you see, at the bottom",
    later: "Not now, read in the browser",
    close: "Close",
  },
  // Share (js/features/share.js): the message for the group chat
  share: {
    tip: "\nTap the link: it shows how to put the app on your phone in a few taps.",
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
    /** About how many pages @param {number} n */
    about: function (n) {
      return "about " + n + (+n === 1 ? " page" : " pages");
    },
    // the hints under Dhrupad and Page, short enough for one line on a phone; n: about how many pages more than the
    // recommended choice (0: not known)
    onceHint: "Fewest pages: the refrain once, at the top.",
    /** @param {number} n */
    everyHint: function (n) {
      return +n > 0 ? "As sung: about " + n + (+n === 1 ? " page" : " pages") + " more than Once." : "The refrain after every verse, as sung.";
    },
    upHint: "Best for one language: most per page.",
    /** @param {number} n */
    landHint: function (n) {
      return +n > 0 ? "Larger lines: about " + n + (+n === 1 ? " page" : " pages") + " more." : "Larger, wider lines.";
    },
    /** @param {string} l2 the other language */
    sideHint: function (l2) {
      return "Each line beside its " + l2 + ", rows in step.";
    },
    // the cover and the closing page of a printout of more than one text (js/print/write.js)
    /** How many texts @param {number} n */
    texts: function (n) {
      return n + (+n === 1 ? " text" : " texts");
    },
    sources: "Sources",
    /** The day it was printed @param {string} d */
    printed: function (d) {
      return "Printed " + d;
    },
  },
  // The page's own words (index.html: data-w="page.…", filled by fillWords(), js/core/strings.js); {icon} is the
  // icon written in the page, kept where each language puts it
  // Go to (js/features/where.js): the top bar's title in a long text or a session, and its sheet (#goto)
  goto: {
    title: "Go to",
    here: "You are here",
    /** @param {string} where  the text and the places the reading is in */
    open: function (where) {
      return "Go to: " + where;
    },
    /** @param {string} name  a heading or a text of the session */
    more: function (name) {
      return "Show the places in " + name;
    },
    /** @param {string} n  the verse number typed */
    none: function (n) {
      return "No verse " + n + " here";
    },
  },
  page: {
    appAddToHomeScreen: 'App<span class="sr"> (add to Home Screen)</span>',
    share: "Share",
    qrCode: 'QR<span class="sr"> code</span>',
    help: "Help",
    back: "Back",
    recent: "Recent",
    clear: "Clear",
    nothingFound: "Nothing found",
    nothingHint: "Try fewer letters or another spelling. Marathi and English letters both work.",
    reading: "Reading",
    goTo: "Go to",
    verseNumber: "Verse number",
    go: "Go",
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
    traditional: "Traditional",
    modern: "Modern",
    bold: "Bold",
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
    everyTextStartsOnA: 'Long texts start on a new page; short ones follow on. Paper: <b class="prpaper">Letter</b>',
    coverAndClosingPage: "Cover and closing page",
    forLandscapePickItIn: "For Landscape, pick it in Safari's dialog too.",
    pickA4PaperInSafari: 'Pick <span class="przp">A4</span> paper in Safari\'s dialog too.',
    chromePrintsItBest: "Chrome prints it best, with page numbers.",
    safariPrintsSmaller: "Safari prints a little smaller and without page numbers.",
    recommended: "Recommended",
    readyPrintNow: "Ready: Print now",
    openInSafari: "Open in Safari",
    copyLink: "Copy link",
    printingDoesNotOpenFrom:
      "Printing does not open from the Home Screen app on iPhone. Tap <b>Open in Safari</b>: your choices go with it and the printout is made ready there. If Safari does not open, copy the link and paste it into Safari.",
    thisBrowserDidNotOpen:
      "This browser did not open the print dialog. Tap the browser's <b>Share</b> button and choose <b>Print</b>. If this page opened inside another app, tap <b>Open in Safari</b>: your choices go with it.",
    nextHowToPrint: "Next: how to print ›",
    print: "Print",
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
    back: "↩ Next date",
    addAll: "Add all to calendar",
    older: "‹ Last year's dates",
    addOne: "Add to calendar",
    // the count under the card's ring (js/features/date-card.js): how far the date shown is from today
    /** @param {number} n */
    ringDays: function (n) {
      return n + " days";
    },
    ringToday: "Today",
    ringTomorrow: "Tomorrow",
    /** @param {number} n */
    ringAgo: function (n) {
      return n === 1 ? "Yesterday" : n + " days ago";
    },
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
    /** the time left before the moonrise, in the moonrise chip on the day @param {number} h @param {number} m */
    moonLeft: function (h, m) {
      return "in " + (h > 0 ? h + " h " : "") + m + " min";
    },
    downloadedOne: "Calendar file downloaded; open it to add the event",
    downloadedAll: "Calendar file downloaded; open it to add the events",
  },
  // Wikipedia, named for screen readers in this language, by the Wikipedia's language: a link's spoken name says which
  // one it opens (js/core/wiki.js wikiLabel)
  wiki: {
    mr: "Marathi Wikipedia",
    hi: "Hindi Wikipedia",
    en: "Wikipedia",
    kn: "Kannada Wikipedia",
    te: "Telugu Wikipedia",
    gu: "Gujarati Wikipedia",
    tab: "opens in a new tab",
  },
  // The words the site adds to a text, in its languages (js/text/content.js, js/render.js): the dhrupad's label and
  // marker, Previous / Next under it, its language, and its credit's words. A text shown in Kannada, Telugu or Gujarati
  // letters takes that language's own words here, never Marathi's written in its letters (js/render.js SCR.el)
  text: {
    // the dhrupad's label: its word, and how it is sung (js/render.js refrainLabel())
    refrainWord: "Refrain",
    refrainHow: "(sung after every verse)",
    // the switch between a text's versions (the Hanuman Chalisa: Tulsidas | Popular)
    version: "Version",
    refrainNote: "Refrain",
    prev: "Previous",
    next: "Next",
    by: "By",
    // a name in a sentence, at {name}, so each language puts it where it goes
    attributed: "Attributed to {name}",
    also: "(also credited to {name})",
    compiledBy: "A compilation:",
    traditional: "Traditional",
    lang: { sa: "Sanskrit", mr: "Marathi", hi: "Hindi" },
  },
};
