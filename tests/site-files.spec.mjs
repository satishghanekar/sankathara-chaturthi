// The file list in js/parts.js is shared by the page ("Check for updates") and the service worker (the
// offline copy), but the page itself loads files from its own <link> and <script> tags. These checks keep
// the two in step, so a new style or script file is never missing from the offline copy.
// Also the size budget: what a first visit downloads.
import { test, expect } from "@playwright/test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { siteParts } from "./helpers.mjs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const parts = siteParts();

test("index.html loads the styles listed in js/parts.js, in the same order", () => {
  const links = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => m[1]);
  expect(links).toEqual(parts.css);
});

test("index.html loads the scripts listed in js/parts.js, in the same order", () => {
  const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  expect(scripts).toEqual(parts.scripts);
  const modules = [...html.matchAll(/<script type="module" src="([^"]+)"><\/script>/g)].map((m) => m[1]);
  expect(modules).toEqual(["js/main.js"]);
  const preload = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map((m) => m[1]);
  expect(preload, "modulepreload links").toEqual(parts.modules);
});

test("js/parts.js lists every part of the site script, and main.js imports each one", () => {
  const files = ["core", "text", "features", "print", "store", "strings"].flatMap((d) =>
    readdirSync(new URL(`../js/${d}/`, import.meta.url))
      .filter((f) => f.endsWith(".js"))
      .map((f) => `js/${d}/${f}`),
  );
  expect([...parts.modules].sort()).toEqual(["js/main.js", ...files].sort());
  const main = readFileSync(new URL("../js/main.js", import.meta.url), "utf8");
  const imported = [...main.matchAll(/from "\.\/([^"]+)"/g)].map((m) => "js/" + m[1]);
  // every part with start-up work is imported by main.js (the others are imported by the parts that use them)
  for (const f of imported) expect(parts.modules).toContain(f);
});

test("every file in js/parts.js exists", () => {
  const missing = [...parts.css, ...parts.scripts, ...parts.modules, ...parts.content, ...parts.fonts, ...parts.images].filter(
    (f) => !existsSync(new URL("../" + f, import.meta.url)),
  );
  expect(missing).toEqual([]);
});

test("js/parts.js lists the texts in content/library.json, so every text is kept for offline use", () => {
  const lib = JSON.parse(readFileSync(new URL("../content/library.json", import.meta.url), "utf8"));
  expect(parts.content).toEqual(["content/library.json", "content/categories.json", "content/routines.json", ...lib.texts.map((t) => "content/" + t.file)]);
  for (const f of parts.content) expect(parts.all).toContain(f);
});

test("js/parts.js keeps every picture the page shows for offline use", () => {
  // the pictures and icons named in index.html (link previews' https addresses aside)
  const named = [...html.matchAll(/(?:src|href|data-src)="([^":]+\.(?:png|webp))"/g)].map((m) => m[1]);
  expect(named.length).toBeGreaterThan(3);
  for (const f of named) expect(parts.images).toContain(f);
  // the manifest's app icons exist
  const manifest = JSON.parse(readFileSync(new URL("../manifest.json", import.meta.url), "utf8"));
  for (const i of manifest.icons) expect(existsSync(new URL("../" + i.src, import.meta.url)), i.src).toBe(true);
});

// What a first visit downloads, compressed as a server sends it (gzip, file by file). Each limit is a little above the
// size when it was set, so the site can't grow by much unnoticed: when a change needs more, raise the limit in the same
// change and say why. (Set 2026-10-29: scripts 138 KB, styles 49 KB, index.html 19 KB. Then the menu words moved to
// js/strings/ in both languages: scripts 145 KB, index.html 18 KB. Scripts raised 2026-10-30 to 170 KB for the
// Kannada, Telugu and Gujarati menus, js/strings/kn.js, te.js and gu.js: 163 KB then. Raised 2026-10-30 to 185 KB for
// the month line on the date card, js/core/panchang.js and panchang-names.js from Nitya Upasana: 178 KB then. Raised
// 2026-10-31 to 195 KB for the Print pop-up's hints and page count in five languages, js/print/pages.js: 189.2 KB
// then; 200 KB since 2026-11-10: the JSDoc types the type checks need, in every script: 196.8 KB then. Styles
// raised 2026-10-30 to 55 KB for More dates a row a year on iPads and beside the card on desktops: 52.3 KB then; on
// 2026-10-31 to 58 KB for Nitya Upasana's three text fonts (their faces in every script, Bold's weights): 55.2 KB then.
// index.html raised 2026-11-01 to 22 KB, as it had reached 20.0 KB as CI's Node 22 compresses it (some 70 bytes more
// than Node 25 on a Mac).)
test("the scripts, styles and page stay within their size budget", () => {
  const parts = siteParts();
  const gz = (files) => files.reduce((n, f) => n + gzipSync(readFileSync(new URL("../" + f, import.meta.url))).length, 0);
  expect(gz([...parts.scripts, ...parts.modules]), "scripts, gzip bytes").toBeLessThanOrEqual(200_000);
  // (58.5 KB since 2026-11-11: the symbols' face and the chosen script's at the head of every font list, Traditional's
  // English and bold faces, as in Nitya Upasana: 58.09 KB then on a Mac)
  expect(gz(parts.css), "styles, gzip bytes").toBeLessThanOrEqual(58_500);
  expect(gz(["index.html"]), "index.html, gzip bytes").toBeLessThanOrEqual(22_000);
});

