// Print layout: fitting the text to the paper
// Called by js/features/print.js while it lays the print view out on a page-sized copy (to plan the
// pages), before the page breaks are planned. The numbers it works with are in js/print/profiles.js.
//
// A printed line should stay whole: on one line, or broken only where it has its own line breaks. Side by
// side, each line of the original should take as many lines as its English, so the rows stay in step.
// The print styles give every line its size; this adjusts them, in four steps:
//   1. collect: each piece, with its columns (the original, the English) and their lines, in any
//      layout: side by side (a table per stanza), stacked, single or two columns (a .verse per stanza);
//   2. measure: every line once, unwrapped, in the page-sized copy: where it may break and how wide
//      each part is. A line may break between its parts (.zs, see js/text/line-breaks.js), and in plain
//      text between any two words, which reads as a break in the middle of a phrase;
//   3. plan: arithmetic on those widths only. For each piece, the size of each column that leaves the
//      fewest rows out of step, the fewest lines broken mid-phrase and the fewest wrapped lines, shrinking
//      as little as possible (and no further than the script allows). Side by side, the share of the width
//      each column gets is chosen the same way, once for each piece;
//   4. apply: the chosen sizes (and column widths) to the copy and to the print view itself.
// A piece is set at one size per language, so its stanzas and its dhrupad always match.
import { SCRIPTS, OTHER, scriptOf, sizeOf, LAYOUT } from "./profiles.js";

export function fit(w, d, mode, pv) {
  var side = mode === "side",
    sel = side ? ["table.pvside", "td.pvm, td.pve"] : [".verse", ".verse p"],
    lines = [].slice.call(d.querySelectorAll("#pv " + sel[1].replace(", ", ", #pv "))),
    mine = pv.querySelectorAll(sel[1]),
    at = new Map(),
    fnt = d.documentElement.getAttribute("data-font") || "std";
  if (!lines.length || lines.length !== mine.length) return;
  lines.forEach(function (el, i) {
    at.set(el, mine[i]);
  });
  var groups = collect(w, d, side, sel[0]);
  if (!groups.length) return;
  var geo = measure(w, d, groups, side, fnt);
  // side by side: each piece's share of the width for the original
  var split = {};
  if (side)
    groups.forEach(function (g) {
      split[g.sid] = chooseSplit([g], geo);
    });
  groups.forEach(function (g) {
    var shares = side ? [split[g.sid], 1 - split[g.sid]] : null,
      s = best(g, shares, geo).s;
    g.cols.forEach(function (c, k) {
      var f = c.size * s[k];
      if (Math.abs(f - 1) < 0.005) return;
      c.lines.forEach(function (ln) {
        var px = ln.base * f + "px";
        ln.el.style.fontSize = px;
        at.get(ln.el).style.fontSize = px;
      });
    });
  });
  if (side)
    [d.querySelectorAll("#pv col.pvcm"), pv.querySelectorAll("col.pvcm")].forEach(function (cs) {
      [].forEach.call(cs, function (c) {
        var x = split[c.closest(".pvs").getAttribute("data-sid")];
        if (x) c.style.width = Math.round(x * 1000) / 10 + "%";
      });
    });
}

function shown(w, el) {
  return w.getComputedStyle(el).display !== "none" && el.getClientRects().length > 0;
}

