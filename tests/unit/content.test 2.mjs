// The texts became files (slice 1). The proof that not a character changed: the site's own code
// (js/text/content.js) rebuilds, from content/library.json and content/texts/*.txt, an object identical to the
// old window.CONTENT, frozen as it was in tests/unit/fixtures/pieces.js (the old content/pieces.js, unchanged).
// Then the checks every text file must pass (the same list, ids, categories, no Unicode normalisation).
import { describe, expect, test } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import vm from "node:vm";
import { parseText } from "../../js/text/format.js";
import { buildContent, toPiece } from "../../js/text/content.js";

const read = (p) => readFileSync(new URL("../../" + p, import.meta.url), "utf8");
const lib = JSON.parse(read("content/library.json"));
const categories = JSON.parse(read("content/categories.json"));
const groups = JSON.parse(read("content/groups.json"));
const files = Object.fromEntries(lib.texts.map((t) => [t.id, read("content/" + t.file)]));

// The old CONTENT, copied out of the vm context so it compares as plain objects
const win = {};
vm.runInNewContext(readFileSync(new URL("fixtures/pieces.js", import.meta.url), "utf8"), { window: win });
const OLD = JSON.parse(JSON.stringify(win.CONTENT));

const count = (s, re) => (s.match(re) || []).length;
const pieces = (C) => C.groups.flatMap((g) => g.pieces);
const allLines = (C) => pieces(C).flatMap((p) => [...(p.refrain ? p.refrain.lines : []), ...p.items.flatMap((i) => i.lines || [])]);

describe("CONTENT from the text files", () => {
  const C = buildContent(lib, files, groups);
  // (each [note] is now marked as one, nt, which the old file did not have: Ghalin Lotangan's ↻ ३ वेळा. The
  // Dnyaneshwar and Vitthal Aartis' entries follow their files as written in Nitya Upasana, 2026-10-28)
  const SAME = { ...C, groups: C.groups.map((g) => ({ ...g, pieces: g.pieces.map((p) => ({ ...p, items: p.items.map(({ nt, ...i }) => i) })) })) }; // eslint-disable-line no-unused-vars
  test("is identical to the old content/pieces.js", () => {
    expect(SAME).toStrictEqual(OLD);
    // and in the same key order, so even the order the page meets things in is unchanged
    expect(JSON.stringify(SAME)).toBe(JSON.stringify(OLD));
  });
  // (60 <br>: the Vitthal Aarti's dhrupad breaks after its first half in English and at the top too, Satish 2026-10-23)
  test("the marks that matter are all there: 60 <br>, 42 zero-width spaces, svara marks", () => {
    const s = JSON.stringify(allLines(C));
    expect(count(s, /<br>/g)).toBe(60);
    expect(count(s, /​/g)).toBe(42);
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
    const head = "id: x\ntitle: क\ntitle-en: K\ncategory: aarti\nlanguage: mr\nrefrain: every-verse\n---\n";
    const t = parseText(head + "[once]\nक\nK\n\n[note: अ | a]\n\n[dhrupad]\nख\nKh\n\n[1]\nग\nG\n\n[once]\nघ\nGh\n");
    const p = toPiece(t, 1, lib);
    expect(p.lead).toEqual([{ kind: "dh", lines: [{ l: "x.1", mr: "क", en: "K" }] }, { rmk: { mr: "अ", en: "a" }, nt: true }]);
    expect(p.refrain.lines).toEqual([{ mr: "ख", en: "Kh" }]);
    expect(p.items.map((i) => i.kind || (i.rmk ? "rmk" : "stanza"))).toEqual(["stanza", "rmk", "rf", "dh"]);
    expect(p.items.flatMap((i) => (i.lines || []).map((l) => l.l))).toEqual(["x.2", "x.3", "x.4"]);
  });
  // with no dhrupad: [once] lines at the top go above the text (lead), later ones stand where they are
  test("no dhrupad: [once] lines at the top lead, later ones stand where they are", () => {
    const head = "id: x\ntitle: क\ntitle-en: K\ncategory: aarti\nlanguage: sa\n---\n";
    const t = parseText(head + "[once]\nक\nK\n\n[1]\nग\nG\n\n[once]\nघ\nGh\n");
    const p = toPiece(t, 1, lib);
    expect(p.lead).toEqual([{ kind: "dh", lines: [{ l: "x.1", mr: "क", en: "K" }] }]);
    expect(p.items.map((i) => i.kind || "stanza")).toEqual(["stanza", "dh"]);
    expect(p.items.flatMap((i) => i.lines.map((l) => l.l))).toEqual(["x.2", "x.3"]);
  });
  test("a text missing from the files stops the build", () => {
    expect(() => buildContent(lib, { ...files, "aarti-sukhkarta": undefined }, groups)).toThrow("texts/aarti-sukhkarta.txt: not loaded");
  });
});

describe("content checks", () => {
  // library.json, categories.json and the text files are written exactly as in Nitya Upasana, so a text can be
  // copied from one site to the other as it is (this site's own choice of texts and their order is content/groups.json)
  test("library.json has Nitya Upasana's shape: the same parts, each text's entry the same fields", () => {
    expect(Object.keys(lib)).toEqual(["texts", "pageLanguage", "languages", "refrain", "ui", "wiki"]);
    for (const t of lib.texts) expect(Object.keys(t)).toEqual(["id", "file", "title", "titleEn", "category", "language", "lines"]);
  });
  test("every text's id, and so its file name, starts with its category", () => {
    for (const t of lib.texts) expect(t.id.startsWith(t.category + "-"), t.id).toBe(true);
  });
  const names = readdirSync(new URL("../../content/texts/", import.meta.url)).filter((f) => !f.startsWith("."));
  test("library.json lists every file in content/texts/, once", () => {
    expect(lib.texts.map((t) => t.file).sort()).toEqual(names.map((f) => "texts/" + f).sort());
    expect(new Set(lib.texts.map((t) => t.id)).size).toBe(lib.texts.length);
  });
  test("every text is in exactly one group", () => {
    expect(groups.flatMap((g) => g.texts).sort()).toEqual(lib.texts.map((t) => t.id).sort());
  });
  test.each(lib.texts.map((t) => [t.id, t]))("%s: library.json agrees with the file", (id, entry) => {
    const t = parseText(files[id], entry.file);
    expect(entry).toEqual({
      id: t.id,
      file: "texts/" + t.id + ".txt",
      title: t.title,
      titleEn: t.titleEn,
      category: t.category,
      language: t.language,
      lines: t.blocks.reduce((a, b) => a + b.lines.length, 0),
    });
    expect(categories.map((c) => c.id)).toContain(t.category);
    expect(lib.languages[t.language]).toBeTruthy();
  });
  test.each(lib.texts.map((t) => [t.file]))("%s is not changed by Unicode normalisation", (f) => {
    const raw = files[f.slice(6, -4)];
    expect(raw === raw.normalize("NFC")).toBe(true);
  });
  test("categories: Vedic Chant, Aarti, Stotra, Ashtak", () => {
    expect(categories.map((c) => c.id)).toEqual(["vedic-chant", "aarti", "stotra", "ashtak"]);
  });
});
