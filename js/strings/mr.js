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
    kinds: { all: "सर्व", pooja: "पूजा", bhajan: "भजन", aarti: "आरती" },
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
    simple: "सोपे",
    scholarly: "शास्त्रीय",
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
    // the version line in Settings → About: what Check for updates found (under the version), and the round
    // button's name in each state
    update: {
      check: "अपडेट तपासा",
      busy: "नवीन आवृत्ती शोधत आहे…",
      ok: "तुमच्याकडे नवीनतम आवृत्ती आहे",
      off: "इंटरनेट नाही · पुन्हा प्रयत्नासाठी दाबा",
      restart: "जतन झाली. ॲप बंद करून पुन्हा उघडा",
      failed: "नवीन आवृत्ती जतन झाली नाही · पुन्हा प्रयत्नासाठी दाबा",
    },
    button: {
      check: "अपडेट तपासा",
      busy: "तपासत आहे…",
      ok: "पुन्हा तपासा",
      off: "पुन्हा प्रयत्न करा",
      restart: "अपडेट पूर्ण कसे करायचे",
      failed: "पुन्हा प्रयत्न करा",
    },
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
    notSaved: "नवीन आवृत्ती जतन होऊ शकली नाही. हीच आवृत्ती वापरात राहील.",
    notSavedWhy: "अपडेट जतन झाले नाही",
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
  install: {
    what: "संकष्ट चतुर्थीची पूजा आणि आरत्या, पुढची तारीख आणि चंद्रोदयासह. इंटरनेटशिवायही चालते.",
    install: "ॲप इन्स्टॉल करा",
    installDesk: "या संगणकावर इन्स्टॉल करा",
    oneTap: "एका टॅपमध्ये ते इतर ॲप्सप्रमाणे होम स्क्रीनवर येते. विनामूल्य: ॲप स्टोअर नाही, साइन-इन नाही.",
    orMenu: "किंवा ब्राउझरच्या मेनूतून",
    add: "होम स्क्रीनवर जोडा",
    addMac: "Dock मध्ये जोडा",
    steps: {
      ios26: [
        'खाली पत्त्याच्या पट्टीतील {more} दाबा (किंवा {share} <b lang="en">Share</b> दिसत असल्यास ते)',
        '{share} <b lang="en">Share</b> दाबा',
        'खाली स्क्रोल करून <b lang="en">Add to Home Screen</b> दाबा (किंवा आधी <b lang="en">View More</b>)',
        '<b lang="en">Open as Web App</b> चालू ठेवा, मग <b lang="en">Add</b> दाबा',
      ],
      ios: ["स्क्रीनच्या खाली {share} दाबा", 'खाली स्क्रोल करून <b lang="en">Add to Home Screen</b> दाबा', 'वर उजवीकडे <b lang="en">Add</b> दाबा'],
      ipad: ["वर उजवीकडे {share} दाबा", '<b lang="en">Add to Home Screen</b> दाबा', '<b lang="en">Add</b> दाबा'],
      iosBrowser: [
        "वर उजवीकडे, पत्त्याशेजारी {share} दाबा",
        '<b lang="en">Add to Home Screen</b> दाबा (दिसत नसल्यास खाली स्क्रोल करा)',
        '<b lang="en">Add</b> दाबा',
      ],
      android: ["वर उजवीकडे {menu} दाबा", '<b lang="en">Install app</b> किंवा <b lang="en">Add to Home screen</b> दाबा', '<b lang="en">Install</b> दाबा'],
      samsung: ["खाली उजवीकडे {lines} दाबा", '<b lang="en">Add page to</b>, मग <b lang="en">Home screen</b> दाबा', '<b lang="en">Add</b> दाबा'],
      androidFirefox: ["वर उजवीकडे {menu} दाबा", '<b lang="en">Add app to Home screen</b> दाबा', '<b lang="en">Add</b> दाबा'],
      desktop: ["पत्त्याच्या पट्टीच्या उजव्या टोकाचे इन्स्टॉल चिन्ह क्लिक करा, किंवा ब्राउझरचा मेनू उघडा", '<b lang="en">Install</b> क्लिक करा'],
      mac: [
        'मेनू बारमधील <b lang="en">File</b> किंवा Safari च्या टूलबारमधील {share} क्लिक करा',
        '<b lang="en">Add to Dock…</b>, मग <b lang="en">Add</b> क्लिक करा',
      ],
    },
    safariFirst: "आधी हे पान Safari मध्ये उघडा",
    safariWhy: "या ॲपचा स्वतःचा ब्राउझर होम स्क्रीनवर ॲप जोडू शकत नाही. Safari काही टॅपमध्ये जोडतो.",
    safariOld: '⋯ किंवा होकायंत्राचे चिन्ह दाबून <b lang="en">Open in Safari</b> निवडा. किंवा लिंक कॉपी करून Safari मध्ये पेस्ट करा.',
    openSafari: "Safari मध्ये उघडा",
    chromeFirst: "आधी हे पान Chrome मध्ये उघडा",
    chromeWhy: "या ॲपचा स्वतःचा ब्राउझर ॲप इन्स्टॉल करू शकत नाही. Chrome एका टॅपमध्ये करतो.",
    openChrome: "Chrome मध्ये उघडा",
    copy: "लिंक कॉपी करा",
    copied: "लिंक कॉपी झाली: ब्राउझरच्या पत्त्याच्या पट्टीत पेस्ट करा",
    firefox: "Firefox ॲप इन्स्टॉल करू शकत नाही. हे पान Chrome, Edge किंवा Safari मध्ये उघडा, किंवा खालचा कोड वापरून फोनवर घ्या.",
    phone: "फोनवर हवे?",
    phoneHow: "फोनचा कॅमेरा या कोडवर धरा: त्या फोनसाठीच्या पायऱ्यांसह हेच पान उघडेल.",
    done: "ते होम स्क्रीनवर आले",
    doneHow: "तिथून उघडा: ते इंटरनेटशिवायही चालते.",
    added: "मी जोडले",
    addedHow: "आता होम स्क्रीनवरील त्याच्या चिन्हावरून उघडा: ते इंटरनेटशिवायही चालते.",
    later: "आत्ता नको, ब्राउझरमध्येच वाचा",
    close: "बंद करा",
  },
  share: {
    tip: "\nलिंक उघडा: ॲप फोनवर कसे घ्यायचे ते तिथेच दाखवते.",
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
    /** @param {number} n */
    about: function (n) {
      return "सुमारे " + num(n) + (+n === 1 ? " पान" : " पाने");
    },
    onceHint: "सर्वात कमी पाने: ध्रुपद एकदाच, वर.",
    /** @param {number} n */
    everyHint: function (n) {
      return +n > 0 ? "म्हणतात तसे: ‘एकदाच’ पेक्षा सुमारे " + num(n) + (+n === 1 ? " पान" : " पाने") + " जास्त." : "प्रत्येक कडव्यानंतर ध्रुपद, म्हणतात तसे.";
    },
    upHint: "एका भाषेसाठी उत्तम: पानावर सर्वाधिक मजकूर.",
    /** @param {number} n */
    landHint: function (n) {
      return +n > 0 ? "मोठ्या ओळी: सुमारे " + num(n) + (+n === 1 ? " पान" : " पाने") + " जास्त." : "मोठ्या, रुंद ओळी.";
    },
    /** @param {string} l2 */
    sideHint: function (l2) {
      return "प्रत्येक ओळीशेजारी तिची " + l2 + " ओळ, जुळलेली.";
    },
    // the cover and the closing page of a printout of more than one text (js/print/write.js)
    /** How many texts @param {number} n */
    texts: function (n) {
      return dv(n) + " पाठ";
    },
    sources: "स्रोत",
    /** The day it was printed @param {string} d */
    printed: function (d) {
      return "मुद्रण : " + d;
    },
  },
  // Go to (js/features/where.js): the top bar's title in a long text or a session, and its sheet (#goto)
  goto: {
    title: "येथे जा",
    here: "आपण येथे आहात",
    /** @param {string} where  the text and the places the reading is in */
    open: function (where) {
      return "येथे जा: " + where;
    },
    /** @param {string} name  a heading or a text of the session */
    more: function (name) {
      return name + " मधील ठिकाणे दाखवा";
    },
    /** @param {string} n  the verse number typed */
    none: function (n) {
      return "श्लोक " + n + " येथे नाही";
    },
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
    nothingHint: "कमी अक्षरे किंवा वेगळे स्पेलिंग वापरून पाहा. मराठी आणि इंग्रजी, दोन्ही अक्षरे चालतात.",
    reading: "वाचन",
    goTo: "येथे जा",
    verseNumber: "श्लोक क्रमांक",
    go: "जा",
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
    traditional: "पारंपरिक",
    modern: "आधुनिक",
    bold: "ठळक",
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
    contact: "संपर्क",
    termsOfUse: "वापराच्या अटी",
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
    everyTextStartsOnA: 'मोठी रचना नव्या पानावर सुरू होते; लहान रचना लगेच पुढे. कागद: <b class="prpaper">Letter</b>',
    coverAndClosingPage: "मुखपृष्ठ आणि शेवटचे पान",
    forLandscapePickItIn: 'आडव्या पानासाठी Safari च्या प्रिंट विंडोतही <span lang="en">Landscape</span> निवडा.',
    pickA4PaperInSafari: 'Safari च्या प्रिंट विंडोतही <span class="przp" lang="en">A4</span> कागद निवडा.',
    chromePrintsItBest: "Chrome मधून प्रिंट अधिक चांगली येते, पान क्रमांकांसह.",
    safariPrintsSmaller: "Safari थोडी लहान प्रिंट काढते, पान क्रमांकांशिवाय.",
    recommended: "सुचवलेले",
    readyPrintNow: "तयार आहे: प्रिंट करा",
    openInSafari: "Safari मध्ये उघडा",
    copyLink: "लिंक कॉपी करा",
    printingDoesNotOpenFrom:
      "iPhone वर होम स्क्रीनवरील ॲपमधून प्रिंट उघडत नाही. <b>Safari मध्ये उघडा</b> दाबा: तुमच्या निवडी सोबत जातात आणि तिथे प्रिंट तयार होते. Safari उघडले नाही तर लिंक कॉपी करा आणि Safari मध्ये पेस्ट करा.",
    thisBrowserDidNotOpen:
      "या ब्राउझरने प्रिंट विंडो उघडली नाही. ब्राउझरचे <b>शेअर</b> बटण दाबा आणि <b>प्रिंट</b> निवडा. दुसऱ्या ॲपमधून उघडले असल्यास <b>Safari मध्ये उघडा</b> दाबा: तुमच्या निवडी सोबत जातात.",
    nextHowToPrint: "पुढे: कसे प्रिंट करायचे ›",
    print: "प्रिंट",
    home: "मुख्यपृष्ठ",
    library: "संग्रह",
    smaller: " लहान",
    larger: " मोठे",
    allSettings: "सर्व सेटिंग्ज",
    settings: "सेटिंग्ज",
    fontThemeLayout: "अक्षरशैली, रंगसंगती, मांडणी",
    defaultSize: "↺ मूळ आकार",
  },
  // The launch animation (js/features/launch.js): the first opening of the day
  launch: {
    skip: "पुढे जाण्यासाठी टॅप करा",
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
  welcome: {
    title: "संकटहर चतुर्थी ॲपमध्ये स्वागत",
    app: "संकटहर चतुर्थी",
    points: ["पुढची संकष्टी चतुर्थी आणि पुढच्या सर्व तारखा", "उपवास सोडण्यासाठी तुमच्या गावातील चंद्रोदय", "संध्याकाळचे पाठ: अथर्वशीर्ष, स्तोत्रे आणि आरत्या"],
    facts: ["इंटरनेटशिवाय चालते", "माहिती तुमच्या फोनवरच राहते", "खाते उघडायची गरज नाही"],
    first: "पाठ",
    second: "आणि इंग्रजी",
    next: "पुढे",
    back: "मागे",
    place: "हे तुमचे गाव आहे का?",
    placeNote: "उपवास सोडण्याची वेळ, म्हणजे चंद्रोदय, तुम्ही कुठे आहात त्यावर अवलंबून असते. तुमच्या फोनच्या वेळक्षेत्रावरून अंदाज केला आहे.",
    noPlace: "अजून गाव ठरलेले नाही: खालून निवडा.",
    /** The next date and its moonrise, as the card writes them @param {string} day @param {string} time */
    nextLine: function (day, time) {
      return "पुढची चतुर्थी: " + day + " · चंद्रोदय " + time;
    },
    mine: "माझे नेमके ठिकाण वापरा",
    mineNote: "चंद्रोदयाची अधिक अचूक वेळ. फोन एकदाच विचारेल.",
    city: "किंवा शहर निवडा",
    change: "केव्हाही बदला",
    changeTip: "नेमके ठिकाण वापरण्यासाठी चतुर्थीच्या कार्डवरील गावावर टॅप करा.",
    start: "हो, सुरू करा",
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
  // Wikipedia, named for screen readers (js/core/wiki.js wikiLabel)
  wiki: {
    mr: "विकिपीडिया",
    hi: "हिंदी विकिपीडिया",
    en: "इंग्रजी विकिपीडिया",
    kn: "कन्नड विकिपीडिया",
    te: "तेलुगू विकिपीडिया",
    gu: "गुजराती विकिपीडिया",
    tab: "नवीन टॅबमध्ये उघडेल",
  },
  // The words the site adds to a text (js/strings/en.js)
  text: {
    refrainWord: "ध्रुपद",
    refrainHow: "(प्रत्येक कडव्यानंतर म्हणावे)",
    version: "पाठभेद",
    // who sings, in a text marked with it: the switch under the heading (solo or group), the part this person sings,
    // and each turn's label (js/features/who-sings.js)
    who: {
      sing: "गायन",
      solo: "सोलो",
      group: "समूह",
      part: "माझा भाग",
      lead: "गायक",
      chorus: "कोरस",
      together: "सर्व",
    },
    refrainNote: "↻ ध्रुपद",
    prev: "मागील",
    next: "पुढील",
    by: "रचना :",
    // a name in a sentence, at {name}, so each language puts it where it goes
    attributed: "{name} यांचे मानले जाते",
    also: "(अशीही मान्यता : {name})",
    compiledBy: "संकलन :",
    traditional: "पारंपरिक",
    // the card at the top of a text with a recording: "Listen: Jagjit Singh" (js/text/content.js listenCards())
    listen: "ऐका",
    lang: { sa: "संस्कृत", mr: "मराठी", hi: "हिंदी" },
  },
  // Play mode (js/features/play.js), as in js/strings/en.js
  play: {
    playAll: "सर्व ऐका",
    /** @param {string} n @param {string} all */
    playAllNote: function (n, all) {
      return all + " पैकी " + n + " रचनांचे रेकॉर्डिंग आहे · बाकीच्या वगळल्या जातील";
    },
    bar: "प्लेअर",
    /** @param {string} i @param {string} n */
    playing: function (i, n) {
      return n + " पैकी " + i + " वाजत आहे";
    },
    /** @param {string} i @param {string} n */
    paused: function (i, n) {
      return "थांबवले · " + n + " पैकी " + i;
    },
    /** @param {string} name */
    next: function (name) {
      return "पुढे: " + name;
    },
    last: "शेवटची",
    prev: "मागील",
    pause: "थांबवा",
    resume: "वाजवा",
    nextButton: "पुढील",
    stop: "बंद करा",
    /** @param {string} who */
    here: function (who) {
      return "इथेच ऐका: " + who;
    },
    stopped: "बंद केले · पुढे ऐकण्यासाठी ▶ दाबा",
    /** @param {string} names */
    skipped: function (names) {
      return "रेकॉर्डिंग नाही, वगळले: " + names;
    },
    /** @param {string} name */
    cant: function (name) {
      return name + " आत्ता वाजत नाही: पुढची लावत आहे";
    },
    locked: "फोन लॉक झाल्यावर थांबले · पुढे ऐकण्यासाठी ▶ दाबा",
    tap: "सुरू करण्यासाठी ▶ दाबा",
    /** @param {string} n */
    done: function (n) {
      return "सर्व " + n + " रेकॉर्डिंग ऐकून झाली";
    },
    noYouTube: "YouTube उघडले नाही: इंटरनेट चालू आहे का?",
  },
};
