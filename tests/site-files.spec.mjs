// The file list in js/parts.js is shared by the page ("Check for updates") and the service worker (the
// offline copy), but the page itself loads files from its own <link> and <script> tags. These checks keep
// the two in step, so a new style or script file is never missing from the offline copy.
import { test, expect } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
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
});

test("every file in js/parts.js exists", () => {
  const missing = [...parts.css, ...parts.scripts, ...parts.fonts].filter((f) => !existsSync(new URL("../" + f, import.meta.url)));
  expect(missing).toEqual([]);
});
