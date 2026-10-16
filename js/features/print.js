// Print
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { root, secs } from "../core/page.js";
import { shared, P } from "../core/state.js";
import { DV } from "../text/line-breaks.js";
import { fit } from "../print/fit.js";
import { LAYOUT } from "../print/profiles.js";
import { ovDone, ovPush } from "./history.js";

export function init() {
  // Print: single column (as on screen), two columns, or Marathi | English side by side.
  // A separate print view (#pv) is built from the visible text just before printing, so that
  // a heading always stays with its dhrupad and first stanza and stanzas are never split.
  (function () {
    var pm = document.getElementById("prm"),
      pv = document.getElementById("pv"),
      b1 = document.getElementById("pr1"),
      b2 = document.getElementById("pr2"),
      busy = false;
    function lbl(m, e) {
      return '<span class="mr">' + m + '</span><span class="en" lang="en">' + e + "</span>";
    }
    function shown(el) {
      return el.offsetParent !== null || (getComputedStyle(el).display !== "none" && el.getClientRects().length > 0);
    }
    function cl(el) {
      var c = el.cloneNode(true);
      c.removeAttribute("id");
      [].forEach.call(c.querySelectorAll("[id]"), function (x) {
        x.removeAttribute("id");
      });
      return c;
    }
    function keep(nodes) {
      var d = document.createElement("div");
      d.className = "pvk";
      nodes.forEach(function (n) {
        d.appendChild(n);
      });
      return d;
    }
    function td(nodes) {
      var t = document.createElement("td");
      nodes.forEach(function (n) {
        t.appendChild(n);
      });
      return t;
    }
    // Build the print view (#pv) from the page: contents, then every piece in the text language.
    // mode: "two" (two columns), "one" (one column) or "side" (Marathi and English side by side)
    function build(mode) {
      // Folded sections and pieces are printed in full: open them while the text is copied
      var fa = ["data-pf", "data-xf"].map(function (a) {
          var v = root.getAttribute(a);
          root.removeAttribute(a);
          return [a, v];
        }),
        fs = secs.filter(function (x) {
          return x.classList.contains("af");
        });
      fs.forEach(function (x) {
        x.classList.remove("af");
      });
      try {
        build2(mode);
      } finally {
        fa.forEach(function (a) {
          if (a[1] !== null) root.setAttribute(a[0], a[1]);
        });
        fs.forEach(function (x) {
          x.classList.add("af");
        });
      }
    }
    function build2(mode) {
      pv.innerHTML = "";
      var h = document.createElement("h1");
      h.className = "pvh";
      h.innerHTML = lbl(SCR.to("संकटहर चतुर्थी"), "Sankathara Chaturthi");
      pv.appendChild(h);
      var tc = document.createElement("div");
      tc.className = "pvtoc";
      [].forEach.call(document.querySelectorAll(".tocg"), function (g) {
        var as = g.querySelectorAll("ol.toc li a");
        if (!as.length) return;
        var h3 = document.createElement("h3");
        h3.innerHTML = g.querySelector(".gh").innerHTML;
        tc.appendChild(h3);
        var ol = document.createElement("ol");
        [].forEach.call(as, function (a) {
          var li = document.createElement("li"),
            m = a.querySelector(".m");
          li.innerHTML = m ? m.innerHTML : a.innerHTML;
          li.setAttribute("data-sid", a.getAttribute("data-go") || "");
          ol.appendChild(li);
        });
        ol.style.gridTemplateRows = "repeat(" + Math.ceil(as.length / 2) + ", auto)"; // two columns, top to bottom
        tc.appendChild(ol);
      });
      pv.appendChild(tc);
      secs.forEach(function (sec) {
        var box = document.createElement("section");
        box.className = "pvs";
        box.setAttribute("data-sid", sec.id);
        var hd = document.createElement("h2");
        hd.innerHTML = sec.querySelector("h2").innerHTML;
        var pre = [];
        var gp = sec.previousElementSibling;
        if (gp && gp.classList.contains("grp")) {
          var gl = document.createElement("div");
          gl.className = "pvg";
          gl.innerHTML = gp.innerHTML;
          [].forEach.call(gl.querySelectorAll(".allb"), function (x) {
            x.remove(); // Open all / Fold all is for the screen only
          });
          pre.push(gl);
        }
        pre.push(hd);
        var units = [],
          rt = sec.querySelector(".rftop");
        if (rt && shown(rt)) {
          var r = cl(rt);
          r.classList.add("pvref");
          units.push(r);
        }
        [].forEach.call(sec.querySelectorAll(".items > .item, .items > .rmk"), function (u) {
          if (shown(u)) units.push(cl(u));
        });
        if (mode === "side") {
          var first = true,
            t,
            hold = null;
          function flushT() {
            if (!t) return;
            if (first && !hold && t.querySelector(".pvrefrow")) {
              hold = t;
              t = null;
              return;
            }
            var k = first ? keep(pre.concat(hold ? [hold] : [], [t])) : keep([t]);
            first = false;
            box.appendChild(k);
            t = null;
          }
          units.forEach(function (u, ui) {
            if (!u.classList.contains("rmk") || !t) {
              flushT();
              t = document.createElement("table");
              t.className = "pvt pvside";
              // column widths (the English line is longer than its Devanagari, so its column is wider)
              var cg = document.createElement("colgroup");
              (shared.LEAD === "en" ? ["pvce", "pvcm"] : ["pvcm", "pvce"]).forEach(function (c) {
                var col = document.createElement("col");
                col.className = c;
                cg.appendChild(col);
              });
              t.appendChild(cg);
            }
            if (u.classList.contains("rmk")) {
              var tr = document.createElement("tr");
              var c = td([u]);
              c.colSpan = 2;
              tr.appendChild(c);
              t.appendChild(tr);
              return;
            }
            var lab = u.querySelector(".lab");
            if (lab) {
              var lr = document.createElement("tr"),
                lc = td([lab]);
              lc.colSpan = 2;
              lr.appendChild(lc);
              t.appendChild(lr);
            }
            var v = u.querySelector(".verse"),
              ms = v.querySelectorAll(".mr p"),
              es = v.querySelectorAll(".en p"),
              bold = u.classList.contains("pvref") || v.classList.contains("bold");
            [].forEach.call(ms, function (mp, i) {
              var tr = document.createElement("tr");
              if (mp.classList.contains("rf") || bold) tr.className = "pvb";
              if (u.classList.contains("pvref")) tr.className += " pvrefrow";
              if (i === ms.length - 1) tr.className += " pvend";
              var a = document.createElement("td"),
                b = document.createElement("td");
              a.className = "pvm mr";
              b.className = "pve en";
              a.setAttribute("lang", "mr");
              b.setAttribute("lang", "en");
              a.innerHTML = mp.innerHTML;
              b.innerHTML = es[i] ? es[i].innerHTML : "";
              if (mp.classList.contains("rf")) {
                tr.classList.add("rfl");
              }
              // English first (Settings → In Both, show first): English on the left
              tr.appendChild(shared.LEAD === "en" ? b : a);
              tr.appendChild(shared.LEAD === "en" ? a : b);
              t.appendChild(tr);
            });
          });
          flushT();
          if (first && hold) {
            t = hold;
            hold = null;
            flushT();
          }
        } else if (mode === "one") {
          var head = pre.slice();
          if (units[0] && units[0].classList.contains("pvref")) head.push(units.shift());
          var gs = [],
            wait = [];
          units.forEach(function (u) {
            if (u.classList.contains("rmk") && gs.length) {
              gs[gs.length - 1].push(u);
              return;
            }
            if (u.classList.contains("rmk")) {
              wait.push(u);
              return;
            }
            gs.push(wait.concat([u]));
            wait = [];
          });
          if (wait.length) gs.push(wait);
          gs.forEach(function (g) {
            box.appendChild(keep(head.concat(g)));
            head = [];
          });
          if (head.length) box.appendChild(keep(head));
        } else {
          // Two columns, newspaper style: the heading (and dhrupad) across the page, then the stanzas
          // run down the left column to the foot of the page and on down the right column.
          var head2 = pre.slice();
          if (units[0] && units[0].classList.contains("pvref")) head2.push(units.shift());
          var cols = document.createElement("div"),
            gs2 = [],
            wait2 = [];
          cols.className = "pvc";
          units.forEach(function (u) {
            if (u.classList.contains("rmk") && gs2.length) {
              gs2[gs2.length - 1].push(u);
              return;
            }
            if (u.classList.contains("rmk")) {
              wait2.push(u);
              return;
            }
            gs2.push(wait2.concat([u]));
            wait2 = [];
          });
          if (wait2.length) gs2.push(wait2);
          gs2.forEach(function (g) {
            g.forEach(function (u) {
              u.removeAttribute("style"); // drop the on-screen grid placement
            });
          });
          if (root.classList.contains("wk")) {
            // Safari and iOS browsers ignore CSS columns when printing. Instead, cut the piece into
            // blocks small enough for one page (even sideways) and fill each block's left column
            // first, then its right one. A short piece is a single block.
            var CAP = 22; // estimated printed lines per column in one block
            function gl(g) {
              var n = 0;
              g.forEach(function (u) {
                if (u.classList.contains("rmk")) {
                  n += 1;
                  return;
                }
                [].forEach.call(u.querySelectorAll(".verse ." + (P.lang === "en" ? "en" : "mr") + " p"), function (x) {
                  n += Math.ceil(x.textContent.length / (P.lang === "en" ? 42 : 48)) || 1;
                });
                n += 1;
              });
              return n;
            }
            var blocks = [],
              cur2 = [],
              cn2 = 4; // the heading and dhrupad share the first block's page
            gs2.forEach(function (g) {
              var n = gl(g);
              if (cur2.length && cn2 + n > 2 * CAP) {
                blocks.push(cur2);
                cur2 = [];
                cn2 = 0;
              }
              cur2.push(g);
              cn2 += n;
            });
            if (cur2.length) blocks.push(cur2);
            blocks.forEach(function (bk, bi) {
              var ls = bk.map(gl),
                tot = ls.reduce(function (a, b) {
                  return a + b;
                }, 0),
                k = bk.length,
                best = 1e9,
                l = 0;
              for (var j = 1; j <= bk.length; j++) {
                l += ls[j - 1];
                var m = Math.max(l, tot - l);
                if (m < best) {
                  best = m;
                  k = j;
                }
              }
              var t2 = document.createElement("table");
              t2.className = "pvt pv2";
              var tr2 = document.createElement("tr");
              tr2.appendChild(td([].concat.apply([], bk.slice(0, k))));
              tr2.appendChild(td([].concat.apply([], bk.slice(k))));
              t2.appendChild(tr2);
              box.appendChild(keep(bi ? [t2] : head2.concat([t2])));
            });
            if (!blocks.length) box.appendChild(keep(head2));
          } else {
            gs2.forEach(function (g) {
              cols.appendChild(keep(g));
            });
            var hk = keep(head2);
            hk.classList.add("pvhd");
            box.appendChild(hk);
            box.appendChild(cols);
          }
        }
        var cr = sec.querySelector(".cr");
        if (cr) {
          // the author line prints as plain text: the Wikipedia link is for the screen
          var pc = cl(cr);
          pc.className = "pvcr";
          [].forEach.call(pc.querySelectorAll(".crx"), function (x) {
            x.remove();
          });
          [].forEach.call(pc.querySelectorAll("a"), function (a) {
            a.replaceWith(document.createTextNode(a.textContent));
          });
          // inside the piece's last unbroken block, so it never lands alone at the top of a page
          var ks = box.querySelectorAll(".pvk");
          (ks.length ? ks[ks.length - 1] : box).appendChild(pc);
        }
        pv.appendChild(box);
      });
    }
    // ---- Page numbers in the printed contents ----
    // A browser cannot print "page N" for a heading, so the print view is laid out once in a hidden
    // frame the size of a printed page (Letter in the US and Canada, A4 elsewhere, upright) and
    // each piece's first page is worked out from the heights, as the browser breaks pages.
    var LTR = /-(US|CA|MX|PH)$/i.test(navigator.language || ""),
      PAPER = LTR ? [215.9, 279.4] : [210, 297],
      pcache = { key: "", pg: null };
    function pkey(mode) {
      return [mode, P.lang, shared.LEAD, P.ref, P.tr, P.ui, P.fnt].join("|");
    }
    // the site's CSS as the printer sees it: print rules on, screen-only rules off, no @page
    function pcss() {
      if (pcss.t) return pcss.t;
      var out = [];
      function walk(rules) {
        [].forEach.call(rules, function (r) {
          if (r.type === 4) {
            var m = r.media.mediaText;
            if (/print/.test(m)) walk(r.cssRules);
            else if (!/screen/.test(m)) out.push(r.cssText);
          } else if (r.type !== 6) out.push(r.cssText);
        });
      }
      [].forEach.call(document.styleSheets, function (sh) {
        try {
          walk(sh.cssRules);
        } catch (e) {}
      });
      return (pcss.t = out.join("\n"));
    }
    // lay out the current print view (#pv) and call back with { piece id: first page }
    function pages(mode, cb) {
      var mm = 96 / 25.4,
        f = document.createElement("iframe"),
        at = "",
        done = false;
      f.setAttribute("aria-hidden", "true");
      f.tabIndex = -1;
      // Safari (macOS 26, from Satish's PDFs) prints everything about 16/15 larger than Chrome, so a
      // page holds less: lay it out on a page that much smaller
      var sf = root.classList.contains("wk") ? 15 / 16 : 1;
      f.style.cssText = "position:fixed;left:-10000px;top:0;border:0;visibility:hidden;width:" + ((PAPER[0] - 18) * mm * sf - (P.fnt && P.fnt !== "std" ? 16 : 12)) + "px;height:" + (PAPER[1] - 23) * mm * sf + "px";
      [].forEach.call(root.attributes, function (a) {
        if (a.name !== "data-print") at += " " + a.name + '="' + a.value.replace(/&/g, "&amp;").replace(/"/g, "&quot;") + '"';
      });
      document.body.appendChild(f);
      function end(r) {
        if (done) return;
        done = true;
        if (f.parentNode) f.parentNode.removeChild(f);
        cb(r);
      }
      setTimeout(function () {
        end(null);
      }, 2500);
      try {
        var d = f.contentDocument;
        d.open();
        d.write('<!doctype html><html data-print="' + mode + '"' + at + '><head><base href="' + location.href.replace(/"/g, "%22") + '"><style>' + pcss() + "\nhtml,body{margin:0;overflow:hidden}#pv .pvtoc{break-after:column}#pv .pvs+.pvs{break-before:column}</style></head><body>" + pv.outerHTML + "</body></html>");
        d.close();
        // lay out once so the fonts the copy uses start loading, then wait for them before measuring
        d.documentElement.offsetHeight;
        d.fonts.ready.then(function () {
          try {
            // sizes first (they change the heights), then the pages
            fit(f.contentWindow, d, mode, pv);
            end(paginate(f.contentWindow, d, (PAPER[1] - 23) * sf, mm));
          } catch (e) {
            end(null);
          }
        });
      } catch (e) {
        end(null);
      }
    }
    // The site decides every page break, because a forced break ("start a new page here") is the one
    // page rule Chrome and Safari both follow. Each piece starts on a new page; its blocks (stanzas,
    // verse groups) are packed onto pages with 4% to spare, and a break is forced before each block
    // that starts a page. The contents numbers come from the same plan, so they match the printout.
    // Chrome's two-column flow (.pvc) can't take forced breaks, so its pages are found by laying the
    // print view out as a row of page-sized columns, as the browser breaks pages.
    function paginate(w, d, hmm, mm) {
      var p = d.getElementById("pv"),
        cs = w.getComputedStyle(p),
        pl = parseFloat(cs.paddingLeft),
        cw = p.clientWidth - pl - parseFloat(cs.paddingRight),
        secs = [].slice.call(p.querySelectorAll(".pvs")),
        // Measured against Chrome's own PDFs: the frame is 12px narrower than the page (16px with the
        // optional text fonts; printed text runs a little wider, so a near-full line wraps), and pages
        // with two columns of text hold 4px more than the plain sum of heights.
        H = hmm * mm - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) + (p.querySelector(".pvc") ? 4 : 0),
        C = H * 0.96,
        plan = {},
        z = {},
        out = { z: z, b: {} };
      if (!secs.length) return out;
      function pack(hs, k) {
        var n = 1,
          used = 0,
          br = [];
        hs.forEach(function (h, i) {
          h *= k;
          if (used > 0 && used + h > C) {
            n++;
            used = 0;
            br.push(i);
          }
          used += h;
        });
        return { n: n, b: br, f: used / C };
      }
      // 1. pieces made of blocks: measure each block and pack them onto pages. Measured 20px narrower
      // than the frame (a near-full line then wraps here first), so heights err on the tall side.
      var pw = p.style.cssText;
      p.style.cssText = "box-sizing:border-box;width:" + (p.offsetWidth - 20) + "px";
      secs.forEach(function (e) {
        var id = e.getAttribute("data-sid"),
          kids = [].slice.call(e.children);
        if (!kids.length || e.querySelector(".pvc")) return;
        var top = e.getBoundingClientRect().top,
          tops = kids.map(function (c) {
            return c.getBoundingClientRect().top;
          }),
          hs = kids.map(function (c, i) {
            return (i + 1 < kids.length ? tops[i + 1] : c.getBoundingClientRect().bottom) - (i ? tops[i] : top);
          }),
          r = pack(hs, 1);
        // a piece that would take fewer pages a little smaller is set at the largest size that does (no
        // smaller than LAYOUT.page.minZoom): one that spills a little onto another page, or one whose
        // blocks are too big to share a page and leave half of each page empty
        if (r.n > 1) {
          var fewest = r,
            at = 1;
          for (var t = 98; t >= LAYOUT.page.minZoom * 100; t -= 2) {
            var q = pack(hs, t / 100);
            if (q.n < fewest.n) {
              fewest = q;
              at = t / 100;
            }
          }
          if (at < 1) {
            r = fewest;
            z[id] = at;
          }
        }
        plan[id] = r;
        if (r.b.length) out.b[id] = r.b;
      });
      p.style.cssText = pw;
      // pages the contents take
      var first = secs[0].getBoundingClientRect().top - p.getBoundingClientRect().top - parseFloat(cs.paddingTop),
        page = Math.max(1, Math.ceil((first - 1) / H));
      // 2. Chrome's two-column pieces: lay out as page-sized columns and count the columns each takes
      if (secs.some(function (e) {
          return !plan[e.getAttribute("data-sid")];
        })) {
        p.style.cssText =
          "padding-top:0;padding-bottom:0;box-sizing:content-box;overflow:visible;column-gap:0;column-fill:auto;column-width:" + cw + "px;height:" + H + "px";
        var x0 = p.getBoundingClientRect().left + pl,
          y0 = p.getBoundingClientRect().top;
        var measure = function (e) {
          var c = e.firstElementChild,
            l = e.lastElementChild,
            rr = l.getClientRects(),
            b = rr[rr.length - 1] || l.getBoundingClientRect(),
            s = Math.round((c.getBoundingClientRect().left - x0) / cw);
          return { n: Math.round((b.left - x0) / cw) + 1 - s, f: (b.bottom - y0) / H };
        };
        secs.forEach(function (e) {
          var id = e.getAttribute("data-sid");
          if (plan[id] || !e.firstElementChild) return;
          var r = measure(e),
            k = 0;
          // only just spilling onto a page, or only just filling one: set slightly smaller so it
          // ends well inside a page
          if (r.n > 1 && r.f < 0.15) k = (0.94 * (r.n - 1)) / (r.n - 1 + r.f);
          else if (r.f > 0.94) k = (r.n - 1 + 0.9) / (r.n - 1 + r.f);
          if (k >= LAYOUT.page.minZoom && k < 1) {
            z[id] = Math.round(k * 100) / 100;
            e.style.zoom = z[id];
            r = measure(e);
          }
          plan[id] = r;
        });
      }
      secs.forEach(function (e) {
        var id = e.getAttribute("data-sid");
        out[id] = page + 1;
        page += (plan[id] && plan[id].n) || 1;
      });
      return out;
    }
    // write the page numbers into the printed contents
    function pnums(pg) {
      // the page plan (see paginate): pieces set slightly smaller, and a forced page break before
      // each block that starts a page
      [].forEach.call(pv.querySelectorAll(".pvbr"), function (e) {
        e.parentNode.removeChild(e);
      });
      [].forEach.call(pv.querySelectorAll(".pvs"), function (e) {
        var id = e.getAttribute("data-sid"),
          kids = [].slice.call(e.children);
        e.style.zoom = (pg && pg.z && pg.z[id]) || "";
        ((pg && pg.b && pg.b[id]) || []).forEach(function (i) {
          var br = document.createElement("div");
          br.className = "pvbr";
          if (kids[i]) e.insertBefore(br, kids[i]);
        });
      });
      [].forEach.call(pv.querySelectorAll(".pvtoc li[data-sid]"), function (li) {
        var n = pg && pg[li.getAttribute("data-sid")],
          s = li.querySelector(".pgn");
        if (s) s.parentNode.removeChild(s);
        if (!n) return;
        s = document.createElement("span");
        s.className = "pgn";
        s.textContent = P.lang !== "mr" ? n : DV(n);
        li.appendChild(s);
      });
    }
    // Printing from the browser's own menu cannot wait, so the single-column numbers are kept ready
    function warm() {
      var k = pkey("one");
      if (pcache.key === k || busy) return;
      build("one");
      pages("one", function (pg) {
        if (pg) pcache = { key: k, pg: pg };
      });
    }
    // Performance: the warm-up lays out a hidden copy of every piece, so it waits until the reader has
    // stopped tapping and then for an idle moment (Safari has no requestIdleCallback: it just runs then)
    var wt = 0;
    function warmSoon(ms) {
      clearTimeout(wt);
      wt = setTimeout(function () {
        if (window.requestIdleCallback) requestIdleCallback(warm, { timeout: 2000 });
        else warm();
      }, ms);
    }
    document.addEventListener("click", function () {
      warmSoon(2500);
    });
    warmSoon(3000);
    function go(mode) {
      pm.hidden = true;
      ovDone();
      // the chosen button has just been hidden: keyboard focus goes back to Print, not to the top of the page
      document.getElementById("prb").focus();
      busy = true;
      if (mode === "as") mode = "one";
      build(mode);
      pages(mode, function (pg) {
        pnums(pg);
        if (pg && mode === "one") pcache = { key: pkey("one"), pg: pg };
        root.setAttribute("data-print", mode);
        setTimeout(function () {
          window.print();
        }, 60);
      });
    }
    document.getElementById("prb").onclick = function () {
      // the language names follow what is printed: the original's place holds Marathi or Kannada, and with
      // both languages shown the main one comes first (left, or on top)
      var M = P.ui === "mr",
        en = M ? "इंग्रजी" : "English",
        or = P.ind === "kn" ? (M ? "कन्नड" : "Kannada") : M ? "मराठी" : "Marathi",
        l1 = shared.LEAD === "en" ? en : or,
        l2 = shared.LEAD === "en" ? or : en,
        tl = " (" + (P.lang === "en" ? en : or) + ")";
      if (P.lang === "both") {
        b1.textContent = (M ? "शेजारी शेजारी: " : "Side by side: ") + l1 + " | " + l2;
        b1.onclick = function () {
          go("side");
        };
        b2.textContent = M ? "वर " + l1 + ", खाली " + l2 : "Stacked: " + l1 + " above " + l2;
        b2.onclick = function () {
          go("as");
        };
      } else {
        b1.textContent = (M ? "दोन स्तंभ" : "Two columns") + tl;
        b1.onclick = function () {
          go("two");
        };
        b2.textContent = (M ? "एक स्तंभ" : "Single column") + tl;
        b2.onclick = function () {
          go("as");
        };
      }
      document.getElementById("prp").textContent = document.getElementById("prq").textContent = LTR ? "Letter" : "A4";
      ovPush();
      pm.hidden = false;
      b1.focus();
    };
    function pmClose() {
      pm.hidden = true;
      ovDone();
      document.getElementById("prb").focus();
    }
    document.getElementById("prx").onclick = pmClose;
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !pm.hidden) pmClose();
    });
    pm.addEventListener("click", function (e) {
      if (e.target === pm) pmClose();
    });
    // Printing from the browser's own menu (or Share → Print on a phone) gets the same print view,
    // single column: contents, then every piece in the chosen text language, never the home page
    window.addEventListener("beforeprint", function () {
      if (!busy) {
        build("one");
        if (pcache.key === pkey("one")) pnums(pcache.pg);
        root.setAttribute("data-print", "one");
      }
    });
    window.addEventListener("afterprint", function () {
      busy = false;
      root.removeAttribute("data-print");
    });
  })();
}
