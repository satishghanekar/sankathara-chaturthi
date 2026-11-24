// The texts became files (slice 1). The proof that not a character changed: the site's own code
// (js/text/content.js) rebuilds, from content/library.json and content/texts/*.txt, an object
// identical to the old window.CONTENT, frozen as it was in tests/unit/fixtures/pieces.js (the old content/pieces.js,
// unchanged). Then the checks every text file must pass (listed once, its header's lines up to date, no Unicode
// normalisation), and the
// routine (content/routines.json), which names only texts of the Library.
import { describe, expect, test } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import vm from "node:vm";
import { parseText } from "../../js/text/format.js";
import { buildContent, PAGE_LANGUAGE, toPiece } from "../../js/text/content.js";
import { factsOf } from "../tools/texts.mjs";
import { CONTENT, FILES as files, IDS, LIBRARY, TEXTS, VERSION_IDS } from "../content-files.mjs";
import { menuWords } from "../../js/core/strings.js";
import { KINDS, kindOf, ofKind, SESSIONS, textsFor } from "../../js/core/routine.js";

const read = (p) => readFileSync(new URL("../../" + p, import.meta.url), "utf8");
const routines = JSON.parse(read("content/routines.json"));

// The old CONTENT, copied out of the vm context so it compares as plain objects
const win = {};
vm.runInNewContext(readFileSync(new URL("fixtures/pieces.js", import.meta.url), "utf8"), { window: win });
const OLD = JSON.parse(JSON.stringify(win.CONTENT));

const count = (s, re) => (s.match(re) || []).length;
// (the old file had groups, पूजा and आरती; the texts are now by category, as in Nitya Upasana)
const pieces = (C) => (C.categories || C.groups).flatMap((g) => g.pieces);
// The texts added since the old file, which the comparisons with it leave out (each is checked like every text below)
const ADDED = [
  "bhajan-vakratunda-mahakaya",
  "bhajan-ganapati-bappa-morya",
  "bhajan-vande-ganapati",
  "bhajan-ganesha-pancharatnam",
  "bhajan-gaiye-ganapati-jagvandan",
];
const migrated = (C) => ({ ...C, categories: (C.categories || C.groups).map((g) => ({ ...g, pieces: g.pieces.filter((p) => !ADDED.includes(p.text)) })) });
const allLines = (C) => pieces(C).flatMap((p) => [...(p.refrain ? p.refrain.lines : []), ...p.items.flatMap((i) => i.lines || [])]);

