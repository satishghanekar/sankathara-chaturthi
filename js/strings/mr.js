// @ts-check
// The menu words in Marathi (मराठी), every part's under its name, as in js/strings/en.js (js/core/strings.js).

import { dv, num } from "../core/words.js";

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
    update: { "": "अपडेट तपासा", busy: "तपासत आहे…", ok: "सर्व अद्ययावत आहे", off: "इंटरनेट नाही" },
    usingSaved: "इंटरनेट नाही. जतन केलेली प्रत वापरत आहे.",
    loading: "नवीन आवृत्ती, उघडत आहे…",
    ready: "ऑफलाइन वापरासाठी तयार",
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
    langs: { mr: "मराठी", kn: "कन्नड", en: "इंग्रजी" },
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
};