// 1. the pieces: { sid, cols: [{ lines: [{ el }] }] (one per language), rows: [[line, line]] (side by side) }
function collect(w, d, side, groupSel) {
  var out = [];
  [].forEach.call(d.querySelectorAll("#pv " + groupSel), function (g) {
    if (!shown(w, g)) return;
    if (side) {
      var o = { lines: [] },
        e = { lines: [] },
        rows = [];
      [].forEach.call(g.querySelectorAll("tr"), function (tr) {
        var a = tr.querySelector("td.pvm"),
          b = tr.querySelector("td.pve");
        if (!a || !b || !shown(w, tr)) return;
        var la = { el: a },
          lb = { el: b };
        o.lines.push(la);
        e.lines.push(lb);
        rows.push([la, lb]);
      });
      if (rows.length) out.push({ cols: [o, e], keys: ["o", "e"], rows: rows, sid: g.closest(".pvs").getAttribute("data-sid") });
    } else {
      var cols = [],
        keys = [];
      [].forEach.call(g.children, function (c) {
        if (!c.classList.contains("mr") && !c.classList.contains("en")) return;
        if (!shown(w, c)) return;
        var ls = [].filter
          .call(c.querySelectorAll("p"), function (p) {
            return shown(w, p);
          })
          .map(function (p) {
            return { el: p };
          });
        if (ls.length) {
          cols.push({ lines: ls });
          keys.push(c.classList.contains("en") ? "en" : "mr");
        }
      });
      if (cols.length) out.push({ cols: cols, keys: keys, rows: null, sid: g.closest(".pvs").getAttribute("data-sid") });
    }
  });
  // one size per language for a whole piece: its stanzas (and its dhrupad, however often it is printed)
  // match each other, so the stanzas of a piece are planned together
  var pieces = {},
    merged = [];
  out.forEach(function (g) {
    var m = pieces[g.sid];
    if (!m) {
      m = pieces[g.sid] = { cols: [], keys: [], rows: g.rows ? [] : null, sid: g.sid };
      merged.push(m);
    }
    g.keys.forEach(function (k, i) {
      var j = m.keys.indexOf(k);
      if (j < 0) {
        j = m.keys.push(k) - 1;
        m.cols.push({ lines: [] });
      }
      [].push.apply(m.cols[j].lines, g.cols[i].lines);
    });
    if (g.rows) [].push.apply(m.rows, g.rows);
  });
  return merged;
}

// 2. every line, unwrapped: its segments (its own line breaks), each a list of parts { l, r, pref } with
// pref = a preferred place to break before this part. Side by side, also the width of the table and how
// much of each column is not text (padding, rule), to work out a column's text width for any share.
function measure(w, d, groups, side, fnt) {
  var st = d.createElement("style"),
    r = d.createRange(),
    geo = null;
  st.textContent = "#pv .verse p, #pv td.pvm, #pv td.pve { white-space: nowrap !important }";
  d.head.appendChild(st);
  groups.forEach(function (g) {
    g.cols.forEach(function (c) {
      // the column's script, from its letters (one column holds one language)
      var sc =
        SCRIPTS[
          scriptOf(
            c.lines
              .map(function (ln) {
                return ln.el.textContent;
              })
              .join("")
          )
        ] || OTHER;
      c.size = sizeOf(sc, fnt);
      c.minFit = sc.minFit;
      c.lines.forEach(function (ln) {
        var cs = w.getComputedStyle(ln.el);
        ln.base = parseFloat(cs.fontSize);
        // the part of its box that is not text: padding, and a column's rule
        ln.box = ln.el.getBoundingClientRect().width;
        ln.extra = ln.box - ln.el.clientWidth + parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        ln.segs = parts(ln.el, r);
      });
    });
    if (side && !geo) {
      var a = g.rows[0][0],
        b = g.rows[0][1];
      geo = { table: a.box + b.box };
    }
  });
  d.head.removeChild(st);
  return geo;
}

function parts(el, r) {
  var segs = [[]],
    prevZs = true; // the start of a line counts as a preferred break
  function add(rect, pref, zs) {
    if (!rect.width) return;
    segs[segs.length - 1].push({ l: rect.left, r: rect.right, pref: pref || prevZs });
    prevZs = zs;
  }
  [].forEach.call(el.childNodes, function (n) {
    if (n.nodeType === 1 && n.tagName === "BR") {
      segs.push([]);
      prevZs = true;
    } else if (n.nodeType === 1 && n.classList.contains("zs")) add(n.getBoundingClientRect(), true, true);
    else if (n.nodeType === 1) add(n.getBoundingClientRect(), false, false);
    else if (n.nodeType === 3) {
      var re = /\S+/g,
        m;
      while ((m = re.exec(n.data))) {
        r.setStart(n, m.index);
        r.setEnd(n, m.index + m[0].length);
        add(r.getBoundingClientRect(), false, false);
      }
    }
  });
  return segs.filter(function (s) {
    return s.length;
  });
}

