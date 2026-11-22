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
  // The session on Home: its names, how many texts it has, its end (js/features/session-card.js)
  session: {
    sessions: { morning: "ఉదయం", afternoon: "మధ్యాహ్నం", evening: "సాయంత్రం" },
    kinds: { all: "అన్నీ", pooja: "పూజ", bhajan: "భజన", aarti: "హారతి" },
    texts: texts,
    ended: "ఈ సమయం ముగిసింది",
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
    simple: "సరళం",
    scholarly: "శాస్త్రీయం",
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
  // Offline use and Check for updates (js/features/offline.js): Settings → About
  offline: {
    state: { idle: "ఆఫ్‌లైన్‌కు సిద్ధం", save: "ఆఫ్‌లైన్ కోసం సేవ్ అవుతోంది…", off: "సేవ్ చేసిన ప్రతి వాడుకలో ఉంది" },
    // the version line in Settings → About: what Check for updates found (under the version), and the round
    // button's name in each state
    update: {
      check: "అప్‌డేట్‌ల కోసం చూడు",
      busy: "కొత్త వెర్షన్ కోసం చూస్తోంది…",
      ok: "మీ దగ్గర తాజా వెర్షన్ ఉంది",
      off: "ఇంటర్నెట్ లేదు · మళ్లీ ప్రయత్నించడానికి నొక్కండి",
      restart: "సేవ్ అయింది. యాప్‌ను మూసి మళ్లీ తెరవండి",
      failed: "కొత్త వెర్షన్ సేవ్ కాలేదు · మళ్లీ ప్రయత్నించడానికి నొక్కండి",
    },
    button: {
      check: "అప్‌డేట్‌ల కోసం చూడు",
      busy: "చూస్తోంది…",
      ok: "మళ్లీ చూడు",
      off: "మళ్లీ ప్రయత్నించండి",
      restart: "అప్‌డేట్‌ను ఎలా పూర్తి చేయాలి",
      failed: "మళ్లీ ప్రయత్నించండి",
    },
    version: "వెర్షన్",
    how: "ఎలా?",
    // How? after an update saved on Safari, iPhone or iPad: how to close the app and open it again, for each device
    finish: {
      title: "అప్‌డేట్‌ను పూర్తి చేయండి",
      /** @param {string} v the new version ("1.39.3") */
      saved: function (v) {
        return "వెర్షన్ " + v + " ఈ పరికరంలో సేవ్ అయింది";
      },
      device: "మీ పరికరం",
      kept: "మీ సెట్టింగ్‌లు అలాగే ఉంటాయి.",
      ok: "సరే",
      close: "మూసివేయి",
      iphone: {
        s1: "స్క్రీన్ కింది నుండి పైకి జరిపి ఆగండి",
        h1: "తెరిచిన యాప్‌లు పక్కపక్కనే కనిపిస్తాయి.",
        s2: "ఈ యాప్‌ను పైకి జరిపి మూసివేయండి",
        h2: "లేదా సైట్ అక్కడ తెరిచి ఉంటే Safari. ఏదీ పోదు.",
        s3: "హోమ్ స్క్రీన్‌లో దాని ఐకాన్ నొక్కండి",
        h3: "ఇది కొత్త వెర్షన్‌తో తెరుచుకుంటుంది.",
      },
      ipad: {
        s1: "స్క్రీన్ కింది నుండి పైకి జరిపి ఆగండి",
        h1: "హోమ్ బటన్ ఉన్న iPadలో దాన్ని రెండుసార్లు నొక్కండి.",
        s2: "ఈ యాప్‌ను పైకి జరిపి మూసివేయండి",
        h2: "లేదా సైట్ అక్కడ తెరిచి ఉంటే Safari. ఏదీ పోదు.",
        s3: "హోమ్ స్క్రీన్‌లో దాని ఐకాన్ నొక్కండి",
        h3: "ఇది కొత్త వెర్షన్‌తో తెరుచుకుంటుంది.",
      },
      mac: {
        s1: "మూసివేయడానికి ⌘Q నొక్కండి",
        h1: "Safari, లేదా Dockకి జోడించి ఉంటే ఈ యాప్.",
        s2: "దాన్ని మళ్లీ తెరవండి",
        h2: "Dock నుండి, లేదా Safari తెరిచి ఈ సైట్.",
      },
    },
    usingSaved: "ఇంటర్నెట్ లేదు. సేవ్ చేసిన ప్రతిని వాడుతున్నాం.",
    loading: "కొత్త వెర్షన్, తెరుచుకుంటోంది…",
    notSaved: "కొత్త వెర్షన్ సేవ్ కాలేదు. ఇదే వెర్షన్ వాడుకలో ఉంటుంది.",
    notSavedWhy: "అప్‌డేట్ సేవ్ కాలేదు",
    /** @param {string} v the new version ("v1.37.17") */
    reopen: function (v) {
      return "వెర్షన్ " + v + " సేవ్ అయింది. పూర్తి చేయడానికి యాప్‌ను మూసి మళ్లీ తెరవండి.";
    },
  },
  // Search and Recent (js/features/search.js)
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
  install: {
    what: "సంకష్ట చతుర్థి పూజ, ఆరతులు, తదుపరి తేదీ మరియు చంద్రోదయంతో. ఇంటర్నెట్ లేకపోయినా పనిచేస్తుంది.",
    install: "యాప్ ఇన్‌స్టాల్ చేయండి",
    installDesk: "ఈ కంప్యూటర్‌లో ఇన్‌స్టాల్ చేయండి",
    oneTap: "ఒక్క నొక్కుతో ఇతర యాప్‌ల లాగే హోమ్ స్క్రీన్‌కు వస్తుంది. ఉచితం: యాప్ స్టోర్ లేదు, సైన్-ఇన్ లేదు.",
    orMenu: "లేదా బ్రౌజర్ మెనూ నుండి",
    add: "హోమ్ స్క్రీన్‌కు జోడించండి",
    addMac: "Dock కు జోడించండి",
    steps: {
      ios26: [
        'కింద చిరునామా పట్టీలో {more} నొక్కండి (లేదా {share} <b lang="en">Share</b> కనిపిస్తే అది)',
        '{share} <b lang="en">Share</b> నొక్కండి',
        'కిందికి జరిపి <b lang="en">Add to Home Screen</b> నొక్కండి (లేదా ముందుగా <b lang="en">View More</b>)',
        '<b lang="en">Open as Web App</b> ఆన్‌లో ఉంచి, <b lang="en">Add</b> నొక్కండి',
      ],
      ios: ["స్క్రీన్ కింద {share} నొక్కండి", 'కిందికి జరిపి <b lang="en">Add to Home Screen</b> నొక్కండి', 'పైన కుడివైపు <b lang="en">Add</b> నొక్కండి'],
      ipad: ["పైన కుడివైపు {share} నొక్కండి", '<b lang="en">Add to Home Screen</b> నొక్కండి', '<b lang="en">Add</b> నొక్కండి'],
      iosBrowser: [
        "పైన కుడివైపు, చిరునామా పక్కన {share} నొక్కండి",
        '<b lang="en">Add to Home Screen</b> నొక్కండి (కనిపించకపోతే కిందికి జరపండి)',
        '<b lang="en">Add</b> నొక్కండి',
      ],
      android: [
        "పైన కుడివైపు {menu} నొక్కండి",
        '<b lang="en">Install app</b> లేదా <b lang="en">Add to Home screen</b> నొక్కండి',
        '<b lang="en">Install</b> నొక్కండి',
      ],
      samsung: [
        "కింద కుడివైపు {lines} నొక్కండి",
        '<b lang="en">Add page to</b>, తర్వాత <b lang="en">Home screen</b> నొక్కండి',
        '<b lang="en">Add</b> నొక్కండి',
      ],
      androidFirefox: ["పైన కుడివైపు {menu} నొక్కండి", '<b lang="en">Add app to Home screen</b> నొక్కండి', '<b lang="en">Add</b> నొక్కండి'],
      desktop: ["చిరునామా పట్టీ కుడి చివర ఇన్‌స్టాల్ గుర్తును క్లిక్ చేయండి, లేదా బ్రౌజర్ మెనూ తెరవండి", '<b lang="en">Install</b> క్లిక్ చేయండి'],
      mac: [
        'మెనూ బార్‌లోని <b lang="en">File</b> లేదా Safari టూల్‌బార్‌లోని {share} క్లిక్ చేయండి',
        '<b lang="en">Add to Dock…</b>, తర్వాత <b lang="en">Add</b> క్లిక్ చేయండి',
      ],
    },
    safariFirst: "ముందుగా ఈ పేజీని Safari లో తెరవండి",
    safariWhy: "ఈ యాప్ సొంత బ్రౌజర్ హోమ్ స్క్రీన్‌కు యాప్‌లను జోడించలేదు. Safari కొన్ని నొక్కులలో జోడిస్తుంది.",
    safariOld: '⋯ లేదా దిక్సూచి గుర్తు నొక్కి <b lang="en">Open in Safari</b> ఎంచుకోండి. లేదా లింక్ కాపీ చేసి Safari లో అతికించండి.',
    openSafari: "Safari లో తెరవండి",
    chromeFirst: "ముందుగా ఈ పేజీని Chrome లో తెరవండి",
    chromeWhy: "ఈ యాప్ సొంత బ్రౌజర్ యాప్‌లను ఇన్‌స్టాల్ చేయలేదు. Chrome ఒక్క నొక్కుతో చేస్తుంది.",
    openChrome: "Chrome లో తెరవండి",
    copy: "లింక్ కాపీ చేయండి",
    copied: "లింక్ కాపీ అయింది: బ్రౌజర్ చిరునామా పట్టీలో అతికించండి",
    firefox: "Firefox యాప్‌లను ఇన్‌స్టాల్ చేయలేదు. ఈ పేజీని Chrome, Edge లేదా Safari లో తెరవండి, లేదా కింది కోడ్‌తో ఫోన్‌లోకి తీసుకోండి.",
    phone: "ఫోన్‌లో కావాలా?",
    phoneHow: "ఫోన్ కెమెరాను ఈ కోడ్ వైపు చూపండి: ఆ ఫోన్ కోసం దశలతో ఇదే పేజీ తెరుచుకుంటుంది.",
    done: "హోమ్ స్క్రీన్‌కు వచ్చింది",
    doneHow: "అక్కడి నుండి తెరవండి: ఇంటర్నెట్ లేకపోయినా పనిచేస్తుంది.",
    added: "జోడించాను",
    addedHow: "ఇప్పుడు హోమ్ స్క్రీన్‌లోని దాని గుర్తు నుండి తెరవండి: ఇంటర్నెట్ లేకపోయినా పనిచేస్తుంది.",
    later: "ఇప్పుడు వద్దు, బ్రౌజర్‌లోనే చదవండి",
    close: "మూసివేయండి",
  },
  // Share (js/features/share.js): the message for the group chat
  share: {
    tip: "\nలింక్ తెరవండి: యాప్‌ను ఫోన్‌లో ఎలా పెట్టుకోవాలో అక్కడే చూపిస్తుంది.",
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
    /** @param {number} n */
    about: function (n) {
      return "సుమారు " + n + (+n === 1 ? " పేజీ" : " పేజీలు");
    },
    onceHint: "తక్కువ పేజీలు: ధ్రుపదం పైన ఒక్కసారే.",
    /** @param {number} n */
    everyHint: function (n) {
      return +n > 0 ? "పాడినట్లే: ‘ఒకసారి’ కంటే సుమారు " + n + (+n === 1 ? " పేజీ" : " పేజీలు") + " ఎక్కువ." : "పాడినట్లే ప్రతి పద్యం తర్వాత ధ్రుపదం.";
    },
    upHint: "ఒక భాషకు ఉత్తమం: పేజీలో ఎక్కువ పాఠం.",
    /** @param {number} n */
    landHint: function (n) {
      return +n > 0 ? "పెద్ద పంక్తులు: సుమారు " + n + (+n === 1 ? " పేజీ" : " పేజీలు") + " ఎక్కువ." : "పెద్ద, వెడల్పైన పంక్తులు.";
    },
    /** @param {string} l2 */
    sideHint: function (l2) {
      return "ప్రతి పంక్తి పక్కనే దాని " + l2 + " పంక్తి, జతగా.";
    },
    // the cover and the closing page of a printout of more than one text (js/print/write.js)
    /** How many texts @param {number} n */
    texts: function (n) {
      return n + " పాఠాలు";
    },
    sources: "మూలాలు",
    /** The day it was printed @param {string} d */
    printed: function (d) {
      return "ముద్రణ: " + d;
    },
  },
  // The page's own words (index.html: data-w="page.…"); {icon} is the icon written in the page
  // Go to (js/features/where.js): the top bar's title in a long text or a session, and its sheet (#goto)
  goto: {
    title: "ఇక్కడికి వెళ్ళండి",
    here: "మీరు ఇక్కడ ఉన్నారు",
    /** @param {string} where  the text and the places the reading is in */
    open: function (where) {
      return "ఇక్కడికి వెళ్ళండి: " + where;
    },
    /** @param {string} name  a heading or a text of the session */
    more: function (name) {
      return name + " లోని స్థలాలు చూపించండి";
    },
    /** @param {string} n  the verse number typed */
    none: function (n) {
      return "శ్లోకం " + n + " ఇక్కడ లేదు";
    },
  },
  page: {
    appAddToHomeScreen: 'యాప్<span class="sr"> (హోమ్ స్క్రీన్‌కు జోడించు)</span>',
    share: "పంచుకో",
    qrCode: 'QR<span class="sr"> కోడ్</span>',
    help: "సహాయం",
    back: "వెనుకకు",
    recent: "ఇటీవలివి",
    clear: "తుడిచివేయి",
    nothingFound: "ఏదీ దొరకలేదు",
    nothingHint: "తక్కువ అక్షరాలు లేదా వేరే స్పెల్లింగ్ ప్రయత్నించండి. మరాఠీ, ఇంగ్లీషు అక్షరాలు రెండూ పనిచేస్తాయి.",
    reading: "పఠనం",
    goTo: "ఇక్కడికి వెళ్ళండి",
    verseNumber: "శ్లోక సంఖ్య",
    go: "వెళ్ళండి",
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
    traditional: "సాంప్రదాయ",
    modern: "ఆధునిక",
    bold: "బోల్డ్",
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
    afterLastTouch: "చివరి స్పర్శ తర్వాత, నిమిషాలు",
    off: "ఆఫ్",
    about: "గురించి",
    contact: "సంప్రదించండి",
    termsOfUse: "వినియోగ నిబంధనలు",
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
    everyTextStartsOnA: 'పెద్ద పాఠాలు కొత్త పేజీలో మొదలవుతాయి; చిన్నవి అదే పేజీలో కొనసాగుతాయి. కాగితం: <b class="prpaper">Letter</b>',
    coverAndClosingPage: "ముఖపత్రం మరియు చివరి పేజీ",
    forLandscapePickItIn: "అడ్డం కోసం, Safari డైలాగ్‌లోనూ దాన్నే ఎంచుకోండి.",
    pickA4PaperInSafari: 'Safari డైలాగ్‌లోనూ <span class="przp">A4</span> కాగితం ఎంచుకోండి.',
    chromePrintsItBest: "Chrome దీన్ని పేజీ సంఖ్యలతో బాగా ముద్రిస్తుంది.",
    safariPrintsSmaller: "Safari కొంచెం చిన్నగా, పేజీ సంఖ్యలు లేకుండా ముద్రిస్తుంది.",
    recommended: "సిఫార్సు",
    readyPrintNow: "సిద్ధం: ఇప్పుడు ముద్రించు",
    openInSafari: "Safari లో తెరువు",
    copyLink: "లింక్ కాపీ చేయి",
    printingDoesNotOpenFrom:
      "iPhone లో హోమ్ స్క్రీన్ యాప్ నుండి ముద్రణ తెరుచుకోదు. <b>Safari లో తెరువు</b> నొక్కండి: మీ ఎంపికలు దానితో వెళ్తాయి, ముద్రణ అక్కడ సిద్ధమవుతుంది. Safari తెరుచుకోకపోతే, లింక్ కాపీ చేసి Safari లో అతికించండి.",
    thisBrowserDidNotOpen:
      'ఈ బ్రౌజర్ ముద్రణ డైలాగ్‌ను తెరవలేదు. బ్రౌజర్ <b lang="en">Share</b> బటన్ నొక్కి <b lang="en">Print</b> ఎంచుకోండి. ఈ పేజీ వేరే యాప్ లోపల తెరుచుకుంటే, <b>Safari లో తెరువు</b> నొక్కండి: మీ ఎంపికలు దానితో వెళ్తాయి.',
    nextHowToPrint: "తర్వాత: ఎలా ముద్రించాలి ›",
    print: "ముద్రించు",
    home: "ముఖపుట",
    library: "సంగ్రహం",
    smaller: " చిన్నది",
    larger: " పెద్దది",
    allSettings: "అన్ని సెట్టింగ్‌లు",
    settings: "సెట్టింగ్‌లు",
    fontThemeLayout: "అక్షర శైలి, థీమ్, అమరిక",
    defaultSize: "↺ మొదటి పరిమాణం",
  },
  // The launch animation (js/features/launch.js): the first opening of the day
  launch: {
    skip: "దాటవేయడానికి నొక్కండి",
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
  welcome: {
    title: "సంకటహర చతుర్థికి స్వాగతం",
    app: "సంకటహర చతుర్థి",
    points: ["తదుపరి సంకష్టి చతుర్థి, ఆ తర్వాతి అన్ని తేదీలు", "ఉపవాసం విరమించడానికి మీ ఊరిలో చంద్రోదయం", "సాయంత్రపు పాఠాలు: అథర్వశీర్షం, స్తోత్రాలు, హారతులు"],
    facts: ["ఇంటర్నెట్ లేకుండా పనిచేస్తుంది", "సమాచారం మీ ఫోన్‌లోనే ఉంటుంది", "ఖాతా తెరవాల్సిన అవసరం లేదు"],
    first: "పాఠాలు",
    second: "మరియు ఇంగ్లీష్",
    next: "ముందుకు",
    back: "వెనక్కి",
    place: "ఇది మీ ఊరేనా?",
    placeNote: "ఉపవాసం విరమించే సమయం, అంటే చంద్రోదయం, మీరు ఎక్కడ ఉన్నారో దానిపై ఆధారపడుతుంది. మీ ఫోన్ సమయ మండలం నుండి ఊహించాం.",
    noPlace: "ఇంకా ఊరు ఎంచుకోలేదు: కింద నుండి ఎంచుకోండి.",
    /** The next date and its moonrise, as the card writes them @param {string} day @param {string} time */
    nextLine: function (day, time) {
      return "తదుపరి చతుర్థి: " + day + " · చంద్రోదయం " + time;
    },
    mine: "నా ఖచ్చితమైన స్థానాన్ని వాడండి",
    mineNote: "మరింత ఖచ్చితమైన చంద్రోదయం. ఫోన్ ఒక్కసారే అడుగుతుంది.",
    city: "లేదా నగరాన్ని ఎంచుకోండి",
    change: "ఎప్పుడైనా మార్చండి",
    changeTip: "ఖచ్చితమైన స్థానం కోసం చతుర్థి కార్డ్‌పై ఉన్న ఊరిని నొక్కండి.",
    start: "అవును, ప్రారంభించు",
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
    back: "↩ తర్వాతి తేదీ",
    addAll: "అన్నీ క్యాలెండర్‌కు జోడించు",
    older: "‹ గత సంవత్సరం తేదీలు",
    addOne: "క్యాలెండర్‌కు జోడించు",
    // the count under the card's ring (js/features/date-card.js): how far the date shown is from today
    /** @param {number} n */
    ringDays: function (n) {
      return n + " రోజులు";
    },
    ringToday: "ఈరోజు",
    ringTomorrow: "రేపు",
    /** @param {number} n */
    ringAgo: function (n) {
      return n === 1 ? "నిన్న" : n + " రోజుల క్రితం";
    },
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
    /** the time left before the moonrise, in the moonrise chip on the day @param {number} h @param {number} m */
    moonLeft: function (h, m) {
      return (h > 0 ? h + " గం " : "") + m + " నిమిషాల్లో";
    },
    downloadedOne: "క్యాలెండర్ ఫైల్ డౌన్‌లోడ్ అయింది; ఈవెంట్ జోడించడానికి దాన్ని తెరవండి",
    downloadedAll: "క్యాలెండర్ ఫైల్ డౌన్‌లోడ్ అయింది; ఈవెంట్‌లు జోడించడానికి దాన్ని తెరవండి",
  },
  // Wikipedia, named for screen readers (js/core/wiki.js wikiLabel)
  wiki: {
    mr: "మరాఠీ వికీపీడియా",
    hi: "హిందీ వికీపీడియా",
    en: "ఇంగ్లీష్ వికీపీడియా",
    kn: "కన్నడ వికీపీడియా",
    te: "వికీపీడియా",
    gu: "గుజరాతీ వికీపీడియా",
    tab: "కొత్త ట్యాబ్‌లో తెరుచుకుంటుంది",
  },
  // The words the site adds to a text (js/strings/en.js)
  text: {
    refrainWord: "ధ్రువపదం",
    refrainHow: "(ప్రతి చరణం తర్వాత పాడండి)",
    version: "పాఠభేదం",
    refrainNote: "↻ ధ్రువపదం",
    prev: "మునుపటి",
    next: "తరువాతి",
    by: "రచన :",
    // a name in a sentence, at {name}, so each language puts it where it goes
    attributed: "{name} రచించినట్లు ప్రతీతి",
    also: "(వీరిదని కూడా అంటారు : {name})",
    compiledBy: "సంకలనం :",
    traditional: "సాంప్రదాయికం",
    lang: { sa: "సంస్కృతం", mr: "మరాఠీ", hi: "హిందీ" },
  },
};
