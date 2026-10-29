// Bottom bar (#asc): ‹ Prev, Home, Library (#asq), Aa (the reading sheet), Next ›, as in Nitya Upasana. Print is in the
// top bar.
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { root } from "../core/page.js";
import { P } from "../core/state.js";
import { cur } from "../core/apply.js";
import { goHomeNav, openLibrary } from "./history.js";

export var asc;

export function init() {
  // The bottom bar is the footer menu on every page. Its parts share the "as" prefix (asc, asv, ash, asq, asn)
  // because it began as the autoscroll bar (Autoscroll and Tilt to scroll, never released here, were removed on
  // 2026-10-29 as in Nitya Upasana; they are in git history up to v1.7.3).
  asc = document.getElementById("asc");
  document.getElementById("asv").onclick = function () {
    asGo(".prev");
  };
  document.getElementById("asn").onclick = function () {
    asGo(".next");
  };
  document.getElementById("ash").onclick = function () {
    goHomeNav();
  };
  document.getElementById("asq").onclick = function () {
    openLibrary();
  };
  // The bar is always there, like the top bar (data-asb leaves room for it under the text).
  // asShow() keeps Prev / Next with the piece on screen.
  asc.hidden = false;
  root.setAttribute("data-asb", "1");
  // the bar steps aside while Settings (#panel) or the Library (#jump) is open
  (function () {
    var ms = [document.getElementById("panel"), document.getElementById("jump")];
    function menu() {
      if (ms.some(function (m) { return m && !m.hidden; })) root.setAttribute("data-menu", "1");
      else root.removeAttribute("data-menu");
    }
    var mo = new MutationObserver(menu);
    ms.forEach(function (m) {
      if (m) mo.observe(m, { attributes: true, attributeFilter: ["hidden"] });
    });
    menu();
  })();
  addEventListener("scroll", asShow, { passive: true });
}

// the bottom of whatever sits at the top of the screen: the top bar, or the slim strip while it is tucked away
export function topEdge() {
  var bar = document.querySelector(root.hasAttribute("data-tuck") ? "#tuck" : "body > .bar");
  return bar ? Math.max(0, bar.getBoundingClientRect().bottom) : 60;
}

// Prev and Next named for where they go, in the menu language
export function asLabel() {
  var mr = P.ui === "mr",
    c = cur();
  [
    ["asv", "‹ मागील", "‹ Prev", ".prev"],
    ["asn", "पुढील ›", "Next ›", ".next"],
  ].forEach(function (x) {
    var b = document.getElementById(x[0]),
      // from the home page, Next opens the first text in the Library (asGo)
      a = c ? c.querySelector(".pn " + x[3]) : x[3] === ".next" ? document.querySelector("#jl a[data-go]") : null,
      t = a && a.querySelector(mr ? ":scope > .mr" : ":scope > .en"),
      name = t ? t.textContent : "";
    // the word in its own span: the smallest phones show only the arrow, to fit the bar (css/07-bottom-bar-folds.css)
    b.innerHTML = (mr ? x[1] : x[2]).replace(/([^‹›]+)/, '<span class="asw2">$1</span>');
    b.lang = mr ? "mr" : "en";
    b.setAttribute("aria-label", (mr ? x[1] : x[2]).replace(/[‹›]/g, "").trim() + (name ? ": " + name : ""));
    b.disabled = !a;
  });
  document.getElementById("ash").setAttribute("aria-label", mr ? "मुख्य पान" : "Home");
  document.getElementById("asq").setAttribute("aria-label", mr ? "संग्रह" : "Library");
}

// Previous / Next follow the links in each piece's .pn block (kept in the page but never shown on screen,
// the bar replaced it): here the reading page is the evening's texts in order, so they walk through it. Home and
// the Library work as in the top bar.
/** @param {string} sel */
function asGo(sel) {
  var c = cur(),
    a = /** @type {HTMLElement | null} */ (c && c.querySelector(".pn " + sel));
  if (a) a.click();
  else if (!c && sel === ".next") {
    // from the home page: the first text in the Library
    var f = /** @type {HTMLElement | null} */ (document.querySelector("#jl a[data-go]"));
    if (f) f.click();
  }
}

export function asShow() {
  var c = cur(),
    id = c ? c.id : "";
  if (id !== asShow.id) {
    asShow.id = id;
    asLabel();
  }
}
