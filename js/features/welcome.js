// @ts-check
// Welcome (Satish, 2026-11-21, as in Nitya Upasana): once, on a new phone, two full-screen steps over Home, so a first
// opening says what the app is and gets the one thing the dates need right, the town. First what the app is and the
// first reading language (Marathi in its letters or in Kannada, Telugu or Gujarati ones; English stays the second,
// changed in Settings; the menus stay in English); then the town the moonrise is worked out for: the one guessed from
// the time zone (js/features/date-card.js skLoc), the phone's location, or a city picked, with the next date and its
// moonrise for it. Yes, start keeps them and shows Home. Escape steps back, and on the first step closes it with the
// town as it is. Not when the site opens at a text (a shared link) or to print, nor under the install page opened by
// the shared link: the next visit that opens on Home shows it.
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.
//
// Whether it was seen is kept on this phone only (localStorage "sankathara-welcome", 2 when done), not in backups: a
// cleared phone is a new one.

import { P } from "../core/state.js";
import { esc, nameOf, ui } from "../core/words.js";
import { menuWords } from "../core/strings.js";
import { fromLink } from "./install-page.js";
import { handedOver } from "./print.js";
import { pickFirst, readingName } from "./languages.js";
import { skAskPlace, skCities, skLoc, skNextFor, skSetPlace } from "./date-card.js";

var KEY = "sankathara-welcome",
  DONE = 2,
  // the first reading languages offered: Marathi as written, or in Kannada, Telugu or Gujarati letters
  FIRST = ["mr", "kn", "te", "gu"];

/** @type {HTMLFormElement | null} */
var card = null;

/** @param {string} id */
function el(id) {
  return /** @type {HTMLElement} */ (document.getElementById(id));
}

/** Seen already (or this phone keeps nothing, so it would come back at every opening) */
function seen() {
  try {
    return Number(localStorage.getItem(KEY) || 0) >= DONE;
  } catch (e) {
    return true;
  }
}

/** The step shown: 1, what the app is; 2, the town */
function step() {
  return el("welcome-place").hidden ? 1 : 2;
}

/** @param {string[]} a */
function items(a) {
  return a
    .map(function (t) {
      return "<li>" + esc(t) + "</li>";
    })
    .join("");
}

/** The town, and the next date and its moonrise there, as the card will show them */
function town() {
  var w = menuWords("welcome"),
    L = skLoc(),
    n = L ? skNextFor(L) : null;
  el("welcome-town-name").textContent = L ? nameOf(L) : w.noPlace;
  el("welcome-town-next").textContent = n ? w.nextLine(n.day, n.time) : "";
  el("welcome-town").classList.toggle("none", !L);
  // the city list shows the one picked, if it is one of them
  var sel = /** @type {HTMLSelectElement} */ (el("welcome-city"));
  sel.value = "";
  if (!L) return;
  var lat = String(L.lat),
    lon = String(L.lon);
  [].slice.call(sel.options).forEach(function (/** @type {HTMLOptionElement} */ o) {
    if (o.dataset.lat === lat && o.dataset.lon === lon) sel.value = o.value;
  });
}

/** Both steps' words, in the menu language */
function draw() {
  if (!card || card.hidden) return;
  var w = menuWords("welcome");
  card.lang = ui();
  card.setAttribute("aria-label", w.title);
  // (with Marathi menus the title above already says it)
  el("welcome-sub").textContent = ui() === "mr" ? "" : w.app;
  el("welcome-points").innerHTML = items(w.points);
  el("welcome-facts").innerHTML = items(w.facts);
  el("welcome-lang-label").textContent = w.first;
  el("welcome-second").textContent = w.second;
  // the reading languages' names, as Settings lists them
  var lang = /** @type {HTMLSelectElement} */ (el("welcome-lang"));
  lang.innerHTML = FIRST.map(function (k) {
    return '<option value="' + k + '">' + esc(readingName(k)) + "</option>";
  }).join("");
  lang.value = P.lead === "en" ? "mr" : P.ind;
  el("welcome-next").textContent = w.next;
  el("welcome-back").setAttribute("aria-label", w.back);
  el("welcome-place-title").textContent = w.place;
  el("welcome-place-note").textContent = w.placeNote;
  el("welcome-mine-name").textContent = w.mine;
  el("welcome-mine-note").textContent = w.mineNote;
  el("welcome-city-label").textContent = w.city;
  // the cities, named as the card names them; the first choice says to pick one
  el("welcome-city").innerHTML =
    '<option value="">—</option>' +
    skCities()
      .map(function (c, i) {
        return '<option value="' + i + '" data-lat="' + c.lat + '" data-lon="' + c.lon + '">' + esc(nameOf(c)) + "</option>";
      })
      .join("");
  el("welcome-change-title").textContent = w.change;
  el("welcome-change-tip").textContent = w.changeTip;
  el("wlcs").textContent = w.start;
  town();
}

/** Show a step, its heading focused (not a field: on a phone that brings the keyboard up) @param {number} n */
function show(n) {
  el("welcome-about").hidden = n !== 1;
  el("welcome-place").hidden = n !== 2;
  if (card) card.scrollTop = 0;
  if (n === 2) town();
  try {
    (n === 1 ? el("welcome-title") : el("welcome-place-title")).focus({ preventScroll: true });
  } catch (e) {}
}

/** Done: kept as seen, Home shown, focus on the Chaturthi card so nothing is lost */
function close() {
  try {
    localStorage.setItem(KEY, String(DONE));
  } catch (e) {}
  if (!card) return;
  card.hidden = true;
  document.documentElement.removeAttribute("data-welcome");
  var h = /** @type {HTMLElement | null} */ (document.querySelector("#skc button, #skc a"));
  if (h)
    try {
      h.focus({ preventScroll: true });
    } catch (e) {}
}

export function init() {
  card = /** @type {HTMLFormElement | null} */ (document.getElementById("wlc"));
  if (!card || seen()) return;
  // opened at a text (a shared link) or to print: not now; nor under the install page opened by the shared link: in
  // Safari it would be asked again in the home screen app, which keeps its data apart (js/features/install-page.js)
  // (a print handed over from the Home Screen app has had its address cleaned already, js/render.js: print.js says so)
  if (location.hash.length > 1 || /[?&]print=/.test(location.search) || handedOver || fromLink) return;
  card.hidden = false;
  // Home under it stays still and out of reach (css/05-home-card.css)
  document.documentElement.setAttribute("data-welcome", "1");
  draw();
  el("welcome-lang").addEventListener("change", function () {
    var v = /** @type {HTMLSelectElement} */ (el("welcome-lang")).value;
    if (v && (v !== P.ind || P.lead === "en")) pickFirst(v);
  });
  el("welcome-next").addEventListener("click", function () {
    show(2);
  });
  el("welcome-back").addEventListener("click", function () {
    show(1);
  });
  el("welcome-mine").addEventListener("click", function () {
    skAskPlace(town);
  });
  el("welcome-city").addEventListener("change", function () {
    var o = /** @type {HTMLSelectElement} */ (el("welcome-city")).selectedOptions[0];
    if (!o || !o.value) return;
    skSetPlace(Number(o.dataset.lat), Number(o.dataset.lon));
    town();
  });
  card.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    e.preventDefault();
    if (step() === 2) show(1);
    else close();
  });
  card.addEventListener("submit", function (e) {
    e.preventDefault();
    if (step() === 1) show(2);
    else close();
  });
  show(1);
}
