// The Library: every text by group (पूजा, आरती) inside the Library + search overlay, built from the texts themselves
// (CONTENT, js/text/load.js), as Nitya Upasana's Library is
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { goHomeNav } from "./history.js";
import { esc } from "../core/words.js";

export var ul;

export function init() {
  ul = document.getElementById("jl");
  (function () {
    var li = document.createElement("li");
    li.className = "jhome";
    var b = document.createElement("button");
    b.type = "button";
    b.id = "jhb";
    b.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.6 5.5c.5-1.9 1.8-3.1 3.4-3.7 1.6.6 2.9 1.8 3.4 3.7"/><path d="M8.4 5.6h7.2"/><path d="M8.4 5.6c-.4 3.6.6 6.3 2.4 7.4.1 3.3 0 6.3 1.9 7.6 1.6 1 3.5 0 3.2-1.8-.2-1-1.3-1.3-1.8-.6"/><path d="M15.6 5.6c.4 3.6-.6 6.2-2.6 7.2"/><path d="M8.4 5.6C5.6 4.5 2.4 6 2.8 9.6c.3 2.6 2.4 3.7 4.8 3"/><path d="M15.6 5.6c2.8-1.1 6 .4 5.6 4-.3 2.6-2.4 3.7-4.8 3"/><path d="M12 7v1.8"/><path d="M9.3 13.6l-.9 1.6"/></svg><span class="mr">' + SCR.to("मुखपृष्ठ") + '</span><span class="en" lang="en">Home</span>';
    b.onclick = goHomeNav;
    li.appendChild(b);
    ul.appendChild(li);
  })();
  libraryGroups().forEach(function (g) {
    var h = document.createElement("li");
    h.className = "jh";
    h.innerHTML = g.name;
    ul.appendChild(h);
    g.items.forEach(function (x) {
      var li = document.createElement("li"),
        b = document.createElement("a");
      b.href = "#" + x.id;
      b.setAttribute("data-go", x.id);
      b.innerHTML = x.html;
      li.appendChild(b);
      ul.appendChild(li);
    });
  });
}

/**
 * The groups and their texts, for the Library and the left menu (js/text/layout.js): each group's name and each text's
 * number and title, in both languages (the page shows the one chosen), already in the chosen script
 * @returns {{ id: string, name: string, items: { id: string, html: string }[] }[]}
 */
export function libraryGroups() {
  /** @param {{ mr: string, en: string }} x */
  function two(x) {
    return '<span class="mr">' + esc(SCR.to(x.mr)) + '</span><span class="en" lang="en">' + esc(x.en) + "</span>";
  }
  return (window.CONTENT ? window.CONTENT.groups : []).map(function (g) {
    return {
      id: g.id,
      name: two(g.name),
      items: g.pieces.map(function (p) {
        return { id: p.id, html: '<span class="no"><span class="nm">' + esc(SCR.to(p.no.mr)) + '</span><span class="ne">' + esc(p.no.en) + "</span></span> " + two(p.title) };
      }),
    };
  });
}
