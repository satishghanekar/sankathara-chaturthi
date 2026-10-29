// @ts-check
// Home: the session's texts, as Nitya Upasana's Today card lists a session (#tsc): the heading (संध्याकाळ · Evening) and
// how many texts, then each text numbered, its title in Marathi (in Kannada letters when chosen) and English, and its
// language. The routine is content/routines.json (read with js/core/routine.js), written as Nitya Upasana's: Morning,
// Afternoon and Evening, each a list of texts. A session with no texts is left out; today only the evening has them
// (every Sankathara Chaturthi, the same each time). Once two or more sessions have texts, Nitya Upasana's switch
// (#tss: Morning | Afternoon | Evening, tabs: arrow keys move between them, Enter or Space picks) shows above the list,
// with only those sessions; the session of the time of day is shown first (or the next one with texts). No other day
// and no routine builder.
// A title goes to that text (data-go, js/features/clicks.js) in the reading page, which is every text one after another
// in one scroll; ‹ Prev and Next › go through them in order.
// Built once the texts are loaded, already in the chosen script; render.js switches it with the rest (LATER).
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { loaded } from "../text/load.js";
import { SESSIONS, sessionAt, textsFor } from "../core/routine.js";
import { dv, esc, mrLang, scr, scrKey } from "../core/words.js";

/** @typedef {import("../core/routine.js").Session} Session */

// The sessions' names (Nitya Upasana's; the evening keeps this site's word, संध्याकाळ)
/** @type {Record<Session, { mr: string, en: string }>} */
const NAMES = {
  morning: { mr: "सकाळ", en: "Morning" },
  afternoon: { mr: "दुपार", en: "Afternoon" },
  evening: { mr: "संध्याकाळ", en: "Evening" },
};

/** @type {Session | null} the session picked on the switch (null: the time of day's) */
var pick = null;

/** @param {string} mr @param {string} en */
function two(mr, en) {
  return '<span class="mr">' + esc(scr(mr)) + '</span><span class="en" lang="en">' + esc(en) + "</span>";
}

export function init() {
  var sc = document.getElementById("tsc"),
    tabs = document.getElementById("tss"),
    lib = loaded.library;
  /** @type {any} */
  var C = /** @type {any} */ (window).CONTENT;
  if (!sc || !lib || !C) return;
  // each text's section on the page (a1, p1): Nitya Upasana's content.js keeps the text's id beside it
  /** @type {Record<string, string>} */
  var sec = {};
  C.categories.forEach(function (/** @type {{ pieces: { id: string, text: string }[] }} */ c) {
    c.pieces.forEach(function (p) {
      sec[p.text] = p.id;
    });
  });
  /** @type {Record<string, import("../text/content.js").LibraryText>} */
  var t = {};
  lib.texts.forEach(function (x) {
    t[x.id] = x;
  });
  /** a session's texts today, those in the Library @param {Session} s */
  function idsFor(s) {
    return textsFor(loaded.routine, new Date().getDay(), s).filter(function (id) {
      return !!t[id] && !!sec[id];
    });
  }
  var lists = /** @type {Record<Session, string[]>} */ ({}),
    have = SESSIONS.filter(function (s) {
      lists[s] = idsFor(s);
      return lists[s].length > 0;
    });
  sc.hidden = !have.length;
  if (!have.length) return;
  var langs = lib.languages;

  // The session shown: the one picked, else the time of day's, else the next with texts that day, else the first
  function shown() {
    if (pick && have.indexOf(pick) >= 0) return pick;
    var now = sessionAt(new Date()),
      later = have.filter(function (s) {
        return SESSIONS.indexOf(s) >= SESSIONS.indexOf(now);
      });
    return have.indexOf(now) >= 0 ? now : later[0] || have[0];
  }

  function draw() {
    var s = shown(),
      ids = lists[s],
      n = NAMES[s];
    /** @type {HTMLElement} */ (document.getElementById("tsh")).innerHTML =
      '<span lang="' + mrLang() + '">' + esc(scr(n.mr)) + '</span> <span class="tsdot" aria-hidden="true">·</span> <span lang="en">' + n.en + "</span>";
    /** @type {HTMLElement} */ (document.getElementById("tsn")).innerHTML = two(dv(ids.length) + " रचना", ids.length + (ids.length === 1 ? " text" : " texts"));
    /** @type {HTMLElement} */ (document.getElementById("tsl")).innerHTML = ids
      .map(function (id, i) {
        var x = t[id],
          l = langs[x.language];
        return (
          "<li>" +
          '<a class="tgo" href="#' + sec[id] + '" data-go="' + sec[id] + '">' +
          '<span class="tno" aria-hidden="true">' + esc(scr(dv(i + 1))) + ".</span>" +
          '<span class="tt"><span class="t1" lang="' + (scrKey() || x.language) + '">' + esc(scr(x.title)) + '</span><span class="t2" lang="en">' + esc(x.titleEn) + "</span></span>" +
          (l ? '<span class="ttg">' + two(l.mr, l.en) + "</span>" : "") +
          "</a></li>"
        );
      })
      .join("");
    if (!tabs) return;
    // Morning | Afternoon | Evening: only the sessions with texts, and only when there are two or more
    tabs.hidden = have.length < 2;
    [].forEach.call(tabs.querySelectorAll('[role="tab"]'), function (/** @type {HTMLElement} */ b) {
      var x = /** @type {Session} */ (b.dataset.s),
        on = x === s;
      b.hidden = have.indexOf(x) < 0;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
      /** @type {HTMLElement} */ (b.querySelector(".tsw")).innerHTML = two(NAMES[x].mr, NAMES[x].en);
    });
    /** @type {HTMLElement} */ (document.getElementById("tsp")).setAttribute("aria-labelledby", "tss-" + s);
  }
  draw();
  if (!tabs) return;
  var tb = tabs;
  tb.style.gridTemplateColumns = "repeat(" + have.length + ", minmax(0, 1fr))";
  // a tap (or Enter / Space) shows that session's texts; picking the time of day's follows the clock again
  tb.addEventListener("click", function (e) {
    var b = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest('[role="tab"]'));
    if (!b) return;
    var s = /** @type {Session} */ (b.dataset.s);
    pick = s === sessionAt(new Date()) ? null : s;
    draw();
    try {
      b.focus({ preventScroll: true });
    } catch (x) {}
  });
  // arrow keys, Home and End move between the sessions shown (focus only: Enter or Space picks, as a button does)
  tb.addEventListener("keydown", function (e) {
    var b = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest('[role="tab"]'));
    if (!b || !/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)) return;
    e.preventDefault();
    var all = /** @type {HTMLElement[]} */ ([].slice.call(tb.querySelectorAll('[role="tab"]:not([hidden])'))),
      i = all.indexOf(b),
      j = e.key === "Home" ? 0 : e.key === "End" ? all.length - 1 : (i + (e.key === "ArrowRight" ? 1 : all.length - 1)) % all.length;
    all.forEach(function (x, k) {
      x.tabIndex = k === j ? 0 : -1;
    });
    all[j].focus();
  });
}
