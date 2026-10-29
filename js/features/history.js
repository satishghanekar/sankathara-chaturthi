// Back button
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { bt, onPiece } from "../core/page.js";
import { aa, cur, jp, pjOpen, pn } from "../core/apply.js";
import { TK, apply, goHome, tuckHold } from "./bars.js";
import { refit } from "../text/autofit.js";
import { setJ, setP } from "./overlays.js";

var NAV, popSkip, adT, ovFrom;

export function init() {
  // Opening a panel or dialog adds a Back step, so the phone's Back closes it instead of leaving the site.
  // Going to a piece (or home) adds a Back step that returns to where you were. As you read, the address
  // follows the piece on screen (#a5) without adding steps. Each step remembers its scroll position (y).
  NAV = !!(history.pushState && history.replaceState);
  popSkip = 0;
  // The script puts the page back in place itself (the browser's own guess can land at the top)
  if (NAV && "scrollRestoration" in history) history.scrollRestoration = "manual";
  addEventListener("popstate", function (e) {
    var was = ovOpen();
    setP(false);
    setJ(false);
    var shut = 0;
    ["qrm", "prm", "inm", "pzv", "rsh"].forEach(function (i) {
      var d = document.getElementById(i);
      if (d && !d.hidden) {
        d.hidden = true;
        shut = 1;
        if (i === "rsh") document.getElementById("rsb").setAttribute("aria-expanded", "false");
      }
    });
    // Closed with the phone's Back: focus goes back to the button that opened it, as with ✕ or Escape, so a
    // screen reader doesn't start again from the top of the page (WCAG 2.4.3)
    if (shut) {
      document.documentElement.style.overflow = "";
      if (ovFrom && ovFrom.isConnected && ovFrom.getClientRects().length)
        try {
          ovFrom.focus({ preventScroll: true });
        } catch (x) {}
    }
    if (popSkip) {
      popSkip--;
      return;
    }
    if (was) return;
    var st = e.state,
      el = location.hash && document.getElementById(location.hash.slice(1));
    pjOpen(el);
    homeView(!el || el.id === "home");
    if (st && typeof st.y === "number") scrollTo(0, st.y);
    else if (el) el.scrollIntoView();
    else scrollTo(0, 0);
  });
  // Keyboard: Tab stays inside an open dialog (QR, Print, Add to Home Screen, Help, Settings)
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Tab") return;
    var d = ["help", "qrm", "prm", "inm", "pzv", "rsh", "panel"]
      .map(function (i) {
        return document.getElementById(i);
      })
      .filter(function (x) {
        return x && !x.hidden;
      })[0];
    if (!d) return;
    // Everything Tab can land on, dropdowns included: leaving <select> out made Tab from the language dropdowns
    // jump back to the top of Settings, so the rest of the page could not be reached by keyboard (WCAG 2.1.1).
    // Visibility is tested with getClientRects, which (unlike offsetParent) also works inside fixed layers.
    var f = [].filter.call(d.querySelectorAll("button,a[href],input,select,textarea,summary,[tabindex]:not([tabindex='-1'])"), function (x) {
      return !x.disabled && x.tabIndex >= 0 && x.getClientRects().length > 0 && getComputedStyle(x).visibility !== "hidden";
    });
    if (!f.length) return;
    var a = document.activeElement,
      i = f.indexOf(a);
    // Firefox also stops on a box that scrolls (the print builder's list): that is still inside, so Tab goes on from
    // it as usual rather than back to the top (as in Nitya Upasana)
    if (i < 0 && a && d.contains(a)) return;
    if (e.shiftKey ? i <= 0 : i === f.length - 1 || i < 0) {
      e.preventDefault();
      f[e.shiftKey ? f.length - 1 : 0].focus();
    }
  });
  adT = 0;
  window.addEventListener(
    "scroll",
    function () {
      clearTimeout(adT);
      adT = setTimeout(function () {
        if (!NAV || hs().ov || ovOpen()) return;
        var c = cur();
        try {
          history.replaceState({ y: scrollY }, "", c ? "#" + c.id : location.pathname);
        } catch (e) {}
      }, 500);
    },
    { passive: true },
  );
  bt.addEventListener("click", function (e) {
    e.preventDefault();
    goHomeNav();
  });
  // Home and Library at the end of each piece do exactly what the bottom bar's buttons do
  onPiece(function (sec) {
    [].forEach.call(sec.querySelectorAll(".pnh"), function (h) {
      h.addEventListener("click", function (e) {
        e.preventDefault();
        goHomeNav();
      });
    });
    [].forEach.call(sec.querySelectorAll(".pns"), function (b) {
      b.onclick = openLibrary;
    });
  });
  // Skip link: focus goes to the first text on screen (a piece, or the page), without changing the address
  document.getElementById("skip").addEventListener("click", function (e) {
    e.preventDefault();
    var c = cur(),
      h = c && c.querySelector("h2"),
      m = document.getElementById("main");
    if (h) h.tabIndex = -1;
    try {
      (h || m).focus({ preventScroll: !!h });
    } catch (x) {}
  });
  // Tabbing out of an open panel closes it, so it doesn't stay over the page you have moved on to
  [pn, jp].forEach(function (el) {
    el.addEventListener("focusout", function (e) {
      var t = e.relatedTarget;
      if (el.hidden || !t || el.contains(t) || t.closest(".bar,#help")) return;
      el._ret = null;
      if (el === pn) setP(false);
      else setJ(false);
    });
  });
  document.getElementById("xc").onclick = function () {
    setP(false);
  };
  aa.onclick = function () {
    setP(pn.hidden);
  };
}

