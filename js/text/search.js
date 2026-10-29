// @ts-check
// Search: every Marathi line with its English line, in the Contents + search overlay (#jump); matches ignore svara marks
// and punctuation, forgive the spellings people type and a typo, and Devanagari typed also finds what is written in
// English letters. The rules and the ranking are in ./search-core.js (as in Nitya Upasana, unit-tested); this part
// builds the index from the lines the pieces show and shows the results.
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { P } from "../core/state.js";
import { ENS, IA } from "./iast.js";
import { jp } from "../core/apply.js";
import { buildIndex, fold, marks, search, LIMIT } from "./search-core.js";
import { goLine } from "../features/bars.js";
import { jumpTo } from "../features/history.js";
import { ul } from "../features/contents-list.js";

/** @typedef {import("./search-core.js").Index} Index */
/** @typedef {import("./search-core.js").LineIn} LineIn */

/** @type {Index | null} */
var IX = null;
/** @type {HTMLInputElement} */
var q;
/** @type {HTMLElement} */
var res;
/** @type {HTMLElement} */
var none;
/** @type {HTMLElement} */
var srs;
/** @type {ReturnType<typeof setTimeout> | 0} */
var qT = 0,
  srsT = 0;

/** @returns {any} SCR (js/render.js): the chosen script */
function scr() {
  return /** @type {any} */ (window).SCR;
}

export function init() {
  buildIX();
  q = /** @type {HTMLInputElement} */ (document.getElementById("q"));
  res = /** @type {HTMLElement} */ (document.getElementById("res"));
  none = /** @type {HTMLElement} */ (document.getElementById("none"));
  srs = /** @type {HTMLElement} */ (document.getElementById("srs"));
  // Keyboard: ↓ / ↑ move through the results, Enter in the box opens the first one
  jp.addEventListener("keydown", function (/** @type {KeyboardEvent} */ e) {
    // results still waiting for the pause in typing are built now, so the key acts on them
    if (qT && (e.key === "ArrowDown" || e.key === "Enter")) {
      clearTimeout(qT);
      find();
    }
    /** @type {HTMLElement[]} */
    var bs = [].slice.call(res.querySelectorAll("button")),
      i = bs.indexOf(/** @type {HTMLElement} */ (document.activeElement));
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
  // The results are built once typing pauses (not on every key), and their number is announced to
  // screen readers a moment later
  q.addEventListener("input", function () {
    clearTimeout(qT);
    qT = setTimeout(find, 120);
  });
}

/** @param {number} n  lines found; -1: nothing searched @param {boolean} more  more than LIMIT */
function say(n, more) {
  var m = "",
    en = P.ui === "en";
  if (n === 0) m = en ? "Nothing found" : "काही सापडले नाही";
  else if (n > 0) {
    m = more ? (en ? LIMIT + " or more" : (LIMIT).toLocaleString("mr-IN") + " किंवा अधिक") : en ? String(n) : n.toLocaleString("mr-IN");
    m += en ? (n === 1 && !more ? " result" : " results") : " ओळी सापडल्या";
  }
  clearTimeout(srsT);
  srsT = setTimeout(function () {
    srs.textContent = m;
  }, 400);
}

function find() {
  qT = 0;
  var v = q.value,
    ix = /** @type {Index} */ (IX);
  res.innerHTML = "";
  none.hidden = true;
  ul.hidden = Array.from(fold(v, scr().from).replace(/ /g, "")).length >= 2;
  if (!ul.hidden) return say(-1, false);
  var found = search(ix, v),
    n = found.lines.length + (found.more ? 1 : 0);
  say(found.more ? LIMIT : found.lines.length, found.more);
  if (!n) {
    none.hidden = false;
    return;
  }
  /**
   * Show the line with the words that match the search in bold
   * @param {HTMLElement} el
   * @param {string} txt
   */
  function mk(el, txt) {
    txt.split(/(\s+)/).forEach(function (w) {
      if (w && marks(ix, w, v)) {
        var bb = document.createElement("mark");
        bb.textContent = w;
        el.appendChild(bb);
      } else el.appendChild(document.createTextNode(w));
    });
  }
  var frag = document.createDocumentFragment();
  found.lines.forEach(function (r) {
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
    frag.appendChild(li);
  });
  res.appendChild(frag);
}

/** @param {Element} el */
function txt(el) {
  return el.innerHTML
    .replace(/<br\s*\/?>/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&");
}

// The index: every line in the pieces themselves (not the copies in the print view or the dhrupad bubble), each once
// per piece, with its English as shown and the everyday spelling (ENS) to search while the scholarly one is shown.
// Built again when the script or the English style changes.
export function buildIX() {
  /** @type {Record<string, number>} */
  var seen = {};
  /** @type {LineIn[]} */
  var lines = [];
  [].forEach.call(document.querySelectorAll(".ash .mr p[data-l]"), function (/** @type {HTMLElement} */ p) {
    if (p.closest("#pv, .rmkpop")) return;
    var id = /** @type {string} */ (p.getAttribute("data-l")),
      sec = /** @type {HTMLElement} */ (p.closest(".ash")),
      en = sec.querySelector('.en p[data-l="' + id + '"]'),
      m = txt(p),
      k = sec.id + "|" + fold(m, scr().from);
    if (seen[k]) return;
    seen[k] = 1;
    lines.push({ id: id, sec: sec.id, text: sec.id, m: m, e: en ? txt(en) : "", extra: ENS[id] || "" });
  });
  IX = buildIndex({ texts: [], lines: lines, roman: IA, from: scr().from });
}

/** The piece's title in the language shown @param {string} id */
function sectionTitle(id) {
  var h = /** @type {HTMLElement} */ (/** @type {HTMLElement} */ (document.getElementById(id)).querySelector("h2")),
    s = h.querySelector(P.lang === "en" ? ".en" : ".mr");
  return /** @type {string} */ ((s || h).textContent);
}
