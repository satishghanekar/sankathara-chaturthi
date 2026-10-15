// Run from the repository root with -c (npm run lint does this), so the paths below are from the root.
// JavaScript lint: catches mistakes, and (eslint-plugin-compat) any browser API that the oldest supported
// browsers (.browserslistrc) lack, unless the code checks for it first.
import compat from "eslint-plugin-compat";
import globals from "globals";
import { readFileSync } from "node:fs";

const browsers = readFileSync(new URL(".browserslistrc", import.meta.url), "utf8")
  .split("\n")
  .map((l) => l.replace(/#.*/, "").trim())
  .filter(Boolean);

export default [
  {
    // the site's own scripts: plain scripts in the browser, written to run on iOS 15 Safari
    files: ["js/**/*.js", "content/**/*.js", "sw.js"],
    plugins: { compat },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "script",
      globals: { ...globals.browser, ...globals.serviceworker, CONTENT: "writable", SCR: "writable", renderPieces: "writable" },
    },
    settings: { browsers, polyfills: [] },
    rules: {
      "compat/compat": "error",
      "no-undef": "error",
      "no-unused-vars": ["error", { args: "none", caughtErrors: "none" }],
      "no-redeclare": "error",
      "no-dupe-keys": "error",
      "no-unreachable": "error",
    },
  },
  {
    files: ["tests/**/*.mjs"],
    languageOptions: { ecmaVersion: 2022, sourceType: "module", globals: { ...globals.node, ...globals.browser } },
  },
];
