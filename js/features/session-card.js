// @ts-check
// Home: the evening's texts, as Nitya Upasana's Today card lists a session (#tsc): the heading संध्याकाळ · Evening and
// how many texts, then each text numbered, its title in Marathi (in Kannada letters when chosen) and English, and its
// language. This site has one session, the evening of every Sankathara Chaturthi, the same each time
// (content/routines.json, read with js/core/routine.js), so there is no Morning | Afternoon | Evening switch, no other
// day and no routine builder.
// A title goes to that text (data-go, js/features/clicks.js) in the reading page, which is the evening's texts one
// after another in one scroll, as Nitya Upasana's session run is; ‹ Prev and Next › go through them in order.
// Built once the texts are loaded, already in the chosen script; render.js switches it with the rest (LATER).
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { loaded } from "../text/load.js";
import { textsFor } from "../core/routine.js";
import { dv, esc, mrLang, scr, scrKey } from "../core/words.js";

/** @param {string} mr @param {string} en */
function two(mr, en) {
  return '<span class="mr">' + esc(scr(mr)) + '</span><span class="en" lang="en">' + esc(en) + "</span>";
}

export function init() {
  var sc = document.getElementById("tsc"),
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
  var ids = textsFor(loaded.routine, new Date().getDay(), "evening").filter(function (id) {
    return !!t[id] && !!sec[id];
  });
  var langs = lib.languages;
  /** @type {HTMLElement} */ (document.getElementById("tsh")).innerHTML =
    '<span lang="' + mrLang() + '">' + esc(scr("संध्याकाळ")) + '</span> <span class="tsdot" aria-hidden="true">·</span> <span lang="en">Evening</span>';
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
  sc.hidden = !ids.length;
}
