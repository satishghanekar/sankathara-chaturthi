/* =====================================================================
   SCRIPT
   Everything runs once when the page loads. Sections are marked
   "// ---- name ----". Settings live in P and are saved on this device
   only (localStorage key "aarti2-prefs"); apply() turns P into the
   data-* switches on <html> that the styles react to.

   Sections, in order:
     Settings (P)            what the reader chose, and migrations
     Features held back      FEAT_AS: autoscroll, FEAT_TL: tilt to scroll;
                             both built but hidden until released
     IAST transliteration    IA(): Devanagari line → scholarly English;
                             run once at start-up when English style = sukhakartā
     Layout helpers          two-column grid rows, contents rail
     Astronomy               sunrise/moonrise and lunar dates (no internet)
     Next Sankashti card     date, moonrise, location, date strip,
                             calendar (.ics), on-the-day countdown
     Dhrupad markers         tappable ↻ ध्रुपद pop-ups
     Stanza numbers          ॥ १ ॥ added at the end of each stanza
     Preferred line breaks   where long lines may wrap on phones
     Auto-fit text size      largest size at which lines fit the screen
     Current piece, apply()  menus follow the reader; folds; P → page
     Bottom bar, autoscroll  footer menu on every page (Prev, Home,
                             Contents, Next); autoscroll (held back);
                             tilt to scroll (phones and tablets)
     Settings panel, buttons dhrupad, wake lock, overlays, clicks, pinch
     Search                  every line in both scripts and both spellings
     Start-up                first paint, reading position, help
     Print                   builds the print view (#pv) just before printing
     Share, QR               reminder text, QR pop-up, install tip
     Offline use             service worker (sw.js) and its version (aarti-v1.0)
   ===================================================================== */
