// Print
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.
//
// How a printout is made (as in Nitya Upasana; ARCHITECTURE.md, "Printing"):
//   1. The print view (#pv) is written from the page's pieces (all of them are in the page, folded or not) in markup of
//      its own, pv… classes only, so nothing of the reading page's look reaches the paper: its whole look is
//      css/15-print.css. What prints is decided here, by what each part of a text is (a stanza, the dhrupad, a note, a
//      Vedic paragraph), never by what the screen shows.
//   2. The browser lays the pages out, by four rules in css/15-print.css: every text starts on a new page; a stanza
//      (with its dhrupad, marker or note) is never split; a Vedic paragraph splits only between lines and never leaves
//      one line alone at the foot or top of a page; side by side, a row is never split.
// Nothing is measured, so every browser prints the same way, at once, from the tap that asked for it. The contents
// list the texts without page numbers, and no page has a border (Satish, 2026-10-28, as in Nitya Upasana).

import { flash, root } from "../core/page.js";
import { shared, P, change } from "../core/state.js";
import { ovDone, ovDrop, ovPush } from "./history.js";
import { FEAT_SW } from "../core/features.js";
import { createWhat, whatWords } from "../print/what.js";

// The page each printout is made for: one language upright, both languages side by side on a sideways page
var CHOICE = { one: { page: "up" }, both: { page: "land" } };

