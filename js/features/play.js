// @ts-check
// Play mode (Satish, 2026-11-26: on a Sankathara evening with no one to sing, the recordings played one after another,
// ‹ Previous and Next › as needed). Home's ▶ Play all plays the evening's list as it shows (the tab picked), and the ▶
// on a text's Listen card (js/text/content.js listenCards()) plays from that text on. Each text is read as a title
// tapped on Home reads it (js/features/session-card.js readFrom()), its video above it (#play-video, YouTube's player,
// js/features/youtube.js) and the player bar at the bottom (#play-bar: where it is, the time, what comes next, ⏮ ❚❚ ⏭
// and ■ Stop) in place of the bottom bar. A text with no recording is passed over, and said so; when one ends the
// next starts by itself; after the last, it says all were played and stops. While it plays the screen is held on (a
// phone that locks stops YouTube); a pause the phone made (locked, another app) is said when the page comes back, and
// ▶ carries on, as a phone starts sound only from a tap. ■ Stop, or the phone's Back, stops it and leaves the text
// being read where it is. Nothing reaches YouTube before a tap. The order is js/core/play-queue.js's.
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { menuWords } from "../core/strings.js";
import { P, change } from "../core/state.js";
import { nameLang, num, scr } from "../core/words.js";
import { byId, note, onPiece, root, warn } from "../core/page.js";
import { clock, placeOf, skipped, startAt, step, trackOf } from "../core/play-queue.js";
import { attach, isPlaying, pause, play, resume, stop as stopVideo, times } from "./youtube.js";
import { readFrom, shownIds } from "./session-card.js";
import { hold } from "./wake-lock.js";

/** @typedef {import("../core/play-queue.js").Track} Track */

/** @type {string[]} the list being played, every text in it (those with no recording are passed over) */
var list = [];
/** @type {number} the place in list of the text playing, or -1 */
var at = -1;
/** @type {boolean} Play mode is on */
var on = false;
/** @type {any} the bar's clock, a few times a second */
var tick = 0;
/** @type {any} going on after a video that could not play */
var onward = 0;
/** @type {any} waiting for the first sound after a load */
var started = 0;
/** @type {boolean} the page was hidden while it played: the phone paused it */
var away = false;
/** @type {string} what the bar shows now: playing, paused or waiting */
var state = "waiting";

/** Play mode's words, in the menu language */
function W() {
  return menuWords("play");
}

/** @param {string} id @returns {Track | null} */
function track(id) {
  var x = /** @type {any} */ (window).CONTENT.texts[id];
  return x ? trackOf(x.recording) : null;
}

/** A text's title in the menu language (the original, in its letters, in Marathi, Kannada, Telugu and Gujarati
 * menus; English in English ones), as Home's ‹ Prev / Next › name it @param {string} id */
function titleOf(id) {
  var x = /** @type {any} */ (window).CONTENT.texts[id];
  return !x ? "" : nameLang() === "mr" ? scr(x.title) : x.titleEn;
}

export function init() {
  list = [];
  at = -1;
  on = false;
  away = false;
  // ▶ Play all over Home's list, and the count of texts with a recording under it
  document.addEventListener("session-drawn", playAllButton);
  playAllButton();
  byId("play-all").addEventListener("click", function () {
    begin(shownIds(), "");
  });
  // Settings → Reading → Play in the app (P.yt): off, as on a new phone, no Listen card and nothing here plays or opens
  // YouTube; on, the card and the ▶ beside it play the recording here
  byId("play-setting").addEventListener("click", function () {
    change({ yt: P.yt ? 0 : 1 }, playMark);
  });
  playMark();
  // the ▶ on each text's Listen card plays from that text on
  onPiece(addPlayButtons);
  document.addEventListener("click", function (e) {
    var t = /** @type {HTMLElement} */ (e.target),
      b = /** @type {HTMLElement | null} */ (t.closest(".listen-play")),
      card = t.closest(".listen-card.can-play");
    // the card itself plays here too, as its ▶ does (Satish, 2026-11-27: nothing opens YouTube)
    if (!b && card) {
      e.preventDefault();
      b = /** @type {HTMLElement | null} */ (card.previousElementSibling);
      if (!b || !b.classList.contains("listen-play")) return;
    }
    if (!b) return;
    var id = b.dataset.text || "",
      ids = shownIds();
    // from this text on in Home's list, or this text alone when it is not in it
    begin(ids.indexOf(id) >= 0 ? ids : [id], id);
  });
  byId("play-toggle").addEventListener("click", function () {
    if (state === "playing") pause();
    else if (at >= 0) resume();
  });
  byId("play-prev").addEventListener("click", function () {
    move(-1, false);
  });
  byId("play-next").addEventListener("click", function () {
    move(1, false);
  });
  byId("play-stop").addEventListener("click", function () {
    end(true);
  });
  // the phone's Back stops it, as ■ Stop does (Play mode's own step, put on when it starts)
  addEventListener("popstate", function () {
    if (on && !(history.state && history.state.play)) end(true);
  });
  document.addEventListener("visibilitychange", function () {
    if (!on) return;
    if (document.visibilityState === "hidden") {
      away = true;
      return;
    }
    hold(true);
    // the phone stopped it while the page was hidden (locked, another app): ▶ carries on, from a tap
    if (away && !isPlaying()) {
      note(W().locked, 6000);
      try {
        byId("play-toggle").focus({ preventScroll: true });
      } catch (x) {}
    }
    away = false;
  });
}

