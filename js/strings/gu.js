// @ts-check
// The menu words in Gujarati (ગુજરાતી), every part's under its name, as in js/strings/en.js (js/core/strings.js).
// Digits stay as they are (1, 2, 3): Gujarati menus on phones write them so.

import { DAYS, MONTHS } from "../core/words.js";

/** "1 પાઠ", "3 પાઠ" (one word for both) @param {number} n */
function texts(n) {
  return n + " પાઠ";
}

export default {
  // The print builder's What step: Texts, Today, Routine (js/print/what.js)
  printWhat: {
    what: "શું છાપવું",
    search: "પાઠમાં શોધો",
    all: "બધા પાઠ",
    selectAll: "બધું પસંદ કરો",
    clear: "સાફ કરો",
    none: "કોઈ પાઠ મળતો નથી",
    texts: texts,
    pick: "ઓછામાં ઓછો એક પાઠ પસંદ કરો",
  },
  // The session on Home: its names, how many texts it has, its end (js/features/session-card.js)
  session: {
    sessions: { morning: "સવાર", afternoon: "બપોર", evening: "સાંજ" },
    texts: texts,
    ended: "આ સમય પૂરો થયો",
  },
  // The top bar (js/features/bars.js)
  bar: {
    /** @param {string} t */
    home: function (t) {
      return "મુખ્ય પાનું: " + t;
    },
    find: "પાઠ કે લીટી શોધો",
  },
  // The bottom bar's Prev and Next (js/features/bottom-bar.js)
  bottomBar: {
    prev: "‹ પાછળ",
    next: "આગળ ›",
  },
  // A piece's fold button (js/core/apply.js)
  fold: {
    open: "આ ભાગ બતાવો",
    fold: "આ ભાગ વાળી દો",
  },
  // The reading sheet (js/features/reading-sheet.js) and Settings → Languages (js/features/languages.js)
  languages: {
    both: "બંને",
    second: "+ બીજી ભાષા",
    none: "કોઈ નહીં",
    refrain: "↻ ધ્રુવપદ",
    close: "બંધ કરો",
    reset: "અક્ષરનું કદ મૂળ કરો",
    /** @param {string} pct */
    size: function (pct) {
      return "અક્ષરનું કદ " + pct + "%";
    },
  },
  // Dhrupad once or after every verse (js/features/dhrupad-button.js)
  dhrupad: {
    once: "ધ્રુપદ એક વાર બતાવ્યું",
    every: "દરેક કડી પછી ધ્રુપદ",
  },
  // Settings (js/features/settings-panel.js)
  settings: {
    /** @param {string} why */
    failed: function (why) {
      return "ફેરફાર પૂરો થઈ શક્યો નહીં (" + why + ")";
    },
  },
  // The full-screen picture (js/features/picture-viewer.js)
  pictureViewer: {
    hint: "મોટું કરવા બે આંગળીથી પહોળું કરો અથવા બે વાર દબાવો",
  },
  // Offline use and Check for updates (js/features/offline.js): Settings → More → About
  offline: {
    state: { idle: "ઑફલાઇન માટે તૈયાર", save: "ઑફલાઇન માટે સાચવે છે…", off: "સાચવેલી નકલ વપરાય છે" },
    update: { check: "અપડેટ માટે તપાસો", busy: "તપાસે છે…", ok: "તાજું છે", off: "ઇન્ટરનેટ નથી", restart: "બંધ કરીને ફરી ખોલો" },
    usingSaved: "ઇન્ટરનેટ નથી. સાચવેલી નકલ વાપરીએ છીએ.",
    loading: "નવી આવૃત્તિ, ખૂલે છે…",
    /** @param {string} v the new version ("v1.37.17") */
    reopen: function (v) {
      return "આવૃત્તિ " + v + " સચવાઈ ગઈ. પૂરું કરવા ઍપ બંધ કરીને ફરી ખોલો.";
    },
  },
  // Search and Recent (js/text/search.js)
  search: {
    /** @param {string} name */
    remove: function (name) {
      return "કાઢો: " + name;
    },
    nothing: "કંઈ મળ્યું નહીં",
    /** @param {number} n -1: 40 or more */
    lines: function (n) {
      return (n < 0 ? "40 કે વધુ" : n) + " પરિણામ";
    },
    /** @param {number} t @param {number} n the lines; -1: 40 or more */
    both: function (t, n) {
      return texts(t) + " અને " + (n < 0 ? "40 કે વધુ" : n) + " લીટી";
    },
    texts: "પાઠ",
    linesHead: "લીટીઓ",
  },
  // Share (js/features/share.js): the message for the group chat
  share: {
    tip: "\nસૂચન: ફોનમાં ઍપની જેમ રાખવા લિંક ખોલીને Add to Home Screen દબાવો.",
    /** @param {string} title */
    plain: function (title) {
      return title;
    },
    temple: " · પૂજા સાંજે 7:00–8:30, ભારતીય હિંદુ મંદિર, પૉવેલ",
    /** @param {string} ang @param {string} date @param {string} temple @param {string} rise */
    next: function (ang, date, temple, rise) {
      return ang + "Sankathara Chaturthi: " + date + temple + (rise ? " · ચંદ્રોદય " + rise : "");
    },
    /** @param {string} url */
    link: function (url) {
      return "\nઆરતીઓ: " + url;
    },
    copied: "સંદેશની નકલ થઈ",
  },
  // Print (js/features/print.js): the Print pop-up in the menu language, the printout's own words in its language
  print: {
    langs: { mr: "મરાઠી", kn: "કન્નડ", te: "તેલુગુ", gu: "ગુજરાતી", en: "અંગ્રેજી" },
    portrait: "ઊભું",
    landscape: "આડું",
    both: "બંને",
    /** @param {string} l1 @param {string} l2 */
    stacked: function (l1, l2) {
      return "ઊભું: ઉપર " + l1 + ", નીચે " + l2;
    },
    side: "આડું, બાજુ બાજુમાં",
    preview: "પહેલા પાનાની ઝલક",
    /** @param {string} paper */
    use: function (paper) {
      return paper + " વાપરો";
    },
    cancel: "રદ કરો",
    linkCopied: "લિંકની નકલ થઈ: તેને Safari માં ચોંટાડો",
    pick: "ઓછામાં ઓછો એક પાઠ પસંદ કરો",
  },
  // The page's own words (index.html: data-w="page.…"); {icon} is the icon written in the page
  page: {
    appAddToHomeScreen: 'ઍપ<span class="sr"> (હોમ સ્ક્રીન પર ઉમેરો)</span>',
    share: "શેર કરો",
    qrCode: 'QR<span class="sr"> કોડ</span>',
    help: "મદદ",
    back: "પાછળ",
    recent: "તાજેતરના",
    clear: "સાફ કરો",
    nothingFound: "કંઈ મળ્યું નહીં",
    reading: "વાંચન",
    screen: "પડદો",
    more: "વધુ",
    preview: "ઝલક",
    languageAndText: "ભાષા અને પાઠ",
    mainLanguage: "મુખ્ય ભાષા",
    largeText: "મોટા અક્ષર",
    secondLanguage: "બીજી ભાષા",
    smallerUnderEachLine: "નાના, દરેક લીટી નીચે",
    show: "બતાવો",
    textSize: "અક્ષરનું કદ",
    textFont: "અક્ષરની શૈલી",
    standard: "સામાન્ય",
    classic: "પરંપરાગત",
    handwritten: "હસ્તલિખિત",
    verses: "કડીઓ",
    dhrupad: "ધ્રુપદ",
    once: "એક વાર",
    everyVerse: "દરેક કડી",
    layout: "ગોઠવણ",
    n1Column: "1 સ્તંભ",
    n2Columns: "2 સ્તંભ",
    menusAndButtons: "મેનુ અને બટન",
    theme: "થીમ",
    auto: "આપમેળે",
    light: "આછું",
    sepia: "સેપિયા",
    dark: "ઘેરું",
    highContrast: "વધુ કૉન્ટ્રાસ્ટ",
    keepScreenOn: "પડદો ચાલુ રાખો",
    afterLastTouch: "છેલ્લા સ્પર્શ પછી, મિનિટ",
    off: "બંધ",
    about: "વિશે",
    helpAndHowToUse: "મદદ અને વાપરવાની રીત",
    addToHomeScreen: "હોમ સ્ક્રીન પર ઉમેરો",
    sankatharaChaturthi: "સંકટહર ચતુર્થી",
    scanWithTheCameraTo: "ખોલવા કૅમેરાથી સ્કૅન કરો",
    close: "બંધ કરો",
    whatToPrint: "‹ શું છાપવું",
    printPdf: "છાપો / PDF",
    whatToPrint2: "શું છાપવું",
    howToPrint: "કેવી રીતે છાપવું",
    language: "ભાષા",
    dhrupad2: 'ધ્રુપદ (<span lang="mr">धृ</span>)',
    once2: "એક વાર",
    page: "પાનું",
    printFont: "છાપવાની અક્ષર શૈલી",
    everyTextStartsOnA: 'દરેક પાઠ નવા પાને શરૂ થાય છે. કાગળ: <b class="prpaper">Letter</b>',
    forLandscapePickItIn: "આડા માટે, Safari ના સંવાદમાં પણ તે જ પસંદ કરો.",
    pickA4PaperInSafari: 'Safari ના સંવાદમાં પણ <span class="przp">A4</span> કાગળ પસંદ કરો.',
    chromePrintsItBest: "Chrome તેને સૌથી સારું છાપે છે.",
    readyPrintNow: "તૈયાર: હમણાં છાપો",
    openInSafari: "Safari માં ખોલો",
    copyLink: "લિંકની નકલ કરો",
    printingDoesNotOpenFrom:
      "iPhone પર હોમ સ્ક્રીન ઍપમાંથી છાપવાનું ખૂલતું નથી. <b>Safari માં ખોલો</b> દબાવો: તમારી પસંદગીઓ સાથે જશે અને છાપવાનું ત્યાં તૈયાર થશે. Safari ન ખૂલે તો, લિંકની નકલ કરી Safari માં ચોંટાડો.",
    thisBrowserDidNotOpen:
      'આ બ્રાઉઝરે છાપવાનો સંવાદ ખોલ્યો નહીં. બ્રાઉઝરનું <b lang="en">Share</b> બટન દબાવી <b lang="en">Print</b> પસંદ કરો. આ પાનું બીજી ઍપની અંદર ખૂલ્યું હોય તો, <b>Safari માં ખોલો</b> દબાવો: તમારી પસંદગીઓ સાથે જશે.',
    nextHowToPrint: "આગળ: કેવી રીતે છાપવું ›",
    print: "છાપો",
    addToHomeScreen2: "હોમ સ્ક્રીન પર ઉમેરો",
    tapTheShareButtonAt: '<b lang="en">Share</b> બટન {icon} દબાવો (Safari માં નીચે, Chrome માં ઉપર જમણે).',
    scrollDownAndTapAdd: 'નીચે સરકાવી <b lang="en">Add to Home Screen</b> દબાવો.',
    tapAdd: '<b lang="en">Add</b> દબાવો.',
    openThisPageInSafari: 'આ પાનું <b lang="en">Safari</b> કે <b lang="en">Chrome</b> માં ખોલો (⋯ કે Share → Open in Safari/Chrome).',
    thenShareAddToHome: 'પછી Share {icon} → <b lang="en">Add to Home Screen</b> → <b lang="en">Add</b>.',
    openChromeSMenuTop: "Chrome નું <b>⋮</b> મેનુ ખોલો (ઉપર જમણે).",
    tapAddToHomeScreen: '<b lang="en">Add to Home screen</b> કે <b lang="en">Install app</b> દબાવો.',
    tapInstallOrAdd: '<b lang="en">Install</b> કે <b lang="en">Add</b> દબાવો.',
    clickTheInstallIconAt: 'સરનામાની પટ્ટીના જમણા છેડે ઇન્સ્ટૉલ આઇકન પર ક્લિક કરો, કે બ્રાઉઝરના મેનુમાંથી <b lang="en">Install</b> પસંદ કરો.',
    clickTheShareButtonIn: 'Safari ની ટૂલબારમાં <b lang="en">Share</b> બટન {icon} પર ક્લિક કરો, કે <b lang="en">File</b> મેનુ ખોલો.',
    chooseAddToDockThen: '<b lang="en">Add to Dock</b> પસંદ કરો, પછી <b lang="en">Add</b> પર ક્લિક કરો.',
    firefoxCanTAddThis: "Firefox આ સાઇટને ઍપ તરીકે ઉમેરી શકતું નથી. આ પાનું Chrome, Edge કે Safari માં ખોલી આ બટન ફરી દબાવો.",
    itWillThenOpenLike: "પછી તે ઇન્ટરનેટ વિના પણ ઍપની જેમ ખૂલશે.",
    ok: "બરાબર",
    home: "મુખ્ય પાનું",
    library: "સંગ્રહ",
    smaller: " નાનું",
    larger: " મોટું",
    allSettings: "બધી સેટિંગ્સ",
    settings: "સેટિંગ્સ",
    fontThemeLayout: "અક્ષર શૈલી, થીમ, ગોઠવણ",
    defaultSize: "↺ મૂળ કદ",
  },
  // The language's own name, in its own letters: Settings → Menus and buttons (js/features/settings-panel.js)
  language: {
    name: "ગુજરાતી",
  },
  // The Sankashti line on Home, its place and its dates (js/features/sankashti.js)
  sankashti: {
    /** @param {number} wd @param {number} d @param {number} m @param {number} y */
    day: function (wd, d, m, y) {
      return DAYS.gu[wd] + ", " + d + " " + MONTHS.gu[m] + (y ? " " + y : "");
    },
    /** @param {number} h @param {string} mi */
    time: function (h, mi) {
      return (h >= 20 || h < 4 ? "રાત્રે " : h >= 16 ? "સાંજે " : "") + (((h + 11) % 12) + 1) + ":" + mi;
    },
    late: " (મધરાત પછી)",
    yourPlace: "તમારું સ્થાન",
    /** @param {string} place */
    near: function (place) {
      return place + " નજીક";
    },
    noGeo: "આ બ્રાઉઝરમાં સ્થાન મળતું નથી",
    noPlace: "તમારું સ્થાન મળ્યું નહીં",
  },
  // The Sankathara card on Home (js/features/date-card.js)
  card: {
    next: "હવે પછીની સંકટહર ચતુર્થી",
    useLocation: "તારીખ અને ચંદ્રોદય જોવા મારું સ્થાન વાપરો",
    heads: {
      today: "આજે સંકટહર ચતુર્થી",
      tomorrow: "આવતીકાલે સંકટહર ચતુર્થી",
      next: "હવે પછીની ચતુર્થી",
      previous: "પાછલી સંકટહર ચતુર્થી",
      upcoming: "આવનારી સંકટહર ચતુર્થી",
    },
    /** @param {string} t */
    angaraki: function (t) {
      return t.indexOf("સંકટહર") >= 0 ? t.replace("સંકટહર", "અંગારકી સંકટહર") : t.replace("ચતુર્થી", "અંગારકી ચતુર્થી");
    },
    /** @param {string} date */
    today: function (date) {
      return "આજે: " + date;
    },
    /** @param {number} wd @param {number} d @param {number} m @param {number} y */
    fullDate: function (wd, d, m, y) {
      return DAYS.gu[wd] + ", " + d + " " + MONTHS.gu[m] + " " + y;
    },
    monthsShort: MONTHS.gu,
    /** @param {number} d @param {number} m @param {number} y @param {number} wd */
    chip: function (d, m, y, wd) {
      return d + " " + MONTHS.gu[m] + " " + y + ", " + DAYS.gu[wd];
    },
    chipAng: ", અંગારકી",
    more: "વધુ તારીખો",
    dates: "સંકટહર ચતુર્થીની તારીખો",
    back: "↩ હવે પછીની સંકટહર ચતુર્થી પર પાછા",
    addAll: "આવનારી બધી તારીખો કૅલેન્ડરમાં ઉમેરો",
    addOne: "કૅલેન્ડરમાં ઉમેરો",
    // the count under the card's ring (js/features/date-card.js): how far the date shown is from today
    /** @param {number} n */
    ringDays: function (n) {
      return n + " દિવસ";
    },
    ringToday: "આજે",
    ringTomorrow: "આવતીકાલે",
    /** @param {number} n */
    ringAgo: function (n) {
      return n === 1 ? "ગઈકાલે" : n + " દિવસ પહેલાં";
    },
    /** @param {number} n */
    inDays: function (n) {
      return n + " દિવસમાં";
    },
    /** @param {string} time */
    moonrise: function (time) {
      return "ચંદ્રોદય " + time;
    },
    useMy: "મારું સ્થાન વાપરો",
    updateMy: "મારું સ્થાન તાજું કરો",
    open: "કાર્ડ ખોલો",
    fold: "કાર્ડ વાળી દો",
    folded: "કાર્ડ વાળી દીધું · ખોલવા તેની લીટી દબાવો",
    poojaAt: "આજે સાંજે 7:00 વાગ્યે પૂજા",
    poojaNow: "પૂજા ચાલુ છે",
    /** @param {number} h @param {number} m */
    moonIn: function (h, m) {
      return "ચંદ્રોદયને " + (h > 0 ? h + " કલાક " : "") + m + " મિનિટ";
    },
    downloadedOne: "કૅલેન્ડર ફાઇલ ડાઉનલોડ થઈ; ઘટના ઉમેરવા તેને ખોલો",
    downloadedAll: "કૅલેન્ડર ફાઇલ ડાઉનલોડ થઈ; ઘટનાઓ ઉમેરવા તેને ખોલો",
  },
};
