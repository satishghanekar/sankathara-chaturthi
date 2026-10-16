// Print audit helpers: how every printed line actually came out on paper.
//
// The block markers in print-helpers.mjs show where each unbroken block landed. These go one level down:
// every printed line is cut into its parts, the pieces it may break between (a .zs part, see
// js/text/line-breaks.js, or the plain text between them), and its own line breaks (<br>) start a new
// segment. An invisible marker goes at the start and the end of every part ({{n.k.s}} / {{n.k.e}}: line n,
// part k). In the PDF, pdf.js gives each marker's page and height, so:
//   - a part whose start and end are on different lines broke in the middle of a phrase (an ugly wrap);
//   - a line that takes more lines than it has segments wrapped (at a preferred break, if no part broke);
//   - side by side, the two cells of a row ending at different heights are out of step;
//   - a marker missing from the PDF is text that was not printed.
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

/** Add the line markers; returns what was marked: one entry per printed line. */
export async function addLineMarkers(page) {
  return page.evaluate(() => {
    const pv = document.getElementById("pv");
    const shown = (e) => {
      for (let x = e; x && x !== pv; x = x.parentElement) if (getComputedStyle(x).display === "none") return false;
      return true;
    };
    const mk = (t) => {
      const s = document.createElement("span");
      s.className = "__lm";
      s.textContent = " {{" + t + "}} ";
      s.style.cssText = "position:absolute;font:1px/1 monospace;letter-spacing:0;word-spacing:0;text-transform:none;color:#fff;white-space:nowrap";
      return s;
    };
    const side = !!pv.querySelector(".pvside");
    const els = [...pv.querySelectorAll(side ? ".pvside td.pvm, .pvside td.pve" : ".verse p")].filter(shown);
    const out = [];
    els.forEach((el, n) => {
      // the size the line was set at, against the size it would have without the fitting
      const fitted = el.style.fontSize;
      let scale = 1;
      if (fitted) {
        el.style.fontSize = "";
        const base = parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize = fitted;
        scale = parseFloat(getComputedStyle(el).fontSize) / base;
      }
      // parts: each .zs span on its own, and each run of other content between them; <br> starts a segment
      const parts = [];
      let run = [],
        seg = 0;
      const flush = () => {
        if (run.some((x) => x.nodeType !== 3 || x.data.trim())) parts.push({ nodes: run, seg });
        run = [];
      };
      [...el.childNodes].forEach((c) => {
        if (c.nodeType === 1 && c.tagName === "BR") {
          flush();
          seg++;
        } else if (c.nodeType === 1 && c.classList.contains("zs")) {
          flush();
          parts.push({ zs: c, seg });
        } else run.push(c);
      });
      flush();
      parts.forEach((p, k) => {
        if (p.zs) {
          p.zs.insertBefore(mk(n + "." + k + ".s"), p.zs.firstChild);
          p.zs.appendChild(mk(n + "." + k + ".e"));
        } else {
          const a = p.nodes[0],
            b = p.nodes[p.nodes.length - 1];
          a.parentNode.insertBefore(mk(n + "." + k + ".s"), a);
          b.parentNode.insertBefore(mk(n + "." + k + ".e"), b.nextSibling);
        }
      });
      const tr = el.closest("tr");
      out.push({
        n,
        sid: el.closest(".pvs")?.dataset.sid || "",
        lang: el.closest("[lang]")?.getAttribute("lang") || "",
        cell: side ? (el.classList.contains("pvm") ? "orig" : "en") : "",
        row: side ? [...pv.querySelectorAll(".pvside tr")].indexOf(tr) : -1,
        text: el.textContent.replace(/\s*(\{\{[^}]*\}\}|\[\[[^\]]*\]\])\s*/g, " ").replace(/\s+/g, " ").trim(),
        parts: parts.length,
        segs: (parts.length ? parts[parts.length - 1].seg : 0) + 1,
        scale,
      });
    });
    return out;
  });
}

