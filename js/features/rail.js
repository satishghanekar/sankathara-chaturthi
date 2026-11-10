// @ts-check
// The contents rail (#rail, wide screens): Home, then every text by section, built from the texts as the Library is
// (js/features/contents-list.js). A feature, since it reads the Library's groups (the layers: js/README.md); it runs
// early, just after js/text/layout.js, so the parts after it find the rail in place.
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { libraryGroups } from "./contents-list.js";

export function init() {
  (function () {
    var r = document.getElementById("rail");
    if (!r) return;
    var h = "";
    libraryGroups().forEach(function (g) {
      // the group name goes to the section's first text (वैदिक मंत्र → the Atharvashirsha, आरती → the first aarti)
      var first = g.items[0] ? g.items[0].id : "";
      h += '<a class="rg" href="./#' + first + '" data-go="' + first + '">' + g.name + "</a><ul>";
      g.items.forEach(function (x) {
        h += '<li><a href="#' + x.id + '" data-go="' + x.id + '">' + x.html + "</a></li>";
      });
      h += "</ul>";
    });
    r.innerHTML =
      '<a class="rhome" href="#home" data-go="home"><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M8.6 5.5c.5-1.9 1.8-3.1 3.4-3.7 1.6.6 2.9 1.8 3.4 3.7\"/><path d=\"M8.4 5.6h7.2\"/><path d=\"M8.4 5.6c-.4 3.6.6 6.3 2.4 7.4.1 3.3 0 6.3 1.9 7.6 1.6 1 3.5 0 3.2-1.8-.2-1-1.3-1.3-1.8-.6\"/><path d=\"M15.6 5.6c.4 3.6-.6 6.2-2.6 7.2\"/><path d=\"M8.4 5.6C5.6 4.5 2.4 6 2.8 9.6c.3 2.6 2.4 3.7 4.8 3\"/><path d=\"M15.6 5.6c2.8-1.1 6 .4 5.6 4-.3 2.6-2.4 3.7-4.8 3\"/><path d=\"M12 7v1.8\"/><path d=\"M9.3 13.6l-.9 1.6\"/></svg><span class="mr">' +
      /** @type {any} */ (globalThis).SCR.to("मुखपृष्ठ") +
      '</span><span class="en" lang="en">Home</span></a>' +
      h;
  })();
}
