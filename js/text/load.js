// @ts-check
// Loading the texts: fetches content/library.json and every text file it lists (content/texts/), and
// content/categories.json (the sections, वैदिक मंत्र and आरती, their order and so the piece numbers), builds CONTENT from
// them (js/text/content.js, as in Nitya Upasana), then has js/render.js write the pieces into the page where index.html
// keeps their place (#pieces), in Kannada letters when that is the chosen language. js/main.js waits for this before it
// starts the other parts, so they find the page as it was when the pieces were written into index.html.
// It also fetches content/routines.json, the evening routine the home page lists (js/features/session-card.js), at the
// same time; without it the texts still load and the list is empty.
// The files are on the offline list (js/parts.js), so this works without internet too.

import { buildContent } from "./content.js";

/**
 * What was loaded, for the parts that need it after start-up: the library (content/library.json) and the routine
 * (content/routines.json; null when it could not be loaded), as in Nitya Upasana
 * @type {{ library: import("./content.js").Library | null, routine: import("../core/routine.js").Routine | null }}
 */
export const loaded = { library: null, routine: null };

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

/** @returns {Promise<void>} */
export function load() {
  // the sections (content/categories.json) and the routine (content/routines.json), fetched alongside the library
  var cats = get("content/categories.json").then(function (r) {
    return r.json();
  });
  var routine = get("content/routines.json")
    .then(function (r) {
      return r.json();
    })
    .then(
      function (/** @type {import("../core/routine.js").Routine} */ o) {
        loaded.routine = o && typeof o === "object" ? o : null;
      },
      function (/** @type {unknown} */ e) {
        console.warn(e);
      },
    );
  return get("content/library.json")
    .then(function (r) {
      return r.json();
    })
    .then(function (/** @type {import("./content.js").Library} */ lib) {
      return Promise.all(
        [cats, routine].concat(
          lib.texts.map(function (t) {
            return get("content/" + t.file).then(function (r) {
              return r.text();
            });
          }),
        ),
      ).then(function (got) {
        var cat = got[0],
          raw = got.slice(2);
        /** @type {Record<string, string>} */
        var files = {};
        lib.texts.forEach(function (t, i) {
          files[t.id] = raw[i];
        });
        /** @type {any} */
        var w = window;
        loaded.library = lib;
        w.CONTENT = buildContent(lib, files, cat);
        // the page shows only the sections that have texts (Nitya Upasana's library also lists the empty ones)
        w.CONTENT.categories = w.CONTENT.categories.filter(function (/** @type {{ pieces: unknown[] }} */ c) {
          return c.pieces.length;
        });
        var at = /** @type {HTMLElement} */ (document.getElementById("pieces"));
        at.insertAdjacentHTML("beforebegin", w.renderPieces(w.CONTENT));
        at.parentNode && at.parentNode.removeChild(at);
        w.SCR.page();
      });
    });
}