/** Every marker in the PDF: { label: { p: page (from 1), y: points from the top, h: page height } } */
export async function pdfMarks(buf) {
  const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), useSystemFonts: false, verbosity: 0 }).promise;
  const marks = {},
    pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const pg = await doc.getPage(i),
      h = pg.view[3];
    pages.push(h);
    const tc = await pg.getTextContent({ disableCombineTextItems: true });
    for (const it of tc.items) {
      for (const m of it.str.matchAll(/\{\{([^}]+)\}\}/g)) if (!(m[1] in marks)) marks[m[1]] = { p: i, y: h - it.transform[5], h };
      for (const m of it.str.matchAll(/\[\[([^\]]+)\]\]/g)) if (!(m[1] in marks)) marks["blk:" + m[1]] = { p: i, y: h - it.transform[5], h };
    }
  }
  return { marks, pageHeights: pages };
}

const TOL = 4; // points: two markers closer than this in height are on the same line

/** Group heights into lines: the number of distinct lines among [{p, y}] */
function lineCount(pts) {
  const s = pts.slice().sort((a, b) => a.p - b.p || a.y - b.y);
  let n = 0,
    last = null;
  for (const q of s) {
    if (!last || q.p !== last.p || q.y - last.y > TOL) n++;
    last = q;
  }
  return n;
}

/**
 * Judge the printout from the markers. Returns the numbers for the report and a list of findings,
 * each { kind, sid, text, … }.
 */
export function auditLines(lines, { marks, pageHeights }) {
  const find = [];
  const L = lines.map((ln) => {
    const pts = [];
    let broke = 0,
      missing = 0;
    for (let k = 0; k < ln.parts; k++) {
      const s = marks[ln.n + "." + k + ".s"],
        e = marks[ln.n + "." + k + ".e"];
      if (!s || !e) {
        missing++;
        continue;
      }
      pts.push(s, e);
      if (s.p !== e.p || Math.abs(s.y - e.y) > TOL) broke++;
    }
    const used = lineCount(pts),
      bottom = pts.reduce((m, q) => (q.p > m.p || (q.p === m.p && q.y > m.y) ? q : m), { p: 0, y: 0 });
    if (missing) find.push({ kind: "text missing from the PDF", sid: ln.sid, text: ln.text });
    if (broke) find.push({ kind: "line broken mid-phrase", sid: ln.sid, text: ln.text, lines: used });
    return { ...ln, used, broke, bottom };
  });
  // side by side: the two cells of a row should take the same number of lines
  let outOfStep = 0;
  const rows = {};
  for (const l of L) if (l.row >= 0) (rows[l.row] = rows[l.row] || []).push(l);
  for (const r of Object.values(rows)) {
    if (r.length !== 2) continue;
    const [a, b] = r;
    if (a.used !== b.used) {
      outOfStep++;
      const longer = a.used > b.used ? a : b;
      find.push({ kind: "side by side out of step", sid: a.sid, text: longer.text, lines: `${a.cell} ${a.used} / ${b.cell} ${b.used}` });
    }
  }
  // pages: how full each page is before a forced break inside a piece (a mostly empty page is wasted paper)
  const blk = Object.entries(marks).filter(([k]) => k.startsWith("blk:"));
  const byPiece = {};
  for (const [k, v] of blk) {
    const sid = k.slice(4).split(":")[0];
    (byPiece[sid] = byPiece[sid] || []).push(v);
  }
  const lowFill = [];
  for (const [sid, pts] of Object.entries(byPiece)) {
    const pgs = [...new Set(pts.map((q) => q.p))].sort((a, b) => a - b);
    pgs.slice(0, -1).forEach((p) => {
      const deepest = Math.max(...pts.filter((q) => q.p === p).map((q) => q.y));
      const fill = deepest / pageHeights[p - 1];
      if (fill < 0.45) {
        lowFill.push({ sid, page: p, fill: Math.round(fill * 100) });
        find.push({ kind: "page mostly empty before a page break", sid, text: `page ${p}: ${Math.round(fill * 100)}% used` });
      }
    });
  }
  const scales = L.filter((l) => l.scale < 0.995).map((l) => l.scale);
  return {
    lines: L.length,
    wrapped: L.filter((l) => l.used > l.segs).length,
    brokeMidPhrase: L.filter((l) => l.broke).length,
    missing: L.filter((l) => find.some((f) => f.kind === "text missing from the PDF" && f.text === l.text)).length,
    outOfStep,
    lowFill: lowFill.length,
    resized: scales.length,
    smallest: scales.length ? Math.round(Math.min(...scales) * 100) : 100,
    findings: find,
  };
}