describe("CONTENT from the text files", () => {
  const C = migrated(CONTENT);
  // (each [note] is now marked as one, nt, which the old file did not have: Ghalin Lotangan's ↻ ३ वेळा, and each piece
  // carries its text's id, text, as in Nitya Upasana. The Dnyaneshwar and Vitthal Aartis' entries follow their files
  // as written in Nitya Upasana, 2026-10-28)
  // (nor a recording to hear under the credit, since 1.8.35: the Atharvashirsha's; and since 2026-11-15 a credit is
  // written by the site from content/credits.json, each person and source once: tests/unit/credits.test.mjs checks the
  // credits; nor the label of the switch between a text's versions, since 2026-11-15)
  const { version, ...ui } = C.ui; // eslint-disable-line no-unused-vars
  const SAME = {
    ui,
    pieces: pieces(C).map(({ text, credit, ...p }) => ({ ...p, items: p.items.map(({ nt, ...i }) => i) })), // eslint-disable-line no-unused-vars
  };
  const WAS = { ui: OLD.ui, pieces: pieces(OLD).map(({ credit, ...p }) => p) }; // eslint-disable-line no-unused-vars
  test("is identical to the old content/pieces.js: the same pieces, in the same order", () => {
    expect(SAME).toStrictEqual(WAS);
    // and in the same key order, so even the order the page meets things in is unchanged
    expect(JSON.stringify(SAME)).toBe(JSON.stringify(WAS));
  });
  // the page's sections: वैदिक मंत्र (was पूजा) with the Atharvashirsha, then आरती with the ten aartis (load.js leaves
  // out the categories with no texts, Stotra and Ashtak)
  test("the sections: Vedic Chant, then Aarti", () => {
    const shown = C.categories.filter((c) => c.pieces.length);
    expect(shown.map((c) => [c.id, c.name.en, c.pieces.length])).toEqual([
      ["vedic-chant", "Vedic Chant", 1],
      ["aarti", "Aarti", 10],
    ]);
    // and, since 2026-11-20, भजन with the Ganesh bhajans
    expect(CONTENT.categories.filter((c) => c.pieces.length).map((c) => [c.id, c.pieces.map((p) => p.text)])).toContainEqual(["bhajan", ADDED]);
    expect(shown.map((c) => c.pieces.map((p) => p.id))).toEqual(OLD.groups.map((g) => g.pieces.map((p) => p.id)));
  });
  // (60 <br>: the Vitthal Aarti's dhrupad breaks after its first half in English and at the top too, Satish 2026-10-23)
  test("the marks that matter are all there: 60 <br>, 156 zero-width spaces, svara marks", () => {
    const s = JSON.stringify(allLines(C));
    expect(count(s, /<br>/g)).toBe(60);
    expect(count(s, /​/g)).toBe(156);
    for (const m of [/॑/g, /॒/g, /᳚/g]) expect(count(s, m)).toBe(count(JSON.stringify(allLines(OLD)), m));
    expect(count(s, /॑/g)).toBeGreaterThan(0);
  });
  test.each(pieces(OLD).map((p, i) => [p.id, i]))("%s: every line identical", (id, i) => {
    const a = allLines({ groups: [{ pieces: [pieces(C)[i]] }] });
    const b = allLines({ groups: [{ pieces: [pieces(OLD)[i]] }] });
    expect(a.length).toBe(b.length);
    a.forEach((l, k) => expect(l).toStrictEqual(b[k]));
  });
  // [once] lines and [note]s before the dhrupad go above it (lead); [once] lines later stay where they are, with no
  // dhrupad after them; line ids follow the order shown
  test("every-verse: [once] lines before the dhrupad lead, later ones stand where they are", () => {
    const head = "id: x\ntitle: क\ntitle-en: K\nlanguage: mr\nrefrain: every-verse\n---\n";
    const t = parseText(head + "[once]\nक\nK\n\n[note: अ | a]\n\n[dhrupad]\nख\nKh\n\n[1]\nग\nG\n\n[once]\nघ\nGh\n");
    const p = toPiece(t, 1);
    expect(p.lead).toEqual([
      { kind: "dh", lines: [{ l: "x.1", mr: "क", en: "K" }] },
      { rmk: { mr: "अ", en: "a" }, nt: true },
    ]);
    expect(p.refrain.lines).toEqual([{ mr: "ख", en: "Kh" }]);
    expect(p.items.map((i) => i.kind || (i.rmk ? "rmk" : "stanza"))).toEqual(["stanza", "rmk", "rf", "dh"]);
    expect(p.items.flatMap((i) => (i.lines || []).map((l) => l.l))).toEqual(["x.2", "x.3", "x.4"]);
  });
  // a closing [dhrupad bold] in a text with a dhrupad: said once, bold, with no dhrupad after it
  test("every-verse: a closing [dhrupad bold] is said once, in bold", () => {
    const head = "id: x\ntitle: क\ntitle-en: K\nlanguage: mr\nrefrain: every-verse\n---\n";
    const p = toPiece(parseText(head + "[dhrupad]\nख\nKh\n\n[1]\nग\nG\n\n[dhrupad bold]\nघ\nGh\n"), 1);
    expect(p.items.map((i) => i.kind || (i.rmk ? "rmk" : "stanza"))).toEqual(["stanza", "rmk", "rf", "dh"]);
    expect(p.items[3]).toEqual({ kind: "dh", bold: true, lines: [{ l: "x.3", mr: "घ", en: "Gh" }] });
  });
  // who sings (2026-11-24): each line carries its singer, after rf, also in the dhrupad sung again after a stanza
  test("who sings: each line carries who sings it, the dhrupad sung again too", () => {
    const head = "id: x\ntitle: क\ntitle-en: K\nlanguage: mr\nrefrain: every-verse\n---\n";
    const p = toPiece(parseText(head + "[dhrupad]\n[lead]\nख\nKh\n[chorus]\nख\nKh\n\n[1]\n[lead]\nग\nG\n[together]\nघ\nGh\n"), 1);
    expect(p.items[0].lines).toEqual([
      { l: "x.1", who: "lead", mr: "ग", en: "G" },
      { l: "x.2", who: "together", mr: "घ", en: "Gh" },
    ]);
    expect(p.items[2].lines.map((l) => l.who)).toEqual(["lead", "chorus"]);
    expect(JSON.stringify(p.items[2].lines[0])).toBe('{"l":"x.3","rf":true,"who":"lead","mr":"ख","en":"Kh"}');
  });
  // with no dhrupad: [once] lines at the top go above the text (lead), later ones stand where they are
  test("no dhrupad: [once] lines at the top lead, later ones stand where they are", () => {
    const head = "id: x\ntitle: क\ntitle-en: K\nlanguage: sa\n---\n";
    const t = parseText(head + "[once]\nक\nK\n\n[1]\nग\nG\n\n[once]\nघ\nGh\n");
    const p = toPiece(t, 1);
    expect(p.lead).toEqual([{ kind: "dh", lines: [{ l: "x.1", mr: "क", en: "K" }] }]);
    expect(p.items.map((i) => i.kind || "stanza")).toEqual(["stanza", "dh"]);
    expect(p.items.flatMap((i) => i.lines.map((l) => l.l))).toEqual(["x.2", "x.3"]);
  });
  // layout: lines is a Vedic chant (prose: its font, its glued references, its printout) set line by line (lines)
  test("layout: lines is a Vedic chant set line by line", () => {
    const head = "id: x\ntitle: क\ntitle-en: K\nlanguage: sa\nlayout: lines\n---\n";
    const p = toPiece(parseText(head + "[1]\nक\nK\n"), 1);
    expect(p.prose).toBe(true);
    expect(p.cls).toBe("lines");
    expect(toPiece(parseText(head.replace("lines", "prose") + "[1]\nक\nK\n"), 1).cls).toBeUndefined();
  });
  test("a text missing from the files stops the build", () => {
    expect(() => buildContent(LIBRARY, { ...files, "aarti-sukhkarta": undefined })).toThrow("texts/aarti-sukhkarta.txt: not loaded");
  });
  // the page's language is written once in the code and once in index.html (<html lang>), and they agree: a text in it
  // carries no lang of its own, one in another language does (for screen readers and the fonts)
  test("the page's language is index.html's, and only a text in another language says its own", () => {
    const html = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
    expect(/<html lang="([^"]+)"/.exec(html)[1]).toBe(PAGE_LANGUAGE);
    expect(CONTENT.pageLanguage).toBe(PAGE_LANGUAGE);
    const head = (l) => "id: x\ntitle: क\ntitle-en: K\nlanguage: " + l + "\n---\n[1]\nक\nK\n";
    expect(toPiece(parseText(head(PAGE_LANGUAGE)), 1).lang).toBeUndefined();
    expect(toPiece(parseText(head("sa")), 1).lang).toBe("sa");
  });
});

