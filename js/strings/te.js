// @ts-check
// The menu words in Telugu (తెలుగు), every part's under its name, as in js/strings/en.js (js/core/strings.js).
// Digits stay as they are (1, 2, 3): Telugu menus on phones write them so.

import { DAYS, MONTHS } from "../core/words.js";

/** "1 పాఠం", "3 పాఠాలు" @param {number} n */
function texts(n) {
  return n + (n === 1 ? " పాఠం" : " పాఠాలు");
}

export default {
  // The print builder's What step: Texts, Today, Routine (js/print/what.js)
  printWhat: {
    what: "ఏమి ముద్రించాలి",
    search: "పాఠాలలో వెతుకు",
    all: "అన్ని పాఠాలు",
    selectAll: "అన్నీ ఎంచుకో",
    clear: "తుడిచివేయి",
    none: "ఏ పాఠమూ సరిపోలలేదు",
    texts: texts,
    pick: "కనీసం ఒక పాఠాన్ని ఎంచుకోండి",
  },
  // The top bar (js/features/bars.js)
  bar: {
    /** @param {string} t */
    home: function (t) {
      return "ముఖపుట: " + t;
    },
    find: "పాఠం లేదా పంక్తిని వెతుకు",
  },
  // The bottom bar's Prev and Next (js/features/bottom-bar.js)
  bottomBar: {
    prev: "‹ ముందటిది",
    next: "తర్వాతి ›",
  },
  // A piece's fold button (js/core/apply.js)
  fold: {
    open: "ఈ భాగాన్ని చూపు",
    fold: "ఈ భాగాన్ని మడువు",
  },
  // The reading sheet (js/features/reading-sheet.js) and Settings → Languages (js/features/languages.js)
  languages: {
    both: "రెండూ",
    second: "+ రెండవ భాష",
    none: "ఏదీ వద్దు",
    refrain: "↻ పల్లవి",
    close: "మూసివేయి",
    reset: "అక్షర పరిమాణాన్ని మొదటికి తెచ్చు",
    /** @param {string} pct */
    size: function (pct) {
      return "అక్షర పరిమాణం " + pct + "%";
    },
  },
  // Dhrupad once or after every verse (js/features/dhrupad-button.js)
  dhrupad: {
    once: "ధ్రుపదం ఒకసారి చూపబడింది",
    every: "ప్రతి పద్యం తర్వాత ధ్రుపదం",
  },
  // Settings (js/features/settings-panel.js)
  settings: {
    /** @param {string} why */
    failed: function (why) {
      return "మార్పును పూర్తి చేయలేకపోయాం (" + why + ")";
    },
  },
  // The full-screen picture (js/features/picture-viewer.js)
  pictureViewer: {
    hint: "పెద్దగా చూడడానికి రెండు వేళ్లతో విడదీయండి లేదా రెండుసార్లు నొక్కండి",
  },
  // Offline use and Check for updates (js/features/offline.js): Settings → More → About
  offline: {
    state: { idle: "ఆఫ్‌లైన్‌కు సిద్ధం", save: "ఆఫ్‌లైన్ కోసం సేవ్ అవుతోంది…", off: "సేవ్ చేసిన ప్రతి వాడుకలో ఉంది" },
    update: { check: "అప్‌డేట్‌ల కోసం చూడు", busy: "చూస్తోంది…", ok: "తాజాగా ఉంది", off: "ఇంటర్నెట్ లేదు", restart: "మూసి మళ్లీ తెరవండి" },
    usingSaved: "ఇంటర్నెట్ లేదు. సేవ్ చేసిన ప్రతిని వాడుతున్నాం.",
    loading: "కొత్త వెర్షన్, తెరుచుకుంటోంది…",
    ready: "ఆఫ్‌లైన్ వాడకానికి సిద్ధం",
    /** @param {string} v the new version ("v1.37.17") */
    reopen: function (v) {
      return "వెర్షన్ " + v + " సేవ్ అయింది. పూర్తి చేయడానికి యాప్‌ను మూసి మళ్లీ తెరవండి.";
    },
  },
  // Search and Recent (js/text/search.js)
  search: {
    /** @param {string} name */
    remove: function (name) {
      return "తీసివేయి: " + name;
    },
    nothing: "ఏదీ దొరకలేదు",
    /** @param {number} n -1: 40 or more */
    lines: function (n) {
      return (n < 0 ? "40 లేదా ఎక్కువ" : n) + (n == 1 ? " ఫలితం" : " ఫలితాలు");
    },
    /** @param {number} t @param {number} n the lines; -1: 40 or more */
    both: function (t, n) {
      return texts(t) + ", " + (n < 0 ? "40 లేదా ఎక్కువ" : n) + (n == 1 ? " పంక్తి" : " పంక్తులు");
    },
    texts: "పాఠాలు",
    linesHead: "పంక్తులు",
  },
  // Share (js/features/share.js): the message for the group chat
  share: {
    tip: "\nసూచన: ఫోన్‌లో యాప్ లాగా ఉంచుకోవడానికి లింక్ తెరిచి Add to Home Screen నొక్కండి.",
    /** @param {string} title */
    plain: function (title) {
      return title;
    },
    temple: " · పూజ సాయంత్రం 7:00–8:30, భారతీయ హిందూ దేవాలయం, పావెల్",
    /** @param {string} ang @param {string} date @param {string} temple @param {string} rise */
    next: function (ang, date, temple, rise) {
      return ang + "Sankathara Chaturthi: " + date + temple + (rise ? " · చంద్రోదయం " + rise : "");
    },
    /** @param {string} url */
    link: function (url) {
      return "\nఆరతులు: " + url;
    },
    copied: "సందేశం కాపీ అయింది",
  },
  // Print (js/features/print.js): the Print pop-up in the menu language, the printout's own words in its language
  print: {
    langs: { mr: "మరాఠీ", kn: "కన్నడ", te: "తెలుగు", gu: "గుజరాతీ", en: "ఇంగ్లీషు" },
    portrait: "నిలువు",
    landscape: "అడ్డం",
    both: "రెండూ",
    /** @param {string} l1 @param {string} l2 */
    stacked: function (l1, l2) {
      return "నిలువు: పైన " + l1 + ", కింద " + l2;
    },
    side: "అడ్డం, పక్కపక్కనే",
    preview: "మొదటి పేజీ ముందుచూపు",
    /** @param {string} paper */
    use: function (paper) {
      return paper + " వాడు";
    },
    cancel: "రద్దు చేయి",
    linkCopied: "లింక్ కాపీ అయింది: దాన్ని Safari లో అతికించండి",
    pick: "కనీసం ఒక పాఠాన్ని ఎంచుకోండి",
  },
  // The page's own words (index.html: data-w="page.…"); {icon} is the icon written in the page
  page: {
    appAddToHomeScreen: 'యాప్<span class="sr"> (హోమ్ స్క్రీన్‌కు జోడించు)</span>',
    share: "పంచుకో",
    qrCode: 'QR<span class="sr"> కోడ్</span>',
    help: "సహాయం",
    back: "వెనుకకు",
    recent: "ఇటీవలివి",
    clear: "తుడిచివేయి",
    nothingFound: "ఏదీ దొరకలేదు",
    reading: "పఠనం",
    screen: "తెర",
    more: "మరిన్ని",
    preview: "ముందుచూపు",
    languageAndText: "భాష, పాఠం",
    mainLanguage: "ప్రధాన భాష",
    largeText: "పెద్ద అక్షరాలు",
    secondLanguage: "రెండవ భాష",
    smallerUnderEachLine: "చిన్నగా, ప్రతి పంక్తి కింద",
    show: "చూపు",
    textSize: "అక్షర పరిమాణం",
    textFont: "అక్షర శైలి",
    standard: "సాధారణ",
    classic: "సాంప్రదాయ",
    handwritten: "చేతిరాత",
    verses: "పద్యాలు",
    dhrupad: "ధ్రుపదం",
    once: "ఒకసారి",
    everyVerse: "ప్రతి పద్యం",
    layout: "అమరిక",
    n1Column: "1 నిలువు వరుస",
    n2Columns: "2 నిలువు వరుసలు",
    menusAndButtons: "మెనూలు, బటన్‌లు",
    theme: "థీమ్",
    auto: "ఆటో",
    light: "లేత",
    sepia: "సెపియా",
    dark: "ముదురు",
    highContrast: "అధిక కాంట్రాస్ట్",
    keepScreenOn: "తెరను ఆన్‌లో ఉంచు",
    about: "గురించి",
    helpAndHowToUse: "సహాయం, వాడే విధానం",
    addToHomeScreen: "హోమ్ స్క్రీన్‌కు జోడించు",
    sankatharaChaturthi: "సంకటహర చతుర్థి",
    scanWithTheCameraTo: "తెరవడానికి కెమెరాతో స్కాన్ చేయండి",
    close: "మూసివేయి",
    whatToPrint: "‹ ఏమి ముద్రించాలి",
    printPdf: "ముద్రించు / PDF",
    whatToPrint2: "ఏమి ముద్రించాలి",
    howToPrint: "ఎలా ముద్రించాలి",
    language: "భాష",
    dhrupad2: 'ధ్రుపదం (<span lang="mr">धृ</span>)',
    once2: "ఒకసారి",
    page: "పేజీ",
    printFont: "ముద్రణ అక్షర శైలి",
    everyTextStartsOnA: 'ప్రతి పాఠం కొత్త పేజీలో మొదలవుతుంది. కాగితం: <b class="prpaper">Letter</b>',
    forLandscapePickItIn: "అడ్డం కోసం, Safari డైలాగ్‌లోనూ దాన్నే ఎంచుకోండి.",
    pickA4PaperInSafari: 'Safari డైలాగ్‌లోనూ <span class="przp">A4</span> కాగితం ఎంచుకోండి.',
    chromePrintsItBest: "Chrome దీన్ని బాగా ముద్రిస్తుంది.",
    readyPrintNow: "సిద్ధం: ఇప్పుడు ముద్రించు",
    openInSafari: "Safari లో తెరువు",
    copyLink: "లింక్ కాపీ చేయి",
    printingDoesNotOpenFrom:
      "iPhone లో హోమ్ స్క్రీన్ యాప్ నుండి ముద్రణ తెరుచుకోదు. <b>Safari లో తెరువు</b> నొక్కండి: మీ ఎంపికలు దానితో వెళ్తాయి, ముద్రణ అక్కడ సిద్ధమవుతుంది. Safari తెరుచుకోకపోతే, లింక్ కాపీ చేసి Safari లో అతికించండి.",
    thisBrowserDidNotOpen:
      'ఈ బ్రౌజర్ ముద్రణ డైలాగ్‌ను తెరవలేదు. బ్రౌజర్ <b lang="en">Share</b> బటన్ నొక్కి <b lang="en">Print</b> ఎంచుకోండి. ఈ పేజీ వేరే యాప్ లోపల తెరుచుకుంటే, <b>Safari లో తెరువు</b> నొక్కండి: మీ ఎంపికలు దానితో వెళ్తాయి.',
    nextHowToPrint: "తర్వాత: ఎలా ముద్రించాలి ›",
    print: "ముద్రించు",
    addToHomeScreen2: "హోమ్ స్క్రీన్‌కు జోడించు",
    tapTheShareButtonAt: '<b lang="en">Share</b> బటన్ {icon} నొక్కండి (Safari లో కింద, Chrome లో పైన కుడివైపు).',
    scrollDownAndTapAdd: 'కిందికి జరిపి <b lang="en">Add to Home Screen</b> నొక్కండి.',
    tapAdd: '<b lang="en">Add</b> నొక్కండి.',
    openThisPageInSafari: 'ఈ పేజీని <b lang="en">Safari</b> లేదా <b lang="en">Chrome</b> లో తెరవండి (⋯ లేదా Share → Open in Safari/Chrome).',
    thenShareAddToHome: 'తర్వాత Share {icon} → <b lang="en">Add to Home Screen</b> → <b lang="en">Add</b>.',
    openChromeSMenuTop: "Chrome <b>⋮</b> మెనూ తెరవండి (పైన కుడివైపు).",
    tapAddToHomeScreen: '<b lang="en">Add to Home screen</b> లేదా <b lang="en">Install app</b> నొక్కండి.',
    tapInstallOrAdd: '<b lang="en">Install</b> లేదా <b lang="en">Add</b> నొక్కండి.',
    clickTheInstallIconAt: 'అడ్రస్ బార్ కుడి చివర ఉన్న ఇన్‌స్టాల్ ఐకాన్‌ను క్లిక్ చేయండి, లేదా బ్రౌజర్ మెనూ నుండి <b lang="en">Install</b> ఎంచుకోండి.',
    clickTheShareButtonIn: 'Safari టూల్‌బార్‌లో <b lang="en">Share</b> బటన్ {icon} క్లిక్ చేయండి, లేదా <b lang="en">File</b> మెనూ తెరవండి.',
    chooseAddToDockThen: '<b lang="en">Add to Dock</b> ఎంచుకోండి, తర్వాత <b lang="en">Add</b> క్లిక్ చేయండి.',
    firefoxCanTAddThis: "Firefox ఈ సైట్‌ను యాప్‌గా జోడించలేదు. ఈ పేజీని Chrome, Edge లేదా Safari లో తెరిచి ఈ బటన్‌ను మళ్లీ నొక్కండి.",
    itWillThenOpenLike: "తర్వాత ఇది ఇంటర్నెట్ లేకపోయినా యాప్ లాగా తెరుచుకుంటుంది.",
    ok: "సరే",
    home: "ముఖపుట",
    library: "సంగ్రహం",
    smaller: " చిన్నది",
    larger: " పెద్దది",
    allSettings: "అన్ని సెట్టింగ్‌లు",
    settings: "సెట్టింగ్‌లు",
    fontThemeLayout: "అక్షర శైలి, థీమ్, అమరిక",
    defaultSize: "↺ మొదటి పరిమాణం",
  },
  // The language's own name, in its own letters: Settings → Menus and buttons (js/features/settings-panel.js)
  language: {
    name: "తెలుగు",
  },
  // The Sankashti line on Home, its place and its dates (js/features/sankashti.js)
  sankashti: {
    /** @param {number} wd @param {number} d @param {number} m @param {number} y */
    day: function (wd, d, m, y) {
      return DAYS.te[wd] + ", " + d + " " + MONTHS.te[m] + (y ? " " + y : "");
    },
    /** @param {number} h @param {string} mi */
    time: function (h, mi) {
      return (h >= 20 || h < 4 ? "రాత్రి " : h >= 16 ? "సాయంత్రం " : "") + (((h + 11) % 12) + 1) + ":" + mi;
    },
    late: " (అర్ధరాత్రి తర్వాత)",
    yourPlace: "మీ స్థానం",
    /** @param {string} place */
    near: function (place) {
      return place + " దగ్గర";
    },
    noGeo: "ఈ బ్రౌజర్‌లో స్థానం అందుబాటులో లేదు",
    noPlace: "మీ స్థానం దొరకలేదు",
  },
  // The Sankathara card on Home (js/features/date-card.js)
  card: {
    next: "తర్వాతి సంకటహర చతుర్థి",
    useLocation: "తేదీ, చంద్రోదయం చూపడానికి నా స్థానాన్ని వాడు",
    heads: {
      today: "ఈరోజు సంకటహర చతుర్థి",
      tomorrow: "రేపు సంకటహర చతుర్థి",
      next: "తర్వాతి చతుర్థి",
      previous: "ముందటి సంకటహర చతుర్థి",
      upcoming: "రాబోయే సంకటహర చతుర్థి",
    },
    /** @param {string} t */
    angaraki: function (t) {
      return t.indexOf("సంకటహర") >= 0 ? t.replace("సంకటహర", "అంగారక సంకటహర") : t.replace("చతుర్థి", "అంగారక చతుర్థి");
    },
    /** @param {string} date */
    today: function (date) {
      return "ఈరోజు: " + date;
    },
    /** @param {number} wd @param {number} d @param {number} m @param {number} y */
    fullDate: function (wd, d, m, y) {
      return DAYS.te[wd] + ", " + d + " " + MONTHS.te[m] + " " + y;
    },
    monthsShort: MONTHS.te,
    /** @param {number} d @param {number} m @param {number} y @param {number} wd */
    chip: function (d, m, y, wd) {
      return d + " " + MONTHS.te[m] + " " + y + ", " + DAYS.te[wd];
    },
    chipAng: ", అంగారక",
    more: "మరిన్ని తేదీలు",
    dates: "సంకటహర చతుర్థి తేదీలు",
    back: "↩ తర్వాతి సంకటహర చతుర్థికి తిరిగి",
    addAll: "రాబోయే అన్ని తేదీలను క్యాలెండర్‌కు జోడించు",
    addOne: "క్యాలెండర్‌కు జోడించు",
    /** @param {number} n */
    inDays: function (n) {
      return n + " రోజుల్లో";
    },
    /** @param {string} time */
    moonrise: function (time) {
      return "చంద్రోదయం " + time;
    },
    useMy: "నా స్థానాన్ని వాడు",
    updateMy: "నా స్థానాన్ని నవీకరించు",
    open: "కార్డ్ తెరువు",
    fold: "కార్డ్ మడువు",
    folded: "కార్డ్ మడిచింది · తెరవడానికి దాని పంక్తిని నొక్కండి",
    poojaAt: "ఈరోజు సాయంత్రం 7:00 కి పూజ",
    poojaNow: "పూజ జరుగుతోంది",
    /** @param {number} h @param {number} m */
    moonIn: function (h, m) {
      return "చంద్రోదయానికి " + (h > 0 ? h + " గం " : "") + m + " నిమి";
    },
    downloadedOne: "క్యాలెండర్ ఫైల్ డౌన్‌లోడ్ అయింది; ఈవెంట్ జోడించడానికి దాన్ని తెరవండి",
    downloadedAll: "క్యాలెండర్ ఫైల్ డౌన్‌లోడ్ అయింది; ఈవెంట్‌లు జోడించడానికి దాన్ని తెరవండి",
  },
};