// The Content-Security-Policy in _headers (Cloudflare Pages sends it; tests/serve.mjs too, so every test runs under it):
// files from this site only, and never an inline script
test("every file carries the Content-Security-Policy: this site only, no inline scripts", async ({ request }) => {
  for (const path of ["./", "sw.js", "js/main.js"]) {
    const csp = (await request.get(path)).headers()["content-security-policy"] || "";
    expect(csp, path).toContain("default-src 'self'");
    expect(csp, path).toMatch(/script-src 'self'(;|$)/);
  }
});

// Type checks (npm run types) cover only the files that start with "// @ts-check" (tests/tsconfig.json). Every script
// has it now; a new file starts with it too (CLAUDE.md). The list of files waiting for it stays empty.
const UNCHECKED = [];

test("every script is type-checked", () => {
  const all = readdirSync(new URL("../js/", import.meta.url), { recursive: true })
    .map(String)
    .filter((f) => f.endsWith(".js"))
    .map((f) => "js/" + f.split("\\").join("/"));
  const unchecked = all.filter((f) => !readFileSync(new URL("../" + f, import.meta.url), "utf8").startsWith("// @ts-check")).sort();
  expect(unchecked, "files without // @ts-check on their first line").toEqual(UNCHECKED);
});

// The layers (js/README.md): core, text and store are the ground the features stand on, so they never import a feature
// or the printout; a feature that needs to know is told through a page event ("nitya-fold"). The parts that only
// start things up or show things are features.
test("core, text and store import no feature", () => {
  const low = readdirSync(new URL("../js/", import.meta.url), { recursive: true })
    .map((f) => String(f).split("\\").join("/"))
    .filter((f) => /^(core|text|store)\/.*\.js$/.test(f));
  const up = low.flatMap((f) =>
    [...readFileSync(new URL("../js/" + f, import.meta.url), "utf8").matchAll(/^import [^;]*? from "([^"]+)";/gms)]
      .map((m) => m[1])
      .filter((m) => /\/(features|print)\//.test(m))
      .map((m) => f + " → " + m),
  );
  expect(up).toEqual([]);
});

// Every script, style file and test suite is described in its README (2026-11-11: a test suite had gone undescribed),
// so a new file comes with its line there (CLAUDE.md: "When a part or a file changes, update js/README.md or
// css/README.md in the same change")
test("every script, style file and test suite is named in its README", () => {
  const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");
  // (the test suites sit at the top of tests/, which the test runner also writes into while it runs: no deeper there)
  const list = (dir, re) =>
    readdirSync(new URL("../" + dir, import.meta.url), { recursive: dir !== "tests/" })
      .map(String)
      .filter((f) => re.test(f));
  const missing = (doc, dir, re) => list(dir, re).filter((f) => !read(doc).includes(f.replace(/\\/g, "/")));
  expect(missing("js/README.md", "js/", /^(?!strings\/).*\.js$/), "js/README.md").toEqual([]);
  expect(missing("css/README.md", "css/", /\.css$/), "css/README.md").toEqual([]);
  expect(missing("tests/README.md", "tests/", /^[^/]+\.spec\.mjs$/), "tests/README.md").toEqual([]);
});

// The suites the other engines run are named in playwright.config.mjs (ENGINE, FLOWS): a suite renamed there would
// quietly stop running outside Chromium, so every name must be a suite that exists (2026-11-11)
test("every suite the other engines are given exists", () => {
  const config = readFileSync(new URL("./playwright.config.mjs", import.meta.url), "utf8");
  const names = [...config.matchAll(/\/\(([a-z|-]+)\)\\\.spec/g)].flatMap((m) => m[1].split("|"));
  expect(names.length).toBeGreaterThan(10);
  const suites = readdirSync(new URL("./", import.meta.url)).filter((f) => f.endsWith(".spec.mjs"));
  expect(names.filter((n) => !suites.includes(n + ".spec.mjs"))).toEqual([]);
});
