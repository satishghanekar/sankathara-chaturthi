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
// then. Styles
// raised 2026-10-30 to 55 KB for More dates a row a year on iPads and beside the card on desktops: 52.3 KB then; on
// 2026-10-31 to 58 KB for Nitya Upasana's three text fonts (their faces in every script, Bold's weights): 55.2 KB then.
// index.html raised 2026-11-01 to 22 KB, as it had reached 20.0 KB as CI's Node 22 compresses it (some 70 bytes more
// than Node 25 on a Mac).)
test("the scripts, styles and page stay within their size budget", () => {
  const parts = siteParts();
  const gz = (files) => files.reduce((n, f) => n + gzipSync(readFileSync(new URL("../" + f, import.meta.url))).length, 0);
  expect(gz([...parts.scripts, ...parts.modules]), "scripts, gzip bytes").toBeLessThanOrEqual(195_000);
  expect(gz(parts.css), "styles, gzip bytes").toBeLessThanOrEqual(58_000);
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

// Type checking (npm run types) covers only the files that start with "// @ts-check". These still don't: the list may
// only get shorter, as each file is typed (in Nitya Upasana first, for the files the two apps share). A new file, or
// one taken off the list, fails here until it has the line.
const UNCHECKED = [
  "core/apply.js",
  "core/features.js",
  "core/page.js",
  "core/startup.js",
  "core/state.js",
  "features/astronomy.js",
  "features/bars.js",
  "features/bottom-bar.js",
  "features/clicks.js",
  "features/dhrupad-button.js",
  "features/help.js",
  "features/history.js",
  "features/languages.js",
  "features/more-menu.js",
  "features/offline.js",
  "features/overlays.js",
  "features/picture-viewer.js",
  "features/pinch.js",
  "features/print.js",
  "features/reading-sheet.js",
  "features/settings-panel.js",
  "features/share.js",
  "features/wake-lock.js",
  "main.js",
  "parts.js",
  "print/compose.js",
  "render.js",
  "text/autofit.js",
  "text/dhrupad-markers.js",
  "text/iast.js",
  "text/layout.js",
  "text/line-breaks.js",
  "text/stanza-numbers.js",
];
test("every script is type-checked, except the files still waiting for it", () => {
  const all = [];
  (function walk(dir) {
    for (const e of readdirSync(new URL("../js/" + dir, import.meta.url), { withFileTypes: true })) {
      if (e.isDirectory()) walk(dir + e.name + "/");
      else if (e.name.endsWith(".js")) all.push(dir + e.name);
    }
  })("");
  const unchecked = all.filter((f) => !/^\/\/ @ts-check/m.test(readFileSync(new URL("../js/" + f, import.meta.url), "utf8").slice(0, 300))).sort();
  expect(unchecked).toEqual([...UNCHECKED].sort());
});
