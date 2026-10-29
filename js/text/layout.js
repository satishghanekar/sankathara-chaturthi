// Layout helpers that run once
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { onPiece } from "../core/page.js";
import { libraryGroups } from "../features/contents-list.js";

export function init() {
  onPiece(gridItems);
  // Contents rail (wide screens), built from the texts (as the Library is: js/features/contents-list.js)
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
      SCR.to("मुखपृष्ठ") +
      '</span><span class="en" lang="en">Home</span></a>' +
      h;
  })();
  // Gentle fade-in for verses that scroll into view (never for content already on screen; skipped if the device asks for less motion)
  (function () {
    if (!("IntersectionObserver" in window) || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    var ready = false;
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          if (!ready) return;
          var t = e.target;
          t.classList.add("fx-in");
          setTimeout(function () {
            t.classList.remove("fx-in");
          }, 700);
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    onPiece(function (sec) {
      [].forEach.call(sec.querySelectorAll("header,.item,.rftop,.fin"), function (x) {
        io.observe(x);
      });
    });
    setTimeout(function () {
      ready = true;
    }, 400);
  })();
}

// Where each stanza and line sits in the grid of every piece inside r (the page, or a printout's copy): two stanzas
// side by side when the screen is wide, each Marathi line beside its English
export function gridItems(/** @type {ParentNode} */ r) {
  [].forEach.call(r.querySelectorAll(".items"), function (b) {
    var row = 1,
      pair = [],
      lone = false,
      cur = null;
    function flush() {
      if (!pair.length) return;
      var h = 0;
      pair.forEach(function (g, i) {
        g.forEach(function (e, k) {
          e.style.gridRow = String(row + k);
          e.style.gridColumn = lone ? "1 / -1" : String(i + 1);
          if (i) e.classList.add("c2");
          else if (!lone) e.classList.add("c1");
        });
        h = Math.max(h, g.length);
      });
      row += h;
      pair = [];
      lone = false;
    }
    function full(e) {
      flush();
      e.style.gridRow = String(row++);
      e.style.gridColumn = "1 / -1";
    }
    [].forEach.call(b.children, function (e) {
      var main = e.classList.contains("item") && !e.classList.contains("rf");
      if (main && e.classList.contains("dh")) {
        cur = null;
        full(e);
        return;
      }
      if (main) {
        if (pair.length === 2) flush();
        if (pair.length === 1) {
          var a = nLines(pair[0][0]),
            c = nLines(e);
          if (Math.abs(a - c) > 1 && Math.min(a, c) * 2 < Math.max(a, c)) {
            lone = true;
            flush();
          }
        }
        cur = [e];
        pair.push(cur);
        return;
      }
      if (cur) cur.push(e);
      else full(e);
    });
    flush();
  });
  // Desktop + Both: each Marathi line sits beside its English line (rows matched by position)
  [].forEach.call(r.querySelectorAll(".verse"), function (v) {
    [".mr", ".en"].forEach(function (c) {
      var b = v.querySelector(":scope>" + c);
      if (b)
        [].forEach.call(b.children, function (p, i) {
          if (p.tagName === "P") p.style.gridRow = String(i + 1);
        });
    });
  });
}

// Two-column screens read across: stanza 1 | stanza 2, then 3 | 4. Each stanza keeps its own dhrupad marker/repeat under it.
// Two stanzas of very different length (Atharvashirsha: 7 lines beside 1) don't pair: the first goes alone across both columns.
function nLines(e) {
  return e.querySelectorAll(".verse > .mr > p").length || e.querySelectorAll("p").length || 1;
}