export function init() {
  (function () {
    var pm = document.getElementById("prm"),
      pv = /** @type {HTMLElement} */ (document.getElementById("pv")),
      b1 = document.getElementById("pr1"),
      b2 = document.getElementById("pr2"),
      bgo = document.getElementById("prgo"),
      bpr = document.getElementById("prgp"),
      po = pm.querySelector(".pro"),
      pw = document.getElementById("prw"),
      pv2 = document.getElementById("prv"),
      bsf = document.getElementById("prsf"),
      bcp = document.getElementById("prcp"),
      last = "as", // the layout last chosen, carried to Safari
      pn = pm.querySelector(".prn:not(#prw):not(#prv)"),
      busy = false,
      /** @type {{ m: string, ids: string[] | null } | null} the printout being made from the builder */
      job = null,
      /** @type {{ m: string, ids: string[] | null } | null} the printout just printed, until the reader is back */
      again = null,
      seen = false; // the browser has started printing (beforeprint) since the last window.print()
    // the original's language, by the letters it is shown in (P.ind), as the Print pop-up names it: in Marathi
    // menus, then in English. A new script (js/render.js) adds its name here.
    var NAMES = { mr: ["मराठी", "Marathi"], kn: ["कन्नड", "Kannada"] };
    // The printout's language: picked under How (the original, English or both), else as the page shows it (P.lang).
    // Like the font, it is the printout's only: the reading page keeps its own
    function plang() {
      return ["mr", "en", "both"].indexOf(P.plang) >= 0 ? P.plang : P.lang;
    }


    // ---- Writing the print view ----
    /** An element of the print view @param {string} tag @param {string} [cls] @param {string} [html] */
    function mk(tag, cls, html) {
      var e = document.createElement(tag);
      if (cls) e.className = cls;
      if (html !== undefined) e.innerHTML = html;
      return e;
    }
    // the original's language as the page marks it (Marathi, or the language of the letters it is shown in: Kannada)
    function olang() {
      return P.ind === "kn" ? "kn" : "mr";
    }
    // the language printed: "mr" (the original), "en" or "both"
    /** @param {Element} host @param {string} k  "mr" or "en" @returns {string}  the inner HTML of its part in that language */
    function part(host, k) {
      var x = host.querySelector(":scope > ." + k) || host.querySelector("." + k);
      return x ? x.innerHTML : "";
    }
    // A note's text for the paper: in the original language without the ↻, which Safari draws from a Devanagari font
    // as a mark that reads as ७ (Satish, 2026-10-23: just "ध्रुपद"); English keeps it
    /** @param {Element} host @param {string} k */
    function note(host, k) {
      var h = part(host, k);
      return k === "en" ? h : h.replace(/^\s*↻\s*/, "");
    }
    // An element's text in a language, marked with its language (lang, for the fonts: css/15-print.css)
    /** @param {string} tag @param {string} cls @param {string} k "mr" or "en" @param {string} html */
    function inLang(tag, cls, k, html) {
      var e = mk(tag, cls + (k === "en" ? " pve" : " pvo"), html);
      e.setAttribute("lang", k === "en" ? "en" : olang());
      return e;
    }
    // A danda (। ॥, | in English) stays at the end of the line with the word before it, and a verse number stays whole
    // (॥ १ ॥): the spaces inside such a run become no-break spaces. In the text itself, not in a span of its own:
    // Safari printed the space beside such a span so narrow that the last two words of a line ran together.
    /** @param {Element} el */
    function glue(el) {
      // First the reading page's own spans around words go: Safari prints a space at the edge of a span next to
      // nothing, so the words ran together (tested in Safari, Satish 2026-10-23: a span edge at a space glues the
      // words, a no-break space does not). A word kept with its danda (.nb) and, in a Vedic paragraph, the
      // preferred-break parts (.zs) are unwrapped; a run-on line's space (.brs) becomes a plain space.
      [].forEach.call(el.querySelectorAll(".brs"), function (/** @type {Element} */ b) {
        b.replaceWith(" ");
      });
      [].forEach.call(el.querySelectorAll(el.classList.contains("pvpr") ? ".nb, .zs" : ".nb"), function (/** @type {Element} */ x) {
        x.replaceWith.apply(x, [].slice.call(x.childNodes));
      });
      el.normalize();
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT),
        n;
      while ((n = w.nextNode()))
        n.data = n.data.replace(/\S+(?: +(?:[।॥|]+|[0-9०-९೦-೯]+(?= +[॥|])))+/g, function (run) {
          return run.replace(/ +/g, "\u00a0");
        });
    }

    // What a text prints, by what each part of it is (never by what the reading page happens to show): the dhrupad at
    // the top and its ↻ markers with the dhrupad "once", its repeats after each stanza with "after every verse"
    // (the text file's refrain), every stanza, every line said once, and every note of the text's own.
    // Returns its parts in order, each with its role.
    /** @param {HTMLElement} sec @returns {{ el: HTMLElement, role: string }[]} */
    function parts(sec) {
      var once = pref() === 1,
        out = [];
      // in the page's order: [once] lines and [note]s before the dhrupad at the top come first (.items.lead)
      [].forEach.call(sec.querySelectorAll(".rftop, .items > .item, .items > .rmk"), function (/** @type {HTMLElement} */ u) {
        var role = "";
        if (u.classList.contains("rftop")) role = once ? "refrain" : "";
        else if (u.classList.contains("rmk") && u.classList.contains("nt"))
          // a note of the text's own: "↻ ३ वेळा" (repeat the lines above) belongs to what is before it, a heading such
          // as फलश्रुति to what follows
          role = /^\s*↻/.test((u.querySelector(".mr") || u).textContent) ? "after" : "before";
        else if (u.classList.contains("rmk")) role = once ? "after" : "";
        else if (u.classList.contains("rf")) role = once ? "" : "after";
        else role = "main";
        if (role) out.push({ el: u, role: role });
      });
      return out;
    }
    // The parts grouped into blocks that never split: a heading note with what follows it; a marker, a repeated dhrupad
    // or a "3 times" with the stanza before it; the dhrupad at the top with the first stanza
    /** @param {{ el: HTMLElement, role: string }[]} ps @returns {HTMLElement[][]} */
    function group(ps) {
      var out = [],
        head = [],
        top = null;
      ps.forEach(function (x) {
        var last = out[out.length - 1];
        if (x.role === "refrain") top = x.el;
        else if (x.role === "before") head.push(x.el);
        else if (x.role === "after" && last) last.push(x.el);
        else {
          out.push((top ? [top] : []).concat(head, [x.el]));
          head = [];
          top = null;
        }
      });
      if (head.length || top) out.push((top ? [top] : []).concat(head));
      return out;
    }
    // The lines of a part (a stanza, the dhrupad, a line said once) in a language: each as written, with the stanza
    // number the page adds; a dhrupad line inside a stanza only when the dhrupad is said after every verse
    /** @param {HTMLElement} u @param {string} k @returns {{ html: string, rf: boolean }[]} */
    function linesOf(u, k) {
      var v = u.querySelector(".verse");
      if (!v) return [];
      return [].filter
        .call(v.querySelectorAll(":scope > ." + k + " > p"), function (/** @type {HTMLElement} */ p) {
          // (with the dhrupad once, a stanza's refrain lines are left out, unless the text always shows them:
          // refrain: always, section class norf)
          return pref() !== 1 || !p.classList.contains("rf") || !!u.closest(".norf");
        })
        .map(function (/** @type {HTMLElement} */ p) {
          return { html: p.innerHTML, rf: p.classList.contains("rf") || u.classList.contains("rf") };
        });
    }
    // how a part prints: the dhrupad at the top and a [dhrupad bold] block bold, a repeated dhrupad lighter
    /** @param {HTMLElement} u */
    function look(u) {
      var v = u.querySelector(".verse");
      return u.classList.contains("rftop") || (v && v.classList.contains("bold")) ? " pvbold" : u.classList.contains("rf") ? " pvrf" : "";
    }

    // One language: a stanza (with what goes with it), each line of verse a line on paper, centred, as on the reading
    // page (Satish, 2026-10-23: so the dhrupad, its markers and every stanza share one centre). A row of the text's
    // column (.pvcol)
    /** @param {HTMLElement[]} us @param {string} k */
    function verseBlock(us, k) {
      var row = mk("div", "pvk pvst"),
        b = mk("div", "pvsc");
      row.appendChild(b);
      us.forEach(function (u) {
        if (u.classList.contains("rmk")) return b.appendChild(inLang("p", "pvnote", k, note(u, k)));
        var lab = u.querySelector(".lab");
        if (lab) b.appendChild(inLang("p", "pvlab", k, part(lab, k)));
        var st = mk("div", "pvsz" + look(u) + (u.classList.contains("rftop") ? " pvref" : "") + (u.classList.contains("dh") ? " pvdh" : "")),
          // a stanza's own refrain lines (आरती ज्ञानराजा ॥ धृ. ॥) are printed as a dhrupad sung again: after the stanza
          rf = mk("div", "pvsz pvrf");
        // the dhrupad at the top: its lines in a box as wide as they are, the line beside it hugging them (.pvrefin)
        var top = u.classList.contains("rftop") ? st.appendChild(mk("div", "pvrefin")) : st;
        linesOf(u, k).forEach(function (l) {
          var p = inLang("p", "pvl" + (l.rf ? " pvrf" : ""), k, l.html);
          glue(p);
          (l.rf && !look(u) ? rf : top).appendChild(p);
        });
        if (top !== st && !top.firstChild) st.removeChild(top);
        if (st.firstChild) b.appendChild(st);
        if (rf.firstChild) b.appendChild(rf);
      });
      return row;
    }
    // the paragraphs of a Vedic text: a new one at a stanza marked para, and a stanza said once (dh) on its own; a note
    // of the text's own (फलश्रुति) between them
    /** @param {HTMLElement[]} units @returns {HTMLElement[][]} */
    function paras(units) {
      var gs = [],
        cur = null;
      units.forEach(function (u) {
        if (u.classList.contains("rmk")) {
          gs.push([u]);
          cur = null;
          return;
        }
        if (!u.querySelector(".verse")) return;
        var dh = u.classList.contains("dh");
        if (dh || !cur || u.classList.contains("para")) {
          cur = [];
          gs.push(cur);
        }
        cur.push(u);
        if (dh) cur = null;
      });
      return gs;
    }
    // One language, a Vedic text: running paragraphs, as in a printed booklet (a line of verse runs on after the last)
    /** @param {HTMLElement[]} g @param {string} k */
    function proseBlock(g, k) {
      if (g[0].classList.contains("rmk")) return mk("div", "pvk", "").appendChild(inLang("p", "pvnote", k, note(g[0], k))).parentNode;
      // the lines run on as one text, not a span each: Safari printed the space between two such spans so narrow that
      // the words ran together. (pvLines: the lines, for the tests)
      var ls = [];
      g.forEach(function (u) {
        linesOf(u, k).forEach(function (l) {
          ls.push(l.html.replace(/<br[^>]*>/gi, " "));
        });
      });
      var p = inLang("p", "pvpr", k, ls.join(" "));
      p.normalize();
      /** @type {any} */ (p).pvLines = ls.map(function (h) {
        return mk("span", "", h).textContent;
      });
      glue(p);
      // a paragraph of a single line said once (the closing peace chant) is centred, and never splits
      var one = g.length === 1 && g[0].classList.contains("dh") && linesOf(g[0], k).length === 1,
        b = mk("div", one ? "pvk pvcen" : "pvk pvflow");
      b.appendChild(p);
      return b;
    }
    // Both languages, side by side: a table, each line of the original beside its English line
    /** @param {HTMLElement[]} us @param {boolean} flow  a Vedic paragraph (its rows may run on to the next page) */
    function sideBlock(us, flow) {
      var t = mk("table", "pvt"),
        order = shared.LEAD === "en" ? ["en", "mr"] : ["mr", "en"],
        cg = mk("colgroup");
      order.forEach(function (k) {
        cg.appendChild(mk("col", k === "en" ? "pvce" : "pvco"));
      });
      t.appendChild(cg);
      var body = mk("tbody");
      t.appendChild(body);
      // a note or a label: across both columns, the original then its English
      /** @param {Element} x @param {string} cls */
      function across(x, cls) {
        var tr = mk("tr", cls),
          td = mk("td");
        td.colSpan = 2;
        order.forEach(function (k, i) {
          var h = cls === "pvnoterow" ? note(x, k) : part(x, k);
          if (!h) return;
          if (i && td.firstChild) td.appendChild(document.createTextNode(" · "));
          td.appendChild(inLang("span", "", k, h));
        });
        tr.appendChild(td);
        body.appendChild(tr);
      }
      us.forEach(function (u) {
        if (u.classList.contains("rmk")) return across(u, "pvnoterow");
        var lab = u.querySelector(".lab");
        if (lab) across(lab, "pvlabrow");
        var a = linesOf(u, "mr"),
          e = linesOf(u, "en");
        a.forEach(function (l, i) {
          var tr = mk("tr", "pvrow" + look(u) + (l.rf ? " pvrf" : "") + (i === a.length - 1 ? " pvend" : "") + (u.classList.contains("rftop") ? " pvref" : ""));
          order.forEach(function (k) {
            var td = inLang("td", "", k, k === "en" ? (e[i] ? e[i].html : "") : l.html);
            glue(td);
            tr.appendChild(td);
          });
          body.appendChild(tr);
        });
      });
      return mk("div", flow ? "pvk pvflow" : "pvk pvst").appendChild(t).parentNode;
    }

    // Build the print view (#pv): contents (when more than one text prints), then the texts chosen (sel), in reading order.
    // mode: "one" (one language) or "side" (both, side by side). The texts are read from the page's own pieces, which
    // are all there, folded or not (each part by what it is, never by what the screen shows)
    /** @param {string} mode @param {string[] | null} ids  the texts (piece ids), or null for every text @param {HTMLElement} [into] */
    function build(mode, ids, into) {
      write(into || pv, mode, source(ids));
    }
    // the pieces to print and the groups (पूजा, आरती) the contents list them under, with each group's name
    /** @param {string[] | null} sel */
    function source(sel) {
      /** @type {any} */
      var C = window.CONTENT,
        all = [],
        groups = (C ? C.groups : []).map(function (/** @type {any} */ g) {
          var head = /** @type {HTMLElement | null} */ (document.querySelector("#" + g.id + " button")),
            gs = g.pieces
              .filter(function (/** @type {any} */ p) {
                return !sel || sel.indexOf(p.id) >= 0;
              })
              .map(function (/** @type {any} */ p) {
                return document.getElementById(p.id);
              })
              .filter(Boolean);
          all = all.concat(gs);
          return { name: head ? [head.cloneNode(true)] : [], secs: gs };
        });
      return { secs: all, groups: groups };
    }
    // A title (a text's, the printout's, a group's) in the language printed: with both, the original's, the English
    // under it, smaller
    /** @param {string} tag @param {string} cls @param {string} mrHtml @param {string} enHtml @param {string} [numMr] @param {string} [numEn] */
    function title(tag, cls, mrHtml, enHtml, numMr, numEn) {
      var L = plang(),
        h = mk(tag, cls),
        k = L === "en" ? "en" : "mr",
        lead = L === "both" && shared.LEAD === "en" ? "en" : k;
      var n = lead === "en" ? numEn : numMr;
      if (n) h.appendChild(inLang("span", "pvnum", lead, n));
      h.appendChild(inLang("span", "pvtt", lead, lead === "en" ? enHtml : mrHtml));
      if (L === "both") h.appendChild(inLang("span", "pvsec", lead === "en" ? "mr" : "en", lead === "en" ? mrHtml : enHtml));
      return h;
    }
    /** a text's title, from its section on the page @param {HTMLElement} sec @param {string} tag @param {string} cls */
    function titleOf(sec, tag, cls) {
      var h = /** @type {HTMLElement} */ (sec.querySelector("header h2"));
      return title(tag, cls, part(h, "mr"), part(h, "en"), (h.querySelector(".nm") || {}).textContent || "", (h.querySelector(".ne") || {}).textContent || "");
    }
    // The contents: the printout's title, then each group (पूजा, आरती) and its texts, as a plain list (no page numbers)
    /** @param {HTMLElement} into @param {any} src */
    function contents(into, src) {
      var cov = mk("section", "pvcov");
      cov.appendChild(title("h1", "pvh", SCR.to("संकटहर चतुर्थी"), "Sankathara Chaturthi"));
      src.groups.forEach(function (/** @type {any} */ g) {
        if (!g.secs.length) return;
        var nm = mk("div");
        g.name.forEach(function (/** @type {Node} */ x) {
          nm.appendChild(x.cloneNode(true));
        });
        // two texts a row, each row a list of its own set as one unbreakable box (.pvtr): Safari split a row whose
        // title ran to two lines across two pages, whatever "break-inside: avoid" said. The category's heading and
        // its first row are one such box too (.pvhead), so a heading never ends a page alone.
        var rows = mk("div", "pvtocw"),
          head = rows.appendChild(mk("div", "pvhead")),
          ol = null;
        head.appendChild(title("h3", "pvcat", part(nm, "mr"), part(nm, "en")));
        g.secs.forEach(function (/** @type {HTMLElement} */ sec, i) {
          var li = titleOf(sec, "li", "");
          li.setAttribute("data-sid", sec.id);
          if (i % 2 === 0) ol = (i ? rows : head).appendChild(mk("ol", "pvtoc pvtr"));
          ol.appendChild(li);
        });
        cov.appendChild(rows);
      });
      into.appendChild(cov);
    }
    /** @param {HTMLElement} into @param {string} mode @param {any} src */
    function write(into, mode, src) {
      var side = mode === "side",
        k = plang() === "en" ? "en" : "mr";
      into.innerHTML = "";
      into.setAttribute("data-lang", plang());
      into.setAttribute("data-mode", side ? "side" : "one");
      // one text on its own prints as just that text: no contents
      if (src.secs.length > 1) contents(into, src);
      src.secs.forEach(function (/** @type {HTMLElement} */ sec) {
        var vedic = sec.classList.contains("prose"),
          box = mk("section", "pvs" + (vedic ? " pvved" : ""));
        box.setAttribute("data-sid", sec.id);
        box.appendChild(titleOf(sec, "h2", "pvtitle"));
        var ps = parts(sec);
        if (vedic)
          // a Vedic text: running paragraphs in one language; side by side, each line beside its English, the rows of a
          // paragraph running on from page to page. The dhrupad never applies to it
          paras(
            ps.map(function (x) {
              return x.el;
            }),
          ).forEach(function (g) {
            box.appendChild(side ? sideBlock(g, !g[0].classList.contains("rmk")) : proseBlock(g, k));
          });
        else if (side)
          group(ps).forEach(function (g) {
            box.appendChild(sideBlock(g, false));
          });
        else {
          // one column of stanzas, centred on the page as wide as its widest stanza (a table: the browser sizes it, and
          // breaks pages between its rows, never inside one)
          var col = mk("div", "pvcol");
          group(ps).forEach(function (g) {
            col.appendChild(verseBlock(g, k));
          });
          box.appendChild(col);
        }
        var cr = /** @type {HTMLElement | null} */ (sec.querySelector(".cr"));
        if (cr) {
          // the author line in the language printed (with both, the main one's), as plain text: its Wikipedia link is
          // for the screen. Inside the last block, so it never lands alone at the top of a page (in one language,
          // after the column, kept with it: inside a stanza it would widen it)
          var c = /** @type {HTMLElement} */ (cr.cloneNode(true)),
            cl = plang() === "both" ? (shared.LEAD === "en" ? "en" : "mr") : k,
            other = c.querySelectorAll(cl === "en" ? ".mr" : ".en");
          [].forEach.call(c.querySelectorAll(".crx"), function (/** @type {Element} */ x) {
            x.remove();
          });
          if (c.querySelector(cl === "en" ? ".en" : ".mr"))
            [].forEach.call(other, function (/** @type {Element} */ x) {
              x.remove();
            });
          var t = c.textContent.replace(/\s+/g, " ").trim();
          if (t) {
            var pc = mk("p", "pvcr");
            pc.textContent = t;
            // inside the last block, so it never goes to a page of its own (Safari doesn't keep a line with the one
            // before it); in a text's column, in its last cell, centred under the column
            var ks = box.querySelectorAll(".pvk"),
              last = ks[ks.length - 1];
            if (!last) box.appendChild(pc);
            else (last.querySelector(".pvsc") || last).appendChild(pc);
          }
        }
        into.appendChild(box);
      });
    }

    var LTR = /-(US|CA|MX|PH)$/i.test(navigator.language || "");
    // The pop-up's two choices, Portrait and Landscape, for what is printed: one language in a column, upright or
    // sideways; both languages side by side on sideways pages
    function choice() {
      return CHOICE[plang() === "both" ? "both" : "one"];
    }
    // Sideways pages for a layout ("one" or "side"): with both languages, side by side; with one, as the reader
    // last chose in the pop-up (P.por), or its default; upright only while Landscape is held back (FEAT_SW)
    /** @param {string} mode */
    function land(mode) {
      if (!FEAT_SW) return false;
      if (plang() === "both") return mode === "side";
      return (P.por || choice().page) === "land";
    }
    // Letter paper: as picked under How (P.ppr), else as the device's region suggests
    function letter() {
      return P.ppr ? P.ppr === "letter" : LTR;
    }
    // the sheet as it prints, [width, height] in mm
    /** @param {string} mode */
    function sheet(mode) {
      var pp = letter() ? [215.9, 279.4] : [210, 297]; // upright
      return land(mode) ? [pp[1], pp[0]] : pp;
    }
    // The printout's font: one of the same three as Settings → Text font, picked in the pop-up, else the text font. It
    // is the page's font (data-font) only while printing, so picking one for the printout leaves the reading page as it
    // is (Satish, 2026-10)
    var FONTS = ["std", "classic", "hand"];
    function pfn() {
      return FONTS.indexOf(P.pfn) >= 0 ? P.pfn : P.fnt;
    }
    // The printout's dhrupad (once, or after every verse) likewise: picked in the pop-up, else as the page shows it
    function pref() {
      return P.pref === 0 || P.pref === 1 ? P.pref : P.ref;
    }
    // The fonts the printout uses, asked for ahead (a browser prints only the faces it has loaded): the chosen font, the
    // Atharvashirsha's Tiro Devanagari Sanskrit, and Kannada letters' when they are on
    function fontsAhead() {
      if (!document.fonts || !document.fonts.load) return;
      var f = pfn(),
        want = ['400 16px "Tiro Devanagari Sanskrit"'];
      if (FAM[f]) want.push('400 16px "' + FAM[f] + '"');
      if (olang() === "kn") want.push(FAM[f] ? '400 16px "' + FAM[f].replace("SC ", "SC Kn ") + '"' : '400 16px "Noto Sans Kannada"');
      want.forEach(function (x) {
        try {
          document.fonts.load(x, "कॅ॑A").catch(function () {});
        } catch (e) {}
      });
    }
    /** @param {string} mode */
    function pon(mode) {
      root.setAttribute("data-print", mode);
      root.setAttribute("data-font", pfn());
      root.setAttribute("data-ref", String(pref()));
    }
    function poff() {
      root.removeAttribute("data-print");
      root.setAttribute("data-font", P.fnt);
      root.setAttribute("data-ref", String(P.ref));
    }

    // ---- The print builder (as in Nitya Upasana): What (js/print/what.js), then How (the rows below) ----
    // On a phone one step at a time (data-step on #prm: Next, and ‹ What to print back); from 760px side by side
    // (css/03-menus-print-view.css). The bottom bar keeps the running total and Next or Print.
    // The shelves: the reading page's groups (पूजा, आरती) and their texts, in reading order
    function shelves() {
      /** @type {any} */
      var C = window.CONTENT;
      return (C ? C.groups : []).map(function (/** @type {any} */ g) {
        return {
          category: { id: g.id, name: g.name },
          texts: g.pieces.map(function (/** @type {any} */ p) {
            return { id: p.id, sec: p.id, title: p.title.mr, titleEn: p.title.en, language: p.lang || "mr" };
          }),
        };
      });
    }
    // every piece's id, in reading order
    function allIds() {
      /** @type {string[]} */
      var out = [];
      shelves().forEach(function (s) {
        s.texts.forEach(function (t) {
          out.push(t.id);
        });
      });
      return out;
    }
    var what = createWhat(/** @type {HTMLElement} */ (document.getElementById("prwl")), {
        shelves: shelves,
        // the texts left out are kept (P.pskip), so the next printout starts with the same choice
        onChange: function () {
          var c = what.pick();
          change({
            pskip: c
              ? allIds().filter(function (id) {
                  return /** @type {string[]} */ (c).indexOf(id) < 0;
                })
              : [],
          });
          refresh();
        },
      }),
      bnx = /** @type {HTMLElement} */ (document.getElementById("prnx")),
      wide = window.matchMedia ? matchMedia("(min-width: 760px)") : null;
    // the texts ticked (their piece ids), or null for every text
    function chosen() {
      return what.pick();
    }
    // the bottom bar and the preview follow every choice
    function refresh() {
      summary();
      preview();
    }
    // The preview under How: the first page of the first text ticked, as it prints, made small. Written as the print
    // view is (build), into a frame the size of the page, cut off at the page's foot
    var shv = /** @type {HTMLElement} */ (document.getElementById("prsheet")),
      pshown = "";
    // the first text ticked, in reading order (as it prints)
    function first() {
      var c = chosen(),
        f = allIds().filter(function (id) {
          return !c || c.indexOf(id) >= 0;
        })[0];
      return f ? [f] : null;
    }
    function preview() {
      if (pm.hidden) return;
      var M = P.ui === "mr",
        ids = first(),
        m = dm(),
        k = ids ? [m, ids[0], plang(), shared.LEAD, pref(), P.tr, P.ind, pfn(), land(m), letter()].join("|") : "",
        sh = sheet(m),
        w = 120; // its width (css/03-menus-print-view.css .prsheet)
      shv.setAttribute("aria-label", M ? "पहिल्या पानाची झलक" : "Preview of the first page");
      shv.style.height = Math.round((w * sh[1]) / sh[0]) + "px";
      if (k === pshown && shv.firstChild) return;
      pshown = k;
      shv.textContent = "";
      if (!ids) return;
      var box = document.createElement("div");
      box.id = "pv";
      build(m, ids, box);
      var mm = 96 / 25.4,
        f = document.createElement("iframe");
      f.setAttribute("aria-hidden", "true");
      f.tabIndex = -1;
      f.title = "Preview";
      f.style.cssText = "border:0;width:" + sh[0] * mm + "px;height:" + sh[1] * mm + "px;transform-origin:0 0;transform:scale(" + w / (sh[0] * mm) + ")";
      shv.appendChild(f);
      try {
        var d = /** @type {Document} */ (f.contentDocument);
        d.open();
        d.write('<!doctype html><html data-print="' + m + '"' + attrs() + '><head><base href="' + location.href.replace(/"/g, "%22") + '"><style>' + pcss() + "\nhtml,body{margin:0;overflow:hidden;background:#fff}body{box-sizing:content-box;padding:17mm 19mm 0;height:" + (sh[1] - 36) + "mm}</style></head><body>" + box.outerHTML + "</body></html>");
        d.close();
      } catch (e) {}
    }
    // the paper, and the button that changes it (Letter or A4)
    function paperRow() {
      var M = P.ui === "mr",
        o = letter() ? "A4" : "Letter";
      /** @type {HTMLElement} */ (document.getElementById("prp")).textContent = /** @type {HTMLElement} */ (document.getElementById("prq")).textContent = letter() ? "Letter" : "A4";
      /** @type {HTMLElement} */ (document.getElementById("prpa")).textContent = M ? o + " वापरा" : "Use " + o;
      // Safari keeps the paper picked in its own dialog: when it is not the region's, it is told to pick it there
      [].forEach.call(document.querySelectorAll(".przp"), function (/** @type {HTMLElement} */ x) {
        x.textContent = letter() ? "Letter" : "A4";
      });
      /** @type {HTMLElement} */ (document.getElementById("prz")).hidden = !(root.classList.contains("wk") && letter() !== LTR);
    }
    /** @type {HTMLElement} */ (document.getElementById("prpa")).onclick = function () {
      change({ ppr: letter() ? "a4" : "letter" });
      paperRow();
      refresh();
    };
    // the bottom bar: "5 texts" (or the one text's name), or that a text must be picked (Next and Print wait for one)
    function summary() {
      var w = whatWords(),
        t = what.total(),
        el = /** @type {HTMLElement} */ (document.getElementById("prsum"));
      el.textContent = "";
      el.lang = P.ui === "mr" ? "mr" : "en";
      var a = document.createElement("span");
      // one text: its name
      a.textContent = t.one || (t.texts ? w.texts(t.texts) : w.pick);
      if (t.one) a.lang = t.oneLang;
      el.appendChild(a);
      /** @type {HTMLButtonElement} */ (bpr).disabled = /** @type {HTMLButtonElement} */ (bnx).disabled = !t.texts;
    }
    /** @param {string} s */
    function step(s) {
      pm.setAttribute("data-step", s);
      pm.scrollTop = 0;
    }
    bnx.onclick = function () {
      step("how");
      bpr.focus({ preventScroll: true });
    };
    /** @type {HTMLElement} */ (document.getElementById("prbk")).onclick = function () {
      step("what");
      bnx.focus({ preventScroll: true });
    };
    // The page as it prints: the browser is told with @page, set as each printout is made (Chrome, Edge and
    // Firefox follow it; Safari keeps the sheet the reader picks in its dialog, so the pop-up tells them to
    // pick Landscape there)
    var pst = document.createElement("style");
    pst.media = "print";
    document.head.appendChild(pst);
    /** @param {string} mode */
    function setPage(mode) {
      // the paper only when picked under How: otherwise the printer's own, as before
      var sz = P.ppr ? (letter() ? "letter " : "A4 ") : "";
      pst.textContent = sz || land(mode) ? "@page { size: " + sz + (land(mode) ? "landscape" : "portrait") + " }" : "";
    }
    // Above the choices: the dhrupad setting for the printout and its font (the three of Settings → Text font), with
    // a word of the text in each; neither changes the reading page
    var fn = /** @type {HTMLElement} */ (document.getElementById("prfn")),
      dh = /** @type {HTMLElement} */ (document.getElementById("prdg"));
    [].forEach.call(document.querySelectorAll("#sfn button"), function (/** @type {HTMLElement} */ b) {
      fn.appendChild(b.cloneNode(true));
    });
    // each font a tile: a word of the text in that font (set in rows), over the font's name
    [].forEach.call(fn.children, function (/** @type {HTMLElement} */ b) {
      var nm = document.createElement("span"),
        x = document.createElement("span");
      nm.className = "prfm";
      x.className = "prfx";
      x.setAttribute("aria-hidden", "true");
      while (b.firstChild) nm.appendChild(b.firstChild);
      b.appendChild(x);
      b.appendChild(nm);
    });
    fn.onclick = function (e) {
      var b = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest("button"));
      if (!b) return;
      change({ pfn: b.dataset.v });
      fontsAhead();
      rows();
      refresh();
    };
    // the printout's fonts by name (Standard is the page's own)
    /** @type {Record<string, string>} */
    var FAM = { classic: "SC Classic", hand: "SC Hand" };
    // a tile's word in its font. Set here: the page's own font rules follow the text font
    /** @param {string} lang @param {string} [font] (else the printout's) */
    function fam(lang, font) {
      var f = font || pfn(),
        kn = lang === "kn",
        base = kn ? '"Noto Sans Kannada", var(--body)' : lang === "en" ? "var(--lat)" : "var(--body)";
      return f === "std" || !FAM[f] ? base : '"' + (kn ? FAM[f].replace("SC ", "SC Kn ") : FAM[f]) + '", ' + base;
    }
    /** @param {string} k */
    function words(k) {
      var p = document.querySelector("#a1 .item:not(.dh) .verse ." + k + " p"),
        t = p ? (p.textContent || "").replace(/\s+/g, " ").trim() : "";
      t = t.split(/[,|।]/)[0].trim();
      return t.length > 26 ? t.slice(0, 26).replace(/\s+\S*$/, "") + "…" : t;
    }
    function rows() {
      var or = P.ind === "kn" ? "kn" : "mr",
        ks = plang() === "both" ? (shared.LEAD === "en" ? ["en", "mr"] : ["mr", "en"]) : [plang() === "en" ? "en" : "mr"];
      [].forEach.call(dh.children, function (/** @type {HTMLElement} */ b) {
        b.setAttribute("aria-pressed", b.dataset.v === String(pref()) ? "true" : "false");
      });
      // each tile: the first word of the text in the main language printed, in that tile's font (in the language of
      // the word, not as .mr or .en: those follow the menus' language here)
      var lang = ks[0] === "en" ? "en" : or,
        w = words(ks[0]).split(" ")[0].replace(/…$/, "");
      [].forEach.call(fn.children, function (/** @type {HTMLElement} */ b) {
        b.setAttribute("aria-pressed", b.dataset.v === pfn() ? "true" : "false");
        var x = /** @type {HTMLElement} */ (b.querySelector(".prfx"));
        x.textContent = w;
        x.setAttribute("lang", lang);
        x.style.setProperty("font-family", fam(lang, b.dataset.v), "important");
        x.style.setProperty("font-weight", "400", "important");
      });
    }
    dh.onclick = function (e) {
      var b = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest("button"));
      if (!b) return;
      change({ pref: +(b.dataset.v || 0) });
      rows();
      refresh();
    };
    // the site's CSS as the printer sees it: print rules on, screen-only rules off, no @page
    /** @returns {string} */
    function pcss() {
      if (pcss.t) return pcss.t;
      /** @type {string[]} */
      var out = [];
      /** @param {CSSRuleList} rules */
      function walk(rules) {
        [].forEach.call(rules, function (/** @type {any} */ r) {
          if (r.type === 4) {
            var m = r.media.mediaText;
            if (/print/.test(m)) walk(r.cssRules);
            else if (!/screen/.test(m)) out.push(r.cssText);
          } else if (r.type !== 6) out.push(r.cssText);
        });
      }
      [].forEach.call(document.styleSheets, function (/** @type {CSSStyleSheet} */ sh) {
        try {
          walk(sh.cssRules);
        } catch (e) {}
      });
      return (pcss.t = out.join("\n"));
    }
    /** @type {string} */
    pcss.t = "";
    // the page's own attributes as the printout has them (its font and dhrupad), for a copy of it in a frame
    function attrs() {
      var at = "";
      [].forEach.call(root.attributes, function (/** @type {Attr} */ a) {
        var v = a.name === "data-font" ? pfn() : a.name === "data-ref" ? String(pref()) : a.value;
        if (a.name !== "data-print") at += " " + a.name + '="' + v.replace(/&/g, "&amp;").replace(/"/g, "&quot;") + '"';
      });
      return at;
    }
    // the browser's own menu prints what the pop-up offers first: one language in a column, both side by side
    function dm() {
      return plang() === "both" && FEAT_SW ? "side" : "one";
    }
    // ---- Opening the print dialog ----
    // Safari and every iOS browser open the print dialog only in answer to a tap. The print view is written at once
    // (nothing is measured), so Print opens it from the same tap; should a browser still ignore it, the pop-up comes
    // back with one button, Print now, whose own tap opens the dialog.
    var iOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1),
      standalone = /** @type {any} */ (navigator).standalone || (window.matchMedia && matchMedia("(display-mode: standalone)").matches);
    // the page choice as chosen, and Safari's Landscape note with it
    function pages1() {
      var up = !land("one");
      b1.setAttribute("aria-pressed", String(up));
      b2.setAttribute("aria-pressed", String(!up));
      /** @type {HTMLElement} */ (document.getElementById("prl")).hidden = !(root.classList.contains("wk") && land(dm()));
    }
    bpr.onclick = function () {
      var m = dm();
      go(m === "one" ? "as" : m);
    };
    // the pop-up: the choices (ready false), or Print now (ready true)
    /** @param {boolean} ready */
    function pmMode(ready) {
      bpr.hidden = pn.hidden = po.hidden = ready;
      /** @type {HTMLElement} */ (document.getElementById("prst")).hidden = /** @type {HTMLElement} */ (document.getElementById("prsum")).hidden = bnx.hidden = ready;
      // (neither step: the title shows, without ‹ What to print)
      if (ready) pm.setAttribute("data-step", "ready");
      // both languages print side by side on Landscape only (stacked took a third more paper): no choice to
      // make, the row just says so; upright only while Landscape is held back (FEAT_SW)
      var one = !FEAT_SW || plang() === "both";
      /** @type {HTMLElement} */ (document.getElementById("prpg")).hidden = one;
      /** @type {HTMLElement} */ (document.getElementById("prpv")).hidden = !one;
      // Safari keeps the sheet picked in its own dialog: it is told to pick Landscape there
      /** @type {HTMLElement} */ (document.getElementById("prl")).hidden = !(root.classList.contains("wk") && land(dm()));
      // Safari on a Mac: Chrome turns the page itself (Satish, 2026-10)
      /** @type {HTMLElement} */ (document.getElementById("prc")).hidden = !root.classList.contains("wk") || iOS;
      bgo.hidden = !ready;
      pw.hidden = pv2.hidden = bsf.hidden = bcp.hidden = true;
    }
    // ---- The iPhone Home Screen app cannot print: hand the printout over to Safari ----
    // Safari opens at this site's address with the print choices in it (read by js/render.js), and offers
    // Print now there. iOS 17 and later open an x-safari-https:// address in Safari; Copy link is for the rest.
    // On Satish's iPhone neither the Print tap nor a second one (Print now) opened the dialog in the app, so the
    // app goes straight to this step once a layout is chosen.
    /** @param {string} mode */
    function link(mode) {
      /** @type {Record<string, any>} */
      var s = {};
      ["lang", "lead", "l2", "ui", "ind", "ref", "pref", "fnt", "pfn", "plang", "ppr", "tr", "por", "pskip"].forEach(function (k) {
        s[k] = P[k];
      });
      return location.origin + location.pathname + "?print=" + mode + "&s=" + encodeURIComponent(JSON.stringify(s));
    }
    // open: the pop-up is already open (its Back step is in place); tapped: Print now was tapped and the
    // dialog still did not open (not the Home Screen app: another app's browser, or Safari holding it back),
    // so the note names Share → Print too
    /** @param {boolean} open @param {boolean} [tapped] */
    function toSafari(open, tapped) {
      pmMode(true);
      bgo.hidden = true;
      bsf.hidden = bcp.hidden = false;
      pw.hidden = !!tapped;
      pv2.hidden = !tapped;
      if (!open) ovPush();
      pm.hidden = false;
      bsf.focus();
    }
    bsf.onclick = function () {
      var u = "x-safari-" + link(last);
      bsf.setAttribute("data-to", u); // (for the tests)
      location.href = u;
    };
    bcp.onclick = function () {
      var u = link(last);
      try {
        navigator.clipboard.writeText(u).then(
          function () {
            flash("लिंक कॉपी झाली: Safari मध्ये पेस्ट करा", "Link copied: paste it into Safari");
          },
          function () {
            window.prompt("Copy this link and paste it into Safari", u);
          },
        );
      } catch (e) {
        window.prompt("Copy this link and paste it into Safari", u);
      }
    };
    // print, and if the browser ignored it, offer Print now (or, after a Print now tap, say why)
    /** @param {boolean} again */
    function tryPrint(again) {
      seen = false;
      window.print();
      setTimeout(function () {
        if (seen || !busy) return;
        if (!again) return ready();
        // a tap did not open it either: the iPhone Home Screen app (on some iOS versions) cannot print, and
        // neither can some apps' own browsers (a link opened from a chat app)
        if (!iOS) return unready();
        unready();
        toSafari(false, !standalone);
      }, 1000);
    }
    function ready() {
      pmMode(true);
      ovPush();
      pm.hidden = false;
      bgo.focus();
    }
    bgo.onclick = function () {
      pm.hidden = true;
      ovDrop();
      tryPrint(true);
    };
    // a print view left waiting for Print now (the pop-up closed instead) is put away
    function unready() {
      if (!busy) return;
      busy = false;
      poff();
    }
    /** @param {string} mode */
    function go(mode) {
      last = mode;
      if (!what.total().texts) return flash("किमान एक रचना निवडा", "Pick at least one text");
      // the iPhone Home Screen app cannot print: straight to Open in Safari
      if (iOS && standalone) return toSafari(true);
      pm.hidden = true;
      ovDrop();
      // the chosen button has just been hidden: keyboard focus goes back to Print, not to the top of the page
      /** @type {HTMLElement} */ (document.getElementById("prb")).focus();
      busy = true;
      if (mode === "as") mode = "one";
      // every text ticked: the whole printout, as the browser's own Print menu makes it
      job = { m: mode, ids: chosen() };
      setPage(mode);
      fontsAhead();
      build(mode, job.ids);
      pon(mode);
      // nothing is measured, so the print view is ready at once: print from this tap
      tryPrint(false);
    }
    // Open the builder at What, with the ticks as last left (P.pskip)
    function openPrint() {
      unready();
      pmMode(false);
      // the language names follow what is printed: the original's place holds Marathi or Kannada, and with
      // both languages shown the main one comes first (left, or on top)
      var M = P.ui === "mr",
        en = M ? "इंग्रजी" : "English",
        or = (NAMES[P.ind] || NAMES.mr)[M ? 0 : 1],
        l1 = shared.LEAD === "en" ? en : or,
        l2 = shared.LEAD === "en" ? or : en;
      // the page: Portrait or Landscape (one language), a tap picks it; both languages: Landscape, side by side
      /** @param {HTMLElement} b @param {string} page */
      function opt(b, page) {
        b.textContent = page === "land" ? (M ? "आडवे" : "Landscape") : M ? "उभे" : "Portrait";
        b.setAttribute("data-page", page);
        b.onclick = function () {
          change({ por: page });
          pages1();
          refresh();
        };
      }
      opt(b1, "up");
      opt(b2, "land");
      // the language: the main one, the other, or both (the main one first, as on the page). Both prints side by side
      // on Landscape, so the page row then says so instead of offering a choice
      var lg = /** @type {HTMLElement} */ (document.getElementById("prlg")),
        LV = shared.LEAD === "en" ? ["en", "mr", "both"] : ["mr", "en", "both"];
      lg.textContent = "";
      LV.forEach(function (v) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("data-v", v);
        b.textContent = v === "both" ? (M ? "दोन्ही" : "Both") : v === "en" ? en : or;
        lg.appendChild(b);
      });
      lg.onclick = function (e) {
        var b = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest("button"));
        if (!b) return;
        change({ plang: b.getAttribute("data-v") });
        langRow();
        pmMode(false);
        pages1();
        rows();
        refresh();
      };
      langRow();
      /** @type {HTMLElement} */ (document.getElementById("prpv")).textContent = !FEAT_SW
        ? M
          ? "उभे: वर " + l1 + ", खाली " + l2
          : "Portrait: " + l1 + " above " + l2
        : M
          ? "आडवे: शेजारी शेजारी"
          : "Landscape, side by side";
      pages1();
      rows();
      paperRow();
      /** @type {HTMLElement} */ (document.getElementById("prx")).setAttribute("aria-label", M ? "रद्द" : "Cancel");
      // What, drawn afresh (the reading languages and the menu language may have changed), with the texts last left out
      what.render();
      what.set(
        allIds().filter(function (id) {
          return P.pskip.indexOf(id) < 0;
        }),
      );
      fontsAhead();
      step("what");
      ovPush();
      pm.hidden = false;
      refresh();
      // (a card taller than the screen stays at its top: Next or Print is in the bar at the bottom)
      (wide && wide.matches ? bpr : bnx).focus({ preventScroll: true });
    }
    function langRow() {
      [].forEach.call(/** @type {HTMLElement} */ (document.getElementById("prlg")).children, function (/** @type {HTMLElement} */ b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === plang()));
      });
    }
    /** @type {HTMLElement} */ (document.getElementById("prb")).onclick = openPrint;
    function pmClose() {
      unready();
      pm.hidden = true;
      ovDone();
      /** @type {HTMLElement} */ (document.getElementById("prb")).focus();
    }
    /** @type {HTMLElement} */ (document.getElementById("prx")).onclick = pmClose;
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !pm.hidden) pmClose();
    });
    pm.addEventListener("click", function (e) {
      if (e.target === pm) pmClose();
    });
    // Printing from the browser's own menu (or Share → Print on a phone) gets the same print view (one
    // language in a column, both side by side): contents, then every piece, never the home page.
    // Safari lays the page out again after afterprint (its print sheet, a change of paper there): until the reader is
    // back on the page, that is still the printout chosen, not every text
    window.addEventListener("beforeprint", function () {
      seen = true;
      if (!busy) {
        var j = again || { m: dm(), ids: null };
        setPage(j.m);
        build(j.m, j.ids);
        pon(j.m);
      }
    });
    // a tap or a key on the page (Ctrl+P too): the reader is back, and the browser's own Print prints every text
    ["pointerdown", "keydown"].forEach(function (t) {
      document.addEventListener(
        t,
        function () {
          again = null;
        },
        true,
      );
    });
    window.addEventListener("afterprint", function () {
      if (busy) again = job;
      busy = false;
      poff();
    });
    // Opened by the Home Screen app's Open in Safari (see js/render.js): lay the printout out once the fonts
    // are in, then Print now asks for the tap that Safari needs
    if (/** @type {any} */ (window).PRQ) {
      var mode = /** @type {any} */ (window).PRQ;
      /** @type {any} */ (window).PRQ = "";
      what.set(
        allIds().filter(function (id) {
          return P.pskip.indexOf(id) < 0;
        }),
      );
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
        setTimeout(function () {
          go(mode);
        }, 300);
      });
    }
  })();
}
