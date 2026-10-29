// Settings page: languages
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { P, change } from "../core/state.js";
import { refit } from "../text/autofit.js";
import { LANGS, LK, cur, pn } from "../core/apply.js";
import { apply } from "./bars.js";
import { trPick } from "./settings-panel.js";
import { buildIX } from "../text/search.js";
import { refToggle } from "./dhrupad-button.js";

var PICK,
  spH; // the preview as last built

export function init() {
  // The language lists: each language once, English twice (one per spelling), and None for the second language.
  // A pick is "mr", "kn", "en:simple" or "en:iast".
  PICK = ["mr", "en:simple", "en:iast", "kn"];
  document.getElementById("sl1s").onchange = function () {
    spPick(1, this.value);
  };
  document.getElementById("sl2s").onchange = function () {
    spPick(2, this.value);
  };
  // Show: the main language, the second or both, as Language in the Aa sheet does
  document.getElementById("slw").onclick = function (e) {
    var b = e.target.closest("button");
    if (!b || b.dataset.v === P.lang) return;
    var c = cur();
    change({ lang: b.dataset.v }, apply);
    if (c) c.scrollIntoView();
  };
  document.getElementById("srf").onclick = function (e) {
    var b = e.target.closest("button");
    if (b && b.dataset.v !== String(P.ref)) refToggle();
  };
}

// Show the settings that depend on the language choice
export function spSet() {
  var v1 = document.getElementById("sl1v"),
    v2 = document.getElementById("sl2v");
  var k1 = spKey(P.lead),
    k2 = P.l2 ? spKey(P.l2) : "";
  v1.textContent = spName(k1);
  v1.lang = LK(P.lead);
  v2.textContent = spName(k2);
  v2.lang = P.l2 ? LK(P.l2) : P.ui;
  spOpts(document.getElementById("sl1s"), PICK, k1, function () {
    return false;
  });
  // the second language can't be the main one, nor (for now) a second Indian language beside it
  spOpts(document.getElementById("sl2s"), PICK.concat([""]), k2, function (k) {
    var l = k.split(":")[0];
    return l === LK(P.lead) || (l !== "en" && k && P.lead !== "en");
  });
  // menus are in English or the main language, so with English as the main language there is nothing to pick
  // (nor with Kannada, which has no menus of its own yet)
  document.getElementById("surow").hidden = LK(P.lead) !== "mr";
  // Show: one button per language and Both, named in their own language (as in the Aa sheet)
  document.getElementById("slwrow").hidden = !P.l2;
  document.getElementById("slw").innerHTML = P.l2
    ? [P.lead, P.l2, "both"]
        .map(function (v) {
          var l = v === "both" ? P.ui : LK(v),
            t = v === "both" ? (P.ui === "mr" ? "दोन्ही" : "Both") : LANGS[LK(v)].n;
          return '<button type="button" data-v="' + v + '" lang="' + l + '" aria-pressed="' + (v === P.lang) + '">' + t + "</button>";
        })
        .join("")
    : "";
  [].forEach.call(document.querySelectorAll("#srf button"), function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.v === String(P.ref)));
  });
  if (pn.hidden) return; // the rest is the preview, made when Settings is open
  // Preview: the Ganapati aarti as the page shows it, main language large and second small under each line: the
  // first line of verses 1 and 2, with the dhrupad (tinted) where Settings → Dhrupad puts it. Once: on top, with
  // ↻ ध्रुपद under each verse; Every verse: after each verse. Both layouts are always here and the CSS shows one
  // (data-ref on the root), sliding the dhrupad in and out, so a tap on Once / Every verse changes it at once.
  // Size, font and line spacing come from the CSS (.sp-p1 / .sp-p2 in css/09-settings-page.css, which follow the
  // same text size and font as the pieces), so A−, A+, reset and the font buttons change it at once too.
  var line = function (l, cls, el) {
    var p = el && el.querySelector("." + l + " p");
    if (!p) return "";
    // a danda never starts a line
    return '<div class="' + cls + '" lang="' + LK(l) + '"><p>' + p.innerHTML.replace(/ ([।॥|])/g, "\u00a0$1") + "</p></div>";
  };
  var unit = function (el, cls) {
    return '<div class="sp-u' + (cls || "") + '">' + line(P.lead, "sp-p1", el) + (P.l2 ? line(P.l2, "sp-p2", el) : "") + "</div>";
  };
  // a part that comes and goes with the setting (sp-once: shown with Once; sp-every: with Every verse)
  var tg = function (when, html) {
    return '<div class="sp-tg ' + when + '"><div>' + html + "</div></div>";
  };
  var rf = document.querySelector("#a1 .rftop .verse"),
    vs = document.querySelectorAll("#a1 .items .item:not(.rf) .verse"),
    mk = document.querySelector("#a1 .rmk ." + P.lead),
    lab = document.querySelector("#a1 .rftop .lab ." + P.lead),
    mark = mk ? '<div class="sp-rmk" lang="' + LK(P.lead) + '">' + mk.textContent + "</div>" : "",
    refrain = unit(rf, " sp-rf");
  var h =
    '<div class="sp-pw' + (P.l2 ? "" : " sp-one") + '">' +
    tg("sp-once", (lab ? '<div class="sp-lab" lang="' + LK(P.lead) + '">' + lab.textContent.replace(/\s*\(.*\)\s*$/, "") + "</div>" : "") + refrain) +
    unit(vs[0]) +
    tg("sp-once", mark) +
    tg("sp-every", refrain) +
    unit(vs[1]) +
    tg("sp-once", mark) +
    tg("sp-every", refrain) +
    "</div>";
  // rebuilt only when it differs, so a tap on Once / Every verse leaves it in place and the dhrupad can slide
  if (h !== spH) document.getElementById("sprev").innerHTML = spH = h;
}

