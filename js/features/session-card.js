// @ts-check
// Home: the session's texts, as Nitya Upasana's Today card lists a session (#tsc): the heading (संध्याकाळ · Evening) and
// how many texts, then each text numbered, its title in Marathi (in Kannada letters when chosen) and English, and its
// language. The routine is content/routines.json (read with js/core/routine.js), written as Nitya Upasana's: Morning,
// Afternoon and Evening, each a list of texts. A session with no texts is left out; today only the evening has them
// (every Sankathara Chaturthi, the same each time). Once two or more sessions have texts, Nitya Upasana's switch
// (#tss: Morning | Afternoon | Evening, tabs: arrow keys move between them, Enter or Space picks) shows above the list,
// with only those sessions; the session of the time of day is shown first (or the next one with texts). No other day
// and no routine builder.
// Reading a session, as in Nitya Upasana: a title starts the session at that text. The reading page then shows the
// session's texts, in session order, in one scroll (data-run on <html>, .inrun and a CSS order on each of its pieces:
// css/05-home-card.css), and ‹ Prev / Next › stay in it (sessionStep(), js/features/bottom-bar.js): Next › after the
// last text (or ‹ Prev on the first) goes back Home. Going to a text another way (the Library, search, the left menu)
// or Home leaves the session, and the page shows one text at a time again (js/features/history.js solo()). The session
// read is kept for the tab (sessionStorage), so a reload goes on with it; not on a later day.
// Built once the texts are loaded, already in the chosen script; render.js switches it with the rest (LATER).
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { loaded } from "../text/load.js";
import { SESSIONS, sessionAt, stepInSession, textsFor } from "../core/routine.js";
import { dv, esc, mrLang, scr, scrKey } from "../core/words.js";
import { flash, onPiece, pieceEl } from "../core/page.js";
import { P } from "../core/state.js";
import { unfold } from "../core/apply.js";
import { jumpTo } from "./history.js";

/** @typedef {import("../core/routine.js").Session} Session */
/** @typedef {{ ids: string[], session: Session, day: string, at: number }} Run */

// The sessions' names (Nitya Upasana's; the evening keeps this site's word, संध्याकाळ)
/** @type {Record<Session, { mr: string, en: string }>} */
const NAMES = {
  morning: { mr: "सकाळ", en: "Morning" },
  afternoon: { mr: "दुपार", en: "Afternoon" },
  evening: { mr: "संध्याकाळ", en: "Evening" },
};
// the session being read, kept for the tab (sessionStorage), and how long one from an earlier day is still taken up
const RUN_KEY = "sk-run";
const RUN_KEEP = 3 * 3600 * 1000;

/** @type {Session | null} the session picked on the switch (null: the time of day's) */
var pick = null;
/** @type {Run | null} the session being read */
var run = null;
/** @type {Record<string, string>} each text's section on the page (a1, p1), by its Library id */
var sec = {};
/** @type {Record<string, string>} and back: a section's text */
var bySec = {};
/** @type {Record<string, import("../text/content.js").LibraryText>} */
var t = {};
/** @type {Record<Session, string[]>} each session's texts today, those in the Library */
var lists = /** @type {any} */ ({});
/** @type {Session[]} the sessions with texts */
var have = [];

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
  sec = {};
  bySec = {};
  C.categories.forEach(function (/** @type {{ pieces: { id: string, text: string }[] }} */ c) {
    c.pieces.forEach(function (p) {
      sec[p.text] = p.id;
      bySec[p.id] = p.text;
    });
  });
  t = {};
  lib.texts.forEach(function (x) {
    t[x.id] = x;
  });
  /** a session's texts today, those in the Library @param {Session} s */
  function idsFor(s) {
    return textsFor(loaded.routine, new Date().getDay(), s).filter(function (id) {
      return !!t[id] && !!sec[id];
    });
  }
  lists = /** @type {any} */ ({});
  have = SESSIONS.filter(function (s) {
    lists[s] = idsFor(s);
    return lists[s].length > 0;
  });
  sc.hidden = !have.length;
  // the session being read: its pieces marked as they are built (js/core/page.js), and taken up again after a reload
  onPiece(runOne);
  try {
    var r = JSON.parse(sessionStorage.getItem(RUN_KEY) || "null");
    if (r && Array.isArray(r.ids)) run = r;
  } catch (e) {}
  if (run && stale(run)) runEnd();
  else runMark();
  if (!have.length) return;
  draw();
  var list = /** @type {HTMLElement} */ (document.getElementById("tsl"));
  // a title opens its text, reading the session from there
  list.addEventListener("click", function (e) {
    var a = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest("a.tgo"));
    if (!a) return;
    e.preventDefault();
    startAt(/** @type {string} */ (a.dataset.t));
  });
  // going to a text another way (the Library, search, the left menu, the hidden Previous / Next links) leaves the
  // session: Prev and Next follow the library order again
  document.addEventListener(
    "click",
    function (e) {
      var a = /** @type {HTMLElement} */ (e.target).closest && /** @type {HTMLElement} */ (e.target).closest("a[data-go]");
      if (!a || !run) return;
      runEnd();
      setTimeout(function () {
        document.dispatchEvent(new Event("nitya-session"));
      });
    },
    true,
  );
  // Home (the top bar's name, Home in the bottom bar, Home at the end of a text) leaves the session being read
  document.addEventListener("nitya-home", function () {
    if (run) runEnd();
  });
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

