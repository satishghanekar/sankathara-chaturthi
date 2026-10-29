// @ts-check
// Loading the texts: fetches content/library.json and every text file it lists (content/texts/), and
// content/groups.json (which of them the reading page shows, under पूजा and आरती), builds CONTENT from them (js/text/content.js), then has js/render.js write the pieces into the page where index.html keeps
// their place (#pieces), in Kannada letters when that is the chosen language. js/main.js waits for this before it
// starts the other parts, so they find the page as it was when the pieces were written into index.html.
// The files are on the offline list (js/parts.js), so this works without internet too.

import { buildContent } from "./content.js";

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
  // the reading page's groups and their texts (content/groups.json), fetched alongside the library
  var groups = get("content/groups.json").then(function (r) {
    return r.json();
  });
  return get("content/library.json")
    .then(function (r) {
      return r.json();
    })
    .then(function (/** @type {import("./content.js").Library} */ lib) {
      return Promise.all(
        [groups].concat(
          lib.texts.map(function (t) {
            return get("content/" + t.file).then(function (r) {
              return r.text();
            });
          }),
        ),
      ).then(function (got) {
        var grp = got[0],
          raw = got.slice(1);
        /** @type {Record<string, string>} */
        var files = {};
        lib.texts.forEach(function (t, i) {
          files[t.id] = raw[i];
        });
        /** @type {any} */
        var w = window;
        w.CONTENT = buildContent(lib, files, grp);
        var at = /** @type {HTMLElement} */ (document.getElementById("pieces"));
        at.insertAdjacentHTML("beforebegin", w.renderPieces(w.CONTENT));
        at.parentNode && at.parentNode.removeChild(at);
        w.SCR.page();
      });
    });
}