/** ▶ Play all over Home's list: shown when the list has a text with a recording, with how many have one */
function playAllButton() {
  var b = byId("play-all"),
    ids = shownIds(),
    n = ids.filter(function (id) {
      return !!track(id);
    }).length;
  b.hidden = !n || !P.yt;
  if (n) byId("play-all-note").textContent = W().playAllNote(num(n), num(ids.length));
}

/**
 * Play mode on or off (P.yt, Settings → Reading → Play in the app): the switch pressed as it is, the ▶ on the Listen
 * cards of the texts built and ▶ Play all there or not; turned off while a recording plays, it stops. Run at start-up, on a tap,
 * and whenever the settings are applied again (js/features/bars.js apply(): another person on this phone).
 */
export function playMark() {
  byId("play-setting").setAttribute("aria-pressed", String(!!P.yt));
  // off: no Listen card and no recording line under the credit, so nothing here opens YouTube (css/08-contents-book.css)
  if (P.yt) root.setAttribute("data-yt", "");
  else root.removeAttribute("data-yt");
  if (P.yt)
    document.querySelectorAll(".ash").forEach(function (s) {
      addPlayButtons(/** @type {HTMLElement} */ (s));
    });
  else {
    end(false);
    document.querySelectorAll(".listen-play").forEach(function (b) {
      b.remove();
    });
    document.querySelectorAll(".listen-card.can-play").forEach(function (c) {
      c.classList.remove("can-play");
    });
  }
  playAllButton();
}

/** A ▶ on each Listen card of a text built, the card playing here too (its link to YouTube kept for copying only)
 * @param {HTMLElement} sec */
function addPlayButtons(sec) {
  /** @type {any} */
  var C = /** @type {any} */ (window).CONTENT,
    piece = null;
  C.categories.forEach(function (/** @type {any} */ c) {
    c.pieces.forEach(function (/** @type {any} */ p) {
      if (p.id === sec.id) piece = p;
    });
  });
  if (!piece || !P.yt) return;
  var id = /** @type {any} */ (piece).text,
    t = track(id),
    card = sec.querySelector(".listen-card");
  if (!t || !card || sec.querySelector(".listen-play")) return;
  var b = document.createElement("button");
  b.type = "button";
  b.className = "listen-play";
  b.dataset.text = id;
  b.setAttribute("aria-label", W().here(t.who));
  b.innerHTML = PLAY;
  card.classList.add("can-play");
  card.before(b);
}

var PLAY = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
var PAUSE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>';

/**
 * Start playing a list, from a text (or from the top)
 * @param {string[]} ids
 * @param {string} from
 */
function begin(ids, from) {
  var i = startAt(ids, track, from || undefined);
  if (i < 0) return;
  list = ids.slice();
  if (!on) {
    on = true;
    root.setAttribute("data-playing", "");
    byId("play-video").hidden = false;
    byId("play-bar").hidden = false;
    // Play mode's own Back step: the phone's Back stops it
    try {
      history.pushState({ y: scrollY, play: 1 }, "", location.href);
    } catch (e) {}
    clearInterval(tick);
    tick = setInterval(drawTime, 500);
  }
  hold(true);
  var box = byId("play-video");
  attach(box, { state: heard }).then(
    function () {
      go(i, from ? i : -1);
    },
    function () {
      warn(W().noYouTube);
      end(false);
    },
  );
  // the player is loading: the bar says so already
  at = i;
  drawBar();
}

/**
 * Play the text at place i: read it on the page and load its video; say the texts passed over coming from place was
 * @param {number} i
 * @param {number} was
 */
