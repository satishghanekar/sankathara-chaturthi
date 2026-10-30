// Next Sankathara Chaturthi card (computed on this device; works offline)
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { note } from "../core/page.js";
import { menuWords } from "../core/strings.js";
import { esc, lead, mrLang, nameOf, num, second, ui } from "../core/words.js";
import { P, change } from "../core/state.js";
import { SK } from "./astronomy.js";

var SKTZ, SKCITY, skToday, foldTouched, pdMore;
// The next Sankathara Chaturthi, worked out once (js/features/share.js reads it for the Share message)
/** @type {any} */
export var skCache = null;

export function init() {
  // Default place for each time zone: [latitude, longitude, Marathi name, English name]
  SKTZ = {
    "America/New_York": [39.96, -83.0, "कोलंबस", "Columbus, OH"],
    "America/Detroit": [42.33, -83.05, "डेट्रॉइट", "Detroit, MI"],
    "America/Toronto": [43.65, -79.38, "टोरोंटो", "Toronto, ON"],
    "America/Chicago": [41.88, -87.63, "शिकागो", "Chicago, IL"],
    "America/Denver": [39.74, -104.99, "डेन्व्हर", "Denver, CO"],
    "America/Phoenix": [33.45, -112.07, "फिनिक्स", "Phoenix, AZ"],
    "America/Los_Angeles": [34.05, -118.24, "लॉस एंजेलिस", "Los Angeles, CA"],
    "America/Vancouver": [49.28, -123.12, "व्हँकुव्हर", "Vancouver, BC"],
    "Europe/London": [51.51, -0.13, "लंडन", "London, UK"],
    "Asia/Kolkata": [18.52, 73.86, "पुणे", "Pune, Maharashtra"],
    "Asia/Calcutta": [18.52, 73.86, "पुणे", "Pune, Maharashtra"],
    "Asia/Dubai": [25.2, 55.27, "दुबई", "Dubai, UAE"],
    "Asia/Singapore": [1.35, 103.82, "सिंगापूर", "Singapore"],
    "Australia/Sydney": [-33.87, 151.21, "सिडनी", "Sydney, NSW"],
    "Australia/Melbourne": [-37.81, 144.96, "मेलबर्न", "Melbourne, VIC"],
    "Pacific/Auckland": [-36.85, 174.76, "ऑकलंड", "Auckland, New Zealand"],
  };
  // Nearest city to the saved location, from a built-in list (nothing is sent anywhere):
  // a suburb when inside its radius (5th value, km); else a city within 40 km, "near …" within 120 km, otherwise "your location"
  SKCITY = [
    [39.96, -83.0, "कोलंबस", "Columbus, OH"],
    [40.1, -83.11, "डब्लिन", "Dublin, OH", 7],
    [40.2, -83.01, "लुईस सेंटर", "Lewis Center, OH", 7],
    [40.16, -83.08, "पॉवेल", "Powell, OH", 6],
    [40.13, -82.93, "वेस्टरव्हिल", "Westerville, OH", 7],
    [40.09, -83.02, "वर्दिंग्टन", "Worthington, OH", 4],
    [40.3, -83.07, "डेलावेअर", "Delaware, OH", 7],
    [40.03, -83.16, "हिलियर्ड", "Hilliard, OH", 6],
    [39.99, -83.06, "अपर आर्लिंग्टन", "Upper Arlington, OH", 4],
    [39.98, -83.04, "ग्रँडव्ह्यू हाइट्स", "Grandview Heights, OH", 2],
    [39.97, -82.94, "बेक्सली", "Bexley, OH", 2],
    [40.02, -82.88, "गहाना", "Gahanna, OH", 5],
    [40.08, -82.81, "न्यू अल्बानी", "New Albany, OH", 6],
    [39.95, -82.81, "रेनॉल्ड्सबर्ग", "Reynoldsburg, OH", 5],
    [39.88, -82.75, "पिकरिंग्टन", "Pickerington, OH", 6],
    [39.84, -82.8, "कॅनाल विंचेस्टर", "Canal Winchester, OH", 5],
    [39.85, -82.88, "ग्रोव्हपोर्ट", "Groveport, OH", 4],
    [39.88, -83.09, "ग्रोव्ह सिटी", "Grove City, OH", 6],
    [40.11, -83.27, "प्लेन सिटी", "Plain City, OH", 5],
    [40.24, -83.37, "मेरीसव्हिल", "Marysville, OH", 6],
    [40.24, -82.86, "सनबरी", "Sunbury, OH", 5],
    [40.22, -82.88, "गलेना", "Galena, OH", 3],
    [39.1, -84.51, "सिनसिनाटी", "Cincinnati, OH"],
    [41.5, -81.69, "क्लीव्हलँड", "Cleveland, OH"],
    [39.76, -84.19, "डेटन", "Dayton, OH"],
    [41.65, -83.54, "टोलीडो", "Toledo, OH"],
    [41.08, -81.52, "ॲक्रन", "Akron, OH"],
    [40.44, -79.99, "पिट्सबर्ग", "Pittsburgh, PA"],
    [42.33, -83.05, "डेट्रॉइट", "Detroit, MI"],
    [42.28, -83.74, "ॲन आर्बर", "Ann Arbor, MI"],
    [39.77, -86.16, "इंडियानापोलिस", "Indianapolis, IN"],
    [38.25, -85.76, "लुईव्हिल", "Louisville, KY"],
    [38.04, -84.5, "लेक्सिंग्टन", "Lexington, KY"],
    [41.88, -87.63, "शिकागो", "Chicago, IL"],
    [41.75, -88.15, "नेपरव्हिल", "Naperville, IL", 10],
    [43.04, -87.91, "मिलवॉकी", "Milwaukee, WI"],
    [43.07, -89.4, "मॅडिसन", "Madison, WI"],
    [44.98, -93.27, "मिनियापोलिस", "Minneapolis, MN"],
    [38.63, -90.2, "सेंट लुईस", "St. Louis, MO"],
    [39.1, -94.58, "कॅन्सस सिटी", "Kansas City, MO"],
    [41.26, -95.93, "ओमाहा", "Omaha, NE"],
    [41.59, -93.62, "डेस मॉइन", "Des Moines, IA"],
    [40.71, -74.01, "न्यूयॉर्क", "New York, NY"],
    [40.73, -74.08, "जर्सी सिटी", "Jersey City, NJ", 10],
    [40.52, -74.41, "एडिसन", "Edison, NJ", 10],
    [40.36, -74.67, "प्रिन्स्टन", "Princeton, NJ"],
    [39.95, -75.17, "फिलाडेल्फिया", "Philadelphia, PA"],
    [42.36, -71.06, "बॉस्टन", "Boston, MA"],
    [41.76, -72.69, "हार्टफर्ड", "Hartford, CT"],
    [41.05, -73.54, "स्टॅमफर्ड", "Stamford, CT"],
    [42.65, -73.76, "अल्बानी", "Albany, NY"],
    [42.89, -78.88, "बफेलो", "Buffalo, NY"],
    [43.16, -77.61, "रॉचेस्टर", "Rochester, NY"],
    [43.05, -76.15, "सिरॅक्यूज", "Syracuse, NY"],
    [38.91, -77.04, "वॉशिंग्टन डी.सी.", "Washington, DC"],
    [39.29, -76.61, "बाल्टिमोर", "Baltimore, MD"],
    [37.54, -77.44, "रिचमंड", "Richmond, VA"],
    [35.78, -78.64, "रॅले", "Raleigh, NC"],
    [35.99, -78.9, "डरहॅम", "Durham, NC"],
    [35.23, -80.84, "शार्लट", "Charlotte, NC"],
    [35.72, -77.92, "विल्सन", "Wilson, NC"],
    [36.07, -79.79, "ग्रीन्सबरो", "Greensboro, NC"],
    [33.75, -84.39, "अटलांटा", "Atlanta, GA"],
    [36.16, -86.78, "नॅशव्हिल", "Nashville, TN"],
    [35.15, -90.05, "मेम्फिस", "Memphis, TN"],
    [33.52, -86.8, "बर्मिंगहॅम", "Birmingham, AL"],
    [30.33, -81.66, "जॅक्सनव्हिल", "Jacksonville, FL"],
    [28.54, -81.38, "ऑर्लँडो", "Orlando, FL"],
    [27.95, -82.46, "टॅम्पा", "Tampa, FL"],
    [25.76, -80.19, "मायामी", "Miami, FL"],
    [29.95, -90.07, "न्यू ऑर्लिन्स", "New Orleans, LA"],
    [29.76, -95.37, "ह्यूस्टन", "Houston, TX"],
    [32.78, -96.8, "डॅलस", "Dallas, TX"],
    [33.02, -96.7, "प्लेनो", "Plano, TX", 10],
    [30.27, -97.74, "ऑस्टिन", "Austin, TX"],
    [29.42, -98.49, "सॅन अँटोनियो", "San Antonio, TX"],
    [35.47, -97.52, "ओक्लाहोमा सिटी", "Oklahoma City, OK"],
    [39.74, -104.99, "डेन्व्हर", "Denver, CO"],
    [40.76, -111.89, "सॉल्ट लेक सिटी", "Salt Lake City, UT"],
    [33.45, -112.07, "फिनिक्स", "Phoenix, AZ"],
    [35.08, -106.65, "आल्बुकर्की", "Albuquerque, NM"],
    [36.17, -115.14, "लास व्हेगस", "Las Vegas, NV"],
    [34.05, -118.24, "लॉस एंजेलिस", "Los Angeles, CA"],
    [33.68, -117.83, "अर्व्हाइन", "Irvine, CA", 10],
    [32.72, -117.16, "सॅन डिएगो", "San Diego, CA"],
    [37.34, -121.89, "सॅन होजे", "San Jose, CA"],
    [37.55, -121.99, "फ्रिमॉन्ट", "Fremont, CA", 10],
    [37.77, -122.42, "सॅन फ्रान्सिस्को", "San Francisco, CA"],
    [38.58, -121.49, "सॅक्रामेंटो", "Sacramento, CA"],
    [36.74, -119.79, "फ्रेस्नो", "Fresno, CA"],
    [45.52, -122.68, "पोर्टलंड", "Portland, OR"],
    [47.61, -122.33, "सिॲटल", "Seattle, WA"],
    [21.31, -157.86, "होनोलुलु", "Honolulu, HI"],
    [43.65, -79.38, "टोरोंटो", "Toronto, ON"],
    [45.42, -75.7, "ओटावा", "Ottawa, ON"],
    [45.5, -73.57, "मॉन्ट्रियल", "Montreal, QC"],
    [49.9, -97.14, "विनिपेग", "Winnipeg, MB"],
    [51.05, -114.07, "कॅलगरी", "Calgary, AB"],
    [53.55, -113.49, "एडमंटन", "Edmonton, AB"],
    [49.28, -123.12, "व्हँकुव्हर", "Vancouver, BC"],
    [51.51, -0.13, "लंडन", "London, UK"],
    [52.49, -1.89, "बर्मिंगहॅम", "Birmingham, UK"],
    [52.64, -1.13, "लेस्टर", "Leicester, UK"],
    [53.48, -2.24, "मँचेस्टर", "Manchester, UK"],
    [53.35, -6.26, "डब्लिन", "Dublin, Ireland"],
    [48.86, 2.35, "पॅरिस", "Paris, France"],
    [52.37, 4.9, "ॲमस्टरडॅम", "Amsterdam, Netherlands"],
    [50.11, 8.68, "फ्रँकफर्ट", "Frankfurt, Germany"],
    [52.52, 13.4, "बर्लिन", "Berlin, Germany"],
    [47.38, 8.54, "झुरिक", "Zurich, Switzerland"],
    [25.2, 55.27, "दुबई", "Dubai, UAE"],
    [24.45, 54.38, "अबू धाबी", "Abu Dhabi, UAE"],
    [25.29, 51.53, "दोहा", "Doha, Qatar"],
    [23.59, 58.41, "मस्कत", "Muscat, Oman"],
    [1.35, 103.82, "सिंगापूर", "Singapore"],
    [3.14, 101.69, "क्वालालंपूर", "Kuala Lumpur, Malaysia"],
    [22.32, 114.17, "हाँगकाँग", "Hong Kong"],
    [35.68, 139.69, "टोकियो", "Tokyo, Japan"],
    [-33.87, 151.21, "सिडनी", "Sydney, NSW"],
    [-37.81, 144.96, "मेलबर्न", "Melbourne, VIC"],
    [-27.47, 153.03, "ब्रिस्बेन", "Brisbane, QLD"],
    [-34.93, 138.6, "ॲडलेड", "Adelaide, SA"],
    [-31.95, 115.86, "पर्थ", "Perth, WA"],
    [-36.85, 174.76, "ऑकलंड", "Auckland, New Zealand"],
    [19.08, 72.88, "मुंबई", "Mumbai, Maharashtra"],
    [19.22, 72.98, "ठाणे", "Thane, Maharashtra", 10],
    [19.03, 73.03, "नवी मुंबई", "Navi Mumbai, Maharashtra", 10],
    [18.52, 73.86, "पुणे", "Pune, Maharashtra"],
    [20.0, 73.79, "नाशिक", "Nashik, Maharashtra"],
    [21.15, 79.09, "नागपूर", "Nagpur, Maharashtra"],
    [19.88, 75.34, "छत्रपती संभाजीनगर", "Chhatrapati Sambhajinagar, Maharashtra"],
    [16.7, 74.24, "कोल्हापूर", "Kolhapur, Maharashtra"],
    [17.66, 75.91, "सोलापूर", "Solapur, Maharashtra"],
    [16.85, 74.58, "सांगली", "Sangli, Maharashtra"],
    [17.68, 74.02, "सातारा", "Satara, Maharashtra"],
    [16.99, 73.31, "रत्नागिरी", "Ratnagiri, Maharashtra"],
    [19.09, 74.74, "अहिल्यानगर", "Ahilyanagar, Maharashtra"],
    [20.93, 77.75, "अमरावती", "Amravati, Maharashtra"],
    [20.7, 77.0, "अकोला", "Akola, Maharashtra"],
    [21.0, 75.56, "जळगाव", "Jalgaon, Maharashtra"],
    [18.4, 76.56, "लातूर", "Latur, Maharashtra"],
    [19.15, 77.31, "नांदेड", "Nanded, Maharashtra"],
    [15.49, 73.83, "पणजी", "Panaji, Goa"],
    [15.85, 74.5, "बेळगाव", "Belagavi, Karnataka"],
    [12.97, 77.59, "बंगळुरू", "Bengaluru, Karnataka"],
    [12.3, 76.64, "म्हैसूर", "Mysuru, Karnataka"],
    [17.39, 78.49, "हैदराबाद", "Hyderabad, Telangana"],
    [13.08, 80.27, "चेन्नई", "Chennai, Tamil Nadu"],
    [9.93, 76.27, "कोची", "Kochi, Kerala"],
    [28.61, 77.21, "दिल्ली", "Delhi"],
    [28.46, 77.03, "गुरुग्राम", "Gurugram, Haryana", 10],
    [28.54, 77.39, "नोएडा", "Noida, Uttar Pradesh", 10],
    [23.02, 72.57, "अहमदाबाद", "Ahmedabad, Gujarat"],
    [22.31, 73.18, "वडोदरा", "Vadodara, Gujarat"],
    [21.17, 72.83, "सुरत", "Surat, Gujarat"],
    [22.72, 75.86, "इंदूर", "Indore, Madhya Pradesh"],
    [23.26, 77.41, "भोपाळ", "Bhopal, Madhya Pradesh"],
    [26.91, 75.79, "जयपूर", "Jaipur, Rajasthan"],
    [26.85, 80.95, "लखनौ", "Lucknow, Uttar Pradesh"],
    [25.32, 82.97, "वाराणसी", "Varanasi, Uttar Pradesh"],
    [22.57, 88.36, "कोलकाता", "Kolkata, West Bengal"],
  ];
  skCache = null;
  addEventListener("resize", skDot);
  if (document.fonts) document.fonts.ready.then(skDot);
  // Folded card: one slim line with Ganesha, the next Sankathara Chaturthi and moonrise (always the next one,
  // whichever date is picked in the strip). On Sankashti day the card stays open unless folded again that visit.
  skToday = false;
  foldTouched = false;
  document.getElementById("cvb").onclick = function () {
    foldTouched = true;
    change({ fold: document.querySelector("#home .top").classList.contains("fold") ? 0 : 1 }, cardFoldSet);
    // a fold is remembered, so say how to get the card back (it can fold by a tap on Ganesha or Home)
    if (P.fold) note(menuWords("card").folded, 3000);
  };
  // One-hand use: tapping the Ganesha picture folds the card, and tapping the folded slim line opens it
  ["#home .hero", "#slim"].forEach(function (s) {
    var e = document.querySelector(s);
    if (e)
      e.addEventListener("click", function (ev) {
        if (ev.target.closest("#iconb")) return; // the picture opens full screen instead
        document.getElementById("cvb").onclick();
      });
  });
  // "More dates" opens the strip and "Add all upcoming dates" (and on Sankashti day the App/Share/QR/Print/Help row);
  // it starts closed on every visit
  pdMore = false;
  document.addEventListener("click", function (e) {
    if (!e.target.closest || !e.target.closest("#skmore")) return;
    pdMore = !pdMore;
    pdSet();
    // the strip was hidden, so put the chosen date back in the middle of it
    if (pdMore && skCache) skShow(skCache.sel);
  });
  setInterval(skCd, 60000);
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    if (e.target.closest("#skcal")) skIcs();
    else if (e.target.closest("#skall")) skIcs(true);
  });
  // Date strip: tap a date, or use the arrow keys / Home / End; "Back to next Sankathara Chaturthi" returns
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#skc .skch, #skb");
    if (!b || !skCache) return;
    if (b.id === "skb") {
      skShow(skCache.ni);
      var on = document.querySelector("#skc .skch.on");
      if (on) on.focus({ preventScroll: true });
    } else skShow(+b.dataset.k);
  });
  document.addEventListener("keydown", function (e) {
    var b = e.target.closest && e.target.closest("#skc .skch");
    if (!b || !skCache) return;
    var k = skCache.sel,
      n = { ArrowLeft: k - 1, ArrowRight: k + 1, Home: 0, End: skCache.list.length - 1 }[e.key];
    if (n === undefined) return;
    e.preventDefault();
    skShow(n, true);
  });
  // "Use my location" button on the card
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#skl");
    if (!b) return;
    if (!navigator.geolocation) {
      note(menuWords("sankashti").noGeo);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function (p) {
        change({ loc: { lat: Math.round(p.coords.latitude * 100) / 100, lon: Math.round(p.coords.longitude * 100) / 100 } });
        skCache = null;
        skRender();
      },
      function () {
        note(menuWords("sankashti").noPlace);
      },
      { timeout: 15000, maximumAge: 86400000 },
    );
  });
}

