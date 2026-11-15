// @ts-check
// Loading the texts: fetches content/library.json (the sections, वैदिक मंत्र and आरती, each with its texts in reading
// order, and so the piece numbers), content/site.json (the settings every text shares), content/credits.json (who and
// what the texts come from, each once), content/wiki.json (each page a link
// names, with its Wikidata item and its title on each Wikipedia: js/core/wiki.js) and every text file the library lists
// (content/texts/), builds CONTENT from them (js/text/content.js, as in Nitya Upasana) and turns the page into Kannada
// letters when that is the chosen language. js/main.js waits for this before it starts the other parts;
// js/core/page.js then builds the pieces where index.html keeps their place (#pieces).
// It also fetches content/routines.json, the evening routine the home page lists (js/features/session-card.js), at the
// same time; without it the texts still load and the list is empty.

import { buildContent } from "./content.js";

/**
 * What was loaded, for the parts that need it after start-up: the library (content/library.json), the site's settings
 * (content/site.json) and the routine (content/routines.json; null when it could not be loaded), as in Nitya Upasana
 * @type {{ library: import("./content.js").Library | null, site: import("./content.js").Site | null,
 *   routine: import("../core/routine.js").Routine | null }}
 */
export const loaded = { library: null, site: null, routine: null };

/**
 * @param {string} url
 * @returns {Promise<Response>}
 */
function get(url) {
  return fetch(url).then(function (r) {
    if (!r.ok) throw new Error(url + ": " + r.status);
    return r;
  });
}

/** @param {(part: string, lang: string) => any} [words]  the menu words (menuWords): the site's words around a text and
 *   Wikipedia's names, in each language (given by js/main.js, as in Nitya Upasana) @returns {Promise<void>} */
export function load(words) {
  /** @param {string} url */
  var json = function (url) {
    return get(url).then(function (r) {
      return r.json();
    });
  };
  // the routine (content/routines.json), fetched alongside the library
  var routine = json("content/routines.json").then(
    function (/** @type {import("../core/routine.js").Routine} */ o) {
      loaded.routine = o && typeof o === "object" ? o : null;
    },
    function (/** @type {unknown} */ e) {
      console.warn(e);
    },
  );
  // (without the Wikipedia pages, a credit's link goes to the English page it names)
  var wiki = json("content/wiki.json").catch(function (/** @type {unknown} */ e) {
    console.warn(e);
    return null;
  });
  // (without the credits, the texts show none)
  var credits = json("content/credits.json").catch(function (/** @type {unknown} */ e) {
    console.warn(e);
    return null;
  });
  var texts = Promise.all([json("content/library.json"), json("content/site.json"), wiki, credits]).then(function (both) {
    /** @type {import("./content.js").Library} */
    var lib = both[0];
    /** @type {import("./content.js").Site} */
    var site = both[1];
    loaded.library = lib;
    loaded.site = site;
    // every text the library lists, each from its own file
    /** @type {string[]} */
    var ids = [];
    lib.categories.forEach(function (c) {
      ids = ids.concat(c.texts);
    });
    return Promise.all(
      ids.map(function (id) {
        return get("content/texts/" + id + ".txt").then(function (r) {
          return r.text();
        });
      }),
    ).then(function (raw) {
      /** @type {Record<string, string>} */
      var files = {};
      ids.forEach(function (id, i) {
        files[id] = raw[i];
      });
      /** @type {any} */
      var w = window;
      w.CONTENT = buildContent(lib, site, files, { wiki: both[2], credits: both[3], words: words || null });
      // the page shows only the sections that have texts (Nitya Upasana's library also lists the empty ones)
      w.CONTENT.categories = w.CONTENT.categories.filter(function (/** @type {{ pieces: unknown[] }} */ c) {
        return c.pieces.length;
      });
      // the pieces are built by js/core/page.js (pieceEl), each in the chosen script; the rest of the page is turned
      // into it now
      w.SCR.page();
    });
  });
  return Promise.all([texts, routine]).then(function () {});
}