function spKey(slot) {
  return LK(slot) === "en" ? "en:" + P.tr : LK(slot);
}

function spName(k) {
  if (!k) return P.ui === "mr" ? "काहीही नाही" : "None";
  var l = k.split(":");
  return LANGS[l[0]].n + (l[1] ? " · " + (l[1] === "iast" ? "sukhakartā" : "Sukhkarta") : "");
}

function spOpts(sel, ks, cur, off) {
  sel.innerHTML = ks
    .map(function (k) {
      return '<option value="' + k + '"' + (k === cur ? " selected" : "") + (off(k) ? " disabled" : "") + ">" + spName(k) + "</option>";
    })
    .join("");
  sel.value = cur;
}

// w: 1 main, 2 second
function spPick(w, k) {
  var c = cur(),
    // keep showing the same thing: the main language, the second, or both
    role = P.lang === "both" ? 3 : P.lang === P.lead ? 1 : 2,
    l = k.split(":"),
    v = l[0];
  if (l[1] && l[1] !== P.tr) trPick(l[1]);
  // Marathi and Kannada share the original's place: switching between them rewrites the text in place
  var ind = v === "en" || !v ? P.ind : v;
  v = v === "en" || !v ? v : "mr";
  var lead = P.lead,
    l2 = P.l2;
  if (w === 1) {
    if (v === l2) l2 = lead;
    lead = v;
  } else l2 = v;
  /** @type {Record<string, any>} */
  var ch = { lead: lead, l2: l2, lang: !l2 || role === 1 ? lead : role === 2 ? l2 : "both" };
  if (lead === "en" || ind !== "mr") ch.ui = "en";
  var sw = ind !== P.ind;
  if (sw) ch.ind = ind;
  change(ch, function () {
    if (sw) {
      SCR.set(ind);
      buildIX();
    }
    apply();
  });
  if (sw) refit(); // Kannada lines are wider or narrower than Marathi ones
  if (c) c.scrollIntoView();
}