function go(i, was) {
  var id = list[i],
    t = track(id);
  if (!t) return;
  clearTimeout(onward);
  at = i;
  state = "waiting";
  readFrom(id);
  // the video in view, above the text's heading (reading it put the heading at the top, the video just out of sight)
  byId("play-video").scrollIntoView({ block: "start" });
  play(t);
  drawBar();
  var passed = was >= 0 ? skipped(list, was, i) : [];
  if (passed.length) note(W().skipped(passed.map(titleOf).join(", ")), 4000);
  // a phone that asks for a tap before sound (the first time, on an iPhone) says so after a moment
  clearTimeout(started);
  started = setTimeout(function () {
    if (on && state === "waiting" && !isPlaying()) {
      note(W().tap, 5000);
      try {
        byId("play-toggle").focus({ preventScroll: true });
      } catch (x) {}
    }
  }, 4000);
}

/**
 * The next (dir 1) or previous (dir -1) text with a recording; at the end of the list, done
 * @param {1 | -1} dir
 * @param {boolean} byItself  the last one ended (not ⏮ or ⏭)
 */
function move(dir, byItself) {
  if (at < 0) return;
  var j = step(list, track, at, dir);
  if (j < 0) {
    if (dir === 1 && byItself) done();
    return;
  }
  go(j, dir === 1 ? at : -1);
}

/** What the player does @param {import("./youtube.js").State} s @param {number} [code] */
function heard(s, code) {
  if (!on) return;
  if (s === "ended") {
    move(1, true);
    return;
  }
  if (s === "error") {
    // this video can't be played (removed, not allowed outside YouTube, no internet): said, and on to the next
    var name = titleOf(list[at]);
    warn(W().cant(name));
    if (typeof code === "number" && console.warn) console.warn("YouTube could not play " + list[at] + ": " + code);
    clearTimeout(onward);
    onward = setTimeout(function () {
      move(1, true);
    }, 5000);
    return;
  }
  state = s;
  if (s === "playing") clearTimeout(started);
  drawBar();
}

/** All were played: said, and Play mode stops */
function done() {
  var n = list.filter(function (id) {
    return !!track(id);
  }).length;
  end(false);
  note(W().done(num(n)), 6000);
}

/**
 * Play mode stops; the text being read stays on the page
 * @param {boolean} said  tell the reader (■ Stop, Back), as against the end of the list, which says its own
 */
function end(said) {
  if (!on) return;
  on = false;
  clearInterval(tick);
  clearTimeout(onward);
  clearTimeout(started);
  stopVideo();
  hold(false);
  root.removeAttribute("data-playing");
  byId("play-video").hidden = true;
  byId("play-bar").hidden = true;
  at = -1;
  state = "waiting";
  if (history.state && history.state.play)
    try {
      history.back();
    } catch (e) {}
  if (said) note(W().stopped, 4000);
}

/** The player bar: where it is in the list, what is playing and what comes next, ❚❚ or ▶ */
function drawBar() {
  if (at < 0) return;
  var w = W(),
    pl = placeOf(list, track, at),
    nx = step(list, track, at, 1),
    t = byId("play-toggle");
  byId("play-count").textContent = (state === "paused" ? w.paused : w.playing)(num(pl[0]), num(pl[1]));
  byId("play-title").textContent = titleOf(list[at]) + " · " + (nx >= 0 ? w.next(titleOf(list[nx])) : w.last);
  var playingNow = state === "playing";
  t.innerHTML = playingNow ? PAUSE : PLAY;
  t.setAttribute("aria-label", playingNow ? w.pause : w.resume);
  byId("play-prev").setAttribute("aria-label", w.prev);
  byId("play-next").setAttribute("aria-label", w.nextButton);
  /** @type {HTMLButtonElement} */ (byId("play-prev")).disabled = step(list, track, at, -1) < 0;
  /** @type {HTMLButtonElement} */ (byId("play-next")).disabled = nx < 0;
  drawTime();
}

/** The time and the line that fills as the video goes, from its start second (a text starts where the line says) */
function drawTime() {
  if (at < 0) return;
  var t = track(list[at]),
    tm = times(),
    from = t ? t.start : 0,
    to = t && t.end ? t.end : tm[1],
    now = Math.max(0, tm[0] - from),
    len = Math.max(0, to - from);
  byId("play-time").textContent = len ? num(clock(now)) + " / " + num(clock(len)) : "";
  byId("play-fill").style.width = len ? Math.min(100, (100 * now) / len) + "%" : "0";
}
