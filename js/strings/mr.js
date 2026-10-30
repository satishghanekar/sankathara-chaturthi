// @ts-check
// The menu words in Marathi (मराठी), every part's under its name, as in js/strings/en.js (js/core/strings.js).

import { DAYS, dv, MONTHS, num } from "../core/words.js";

export default {
  // The print builder's What step: Texts, Today, Routine (js/print/what.js)
  printWhat: {
    what: "काय प्रिंट करायचे",
    search: "रचना शोधा",
    all: "सर्व रचना",
    selectAll: "सर्व निवडा",
    clear: "सर्व काढा",
    none: "अशी रचना नाही",
    /** @param {number} n */
    texts: function (n) {
      return num(n) + " रचना";
    },
    pick: "किमान एक रचना निवडा",
  },
  // The session on Home: its names, how many texts it has, its end (js/features/session-card.js)
  session: {
    sessions: { morning: "सकाळ", afternoon: "दुपार", evening: "संध्याकाळ" },
    /** @param {number} n */
    texts: function (n) {
      return dv(n) + " रचना";
    },
    ended: "या वेळेची उपासना पूर्ण",
  },
  bar: {
    /** @param {string} t */
    home: function (t) {
      return "मुख्य पान: " + t;
    },
    find: "रचना किंवा ओळ शोधा",
  },
  bottomBar: {
    prev: "‹ मागील",
    next: "पुढील ›",
  },
  fold: {
    open: "उघडा",
    fold: "मिटवा",
  },
  languages: {
    both: "दोन्ही",
    second: "+ दुसरी भाषा",
    none: "काहीही नाही",
    refrain: "↻ ध्रुपद",
    close: "बंद करा",
    reset: "मूळ आकार",
    /** @param {string} pct */
    size: function (pct) {
      return "अक्षरांचा आकार " + pct + "%";
    },
  },
  dhrupad: {
    once: "ध्रुपद एकदाच",
    every: "ध्रुपद प्रत्येक कडव्यानंतर",
  },
  settings: {
    /** @param {string} why */
    failed: function (why) {
      return "बदल पूर्ण झाला नाही (" + why + ")";
    },
  },
  pictureViewer: {
    hint: "मोठे करण्यासाठी दोन बोटांनी पसरा किंवा दोनदा टॅप करा",
  },
  offline: {
    state: { idle: "ऑफलाइन तयार", save: "ऑफलाइनसाठी जतन…", off: "जतन केलेली प्रत" },
    // the version line in Settings → More → About: what Check for updates found (under the version), and the round
    // button's name in each state
    update: {
      check: "अपडेट तपासा",
      busy: "नवीन आवृत्ती शोधत आहे…",
      ok: "तुमच्याकडे नवीनतम आवृत्ती आहे",
      off: "इंटरनेट नाही · पुन्हा प्रयत्नासाठी दाबा",
      restart: "जतन झाली. ॲप बंद करून पुन्हा उघडा",
    },
    button: { check: "अपडेट तपासा", busy: "तपासत आहे…", ok: "पुन्हा तपासा", off: "पुन्हा प्रयत्न करा", restart: "अपडेट पूर्ण कसे करायचे" },
    version: "आवृत्ती",
    how: "कसे?",
    // How? after an update saved on Safari, iPhone or iPad: how to close the app and open it again, for each device
    finish: {
      title: "अपडेट पूर्ण करा",
      /** @param {string} v the new version ("1.39.3") */
      saved: function (v) {
        return "आवृत्ती " + v + " या उपकरणावर जतन झाली";
      },
      device: "तुमचे उपकरण",
      kept: "तुमची सेटिंग्ज जशीच्या तशी राहतील.",
      ok: "समजले",
      close: "बंद करा",
      iphone: {
        s1: "स्क्रीनच्या तळापासून वर सरकवा आणि थांबा",
        h1: "उघडी ॲप्स शेजारी शेजारी दिसतील.",
        s2: "हे ॲप वर सरकवून बंद करा",
        h2: "किंवा साइट तिथे उघडी असल्यास Safari. काहीही हरवत नाही.",
        s3: "होम स्क्रीनवरील त्याचे चिन्ह दाबा",
        h3: "ते नवीन आवृत्तीसह उघडेल.",
      },
      ipad: {
        s1: "स्क्रीनच्या तळापासून वर सरकवा आणि थांबा",
        h1: "होम बटण असलेल्या iPad वर ते दोनदा दाबा.",
        s2: "हे ॲप वर सरकवून बंद करा",
        h2: "किंवा साइट तिथे उघडी असल्यास Safari. काहीही हरवत नाही.",
        s3: "होम स्क्रीनवरील त्याचे चिन्ह दाबा",
        h3: "ते नवीन आवृत्तीसह उघडेल.",
      },
      mac: {
        s1: "बंद करण्यासाठी ⌘Q दाबा",
        h1: "Safari, किंवा Dock मध्ये जोडले असल्यास हे ॲप.",
        s2: "ते पुन्हा उघडा",
        h2: "Dock मधून, किंवा Safari उघडून ही साइट.",
      },
    },
    usingSaved: "इंटरनेट नाही. जतन केलेली प्रत वापरत आहे.",
    loading: "नवीन आवृत्ती, उघडत आहे…",
    /** @param {string} v the new version ("v1.37.17") */
    reopen: function (v) {
      return "आवृत्ती " + v + " जतन झाली. पूर्ण करण्यासाठी ॲप बंद करून पुन्हा उघडा.";
    },
  },
  search: {
    /** @param {string} name */
    remove: function (name) {
      return "काढा: " + name;
    },
    nothing: "काही सापडले नाही",
    /** @param {number} n */
    lines: function (n) {
      return (n < 0 ? "४० किंवा अधिक" : dv(n)) + " ओळी सापडल्या";
    },
    /** @param {number} t @param {number} n */
    both: function (t, n) {
      return dv(t) + " रचना आणि " + (n < 0 ? "४० किंवा अधिक" : dv(n)) + " ओळी सापडल्या";
    },
    texts: "रचना",
    linesHead: "ओळी",
  },
  share: {
    tip: "\nफोनवर ॲपसारखे ठेवण्यासाठी: लिंक उघडा आणि होम स्क्रीनवर जोडा (Add to Home Screen) दाबा.",
    /** @param {string} title */
    plain: function (title) {
      return title + " — पूजा आणि आरती";
    },
    temple: " · पूजा सायं. ७:०० ते ८:३०, भारतीय हिंदू मंदिर, पॉवेल",
    /** @param {string} ang @param {string} date @param {string} temple @param {string} rise */
    next: function (ang, date, temple, rise) {
      return ang + "Sankathara Chaturthi: " + date + temple + (rise ? " · चंद्रोदय " + rise : "");
    },
    /** @param {string} url */
    link: function (url) {
      return "\nआरत्या: " + url;
    },
    copied: "संदेश कॉपी झाला",
  },
  print: {
    langs: { mr: "मराठी", kn: "कन्नड", te: "तेलुगू", gu: "गुजराती", en: "इंग्रजी" },
    portrait: "उभे",
    landscape: "आडवे",
    both: "दोन्ही",
    /** @param {string} l1 @param {string} l2 */
    stacked: function (l1, l2) {
      return "उभे: वर " + l1 + ", खाली " + l2;
    },
    side: "आडवे: शेजारी शेजारी",
    preview: "पहिल्या पानाची झलक",
    /** @param {string} paper */
    use: function (paper) {
      return paper + " वापरा";
    },
    cancel: "रद्द",
    linkCopied: "लिंक कॉपी झाली: Safari मध्ये पेस्ट करा",
    pick: "किमान एक रचना निवडा",
  },
  page: {
    appAddToHomeScreen: 'ॲप<span class="sr"> (होम स्क्रीनवर ठेवा)</span>',
    share: "शेअर",
    qrCode: 'QR<span class="sr"> कोड</span>',
    help: "मदत",
    back: "मागे",
    recent: "अलीकडे",
    clear: "सर्व काढा",
    nothingFound: "काही सापडले नाही",
    reading: "वाचन",
    screen: "स्क्रीन",
    more: "अधिक",
    preview: "नमुना",
    languageAndText: "भाषा आणि अक्षरे",
    mainLanguage: "मुख्य भाषा",
    largeText: "मोठ्या अक्षरांत",
    secondLanguage: "दुसरी भाषा",
    smallerUnderEachLine: "लहान, प्रत्येक ओळीखाली",
    show: "दाखवा",
    textSize: "अक्षरांचा आकार",
    textFont: "अक्षरशैली",
    standard: "नेहमीची",
    classic: "पारंपरिक",
    handwritten: "हस्तलिखित",
    verses: "कडवी",
    dhrupad: "ध्रुपद",
    once: "एकदा",
    everyVerse: "प्रत्येक कडव्यानंतर",
    layout: "मांडणी",
    n1Column: "१ स्तंभ",
    n2Columns: "२ स्तंभ",
    menusAndButtons: "मेनू आणि बटणे",
    theme: "रंगसंगती",
    auto: "आपोआप",
    light: "फिकट",
    sepia: "सेपिया",
    dark: "गडद",
    highContrast: "अधिक ठळक",
    keepScreenOn: "स्क्रीन चालू ठेवा",
    afterLastTouch: "शेवटच्या स्पर्शानंतर, मिनिटे",
    off: "बंद",
    about: "माहिती",
    helpAndHowToUse: "मदत आणि वापर",
    addToHomeScreen: "होम स्क्रीनवर ठेवा",
    sankatharaChaturthi: "संकटहर चतुर्थी",
    scanWithTheCameraTo: "उघडण्यासाठी कॅमेऱ्याने स्कॅन करा",
    close: "बंद",
    whatToPrint: "‹ काय प्रिंट करायचे",
    printPdf: "प्रिंट / PDF",
    whatToPrint2: "काय प्रिंट करायचे",
    howToPrint: "कसे प्रिंट करायचे",
    language: "भाषा",
    dhrupad2: "ध्रुपद (धृ)",
    once2: "एकदाच",
    page: "पान",
    printFont: "प्रिंटची अक्षरशैली",
    everyTextStartsOnA: 'प्रत्येक रचना नव्या पानावर सुरू होते. कागद: <b class="prpaper">Letter</b>',
    forLandscapePickItIn: 'आडव्या पानासाठी Safari च्या प्रिंट विंडोतही <span lang="en">Landscape</span> निवडा.',
    pickA4PaperInSafari: 'Safari च्या प्रिंट विंडोतही <span class="przp" lang="en">A4</span> कागद निवडा.',
    chromePrintsItBest: "Chrome मधून प्रिंट अधिक चांगली येते.",
    readyPrintNow: "तयार आहे: प्रिंट करा",
    openInSafari: "Safari मध्ये उघडा",
    copyLink: "लिंक कॉपी करा",
    printingDoesNotOpenFrom:
      "iPhone वर होम स्क्रीनवरील ॲपमधून प्रिंट उघडत नाही. <b>Safari मध्ये उघडा</b> दाबा: तुमच्या निवडी सोबत जातात आणि तिथे प्रिंट तयार होते. Safari उघडले नाही तर लिंक कॉपी करा आणि Safari मध्ये पेस्ट करा.",
    thisBrowserDidNotOpen:
      "या ब्राउझरने प्रिंट विंडो उघडली नाही. ब्राउझरचे <b>शेअर</b> बटण दाबा आणि <b>प्रिंट</b> निवडा. दुसऱ्या ॲपमधून उघडले असल्यास <b>Safari मध्ये उघडा</b> दाबा: तुमच्या निवडी सोबत जातात.",
    nextHowToPrint: "पुढे: कसे प्रिंट करायचे ›",
    print: "प्रिंट",
    addToHomeScreen2: "होम स्क्रीनवर जोडा",
    tapTheShareButtonAt: "शेअर बटण {icon} दाबा (Safari मध्ये खाली, Chrome मध्ये वर उजवीकडे).",
    scrollDownAndTapAdd: 'खाली स्क्रोल करून <b lang="en">Add to Home Screen</b> दाबा.',
    tapAdd: '<b lang="en">Add</b> दाबा.',
    openThisPageInSafari: 'हे पान <b lang="en">Safari</b> किंवा <b lang="en">Chrome</b> मध्ये उघडा (⋯ किंवा शेअर → Open in Safari/Chrome).',
    thenShareAddToHome: 'मग शेअर {icon} → <b lang="en">Add to Home Screen</b> → <b lang="en">Add</b>.',
    openChromeSMenuTop: "Chrome चा <b>⋮</b> मेनू (वर उजवीकडे) उघडा.",
    tapAddToHomeScreen: '<b lang="en">Add to Home screen</b> किंवा <b lang="en">Install app</b> दाबा.',
    tapInstallOrAdd: '<b lang="en">Install</b> किंवा <b lang="en">Add</b> दाबा.',
    clickTheInstallIconAt: 'पत्त्याच्या पट्टीच्या उजव्या टोकाला असलेले Install चिन्ह दाबा, किंवा ब्राउझरच्या मेनूतून <b lang="en">Install</b> निवडा.',
    clickTheShareButtonIn: 'Safari च्या टूलबारवरील शेअर बटण {icon} दाबा, किंवा <b lang="en">File</b> मेनू उघडा.',
    chooseAddToDockThen: '<b lang="en">Add to Dock</b> निवडा, मग <b lang="en">Add</b> दाबा.',
    firefoxCanTAddThis: "Firefox मध्ये हे ॲप म्हणून जोडता येत नाही. हे पान Chrome, Edge किंवा Safari मध्ये उघडा आणि हे बटण पुन्हा दाबा.",
    itWillThenOpenLike: "मग ते ॲपसारखे उघडेल, इंटरनेटशिवायही.",
    ok: "ठीक आहे",
    home: "मुख्यपृष्ठ",
    library: "संग्रह",
    smaller: " लहान",
    larger: " मोठे",
    allSettings: "सर्व सेटिंग्ज",
    settings: "सेटिंग्ज",
    fontThemeLayout: "अक्षरशैली, रंगसंगती, मांडणी",
    defaultSize: "↺ मूळ आकार",
  },
  language: {
    name: "मराठी",
  },
  sankashti: {
    /** @param {number} wd @param {number} d @param {number} m @param {number} y */
    day: function (wd, d, m, y) {
      return DAYS.mr[wd] + ", " + dv(d) + " " + MONTHS.mr[m] + (y ? " " + dv(y) : "");
    },
    /** @param {number} h @param {string} mi */
    time: function (h, mi) {
      return (h >= 20 || h < 4 ? "रात्री " : h >= 16 ? "सायं. " : "") + dv(((h + 11) % 12) + 1) + ":" + dv(mi);
    },
    late: " (मध्यरात्रीनंतर)",
    yourPlace: "तुमचे ठिकाण",
    /** @param {string} place */
    near: function (place) {
      return place + " जवळ";
    },
    noGeo: "हे ब्राउझर ठिकाण देऊ शकत नाही",
    noPlace: "ठिकाण मिळाले नाही",
  },
  card: {
    next: "पुढील संकटहर चतुर्थी",
    useLocation: "तारीख आणि चंद्रोदय पाहण्यासाठी माझे ठिकाण वापरा",
    heads: {
      today: "आज संकटहर चतुर्थी",
      tomorrow: "उद्या संकटहर चतुर्थी",
      next: "पुढील चतुर्थी",
      previous: "मागील संकटहर चतुर्थी",
      upcoming: "आगामी संकटहर चतुर्थी",
    },
    /** @param {string} t */
    angaraki: function (t) {
      return t.indexOf("संकटहर") >= 0 ? t.replace("संकटहर", "अंगारकी संकटहर") : t.replace("चतुर्थी", "अंगारकी चतुर्थी");
    },
    /** @param {string} date */
    today: function (date) {
      return "आज: " + date;
    },
    /** @param {number} wd @param {number} d @param {number} m @param {number} y */
    fullDate: function (wd, d, m, y) {
      return DAYS.mr[wd] + ", " + dv(d) + " " + MONTHS.mr[m] + " " + dv(y);
    },
    monthsShort: ["जाने.", "फेब्रु.", "मार्च", "एप्रि.", "मे", "जून", "जुलै", "ऑग.", "सप्टें.", "ऑक्टो.", "नोव्हें.", "डिसें."],
    /** @param {number} d @param {number} m @param {number} y @param {number} wd */
    chip: function (d, m, y, wd) {
      return (
        dv(d) +
        " " +
        ["जाने.", "फेब्रु.", "मार्च", "एप्रि.", "मे", "जून", "जुलै", "ऑग.", "सप्टें.", "ऑक्टो.", "नोव्हें.", "डिसें."][m] +
        " " +
        dv(y) +
        ", " +
        DAYS.mr[wd]
      );
    },
    chipAng: ", अंगारकी",
    more: "आणखी तारखा",
    dates: "संकटहर चतुर्थीच्या तारखा",
    back: "↩ पुढील तारीख",
    addAll: "सर्व कॅलेंडरमध्ये जोडा",
    older: "‹ मागील वर्षाच्या तारखा",
    addOne: "कॅलेंडरमध्ये जोडा",
    // the count under the card's ring (js/features/date-card.js): how far the date shown is from today
    /** @param {number} n */
    ringDays: function (n) {
      return dv(n) + " दिवस";
    },
    ringToday: "आज",
    ringTomorrow: "उद्या",
    /** @param {number} n */
    ringAgo: function (n) {
      return n === 1 ? "काल" : dv(n) + " दिवसांपूर्वी";
    },
    /** @param {number} n */
    inDays: function (n) {
      return dv(n) + " दिवसांनी";
    },
    /** @param {string} time */
    moonrise: function (time) {
      return "चंद्रोदय " + time;
    },
    useMy: "माझे ठिकाण वापरा",
    updateMy: "माझे ठिकाण बदला",
    open: "कार्ड उघडा",
    fold: "कार्ड मिटवा",
    /** the time left before the moonrise, in the moonrise chip on the day @param {number} h @param {number} m */
    moonLeft: function (h, m) {
      return (h > 0 ? dv(h) + " तास " : "") + dv(m) + " मिनिटांत";
    },
    downloadedOne: "कॅलेंडर फाइल डाउनलोड झाली; ती उघडा",
    downloadedAll: "कॅलेंडर फाइल डाउनलोड झाली; ती उघडा",
  },
};