// The Library (contents and search): opened and closed by the bottom bar's button and the one at the end of each
// piece. With a mouse and keyboard, the cursor goes straight into the search box (on phones it doesn't, so the
// keyboard doesn't pop up over the list)
export function openLibrary() {
  setJ(jp.hidden);
  if (!jp.hidden && matchMedia("(hover: hover) and (pointer: fine)").matches) /** @type {HTMLElement} */ (document.getElementById("q")).focus();
}

function hs() {
  return history.state || {};
}

function ovOpen() {
  return (
    !pn.hidden ||
    !jp.hidden ||
    ["qrm", "prm", "inm", "help", "pzv", "rsh"].some(function (i) {
      var e = document.getElementById(i);
      return e && !e.hidden;
    })
  );
}

export function ovPush() {
  if (!NAV || hs().ov || ovOpen()) return;
  ovFrom = document.activeElement;
  try {
    history.replaceState({ y: scrollY }, "", location.href);
    history.pushState({ ov: 1, y: scrollY }, "", location.href);
  } catch (e) {}
}

// Closed with ✕, Escape or a tap outside: take the panel's Back step off again. Only once: history.back()
// lands later, so a second close in the same moment (Escape closes both panels) must not step back again.
export function ovDone() {
  if (!NAV || !hs().ov || ovOpen() || popSkip) return;
  popSkip++;
  history.back();
}

// A dialog closed to print: its Back step becomes a plain one, without stepping back. Stepping back
// (history.back()) lands a moment later, and a page moving through its history just as it asks to print
// may lose the print on iPhone, so printing never steps back.
export function ovDrop() {
  if (!NAV || !hs().ov) return;
  try {
    history.replaceState({ y: scrollY }, "", location.href);
  } catch (e) {}
}

// Go somewhere in the page: go() scrolls, url is "#a3" (a piece) or the bare address (home)
export function jumpTo(go, url) {
  var ov = NAV && hs().ov;
  if (typeof TK === "object" && TK) tuckHold();
  try {
    if (NAV) history.replaceState({ y: scrollY }, "", location.href);
  } catch (e) {}
  setP(false);
  setJ(false);
  // a piece (#a3, a section row, a line from search) shows the reading page; the bare address, Home on its own
  homeView(!(url && url.charAt(0) === "#" && url !== "#home"));
  go();
  try {
    if (NAV) history[ov ? "replaceState" : "pushState"]({ y: scrollY }, "", url);
  } catch (e) {}
  // Focus follows to the piece's heading, so the next Tab or screen reader line starts there
  var el = url && url.charAt(0) === "#" && document.getElementById(url.slice(1)),
    h = el && el.querySelector("h2");
  if (h) {
    h.tabIndex = -1;
    try {
      h.focus({ preventScroll: true });
    } catch (e) {}
  }
}

// Home on its own, as in Nitya Upasana: while data-hv is on <html>, the page ends after Home (the card and the
// evening's list) and the reading page below it is not shown; while reading, Home is not shown above the texts
// (css/05-home-card.css, screen only: print builds its own copy of the pieces). Set by going home (the top-bar title,
// Home in the bottom bar or the side menu, Back to the bare address) and at start-up with no piece to open
// (js/core/startup.js); taken off before the page goes to a piece (jumpTo(), Back to a piece's address, a link such as
// #a3, the reading position), so the evening is still one scroll from the first text to the last.
// Coming back to the texts, they are fitted to the screen again, since they could not be measured while hidden.
/** @param {boolean} on */
export function homeView(on) {
  var r = document.documentElement;
  if (on === r.hasAttribute("data-hv")) return;
  if (on) r.setAttribute("data-hv", "1");
  else {
    r.removeAttribute("data-hv");
    refit();
    apply();
  }
}

// Home buttons (top-bar title, Ganesha in the bottom bar, the rail's Home): from a piece they go home;
// on the home page, with the card in view, they open or close the card like its own round button
export function goHomeNav() {
  var top = document.querySelector("#home .top"),
    r = top && top.getBoundingClientRect();
  if (!cur() && r && r.bottom > 60 && r.top < innerHeight / 2) document.getElementById("cvb").onclick();
  else jumpTo(goHome, location.pathname);
}
