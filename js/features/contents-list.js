// @ts-check
// Library (#jump): every text by section (वैदिक मंत्र, आरती), with search (js/text/search.js: the box at the foot of
// the page on phones, and Recent), as in Nitya Upasana. Opened by the book button in the bottom bar (#asq) and at the
// end of each piece; a title opens its text (js/features/clicks.js), and Back (the button here, the phone's Back, or
// Escape) returns. Built from the texts themselves (CONTENT, js/text/load.js); Nitya Upasana's Library also has its
// Books tab and the family's own categories, which this site has not.
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { setJ } from "./overlays.js";
import { loaded } from "../text/load.js";
import { dv, esc, scr as to } from "../core/words.js";

/** The list of texts; search hides it while results are shown */
/** @type {HTMLElement} */
export var ul;

/** @returns {any} the texts by section (js/text/content.js) */
function content() {
  return /** @type {any} */ (window).CONTENT;
}

/** The search starts empty again, with the whole list */
export function clearSearch() {
  var qq = /** @type {HTMLInputElement | null} */ (document.getElementById("q"));
  if (qq && qq.value) {
    qq.value = "";
    /** @type {HTMLElement} */ (document.getElementById("res")).innerHTML = "";
    /** @type {HTMLElement} */ (document.getElementById("none")).hidden = true;
    /** @type {HTMLElement} */ (document.getElementById("jl")).hidden = false;
  }
  if (qq) qq.blur();
}

export function init() {
  ul = /** @type {HTMLElement} */ (document.getElementById("jl"));
  var bk = document.getElementById("jbk");
  if (bk)
    bk.onclick = function () {
      setJ(false);
    };
  ul.innerHTML = listHtml();
}

// ---- the Library's list (#jl): one .tocg per section, the markup the styles read (as Nitya Upasana's) ----
function listHtml() {
  var C = content(),
    lib = /** @type {any} */ (loaded.library),
    langs = (lib && lib.languages) || {},
    /** @type {Record<string, string>} */
    langOf = {};
  if (!C) return "";
  ((lib && lib.texts) || []).forEach(function (/** @type {any} */ t) {
    langOf[t.id] = t.language;
  });
  return C.categories
    .map(function (/** @type {any} */ c) {
      // numbered from 1 in each section, as in Nitya Upasana
      var items = c.pieces
        .map(function (/** @type {any} */ p, /** @type {number} */ i) {
          var lt = langs[langOf[p.text] || ""];
          return (
            '<li><a href="./#' + p.id + '" data-go="' + p.id + '"><span class="m"><span class="no"><span class="nm">' + to(dv(i + 1)) + '.</span><span class="ne">' + (i + 1) + ".</span></span> " +
            '<span class="mr">' + esc(to(p.title.mr)) + '</span><span class="en" lang="en">' + esc(p.title.en) + "</span></span>" +
            (lt ? '<span class="lt"><span class="mr">' + esc(to(lt.mr)) + '</span><span class="en" lang="en">' + esc(lt.en) + "</span></span>" : "") +
            "</a></li>"
          );
        })
        .join("");
      return (
        '<div class="tocg" data-cat="' + esc(c.id) + '"><h2 class="gh"><span class="mr">' + esc(to(c.name.mr)) + '</span><span class="en" lang="en">' + esc(c.name.en) + "</span></h2>" +
        '<ol class="toc">' + items + "</ol></div>"
      );
    })
    .join("");
}

/**
 * Every text for search (js/text/search-core.js): its id, the name its id gives it, its section, its titles and its
 * section's names
 * @returns {import("../text/search-core.js").TextIn[]}
 */
export function textsForSearch() {
  var C = content(),
    out = /** @type {import("../text/search-core.js").TextIn[]} */ ([]);
  if (C)
    C.categories.forEach(function (/** @type {any} */ c) {
      c.pieces.forEach(function (/** @type {any} */ p) {
        var id = p.text || p.id,
          name = id.indexOf(c.id + "-") === 0 ? id.slice(c.id.length + 1) : "";
        out.push({ id: id, name: name, sec: p.id, title: p.title.mr, titleEn: p.title.en, categories: [c.name.mr, c.name.en] });
      });
    });
  return out;
}

/**
 * The section a piece is in (for search results)
 * @param {string} sec
 * @returns {{ id: string, name: { mr: string, en: string } } | null}
 */
export function categoryOfSection(sec) {
  var C = content(),
    found = null;
  if (C)
    C.categories.forEach(function (/** @type {any} */ c) {
      if (
        c.pieces.some(function (/** @type {any} */ p) {
          return p.id === sec;
        })
      )
        found = c;
    });
  return found;
}

/**
 * The sections and their texts, for the left menu on wide screens (js/text/layout.js): each group's name and each
 * text's number and title, in both languages (the page shows the one chosen), already in the chosen script
 * @returns {{ id: string, name: string, items: { id: string, html: string }[] }[]}
 */
export function libraryGroups() {
  /** @param {{ mr: string, en: string }} x */
  function two(x) {
    return '<span class="mr">' + esc(to(x.mr)) + '</span><span class="en" lang="en">' + esc(x.en) + "</span>";
  }
  var C = content();
  return (C ? C.categories : []).map(function (/** @type {any} */ c) {
    return {
      id: "g-" + c.id,
      name: two(c.name),
      items: c.pieces.map(function (/** @type {any} */ p) {
        return { id: p.id, html: '<span class="no"><span class="nm">' + esc(to(p.no.mr)) + '</span><span class="ne">' + esc(p.no.en) + "</span></span> " + two(p.title) };
      }),
    };
  });
}
