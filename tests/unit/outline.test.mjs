// Go to's outline (js/text/outline.js): every text's places, kept as a snapshot so a change in a text's structure shows
// in review; and where a position is, the verse a reader types, a session's places.
import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { buildContent } from "../../js/text/content.js";
import { outline } from "../../js/text/outline.js";

const read = (p) => readFileSync(new URL("../../" + p, import.meta.url), "utf8");
const lib = JSON.parse(read("content/library.json"));
const C = buildContent(lib, Object.fromEntries(lib.texts.map((t) => [t.id, read("content/" + t.file)])), JSON.parse(read("content/categories.json")));
const pieces = C.categories.flatMap((c) => c.pieces);
const piece = (id) => pieces.find((p) => p.text === id);
const of = (id) => outline(piece(id), C.outline);

/** An outline as lines of text: each place, indented under the one it is in, and the text's verses in short */
function written(o) {
  const out = [];
  const walk = (ps, d) =>
    ps.forEach((p) => {
      out.push("  ".repeat(d) + `${p.kind} ${p.key}: ${p.label.mr} / ${p.label.en} @ ${p.line}`);
      if (p.kids) walk(p.kids, d + 1);
    });
  walk(o.places, 1);
  const v = o.verses;
  out.push(`  ${v.length} verses: ${v[0].n.en} … ${v.at(-1).n.en}`);
  return out.join("\n");
}

test("every text's outline, or none for a short text", async () => {
  const all = pieces
    .map((p) => {
      const o = outline(p, C.outline);
      return o ? `${p.text}\n${written(o)}` : `${p.text}: none`;
    })
    .join("\n");
  await expect(all + "\n").toMatchFileSnapshot("__snapshots__/outlines.txt");
});

test("the thresholds come from content/library.json, and a short aarti has none", () => {
  expect(C.outline).toEqual({ minLines: 60, group: 25 });
  expect(outline(piece("aarti-sukhkarta"), C.outline)).toBeNull();
});

test("the Atharvashirsha's parts, by number", () => {
  expect(of("vedic-chant-atharvashirsha").places.map((p) => p.label.en)).toEqual(["1", "2", "3", "4", "5"]);
});
