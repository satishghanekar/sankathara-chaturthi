// Builds the HTML of every piece from the text in content/pieces.js.
// index.html calls it while the page is loading, at the place the pieces belong, so the page
// the rest of the script sees is the same as when the pieces were written into index.html.
// Each line keeps its two languages side by side in the data; this file decides how they are shown.
(function () {
  "use strict";
  var ICON_PREV = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  var ICON_NEXT = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
  var ICON_FOLD = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>';
  var LOTUS = '<div class="fin" aria-hidden="true"><svg viewBox="0 0 160 28" width="160" height="28" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 20H56"/><path d="M104 20H152"/><circle cx="62" cy="20" r="1.4" fill="currentColor" stroke="none"/><circle cx="98" cy="20" r="1.4" fill="currentColor" stroke="none"/><path d="M80 4C75 9 74.5 15 80 21C85.5 15 85 9 80 4Z"/><path d="M80 21C73 20 68.5 15.5 67.5 10.5C73 11.5 77.5 15 80 21Z"/><path d="M80 21C87 20 91.5 15.5 92.5 10.5C87 11.5 82.5 15 80 21Z"/><path d="M70 22.5C74 24.5 86 24.5 90 22.5"/></svg></div>';
  var PNQ = '<div class="pnq"><a class="pnh" href="./" aria-label="Home: contents"><svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.6 5.5c.5-1.9 1.8-3.1 3.4-3.7 1.6.6 2.9 1.8 3.4 3.7"/><path d="M8.4 5.6h7.2"/><path d="M8.4 5.6c-.4 3.6.6 6.3 2.4 7.4.1 3.3 0 6.3 1.9 7.6 1.6 1 3.5 0 3.2-1.8-.2-1-1.3-1.3-1.8-.6"/><path d="M15.6 5.6c.4 3.6-.6 6.2-2.6 7.2"/><path d="M8.4 5.6C5.6 4.5 2.4 6 2.8 9.6c.3 2.6 2.4 3.7 4.8 3"/><path d="M15.6 5.6c2.8-1.1 6 .4 5.6 4-.3 2.6-2.4 3.7-4.8 3"/><path d="M12 7v1.8"/><path d="M9.3 13.6l-.9 1.6"/></svg></a><button type="button" class="pns" aria-label="Contents and search" aria-expanded="false"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h14M4 11h8M4 16h5"/><circle cx="16" cy="15.5" r="3.6"/><path d="M18.6 18.1l2.6 2.6"/></svg></button></div>';

  // A pair of spans: the original text, then English
  function two(t) {
    return '<span class="mr">' + t.mr + '</span><span class="en" lang="en">' + t.en + "</span>";
  }
  function lines(list, lang, pad) {
    return list
      .map(function (x) {
        return pad + "<p" + (x.rf ? ' class="rf"' : "") + (x.l ? ' data-l="' + x.l + '"' : "") + ">" + x[lang] + "</p>\n";
      })
      .join("");
  }
  function verse(list, pad, bold) {
    return (
      pad + '<div class="verse' + (bold ? " bold" : "") + '">\n' +
      pad + '  <div class="mr">\n' + lines(list, "mr", pad + "    ") + pad + "  </div>\n" +
      pad + '  <div class="en" lang="en">\n' + lines(list, "en", pad + "    ") + pad + "  </div>\n" +
      pad + "</div>\n"
    );
  }
  function item(x) {
    if (x.rmk) return '      <div class="rmk"><span class="mr">' + x.rmk.mr + '</span><span class="en" lang="en"><i class="ra">↻ </i>' + x.rmk.en + "</span></div>\n";
    return '      <div class="item' + (x.kind ? " " + x.kind : "") + '">\n' + verse(x.lines, "        ", x.bold) + "      </div>\n";
  }
  function navLink(cls, p, label, iconFirst) {
    if (!p) return "      <span></span>\n";
    var small = iconFirst ? ICON_PREV + two(label) : two(label) + ICON_NEXT;
    return '      <a class="' + cls + '" href="#' + p.id + '" data-go="' + p.id + '"><small>' + small + "</small>" + two(p.title) + "</a>\n";
  }
  function piece(p, prev, next, ui) {
    var h =
      '  <section id="' + p.id + '" class="ash' + (p.cls ? " " + p.cls : "") + '"' + (p.lang ? ' lang="' + p.lang + '"' : "") + ">\n" +
      "    <header>\n" +
      '      <h2><span class="no"><span class="nm">' + p.no.mr + '</span><span class="ne">' + p.no.en + "</span></span> " + two(p.title) + "</h2>\n" +
      '      <div class="tag">' + two(p.tag) + "</div>\n" +
      "    </header>\n";
    if (p.refrain)
      h += '    <div class="rftop">\n      <div class="lab">' + two(p.refrain.label) + "</div>\n" + verse(p.refrain.lines, "      ") + "    </div>\n";
    h += '    <div class="items">\n' + p.items.map(item).join("") + "    </div>\n";
    h += "    " + LOTUS + "\n";
    h += '    <div class="cr">' + p.credit + "</div>\n";
    h += '    <nav class="pn">\n' + navLink("prev", prev, ui.prev, true) + "      " + PNQ + "\n" + navLink("next", next, ui.next, false) + "    </nav>\n";
    return h + "  </section>\n";
  }
  function group(g) {
    return '  <div class="grp" id="' + g.id + '"><button type="button" id="' + g.btn + '" aria-expanded="true" aria-label="' + g.aria + '">' + two(g.name) + ICON_FOLD + "</button></div>\n";
  }

  // ---- The same words in another Indian script (Settings → Main language → ಕನ್ನಡ) ----
  // The text is written once, in Devanagari. Kannada letters sit at the same place in their Unicode block, 0x380
  // further on, so each letter moves across one for one. A few signs have no Kannada twin: the dandas and the Vedic
  // accent marks stay as they are (Kannada books use them too), ॐ is written ಓಂ, and the Marathi eyelash ऱ and the
  // ॅ of English words (टॅब, tab) take their usual Kannada spelling. The choice is read from the saved settings
  // here, before the page script runs, so every later step (search, English spelling, printing) sees the new text.
  // To add another script, give it an entry in SCRIPTS.
  var SCRIPTS = {
    kn: { off: 0x380, sp: { "ॐ": "ಓಂ", "ऱ": "ರ", "ॅ": "್ಯಾ", "ॉ": "ಾ", "ऑ": "ಆ", "ॲ": "ಅ" }, back: [[/ಓಂ(?![ಀ-೿])/g, "ॐ"]] },
  };
  var KEEP = /[॒॑।॥]/;
  var ind = "";
  try {
    ind = (JSON.parse(localStorage.getItem("aarti2-prefs") || "{}").ind || "");
  } catch (e) {}
  var S = SCRIPTS[ind];
  window.SCR = {
    k: S ? ind : "", // "" while the text is shown as written
    // Devanagari → the chosen script
    to: function (t) {
      return !S ? t : t.replace(/[ऀ-ॿ]/g, function (c) {
        return S.sp[c] || (KEEP.test(c) ? c : String.fromCharCode(c.charCodeAt(0) + S.off));
      });
    },
    // and back, for the English spelling (IAST) and search
    from: function (t) {
      if (!S) return t;
      S.back.forEach(function (b) { t = t.replace(b[0], b[1]); });
      var lo = 0x900 + S.off, hi = lo + 0x7f;
      return t.replace(/[ঀ-෿]/g, function (c) {
        var n = c.charCodeAt(0);
        return n >= lo && n <= hi ? String.fromCharCode(n - S.off) : c;
      });
    },
    // Rewrite the text (and its tooltips) in the pieces, their group rows, the home contents and the site's name
    page: function () {
      if (!S) return;
      document.documentElement.setAttribute("data-scr", ind);
      [].forEach.call(document.querySelectorAll(".grp, .ash, #home .tocg, #tfr, #home .hl1, #home h1, #btt"), function (r) {
        var w = document.createTreeWalker(r, NodeFilter.SHOW_TEXT), n;
        while ((n = w.nextNode())) if (/[ऀ-ॿ]/.test(n.data)) n.data = SCR.to(n.data);
        [].forEach.call(r.querySelectorAll("[title], [aria-label]"), function (e) {
          ["title", "aria-label"].forEach(function (a) {
            var v = e.getAttribute(a);
            if (v && /[ऀ-ॿ]/.test(v)) e.setAttribute(a, SCR.to(v));
          });
        });
        // the language of the text, for screen readers (the English parts keep lang="en")
        if (r.matches(".ash[lang]")) r.lang = ind;
        [].forEach.call(r.querySelectorAll(".mr, .ash [lang]:not([lang='en'])"), function (e) {
          e.lang = ind;
        });
      });
    },
  };

  // The whole run of groups and pieces, in reading order
  window.renderPieces = function (C) {
    var all = [];
    C.groups.forEach(function (g) {
      g.pieces.forEach(function (p) { all.push(p); });
    });
    var h = "", i = 0;
    C.groups.forEach(function (g) {
      h += group(g);
      g.pieces.forEach(function (p) {
        h += piece(p, all[i - 1], all[i + 1], C.ui);
        i++;
      });
    });
    return h;
  };
})();