// How a line comes out at scale s (against its measured size) in a text width of W: the lines it takes
// and how many of its breaks fall in the middle of a phrase. The browser fills each line with as many
// parts as fit, so this does the same.
function predict(ln, W, s) {
  var lines = 0,
    mid = 0,
    room = W * LAYOUT.margin;
  ln.segs.forEach(function (seg) {
    var start = seg[0].l;
    lines++;
    seg.forEach(function (p, j) {
      if ((p.r - p.l) * s > room) {
        // a part wider than the column breaks inside itself
        var n = Math.ceil(((p.r - p.l) * s) / room);
        lines += n - 1;
        mid += n - 1;
      }
      if (j && (p.r - start) * s > room) {
        lines++;
        if (!p.pref) mid++;
        start = p.l;
      }
    });
  });
  return { lines: lines, mid: mid, segs: ln.segs.length };
}

// The text width a line has: as laid out, or side by side, its column's share of the table
function width(ln, share, geo) {
  return (share ? share * geo.table : ln.box) - ln.extra;
}

// The scales worth trying for a column: as it is, and each scale at which one of its lines just fits
function candidates(c, share, geo) {
  var out = [1];
  c.lines.forEach(function (ln) {
    var W = width(ln, share, geo) * LAYOUT.margin;
    ln.segs.forEach(function (seg) {
      var need = (seg[seg.length - 1].r - seg[0].l) * c.size,
        s = (W / need) * 0.999;
      if (s < 1 && s >= c.minFit) out.push(s);
    });
  });
  return out;
}

// 3. the best scale for each column of a piece (shares: side by side, each column's share of the width)
function best(g, shares, geo) {
  var C = LAYOUT.cost;
  function colCost(c, k, s) {
    var W0 = shares ? shares[k] : 0,
      res = [],
      cost = (1 - s) * 100 * C.shrink;
    c.lines.forEach(function (ln) {
      var p = predict(ln, width(ln, W0, geo), c.size * s);
      res.push(p);
      cost += p.mid * C.midPhrase + (p.lines - p.segs) * C.wrap;
    });
    return { cost: cost, res: res };
  }
  var cand = g.cols.map(function (c, k) {
    return candidates(c, shares && shares[k], geo).map(function (s) {
      return { s: s, r: colCost(c, k, s) };
    });
  });
  if (!g.rows) {
    // columns stacked or alone: each on its own
    var s = cand.map(function (cs) {
      return cs.reduce(function (a, b) {
        return b.r.cost < a.r.cost ? b : a;
      }).s;
    });
    return { s: s, cost: 0 };
  }
  // side by side: the two columns together, so their rows take as many lines as each other
  var bestPick = null;
  cand[0].forEach(function (a) {
    cand[1].forEach(function (b) {
      var cost = a.r.cost + b.r.cost;
      for (var i = 0; i < g.rows.length; i++) if (a.r.res[i].lines !== b.r.res[i].lines) cost += C.outOfStep;
      if (!bestPick || cost < bestPick.cost - 1e-9) bestPick = { s: [a.s, b.s], cost: cost };
    });
  });
  return bestPick;
}

// Side by side: the original's share of the width that leaves a piece with the fewest problems
// (ties: the share nearest an even split)
function chooseSplit(groups, geo) {
  var L = LAYOUT.side,
    pick = null;
  for (var x = L.min; x <= L.max + 1e-9; x += L.step) {
    var cost = 0;
    for (var i = 0; i < groups.length; i++) cost += best(groups[i], [x, 1 - x], geo).cost;
    if (!pick || cost < pick.cost - 1e-9 || (Math.abs(cost - pick.cost) < 1e-9 && Math.abs(x - 0.5) < Math.abs(pick.x - 0.5))) pick = { x: x, cost: cost };
  }
  return pick.x;
}