// The session shown: the one picked, else the time of day's, else the next with texts that day, else the first
/** @returns {Session} */
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
    n = NAMES[s],
    tabs = document.getElementById("tss"),
    langs = /** @type {any} */ (loaded.library).languages;
  /** @type {HTMLElement} */ (document.getElementById("tsh")).innerHTML =
    '<span lang="' + mrLang() + '">' + esc(scr(n.mr)) + '</span> <span class="tsdot" aria-hidden="true">·</span> <span lang="en">' + n.en + "</span>";
  /** @type {HTMLElement} */ (document.getElementById("tsn")).innerHTML = two(dv(ids.length) + " रचना", ids.length + (ids.length === 1 ? " text" : " texts"));
  /** @type {HTMLElement} */ (document.getElementById("tsl")).innerHTML = ids
    .map(function (id, i) {
      var x = t[id],
        l = langs[x.language];
      return (
        "<li>" +
        // (not data-go: a title starts the session, above)
        '<a class="tgo" href="./#' + sec[id] + '" data-t="' + id + '">' +
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

// ---- Reading a session (as Nitya Upasana's js/features/today-card.js) ----

/** A text's title in the menu language, for ‹ Prev / Next › @param {string} id */
function titleOf(id) {
  var x = t[id];
  return !x ? "" : P.ui === "mr" ? scr(x.title) : x.titleEn;
}

/** Open a text in the reading page, reading this session @param {string} id */
function openText(id) {
  var el = sec[id] && pieceEl(sec[id]);
  if (!el) return;
  unfold(el);
  jumpTo(function () {
    /** @type {HTMLElement} */ (el).scrollIntoView();
  }, "#" + sec[id]);
  document.dispatchEvent(new Event("nitya-session"));
}

/** Read the session shown from this text on @param {string} id */
function startAt(id) {
  var s = shown();
  run = { ids: lists[s].slice(), session: s, day: new Date().toDateString(), at: Date.now() };
  try {
    sessionStorage.setItem(RUN_KEY, JSON.stringify(run));
  } catch (e) {}
  runMark();
  openText(id);
}

/** The reading page shows the session's texts in session order (data-run on <html>), or one text at a time */
function runMark() {
  var r = document.documentElement;
  // every text of the session is on the page, open, so the scroll runs on from one to the next (also after a reload in
  // the middle of a session)
  if (run)
    run.ids.forEach(function (x) {
      var el = sec[x] && pieceEl(sec[x]);
      if (el) unfold(el);
    });
  [].forEach.call(document.querySelectorAll(".ash"), function (/** @type {HTMLElement} */ x) {
    runOne(x);
  });
  if (run) r.setAttribute("data-run", "1");
  else r.removeAttribute("data-run");
}

/** A piece in the session being read is marked .inrun (also one built later), with its place in it @param {HTMLElement} x */
function runOne(x) {
  var id = bySec[x.id],
    i = run && id ? run.ids.indexOf(id) : -1;
  x.classList.toggle("inrun", i >= 0);
  // its place in the session (the page keeps the Library's order)
  x.style.order = i >= 0 ? String(i + 1) : "";
}

/** Leave the session: the page shows one text at a time again */
function runEnd() {
  run = null;
  try {
    sessionStorage.removeItem(RUN_KEY);
  } catch (x) {}
  runMark();
}

/** A session from an earlier day, started longer ago than RUN_KEEP: left behind @param {Run} r */
function stale(r) {
  return r.day !== new Date().toDateString() && !(typeof r.at === "number" && Date.now() - r.at < RUN_KEEP);
}

// After the last text of a session (or ‹ Prev on its first): back home, with the session's heading focused
/** @param {boolean} [done]  after the last text: say the session is over */
function endSession(done) {
  var h = document.getElementById("tsh");
  runEnd();
  jumpTo(function () {
    scrollTo(0, 0);
  }, location.pathname);
  if (h)
    try {
      h.focus({ preventScroll: true });
    } catch (e) {}
  if (done) flash("या वेळेची उपासना पूर्ण", "End of the session");
}

/**
 * ‹ Prev (-1) or Next › (1) from the piece on screen, while reading a session: where it goes and the title for its
 * label, or null to keep the library order (js/features/bottom-bar.js). Inside a session they never leave it: ‹ Prev on
 * the first text and Next › after the last go back Home.
 * @param {string} s  the piece's id on the page (a3)
 * @param {1 | -1} dir
 * @returns {{ label: string, go: () => void } | null}
 */
export function sessionStep(s, dir) {
  var id = bySec[s];
  if (!run || !id) return null;
  if (run.ids.indexOf(id) < 0) return null;
  var st = stepInSession(run.ids, id, dir);
  if (!st || "end" in st)
    return {
      label: P.ui === "mr" ? "मुख्य पान" : "Home",
      go: function () {
        endSession(!!st);
      },
    };
  var to = st.to;
  return {
    label: titleOf(to),
    go: function () {
      openText(to);
    },
  };
}