// Name for a location: { lat, lon, mr, en }, with own = 1 when no listed city is close
function skNear(lat, lon) {
  var best = null,
    bd = 1e9,
    r = Math.PI / 180;
  var sub = null,
    sd = 1e9;
  SKCITY.forEach(function (c) {
    var a = Math.sin(((c[0] - lat) * r) / 2),
      b = Math.sin(((c[1] - lon) * r) / 2),
      d = 12742 * Math.asin(Math.sqrt(a * a + Math.cos(lat * r) * Math.cos(c[0] * r) * b * b));
    if (c[4]) {
      if (d <= c[4] && d < sd) {
        sd = d;
        sub = c;
      }
    } else if (d < bd) {
      bd = d;
      best = c;
    }
  });
  var wm = menuWords("sankashti", "mr"),
    we = menuWords("sankashti", "en");
  var o = { lat: lat, lon: lon, mr: wm.yourPlace, en: we.yourPlace, own: 1 };
  if (sub) {
    o.mr = sub[2];
    o.en = sub[3];
  } else if (best && bd <= 40) {
    o.mr = best[2];
    o.en = best[3];
  } else if (best && bd <= 120) {
    o.mr = wm.near(best[2]);
    o.en = we.near(best[3]);
  }
  return o;
}

export function skLoc() {
  if (P.loc && typeof P.loc.lat === "number") return skNear(P.loc.lat, P.loc.lon);
  var z = "";
  try {
    z = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {}
  var c = SKTZ[z];
  return c ? { lat: c[0], lon: c[1], mr: c[2], en: c[3] } : null;
}

export function skMid(t) {
  var d = t ? new Date(t) : new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

// Date (with the year when it is not this year) and moonrise text for one Sankashti, in the menu language
// (js/strings/: sankashti), and the moonrise in English for calendar files (ten)
export function skFmt(o) {
  var w = menuWords("sankashti"),
    we = menuWords("sankashti", "en"),
    d = new Date(o.day),
    yr = d.getFullYear() !== new Date().getFullYear(),
    r = o.rise ? new Date(o.rise) : null,
    h = r ? r.getHours() : 0,
    mi = r ? ("0" + r.getMinutes()).slice(-2) : "",
    late = r && r.getDate() !== d.getDate();
  return {
    d: d,
    ang: d.getDay() === 2,
    day: w.day(d.getDay(), d.getDate(), d.getMonth(), yr ? d.getFullYear() : 0),
    time: r ? w.time(h, mi) + (late ? w.late : "") : "—",
    ten: r ? we.time(h, mi) + (late ? we.late : "") : "—",
  };
}

// One phrase of the card in the menu language: a span with the language's code as its class and lang, so the card's
// styles for .mr and .en still apply
function one(t, cls) {
  var l = ui();
  return '<span class="' + (cls ? cls + " " : "") + l + '" lang="' + l + '">' + t + "</span>";
}

export function skRender() {
  var box = document.getElementById("skc"),
    inner = document.getElementById("skx");
  if (!box || !inner) return;
  var L = skLoc();
  // no place yet: no date to count down to, so no ring
  box.classList.toggle("noloc", !L);
  if (!L) {
    box.hidden = false;
    inner.innerHTML =
      '<div class="skh">' +
      one(menuWords("card").next) +
      '</div><button type="button" class="skl" id="skl">📍 ' +
      one(menuWords("card").useLocation) +
      "</button>";
    skSlim();
    pdSet();
    return;
  }
  // The next Sankathara Chaturthi first (fast); then, a moment later, every Sankashti from 1 January last year
  // to the end of next year for the date strip under the card (a few hundred ms on a slow phone)
  var key = L.lat + "," + L.lon + "," + new Date().toDateString();
  if (!skCache || skCache.key !== key) {
    try {
      var first = SK.upcoming(Date.now(), L.lat, L.lon, 1);
    } catch (e) {
      box.hidden = true;
      return;
    }
    if (!first[0]) {
      box.hidden = true;
      return;
    }
    skCache = { key: key, list: first, ni: 0, sel: 0, part: 1 };
    setTimeout(function () {
      if (!skCache || skCache.key !== key) return;
      try {
        var y = new Date().getFullYear(),
          list = SK.upcoming(new Date(y - 1, 0, 1).getTime(), L.lat, L.lon, 40).filter(function (o) {
            return new Date(o.day).getFullYear() <= y + 1;
          }),
          today = skMid();
        for (var k = 0; k < list.length; k++)
          if (list[k].day >= today) {
            skCache = { key: key, list: list, ni: k, sel: k };
            skRender();
            return;
          }
      } catch (e) {}
    }, 50);
  }
  var w = menuWords("card"),
    now = new Date(),
    chips = "",
    lastY = 0;
  skCache.list.forEach(function (o, k) {
    var f = skFmt(o),
      d = f.d,
      Y = d.getFullYear();
    chips +=
      '<button type="button" role="option" class="skch' +
      (k < skCache.ni ? " past" : "") +
      (f.ang ? " ang" : "") +
      '" data-k="' +
      k +
      '" aria-label="' +
      // spoken name: the date as shown on the chip first (WCAG 2.5.3), then the year and weekday
      w.chip(d.getDate(), d.getMonth(), Y, d.getDay()) +
      (f.ang ? w.chipAng : "") +
      '">' +
      one("<b>" + num(d.getDate()) + "</b>" + w.monthsShort[d.getMonth()]) +
      (Y !== lastY ? '<i aria-hidden="true">' + one(num(Y)) + "</i>" : "") +
      "</button>";
    lastY = Y;
  });
  var ph = skCache.part ? ' aria-hidden="true" style="visibility:hidden"' : "";
  box.hidden = false;
  inner.innerHTML =
    '<div class="skt"></div>' +
    // the card's foot: Add to calendar (the date shown, when it is still to come: skShow) and More dates (CSS:
    // #home.skn): everything below it waits behind this button
    '<div class="skft"><span class="skcw"></span>' +
    '<button type="button" class="skmore" id="skmore" aria-expanded="false">' +
    one(w.more) +
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button></div>' +
    '<div class="sktd">' +
    one(w.today(w.fullDate(now.getDay(), now.getDate(), now.getMonth(), now.getFullYear()))) +
    "</div>" +
    // The first, quick render has only the next date. The strip and the "Add all" button are already laid
    // out, invisible, so the card is its full height before the page is shown and nothing below it jumps
    // when the full list arrives (it moved the home page down by about 100px on a phone).
    '<div class="sks"' +
    ph +
    ' role="listbox" aria-orientation="horizontal" aria-label="' +
    w.dates +
    '">' +
    chips +
    "</div>" +
    '<button type="button" class="skl" id="skb" hidden>' +
    one(w.back) +
    "</button>" +
    '<button type="button" class="skl" id="skall"' +
    ph +
    ">" +
    one(w.addAll) +
    "</button>";
  skShow(skCache.sel);
  pdSet();
}

// The card leads with the next Chaturthi date and its moonrise; the date strip, today's date and "Add all upcoming
// dates" wait under "More dates" (CSS: #home.skn, and #home.pmore while open). On Sankashti day itself (#home.pday)
// the moonrise is set large, the contents are larger, and the App/Share/QR/Print/Help row waits under More dates too.
function pdSet() {
  var h = document.getElementById("home"),
    b = document.getElementById("skmore"),
    C = skCache,
    has = !!(C && skLoc() && C.list[C.ni]),
    on = has && Math.round((C.list[C.ni].day - skMid()) / 86400000) === 0;
  if (!h) return;
  h.classList.toggle("skn", has);
  h.classList.toggle("pday", on);
  h.classList.toggle("pmore", has && pdMore);
  if (b) b.setAttribute("aria-expanded", String(has && pdMore));
}

// Hide the "·" before the place name when the name wraps onto its own line
export function skDot() {
  var p = document.querySelector("#skc .skp");
  if (!p) return;
  p.firstChild.hidden = false;
  p.classList.remove("own");
  var vis = [].filter.call(p.parentNode.children, function (e) {
    return e !== p && e.tagName === "SPAN" && e.offsetWidth;
  })[0];
  if (vis && p.offsetTop + p.offsetHeight / 2 > vis.offsetTop + vis.offsetHeight) {
    p.firstChild.hidden = true;
    p.classList.add("own");
  }
}

function skSlim() {
  var t = document.getElementById("slimt");
  if (!t) return;
  var C = skCache,
    o = C && skLoc() && C.list[C.ni];
  if (!o) {
    skToday = false;
    // the same in every language
    t.innerHTML = "<b>" + one("॥ श्री गणेशाय नमः ॥") + "</b>";
    cardFoldSet();
    return;
  }
  var f = skFmt(o),
    w = menuWords("card"),
    dd = Math.round((o.day - skMid()) / 86400000),
    hd = dd === 0 ? w.heads.today : dd === 1 ? w.heads.tomorrow : w.heads.next;
  if (f.ang) hd = w.angaraki(hd);
  skToday = dd === 0;
  t.innerHTML = "<b>" + one(hd) + "</b>" + '<span class="sld">' + one(f.day) + "</span>" + '<span class="slm">' + one(w.moonrise(f.time)) + "</span>";
  cardFoldSet();
}

export function cardFoldSet() {
  var top = document.querySelector("#home .top"),
    b = document.getElementById("cvb");
  if (!top || !b) return;
  var f = !!P.fold && !(skToday && !foldTouched);
  top.classList.toggle("fold", f);
  document.getElementById("slim").hidden = !f;
  b.setAttribute("aria-expanded", String(!f));
  b.setAttribute("aria-label", f ? menuWords("card").open : menuWords("card").fold);
}

// Show one Sankashti in the card and mark its chip in the strip (focus stays where it is)
function skShow(k, focus) {
  var box = document.getElementById("skc"),
    L = skLoc(),
    C = skCache;
  if (!box || !L || !C) return;
  k = Math.max(0, Math.min(C.list.length - 1, k));
  C.sel = k;
  var o = C.list[k],
    f = skFmt(o),
    w = menuWords("card"),
    dd = Math.round((o.day - skMid()) / 86400000);
  var hd = dd === 0 ? w.heads.today : dd === 1 ? w.heads.tomorrow : k === C.ni ? w.heads.next : k < C.ni ? w.heads.previous : w.heads.upcoming;
  if (f.ang) hd = w.angaraki(hd);
  box.className = "skc" + (dd === 0 ? " today" : "");
  var moon =
    '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" fill="currentColor"/></svg>';
  // The heading, then the date large; on the day itself the moonrise is the large line and the date goes under it
  // (Satish, 2026-10-30: the card in one piece, the picture in its ring beside it)
  box.querySelector(".skt").innerHTML =
    '<div class="skh">' +
    one(hd) +
    "</div>" +
    (dd === 0
      ? '<div class="skd skdm">' + moon + one(w.moonrise("<b>" + f.time + "</b>")) + "</div>" + '<div class="skd2">' + one(f.day) + "</div>"
      : '<div class="skd">' + one(f.day) + "</div>") +
    // the chips: the moonrise (on other days) and the place; on the day, the time left before the moonrise first
    '<div class="skm">' +
    '<div class="skcd" hidden></div>' +
    (dd === 0 ? "" : '<span class="skmr">' + moon + one(w.moonrise("<b>" + f.time + "</b>")) + "</span>") +
    // the place as the menus name it (Marathi menus: its Marathi name; Kannada: that in Kannada letters)
    '<span class="skp" lang="' +
    ui() +
    '"><span class="skdt">· </span>' +
    esc(nameOf(L)) +
    '<button type="button" class="skli" id="skl" aria-label="' +
    (L.own ? w.updateMy : w.useMy) +
    '"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg></button>' +
    "</span></div>";
  // Add to calendar in the card's foot, while the date shown is still to come
  var cw = box.querySelector(".skcw");
  if (cw)
    cw.innerHTML =
      o.day + 86400000 > Date.now()
        ? '<button type="button" class="skfb" id="skcal"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg>' +
          one(w.addOne) +
          "</button>"
        : "";
  skRing(k, dd);
  skDot();
  requestAnimationFrame(skDot);
  skSlim();
  skCd();
  box.querySelector("#skb").hidden = k === C.ni;
  var st = box.querySelector(".sks"),
    on = null;
  if (!st) return;
  [].forEach.call(st.children, function (b, i) {
    b.classList.toggle("on", i === k);
    b.setAttribute("aria-selected", String(i === k));
    b.tabIndex = i === k ? 0 : -1;
    if (i === k) on = b;
  });
  st.scrollLeft = on.offsetLeft - (st.clientWidth - on.offsetWidth) / 2;
  if (focus) on.focus({ preventScroll: true });
}

/**
 * The ring round the picture: full on the day, filling as the date shown comes nearer (from the Sankashti before it,
 * else a month of the moon, 29.5 days); empty for a date gone by. Under it, how far the date is, in the reading
 * languages: "28 days" and "२८ दिवस", "उद्या", "आज"
 * @param {number} k the date shown (its place in skCache.list) @param {number} dd days from today
 */
function skRing(k, dd) {
  var C = skCache,
    arc = document.querySelector("#skc .skr1"),
    cnt = document.getElementById("skrc");
  if (!C || !arc || !cnt) return;
  var prev = C.list[k - 1],
    span = prev ? Math.round((C.list[k].day - prev.day) / 86400000) : 29.5,
    frac = dd < 0 ? 0 : dd === 0 ? 1 : Math.max(0.03, Math.min(1, 1 - dd / span)),
    len = 2 * Math.PI * 40;
  arc.setAttribute("stroke-dasharray", (len * frac).toFixed(1) + " " + len.toFixed(1));
  cnt.innerHTML = [lead(), second()]
    .filter(Boolean)
    .map(function (l, i) {
      var c = l === "en" ? "en" : mrLang(),
        w = menuWords("card", c),
        t = dd === 0 ? w.ringToday : dd === 1 ? w.ringTomorrow : dd < 0 ? w.ringAgo(-dd) : w.ringDays(dd);
      return '<span class="' + (i ? "skrc2" : "skrc1") + '" lang="' + c + '">' + esc(t) + "</span>";
    })
    .join("");
}

// True within 120 km of Bharatiya Hindu Temple, Powell OH, where the group meets 7:00–8:30 pm
export function skTemple(L) {
  var r0 = Math.PI / 180,
    a = Math.sin(((L.lat - 40.2148) * r0) / 2),
    b = Math.sin(((L.lon + 83.1067) * r0) / 2);
  return 12742 * Math.asin(Math.sqrt(a * a + Math.cos(L.lat * r0) * Math.cos(40.2148 * r0) * b * b)) <= 120;
}

// On the day: "Pooja today at 7:00 pm" (central Ohio) and "Moonrise in 2 h 10 min"; refreshed every minute
function skCd() {
  var x = document.querySelector("#skc .skcd"),
    C = skCache,
    L = skLoc();
  if (!x || !C || !L) return;
  var o = C.list[C.sel],
    w = menuWords("card"),
    now = Date.now(),
    m = [];
  if (Math.round((o.day - skMid()) / 86400000) !== 0) {
    x.hidden = true;
    return;
  }
  if (skTemple(L)) {
    var d = new Date(o.day),
      t0 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 19, 0).getTime(),
      t1 = t0 + 90 * 60000;
    if (now < t0) m.push(w.poojaAt);
    else if (now < t1) m.push(w.poojaNow);
  }
  if (o.rise && now < o.rise) {
    var mins = Math.ceil((o.rise - now) / 60000),
      h = Math.floor(mins / 60),
      mm = mins % 60;
    m.push(w.moonIn(h, mm));
  }
  x.hidden = !m.length;
  // a chip each (the pooja's time, the time left before the moonrise), so a narrow phone wraps between them
  x.innerHTML = m
    .map(function (t) {
      return '<span class="skcc">' + one(t) + "</span>";
    })
    .join("");
}

// Calendar: .ics events for the program (7:00–8:30 pm), made on this device.
// all = every upcoming Sankashti in the strip; otherwise the one shown in the card
function skIcs(all) {
  var C = skCache,
    L = skLoc();
  if (!C || !L) return;
  var p2 = function (n) {
      return ("0" + n).slice(-2);
    },
    dt = function (d, t) {
      return d.getFullYear() + p2(d.getMonth() + 1) + p2(d.getDate()) + (t ? "T" + p2(d.getHours()) + p2(d.getMinutes()) + "00" : "");
    },
    // Central Ohio: the group meets at the temple; elsewhere, the place name
    loc = skTemple(L) ? "Bharatiya Hindu Temple, 3671 Hyatts Rd, Powell, OH 43065" : L.en,
    today = skMid(),
    items = all
      ? C.list.filter(function (o) {
          return o.day >= today;
        })
      : [C.list[C.sel]],
    stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z",
    L2 = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//sankathara-chaturthi//EN"];
  if (!items.length) return;
  // The group's program runs 7:00–8:30 pm on the day, whatever the moonrise time
  function ev(o) {
    var f = skFmt(o),
      d = new Date(o.day);
    return {
      d: d,
      f: f,
      nm: (f.ang ? "Angaraki " : "") + "Sankathara Chaturthi",
      t0: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 19, 0),
      t1: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 20, 30),
    };
  }
  items.forEach(function (o) {
    var v = ev(o);
    L2.push("BEGIN:VEVENT", "UID:sk-" + dt(v.d) + "@sankathara-chaturthi.pages.dev", "DTSTAMP:" + stamp);
    L2.push("DTSTART:" + dt(v.t0, 1), "DTEND:" + dt(v.t1, 1), "SUMMARY:" + v.nm + " pooja");
    if (o.rise) L2.push("DESCRIPTION:Moonrise " + v.f.ten);
    L2.push("BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + v.nm, "TRIGGER:-PT2H", "END:VALARM");
    L2.push("LOCATION:" + loc.replace(/,/g, "\\,"), "END:VEVENT");
  });
  L2.push("END:VCALENDAR");
  var txt = L2.join("\r\n") + "\r\n",
    u = URL.createObjectURL(new Blob([txt], { type: "text/calendar" })),
    v1 = ev(items[0]);
  // iPhone/iPad: opening the file shows Calendar's "Add" / "Add All" sheet; elsewhere it downloads as an .ics file
  if (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
    location.href = u;
    return;
  }
  function save() {
    var a = document.createElement("a");
    a.href = u;
    a.download = all ? "sankathara-all.ics" : "sankathara-" + dt(v1.d) + ".ics";
    document.body.appendChild(a);
    a.click();
    note(all ? menuWords("card").downloadedAll : menuWords("card").downloadedOne);
    setTimeout(function () {
      URL.revokeObjectURL(u);
      a.remove();
    }, 60000);
  }
  // Android, one date: ask the phone's calendar app for a new, filled-in event (stays on the phone);
  // if no app opens (the page is still showing), download the .ics file instead
  if (!all && /Android/.test(navigator.userAgent)) {
    var e = encodeURIComponent;
    location.href =
      "intent:#Intent;action=android.intent.action.INSERT;type=vnd.android.cursor.dir/event;S.title=" +
      e(v1.nm + " pooja") +
      ";S.eventLocation=" +
      e(loc) +
      (items[0].rise ? ";S.description=" + e("Moonrise " + v1.f.ten) : "") +
      ";l.beginTime=" +
      v1.t0.getTime() +
      ";l.endTime=" +
      v1.t1.getTime() +
      ";end";
    setTimeout(function () {
      if (!document.hidden) save();
    }, 1500);
    return;
  }
  save();
}