describe("content checks", () => {
  // library.json and the text files are written exactly as in Nitya Upasana, so a text can be copied from
  // one site to the other as it is (so is content/routines.json, with this site's one session)
  test("library.json has Nitya Upasana's shape: the categories with their texts", () => {
    expect(Object.keys(LIBRARY)).toEqual(["categories"]);
    for (const c of LIBRARY.categories) expect(Object.keys(c)).toEqual(["id", "name", "texts"]);
  });
  test("every text's id, and so its file name, starts with the category the library lists it in", () => {
    for (const t of TEXTS) expect(t.id.startsWith(t.category + "-"), t.id).toBe(true);
  });
  const names = readdirSync(new URL("../../content/texts/", import.meta.url)).filter((f) => !f.startsWith("."));
  test("library.json lists every file in content/texts/, once: in a category, or as another version of a text", () => {
    const all = IDS.concat(VERSION_IDS);
    expect([...all].sort()).toEqual(names.map((f) => f.replace(/\.txt$/, "")).sort());
    expect(new Set(all).size).toBe(all.length);
  });
  // the routine, as Nitya Upasana's: its sessions (Morning, Afternoon, Evening; a session not in it is not shown) list
  // texts of the Library, in the order they are read (js/features/session-card.js), which need not be the Library's
  test("the routine's sessions name only texts in library.json, each once", () => {
    for (const s of Object.keys(routines)) expect(SESSIONS).toContain(s);
    const ids = new Set(IDS);
    for (const s of SESSIONS)
      for (let d = 0; d < 7; d++) {
        const got = textsFor(routines, d, s);
        for (const id of got) expect(ids.has(id), s + ": " + id).toBe(true);
        const raw = routines[s] && routines[s].mode === "fixed" ? routines[s].texts : [];
        expect(raw.length, s).toBe(got.length);
      }
  });
  // Home's tabs (Satish, 2026-11-22): All, Pooja, Bhajan, Aarti over the evening's one list, each text's tab from its
  // Library category, so the routine is never split; every text of the evening is on exactly one of the three
  test("the evening's texts fall into Pooja, Bhajan and Aarti by their Library category, in the evening's order", () => {
    expect(KINDS).toEqual(["all", "pooja", "bhajan", "aarti"]);
    expect([kindOf("vedic-chant"), kindOf("stotra"), kindOf("ashtak"), kindOf("bhajan"), kindOf("aarti")]).toEqual([
      "pooja",
      "pooja",
      "pooja",
      "bhajan",
      "aarti",
    ]);
    const kinds = {};
    for (const c of LIBRARY.categories) for (const id of c.texts) kinds[id] = kindOf(c.id);
    const evening = textsFor(routines, 5, "evening");
    expect(ofKind(evening, kinds, "all")).toEqual(evening);
    expect(ofKind(evening, kinds, "pooja")).toEqual(["vedic-chant-atharvashirsha"]);
    expect(ofKind(evening, kinds, "bhajan")).toHaveLength(5);
    expect(ofKind(evening, kinds, "aarti")[0]).toBe("aarti-sukhkarta");
    expect(["pooja", "bhajan", "aarti"].reduce((n, k) => n + ofKind(evening, kinds, k).length, 0)).toBe(evening.length);
  });
  // Everything about a text is in its own file (Satish, 2026-11-15): its header's lines are written by npm run texts
  // from the text itself; edit a text and forget it, and this names the file
  test.each(IDS.concat(VERSION_IDS).map((id) => [id]))("%s: its header's lines are up to date (npm run texts)", (id) => {
    const t = parseText(files[id], id + ".txt");
    const f = factsOf(files[id], id + ".txt");
    expect(t.lines).toBe(f.lines);
    // (an app without times, as this one, does not count letters)
    if (f.letters !== undefined) expect(t.letters).toBe(f.letters);
    // its language named in the site's words, in every menu language (js/strings/, "text")
    for (const l of ["mr", "en", "kn", "te", "gu"]) expect(menuWords("text", l).lang[t.language], l).toBeTruthy();
  });
  test.each(IDS.concat(VERSION_IDS).map((id) => [id]))("%s is not changed by Unicode normalisation", (id) => {
    const raw = files[id];
    expect(raw === raw.normalize("NFC")).toBe(true);
  });
  test("categories: Vedic Chant, Aarti, Stotra, Ashtak", () => {
    expect(LIBRARY.categories.map((c) => c.id)).toEqual(["vedic-chant", "aarti", "stotra", "ashtak", "bhajan"]);
  });
});

// The Atharvashirsha's recording, as in Nitya Upasana (the same text word for word): the Challakere Brothers'
// Rudradhyaya video from 1:30, after the album's invocation
test("the Atharvashirsha links its recording, from where the text starts", () => {
  expect(parseText(files["vedic-chant-atharvashirsha"], "a").recording).toBe("[Challakere Brothers](https://www.youtube.com/watch?v=OQhyYdoKW1k&t=90)");
});

// Jagjit Singh's Gaiye Ganapati from 0:15, where the singing starts (Viveka heard it there; Satish confirmed, 2026-11-23)
test("Gaiye Ganapati links its recording, from where the singing starts", () => {
  expect(parseText(files["bhajan-gaiye-ganapati-jagvandan"], "g").recording).toMatch(/aASYnk-eaXI&t=15\)$/);
});