(function () {
  var root = document.documentElement;
  // Safari and every iOS browser (WebKit) need a different print layout trick; mark them with class "wk"
  (function (u) {
    if (/AppleWebKit/.test(u) && !/Chrome\/|Chromium|Edg\/|OPR\//.test(u)) root.classList.add("wk");
  })(navigator.userAgent);
  var secs = [].slice.call(document.querySelectorAll(".ash")),
    bt = document.getElementById("bt");
  // Icons for the language button (Marathi / English / Both)
  var LI = {
    mr: '<svg viewBox="0 0 40 34" width="40" height="34" aria-hidden="true"><rect x="14" y="3" width="20" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".55"/><text x="24" y="16.5" text-anchor="middle" font-size="12" font-weight="600" style="fill:currentColor;font-family:var(--lat)" opacity=".55">A</text><rect x="4" y="11" width="20" height="18" rx="4" style="fill:var(--accent)"/><text x="14" y="25" text-anchor="middle" font-size="14" style="fill:var(--bg);font-family:var(--head)">अ</text></svg>',
    en: '<svg viewBox="0 0 40 34" width="40" height="34" aria-hidden="true"><rect x="4" y="3" width="20" height="18" rx="4" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".55"/><text x="14" y="16.5" text-anchor="middle" font-size="13" style="fill:currentColor;font-family:var(--head)" opacity=".55">अ</text><rect x="14" y="11" width="20" height="18" rx="4" style="fill:var(--accent)"/><text x="24" y="24.5" text-anchor="middle" font-size="12" font-weight="600" style="fill:var(--bg);font-family:var(--lat)">A</text></svg>',
    both: '<svg viewBox="0 0 44 34" width="42" height="34" aria-hidden="true"><rect x="2" y="8" width="19" height="18" rx="4" style="fill:var(--accent)"/><text x="11.5" y="22" text-anchor="middle" font-size="14" style="fill:var(--bg);font-family:var(--head)">अ</text><rect x="23" y="8" width="19" height="18" rx="4" style="fill:var(--accent)"/><text x="32.5" y="21.5" text-anchor="middle" font-size="12" font-weight="600" style="fill:var(--bg);font-family:var(--lat)">A</text></svg>',
    // Both, English first (Settings → In Both, show first): the same two cards, A on the left
    bothEn: '<svg viewBox="0 0 44 34" width="42" height="34" aria-hidden="true"><rect x="2" y="8" width="19" height="18" rx="4" style="fill:var(--accent)"/><text x="11.5" y="21.5" text-anchor="middle" font-size="12" font-weight="600" style="fill:var(--bg);font-family:var(--lat)">A</text><rect x="23" y="8" width="19" height="18" rx="4" style="fill:var(--accent)"/><text x="32.5" y="22" text-anchor="middle" font-size="14" style="fill:var(--bg);font-family:var(--head)">अ</text></svg>',
  };
  // In Kannada letters the cards show ಕ in place of अ
  if (SCR.k)
    for (var k in LI) LI[k] = LI[k].replace('font-family:var(--head)">अ<', "font-family:'Noto Sans Kannada'\">ಕ<");
  // Icons for the dhrupad button: repeated after every stanza / shown once
  var RB_LOOP =
      '<svg viewBox="0 0 38 38" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M31 19a12 12 0 1 1-4-8.9"/><path d="M27.5 5.5v5h-5"/><text x="19" y="24.5" text-anchor="middle" font-size="14" stroke="none" fill="currentColor" style="font-family:var(--head)">धृ</text></svg>',
    RB_ONCE =
      '<svg viewBox="0 0 38 38" width="34" height="34" fill="none" aria-hidden="true"><text x="16.5" y="26" text-anchor="middle" font-size="19" fill="currentColor" style="font-family:var(--head)">धृ</text><text x="30" y="15" text-anchor="middle" font-size="12" font-weight="700" fill="currentColor" style="font-family:var(--lat)">1</text></svg>';
  // Short message in the middle of the screen (Marathi text m, English text e)
  function flash(m, e) {
    var x = document.getElementById("szt");
    x.textContent = P.ui === "en" ? e : m;
    x.classList.remove("err");
    x.classList.add("msg", "on");
    clearTimeout(flash.t);
    flash.t = setTimeout(function () {
      x.classList.remove("on", "msg");
    }, 1600);
  }

  // ---- Settings (P), loaded from this device ----
  var K = "aarti2-prefs";
  // Default text size: 28px on tablets, 24px on phones and computers (auto-fit may lower it).
  function dfs() {
    var s = Math.min(screen.width || innerWidth, screen.height || innerHeight),
      co = window.matchMedia && matchMedia("(pointer:coarse)").matches;
    return co && s >= 600 ? 28 : 24;
  }
  // A computer (no touch screen): the screen is kept on only if the reader turns it on
  var DESK = !!(window.matchMedia && !matchMedia("(any-pointer:coarse)").matches);
  var P = {
    sv: 0, // settings version (see migrations below)
    fs: dfs(), // text size in px
    fsu: 0, // 1 = the reader chose the size (A−/A+/pinch), so auto-fit leaves it alone
    th: "auto", // theme: auto | light | sepia | dark
    lang: "mr", // shown now (the अ/A button): the main language, the second, or both
    lead: "mr", // main language (large text, first in Both): mr | en (Settings → Main language)
    l2: "en", // second language (smaller, under each line): en | mr, or "" for none (Settings → Second language)
    ui: "en", // menus, home page and buttons: en | mr (English, or the main language)
    ind: "mr", // which language the "mr" slot above shows: mr (Marathi, as written) | kn (the same words in Kannada
    // letters, made by SCR in js/render.js while the page loads). There are no Kannada menus yet, so menus stay English.
    ref: 1, // dhrupad: 1 = once at the top, 0 = repeated after every stanza
    hc: 0, // high contrast
    wake: DESK ? 0 : 1, // keep the screen on (phones and tablets; off by default on computers)
    cols: 0, // wide screens: 0 = automatic, 1 = one column, 2 = two columns
    loc: null, // { lat, lon } from "Use my location"
    hl: "", // data-l id of the highlighted (tapped) line
    fnt: "std", // text font: std | classic | bold | hand (Settings → Text font)
    tr: "simple", // English text style: simple ("Sukhkarta") | iast ("sukhakartā", with Vedic accent marks)
    fold: 0, // home card folded to one slim line
    pf: 0, // Pooja section folded (for those who come only for the aartis)
    xf: 0, // Aarti section folded
    tf: 0, // home contents list folded
    af: [], // ids of folded pieces
    as: 3, // autoscroll speed for an aarti not yet adjusted, 1 (slow) to 10 (fast)
    ason: 0, // show the autoscroll button in the bottom bar (Settings switch)
    asp: {}, // autoscroll speed per piece (each has its own tempo): { a1: 3, p1: 4, … }
  };
  try {
    var s = JSON.parse(localStorage.getItem(K) || "{}");
    for (var k in P) {
      if (s[k] !== undefined) P[k] = s[k];
    }
  } catch (e) {}
  // Migrations for settings saved by older versions of the site
  if (P.sv < 4) {
    if (P.sv < 3) P.ref = 1; // v3: dhrupad shown once by default
    P.wake = 1; // v4: keep screen on by default
    P.sv = 4;
    save();
  }
  if (P.sv < 5) {
    if (DESK) P.wake = 0; // v5: computers no longer keep the screen on by default
    P.sv = 5;
    save();
  }
  if (P.sv < 6) {
    // v6: a main and a second language; "In Both, show first" became the main language
    P.l2 = P.lead === "en" ? "mr" : "en";
    P.sv = 6;
    save();
  }
  // Keep the language choices consistent: two different languages, English menus when English is the main one,
  // and only the chosen languages shown
  if (P.lead !== "en") P.lead = "mr";
  if (P.l2 === P.lead || ["mr", "en", ""].indexOf(P.l2) < 0) P.l2 = P.lead === "en" ? "mr" : "en";
  if (P.ind !== "kn") P.ind = "mr";
  if (P.lead === "en" || P.ind !== "mr") P.ui = "en";
  if (!P.l2 || [P.lead, P.l2, "both"].indexOf(P.lang) < 0) P.lang = P.lead;

  // ---- Features held back for a later release ----
  // Autoscroll (the ▶ in the bottom bar, its Settings switch and its Help entry) is built and tested but not
  // released yet. With FEAT_AS false the switch and Help entry (data-feat="as") stay hidden, the ▶ never shows
  // and asStart() does nothing. A reader's saved choice (P.ason) is left as it is, so nothing is lost.
  // To release it: set FEAT_AS to true. Nothing else needs changing.
  var FEAT_AS = false;
  if (FEAT_AS)
    [].forEach.call(document.querySelectorAll('[data-feat="as"]'), function (e) {
      e.hidden = false;
    });
  // Tilt to scroll (the tilted-phone button in the bottom bar and its Help entry, data-feat="tl") is built and
  // tested the same way. With FEAT_TL false the button never shows (data-tilt is not set), so it can't start.
  // To release it: set FEAT_TL to true. Nothing else needs changing.
  var FEAT_TL = false;
  if (FEAT_TL)
    [].forEach.call(document.querySelectorAll('[data-feat="tl"]'), function (e) {
      e.hidden = false;
    });

  // ---- IAST transliteration (Devanagari → Latin with diacritics, Vedic accents as marks) ----
  var IA = (function () {
    var C = {
      क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "ṅ", च: "c", छ: "ch", ज: "j", झ: "jh", ञ: "ñ",
      ट: "ṭ", ठ: "ṭh", ड: "ḍ", ढ: "ḍh", ण: "ṇ", त: "t", थ: "th", द: "d", ध: "dh", न: "n",
      प: "p", फ: "ph", ब: "b", भ: "bh", म: "m", य: "y", र: "r", ल: "l", ळ: "ḷ", व: "v",
      श: "ś", ष: "ṣ", स: "s", ह: "h",
    };
    var NK = { ड: "ṛ", ढ: "ṛh", क: "q", ख: "x", ग: "ġ", ज: "z", फ: "f" }; // with nukta (Hindi)
    var V = { अ: "a", आ: "ā", इ: "i", ई: "ī", उ: "u", ऊ: "ū", ऋ: "ṛ", ॠ: "ṝ", ऌ: "ḷ", ए: "e", ऐ: "ai", ओ: "o", औ: "au" };
    var M = { "ा": "ā", "ि": "i", "ी": "ī", "ु": "u", "ू": "ū", "ृ": "ṛ", "ॄ": "ṝ", "े": "e", "ै": "ai", "ो": "o", "ौ": "au" };
    var S = { "॑": "̍", "॒": "̱", "᳚": "̎" }; // svarita, anudatta, dirgha svarita
    var O = { "ॐ": "om̐", "ऽ": "'", "।": "|", "॥": "||" };
    return function (t) {
      t = SCR.from(t); // from Kannada letters back to the Devanagari the rules below read
      var o = "",
        i = 0,
        n = t.length,
        c,
        v;
      while (i < n) {
        c = t[i];
        v = null;
        if (C[c]) {
          var k = C[c];
          i++;
          if (t[i] === "़") {
            k = NK[c] || k;
            i++;
          }
          if (t[i] === "्") {
            o += k;
            i++;
            continue;
          }
          if (M[t[i]]) v = M[t[i++]];
          else v = "a";
          o += k;
        } else if (V[c]) {
          v = V[c];
          i++;
        } else if (O[c]) {
          o += O[c];
          i++;
          continue;
        } else if (c >= "०" && c <= "९") {
          o += c.charCodeAt(0) - 0x966;
          i++;
          continue;
        } else {
          // a stray mark attaches to what came before; anything else passes through
          o += S[c] || (c === "ं" ? "ṃ" : c === "ः" ? "ḥ" : c === "ँ" ? "m̐" : c);
          i++;
          continue;
        }
        // the syllable's accent marks go on its vowel, then any anusvara / visarga / chandrabindu
        var acc = "",
          tail = "";
        while (i < n && (S[t[i]] || t[i] === "ं" || t[i] === "ः" || t[i] === "ँ")) {
          c = t[i++];
          if (S[c]) acc += S[c];
          else tail += c === "ं" ? "ṃ" : c === "ः" ? "ḥ" : "m̐";
        }
        o += v + acc + tail;
      }
      // An anusvara inside a word before a stop takes that stop's nasal: sarvāṅgī, sundara, vakratuṇḍa, lambodara.
      // Marathi plural endings keep ṃ: sumanāṃcyā, ḍoḷyāṃnī, kleśāṃpāsuni; so do nasal vowels: kaiṃcā, bāṃjhana.
      return o.replace(/(ā?)ṃ(?=(k|g)|(c|j)|(ṭ|ḍ)|(t|d|n)|(p|b|m))/g, function (x, l, a, b, c, d, e, i) {
        var r = o.slice(i + x.length);
        if (l && /^(c(?!h)|n|pās|jh)/.test(r)) return x;
        if (o.slice(i - 2, i) === "ai" && /^c/.test(r)) return x;
        return l + (a ? "ṅ" : b ? "ñ" : c ? "ṇ" : d ? "n" : "m");
      });
    };
  })();
  // English style. Each English line keeps its everyday text and its Marathi/Sanskrit source (taken here, before
  // anything else touches the lines), so the style switches in place without reloading (trSet). The scholarly
  // (IAST) text is made the first time it is needed. ENS keeps the everyday text so search still finds "sukhakarta".
  var ENS = {},
    TRL = [],
    TRT = [];
  [].forEach.call(document.querySelectorAll(".verse"), function (v) {
    // Marathi and English lines pair up by position (refrain boxes have no data-l)
    var ms = v.querySelectorAll(":scope>.mr>p");
    [].forEach.call(v.querySelectorAll(":scope>.en>p"), function (p, i) {
      var id = p.getAttribute("data-l"),
        m = ms[i];
      if (!m) return;
      if (id) ENS[id] = p.textContent;
      TRL.push({ p: p, s: p.innerHTML, m: m.innerHTML, i: null });
    });
  });
  // Piece titles: headings, contents, Previous/Next, and the left menu and search list (copies of the contents)
  [].forEach.call(document.querySelectorAll(".ash"), function (sec) {
    var h = sec.querySelector("header h2"),
      m = h && h.querySelector(":scope > .mr"),
      e = h && h.querySelector(":scope > .en");
    if (m && e) TRT.push({ id: sec.id, s: e.textContent, m: m.textContent, i: null });
  });
  // fin: the stanza numbers and line-break parts are already in place, so carry them over
  function trSet(st, fin) {
    var ia = st === "iast";
    TRL.forEach(function (x) {
      var p = x.p,
        sn = fin && p.querySelector(".sn");
      if (ia && x.i === null) x.i = x.m.split(/<br\s*\/?>/).map(IA).join("<br>");
      p.innerHTML = ia ? x.i : x.s;
      p.classList.toggle("ia", ia);
      if (sn) p.appendChild(sn);
      if (fin) zsplit(p, enCut, "");
    });
    TRT.forEach(function (t) {
      if (ia && t.i === null)
        t.i = IA(t.m).replace(/(^|[\s(])([^\s(])/g, function (x, a, c) {
          return a + c.toUpperCase();
        });
      var v = ia ? t.i : t.s;
      [].forEach.call(
        document.querySelectorAll("#" + t.id + ' header h2 > .en, a[data-go="' + t.id + '"] .en'),
        function (e) {
          if (!e.closest("small, .lt")) e.textContent = v; // not the language tag in the home list
        },
      );
    });
  }
  if (P.tr === "iast") trSet("iast", false);

  // ---- Layout helpers that run once ----
  // Two-column screens read across: stanza 1 | stanza 2, then 3 | 4. Each stanza keeps its own dhrupad marker/repeat under it.
  // Two stanzas of very different length (Atharvashirsha: 7 lines beside 1) don't pair: the first goes alone across both columns.
  function nLines(e) {
    return e.querySelectorAll(".verse > .mr > p").length || e.querySelectorAll("p").length || 1;
  }
  [].forEach.call(document.querySelectorAll(".items"), function (b) {
    var row = 1,
      pair = [],
      lone = false,
      cur = null;
    function flush() {
      if (!pair.length) return;
      var h = 0;
      pair.forEach(function (g, i) {
        g.forEach(function (e, k) {
          e.style.gridRow = String(row + k);
          e.style.gridColumn = lone ? "1 / -1" : String(i + 1);
          if (i) e.classList.add("c2");
          else if (!lone) e.classList.add("c1");
        });
        h = Math.max(h, g.length);
      });
      row += h;
      pair = [];
      lone = false;
    }
    function full(e) {
      flush();
      e.style.gridRow = String(row++);
      e.style.gridColumn = "1 / -1";
    }
    [].forEach.call(b.children, function (e) {
      var main = e.classList.contains("item") && !e.classList.contains("rf");
      if (main && e.classList.contains("dh")) {
        cur = null;
        full(e);
        return;
      }
      if (main) {
        if (pair.length === 2) flush();
        if (pair.length === 1) {
          var a = nLines(pair[0][0]),
            c = nLines(e);
          if (Math.abs(a - c) > 1 && Math.min(a, c) * 2 < Math.max(a, c)) {
            lone = true;
            flush();
          }
        }
        cur = [e];
        pair.push(cur);
        return;
      }
      if (cur) cur.push(e);
      else full(e);
    });
    flush();
  });
  // Desktop + Both: each Marathi line sits beside its English line (rows matched by position)
  [].forEach.call(document.querySelectorAll(".verse"), function (v) {
    [".mr", ".en"].forEach(function (c) {
      var b = v.querySelector(":scope>" + c);
      if (b)
        [].forEach.call(b.children, function (p, i) {
          if (p.tagName === "P") p.style.gridRow = String(i + 1);
        });
    });
  });
  // Contents rail (wide screens), built from the home contents
  (function () {
    var r = document.getElementById("rail");
    if (!r) return;
    var h = "";
    [].forEach.call(document.querySelectorAll(".tocg"), function (g) {
      var as = g.querySelectorAll("ol.toc li a");
      if (!as.length) return;
      // the group name is a link to its section row (पूजा → Pooja, आरती → Aarti)
      var gh = g.querySelector(".gh"),
        gid = /पूजा/.test(gh.textContent) ? "g-pooja" : /आरती/.test(gh.textContent) ? "g-aarti" : "";
      h += gid
        ? '<a class="rg" href="#' + gid + '" data-go="' + gid + '">' + gh.innerHTML + "</a><ul>"
        : '<div class="rg">' + gh.innerHTML + "</div><ul>";
      [].forEach.call(as, function (a) {
        var m = a.querySelector(".m");
        h +=
          '<li><a href="' +
          a.getAttribute("href") +
          '" data-go="' +
          a.getAttribute("data-go") +
          '">' +
          (m ? m.innerHTML : a.innerHTML) +
          "</a></li>";
      });
      h += "</ul>";
    });
    r.innerHTML =
      '<a class="rhome" href="#home" data-go="home"><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M8.6 5.5c.5-1.9 1.8-3.1 3.4-3.7 1.6.6 2.9 1.8 3.4 3.7\"/><path d=\"M8.4 5.6h7.2\"/><path d=\"M8.4 5.6c-.4 3.6.6 6.3 2.4 7.4.1 3.3 0 6.3 1.9 7.6 1.6 1 3.5 0 3.2-1.8-.2-1-1.3-1.3-1.8-.6\"/><path d=\"M15.6 5.6c.4 3.6-.6 6.2-2.6 7.2\"/><path d=\"M8.4 5.6C5.6 4.5 2.4 6 2.8 9.6c.3 2.6 2.4 3.7 4.8 3\"/><path d=\"M15.6 5.6c2.8-1.1 6 .4 5.6 4-.3 2.6-2.4 3.7-4.8 3\"/><path d=\"M12 7v1.8\"/><path d=\"M9.3 13.6l-.9 1.6\"/></svg><span class="mr">' + SCR.to("मुखपृष्ठ") + '</span><span class="en" lang="en">Home</span></a>' +
      h;
  })();
  // Gentle fade-in for verses that scroll into view (never for content already on screen; skipped if the device asks for less motion)
  (function () {
    if (
      !("IntersectionObserver" in window) ||
      (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)
    )
      return;
    var ready = false;
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          if (!ready) return;
          var t = e.target;
          t.classList.add("fx-in");
          setTimeout(function () {
            t.classList.remove("fx-in");
          }, 700);
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    [].forEach.call(document.querySelectorAll(".ash header,.ash .item,.rftop,.fin"), function (x) {
      io.observe(x);
    });
    setTimeout(function () {
      ready = true;
    }, 400);
  })();

  // ---- Astronomy for the Next Sankashti card ----
  // Low-precision sun & moon positions (Meeus, Astronomical Algorithms ch. 25 & 47, main terms),
  // lunar day (tithi), moonrise, and the Sankashti rule: Krishna-paksha Chaturthi prevailing at moonrise.
  var SK = (function () {
    var D2R = Math.PI / 180;
    function jd(t) {
      return t / 86400000 + 2440587.5;
    }
    function n360(x) {
      x %= 360;
      return x < 0 ? x + 360 : x;
    }
    function sunLon(T) {
      var L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T,
        M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * D2R;
      var C =
        (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
        (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
        0.000289 * Math.sin(3 * M);
      var om = (125.04 - 1934.136 * T) * D2R;
      return n360(L0 + C - 0.00569 - 0.00478 * Math.sin(om));
    }
    // longitude terms: [D,M,M',F,coef(1e-6 deg)]
    var LT = [
      [0, 0, 1, 0, 6288774],
      [2, 0, -1, 0, 1274027],
      [2, 0, 0, 0, 658314],
      [0, 0, 2, 0, 213618],
      [0, 1, 0, 0, -185116],
      [0, 0, 0, 2, -114332],
      [2, 0, -2, 0, 58793],
      [2, -1, -1, 0, 57066],
      [2, 0, 1, 0, 53322],
      [2, -1, 0, 0, 45758],
      [0, 1, -1, 0, -40923],
      [1, 0, 0, 0, -34720],
      [0, 1, 1, 0, -30383],
      [2, 0, 0, -2, 15327],
      [0, 0, 1, 2, -12528],
      [0, 0, 1, -2, 10980],
      [4, 0, -1, 0, 10675],
      [0, 0, 3, 0, 10034],
      [4, 0, -2, 0, 8548],
      [2, 1, -1, 0, -7888],
      [2, 1, 0, 0, -6766],
      [1, 0, -1, 0, -5163],
      [1, 1, 0, 0, 4987],
      [2, -1, 1, 0, 4036],
      [2, 0, 2, 0, 3994],
      [4, 0, 0, 0, 3861],
      [2, 0, -3, 0, 3665],
      [0, 1, -2, 0, -2689],
      [2, 0, -1, 2, -2602],
      [2, -1, -2, 0, 2390],
      [1, 0, 1, 0, -2348],
      [2, -2, 0, 0, 2236],
      [0, 1, 2, 0, -2120],
      [0, 2, 0, 0, -2069],
      [2, -2, -1, 0, 2048],
      [2, 0, 1, -2, -1773],
      [2, 0, 0, 2, -1595],
      [4, -1, -1, 0, 1215],
      [0, 0, 2, 2, -1110],
      [3, 0, -1, 0, -892],
      [2, 1, 1, 0, -810],
      [4, -1, -2, 0, 759],
      [0, 2, -1, 0, -713],
      [2, 2, -1, 0, -700],
      [2, 1, -2, 0, 691],
      [2, -1, 0, -2, 596],
      [4, 0, 1, 0, 549],
      [0, 0, 4, 0, 537],
      [4, -1, 0, 0, 520],
      [1, 0, -2, 0, -487],
    ];
    var BT = [
      [0, 0, 0, 1, 5128122],
      [0, 0, 1, 1, 280602],
      [0, 0, 1, -1, 277693],
      [2, 0, 0, -1, 173237],
      [2, 0, -1, 1, 55413],
      [2, 0, -1, -1, 46271],
      [2, 0, 0, 1, 32573],
      [0, 0, 2, 1, 17198],
      [2, 0, 1, -1, 9266],
      [0, 0, 2, -1, 8822],
      [2, -1, 0, -1, 8216],
      [2, 0, -2, -1, 4324],
      [2, 0, 1, 1, 4200],
      [2, 1, 0, -1, -3359],
      [2, -1, -1, 1, 2463],
      [2, -1, 0, 1, 2211],
      [2, -1, -1, -1, 2065],
      [0, 1, -1, -1, -1870],
      [4, 0, -1, -1, 1828],
      [0, 1, 0, 1, -1794],
    ];
    function moon(T) {
      var Lp = n360(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T),
        D = n360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T),
        M = n360(357.5291092 + 35999.0502909 * T),
        Mp = n360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T),
        F = n360(93.272095 + 483202.0175233 * T - 0.0036539 * T * T),
        E = 1 - 0.002516 * T;
      var sl = 0,
        sb = 0;
      LT.forEach(function (t) {
        var a = (t[0] * D + t[1] * M + t[2] * Mp + t[3] * F) * D2R,
          e = Math.abs(t[1]) === 1 ? E : Math.abs(t[1]) === 2 ? E * E : 1;
        sl += t[4] * e * Math.sin(a);
      });
      BT.forEach(function (t) {
        var a = (t[0] * D + t[1] * M + t[2] * Mp + t[3] * F) * D2R,
          e = Math.abs(t[1]) === 1 ? E : Math.abs(t[1]) === 2 ? E * E : 1;
        sb += t[4] * e * Math.sin(a);
      });
      var A1 = (119.75 + 131.849 * T) * D2R,
        A2 = (53.09 + 479264.29 * T) * D2R,
        A3 = (313.45 + 481266.484 * T) * D2R;
      sl += 3958 * Math.sin(A1) + 1962 * Math.sin(Lp * D2R - F * D2R) + 318 * Math.sin(A2);
      sb +=
        -2235 * Math.sin(Lp * D2R) +
        382 * Math.sin(A3) +
        175 * Math.sin(A1 - F * D2R) +
        175 * Math.sin(A1 + F * D2R) +
        127 * Math.sin(Lp * D2R - Mp * D2R) -
        115 * Math.sin(Lp * D2R + Mp * D2R);
      var om = (125.04452 - 1934.136261 * T) * D2R;
      return { lon: n360(Lp + sl / 1e6 - 0.00478 * Math.sin(om)), lat: sb / 1e6 };
    }
    function T(t) {
      return (jd(t) - 2451545) / 36525;
    }
    // elongation of moon from sun, 0..360 (tithi = floor(elong/12))
    function elong(t) {
      var x = T(t);
      return n360(moon(x).lon - sunLon(x));
    }
    function altMoon(t, lat, lon) {
      var x = T(t),
        m = moon(x),
        eps = (23.439291 - 0.0130042 * x) * D2R,
        l = m.lon * D2R,
        b = m.lat * D2R;
      var ra = Math.atan2(Math.sin(l) * Math.cos(eps) - Math.tan(b) * Math.sin(eps), Math.cos(l)),
        dec = Math.asin(Math.sin(b) * Math.cos(eps) + Math.cos(b) * Math.sin(eps) * Math.sin(l));
      var gmst = n360(280.46061837 + 360.98564736629 * (jd(t) - 2451545) + 0.000387933 * x * x),
        H = (gmst + lon) * D2R - ra,
        p = lat * D2R;
      return Math.asin(Math.sin(p) * Math.sin(dec) + Math.cos(p) * Math.cos(dec) * Math.cos(H)) / D2R;
    }
    // moonrise within [t0,t1): first upward crossing of +0.125 deg (centre, refraction, semidiameter, parallax)
    function rise(t0, t1, lat, lon) {
      var h0 = 1.1,
        st = 10 * 60000,
        a = altMoon(t0, lat, lon) - h0;
      for (var t = t0 + st; t <= t1; t += st) {
        var b = altMoon(t, lat, lon) - h0;
        if (a < 0 && b >= 0) {
          var lo = t - st,
            hi = t;
          for (var i = 0; i < 12; i++) {
            var m = (lo + hi) / 2;
            if (altMoon(m, lat, lon) - h0 < 0) lo = m;
            else hi = m;
          }
          return hi;
        }
        a = b;
      }
      return null;
    }
    // Sankashti = Krishna Chaturthi (elongation 216-228 deg). Observed on the local date whose moonrise falls inside it
    // (first such date if two); if no moonrise falls inside, the date on which it is in effect at sunrise (~06:30).
    // Dates and times use the device's own time zone.
    function cross(a, b, target) {
      for (var i = 0; i < 30; i++) {
        var m = (a + b) / 2;
        if (n360(elong(m) - target + 180) - 180 < 0) a = m;
        else b = m;
      }
      return b;
    }
    function mid(t) {
      var d = new Date(t);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    }
    function addDay(m) {
      var d = new Date(m);
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime();
    }
    function upcoming(from, lat, lon, count) {
      var out = [],
        t = from - 3 * 86400000,
        end = from + (count + 1) * 31 * 86400000,
        h = 3600000,
        p = elong(t);
      for (; t < end && out.length < count + 1; t += h) {
        var e = elong(t + h);
        if (p < 216 && e >= 216 && e < 240) {
          var s = cross(t, t + h, 216),
            en = s;
          var q = s;
          while (elong(q) < 228 && q - s < 3 * 86400000) q += h;
          en = cross(q - h, q, 228);
          var pick = null,
            rs = null;
          for (var d = mid(s) - 86400000; d < en; d = addDay(d)) {
            var r = rise(d + 12 * h, addDay(d) + 12 * h, lat, lon);
            if (r !== null && r >= s && r < en) {
              pick = d;
              rs = r;
              break;
            }
          }
          if (pick === null) {
            for (var d2 = mid(s); d2 < en; d2 = addDay(d2)) {
              var sr = d2 + 6.5 * h;
              if (sr >= s && sr < en) {
                pick = d2;
                break;
              }
            }
            if (pick === null) pick = mid(en);
            rs = rise(pick + 12 * h, addDay(pick) + 12 * h, lat, lon);
          }
          if (addDay(pick) > from)
            out.push({ day: pick, rise: rs, start: s, end: en, atRise: rs !== null && rs >= s && rs < en });
        }
        p = e;
      }
      return out.slice(0, count);
    }
    return { elong: elong, rise: rise, upcoming: upcoming };
  })();

  // ---- Next Sankashti card (computed on this device; works offline) ----
  // Default place for each time zone: [latitude, longitude, Marathi name, English name]
  var SKTZ = {
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
  var SKCITY = [
    [39.96, -83.00, "कोलंबस", "Columbus, OH"],
    [40.10, -83.11, "डब्लिन", "Dublin, OH", 7],
    [40.20, -83.01, "लुईस सेंटर", "Lewis Center, OH", 7],
    [40.16, -83.08, "पॉवेल", "Powell, OH", 6],
    [40.13, -82.93, "वेस्टरव्हिल", "Westerville, OH", 7],
    [40.09, -83.02, "वर्दिंग्टन", "Worthington, OH", 4],
    [40.30, -83.07, "डेलावेअर", "Delaware, OH", 7],
    [40.03, -83.16, "हिलियर्ड", "Hilliard, OH", 6],
    [39.99, -83.06, "अपर आर्लिंग्टन", "Upper Arlington, OH", 4],
    [39.98, -83.04, "ग्रँडव्ह्यू हाइट्स", "Grandview Heights, OH", 2],
    [39.97, -82.94, "बेक्सली", "Bexley, OH", 2],
    [40.02, -82.88, "गहाना", "Gahanna, OH", 5],
    [40.08, -82.81, "न्यू अल्बानी", "New Albany, OH", 6],
    [39.95, -82.81, "रेनॉल्ड्सबर्ग", "Reynoldsburg, OH", 5],
    [39.88, -82.75, "पिकरिंग्टन", "Pickerington, OH", 6],
    [39.84, -82.80, "कॅनाल विंचेस्टर", "Canal Winchester, OH", 5],
    [39.85, -82.88, "ग्रोव्हपोर्ट", "Groveport, OH", 4],
    [39.88, -83.09, "ग्रोव्ह सिटी", "Grove City, OH", 6],
    [40.11, -83.27, "प्लेन सिटी", "Plain City, OH", 5],
    [40.24, -83.37, "मेरीसव्हिल", "Marysville, OH", 6],
    [40.24, -82.86, "सनबरी", "Sunbury, OH", 5],
    [40.22, -82.88, "गलेना", "Galena, OH", 3],
    [39.10, -84.51, "सिनसिनाटी", "Cincinnati, OH"],
    [41.50, -81.69, "क्लीव्हलँड", "Cleveland, OH"],
    [39.76, -84.19, "डेटन", "Dayton, OH"],
    [41.65, -83.54, "टोलीडो", "Toledo, OH"],
    [41.08, -81.52, "ॲक्रन", "Akron, OH"],
    [40.44, -79.99, "पिट्सबर्ग", "Pittsburgh, PA"],
    [42.33, -83.05, "डेट्रॉइट", "Detroit, MI"],
    [42.28, -83.74, "ॲन आर्बर", "Ann Arbor, MI"],
    [39.77, -86.16, "इंडियानापोलिस", "Indianapolis, IN"],
    [38.25, -85.76, "लुईव्हिल", "Louisville, KY"],
    [38.04, -84.50, "लेक्सिंग्टन", "Lexington, KY"],
    [41.88, -87.63, "शिकागो", "Chicago, IL"],
    [41.75, -88.15, "नेपरव्हिल", "Naperville, IL", 10],
    [43.04, -87.91, "मिलवॉकी", "Milwaukee, WI"],
    [43.07, -89.40, "मॅडिसन", "Madison, WI"],
    [44.98, -93.27, "मिनियापोलिस", "Minneapolis, MN"],
    [38.63, -90.20, "सेंट लुईस", "St. Louis, MO"],
    [39.10, -94.58, "कॅन्सस सिटी", "Kansas City, MO"],
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
    [35.99, -78.90, "डरहॅम", "Durham, NC"],
    [35.23, -80.84, "शार्लट", "Charlotte, NC"],
    [35.72, -77.92, "विल्सन", "Wilson, NC"],
    [36.07, -79.79, "ग्रीन्सबरो", "Greensboro, NC"],
    [33.75, -84.39, "अटलांटा", "Atlanta, GA"],
    [36.16, -86.78, "नॅशव्हिल", "Nashville, TN"],
    [35.15, -90.05, "मेम्फिस", "Memphis, TN"],
    [33.52, -86.80, "बर्मिंगहॅम", "Birmingham, AL"],
    [30.33, -81.66, "जॅक्सनव्हिल", "Jacksonville, FL"],
    [28.54, -81.38, "ऑर्लँडो", "Orlando, FL"],
    [27.95, -82.46, "टॅम्पा", "Tampa, FL"],
    [25.76, -80.19, "मायामी", "Miami, FL"],
    [29.95, -90.07, "न्यू ऑर्लिन्स", "New Orleans, LA"],
    [29.76, -95.37, "ह्यूस्टन", "Houston, TX"],
    [32.78, -96.80, "डॅलस", "Dallas, TX"],
    [33.02, -96.70, "प्लेनो", "Plano, TX", 10],
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
    [45.42, -75.70, "ओटावा", "Ottawa, ON"],
    [45.50, -73.57, "मॉन्ट्रियल", "Montreal, QC"],
    [49.90, -97.14, "विनिपेग", "Winnipeg, MB"],
    [51.05, -114.07, "कॅलगरी", "Calgary, AB"],
    [53.55, -113.49, "एडमंटन", "Edmonton, AB"],
    [49.28, -123.12, "व्हँकुव्हर", "Vancouver, BC"],
    [51.51, -0.13, "लंडन", "London, UK"],
    [52.49, -1.89, "बर्मिंगहॅम", "Birmingham, UK"],
    [52.64, -1.13, "लेस्टर", "Leicester, UK"],
    [53.48, -2.24, "मँचेस्टर", "Manchester, UK"],
    [53.35, -6.26, "डब्लिन", "Dublin, Ireland"],
    [48.86, 2.35, "पॅरिस", "Paris, France"],
    [52.37, 4.90, "ॲमस्टरडॅम", "Amsterdam, Netherlands"],
    [50.11, 8.68, "फ्रँकफर्ट", "Frankfurt, Germany"],
    [52.52, 13.40, "बर्लिन", "Berlin, Germany"],
    [47.38, 8.54, "झुरिक", "Zurich, Switzerland"],
    [25.20, 55.27, "दुबई", "Dubai, UAE"],
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
    [-34.93, 138.60, "ॲडलेड", "Adelaide, SA"],
    [-31.95, 115.86, "पर्थ", "Perth, WA"],
    [-36.85, 174.76, "ऑकलंड", "Auckland, New Zealand"],
    [19.08, 72.88, "मुंबई", "Mumbai, Maharashtra"],
    [19.22, 72.98, "ठाणे", "Thane, Maharashtra", 10],
    [19.03, 73.03, "नवी मुंबई", "Navi Mumbai, Maharashtra", 10],
    [18.52, 73.86, "पुणे", "Pune, Maharashtra"],
    [20.00, 73.79, "नाशिक", "Nashik, Maharashtra"],
    [21.15, 79.09, "नागपूर", "Nagpur, Maharashtra"],
    [19.88, 75.34, "छत्रपती संभाजीनगर", "Chhatrapati Sambhajinagar, Maharashtra"],
    [16.70, 74.24, "कोल्हापूर", "Kolhapur, Maharashtra"],
    [17.66, 75.91, "सोलापूर", "Solapur, Maharashtra"],
    [16.85, 74.58, "सांगली", "Sangli, Maharashtra"],
    [17.68, 74.02, "सातारा", "Satara, Maharashtra"],
    [16.99, 73.31, "रत्नागिरी", "Ratnagiri, Maharashtra"],
    [19.09, 74.74, "अहिल्यानगर", "Ahilyanagar, Maharashtra"],
    [20.93, 77.75, "अमरावती", "Amravati, Maharashtra"],
    [20.70, 77.00, "अकोला", "Akola, Maharashtra"],
    [21.00, 75.56, "जळगाव", "Jalgaon, Maharashtra"],
    [18.40, 76.56, "लातूर", "Latur, Maharashtra"],
    [19.15, 77.31, "नांदेड", "Nanded, Maharashtra"],
    [15.49, 73.83, "पणजी", "Panaji, Goa"],
    [15.85, 74.50, "बेळगाव", "Belagavi, Karnataka"],
    [12.97, 77.59, "बंगळुरू", "Bengaluru, Karnataka"],
    [12.30, 76.64, "म्हैसूर", "Mysuru, Karnataka"],
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
    [22.57, 88.36, "कोलकाता", "Kolkata, West Bengal"]
  ];
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
    var o = { lat: lat, lon: lon, mr: "तुमचे ठिकाण", en: "Your location", own: 1 };
    if (sub) {
      o.mr = sub[2];
      o.en = sub[3];
    } else if (best && bd <= 40) {
      o.mr = best[2];
      o.en = best[3];
    } else if (best && bd <= 120) {
      o.mr = best[2] + " जवळ";
      o.en = "near " + best[3];
    }
    return o;
  }
  function skLoc() {
    if (P.loc && typeof P.loc.lat === "number")
      return skNear(P.loc.lat, P.loc.lon);
    var z = "";
    try {
      z = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {}
    var c = SKTZ[z];
    return c ? { lat: c[0], lon: c[1], mr: c[2], en: c[3] } : null;
  }
  var skCache = null;
  function skDV(n) {
    return String(n).replace(/[0-9]/g, function (d) {
      return "०१२३४५६७८९"[d];
    });
  }
  var SKWM = ["रविवार", "सोमवार", "मंगळवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"],
    SKMM = ["जानेवारी", "फेब्रुवारी", "मार्च", "एप्रिल", "मे", "जून", "जुलै", "ऑगस्ट", "सप्टेंबर", "ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"],
    SKMS = ["जाने.", "फेब्रु.", "मार्च", "एप्रि.", "मे", "जून", "जुलै", "ऑग.", "सप्टें.", "ऑक्टो.", "नोव्हें.", "डिसें."];
  function skMid(t) {
    var d = t ? new Date(t) : new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }
  // Date (with the year when it is not this year) and moonrise text for one Sankashti, in Marathi and English
  function skFmt(o) {
    var d = new Date(o.day),
      yr = d.getFullYear() !== new Date().getFullYear(),
      r = o.rise ? new Date(o.rise) : null,
      h = r ? r.getHours() : 0,
      mi = r ? ("0" + r.getMinutes()).slice(-2) : "",
      h12 = r ? ((h + 11) % 12) + 1 : 0,
      late = r && r.getDate() !== d.getDate();
    return {
      d: d,
      ang: d.getDay() === 2,
      dmr: SKWM[d.getDay()] + ", " + skDV(d.getDate()) + " " + SKMM[d.getMonth()] + (yr ? " " + skDV(d.getFullYear()) : ""),
      den: d.toLocaleDateString(
        "en-US",
        yr ? { weekday: "short", day: "numeric", month: "short", year: "numeric" } : { weekday: "short", day: "numeric", month: "short" },
      ),
      tmr: r ? (h >= 20 || h < 4 ? "रात्री " : h >= 16 ? "सायं. " : "") + skDV(h12) + ":" + skDV(mi) + (late ? " (मध्यरात्रीनंतर)" : "") : "—",
      ten: r ? h12 + ":" + mi + (h >= 12 ? " pm" : " am") + (late ? " (after midnight)" : "") : "—",
    };
  }
  var skKey = "";
  function skRender() {
    var box = document.getElementById("skc");
    if (!box) return;
    var L = skLoc();
    if (!L) {
      box.hidden = false;
      box.innerHTML =
        '<div class="skh"><span class="mr">पुढील संकष्टी चतुर्थी</span><span class="en" lang="en">Next Sankashti Chaturthi</span></div><button type="button" class="skl" id="skl">📍 <span class="mr">तारीख आणि चंद्रोदय पाहण्यासाठी माझे ठिकाण वापरा</span><span class="en" lang="en">Use my location to show the date and moonrise</span></button>';
      skSlim();
      return;
    }
    // The next Sankashti first (fast); then, a moment later, every Sankashti from 1 January last year
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
    var en = P.ui === "en",
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
        (en
          ? d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) + (f.ang ? ", Angaraki" : "")
          : SKWM[d.getDay()] + ", " + skDV(d.getDate()) + " " + SKMM[d.getMonth()] + " " + skDV(Y) + (f.ang ? ", अंगारकी" : "")) +
        '"><span class="mr"><b>' +
        skDV(d.getDate()) +
        "</b>" +
        SKMS[d.getMonth()] +
        '</span><span class="en" lang="en"><b>' +
        d.getDate() +
        "</b>" +
        d.toLocaleDateString("en-US", { month: "short" }) +
        "</span>" +
        (Y !== lastY ? '<i aria-hidden="true"><span class="mr">' + skDV(Y) + '</span><span class="en">' + Y + "</span></i>" : "") +
        "</button>";
      lastY = Y;
    });
    box.hidden = false;
    box.innerHTML =
      '<div class="sktd"><span class="mr">आज: ' +
      SKWM[now.getDay()] +
      ", " +
      skDV(now.getDate()) +
      " " +
      SKMM[now.getMonth()] +
      " " +
      skDV(now.getFullYear()) +
      '</span><span class="en" lang="en">Today: ' +
      now.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) +
      "</span></div>" +
      '<div class="skt"></div>' +
      (skCache.part
        ? ""
        : '<div class="sks" role="listbox" aria-orientation="horizontal" aria-label="' +
          (en ? "Sankashti dates" : "संकष्टी चतुर्थीच्या तारखा") +
          '">' +
          chips +
          "</div>") +
      '<button type="button" class="skl" id="skb" hidden><span class="mr">↩ पुढील संकष्टीवर परत</span><span class="en" lang="en">↩ Back to next Sankashti</span></button>' +
      (skCache.part
        ? ""
        : '<button type="button" class="skl" id="skall"><span class="mr">सर्व पुढील तारखा कॅलेंडरमध्ये जोडा</span><span class="en" lang="en">Add all upcoming dates to calendar</span></button>');
    skShow(skCache.sel);
  }
  // Hide the "·" before the place name when the name wraps onto its own line
  function skDot() {
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
  addEventListener("resize", skDot);
  if (document.fonts) document.fonts.ready.then(skDot);
  // Folded card: one slim line with Ganesha, the next Sankashti and moonrise (always the next one,
  // whichever date is picked in the strip). On Sankashti day the card stays open unless folded again that visit.
  var skToday = false,
    foldTouched = false;
  function skSlim() {
    var t = document.getElementById("slimt");
    if (!t) return;
    var C = skCache,
      o = C && skLoc() && C.list[C.ni];
    if (!o) {
      skToday = false;
      t.innerHTML = '<b><span class="mr">॥ श्री गणेशाय नमः ॥</span><span class="en">॥ श्री गणेशाय नमः ॥</span></b>';
      foldSet();
      return;
    }
    var f = skFmt(o),
      dd = Math.round((o.day - skMid()) / 86400000),
      hm = dd === 0 ? "आज संकष्टी चतुर्थी" : dd === 1 ? "उद्या संकष्टी चतुर्थी" : "पुढील संकष्टी चतुर्थी",
      he = dd === 0 ? "Sankashti Chaturthi today" : dd === 1 ? "Sankashti Chaturthi tomorrow" : "Next Sankashti Chaturthi";
    if (f.ang) {
      hm = hm.replace("संकष्टी", "अंगारकी संकष्टी");
      he = he.replace("Sankashti", "Angaraki Sankashti");
    }
    skToday = dd === 0;
    t.innerHTML =
      '<b><span class="mr">' + hm + '</span><span class="en" lang="en">' + he + "</span></b>" +
      '<span class="sld"><span class="mr">' + f.dmr + '</span><span class="en" lang="en">' + f.den + "</span></span>" +
      '<span class="slm"><span class="mr">चंद्रोदय ' + f.tmr + '</span><span class="en" lang="en">Moonrise ' + f.ten + "</span></span>";
    foldSet();
  }
  function foldSet() {
    var top = document.querySelector("#home .top"),
      b = document.getElementById("cvb");
    if (!top || !b) return;
    var f = !!P.fold && !(skToday && !foldTouched);
    top.classList.toggle("fold", f);
    document.getElementById("slim").hidden = !f;
    b.setAttribute("aria-expanded", String(!f));
    b.setAttribute("aria-label", f ? (P.ui === "mr" ? "कार्ड उघडा" : "Open the card") : P.ui === "mr" ? "कार्ड मिटवा" : "Fold the card");
  }
  document.getElementById("cvb").onclick = function () {
    P.fold = document.querySelector("#home .top").classList.contains("fold") ? 0 : 1;
    foldTouched = true;
    save();
    foldSet();
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
      dd = Math.round((o.day - skMid()) / 86400000);
    var hm = dd === 0 ? "आज संकष्टी चतुर्थी" : dd === 1 ? "उद्या संकष्टी चतुर्थी" : k === C.ni ? "पुढील संकष्टी चतुर्थी" : k < C.ni ? "मागील संकष्टी चतुर्थी" : "आगामी संकष्टी चतुर्थी",
      he =
        dd === 0
          ? "Sankashti Chaturthi today"
          : dd === 1
            ? "Sankashti Chaturthi tomorrow"
            : k === C.ni
              ? "Next Sankashti Chaturthi"
              : k < C.ni
                ? "Previous Sankashti Chaturthi"
                : "Upcoming Sankashti Chaturthi";
    if (f.ang) {
      hm = hm.replace("संकष्टी", "अंगारकी संकष्टी");
      he = he.replace("Sankashti", "Angaraki Sankashti");
    }
    box.className = "skc" + (dd === 0 ? " today" : "");
    box.querySelector(".skt").innerHTML =
      '<div class="skh"><span class="mr">' +
      hm +
      '</span><span class="en" lang="en">' +
      he +
      "</span></div>" +
      '<div class="skd"><span class="mr">' +
      f.dmr +
      "</span>" +
      // a few days ahead: "in 14 days" badge (today and tomorrow are already in the heading)
      (dd >= 2 ? '<span class="skin mr">' + skDV(dd) + " दिवसांनी</span>" : "") +
      '<span class="en" lang="en">' +
      f.den +
      "</span>" +
      (dd >= 2 ? '<span class="skin en" lang="en">in ' + dd + " days</span>" : "") +
      (o.day + 86400000 > Date.now()
        ? '<button type="button" class="skli" id="skcal" aria-label="' +
          (P.ui === "en" ? "Add to calendar" : "कॅलेंडरमध्ये जोडा") +
          '"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg></button>'
        : "") +
      "</div>" +
      '<div class="skm"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" fill="currentColor"/></svg><span class="mr">चंद्रोदय ' +
      f.tmr +
      '</span><span class="en" lang="en">Moonrise ' +
      f.ten +
      '</span><span class="skp" lang="en"><span class="skdt">· </span>' +
      L.en +
      '<button type="button" class="skli" id="skl" aria-label="' +
      (P.ui === "en" ? (L.own ? "Update my location" : "Use my location") : L.own ? "माझे ठिकाण बदला" : "माझे ठिकाण वापरा") +
      '"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg></button>' +
      '</span></div>' +
      '<div class="ske" lang="en">Moonrise ' +
      f.ten +
      "</div>" +
      '<div class="skcd" hidden></div>';
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
  // True within 120 km of Bharatiya Hindu Temple, Powell OH, where the group meets 7:00–8:30 pm
  function skTemple(L) {
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
      now = Date.now(),
      m = [],
      e = [];
    if (Math.round((o.day - skMid()) / 86400000) !== 0) {
      x.hidden = true;
      return;
    }
    if (skTemple(L)) {
      var d = new Date(o.day),
        t0 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 19, 0).getTime(),
        t1 = t0 + 90 * 60000;
      if (now < t0) {
        m.push("आज पूजा सायं. ७:०० वाजता");
        e.push("Pooja today at 7:00 pm");
      } else if (now < t1) {
        m.push("पूजा सुरू आहे");
        e.push("Pooja in progress");
      }
    }
    if (o.rise && now < o.rise) {
      var mins = Math.ceil((o.rise - now) / 60000),
        h = Math.floor(mins / 60),
        mm = mins % 60;
      m.push("चंद्रोदयाला " + (h ? skDV(h) + " तास " : "") + skDV(mm) + " मिनिटे");
      e.push("Moonrise in " + (h ? h + " h " : "") + mm + " min");
    }
    x.hidden = !m.length;
    x.innerHTML = '<span class="mr">' + m.join(" · ") + '</span><span class="en" lang="en">' + e.join(" · ") + "</span>";
  }
  setInterval(skCd, 60000);
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
      L2 = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//sankashti-chaturthi//EN"];
    if (!items.length) return;
    // The group's program runs 7:00–8:30 pm on the day, whatever the moonrise time
    function ev(o) {
      var f = skFmt(o),
        d = new Date(o.day);
      return {
        d: d,
        f: f,
        nm: (f.ang ? "Angaraki " : "") + "Sankashti Chaturthi",
        t0: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 19, 0),
        t1: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 20, 30),
      };
    }
    items.forEach(function (o) {
      var v = ev(o);
      L2.push("BEGIN:VEVENT", "UID:sk-" + dt(v.d) + "@sankashti-chaturthi.pages.dev", "DTSTAMP:" + stamp);
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
      a.download = all ? "sankashti-all.ics" : "sankashti-" + dt(v1.d) + ".ics";
      document.body.appendChild(a);
      a.click();
      flash("कॅलेंडर फाइल डाउनलोड झाली; ती उघडा", "Calendar file downloaded; open it to add " + (all ? "the events" : "the event"));
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
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    if (e.target.closest("#skcal")) skIcs();
    else if (e.target.closest("#skall")) skIcs(true);
  });
  // Date strip: tap a date, or use the arrow keys / Home / End; "Back to next Sankashti" returns
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
      flash("हे ब्राउझर ठिकाण देऊ शकत नाही", "Location is not available in this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      function (p) {
        P.loc = { lat: Math.round(p.coords.latitude * 100) / 100, lon: Math.round(p.coords.longitude * 100) / 100 };
        save();
        skCache = null;
        skRender();
      },
      function () {
        flash("ठिकाण मिळाले नाही", "Could not get your location");
      },
      { timeout: 15000, maximumAge: 86400000 },
    );
  });


  // ---- Tappable dhrupad markers (Aartis 1–5, 7 and 9) ----
  // Tapping ↻ ध्रुपद shows the dhrupad in a bubble just above the marker, over the stanza just sung,
  // so the next stanza stays clear. Tap again, tap elsewhere or press Escape to close; it also closes by itself.
  var RMKTAP = ["a1", "a2", "a3", "a4", "a5", "a7", "a9"],
    rmkPop = null;
  RMKTAP.forEach(function (id) {
    [].forEach.call(document.querySelectorAll("#" + id + " .items > .rmk"), function (m) {
      m.classList.add("rmkt");
      m.setAttribute("role", "button");
      m.setAttribute("tabindex", "0");
      m.setAttribute("aria-expanded", "false");
    });
  });
  function rmkClose() {
    if (!rmkPop) return;
    clearTimeout(rmkClose.t);
    rmkPop.m.setAttribute("aria-expanded", "false");
    if (rmkPop.el.ro) rmkPop.el.ro.disconnect();
    rmkPop.el.remove();
    rmkPop = null;
  }
  function rmkOpen(m) {
    var was = rmkPop && rmkPop.m === m;
    rmkClose();
    if (was) return;
    var src = m.closest("section.ash").querySelector(".rftop .verse");
    if (!src) return;
    var el = document.createElement("div");
    el.className = "rmkpop";
    el.setAttribute("role", "status");
    el.appendChild(src.cloneNode(true));
    m.appendChild(el);
    m.setAttribute("aria-expanded", "true");
    // Keep the bubble on screen: shift it sideways if needed; if there is no room above (under the top bar), put it below.
    // Placed again whenever the bubble changes size (text size, fonts, the iPhone toolbar hiding or showing)
    // or the window resizes, so an earlier shift can't leave it off the edge.
    function place() {
      // Placed in pixels, without CSS transforms: Safari can report the box before a transform
      // applies, which made the old centring shift the bubble off the left edge.
      el.style.left = "0px";
      var b0 = el.getBoundingClientRect(),
        mr = m.getBoundingClientRect(),
        w = b0.width,
        pad = 8,
        vv = window.visualViewport,
        W = document.documentElement.clientWidth || innerWidth,
        L = Math.max(0, vv ? vv.offsetLeft : 0),
        R = Math.min(W, vv ? vv.offsetLeft + vv.width : W);
      if (R - L < w + 2 * pad) {
        L = 0;
        R = W;
      }
      var x = mr.left + mr.width / 2 - w / 2;
      x = Math.min(x, R - pad - w);
      x = Math.max(x, L + pad, pad);
      el.style.left = Math.round(x - b0.left) + "px";
    }
    place();
    var r = el.getBoundingClientRect();
    if (r.top < topEdge() + 4) el.classList.add("below");
    el.place = place;
    if (window.ResizeObserver) {
      el.ro = new ResizeObserver(function () {
        place();
      });
      el.ro.observe(el);
    }
    rmkPop = { m: m, el: el };
    rmkClose.t = setTimeout(rmkClose, 7000);
  }
  document.addEventListener("click", function (e) {
    var m = e.target.closest && e.target.closest(".rmkt");
    if (m) {
      e.stopPropagation();
      rmkOpen(m);
    } else rmkClose();
  }, true);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && rmkPop) return rmkClose();
    var m = e.target.closest && e.target.closest(".rmkt");
    if (m && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      rmkOpen(m);
    }
  });
  addEventListener("scroll", function () {
    if (rmkPop && !rmkPop.m.getBoundingClientRect().height) rmkClose();
  }, { passive: true });
  addEventListener("resize", function () {
    if (rmkPop) rmkPop.el.place();
  });


  // ---- Stanza numbers ----
  // Stanza numbers at the end of each verse (the dhrupad is not counted)
  [].forEach.call(document.querySelectorAll('section.ash[id^="a"] .items'), function (b) {
    var n = 0;
    [].forEach.call(b.querySelectorAll(".item:not(.rf):not(.dh)"), function (it) {
      n++;
      [
        [".mr", DV(n), "॥"],
        [".en", "" + n, "||"],
      ].forEach(function (x) {
        var ps = it.querySelectorAll(".verse>" + x[0] + ">p:not(.rf)"),
          p = ps[ps.length - 1];
        if (!p) return;
        var e = document.createElement("span");
        e.className = "sn";
        var end = p.textContent.trim();
        e.textContent = (end.slice(-x[2].length) === x[2] ? " " : " " + x[2] + " ") + x[1] + " " + x[2];
        p.appendChild(e);
      });
    });
  });

  // ---- Preferred line breaks ----
  // Where a line may break when it is too long for the screen:
  //   Marathi: at a zero-width space (U+200B) typed in the line;
  //   English: after a single "|" or a comma.
  // Browsers fill a row greedily and may break at any later space instead, so each part is wrapped in an
  // inline-block span (.zs): the row then breaks between parts. The text itself is not changed.
  var ZW = "\u200b";
  function enCut(t) {
    return t.replace(/([^|]\||,)( +)(?=\S)/g, "$1$2\u0000").split("\u0000");
  }
  function zsplit(p, cut, sep) {
    [].slice.call(p.childNodes).forEach(function (n) {
      if (n.nodeType !== 3) return;
      var a = cut(n.data);
      if (a.length < 2) return;
      var f = document.createDocumentFragment();
      a.forEach(function (part, i) {
        if (i && sep) f.appendChild(document.createTextNode(sep));
        // spaces at either end stay outside the span, so they show between parts
        var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(part);
        if (m[1]) f.appendChild(document.createTextNode(m[1]));
        if (m[2]) {
          var s = document.createElement("span");
          s.className = "zs";
          s.textContent = m[2];
          f.appendChild(s);
        }
        if (m[3]) f.appendChild(document.createTextNode(m[3]));
      });
      p.replaceChild(f, n);
    });
    // keep the stanza number with the last part of the line
    var sn = p.lastElementChild,
      last = sn && sn.previousSibling;
    while (last && last.nodeType === 3 && !last.data.trim()) last = last.previousSibling;
    if (sn && sn.className === "sn" && last && last.className === "zs") last.appendChild(sn);
  }
  [].forEach.call(document.querySelectorAll(".verse .mr p"), function (p) {
    if (p.textContent.indexOf(ZW) >= 0)
      zsplit(
        p,
        function (t) {
          return t.split(ZW);
        },
        ZW
      );
  });
  [].forEach.call(document.querySelectorAll(".verse .en p"), function (p) {
    zsplit(p, enCut, "");
  });
  // Latin digits → Devanagari digits
  function DV(n) {
    return SCR.to(
      String(n).replace(/[0-9]/g, function (d) {
        return "०१२३४५६७८९"[d];
      }),
    ); // (Kannada digits in Kannada letters)
  }
  if (!P.fsu) P.fs = dfs();
  function save() {
    try {
      localStorage.setItem(K, JSON.stringify(P));
    } catch (e) {}
  }

  // ---- Auto-fit text size ----
  // Auto-fit: largest text size (up to the device default) at which every verse line fits the screen width on one row.
  var FR = {};
  function segs(p) {
    var o = [],
      t = "";
    [].forEach.call(p.childNodes, function (n) {
      if (n.nodeName === "BR") {
        o.push(t);
        t = "";
      } else {
        t += n.textContent;
      }
    });
    o.push(t);
    var r = [];
    o.forEach(function (x) {
      x.split(ZW).forEach(function (y) {
        y = y.trim();
        if (y) r.push(y);
      });
    });
    return r;
  }
  function ratio() {
    // cached per language / dhrupad / layout / orientation
    var k = [
      P.lang,
      LEAD,
      P.ref,
      P.pf,
      P.xf,
      root.getAttribute("data-cols"),
      root.getAttribute("data-rail"),
      innerWidth > innerHeight ? "l" : "p",
    ].join("|");
    if (FR[k]) return FR[k];
    var m = document.createElement("span");
    m.style.cssText = "position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap";
    document.body.appendChild(m);
    var base = parseFloat(getComputedStyle(root).getPropertyValue("--fs")) || P.fs,
      w = document.querySelector(".wrap"),
      W = w ? w.clientWidth : innerWidth - 32,
      r = 0;
    [].forEach.call(document.querySelectorAll(P.lang === "en" || LEAD === "en" ? ".verse .en p" : ".verse .mr p"), function (p) {
      if (!p.offsetParent) return;
      var cs = getComputedStyle(p),
        avail = p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (!avail) return;
      var inset = (W - avail) / base;
      m.style.fontFamily = cs.fontFamily;
      m.style.fontSize = cs.fontSize;
      m.style.fontWeight = cs.fontWeight;
      segs(p).forEach(function (t) {
        m.textContent = t;
        var q = m.getBoundingClientRect().width / base + inset;
        if (q > r) r = q;
      });
    });
    m.remove();
    return (FR[k] = r);
  }
  // FSA: the automatic size for this screen, worked out even when the reader has chosen a size,
  // so the pinch bubble can show sizes as a percentage of it (100% = default)
  var FSA = 0;
  // The column width depends only on the window and layout, not on the text size or language,
  // so it is remembered: reading it would make the browser lay out the whole page an extra time
  var CW = {};
  function autoFs() {
    var wk = [innerWidth, root.getAttribute("data-cols"), root.getAttribute("data-rail")].join("|"),
      w = document.querySelector(".wrap"),
      cw = CW[wk] || (CW[wk] = w ? w.clientWidth : innerWidth - 32),
      r = ratio();
    if (!r || !cw) return;
    var f = Math.max(18, Math.min(dfs(), Math.floor((cw * 0.98) / r)));
    FSA = f;
    if (P.fsu) return;
    if (f !== P.fs) {
      P.fs = f;
      root.style.setProperty("--fs", f + "px");
      if (pn && !pn.hidden) spSet(); // the Settings preview shows the new size
    }
  }
  // Web fonts can arrive after the first fit; measure again once they have loaded
  function refit() {
    for (var k in FR) delete FR[k];
    autoFs();
    pullSoon();
  }
  // Two columns (Marathi or English only): a piece of short lines leaves a wide gap between its stanza
  // columns, so the left column moves right and the right column left until the piece's widest lines
  // are 48px apart. It is a CSS translate (--pull on the piece), so the
  // column widths that auto-fit measures stay the same. Worked out again after every fit and resize.
  function pull() {
    var on = root.getAttribute("data-cols") === "2" && P.lang !== "both";
    secs.forEach(function (sec) {
      var v = 0;
      if (on && sec.offsetParent !== null) {
        var lw = 0,
          cw = 0,
          rg = document.createRange();
        [].forEach.call(sec.querySelectorAll(".items > .c1 .verse ." + P.lang + " p, .items > .c2 .verse ." + P.lang + " p"), function (p) {
          if (!p.offsetParent) return;
          rg.selectNodeContents(p);
          var w = rg.getBoundingClientRect().width,
            cs = getComputedStyle(p);
          if (w > lw) lw = w;
          cw = p.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        });
        // the column gap is 64px; the widest lines of the two columns end up 48px apart
        if (lw && cw) v = Math.max(0, Math.floor((cw - lw) / 2 + 8));
      }
      if (v) sec.style.setProperty("--pull", v + "px");
      else sec.style.removeProperty("--pull");
    });
  }
  function pullSoon() {
    clearTimeout(pull.tm);
    pull.tm = setTimeout(pull, 80);
  }
  addEventListener("resize", pullSoon);
  if (document.fonts) {
    try {
      document.fonts.ready.then(refit);
      document.fonts.addEventListener("loadingdone", refit);
    } catch (e) {}
  }


  // ---- Current piece, menus and apply() ----
  var pn = document.getElementById("panel"),
    aa = document.getElementById("aa"),
    jp = document.getElementById("jump"),
    hb = document.getElementById("home-btn");
  // The languages a piece can be read in: n is the name in its own script
  var LANGS = {
    mr: { n: "मराठी" },
    en: { n: "English" },
    kn: { n: "ಕನ್ನಡ" },
  };
  // The page has two places for text: the original ("mr", which shows Marathi or, in Kannada letters, Kannada)
  // and English ("en"). P.lead, P.l2 and P.lang name the place; LK gives the language in it.
  function LK(slot) {
    return slot === "mr" ? P.ind : slot;
  }
  // The piece being read: the last one whose top has passed just under the top bar
  function cur() {
    var c = null,
      y = 90;
    secs.forEach(function (x) {
      if (x.offsetParent !== null && x.getBoundingClientRect().top <= y) c = x;
    });
    return c;
  }
  // Pooja section fold: the pieces between the Pooja and Aarti headings get class "pj"; folding hides them.
  // Going to a Pooja piece (Contents, search, Previous, a link) opens the section again.
  (function () {
    var e = document.getElementById("g-pooja");
    while (e && (e = e.nextElementSibling) && !e.classList.contains("grp")) {
      if (e.classList.contains("ash")) e.classList.add("pj");
    }
    // The same for the Aarti section: its pieces get class "ar"
    e = document.getElementById("g-aarti");
    while (e && (e = e.nextElementSibling) && !e.classList.contains("grp")) {
      if (e.classList.contains("ash")) e.classList.add("ar");
    }
  })();
  // Open all / Fold all: a pill in a section row (beside its arrow) folds or opens every piece in that section.
  // Shown only for sections with two or more pieces (Aarti today; Pooja has one), and not while the section
  // itself is folded. It reads "Fold all" while any piece is open, "Open all" when all are folded.
  var allB = [];
  [["g-pooja", "pj", "pf"], ["g-aarti", "ar", "xf"]].forEach(function (a) {
    var g = document.getElementById(a[0]),
      ps = secs.filter(function (x) {
        return x.classList.contains(a[1]);
      });
    if (!g || ps.length < 2) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "allb";
    b.onclick = function () {
      var y = g.getBoundingClientRect().top,
        open = b.dataset.open === "1";
      ps.forEach(function (x) {
        var i = P.af.indexOf(x.id);
        if (open && i >= 0) P.af.splice(i, 1);
        if (!open && i < 0) P.af.push(x.id);
      });
      save();
      pfSet();
      scrollBy(0, g.getBoundingClientRect().top - y);
      mark();
    };
    g.appendChild(b);
    allB.push({ b: b, ps: ps, k: a[2] });
  });
  function allSet() {
    var mr = P.ui === "mr";
    allB.forEach(function (o) {
      var open = o.ps.every(function (x) {
        return P.af.indexOf(x.id) >= 0;
      });
      o.b.dataset.open = open ? "1" : "0";
      o.b.hidden = !!P[o.k];
      o.b.lang = mr ? "mr" : "en";
      o.b.textContent = open ? (mr ? "सर्व उघडा" : "Open all") : mr ? "सर्व मिटवा" : "Fold all";
    });
  }
  function pfSet() {
    var mr = P.ui === "mr",
      tb = document.getElementById("tfb");
    if (P.tf) root.setAttribute("data-tf", "1");
    else root.removeAttribute("data-tf");
    if (tb) {
      tb.setAttribute("aria-expanded", String(!P.tf));
      tb.setAttribute("aria-label", P.tf ? (mr ? "अनुक्रमणिका उघडा" : "Show the contents") : mr ? "अनुक्रमणिका मिटवा" : "Fold the contents");
    }
    secs.forEach(function (x) {
      var f = P.af.indexOf(x.id) >= 0,
        ab = x.querySelector(".afb");
      x.classList.toggle("af", f);
      if (ab) {
        ab.setAttribute("aria-expanded", String(!f));
        ab.setAttribute("aria-label", f ? (mr ? "उघडा" : "Show this piece") : mr ? "मिटवा" : "Fold this piece");
      }
    });
    var xb = document.getElementById("xfb");
    if (P.xf) root.setAttribute("data-xf", "1");
    else root.removeAttribute("data-xf");
    if (xb) {
      xb.setAttribute("aria-expanded", String(!P.xf));
      xb.setAttribute("aria-label", P.xf ? (mr ? "आरती विभाग उघडा" : "Show the Aarti section") : mr ? "आरती विभाग मिटवा" : "Fold the Aarti section");
    }
    allSet();
    var b = document.getElementById("pfb");
    if (P.pf) root.setAttribute("data-pf", "1");
    else root.removeAttribute("data-pf");
    if (!b) return;
    b.setAttribute("aria-expanded", String(!P.pf));
    b.setAttribute("aria-label", P.pf ? (P.ui === "mr" ? "पूजा विभाग उघडा" : "Show the Pooja section") : P.ui === "mr" ? "पूजा विभाग मिटवा" : "Fold the Pooja section");
  }
  // Going to a piece (or a line in it) opens it if it is folded, and the Pooja section if that is folded
  function pjOpen(el, onlyPooja) {
    // a section row (side menu पूजा / आरती): open that section if it is folded
    if (el && el.id === "g-pooja" && P.pf) {
      P.pf = 0;
      save();
      pfSet();
    }
    if (el && el.id === "g-aarti" && P.xf) {
      P.xf = 0;
      save();
      pfSet();
    }
    var sec = el && el.closest && el.closest(".ash");
    if (!sec) return;
    var ch = false;
    if (P.pf && sec.classList.contains("pj")) {
      P.pf = 0;
      ch = true;
    }
    if (P.xf && sec.classList.contains("ar")) {
      P.xf = 0;
      ch = true;
    }
    if (!onlyPooja && P.af.indexOf(sec.id) >= 0) {
      P.af = P.af.filter(function (x) {
        return x !== sec.id;
      });
      ch = true;
    }
    if (ch) {
      save();
      pfSet();
    }
  }
  // Each piece has a ⌃ button in its heading that folds it down to the heading
  if (!Array.isArray(P.af)) P.af = [];
  secs.forEach(function (x) {
    var h = x.querySelector("header");
    if (!h) return;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "afb";
    b.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
    b.onclick = function () {
      var y = h.getBoundingClientRect().top,
        i = P.af.indexOf(x.id);
      if (i >= 0) P.af.splice(i, 1);
      else P.af.push(x.id);
      save();
      pfSet();
      // keep the heading where it was on screen
      scrollBy(0, h.getBoundingClientRect().top - y);
      mark();
    };
    h.appendChild(b);
    // One-hand use: a tap anywhere on the heading folds or opens the piece, not only on ⌃
    // (the ⌃ stays for keyboards and screen readers; links in the heading still work)
    h.addEventListener("click", function (e) {
      if (e.target.closest("a,button,input") || String(getSelection()).trim()) return;
      b.onclick();
    });
  });
  document.getElementById("tfb").onclick = function () {
    P.tf = P.tf ? 0 : 1;
    save();
    pfSet();
  };
  [["pfb", "g-pooja", "pf"], ["xfb", "g-aarti", "xf"]].forEach(function (a) {
    document.getElementById(a[0]).onclick = function () {
      var g = document.getElementById(a[1]),
        y = g.getBoundingClientRect().top;
      P[a[2]] = P[a[2]] ? 0 : 1;
      save();
      apply();
      // keep the heading where it was on screen
      scrollBy(0, g.getBoundingClientRect().top - y);
    };
  });
  // ---- Bottom bar (#asc) and autoscroll ----
  // The bottom bar is the footer menu on every page: ‹ Prev, Home, Contents + search, ▶, Next ›.
  // Its parts share the "as" prefix (asc, asv, ash, asq, asb, asn) because it began as the autoscroll bar.
  // ▶ appears only when autoscroll is released (FEAT_AS) and switched on in Settings (P.ason; root data-ason).
  //
  // Autoscroll (held back for a later release, see FEAT_AS): runs through every open section (Pooja, aartis,
  // and any added later). Turning it on folds the home card and the contents, opens every piece, and scrolls
  // line by line: each sung line gets the same time (a little more for long lines), whatever its height.
  // With the dhrupad shown once, each ↻ ध्रुपद marker holds the page while the dhrupad is sung and shows it
  // in the bubble. While running the bar shows Home, Search, speed − / + and ⏸ (CSS: #asc.on).
  // AS: on = running; u = steps from asBuild(); i = current step; t = seconds into it; raf = animation frame;
  // last = previous frame time; y = furthest scroll so far; held / down / ht = paused by the reader's touch;
  // sec = id of the piece whose speed the bar shows.
  var AS = { on: 0, u: [], i: 0, t: 0, raf: 0, last: 0, y: 0 },
    asc = document.getElementById("asc"),
    asb = document.getElementById("asb"),
    ASPD = [0, 7.5, 6.2, 5.2, 4.5, 3.9, 3.4, 3, 2.6, 2.3, 2]; // seconds per line for speeds 1–10
  if (!P.asp || typeof P.asp !== "object") P.asp = {};
  // speed of a piece: its own if the reader set one, else the general one
  function asSpd(id) {
    return P.asp[id] || P.as;
  }
  // the piece whose speed the − / + buttons change: the one scrolling, else the one on screen
  // (c: the piece on screen, when the caller already has it; finding it costs a page layout)
  function asSec(c) {
    var a = AS.on && AS.u[AS.i];
    if (a) return a.sec;
    if (c === undefined) c = cur();
    return c ? c.id : "";
  }
  // the bottom of whatever sits at the top of the screen: the top bar, or the slim strip while it is tucked away
  function topEdge() {
    var bar = document.querySelector(root.hasAttribute("data-tuck") ? "#tuck" : "body > .bar");
    return bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 60;
  }
  function asSpot() {
    // the reading spot: a third of the way down the screen, below the top bar
    var top = topEdge();
    return top + (innerHeight - top) * 0.3;
  }
  function asLabel() {
    var mr = P.ui === "mr",
      l = document.getElementById("asl"),
      c = cur();
    l.lang = mr ? "mr" : "en";
    var v = asSpd(asSec(c));
    l.innerHTML =
      '<span class="asw">' + (mr ? "वेग" : "Speed") + " </span>" +
      (mr
        ? String(v).replace(/\d/g, function (d) {
            return "०१२३४५६७८९"[d];
          })
        : v);
    l.setAttribute("aria-label", (mr ? "वेग " : "Speed ") + v);
    asb.setAttribute("aria-label", AS.on ? (mr ? "स्वयं-स्क्रोल थांबवा" : "Pause autoscroll") : mr ? "आपोआप पुढे सरकवा" : "Autoscroll");
    asb.setAttribute("aria-pressed", String(!!AS.on));
    document.getElementById("asm").setAttribute("aria-label", mr ? "हळू" : "Slower");
    document.getElementById("asp").setAttribute("aria-label", mr ? "जलद" : "Faster");
    [
      ["asv", "‹ मागील", "‹ Prev", ".prev"],
      ["asn", "पुढील ›", "Next ›", ".next"],
    ].forEach(function (x) {
      var b = document.getElementById(x[0]),
        a = c ? c.querySelector(".pn " + x[3]) : x[3] === ".next" && !document.getElementById("p1").hidden ? secs[0] : null,
        t = a && a.querySelector(mr ? ":scope > .mr" : ":scope > .en");
      b.textContent = mr ? x[1] : x[2];
      b.lang = mr ? "mr" : "en";
      b.setAttribute("aria-label", (mr ? x[1] : x[2]).replace(/[‹›]/g, "").trim() + (t ? ": " + t.textContent : ""));
      b.disabled = !a;
    });
    document.getElementById("ash").setAttribute("aria-label", mr ? "मुख्य पान: अनुक्रमणिका" : "Home: contents");
    tlLabel();
    document.getElementById("asq").setAttribute("aria-label", mr ? "अनुक्रमणिका आणि शोध" : "Contents and search");
  }

  // The steps to scroll through: each open piece's heading, its dhrupad at the top, every sung line in order,
  // and a hold at each tappable dhrupad marker. Lines are taken in the main text language only.
  function asBuild() {
    var u = [],
      main = P.lang === "en" ? ".en" : ".mr",
      both = P.lang === "both";
    secs.forEach(function (x) {
      if (x.offsetParent === null) return;
      u.push({ el: x.querySelector("header"), w: 1.2, sec: x.id });
      var ls = [].slice.call(x.querySelectorAll(".rftop .verse " + main + " p, .items .verse " + main + " p, .items > .rmk")).filter(function (e) {
        return e.offsetParent !== null || e.getClientRects().length;
      });
      var tot = 0,
        n = 0;
      ls.forEach(function (e) {
        if (e.tagName === "P") {
          tot += e.textContent.length;
          n++;
        }
      });
      var avg = n ? tot / n : 1,
        src = x.querySelector(".rftop .verse " + main),
        dl = src ? src.querySelectorAll("p").length : 0;
      // Marathi + English: the page moves through each whole stanza (both languages, whatever the layout)
      // in the time its Marathi lines take, so the stanza in view is always the one being sung
      var lw = function (e) {
          return Math.max(0.75, Math.min(1.4, e.textContent.length / avg));
        },
        lastV = null;
      ls.forEach(function (e) {
        if (both && e.tagName === "P") {
          var v = e.closest(".verse");
          if (v === lastV) u[u.length - 1].w += lw(e);
          else u.push({ el: v, w: lw(e), sec: x.id });
          lastV = v;
          return;
        }
        lastV = null;
        if (e.tagName === "P") u.push({ el: e, w: lw(e), sec: x.id });
        else if (e.classList.contains("rmkt") && dl) u.push({ el: e, w: dl, hold: 1, sec: x.id });
      });
    });
    return u;
  }
  function asY(e) {
    return e.getBoundingClientRect().top + scrollY;
  }
  // Start from the line at the reading spot
  function asStartAt() {
    var spot = scrollY + asSpot(),
      k = 0;
    for (var j = 0; j < AS.u.length; j++) {
      if (asY(AS.u[j].el) <= spot + 4) k = j;
      else break;
    }
    return k;
  }
  function asStep(now) {
    if (!AS.on) return;
    var dt = Math.min(0.1, (now - (AS.last || now)) / 1000);
    AS.last = now;
    var u = AS.u,
      a = u[AS.i],
      b = u[AS.i + 1];
    if (!a || !b) return asStop(true);
    var T = ASPD[asSpd(a.sec)] * a.w;
    AS.t += dt;
    // a new piece: show its own speed
    if (a.sec !== AS.sec) {
      AS.sec = a.sec;
      asLabel();
    }
    if (a.hold && !a.shown) {
      a.shown = 1;
      if (!rmkPop || rmkPop.m !== a.el) rmkOpen(a.el);
      if (rmkPop) {
        clearTimeout(rmkClose.t);
        rmkClose.t = setTimeout(rmkClose, T * 1000 + 600);
        var h = document.createElement("div");
        h.className = "ash-h";
        h.lang = P.ui === "mr" ? "mr" : "en";
        h.textContent = P.ui === "mr" ? "ध्रुपद म्हणा, मग पुढे" : "Sing the dhrupad, then on";
        rmkPop.el.appendChild(h);
      }
    }
    // a hold keeps the page still while the dhrupad is sung, then moves on
    var f = a.hold ? Math.max(0, (AS.t - T * 0.85) / (T * 0.15)) : AS.t / T,
      ya = asY(a.el),
      yb = asY(b.el),
      want = ya + (yb - ya) * Math.min(1, f) - asSpot();
    // never scroll back up (two-column layouts list stanzas side by side)
    want = Math.max(want, AS.y);
    var max = document.documentElement.scrollHeight - innerHeight;
    if (want > max) want = max;
    AS.y = want;
    if (Math.abs(want - scrollY) >= 0.5) scrollTo(0, want);
    if (AS.t >= T) {
      AS.t = 0;
      AS.i++;
      if (AS.i >= u.length - 1 || (want >= max - 1 && yb - asSpot() > max)) return asStop(true);
    }
    AS.raf = requestAnimationFrame(asStep);
  }
  function asStart() {
    if (!FEAT_AS) return;
    if (TL.on) tlStop();
    // keep the piece in view where it is while the rest folds away
    var c0 = cur(),
      t0 = c0 && c0.getBoundingClientRect().top;
    // fold the home card and contents, open every piece; a folded section (Pooja / Aarti) stays folded and is skipped,
    // unless every section is folded, then all open again
    P.fold = 1;
    P.tf = 1;
    if (P.pf && P.xf) P.pf = P.xf = 0;
    P.af = [];
    save();
    apply();
    if (c0 && c0.offsetParent !== null) scrollBy(0, c0.getBoundingClientRect().top - t0);
    asRun();
  }
  // Start (or carry on) scrolling from the line in view (from the home page: the first open piece)
  function asRun() {
    AS.u = asBuild();
    if (AS.u.length < 2) return;
    var c = cur();
    if (!c) {
      var a1 = AS.u[0].el;
      scrollTo(0, asY(a1) - asSpot());
      AS.i = 0;
    } else AS.i = asStartAt();
    AS.y = scrollY;
    AS.t = 0;
    AS.last = 0;
    AS.u.forEach(function (x) {
      x.shown = 0;
    });
    // Carrying on mid-piece: skip a dhrupad hold just passed, and start from where the page is now, not a line back
    var a = AS.u[AS.i],
      b = AS.u[AS.i + 1];
    if (a && a.hold && b) {
      AS.i++;
      a = b;
      b = AS.u[AS.i + 1];
    }
    if (a && b && !a.hold) {
      var ya = asY(a.el),
        yb = asY(b.el),
        f = yb > ya ? (scrollY + asSpot() - ya) / (yb - ya) : 0;
      AS.t = ASPD[asSpd(a.sec)] * a.w * Math.max(0, Math.min(0.95, f));
    }
    AS.on = 1;
    asc.classList.add("on");
    asLabel();
    if (!wl) wake(true);
    AS.raf = requestAnimationFrame(asStep);
  }
  function asStop() {
    if (AS.held) {
      AS.held = 0;
      AS.down = 0;
      clearTimeout(AS.ht);
      AS.on = 1;
    }
    if (!AS.on) return;
    AS.on = 0;
    cancelAnimationFrame(AS.raf);
    asc.classList.remove("on");
    asLabel();
    if (!P.wake) wake(false);
  }
  asb.onclick = function () {
    if (AS.on) asStop();
    else asStart();
  };
  // − / + set the speed of the piece being sung; it is remembered for that piece only
  function asSpeed(d) {
    var id = asSec(),
      o = asSpd(id),
      v = Math.max(1, Math.min(10, o + d));
    if (v === o || !id) return;
    // keep the same point in the current line
    if (AS.on && AS.u[AS.i]) AS.t *= ASPD[v] / ASPD[o];
    P.asp[id] = v;
    save();
    asLabel();
  }
  document.getElementById("asm").onclick = function () {
    asSpeed(-1);
  };
  document.getElementById("asp").onclick = function () {
    asSpeed(1);
  };
  // The reader takes over: touching, wheeling or keys outside the controls pause it.
  // Scrolling by hand doesn't stop it: while a finger is on the text (or the wheel turns) it lets go of the page,
  // and once the page settles it carries on from the line in view. Holding a finger still pauses it the same way.
  // A tap on the top bar or a menu stops it (▶ starts again).
  function asHold() {
    if (!AS.on && !AS.held) return;
    if (AS.on) {
      AS.on = 0;
      cancelAnimationFrame(AS.raf);
    }
    AS.held = 1;
    clearTimeout(AS.ht);
  }
  function asLetGo(ms) {
    if (!AS.held) return;
    clearTimeout(AS.ht);
    AS.ht = setTimeout(function () {
      if (!AS.held || AS.down) return;
      AS.held = 0;
      asRun();
    }, ms);
  }
  addEventListener(
    "pointerdown",
    function (e) {
      if (!AS.on && !AS.held) return;
      var t = e.target && e.target.closest ? e.target : document.body;
      if (t.closest("#asc")) return;
      if (t.closest(".bar, #panel, #jump, #help, #qrm, #prm, #inm, #rail")) asStop();
      else {
        AS.down = 1;
        asHold();
      }
    },
    { passive: true, capture: true },
  );
  ["pointerup", "pointercancel", "touchend", "touchcancel"].forEach(function (n) {
    addEventListener(n, function (e) {
      // a drag hands the touch to the browser (pointercancel) while the finger is still down
      if (n === "pointercancel" || (e.touches && e.touches.length)) return;
      AS.down = 0;
      asLetGo(400);
    }, { passive: true, capture: true });
  });
  // the page still gliding after a flick: wait for it to settle
  addEventListener("scroll", function () {
    if (AS.held && !AS.down) asLetGo(400);
  }, { passive: true });
  addEventListener("wheel", function (e) {
    if (!AS.on && !AS.held) return;
    if (e.target && e.target.closest && e.target.closest("#asc")) return;
    asHold();
    asLetGo(700);
  }, { passive: true, capture: true });
  addEventListener("keydown", function (e) {
    if (!AS.on && !AS.held) return;
    if (e.target && e.target.closest && e.target.closest("#asc")) return;
    if (e.key === " " || /^(Arrow|Page|Home|End)/.test(e.key)) {
      asHold();
      asLetGo(700);
    }
  }, { capture: true });
  // Previous / Next follow the links in each piece's .pn block (kept in the page but never shown on screen,
  // the bar replaced it); Home and Search work as in the top bar
  function asGo(sel) {
    var c = cur(),
      a = c && c.querySelector(".pn " + sel);
    if (a) a.click();
    else if (!c && sel === ".next") {
      // from the home page: the first piece (the Pooja, or Aarti 1 when the Pooja is folded)
      var f = document.querySelector('#home a[data-go="' + (P.pf ? "a1" : "p1") + '"]');
      if (f) f.click();
    }
  }
  document.getElementById("asv").onclick = function () {
    asGo(".prev");
  };
  document.getElementById("asn").onclick = function () {
    asGo(".next");
  };
  document.getElementById("ash").onclick = function () {
    asStop();
    goHomeNav();
  };
  document.getElementById("asq").onclick = function () {
    document.getElementById("hm").onclick();
  };
  document.getElementById("tas").onclick = function () {
    P.ason = P.ason ? 0 : 1;
    if (!P.ason) asStop();
    save();
    apply();
  };
  // The bar is always there, like the top bar (data-asb leaves room for it under the text).
  // asShow() keeps ▶ in step with the settings, and Prev / Next with the piece on screen.
  asc.hidden = false;
  root.setAttribute("data-asb", "1");
  // the bar steps aside while Settings (#panel) or Contents (#jump) is open
  (function () {
    var ms = [document.getElementById("panel"), document.getElementById("jump")];
    function menu() {
      if (ms.some(function (m) { return m && !m.hidden; })) root.setAttribute("data-menu", "1");
      else root.removeAttribute("data-menu");
    }
    var mo = new MutationObserver(menu);
    ms.forEach(function (m) {
      if (m) mo.observe(m, { attributes: true, attributeFilter: ["hidden"] });
    });
    menu();
  })();
  function asShow() {
    var c = cur(),
      id = c ? c.id : "";
    if (FEAT_AS && P.ason) root.setAttribute("data-ason", "1");
    else root.removeAttribute("data-ason");
    if (id !== asShow.id) {
      asShow.id = id;
      asLabel();
    }
  }
  addEventListener("scroll", asShow, { passive: true });
  asLabel();
  asShow();

  // ---- Tilt to scroll (bottom bar, phones and tablets) ----
  // Tap the tilt button holding the phone however is comfortable: that angle is "still". Leaning the top of the
  // screen away scrolls down, leaning it back towards you scrolls up, faster the further it leans (4° either way
  // does nothing). A finger on the page holds it; letting go makes the new angle "still". ⏸ stops it.
  // The angle is the screen's own (portrait or sideways), from the phone's motion sensor; nothing leaves the phone.
  // iPhones ask "Allow motion access?" the first time (requestPermission must run inside the tap).
  // TL: on = running; p = smoothed angle; base = the "still" angle; got = the sensor has answered;
  // held = finger on the page; ht = timer to carry on; raf / last = animation frame; acc = part-pixel left over.
  var TL = { on: 0, p: null, base: null, got: 0, held: 0, ht: 0, raf: 0, last: 0, acc: 0, d: 0 },
    tlb = document.getElementById("tlb"),
    tlDot = document.querySelector("#tlm i");
  if (FEAT_TL && "DeviceOrientationEvent" in window && window.matchMedia && matchMedia("(pointer: coarse)").matches) root.setAttribute("data-tilt", "1");
  function tlLabel() {
    var mr = P.ui === "mr",
      s = document.getElementById("tls");
    s.lang = mr ? "mr" : "en";
    document.getElementById("tll").textContent = mr ? "झुकवून सरकवा" : "Tilt to scroll";
    document.getElementById("tlh").textContent = mr ? "दूर झुकवा = खाली · जवळ = वर" : "lean away = down · toward = up";
    document.getElementById("tlx").setAttribute("aria-label", mr ? "झुकवून सरकवणे थांबवा" : "Stop tilt to scroll");
    // (also called from asLabel, before TL is set up)
    var b = document.getElementById("tlb");
    b.setAttribute("aria-label", mr ? "झुकवून सरकवा" : "Tilt to scroll");
    b.setAttribute("aria-pressed", String(!!(TL && TL.on)));
  }
  // the screen's angle from flat (0) to upright (90), whichever way round the phone is held
  function tlPitch(e) {
    if (e.beta == null) return null;
    var r = Math.PI / 180,
      b = e.beta * r,
      g = (e.gamma || 0) * r,
      o = typeof window.orientation === "number" ? window.orientation : (screen.orientation && screen.orientation.angle) || 0,
      a = (((o % 360) + 360) % 360) * r,
      // which way is up, seen from the phone (x right, y top, z out of the screen)
      ux = -Math.sin(g) * Math.cos(b),
      uy = Math.sin(b),
      uz = Math.cos(g) * Math.cos(b);
    return Math.atan2(ux * Math.sin(a) + uy * Math.cos(a), uz) / r;
  }
  function tlRead(e) {
    var p = tlPitch(e);
    if (p == null || isNaN(p)) return;
    TL.got = 1;
    TL.p = TL.p == null ? p : TL.p + 0.25 * (p - TL.p);
    if (TL.base == null) TL.base = TL.p;
  }
  function tlStep(now) {
    if (!TL.on) return;
    var dt = Math.min(0.1, (now - (TL.last || now)) / 1000);
    TL.last = now;
    var d = TL.base == null || TL.p == null || TL.held ? 0 : TL.base - TL.p;
    // the dot: lower when leaning away (the page goes down), higher when leaning back
    var k = Math.round(Math.max(-10, Math.min(10, d / 2)));
    if (k !== TL.d) {
      TL.d = k;
      tlDot.style.transform = "translateY(" + k + "px)";
    }
    var m = Math.abs(d) - 4;
    if (m > 0) {
      TL.acc += (d > 0 ? 1 : -1) * Math.min(900, 2.5 * Math.pow(m, 1.7)) * dt;
      var n = TL.acc > 0 ? Math.floor(TL.acc) : Math.ceil(TL.acc);
      if (n) {
        TL.acc -= n;
        scrollBy(0, n);
      }
    } else TL.acc = 0;
    TL.raf = requestAnimationFrame(tlStep);
  }
  function tlStart() {
    if (TL.on) return;
    asStop();
    TL.on = 1;
    TL.p = TL.base = null;
    TL.got = TL.held = 0;
    TL.acc = TL.last = 0;
    addEventListener("deviceorientation", tlRead);
    asc.classList.add("tl");
    tlLabel();
    if (!wl) wake(true);
    TL.raf = requestAnimationFrame(tlStep);
    // some phones and tablets have no motion sensor, or the browser keeps it from the page
    setTimeout(function () {
      if (TL.on && !TL.got) {
        tlStop();
        flash("हा फोन झुकणे ओळखत नाही", "Tilt isn't available on this device");
      }
    }, 1500);
  }
  function tlStop() {
    if (!TL.on) return;
    TL.on = 0;
    clearTimeout(TL.ht);
    cancelAnimationFrame(TL.raf);
    removeEventListener("deviceorientation", tlRead);
    asc.classList.remove("tl");
    tlLabel();
    if (!P.wake) wake(false);
    tlb.focus({ preventScroll: true });
  }
  tlb.onclick = function () {
    if (!FEAT_TL) return;
    var D = window.DeviceOrientationEvent;
    if (D && typeof D.requestPermission === "function")
      D.requestPermission()
        .then(function (s) {
          if (s === "granted") tlStart();
          else flash("सेटिंग्जमध्ये Motion access ला परवानगी द्या", "Motion access was not allowed");
        })
        .catch(function () {
          flash("हा फोन झुकणे ओळखत नाही", "Tilt isn't available on this device");
        });
    else tlStart();
  };
  document.getElementById("tlx").onclick = tlStop;
  // a finger on the page holds it; once lifted (and the page has settled) the angle then is the new "still"
  addEventListener(
    "pointerdown",
    function (e) {
      if (!TL.on) return;
      var t = e.target && e.target.closest ? e.target : document.body;
      if (t.closest("#asc")) return;
      if (t.closest(".bar, #panel, #jump, #help, #qrm, #prm, #inm, #rail, #pzv")) return tlStop();
      TL.held = 1;
      clearTimeout(TL.ht);
    },
    { passive: true, capture: true },
  );
  ["pointerup", "touchend", "touchcancel"].forEach(function (n) {
    addEventListener(
      n,
      function (e) {
        if (!TL.held || (e.touches && e.touches.length)) return;
        clearTimeout(TL.ht);
        TL.ht = setTimeout(function () {
          TL.base = TL.p;
          TL.acc = 0;
          TL.held = 0;
        }, 400);
      },
      { passive: true, capture: true },
    );
  });
  // turning the phone round, or switching away, starts afresh
  addEventListener("orientationchange", function () {
    TL.p = TL.base = null;
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible") tlStop();
  });
  tlLabel();

  // ---- Bars tuck away while reading (CSS: "Bars tuck away while reading") ----
  // Phones and tablets without the side menu. Scrolling down past the top of the page tucks the top and
  // bottom bars away (data-tuck); scrolling up, the end of the page, a tap on a blank part of the page,
  // a menu opening, keyboard focus in a bar or a jump (Contents, Prev / Next) brings them back.
  var TK = { y: scrollY, acc: 0, hold: 0 },
    tkStrip = document.getElementById("tuck");
  function tuck(on) {
    on = on && !root.hasAttribute("data-rail") && !root.hasAttribute("data-menu");
    if (on === root.hasAttribute("data-tuck")) return;
    if (on) root.setAttribute("data-tuck", "1");
    else root.removeAttribute("data-tuck");
  }
  addEventListener(
    "scroll",
    function () {
      var y = scrollY,
        d = y - TK.y;
      TK.y = y;
      if (Date.now() < TK.hold) return;
      if (y < 80 || y + innerHeight >= document.documentElement.scrollHeight - 4) return tuck(false);
      // small movements add up, so a slow drag still counts; a change of direction starts again
      TK.acc = (d > 0) === (TK.acc > 0) ? TK.acc + d : d;
      if (TK.acc > 24) tuck(true);
      else if (TK.acc < -24) tuck(false);
    },
    { passive: true },
  );
  function tuckHold() {
    TK.hold = Date.now() + 700;
    TK.acc = 0;
    tuck(false);
  }
  // a jump by the browser (Back, Forward, a link to #piece) brings the bars back; jumps made by the site
  // (Contents, Prev / Next, search) do so in jumpTo(). A big leap between scroll events is not used as a
  // sign of a jump: a fast flick on an iPhone also scrolls in big leaps, and the bars popped up mid-page.
  addEventListener("popstate", tuckHold);
  addEventListener("hashchange", tuckHold);
  // a tap on a blank part of the page (not a line, a link, a button or a dhrupad marker) brings the bars back
  document.addEventListener("click", function (e) {
    if (!root.hasAttribute("data-tuck") || !e.target.closest) return;
    if (e.target.closest(".verse p, a, button, input, select, label, .rmk, .rmkpop, #asc, .bar")) return;
    tuck(false);
  });
  // when autoscroll stops, the bars come back, so ▶ (and the rest) is at hand again
  if (window.MutationObserver)
    new MutationObserver(function () {
      if (!asc.classList.contains("on")) tuckHold();
    }).observe(asc, { attributes: true, attributeFilter: ["class"] });
  tkStrip.addEventListener("click", function () {
    tuck(false);
  });
  document.addEventListener("focusin", function (e) {
    if (e.target.closest && e.target.closest(".bar, #asc")) tuck(false);
  });

  // Highlight the current piece in the menus; update the progress line
  function mark() {
    var c = cur(),
      ct = c ? c.getBoundingClientRect().top : -1e9;
    // a section row (पूजा / आरती) at the top, below the last piece passed: that section is current, not the piece above it
    [].forEach.call(document.querySelectorAll(".grp"), function (g) {
      var t = g.getBoundingClientRect().top;
      if (g.offsetParent !== null && t <= 90 && t > ct) {
        c = g;
        ct = t;
      }
    });
    // Top bar title: the site's name, or once a piece's heading has scrolled under the bar, that piece ("३. देवीची आरती")
    var en = P.lang === "en",
      tt = en ? "Sankashti Chaturthi" : SCR.to("संकष्टी चतुर्थी"),
      bt0 = document.getElementById("bt"),
      hd = c && c.classList.contains("ash") && c.querySelector("header");
    if (hd && hd.getBoundingClientRect().bottom < 64) {
      var no = c.querySelector("h2 .no ." + (en ? "ne" : "nm")),
        nm = c.querySelector("h2 > ." + (en ? "en" : "mr"));
      if (nm) tt = (no ? no.textContent + " " : "") + nm.textContent;
      bt0.classList.add("pc");
    } else bt0.classList.remove("pc");
    if (document.getElementById("btt").textContent !== tt) document.getElementById("btt").textContent = tt;
    // the slim strip shown while the bars are tucked away carries the same name and progress line
    var tkt = document.getElementById("tkt");
    if (tkt.textContent !== tt) tkt.textContent = tt;
    tkt.lang = en ? "en" : SCR.k || "mr";
    bt0.setAttribute("data-tl", en ? "en" : "mr");
    [].forEach.call(document.querySelectorAll("#jump a,#rail a"), function (a) {
      var g = a.getAttribute("data-go"),
        on = c ? g === c.id : g === "home" && !!a.closest("#rail");
      a.classList.toggle("on", on);
      if (on && a.closest("#rail")) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    var pg = document.getElementById("prog");
    if (pg) {
      var dh = document.documentElement.scrollHeight - innerHeight;
      pg.style.transform = document.getElementById("tkp").style.transform =
        "scaleX(" + (dh > 0 ? Math.min(1, Math.max(0, scrollY / dh)) : 0) + ")";
    }
  }
  function goHome() {
    setP(false);
    setJ(false);
    window.scrollTo(0, 0);
  }
  // A line's Marathi and English <p> share a data-l id; return the one currently visible.
  function lineEl(id) {
    var l = [].slice.call(document.querySelectorAll('[data-l="' + id + '"]'));
    for (var i = 0; i < l.length; i++) {
      if (l[i].offsetParent !== null) return l[i];
    }
    return l[0] || null;
  }
  // Scroll to a line (from search) and flash it
  function goLine(id, flash) {
    pjOpen(document.querySelector('[data-l="' + id + '"]'));
    var el = lineEl(id);
    if (!el) return;
    // A line that is hidden in the current dhrupad mode: go to the start of its piece instead
    if (el.offsetParent === null) {
      var sec = el.closest(".ash");
      if (sec) sec.scrollIntoView();
      return;
    }
    // Upper third of the screen, clear of the top bar and of the phone's toolbar at the bottom
    scrollTo(0, Math.max(0, el.getBoundingClientRect().top + scrollY - innerHeight * 0.3));
    if (flash) {
      [].forEach.call(document.querySelectorAll('[data-l="' + id + '"]'), function (p) {
        p.classList.remove("fl");
        void p.offsetWidth;
        p.classList.add("fl");
      });
    }
  }
  // Both languages, English first (Settings → In Both, show first). Each stanza's English block and each piece
  // title's English part are moved in front of the Marathi, so the page, screen readers, the dhrupad bubble and
  // the printout all read English first; data-lead="en" on the page gives English the reading size (CSS below).
  // Outside Both, or with Marathi first, everything is in its original order.
  var LEAD = "mr";
  function leadSet() {
    var L = P.lang === "both" && P.lead === "en" ? "en" : "mr";
    if (L === "en") root.setAttribute("data-lead", "en");
    else root.removeAttribute("data-lead");
    LEAD = L;
    // (checked every time: the contents lists are built after the first call)
    [].forEach.call(document.querySelectorAll(".wrap .verse, .wrap .ash header h2, #home ol.toc .m, #rail ul a, #jl li > a"), function (v) {
      var m = v.querySelector(":scope > .mr"),
        e = v.querySelector(":scope > .en");
      if (!m || !e) return;
      var enFirst = !!(e.compareDocumentPosition(m) & Node.DOCUMENT_POSITION_FOLLOWING);
      if (enFirst !== (L === "en")) v.insertBefore(L === "en" ? e : m, L === "en" ? m : e);
    });
  }
  // Apply every setting in P to the page
  function apply() {
    root.style.setProperty("--fs", P.fs + "px");
    if (P.th === "auto") root.removeAttribute("data-pref");
    else root.setAttribute("data-pref", P.th);
    // Text language on the pieces and the printout; menu language on the bar, menus, home page and dialogs
    // (the Contents fold row #tfr follows the text language, like the पूजा and आरती rows below it)
    [].forEach.call(document.querySelectorAll(".grp,.wrap > .ash,#pv,#home .tocg,#tfr,#jl,#rail"), function (e) {
      e.setAttribute("data-lang", P.lang);
    });
    [].forEach.call(document.querySelectorAll(".bar,#none,#panel,#home > :not(.tocg):not(#tfr),#qrm,#prm,#inm,#szt,#szr"), function (e) {
      e.setAttribute("data-lang", P.ui);
    });
    root.lang = SCR.k || "mr"; // the page is Marathi (or Kannada); English parts carry lang="en" themselves (screen readers pick the voice from this)
    [].forEach.call(document.querySelectorAll("#su button"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.v === P.ui));
    });
    if (["std", "classic", "bold", "hand"].indexOf(P.fnt) < 0) P.fnt = "std";
    root.setAttribute("data-font", P.fnt);
    [].forEach.call(document.querySelectorAll("#sfn button"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.v === P.fnt));
    });
    var qi = document.getElementById("q");
    qi.placeholder = P.ui === "mr" ? "ओळ शोधा (मराठी किंवा इंग्रजी अक्षरे)" : "Find a line (Marathi or English letters)";
    qi.setAttribute("aria-label", P.ui === "mr" ? "ओळ शोधा" : "Find a line");
    root.setAttribute("data-ref", String(P.ref));
    root.setAttribute("data-hc", String(P.hc));
    var wide = innerWidth >= 900,
      two = wide && (P.cols === 2 || (P.cols !== 1 && innerWidth >= 1000));
    root.setAttribute("data-cols", two ? "2" : "1");
    if (innerWidth >= 1100) root.setAttribute("data-rail", "1");
    else root.removeAttribute("data-rail");
    document.getElementById("colrow").hidden = !wide;
    [].forEach.call(document.querySelectorAll("#sc button"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.v === (two ? "2" : "1")));
    });
    // Dhrupad button: icon and label show the current setting
    var rbb = document.getElementById("rb");
    var rOn = !P.ref;
    if (rbb.getAttribute("data-s") !== String(rOn)) {
      rbb.innerHTML = rOn ? RB_LOOP : RB_ONCE;
      rbb.setAttribute("data-s", String(rOn));
    }
    rbb.setAttribute("aria-pressed", String(rOn));
    rbb.setAttribute(
      "aria-label",
      rOn
        ? "Refrain (dhrupad) after every verse. Tap to show it once"
        : "Refrain (dhrupad) shown once. Tap to repeat after every verse",
    );
    leadSet();
    var IN = P.ind === "kn" ? "Kannada" : "Marathi",
      LB = { mr: [LI.mr, IN], en: [LI.en, "English"], both: LEAD === "en" ? [LI.bothEn, "English and " + IN] : [LI.both, IN + " and English"] }[P.lang],
      lk = P.lang + LEAD;
    if (hb.getAttribute("data-l") !== lk) {
      hb.innerHTML = LB[0];
      hb.setAttribute("data-l", lk);
    }
    hb.setAttribute("aria-label", "Language: " + LB[1] + ". Tap to change");
    pfSet();
    autoFs();
    root.style.setProperty("--fs", P.fs + "px");
    spSet();
    pullSoon();
    // The date card is rebuilt only when the menu language or the day changes (rebuilding it on
    // every language switch cost a second page layout on slow phones); otherwise just re-check its wrap
    var sk = P.ui + new Date().toDateString();
    try {
      if (sk !== skKey) {
        skKey = sk;
        skRender();
      } else skDot();
    } catch (e) {}
    foldSet();
    [].forEach.call(document.querySelectorAll("#st button"), function (b) {
      b.setAttribute("aria-pressed", b.dataset.v === P.th);
    });
    document.getElementById("tc").setAttribute("aria-pressed", String(!!P.hc));
    document.getElementById("tw").setAttribute("aria-pressed", String(!!P.wake));
    document.getElementById("tas").setAttribute("aria-pressed", String(!!P.ason));
    if (asb) {
      asLabel();
      asShow();
    }
    mark();
  }

  // ---- Settings panel ----
  document.getElementById("lg").onclick = function () {
    P.fs = Math.min(52, P.fs + 2);
    P.fsu = 1;
    apply();
    save();
  };
  document.getElementById("sr").onclick = function () {
    P.fsu = 0;
    P.fs = dfs();
    apply();
    save();
  };
  document.getElementById("sm").onclick = function () {
    P.fs = Math.max(14, P.fs - 2);
    P.fsu = 1;
    apply();
    save();
  };
  // Text font: switched at once; the text size is fitted again when the new font has arrived
  document.getElementById("sfn").onclick = function (e) {
    var v = (e.target.closest("button") || { dataset: {} }).dataset.v;
    if (!v || v === P.fnt) return;
    P.fnt = v;
    save();
    apply();
    refit();
  };
  // English style (picked with English in the language lists): switched in place (lines, titles, search list),
  // then the text size is fitted again
  function trPick(v) {
    if (v && v !== P.tr) {
      P.tr = v;
      save();
      // each step runs on its own, so a failure in one (named with the browser's message, so it can be traced)
      // can't stop the others or leave the switch showing the old choice; apply() below always runs
      var bad = [];
      [
        ["lines", function () { trSet(v, true); }],
        ["search", buildIX],
        // the text size is fitted to the main language's lines, so only English-only text needs fitting again
        ["size", function () { if (P.lang === "en") refit(); }],
      ].forEach(function (st) {
        try {
          st[1]();
        } catch (er) {
          bad.push(st[0] + ": " + ((er && er.message) || er));
        }
      });
      if (bad.length) {
        flash("बदल पूर्ण झाला नाही (" + bad.join("; ") + ")", "Could not finish the change (" + bad.join("; ") + ")");
        var zt = document.getElementById("szt");
        zt.classList.add("err");
        clearTimeout(flash.t);
        flash.t = setTimeout(function () {
          zt.classList.remove("on", "msg", "err");
        }, 9000);
      }
      apply();
    }
  }
  document.getElementById("su").onclick = function (e) {
    var v = (e.target.closest("button") || { dataset: {} }).dataset.v;
    if (v) {
      P.ui = v;
      apply();
      save();
    }
  };
  document.getElementById("st").onclick = function (e) {
    var v = (e.target.closest("button") || { dataset: {} }).dataset.v;
    if (v) {
      P.th = v;
      apply();
      save();
    }
  };
  document.getElementById("tc").onclick = function () {
    P.hc = P.hc ? 0 : 1;
    apply();
    save();
  };
  document.getElementById("sc").onclick = function (e) {
    var v = (e.target.closest("button") || { dataset: {} }).dataset.v;
    if (!v) return;
    var c = cur();
    P.cols = +v;
    apply();
    save();
    if (c) c.scrollIntoView();
  };

  // ---- Dhrupad button: toggle once / after every stanza, keeping the reader's place ----
  document.getElementById("rb").onclick = function () {
    var bb = document.querySelector(".bar").getBoundingClientRect().bottom,
      a = null,
      t = 0,
      ps = document.querySelectorAll(".items .verse p");
    for (var i = 0; i < ps.length; i++) {
      var x = ps[i];
      if (x.classList.contains("rf") || x.closest(".item.rf")) continue;
      var r = x.getBoundingClientRect();
      if (r.height && r.bottom > bb + 4) {
        a = x;
        t = r.top;
        break;
      }
    }
    P.ref = P.ref ? 0 : 1;
    apply();
    save();
    if (a && a.offsetParent !== null) {
      window.scrollBy(0, a.getBoundingClientRect().top - t);
    }
    if (P.ref) flash("ध्रुपद एकदाच", "Dhrupad shown once");
    else flash("ध्रुपद प्रत्येक कडव्यानंतर", "Dhrupad after every verse");
  };

  // ---- Keep the screen on (Wake Lock). Browsers drop the lock when the page is hidden, so it is re-requested. ----
  var wl = null;
  function wake(on) {
    if (!("wakeLock" in navigator)) return;
    if (on) {
      navigator.wakeLock
        .request("screen")
        .then(function (l) {
          wl = l;
          l.addEventListener("release", function () {
            wl = null;
          });
        })
        .catch(function () {});
    } else if (wl) {
      try {
        wl.release();
      } catch (e) {}
      wl = null;
    }
  }
  if (!("wakeLock" in navigator)) document.getElementById("tw").hidden = true;
  document.getElementById("tw").onclick = function () {
    P.wake = P.wake ? 0 : 1;
    apply();
    save();
    wake(!!P.wake);
  };
  document.addEventListener("visibilitychange", function () {
    if (P.wake && document.visibilityState === "visible" && !wl) wake(true);
  });
  // Some browsers only grant the lock after a tap
  ["touchend", "click"].forEach(function (n) {
    document.addEventListener(
      n,
      function () {
        if (P.wake && !wl) wake(true);
      },
      { passive: true },
    );
  });

  // ---- Overlays: settings panel (setP) and contents + search (setJ); opening one closes the other ----
  // Keyboard and screen reader users: opening a panel moves focus into it; closing it puts focus back on
  // the button that opened it (only if focus was still in the panel, so a jump to a piece isn't undone)
  function ovFocus(el, o) {
    var a = document.activeElement;
    if (o) {
      if (el.hidden) el._ret = a;
      return;
    }
    if (el._ret && (el.contains(a) || a === document.body || !a)) {
      try {
        el._ret.focus({ preventScroll: true });
      } catch (e) {}
    }
    el._ret = null;
  }
  function setP(o) {
    if (o) ovPush();
    ovFocus(pn, o);
    pn.hidden = !o;
    if (o) spSet();
    // the Settings page covers the whole page; the page under it doesn't scroll
    if (o) root.setAttribute("data-sp", "1");
    else root.removeAttribute("data-sp");
    if (o) {
      pn.scrollTop = 0;
      pn.focus({ preventScroll: true });
    }
    aa.setAttribute("aria-expanded", String(o));
    if (o) setJ(false);
    else ovDone();
  }
  function setJ(o) {
    if (o) ovPush();
    var qq = document.getElementById("q");
    if (qq && qq.value) {
      qq.value = "";
      document.getElementById("res").innerHTML = "";
      document.getElementById("none").hidden = true;
      document.getElementById("jl").hidden = false;
    }
    if (!o && qq) qq.blur();
    if (o) {
      mark();
      var bb = document.querySelector(".bar").getBoundingClientRect();
      jp.style.top = Math.round(bb.bottom) + "px";
    }
    ovFocus(jp, o);
    jp.hidden = !o;
    if (o && !jp.contains(document.activeElement)) jp.focus({ preventScroll: true });
    [].forEach.call(document.querySelectorAll("#hm,.pns,#asq"), function (b) {
      b.setAttribute("aria-expanded", String(o));
    });
    if (o) {
      ovFocus(pn, false);
      pn.hidden = true;
      aa.setAttribute("aria-expanded", "false");
    } else ovDone();
  }

  // ---- Back button ----
  // Opening a panel or dialog adds a Back step, so the phone's Back closes it instead of leaving the site.
  // Going to a piece (or home) adds a Back step that returns to where you were. As you read, the address
  // follows the piece on screen (#a5) without adding steps. Each step remembers its scroll position (y).
  var NAV = !!(history.pushState && history.replaceState),
    popSkip = 0;
  // The script puts the page back in place itself (the browser's own guess can land at the top)
  if (NAV && "scrollRestoration" in history) history.scrollRestoration = "manual";
  function hs() {
    return history.state || {};
  }
  function ovOpen() {
    return (
      !pn.hidden ||
      !jp.hidden ||
      ["qrm", "prm", "inm", "help", "pzv"].some(function (i) {
        var e = document.getElementById(i);
        return e && !e.hidden;
      })
    );
  }
  function ovPush() {
    if (!NAV || hs().ov || ovOpen()) return;
    try {
      history.replaceState({ y: scrollY }, "", location.href);
      history.pushState({ ov: 1, y: scrollY }, "", location.href);
    } catch (e) {}
  }
  // Closed with ✕, Escape or a tap outside: take the panel's Back step off again. Only once: history.back()
  // lands later, so a second close in the same moment (Escape closes both panels) must not step back again.
  function ovDone() {
    if (!NAV || !hs().ov || ovOpen() || popSkip) return;
    popSkip++;
    history.back();
  }
  // Go somewhere in the page: go() scrolls, url is "#a3" (a piece) or the bare address (home)
  function jumpTo(go, url) {
    var ov = NAV && hs().ov;
    if (typeof TK === "object" && TK) tuckHold();
    try {
      if (NAV) history.replaceState({ y: scrollY }, "", location.href);
    } catch (e) {}
    setP(false);
    setJ(false);
    go();
    try {
      if (NAV) history[ov ? "replaceState" : "pushState"]({ y: scrollY }, "", url);
    } catch (e) {}
    // Focus follows to the piece's heading, so the next Tab or screen reader line starts there
    var el = url && url.charAt(0) === "#" && document.getElementById(url.slice(1)),
      h = el && el.querySelector("h2");
    if (h) {
      h.tabIndex = -1;
      try {
        h.focus({ preventScroll: true });
      } catch (e) {}
    }
  }
  // Home buttons (top-bar title, Ganesha in the bottom bar, the rail's Home): from a piece they go home;
  // on the home page, with the card in view, they open or close the card like its own round button
  function goHomeNav() {
    var top = document.querySelector("#home .top"),
      r = top && top.getBoundingClientRect();
    if (!cur() && r && r.bottom > 60 && r.top < innerHeight / 2) document.getElementById("cvb").onclick();
    else jumpTo(goHome, location.pathname);
  }
  addEventListener("popstate", function (e) {
    var was = ovOpen();
    setP(false);
    setJ(false);
    ["qrm", "prm", "inm", "pzv"].forEach(function (i) {
      var d = document.getElementById(i);
      if (d) d.hidden = true;
    });
    if (popSkip) {
      popSkip--;
      return;
    }
    if (was) return;
    var st = e.state,
      el = location.hash && document.getElementById(location.hash.slice(1));
    pjOpen(el);
    if (st && typeof st.y === "number") scrollTo(0, st.y);
    else if (el) el.scrollIntoView();
    else scrollTo(0, 0);
  });
  // Switching between Marathi and Kannada letters reloads the page. Settings' Back steps are taken off first (a
  // reload keeps them, and Back would then land on a step whose panel is gone), and Settings opens again after.
  function spReload() {
    var n = NAV && hs().ov ? 1 : 0;
    try {
      sessionStorage.setItem("aarti-sp", "1");
    } catch (e) {}
    if (!n) return location.reload();
    addEventListener("popstate", function () {
      location.reload();
    });
    popSkip++;
    history.go(-n);
  }
  try {
    if (sessionStorage.getItem("aarti-sp")) {
      sessionStorage.removeItem("aarti-sp");
      setTimeout(function () {
        setP(true);
      });
    }
  } catch (e) {}
  // Keyboard: Tab stays inside an open dialog (QR, Print, Add to Home Screen, Help, Settings)
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var d = ["help", "qrm", "prm", "inm", "pzv", "panel"]
      .map(function (i) {
        return document.getElementById(i);
      })
      .filter(function (x) {
        return x && !x.hidden;
      })[0];
    if (!d) return;
    var f = [].filter.call(d.querySelectorAll("button,a[href],input,[tabindex]:not([tabindex='-1'])"), function (x) {
      return !x.disabled && x.offsetParent !== null;
    });
    if (!f.length) return;
    var i = f.indexOf(document.activeElement);
    if (e.shiftKey ? i <= 0 : i === f.length - 1 || i < 0) {
      e.preventDefault();
      f[e.shiftKey ? f.length - 1 : 0].focus();
    }
  });
  var adT = 0;
  window.addEventListener(
    "scroll",
    function () {
      clearTimeout(adT);
      adT = setTimeout(function () {
        if (!NAV || hs().ov || ovOpen()) return;
        var c = cur();
        try {
          history.replaceState({ y: scrollY }, "", c ? "#" + c.id : location.pathname);
        } catch (e) {}
      }, 500);
    },
    { passive: true },
  );

  bt.addEventListener("click", function (e) {
    e.preventDefault();
    goHomeNav();
  });
  var hmb = document.getElementById("hm");
  hmb.onclick = function () {
    setJ(jp.hidden);
    // With a mouse and keyboard, the cursor goes straight into the search box (on phones it doesn't,
    // so the keyboard doesn't pop up over the list)
    if (!jp.hidden && matchMedia("(hover: hover) and (pointer: fine)").matches) document.getElementById("q").focus();
  };
  // Home and Search at the end of each piece do exactly what the top bar's buttons do
  [].forEach.call(document.querySelectorAll(".pnh"), function (h) {
    h.addEventListener("click", function (e) {
      e.preventDefault();
      goHomeNav();
    });
  });
  [].forEach.call(document.querySelectorAll(".pns"), function (b) {
    b.onclick = hmb.onclick;
  });
  // Skip link: focus goes to the first text on screen (a piece, or the page), without changing the address
  document.getElementById("skip").addEventListener("click", function (e) {
    e.preventDefault();
    var c = cur(),
      h = c && c.querySelector("h2"),
      m = document.getElementById("main");
    if (h) h.tabIndex = -1;
    try {
      (h || m).focus({ preventScroll: !!h });
    } catch (x) {}
  });
  // Tabbing out of an open panel closes it, so it doesn't stay over the page you have moved on to
  [pn, jp].forEach(function (el) {
    el.addEventListener("focusout", function (e) {
      var t = e.relatedTarget;
      if (el.hidden || !t || el.contains(t) || t.closest(".bar,#help")) return;
      el._ret = null;
      if (el === pn) setP(false);
      else setJ(false);
    });
  });
  document.getElementById("xc").onclick = function () {
    setP(false);
  };
  aa.onclick = function () {
    setP(pn.hidden);
  };
  // Language button cycles main → second → both (only the two chosen languages ever show). With no second
  // language chosen it opens Settings at the second language's list.
  hb.onclick = function () {
    if (!P.l2) {
      setP(true);
      document.getElementById("sl2s").focus();
      return;
    }
    var c = cur(),
      o = [P.lead, P.l2, "both"];
    P.lang = o[(o.indexOf(P.lang) + 1) % 3];
    apply();
    save();
    if (c) c.scrollIntoView();
    var L = P.lang === "both" ? LANGS[LK(P.lead)].n + " + " + LANGS[LK(P.l2)].n : LANGS[LK(P.lang)].n;
    flash(L, L);
  };

  // ---- Settings page: languages ----
  // Show the settings that depend on the language choice
  function spSet() {
    var mr = P.ui === "mr",
      v1 = document.getElementById("sl1v"),
      v2 = document.getElementById("sl2v");
    var k1 = spKey(P.lead),
      k2 = P.l2 ? spKey(P.l2) : "";
    v1.textContent = spName(k1);
    v1.lang = LK(P.lead);
    v2.textContent = spName(k2);
    v2.lang = P.l2 ? LK(P.l2) : P.ui;
    spOpts(document.getElementById("sl1s"), PICK, k1, function () {
      return false;
    });
    // the second language can't be the main one, nor (for now) a second Indian language beside it
    spOpts(document.getElementById("sl2s"), PICK.concat([""]), k2, function (k) {
      var l = k.split(":")[0];
      return l === LK(P.lead) || (l !== "en" && k && P.lead !== "en");
    });
    // menus are in English or the main language, so with English as the main language there is nothing to pick
    // (nor with Kannada, which has no menus of its own yet)
    document.getElementById("surow").hidden = LK(P.lead) !== "mr";
    [].forEach.call(document.querySelectorAll("#srf button"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.v === String(P.ref)));
    });
    if (pn.hidden) return; // the rest is the preview, made when Settings is open
    // Preview: the first two lines of the Ganapati aarti, main language large and second small, as the pieces show
    // them: the same text size, font and English spelling. Their style is read from the aarti itself, set for a
    // moment to show both languages (nothing is drawn in between).
    var a1 = document.getElementById("a1"),
      was = a1.getAttribute("data-lang"),
      ld = root.getAttribute("data-lead");
    a1.setAttribute("data-lang", P.l2 ? "both" : P.lead);
    if (P.l2 && P.lead === "en") root.setAttribute("data-lead", "en");
    else root.removeAttribute("data-lead");
    var q = function (l, cls) {
      var ps = [].slice.call(a1.querySelectorAll(".items .verse > ." + l + " p"), 0, 2);
      if (!ps.length) return "";
      var c = getComputedStyle(ps[0]),
        // the size as a share of the text size, so the preview follows A− / A+ through the CSS even before this runs again
        r = Math.round((parseFloat(c.fontSize) / (parseFloat(root.style.getPropertyValue("--fs")) || parseFloat(c.fontSize))) * 1e4) / 1e4;
      return (
        '<div class="' + cls + '" lang="' + LK(l) + '" style="font-family:' + c.fontFamily.replace(/"/g, "'") + ";font-size:calc(var(--fs) * " + r + ")" +
        ";font-weight:" + c.fontWeight + ";line-height:" + c.lineHeight + '">' +
        ps.map(function (p) {
          return "<p>" + p.innerHTML.replace(/ ([।॥|])/g, "\u00a0$1") + "</p>"; // a danda never starts a line
        }).join("") + "</div>"
      );
    };
    var h = '<div class="sp-pt">' + (mr ? "नमुना" : "Preview") + '</div><div class="sp-pw">' + q(P.lead, "sp-p1") + (P.l2 ? q(P.l2, "sp-p2") : "") + "</div>";
    a1.setAttribute("data-lang", was);
    if (ld) root.setAttribute("data-lead", ld);
    else root.removeAttribute("data-lead");
    document.getElementById("sprev").innerHTML = h;
  }
  // The language lists: each language once, English twice (one per spelling), and None for the second language.
  // A pick is "mr", "kn", "en:simple" or "en:iast".
  var PICK = ["mr", "en:simple", "en:iast", "kn"];
  function spKey(slot) {
    return LK(slot) === "en" ? "en:" + P.tr : LK(slot);
  }
  function spName(k) {
    if (!k) return P.ui === "mr" ? "काहीही नाही" : "None";
    var l = k.split(":");
    return LANGS[l[0]].n + (l[1] ? " · " + (l[1] === "iast" ? "sukhakartā" : "Sukhkarta") : "");
  }
  function spOpts(sel, ks, cur, off) {
    sel.innerHTML = ks
      .map(function (k) {
        return '<option value="' + k + '"' + (k === cur ? " selected" : "") + (off(k) ? " disabled" : "") + ">" + spName(k) + "</option>";
      })
      .join("");
    sel.value = cur;
  }
  // w: 1 main, 2 second
  function spPick(w, k) {
    var c = cur(),
      // keep showing the same thing: the main language, the second, or both
      role = P.lang === "both" ? 3 : P.lang === P.lead ? 1 : 2,
      l = k.split(":"),
      v = l[0];
    if (l[1] && l[1] !== P.tr) trPick(l[1]);
    // Marathi and Kannada share the original's place: switching between them rewrites the text, so the page reloads
    var ind = v === "en" || !v ? P.ind : v;
    v = v === "en" || !v ? v : "mr";
    if (w === 1) {
      if (v === P.l2) P.l2 = P.lead;
      P.lead = v;
    } else P.l2 = v;
    if (P.lead === "en" || ind !== "mr") P.ui = "en";
    P.lang = !P.l2 || role === 1 ? P.lead : role === 2 ? P.l2 : "both";
    if (ind !== P.ind) {
      P.ind = ind;
      save();
      spReload();
      return;
    }
    apply();
    save();
    if (c) c.scrollIntoView();
  }
  document.getElementById("sl1s").onchange = function () {
    spPick(1, this.value);
  };
  document.getElementById("sl2s").onchange = function () {
    spPick(2, this.value);
  };
  document.getElementById("srf").onclick = function (e) {
    var b = e.target.closest("button");
    if (b && b.dataset.v !== String(P.ref)) document.getElementById("rb").click();
  };

  // ---- Contents list inside the contents + search overlay (built from the home page contents) ----
  var ul = document.getElementById("jl");
  (function () {
    var li = document.createElement("li");
    li.className = "jhome";
    var b = document.createElement("button");
    b.type = "button";
    b.id = "jhb";
    b.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.6 5.5c.5-1.9 1.8-3.1 3.4-3.7 1.6.6 2.9 1.8 3.4 3.7"/><path d="M8.4 5.6h7.2"/><path d="M8.4 5.6c-.4 3.6.6 6.3 2.4 7.4.1 3.3 0 6.3 1.9 7.6 1.6 1 3.5 0 3.2-1.8-.2-1-1.3-1.3-1.8-.6"/><path d="M15.6 5.6c.4 3.6-.6 6.2-2.6 7.2"/><path d="M8.4 5.6C5.6 4.5 2.4 6 2.8 9.6c.3 2.6 2.4 3.7 4.8 3"/><path d="M15.6 5.6c2.8-1.1 6 .4 5.6 4-.3 2.6-2.4 3.7-4.8 3"/><path d="M12 7v1.8"/><path d="M9.3 13.6l-.9 1.6"/></svg><span class="mr">' + SCR.to("मुखपृष्ठ") + '</span><span class="en" lang="en">Home</span>';
    b.onclick = goHomeNav;
    li.appendChild(b);
    ul.appendChild(li);
  })();
  [].forEach.call(document.querySelectorAll(".tocg"), function (g) {
    var as = g.querySelectorAll("ol.toc li a");
    if (!as.length) return;
    var h = document.createElement("li");
    h.className = "jh";
    h.innerHTML = g.querySelector(".gh").innerHTML;
    ul.appendChild(h);
    [].forEach.call(as, function (a) {
      var li = document.createElement("li"),
        b = document.createElement("a");
      b.href = a.getAttribute("href");
      b.setAttribute("data-go", a.getAttribute("data-go"));
      var m = a.querySelector(".m");
      b.innerHTML = m ? m.innerHTML : a.innerHTML;
      li.appendChild(b);
      ul.appendChild(li);
    });
  });
  // ---- Clicks: contents links (data-go) jump to a piece; tapping a verse line highlights it ----
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-go]");
    if (a) {
      e.preventDefault();
      var el = document.getElementById(a.getAttribute("data-go"));
      if (el && el.id === "home" && a.closest("#rail")) return goHomeNav();
      pjOpen(el);
      if (el)
        jumpTo(
          function () {
            if (el.id === "home") scrollTo(0, 0);
            else el.scrollIntoView();
          },
          el.id === "home" ? location.pathname : "#" + el.id,
        );
      else setJ(false);
      return;
    }
    var p = e.target.closest && e.target.closest(".verse p[data-l]");
    if (p) {
      var id = p.getAttribute("data-l"),
        was = p.classList.contains("hl");
      [].forEach.call(document.querySelectorAll("p.hl, .hli"), function (x) {
        x.classList.remove("hl", "hli");
      });
      if (!was) {
        hlMark(id);
        P.hl = id;
      } else {
        P.hl = "";
      }
      save();
    }
  });
  // A click outside an open overlay closes it
  document.addEventListener(
    "click",
    function (e) {
      var x = e.target;
      if (!x.closest) return;
      if (x.closest("#panel,#jump,.bar")) return;
      if (!pn.hidden || !jp.hidden) {
        setP(false);
        setJ(false);
      }
    },
    true,
  );

  // ---- Pinch with two fingers to change the text size (the page itself never zooms) ----
  var pz = null,
    szTm = 0,
    szrTm = 0,
    szt = document.getElementById("szt"),
    szr = document.getElementById("szr");
  szr.onclick = function () {
    szr.hidden = true;
    P.fsu = 0;
    P.fs = dfs();
    apply();
    save();
    showSz();
  };
  function dist(e) {
    var a = e.touches[0],
      b = e.touches[1];
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }
  function showSz() {
    szt.textContent = (P.ui === "mr" ? "अक्षरांचा आकार " : "Text size ") + Math.round((P.fs / (FSA || dfs())) * 100) + "%";
    szt.classList.add("on");
    clearTimeout(szTm);
    szTm = setTimeout(function () {
      szt.classList.remove("on");
    }, 900);
  }
  // Pinch changes the text size, never the page zoom. The two-finger touch is cancelled as soon as it
  // starts (not only when the fingers move), so Safari can't begin its own zoom first; the size is
  // applied once per frame, so the page keeps up with the fingers; and if the page still ends up
  // zoomed (a pinch that began mid-scroll can't be cancelled), it is put back to normal straight away.
  var pzF = 0;
  function unzoom() {
    var vv = window.visualViewport,
      vm = document.querySelector('meta[name="viewport"]');
    if (!vv || !vm || vv.scale < 1.01) return;
    var c = vm.getAttribute("content");
    vm.setAttribute("content", c + ",maximum-scale=1");
    setTimeout(function () {
      vm.setAttribute("content", c);
    }, 300);
  }
  document.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches.length === 2 && document.getElementById("pzv").hidden) {
        if (e.cancelable) e.preventDefault();
        szr.hidden = true;
        pz = { d: dist(e) || 1, fs: P.fs };
      }
    },
    { passive: false },
  );
  document.addEventListener(
    "touchmove",
    function (e) {
      if (pz && e.touches.length === 2) {
        if (e.cancelable) e.preventDefault();
        var v = Math.max(14, Math.min(52, Math.round((pz.fs * dist(e)) / pz.d)));
        if (v !== P.fs) {
          P.fs = v;
          P.fsu = 1;
          if (!pzF)
            pzF = requestAnimationFrame(function () {
              pzF = 0;
              root.style.setProperty("--fs", P.fs + "px");
            });
        }
        showSz();
      }
    },
    { passive: false },
  );
  document.addEventListener(
    "touchend",
    function (e) {
      if (e.touches.length < 2) unzoom();
      if (pz && e.touches.length < 2) {
        pz = null;
        save();
        // Offer a one-tap way back to the default size for a few seconds
        if (P.fs !== (FSA || dfs())) {
          clearTimeout(szTm);
          szTm = setTimeout(function () {
            szt.classList.remove("on");
            szr.hidden = false;
            clearTimeout(szrTm);
            szrTm = setTimeout(function () {
              szr.hidden = true;
            }, 4000);
          }, 700);
        }
      }
    },
    { passive: true },
  );
  addEventListener("gestureend", unzoom);
  ["gesturestart", "gesturechange"].forEach(function (n) {
    document.addEventListener(
      n,
      function (e) {
        e.preventDefault();
      },
      { passive: false },
    );
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      setP(false);
      setJ(false);
    }
  });

  // ---- Search: every Marathi line with its English line; matches ignore svara marks and punctuation ----
  var IX = [];
  function nz(s) {
    return SCR.from(s) // Kannada letters, in the text or typed, match as the Devanagari they come from
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // IAST letters match plain ones: ā → a, ṣ → s
      .replace(/[\u200b\u200c\u200d\u0951\u0952\u1CDA]/g, "")
      .replace(/[।॥|,.\-]/g, " ")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }
  // Forgiving form of English letters, so spellings people type still match: double letters count once
  // (vitthal = vithal), ee = i, oo = u, and the short "a" between consonants or at a word's end is ignored
  // (ganapati = ganpati, sukhakarta = sukhkarta, jagadish = jagdish). Marathi letters are left alone.
  function lz(s) {
    return s
      .replace(/ee/g, "i")
      .replace(/oo/g, "u")
      .replace(/([a-z])\1+/g, "$1")
      .replace(/([bcdfghjklmnpqrstvwxyz])a(?=[bcdfghjklmnpqrstvwxyz])/g, "$1")
      .replace(/([bcdfghjklmnpqrstvwxyz])a\b/g, "$1");
  }
  function buildIX() {
    var seen = {};
    IX = [];
    // only the lines in the pieces themselves: not the copies in the print view or the dhrupad bubble
    [].forEach.call(document.querySelectorAll(".ash .mr p[data-l]"), function (p) {
      if (p.closest("#pv, .rmkpop")) return;
      var id = p.getAttribute("data-l"),
        sec = p.closest(".ash"),
        en = sec.querySelector('.en p[data-l="' + id + '"]'),
        m = p.innerHTML
          .replace(/<br\s*\/?>/g, " ")
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&"),
        e = en
          ? en.innerHTML
              .replace(/<br\s*\/?>/g, " ")
              .replace(/<[^>]+>/g, "")
              .replace(/&amp;/g, "&")
          : "",
        k = sec.id + "|" + nz(m);
      if (ENS[id]) e += " \u0000" + ENS[id];
      if (seen[k]) return;
      seen[k] = 1;
      IX.push({ id: id, sec: sec.id, m: m, e: e.split(" \u0000")[0], t: nz(m) + " " + nz(e), l: lz(nz(e)) });
    });
  }
  buildIX();
  var q = document.getElementById("q"),
    res = document.getElementById("res"),
    none = document.getElementById("none");
  function sectionTitle(id) {
    var h = document.getElementById(id).querySelector("h2"),
      s = h.querySelector(P.lang === "en" ? ".en" : ".mr");
    return (s || h).textContent;
  }
  // Keyboard: ↓ / ↑ move through the results, Enter in the box opens the first one
  jp.addEventListener("keydown", function (e) {
    var bs = [].slice.call(res.querySelectorAll("button")),
      i = bs.indexOf(document.activeElement);
    if (e.key === "ArrowDown" && bs.length) {
      e.preventDefault();
      bs[Math.min(bs.length - 1, i + 1)].focus();
    } else if (e.key === "ArrowUp" && i >= 0) {
      e.preventDefault();
      (i === 0 ? q : bs[i - 1]).focus();
    } else if (e.key === "Enter" && document.activeElement === q && bs.length) {
      e.preventDefault();
      bs[0].click();
    }
  });
  q.addEventListener("input", function () {
    var v = nz(q.value);
    res.innerHTML = "";
    none.hidden = true;
    ul.hidden = v.length >= 2;
    if (v.length < 2) return;
    var tk = v.split(" "),
      lk = tk.map(lz),
      out = [];
    function has(t, ks) {
      for (var j = 0; j < ks.length; j++) if (t.indexOf(ks[j]) < 0) return false;
      return true;
    }
    // Exact matches first, then the forgiving ones
    for (var i = 0; i < IX.length && out.length < 40; i++) if (has(IX[i].t, tk)) out.push(IX[i]);
    for (i = 0; i < IX.length && out.length < 40; i++) if (out.indexOf(IX[i]) < 0 && has(IX[i].l, lk)) out.push(IX[i]);
    if (!out.length) {
      none.hidden = false;
      return;
    }
    // Show the line with the words that match the search in bold
    function mk(el, txt) {
      txt.split(/(\s+)/).forEach(function (w) {
        var n = nz(w),
          hit =
            n &&
            tk.some(function (k, j) {
              return k.length > 1 && (n.indexOf(k) >= 0 || lz(n).indexOf(lk[j]) >= 0);
            });
        if (hit) {
          var bb = document.createElement("mark");
          bb.textContent = w;
          el.appendChild(bb);
        } else el.appendChild(document.createTextNode(w));
      });
    }
    out.forEach(function (r) {
      var li = document.createElement("li"),
        b = document.createElement("button");
      b.type = "button";
      var s1 = document.createElement("span");
      s1.className = "rs";
      s1.lang = P.lang === "en" ? "en" : "mr";
      s1.textContent = sectionTitle(r.sec);
      var s2 = document.createElement("span");
      s2.className = "rl";
      s2.lang = P.lang === "en" ? "en" : "mr";
      mk(s2, P.lang === "en" ? r.e : r.m);
      b.appendChild(s1);
      b.appendChild(s2);
      if (P.lang === "both") {
        var s3 = document.createElement("span");
        s3.className = "rl2";
        s3.lang = "en";
        mk(s3, r.e);
        b.appendChild(s3);
      }
      b.onclick = function () {
        jumpTo(function () {
          goLine(r.id, true);
        }, "#" + r.sec);
      };
      li.appendChild(b);
      res.appendChild(li);
    });
  });

  // ---- Start-up ----
  // While scrolling: highlight the current piece in the menus and move the progress line (once per frame)
  var tk = 0;
  window.addEventListener(
    "scroll",
    function () {
      if (tk) return;
      tk = requestAnimationFrame(function () {
        tk = 0;
        mark();
      });
    },
    { passive: true },
  );
  // highlight a tapped line (each copy of it: Marathi, English, a repeated dhrupad) and the stanza around it
  function hlMark(id) {
    [].forEach.call(document.querySelectorAll('[data-l="' + id + '"]'), function (x) {
      x.classList.add("hl");
      var st = x.closest(".items > .item, .rftop");
      if (st) st.classList.add("hli");
    });
  }
  if (P.hl) hlMark(P.hl);
  apply();
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(function () {
      FR = {};
      if (!P.fsu) {
        apply();
      }
    });
  var rzT = 0;
  window.addEventListener("resize", function () {
    clearTimeout(rzT);
    rzT = setTimeout(function () {
      apply();
    }, 150);
  });
  // Opened with a link such as …/#a3: go to that piece
  var h = (location.hash || "").slice(1);
  if (h) {
    var el = document.getElementById(h);
    // (a folded piece stays folded here: the address follows the piece you read, so a reload would open it)
    if (el && el.classList.contains("ash")) pjOpen(el, true);
    if (el && el.classList.contains("ash"))
      setTimeout(function () {
        el.scrollIntoView();
      }, 50);
  }
  if (P.wake) wake(true);
  // Reading position: phones often reload a home-screen app after switching away, so remember
  // the piece and how far into it you were, and return there when reopened within 12 hours
  var PK = "aarti2-pos",
    posT = 0;
  function savePos() {
    var c = cur(),
      y = c ? scrollY - (c.getBoundingClientRect().top + scrollY) : scrollY;
    try {
      localStorage.setItem(PK, JSON.stringify({ id: c ? c.id : "", y: Math.round(y), t: Date.now() }));
    } catch (e) {}
  }
  window.addEventListener(
    "scroll",
    function () {
      clearTimeout(posT);
      posT = setTimeout(savePos, 400);
    },
    { passive: true },
  );
  window.addEventListener("pagehide", savePos);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) savePos();
  });
  var sp = null;
  try {
    sp = JSON.parse(localStorage.getItem(PK) || "null");
  } catch (e) {}
  // A link to a piece wins, unless it is the piece you were already reading
  if (!h || (sp && sp.id === h)) {
    if (sp && Date.now() - sp.t < 12 * 3600000 && (sp.id || sp.y > 0)) {
      var moved = false,
        goPos = function () {
          if (moved) return;
          var el = sp.id && document.getElementById(sp.id);
          if (el && el.offsetParent === null) return; // a folded Pooja piece: stay at the top
          scrollTo(0, el ? el.getBoundingClientRect().top + scrollY + sp.y : sp.y);
        };
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      setTimeout(goPos, 50);
      setTimeout(goPos, 400);
      // Text sizes settle once the fonts load; go there again unless the reader has already moved
      if (document.fonts && document.fonts.ready)
        document.fonts.ready.then(function () {
          setTimeout(goPos, 60);
        });
      ["touchstart", "wheel", "keydown"].forEach(function (ev) {
        addEventListener(
          ev,
          function () {
            moved = true;
          },
          { once: true, passive: true },
        );
      });
    }
  }


  // ---- Full-screen picture (#pzv): pinch or double-tap to zoom (1x to 5x), drag to move ----
  // Works with fingers and a mouse (scroll wheel zooms). The text-size pinch is off while it is open.
  (function () {
    var v = document.getElementById("pzv"),
      im = document.getElementById("pzi"),
      ib = document.getElementById("iconb"),
      hint = document.getElementById("pzh");
    if (!v || !im || !ib) return;
    var s = 1,
      tx = 0,
      ty = 0,
      pts = {},
      g = null,
      lastTap = 0,
      moved = false;
    function draw() {
      // keep the picture from being dragged out of view
      var w = im.offsetWidth,
        h = im.offsetHeight,
        mx = Math.max(0, ((s - 1) * w) / 2 + 40),
        my = Math.max(0, ((s - 1) * h) / 2 + 40);
      if (s <= 1.01) {
        s = 1;
        tx = ty = 0;
      }
      tx = Math.max(-mx, Math.min(mx, tx));
      ty = Math.max(-my, Math.min(my, ty));
      im.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + s + ")";
      v.classList.toggle("zoomed", s > 1);
    }
    // zoom to scale ns, keeping the screen point (px, py) still
    function zoomAt(ns, px, py) {
      ns = Math.max(1, Math.min(5, ns));
      var r = v.getBoundingClientRect(),
        cx = r.left + r.width / 2 + tx,
        cy = r.top + r.height / 2 + ty;
      tx += (px - cx) * (1 - ns / s);
      ty += (py - cy) * (1 - ns / s);
      s = ns;
      draw();
    }
    function open() {
      ovPush();
      s = 1;
      tx = ty = 0;
      draw();
      hint.textContent = P.ui === "mr" ? "मोठे करण्यासाठी दोन बोटांनी पसरा किंवा दोनदा टॅप करा" : "Pinch or double-tap to zoom";
      v.hidden = false;
      document.documentElement.style.overflow = "hidden";
      document.getElementById("pzx").focus();
    }
    function close(fromPop) {
      if (v.hidden) return;
      v.hidden = true;
      document.documentElement.style.overflow = "";
      if (!fromPop) ovDone();
      try {
        ib.focus({ preventScroll: true });
      } catch (e) {}
    }
    ib.addEventListener("click", function (e) {
      e.stopPropagation();
      open();
    });
    document.getElementById("pzx").onclick = function () {
      close();
    };
    addEventListener("popstate", function () {
      close(true);
    });
    document.addEventListener("keydown", function (e) {
      if (v.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "+" || e.key === "=") zoomAt(s * 1.5, innerWidth / 2, innerHeight / 2);
      if (e.key === "-") zoomAt(s / 1.5, innerWidth / 2, innerHeight / 2);
    });
    v.addEventListener("pointerdown", function (e) {
      if (e.target.closest("#pzx")) return;
      try {
        v.setPointerCapture(e.pointerId);
      } catch (x) {}
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var k = Object.keys(pts);
      if (k.length === 1) {
        moved = false;
        g = { x: e.clientX, y: e.clientY, tx: tx, ty: ty };
      } else if (k.length === 2) {
        var a = pts[k[0]],
          b = pts[k[1]];
        g = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, s: s, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
        moved = true;
      }
    });
    v.addEventListener("pointermove", function (e) {
      if (!pts[e.pointerId] || !g) return;
      pts[e.pointerId] = { x: e.clientX, y: e.clientY };
      var k = Object.keys(pts);
      if (k.length >= 2 && g.d) {
        var a = pts[k[0]],
          b = pts[k[1]];
        zoomAt((g.s * Math.hypot(a.x - b.x, a.y - b.y)) / g.d, (a.x + b.x) / 2, (a.y + b.y) / 2);
      } else if (k.length === 1 && g.tx !== undefined) {
        var dx = e.clientX - g.x,
          dy = e.clientY - g.y;
        if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
        if (s > 1) {
          tx = g.tx + dx;
          ty = g.ty + dy;
          draw();
        }
      }
    });
    function up(e) {
      if (!pts[e.pointerId]) return;
      delete pts[e.pointerId];
      var k = Object.keys(pts);
      if (k.length === 1) {
        // one finger lifted from a pinch: carry on dragging with the other
        var p = pts[k[0]];
        g = { x: p.x, y: p.y, tx: tx, ty: ty };
        return;
      }
      if (k.length) return;
      g = null;
      if (moved || e.type === "pointercancel") return;
      var now = Date.now();
      if (now - lastTap < 320) {
        // double tap: zoom in where tapped, or back out
        lastTap = 0;
        if (s > 1) {
          s = 1;
          draw();
        } else zoomAt(2.5, e.clientX, e.clientY);
        return;
      }
      lastTap = now;
      // a single tap outside the picture closes it (after the double-tap wait)
      if (e.target !== im && s === 1)
        setTimeout(function () {
          if (lastTap === now) close();
        }, 330);
    }
    v.addEventListener("pointerup", up);
    v.addEventListener("pointercancel", up);
    v.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
        zoomAt(s * Math.exp(-e.deltaY / 300), e.clientX, e.clientY);
      },
      { passive: false },
    );
    addEventListener("resize", function () {
      if (!v.hidden) draw();
    });
  })();

  // ---- Help: opens over the page; the phone's Back button closes it ----
  (function () {
    var hp = document.getElementById("help");
    function open() {
      ovPush();
      // From Settings, focus goes back to the ⚙ button when Help closes
      hp._ret = pn.hidden ? document.activeElement : aa;
      hp.hidden = false;
      setP(false);
      hp.scrollTop = 0;
      document.documentElement.style.overflow = "hidden";
      document.getElementById("hlpx").focus();
    }
    function close(fromPop) {
      if (hp.hidden) return;
      hp.hidden = true;
      document.documentElement.style.overflow = "";
      if (!fromPop) ovDone();
      if (hp._ret) {
        try {
          hp._ret.focus({ preventScroll: true });
        } catch (e) {}
        hp._ret = null;
      }
    }
    document.getElementById("hlpb").onclick = open;
    document.getElementById("hlp2").onclick = open;
    document.getElementById("hlpx").onclick = function () {
      close();
    };
    addEventListener("popstate", function () {
      close(true);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
    if (location.hash === "#help") {
      try {
        history.replaceState(null, "", location.pathname);
      } catch (e) {}
      open();
    }
  })();

  // ---- Print ----
  // Print: single column (as on screen), two columns, or Marathi | English side by side.
  // A separate print view (#pv) is built from the visible text just before printing, so that
  // a heading always stays with its dhrupad and first stanza and stanzas are never split.
  (function () {
    var pm = document.getElementById("prm"),
      pv = document.getElementById("pv"),
      b1 = document.getElementById("pr1"),
      b2 = document.getElementById("pr2"),
      busy = false;
    function lbl(m, e) {
      return '<span class="mr">' + m + '</span><span class="en" lang="en">' + e + "</span>";
    }
    function shown(el) {
      return el.offsetParent !== null || (getComputedStyle(el).display !== "none" && el.getClientRects().length > 0);
    }
    function cl(el) {
      var c = el.cloneNode(true);
      c.removeAttribute("id");
      [].forEach.call(c.querySelectorAll("[id]"), function (x) {
        x.removeAttribute("id");
      });
      return c;
    }
    function keep(nodes) {
      var d = document.createElement("div");
      d.className = "pvk";
      nodes.forEach(function (n) {
        d.appendChild(n);
      });
      return d;
    }
    function td(nodes) {
      var t = document.createElement("td");
      nodes.forEach(function (n) {
        t.appendChild(n);
      });
      return t;
    }
    // Build the print view (#pv) from the page: contents, then every piece in the text language.
    // mode: "two" (two columns), "one" (one column) or "side" (Marathi and English side by side)
    function build(mode) {
      // Folded sections and pieces are printed in full: open them while the text is copied
      var fa = ["data-pf", "data-xf"].map(function (a) {
          var v = root.getAttribute(a);
          root.removeAttribute(a);
          return [a, v];
        }),
        fs = secs.filter(function (x) {
          return x.classList.contains("af");
        });
      fs.forEach(function (x) {
        x.classList.remove("af");
      });
      try {
        build2(mode);
      } finally {
        fa.forEach(function (a) {
          if (a[1] !== null) root.setAttribute(a[0], a[1]);
        });
        fs.forEach(function (x) {
          x.classList.add("af");
        });
      }
    }
    function build2(mode) {
      pv.innerHTML = "";
      var h = document.createElement("h1");
      h.className = "pvh";
      h.innerHTML = lbl(SCR.to("संकष्टी चतुर्थी"), "Sankashti Chaturthi");
      pv.appendChild(h);
      var tc = document.createElement("div");
      tc.className = "pvtoc";
      [].forEach.call(document.querySelectorAll(".tocg"), function (g) {
        var as = g.querySelectorAll("ol.toc li a");
        if (!as.length) return;
        var h3 = document.createElement("h3");
        h3.innerHTML = g.querySelector(".gh").innerHTML;
        tc.appendChild(h3);
        var ol = document.createElement("ol");
        [].forEach.call(as, function (a) {
          var li = document.createElement("li"),
            m = a.querySelector(".m");
          li.innerHTML = m ? m.innerHTML : a.innerHTML;
          li.setAttribute("data-sid", a.getAttribute("data-go") || "");
          ol.appendChild(li);
        });
        ol.style.gridTemplateRows = "repeat(" + Math.ceil(as.length / 2) + ", auto)"; // two columns, top to bottom
        tc.appendChild(ol);
      });
      pv.appendChild(tc);
      secs.forEach(function (sec) {
        var box = document.createElement("section");
        box.className = "pvs";
        box.setAttribute("data-sid", sec.id);
        var hd = document.createElement("h2");
        hd.innerHTML = sec.querySelector("h2").innerHTML;
        var pre = [];
        var gp = sec.previousElementSibling;
        if (gp && gp.classList.contains("grp")) {
          var gl = document.createElement("div");
          gl.className = "pvg";
          gl.innerHTML = gp.innerHTML;
          [].forEach.call(gl.querySelectorAll(".allb"), function (x) {
            x.remove(); // Open all / Fold all is for the screen only
          });
          pre.push(gl);
        }
        pre.push(hd);
        var units = [],
          rt = sec.querySelector(".rftop");
        if (rt && shown(rt)) {
          var r = cl(rt);
          r.classList.add("pvref");
          units.push(r);
        }
        [].forEach.call(sec.querySelectorAll(".items > .item, .items > .rmk"), function (u) {
          if (shown(u)) units.push(cl(u));
        });
        if (mode === "side") {
          var first = true,
            t,
            hold = null;
          function flushT() {
            if (!t) return;
            if (first && !hold && t.querySelector(".pvrefrow")) {
              hold = t;
              t = null;
              return;
            }
            var k = first ? keep(pre.concat(hold ? [hold] : [], [t])) : keep([t]);
            first = false;
            box.appendChild(k);
            t = null;
          }
          units.forEach(function (u, ui) {
            if (!u.classList.contains("rmk") || !t) {
              flushT();
              t = document.createElement("table");
              t.className = "pvt pvside";
            }
            if (u.classList.contains("rmk")) {
              var tr = document.createElement("tr");
              var c = td([u]);
              c.colSpan = 2;
              tr.appendChild(c);
              t.appendChild(tr);
              return;
            }
            var lab = u.querySelector(".lab");
            if (lab) {
              var lr = document.createElement("tr"),
                lc = td([lab]);
              lc.colSpan = 2;
              lr.appendChild(lc);
              t.appendChild(lr);
            }
            var v = u.querySelector(".verse"),
              ms = v.querySelectorAll(".mr p"),
              es = v.querySelectorAll(".en p"),
              bold = u.classList.contains("pvref") || v.classList.contains("bold");
            [].forEach.call(ms, function (mp, i) {
              var tr = document.createElement("tr");
              if (mp.classList.contains("rf") || bold) tr.className = "pvb";
              if (u.classList.contains("pvref")) tr.className += " pvrefrow";
              if (i === ms.length - 1) tr.className += " pvend";
              var a = document.createElement("td"),
                b = document.createElement("td");
              a.className = "pvm mr";
              b.className = "pve en";
              a.setAttribute("lang", "mr");
              b.setAttribute("lang", "en");
              a.innerHTML = mp.innerHTML;
              b.innerHTML = es[i] ? es[i].innerHTML : "";
              if (mp.classList.contains("rf")) {
                tr.classList.add("rfl");
              }
              // English first (Settings → In Both, show first): English on the left
              tr.appendChild(LEAD === "en" ? b : a);
              tr.appendChild(LEAD === "en" ? a : b);
              t.appendChild(tr);
            });
          });
          flushT();
          if (first && hold) {
            t = hold;
            hold = null;
            flushT();
          }
        } else if (mode === "one") {
          var head = pre.slice();
          if (units[0] && units[0].classList.contains("pvref")) head.push(units.shift());
          var gs = [],
            wait = [];
          units.forEach(function (u) {
            if (u.classList.contains("rmk") && gs.length) {
              gs[gs.length - 1].push(u);
              return;
            }
            if (u.classList.contains("rmk")) {
              wait.push(u);
              return;
            }
            gs.push(wait.concat([u]));
            wait = [];
          });
          if (wait.length) gs.push(wait);
          gs.forEach(function (g) {
            box.appendChild(keep(head.concat(g)));
            head = [];
          });
          if (head.length) box.appendChild(keep(head));
        } else {
          // Two columns, newspaper style: the heading (and dhrupad) across the page, then the stanzas
          // run down the left column to the foot of the page and on down the right column.
          var head = pre.slice();
          if (units[0] && units[0].classList.contains("pvref")) head.push(units.shift());
          var cols = document.createElement("div"),
            gs2 = [],
            wait2 = [];
          cols.className = "pvc";
          units.forEach(function (u) {
            if (u.classList.contains("rmk") && gs2.length) {
              gs2[gs2.length - 1].push(u);
              return;
            }
            if (u.classList.contains("rmk")) {
              wait2.push(u);
              return;
            }
            gs2.push(wait2.concat([u]));
            wait2 = [];
          });
          if (wait2.length) gs2.push(wait2);
          gs2.forEach(function (g) {
            g.forEach(function (u) {
              u.removeAttribute("style"); // drop the on-screen grid placement
            });
          });
          if (root.classList.contains("wk")) {
            // Safari and iOS browsers ignore CSS columns when printing. Instead, cut the piece into
            // blocks small enough for one page (even sideways) and fill each block's left column
            // first, then its right one. A short piece is a single block.
            var CAP = 22; // estimated printed lines per column in one block
            function gl(g) {
              var n = 0;
              g.forEach(function (u) {
                if (u.classList.contains("rmk")) {
                  n += 1;
                  return;
                }
                [].forEach.call(u.querySelectorAll(".verse ." + (P.lang === "en" ? "en" : "mr") + " p"), function (x) {
                  n += Math.ceil(x.textContent.length / (P.lang === "en" ? 42 : 48)) || 1;
                });
                n += 1;
              });
              return n;
            }
            var blocks = [],
              cur2 = [],
              cn2 = 4; // the heading and dhrupad share the first block's page
            gs2.forEach(function (g) {
              var n = gl(g);
              if (cur2.length && cn2 + n > 2 * CAP) {
                blocks.push(cur2);
                cur2 = [];
                cn2 = 0;
              }
              cur2.push(g);
              cn2 += n;
            });
            if (cur2.length) blocks.push(cur2);
            blocks.forEach(function (bk, bi) {
              var ls = bk.map(gl),
                tot = ls.reduce(function (a, b) {
                  return a + b;
                }, 0),
                k = bk.length,
                best = 1e9,
                l = 0;
              for (var j = 1; j <= bk.length; j++) {
                l += ls[j - 1];
                var m = Math.max(l, tot - l);
                if (m < best) {
                  best = m;
                  k = j;
                }
              }
              var t2 = document.createElement("table");
              t2.className = "pvt pv2";
              var tr2 = document.createElement("tr");
              tr2.appendChild(td([].concat.apply([], bk.slice(0, k))));
              tr2.appendChild(td([].concat.apply([], bk.slice(k))));
              t2.appendChild(tr2);
              box.appendChild(keep(bi ? [t2] : head.concat([t2])));
            });
            if (!blocks.length) box.appendChild(keep(head));
          } else {
            gs2.forEach(function (g) {
              cols.appendChild(keep(g));
            });
            var hk = keep(head);
            hk.classList.add("pvhd");
            box.appendChild(hk);
            box.appendChild(cols);
          }
        }
        var cr = sec.querySelector(".cr");
        if (cr) {
          // the author line prints as plain text: the Wikipedia link is for the screen
          var pc = cl(cr);
          pc.className = "pvcr";
          [].forEach.call(pc.querySelectorAll(".crx"), function (x) {
            x.remove();
          });
          [].forEach.call(pc.querySelectorAll("a"), function (a) {
            a.replaceWith(document.createTextNode(a.textContent));
          });
          // inside the piece's last unbroken block, so it never lands alone at the top of a page
          var ks = box.querySelectorAll(".pvk");
          (ks.length ? ks[ks.length - 1] : box).appendChild(pc);
        }
        pv.appendChild(box);
      });
    }
    // ---- Page numbers in the printed contents ----
    // A browser cannot print "page N" for a heading, so the print view is laid out once in a hidden
    // frame the size of a printed page (Letter in the US and Canada, A4 elsewhere, upright) and
    // each piece's first page is worked out from the heights, as the browser breaks pages.
    var LTR = /-(US|CA|MX|PH)$/i.test(navigator.language || ""),
      PAPER = LTR ? [215.9, 279.4] : [210, 297],
      pcache = { key: "", pg: null };
    function pkey(mode) {
      return [mode, P.lang, LEAD, P.ref, P.tr, P.ui, P.fnt].join("|");
    }
    // the site's CSS as the printer sees it: print rules on, screen-only rules off, no @page
    function pcss() {
      if (pcss.t) return pcss.t;
      var out = [];
      function walk(rules) {
        [].forEach.call(rules, function (r) {
          if (r.type === 4) {
            var m = r.media.mediaText;
            if (/print/.test(m)) walk(r.cssRules);
            else if (!/screen/.test(m)) out.push(r.cssText);
          } else if (r.type !== 6) out.push(r.cssText);
        });
      }
      [].forEach.call(document.styleSheets, function (sh) {
        try {
          walk(sh.cssRules);
        } catch (e) {}
      });
      return (pcss.t = out.join("\n"));
    }
    // lay out the current print view (#pv) and call back with { piece id: first page }
    function pages(mode, cb) {
      var mm = 96 / 25.4,
        f = document.createElement("iframe"),
        at = "",
        done = false;
      f.setAttribute("aria-hidden", "true");
      f.tabIndex = -1;
      // Safari (macOS 26, from Satish's PDFs) prints everything about 16/15 larger than Chrome, so a
      // page holds less: lay it out on a page that much smaller
      var sf = root.classList.contains("wk") ? 15 / 16 : 1;
      f.style.cssText = "position:fixed;left:-10000px;top:0;border:0;visibility:hidden;width:" + ((PAPER[0] - 18) * mm * sf - (P.fnt && P.fnt !== "std" ? 16 : 12)) + "px;height:" + (PAPER[1] - 23) * mm * sf + "px";
      [].forEach.call(root.attributes, function (a) {
        if (a.name !== "data-print") at += " " + a.name + '="' + a.value.replace(/&/g, "&amp;").replace(/"/g, "&quot;") + '"';
      });
      document.body.appendChild(f);
      function end(r) {
        if (done) return;
        done = true;
        if (f.parentNode) f.parentNode.removeChild(f);
        cb(r);
      }
      setTimeout(function () {
        end(null);
      }, 2500);
      try {
        var d = f.contentDocument;
        d.open();
        d.write('<!doctype html><html data-print="' + mode + '"' + at + '><head><base href="' + location.href.replace(/"/g, "%22") + '"><style>' + pcss() + "\nhtml,body{margin:0;overflow:hidden}#pv .pvtoc{break-after:column}#pv .pvs+.pvs{break-before:column}</style></head><body>" + pv.outerHTML + "</body></html>");
        d.close();
        // lay out once so the fonts the copy uses start loading, then wait for them before measuring
        d.documentElement.offsetHeight;
        d.fonts.ready.then(function () {
          try {
            end(paginate(f.contentWindow, d, (PAPER[1] - 23) * sf, mm));
          } catch (e) {
            end(null);
          }
        });
      } catch (e) {
        end(null);
      }
    }
    // The site decides every page break, because a forced break ("start a new page here") is the one
    // page rule Chrome and Safari both follow. Each piece starts on a new page; its blocks (stanzas,
    // verse groups) are packed onto pages with 4% to spare, and a break is forced before each block
    // that starts a page. The contents numbers come from the same plan, so they match the printout.
    // Chrome's two-column flow (.pvc) can't take forced breaks, so its pages are found by laying the
    // print view out as a row of page-sized columns, as the browser breaks pages.
    function paginate(w, d, hmm, mm) {
      var p = d.getElementById("pv"),
        cs = w.getComputedStyle(p),
        pl = parseFloat(cs.paddingLeft),
        cw = p.clientWidth - pl - parseFloat(cs.paddingRight),
        secs = [].slice.call(p.querySelectorAll(".pvs")),
        // Measured against Chrome's own PDFs: the frame is 12px narrower than the page (16px with the
        // optional text fonts; printed text runs a little wider, so a near-full line wraps), and pages
        // with two columns of text hold 4px more than the plain sum of heights.
        H = hmm * mm - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) + (p.querySelector(".pvc") ? 4 : 0),
        C = H * 0.96,
        plan = {},
        z = {},
        out = { z: z, b: {} };
      if (!secs.length) return out;
      function pack(hs, k) {
        var n = 1,
          used = 0,
          br = [];
        hs.forEach(function (h, i) {
          h *= k;
          if (used > 0 && used + h > C) {
            n++;
            used = 0;
            br.push(i);
          }
          used += h;
        });
        return { n: n, b: br, f: used / C };
      }
      // 1. pieces made of blocks: measure each block and pack them onto pages. Measured 20px narrower
      // than the frame (a near-full line then wraps here first), so heights err on the tall side.
      var pw = p.style.cssText;
      p.style.cssText = "box-sizing:border-box;width:" + (p.offsetWidth - 20) + "px";
      secs.forEach(function (e) {
        var id = e.getAttribute("data-sid"),
          kids = [].slice.call(e.children);
        if (!kids.length || e.querySelector(".pvc")) return;
        var top = e.getBoundingClientRect().top,
          tops = kids.map(function (c) {
            return c.getBoundingClientRect().top;
          }),
          hs = kids.map(function (c, i) {
            return (i + 1 < kids.length ? tops[i + 1] : c.getBoundingClientRect().bottom) - (i ? tops[i] : top);
          }),
          r = pack(hs, 1);
        // a piece that spills a little onto another page is set slightly smaller (down to 80%) to fit
        if (r.n > 1 && r.f < 0.25)
          for (var t = 98; t >= 80; t -= 2) {
            var q = pack(hs, t / 100);
            if (q.n < r.n) {
              r = q;
              z[id] = t / 100;
              break;
            }
          }
        plan[id] = r;
        if (r.b.length) out.b[id] = r.b;
      });
      p.style.cssText = pw;
      // pages the contents take
      var first = secs[0].getBoundingClientRect().top - p.getBoundingClientRect().top - parseFloat(cs.paddingTop),
        page = Math.max(1, Math.ceil((first - 1) / H));
      // 2. Chrome's two-column pieces: lay out as page-sized columns and count the columns each takes
      if (secs.some(function (e) {
          return !plan[e.getAttribute("data-sid")];
        })) {
        p.style.cssText =
          "padding-top:0;padding-bottom:0;box-sizing:content-box;overflow:visible;column-gap:0;column-fill:auto;column-width:" + cw + "px;height:" + H + "px";
        var x0 = p.getBoundingClientRect().left + pl,
          y0 = p.getBoundingClientRect().top;
        var measure = function (e) {
          var c = e.firstElementChild,
            l = e.lastElementChild,
            rr = l.getClientRects(),
            b = rr[rr.length - 1] || l.getBoundingClientRect(),
            s = Math.round((c.getBoundingClientRect().left - x0) / cw);
          return { n: Math.round((b.left - x0) / cw) + 1 - s, f: (b.bottom - y0) / H };
        };
        secs.forEach(function (e) {
          var id = e.getAttribute("data-sid");
          if (plan[id] || !e.firstElementChild) return;
          var r = measure(e),
            k = 0;
          // only just spilling onto a page, or only just filling one: set slightly smaller so it
          // ends well inside a page
          if (r.n > 1 && r.f < 0.15) k = (0.94 * (r.n - 1)) / (r.n - 1 + r.f);
          else if (r.f > 0.94) k = (r.n - 1 + 0.9) / (r.n - 1 + r.f);
          if (k >= 0.8 && k < 1) {
            z[id] = Math.round(k * 100) / 100;
            e.style.zoom = z[id];
            r = measure(e);
          }
          plan[id] = r;
        });
      }
      secs.forEach(function (e) {
        var id = e.getAttribute("data-sid");
        out[id] = page + 1;
        page += (plan[id] && plan[id].n) || 1;
      });
      return out;
    }
    // write the page numbers into the printed contents
    function pnums(pg) {
      // the page plan (see paginate): pieces set slightly smaller, and a forced page break before
      // each block that starts a page
      [].forEach.call(pv.querySelectorAll(".pvbr"), function (e) {
        e.parentNode.removeChild(e);
      });
      [].forEach.call(pv.querySelectorAll(".pvs"), function (e) {
        var id = e.getAttribute("data-sid"),
          kids = [].slice.call(e.children);
        e.style.zoom = (pg && pg.z && pg.z[id]) || "";
        ((pg && pg.b && pg.b[id]) || []).forEach(function (i) {
          var br = document.createElement("div");
          br.className = "pvbr";
          if (kids[i]) e.insertBefore(br, kids[i]);
        });
      });
      [].forEach.call(pv.querySelectorAll(".pvtoc li[data-sid]"), function (li) {
        var n = pg && pg[li.getAttribute("data-sid")],
          s = li.querySelector(".pgn");
        if (s) s.parentNode.removeChild(s);
        if (!n) return;
        s = document.createElement("span");
        s.className = "pgn";
        s.textContent = P.lang !== "mr" ? n : DV(n);
        li.appendChild(s);
      });
    }
    // Printing from the browser's own menu cannot wait, so the single-column numbers are kept ready
    function warm() {
      var k = pkey("one");
      if (pcache.key === k || busy) return;
      build("one");
      pages("one", function (pg) {
        if (pg) pcache = { key: k, pg: pg };
      });
    }
    var wt = 0;
    document.addEventListener("click", function () {
      clearTimeout(wt);
      wt = setTimeout(warm, 2500);
    });
    setTimeout(warm, 3000);
    function go(mode) {
      pm.hidden = true;
      ovDone();
      busy = true;
      if (mode === "as") mode = "one";
      build(mode);
      pages(mode, function (pg) {
        pnums(pg);
        if (pg && mode === "one") pcache = { key: pkey("one"), pg: pg };
        root.setAttribute("data-print", mode);
        setTimeout(function () {
          window.print();
        }, 60);
      });
    }
    document.getElementById("prb").onclick = function () {
      var M = P.ui === "mr",
        tl = P.lang === "en" ? (M ? " (इंग्रजी)" : " (English)") : M ? " (मराठी)" : " (Marathi)";
      if (P.lang === "both") {
        b1.textContent = M ? "शेजारी शेजारी: मराठी | इंग्रजी" : "Side by side: Marathi | English";
        b1.onclick = function () {
          go("side");
        };
        b2.textContent = M ? "वर मराठी, खाली इंग्रजी" : "Stacked: Marathi above English";
        b2.onclick = function () {
          go("as");
        };
      } else {
        b1.textContent = (M ? "दोन स्तंभ" : "Two columns") + tl;
        b1.onclick = function () {
          go("two");
        };
        b2.textContent = (M ? "एक स्तंभ" : "Single column") + tl;
        b2.onclick = function () {
          go("as");
        };
      }
      document.getElementById("prp").textContent = document.getElementById("prq").textContent = LTR ? "Letter" : "A4";
      ovPush();
      pm.hidden = false;
      b1.focus();
    };
    function pmClose() {
      pm.hidden = true;
      ovDone();
      document.getElementById("prb").focus();
    }
    document.getElementById("prx").onclick = pmClose;
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !pm.hidden) pmClose();
    });
    pm.addEventListener("click", function (e) {
      if (e.target === pm) pmClose();
    });
    // Printing from the browser's own menu (or Share → Print on a phone) gets the same print view,
    // single column: contents, then every piece in the chosen text language, never the home page
    window.addEventListener("beforeprint", function () {
      if (!busy) {
        build("one");
        if (pcache.key === pkey("one")) pnums(pcache.pg);
        root.setAttribute("data-print", "one");
      }
    });
    window.addEventListener("afterprint", function () {
      busy = false;
      root.removeAttribute("data-print");
    });
  })();

  // ---- Share, QR code and the Add to Home Screen buttons ----
  (function () {
    var url = location.origin + location.pathname,
      title = "संकष्टी चतुर्थी";
    var qm = document.getElementById("qrm");
    function qr(o) {
      if (o) ovPush();
      qm.hidden = !o;
      if (!o) ovDone();
      if (o) {
        document.getElementById("qrx").focus();
      } else {
        document.getElementById("qrb").focus();
      }
    }
    document.getElementById("qrb").onclick = function () {
      qr(true);
    };
    document.getElementById("qrx").onclick = function () {
      qr(false);
    };
    qm.addEventListener("click", function (e) {
      if (e.target === qm) qr(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !qm.hidden) qr(false);
    });
    // Share: a ready reminder for the group chat (next Sankashti, pooja time near the temple, moonrise) plus the link
    // sep = true: leave the link out, because the share sheet is given it separately (it lands at the end)
    function shareText(sep) {
      var C = skCache,
        L = skLoc(),
        mr = P.ui === "mr";
      var tip = mr
        ? "\nफोनवर ॲपसारखे ठेवण्यासाठी: लिंक उघडा आणि होम स्क्रीनवर जोडा (Add to Home Screen) दाबा."
        : "\nTip: open the link and tap Add to Home Screen to keep it on your phone like an app.";
      if (!C || !L) return (mr ? "संकष्टी चतुर्थी — पूजा आणि आरती" : title) + (sep ? "" : "\n" + url) + tip;
      var o = C.list[C.sel].day >= skMid() ? C.list[C.sel] : C.list[C.ni],
        f = skFmt(o),
        t = skTemple(L),
        ang = f.ang ? (mr ? "अंगारकी " : "Angaraki ") : "";
      if (mr)
        return (
          ang +
          "संकष्टी चतुर्थी: " +
          f.dmr +
          (t ? " · पूजा सायं. ७:०० ते ८:३०, भारतीय हिंदू मंदिर, पॉवेल" : "") +
          (o.rise ? " · चंद्रोदय " + f.tmr : "") +
          (sep ? "" : "\nआरत्या: " + url) +
          tip
        );
      return (
        ang +
        "Sankashti Chaturthi: " +
        f.den +
        (t ? " · Pooja 7:00–8:30 pm at Bharatiya Hindu Temple, Powell" : "") +
        (o.rise ? " · Moonrise " + f.ten : "") +
        (sep ? "" : "\nAartis: " + url) +
        tip
      );
    }
    document.getElementById("shb").onclick = function () {
      var txt = shareText();
      if (navigator.share) {
        // The link goes in url, not inside the text, so the iPhone/Android share sheet shows the site's
        // icon and name, and WhatsApp/Messages show a link card (from the og: tags in <head>).
        navigator.share({ title: title, text: shareText(true), url: url }).catch(function () {});
      } else {
        try {
          navigator.clipboard.writeText(txt).then(function () {
            flash("संदेश कॉपी झाला", "Message copied");
          });
        } catch (e) {
          window.open("https://wa.me/?text=" + encodeURIComponent(txt));
        }
      }
    };
    var ua = navigator.userAgent,
      ios =
        !/Android/.test(ua) &&
        (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)),
      standalone = navigator.standalone || (window.matchMedia && matchMedia("(display-mode: standalone)").matches),
      safari =
        ios &&
        (/CriOS|FxiOS|EdgiOS/.test(ua) || /Safari\//.test(ua)) &&
        !/GSA\/|FBAN|FBAV|Instagram|WhatsApp|Line\/|Snapchat/.test(ua),
      deferred = null;
    // Add to Home Screen buttons (home page and Settings), always there until the site is opened from its icon.
    // Chrome/Edge/Android: the browser's own install prompt when it offers one; otherwise (iPhone, or the prompt
    // already used or dismissed) a pop-up with the steps for this device.
    var ib = [document.getElementById("inb"), document.getElementById("inb2")],
      im = document.getElementById("inm"),
      ibFrom = null;
    function ibShow(o) {
      ib.forEach(function (b) {
        b.hidden = !o;
      });
    }
    function installed() {
      ibShow(false);
    }
    function steps(o) {
      if (o) ovPush();
      im.hidden = !o;
      if (!o) ovDone();
      if (o) {
        var which = ios
          ? safari
            ? "inios"
            : "inapp"
          : /Android/.test(ua)
            ? "inand"
            : /Firefox\//.test(ua)
              ? "inff"
              : /Macintosh/.test(ua) && /Safari\//.test(ua) && !/Chrome|Chromium|Edg\//.test(ua)
                ? "inmac"
                : "indesk";
        ["inios", "inapp", "inand", "indesk", "inmac", "inff"].forEach(function (id) {
          document.getElementById(id).hidden = id !== which;
        });
        document.getElementById("inx").focus();
      } else if (ibFrom) ibFrom.focus();
    }
    function install(e) {
      ibFrom = e && e.currentTarget;
      if (!deferred) return steps(true);
      var d = deferred;
      deferred = null;
      d.prompt();
      d.userChoice.then(function (c) {
        if (c && c.outcome === "accepted") installed();
      });
    }
    ibShow(!standalone);
    ib.forEach(function (b) {
      b.onclick = install;
    });
    document.getElementById("inx").onclick = function () {
      steps(false);
    };
    im.addEventListener("click", function (e) {
      if (e.target === im) steps(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !im.hidden) steps(false);
    });
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      deferred = e;
    });
    window.addEventListener("appinstalled", installed);
  })();
  // ---- Offline use: home-screen app details and the service worker (sw.js) ----
  // The cache name below must match the one in sw.js; change both on every deploy.
  // Font files kept for offline use (the same list is in sw.js)
  var FONTS = [
    "fonts/inter-latin.woff2",
    "fonts/inter-latin-ext.woff2",
    "fonts/noto-sans-deva-devanagari.woff2",
    "fonts/noto-sans-deva-latin.woff2",
    "fonts/noto-sans-deva-latin-ext.woff2",
    "fonts/tiro-marathi-devanagari.woff2",
    "fonts/tiro-marathi-latin.woff2",
    "fonts/tiro-marathi-latin-ext.woff2",
    "fonts/tiro-sanskrit-devanagari.woff2",
    "fonts/tiro-sanskrit-latin.woff2",
    "fonts/tiro-sanskrit-latin-ext.woff2",
    "fonts/noto-sans-kannada-kannada.woff2",
  ];
  if (/^https?:$/.test(location.protocol)) {
    try {
      var hd = document.head,
        l1 = document.createElement("link");
      l1.rel = "manifest";
      l1.href = "manifest.json";
      hd.appendChild(l1);
      var m1 = document.createElement("meta");
      m1.name = "apple-mobile-web-app-capable";
      m1.content = "yes";
      hd.appendChild(m1);
      var m2 = document.createElement("meta");
      m2.name = "apple-mobile-web-app-title";
      m2.content = "संकष्टी चतुर्थी";
      hd.appendChild(m2);
    } catch (e) {}
    // Offline: a small cloud in the top bar while there is no internet (#ofb), and in Settings → About whether the
    // site is saved for offline use (#offv). A short note says so once, when the first visit has saved it.
    var ofb = document.getElementById("ofb"),
      offv = document.getElementById("offv"),
      OFV = {
        idle: ["तयार", "Ready"],
        save: ["जतन करत आहे…", "Saving…"],
        off: ["इंटरनेट नाही · जतन केलेली प्रत", "No internet · saved copy in use"],
      };
    // The offline copy's name ("aarti-v1.0") from <meta name="version"> in index.html, and the version shown ("1.0")
    var CACHE = (document.querySelector('meta[name="version"]') || {}).content || "aarti-v1.0",
      me = (CACHE.match(/^aarti-v([\d.]+)$/) || [])[1];
    document.getElementById("ver").textContent = me ? "v" + me : "";
    // both menu languages, so the text follows a change of menu language
    function two(t) {
      return '<span class="mr">' + t[0] + '</span><span class="en" lang="en">' + t[1] + "</span>";
    }
    function ofSet(st) {
      offv.setAttribute("data-s", st);
      offv.innerHTML = two(OFV[st]);
      ofb.hidden = st !== "off";
    }
    // Check for updates (Settings → About): what it says beside the label, in the menu language
    var upd = document.getElementById("upd"),
      updv = document.getElementById("updv"),
      UPD = {
        busy: ["तपासत आहे…", "Checking…"],
        ok: ["सर्व अद्ययावत आहे", "Up to date"],
        off: ["इंटरनेट नाही", "No internet"],
      };
    function updSet(st) {
      upd.setAttribute("data-s", st);
      updv.innerHTML = st ? two(UPD[st]) : "";
    }
    // Author lines: the Wikipedia link on a poet's name works only online; offline the name is plain text
    function crNet() {
      var on = navigator.onLine !== false;
      [].forEach.call(document.querySelectorAll(".cr a"), function (a) {
        if (on && a.getAttribute("data-href")) {
          a.setAttribute("href", a.getAttribute("data-href"));
          a.removeAttribute("data-href");
          a.removeAttribute("aria-disabled");
        } else if (!on && a.hasAttribute("href")) {
          a.setAttribute("data-href", a.getAttribute("href"));
          a.removeAttribute("href");
          a.setAttribute("aria-disabled", "true");
        }
      });
    }
    crNet();
    addEventListener("online", crNet);
    addEventListener("offline", crNet);
    ofSet(navigator.onLine === false ? "off" : "idle");
    addEventListener("online", function () {
      if (offv.getAttribute("data-s") === "off") ofSet("idle");
      if (upd.getAttribute("data-s") === "off") updSet("");
    });
    addEventListener("offline", function () {
      ofSet("off");
    });
    // Files the page is built from besides itself (the same list is in sw.js)
    var PARTS = ["css/site.css", "js/app.js", "content/pieces.js", "js/render.js"];
    // Resolves to true if the page or any of its parts differs from the saved copy, false if not; fails with no internet.
    // The saved copy is read first, because fetching goes through the service worker, which saves what it fetches.
    function partsChanged() {
      var files = ["./"].concat(PARTS);
      return Promise.all(
        files.map(function (u) {
          if (!("caches" in window)) return null;
          return caches
            .open(CACHE)
            .then(function (c) {
              return c.match(new URL(u, location.href).href);
            })
            .then(function (m) {
              return m ? m.text() : null;
            })
            .catch(function () {
              return null;
            });
        }),
      ).then(function (old) {
        return Promise.all(
          files.map(function (u, i) {
            return fetch(u, { cache: "no-store" }).then(function (r) {
              if (!r.ok) throw new Error(r.status);
              return r.text().then(function (t) {
                return old[i] !== null && t !== old[i];
              });
            });
          }),
        ).then(function (a) {
          return a.indexOf(true) >= 0;
        });
      });
    }
    upd.onclick = function () {
      if (upd.getAttribute("data-s") === "busy") return;
      if (navigator.onLine === false) {
        ofSet("off");
        updSet("off");
        flash("इंटरनेट नाही. जतन केलेली प्रत वापरत आहे.", "No internet. Using the saved copy.");
        return;
      }
      updSet("busy");
      var t0 = Date.now();
      // Newer if the page, its styles, its script or the pieces' text differ from the copy running now
      partsChanged()
        .then(function (changed) {
          setTimeout(function () {
            if (changed) {
              flash("नवीन आवृत्ती, उघडत आहे…", "New version, loading…");
              try {
                navigator.serviceWorker.getRegistration().then(function (g) {
                  if (g) g.update();
                });
              } catch (e) {}
              setTimeout(function () {
                location.reload();
              }, 700);
              return;
            }
            updSet("ok");
          }, Math.max(0, 900 - (Date.now() - t0)));
        })
        .catch(function () {
          ofSet("off");
          updSet("off");
          flash("इंटरनेट नाही. जतन केलेली प्रत वापरत आहे.", "No internet. Using the saved copy.");
        });
    };
    if ("serviceWorker" in navigator) {
      // The badge shows straight away. On a first visit (no service worker in charge yet) it says "Saving for offline…"
      // while the files are saved; it never waits more than 8 s, because some phones are slow to report back.
      var ofSaved = function () {
        if (offv.getAttribute("data-s") !== "save") return;
        ofSet("idle");
        flash("ऑफलाइन वापरासाठी तयार", "Ready to use offline");
      };
      if (!navigator.serviceWorker.controller && navigator.onLine !== false) {
        ofSet("save");
        setTimeout(ofSaved, 8000);
      }
      navigator.serviceWorker
        .register("sw.js")
        .then(function () {
          return navigator.serviceWorker.ready;
        })
        .then(function () {
          if (!("caches" in window)) return;
          caches.open(CACHE).then(function (c) {
            // Keep the page, its parts and every font file, then show the offline badge (sw.js caches the same files)
            var done = ofSaved;
            c.add(new Request("./", { cache: "reload" })).catch(function () {});
            Promise.all(
              PARTS.concat(FONTS).map(function (u) {
                return c.match(u).then(function (h) {
                  return h || c.add(u);
                });
              }),
            )
              .then(done)
              .catch(function () {
                done();
              });
          });
        })
        .catch(function () {});
    }
  }
})();
