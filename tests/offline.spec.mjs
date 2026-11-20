// Offline: once opened, the site works with no internet (service worker sw.js).
import { test, expect, devices } from "@playwright/test";
import { readFileSync, writeFileSync, mkdtempSync, readdirSync, symlinkSync, mkdirSync, copyFileSync, unlinkSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { FIXED_NOW, PREFS_KEY, BASE_PREFS, TEXT_COUNT, buildAll, settingsTab } from "./helpers.mjs";

test.use({ serviceWorkers: "allow" });

test("works offline after the first visit @chromium-only", async ({ page, context }) => {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [PREFS_KEY, JSON.stringify(BASE_PREFS)]);
  await page.goto("./");
  // wait until the service worker controls the page and has saved the site
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((r) => navigator.serviceWorker.addEventListener("controllerchange", r, { once: true }));
    const v = document.querySelector('meta[name="version"]').content;
    for (let i = 0; i < 50; i++) {
      const c = await caches.open(v);
      if ((await c.keys()).length > 10) return;
      await new Promise((r) => setTimeout(r, 200));
    }
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator("#jl a[data-go]")).toHaveCount(TEXT_COUNT);
  await buildAll(page);
  await expect(page.locator("section.ash")).toHaveCount(TEXT_COUNT);
  await expect(page.locator("#ofb")).toBeVisible();
  // the main fonts came from the saved copy
  expect(await page.evaluate(() => document.fonts.check('16px "Noto Sans Devanagari"', "क"))).toBe(true);
  // the picture shows, and both sizes of it are kept, so the full-screen view works offline too
  expect(await page.locator("#iconb img").evaluate((i) => i.complete && i.naturalWidth > 0)).toBe(true);
  const kept = await page.evaluate(async () => {
    const c = await caches.open(document.querySelector('meta[name="version"]').content);
    return Promise.all(["picture-360.webp", "picture.webp"].map(async (n) => !!(await c.match(n))));
  });
  expect(kept).toEqual([true, true]);
  await context.setOffline(false);
});

// A file that could not be saved on the first visit (a weak connection): never "Offline ready" while it is missing;
// it is tried again when the internet is back, and then the badge and the note say ready
test("offline ready only once every file is saved @chromium-only", async ({ page, context }) => {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [PREFS_KEY, JSON.stringify(BASE_PREFS)]);
  const block = (r) => r.abort();
  await context.route("**/picture.webp", block);
  await page.goto("./");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.locator("#aa").click();
  await settingsTab(page, "about");
  // the other files are saved, the picture is not: still saving
  await expect
    .poll(() => page.evaluate(async () => (await caches.open(document.querySelector('meta[name="version"]').content)).keys().then((k) => k.length)), {
      timeout: 20_000,
    })
    .toBeGreaterThan(10);
  await page.waitForTimeout(1000);
  await expect(page.locator("#offv")).toHaveAttribute("data-s", "save");
  // the internet back: the picture is saved, and the site is ready offline
  await context.unroute("**/picture.webp", block);
  await page.evaluate(() => dispatchEvent(new Event("online")));
  await expect(page.locator("#offv")).toHaveAttribute("data-s", "idle", { timeout: 20_000 });
  // the badge says so; no message over the page (Satish, 2026-10-30)
  await expect(page.locator("#fl")).not.toHaveText("Ready to use offline");
});

// A weak connection with the site saved: the page and every part come from the saved copy at once, without asking the
// network, so the page is ready as fast as with a good connection
test("a weak connection: the saved copy opens the page without asking the network @chromium-only", async ({ page, context }) => {
  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [PREFS_KEY, JSON.stringify(BASE_PREFS)]);
  await page.goto("./");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((r) => navigator.serviceWorker.addEventListener("controllerchange", r, { once: true }));
    const v = document.querySelector('meta[name="version"]').content;
    // every file in js/parts.js, and the page
    const all = SITE_PARTS.all.length + SITE_PARTS.fonts.length + SITE_PARTS.images.length + 1;
    for (let i = 0; i < 100; i++) {
      if ((await (await caches.open(v)).keys()).length >= all) return;
      await new Promise((r) => setTimeout(r, 100));
    }
  });
  // what reaches the network: from the page itself, or fetched by the service worker
  const net = [];
  context.on("request", (r) => {
    if (r.serviceWorker()) net.push(r.url());
  });
  const res = [];
  page.on("response", (r) => res.push(r));
  await page.reload();
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-ready"));
  const own = res.filter((r) => new URL(r.url()).origin === new URL(page.url()).origin && !r.url().endsWith("/sw.js"));
  expect(own.length).toBeGreaterThan(60);
  expect(own.filter((r) => !r.fromServiceWorker()).map((r) => r.url())).toEqual([]);
  expect(net.filter((u) => !u.endsWith("/sw.js") && !u.endsWith("/js/parts.js"))).toEqual([]);
});

// Check for updates (Settings → More → About) still finds a file changed under the same version: it saves the new
// copy over the old one before reloading, since the page opens from the saved copy
test("Check for updates saves a changed file and reloads with it @chromium-only", async ({ page, context }) => {
  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [PREFS_KEY, JSON.stringify(BASE_PREFS)]);
  await page.goto("./");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((r) => navigator.serviceWorker.addEventListener("controllerchange", r, { once: true }));
  });
  await page.reload();
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-ready"));
  // the server now has a changed style file (asked for with ?fresh by the check, plain by the page)
  await context.route(/\/css\/99-fallbacks\.css(\?|$)/, async (r) => {
    const res = await r.fetch();
    await r.fulfill({ response: res, body: (await res.text()) + "\n#__changed{color:red}" });
  });
  await page.locator("#aa").click();
  await settingsTab(page, "about");
  await page.locator("#upd").click();
  await page.waitForEvent("load", { timeout: 25_000 });
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-ready"));
  await context.unrouteAll({ behavior: "ignoreErrors" });
  // the page now runs with the changed file, from the saved copy
  const css = await page.evaluate(async () => (await (await fetch("css/99-fallbacks.css")).text()).includes("#__changed"));
  expect(css).toBe(true);
});

// The splash (js/splash.js): from the first paint until the page is ready, the app's picture, the name and the eight
// lamps lit in turn; then it fades out and lets taps through
test("the splash shows the picture and its lamps until the page is ready, then goes @mobile", async ({ page }) => {
  let go;
  const held = new Promise((r) => (go = r));
  await page.route("**/js/main.js", async (r) => {
    await held;
    await r.continue();
  });
  await page.clock.setFixedTime(FIXED_NOW);
  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [PREFS_KEY, JSON.stringify({ ...BASE_PREFS, th: "dark" })]);
  // (opened today already: the plain splash, not the launch animation)
  await page.addInitScript(
    (d) => localStorage.setItem("sankathara-launch", d),
    FIXED_NOW.getFullYear() + "-" + (FIXED_NOW.getMonth() + 1) + "-" + FIXED_NOW.getDate(),
  );
  // the site script is held back, so the page is still starting
  await page.goto("./", { waitUntil: "commit" });
  const spl = page.locator("#spl");
  await expect(spl).toBeVisible();
  await expect(spl.locator("img")).toHaveAttribute("src", "picture-360.webp");
  await expect(spl.locator(".spln")).toHaveText("संकटहर चतुर्थी");
  await expect(spl.locator(".spls")).toHaveCount(8);
  // the reader's theme is on the page before the site script runs, so the splash matches it
  await expect(page.locator("html")).toHaveAttribute("data-pref", "dark");
  expect(await page.evaluate(() => document.documentElement.hasAttribute("data-ready"))).toBe(false);
  go();
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-ready"));
  await expect(spl).toBeHidden();
  expect(await spl.evaluate((e) => getComputedStyle(e).pointerEvents)).toBe("none");
});

// Safari and every iPhone and iPad browser (WebKit) keep the scripts in memory until the app is closed, whatever
// reloads the page: there Check for updates saves the new files and asks the reader to close the app and open it again,
// rather than reloading into the old menus with the new page (Satish, 2026-10-30)
test.describe("in Safari", () => {
  test.use({ userAgent: devices["Desktop Safari"].userAgent });
  test("Check for updates saves the changed file and asks to close and reopen the app @chromium-only", async ({ page, context }) => {
    await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [PREFS_KEY, JSON.stringify(BASE_PREFS)]);
    await page.goto("./");
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
      if (!navigator.serviceWorker.controller) await new Promise((r) => navigator.serviceWorker.addEventListener("controllerchange", r, { once: true }));
    });
    await page.reload();
    await page.waitForFunction(() => document.documentElement.hasAttribute("data-ready"));
    await context.route(/\/css\/99-fallbacks\.css(\?|$)/, async (r) => {
      const res = await r.fetch();
      await r.fulfill({ response: res, body: (await res.text()) + "\n#__changed{color:red}" });
    });
    let reloaded = false;
    page.on("load", () => (reloaded = true));
    await page.locator("#aa").click();
    await settingsTab(page, "about");
    await page.locator("#upd").click();
    await expect(page.locator("#upd")).toHaveAttribute("data-s", "restart", { timeout: 25_000 });
    await expect(page.locator("#updv")).toHaveText("Saved. Close the app and open it again");
    await expect(page.locator("#fl")).toContainText("Close the app and open it again to finish.");
    expect(reloaded).toBe(false);
    // How? opens the steps over Settings, for this device first (Safari on a Mac); Escape closes only them
    await page.locator("#uph").click();
    await expect(page.locator("#upm")).toBeVisible();
    await expect(page.locator("#upmt")).toHaveText("Finish the update");
    await expect(page.locator('#upm [data-v="mac"]')).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#upm .upms li")).toHaveCount(2);
    await page.locator('#upm [data-v="iphone"]').click();
    await expect(page.locator("#upm .upms li")).toHaveCount(3);
    await expect(page.locator('#upm [data-v="iphone"]')).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator("#upm")).toBeHidden();
    await expect(page.locator("#panel")).toBeVisible();
    await expect(page.locator("#uph")).toBeFocused();
    // the round button opens them too; Got it closes them
    await page.locator("#upd").click();
    await expect(page.locator("#upm")).toBeVisible();
    await page.locator("#upm .upmo").click();
    await expect(page.locator("#upm")).toBeHidden();
    await expect(page.locator("#panel")).toBeVisible();
    await context.unrouteAll({ behavior: "ignoreErrors" });
    // the new file is saved for the next launch
    expect(await page.evaluate(async () => (await (await fetch("css/99-fallbacks.css")).text()).includes("#__changed"))).toBe(true);
  });
});

// Safari installs a new version as the app opens and removes the saved copy of the version still on screen: Check for
// updates then has no copy to compare with, and finds the new version from the version the page names (it said "Up to
// date", stuck on 1.37.3, 2026-10-29)
test("Check for updates finds a new version installed while the old one is on screen @chromium-only", async ({ page, context }) => {
  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [PREFS_KEY, JSON.stringify(BASE_PREFS)]);
  await page.goto("./");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((r) => navigator.serviceWorker.addEventListener("controllerchange", r, { once: true }));
  });
  await page.reload();
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-ready"));
  // the server's page names a newer version, and this version's saved copy is gone
  await context.route(/\/(\?fresh=\d+)?$/, async (r) => {
    const res = await r.fetch();
    await r.fulfill({ response: res, body: (await res.text()).replace(/content="aarti-v[\d.]+"/, 'content="aarti-v99.0"') });
  });
  // (the new version's copy is there: Safari made it as the app opened)
  await page.evaluate(async () => {
    const name = document.querySelector('meta[name="version"]').content;
    const from = await caches.open(name),
      to = await caches.open("aarti-v99.0");
    for (const q of await from.keys()) await to.put(q, await from.match(q));
    await caches.delete(name);
  });
  await page.locator("#aa").click();
  await settingsTab(page, "about");
  const loaded = page.waitForEvent("load", { timeout: 25_000 });
  await page.locator("#upd").click();
  await loaded;
});

// A new version that can't be saved on this device: Check for updates says so instead of "Saved", and About says why
// until a newer version installs. An iPhone stayed on 1.73.0 after every update, which said 1.74.0 (Satish, 2026-11-18).
/** @param {import("@playwright/test").Page} page @param {string} [url] */
async function openWithWorker(page, url = "./") {
  await page.addInitScript(([k, v]) => localStorage.setItem(k, v), [PREFS_KEY, JSON.stringify(BASE_PREFS)]);
  await page.goto(url);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((r) => navigator.serviceWorker.addEventListener("controllerchange", r, { once: true }));
  });
  await page.reload();
  await page.waitForFunction(() => document.documentElement.hasAttribute("data-ready"));
  await page.locator("#aa").click();
  await settingsTab(page, "about");
}

test("a new version this device never takes up says so @chromium-only", async ({ page, context }) => {
  await openWithWorker(page);
  await expect(page.locator("#update-why")).toBeHidden();
  // the site's page names version 99.0, but no new version installs here
  await context.route(/\/(\?fresh=\d+)?$/, async (r) => {
    const res = await r.fetch();
    await r.fulfill({ response: res, body: (await res.text()).replace(/content="aarti-v[\d.]+"/, 'content="aarti-v99.0"') });
  });
  await page.locator("#upd").click();
  await expect(page.locator("#upd")).toHaveAttribute("data-s", "failed", { timeout: 30_000 });
  await expect(page.locator("#updv")).toHaveText("Couldn't save the new version · tap to try again");
  await expect(page.locator("#update-why")).toContainText("Update not saved (99.0)");
  await expect(page.locator("#update-why code")).toHaveText("no saved copy of 99.0 was made");
});

test("a new version whose install fails: why, kept until the next one @chromium-only", async ({ page }) => {
  test.setTimeout(90_000);
  // a server of its own, the site as links but its own sw.js, so the test can publish a new version (a browser asks for
  // sw.js past Playwright's routing)
  const dir = mkdtempSync(join(tmpdir(), "site-copy-"));
  const repo = fileURLToPath(new URL("..", import.meta.url));
  for (const f of readdirSync(repo)) if (!["tests", "sw.js", ".git"].includes(f)) symlinkSync(join(repo, f), join(dir, f));
  mkdirSync(join(dir, "tests"));
  copyFileSync(join(repo, "tests/serve.mjs"), join(dir, "tests/serve.mjs"));
  const sw = readFileSync(join(repo, "sw.js"), "utf8");
  writeFileSync(join(dir, "sw.js"), sw);
  const port = 4392;
  const server = spawn("node", [join(dir, "tests/serve.mjs")], { env: { ...process.env, PORT: String(port) }, stdio: "ignore" });
  try {
    for (
      let i = 0;
      i < 40 &&
      !(await fetch(`http://localhost:${port}/`).then(
        (r) => r.ok,
        () => false,
      ));
      i++
    )
      await new Promise((r) => setTimeout(r, 100));
    await openWithWorker(page, `http://localhost:${port}/`);
    const was = await page.evaluate(() => document.querySelector('meta[name="version"]').content);
    // version 99.0 published, with a file of it missing
    writeFileSync(join(dir, "sw.js"), sw.replace(/aarti-v[\d.]+/, "aarti-v99.0"));
    writeFileSync(join(dir, "index.html.new"), readFileSync(join(repo, "index.html"), "utf8").replace(/content="aarti-v[\d.]+"/, 'content="aarti-v99.0"'));
    unlinkSync(join(dir, "index.html"));
    renameSync(join(dir, "index.html.new"), join(dir, "index.html"));
    unlinkSync(join(dir, "manifest.json"));
    await page.locator("#upd").click();
    await expect(page.locator("#upd")).toHaveAttribute("data-s", "failed", { timeout: 30_000 });
    await expect(page.locator("#update-why")).toContainText("Update not saved (99.0)");
    await expect(page.locator("#update-why code")).toHaveText("manifest.json: 404");
    // the version in use stays, with its saved copy; why is still there when the app opens again
    expect(await page.evaluate(() => caches.keys())).toContain(was);
    expect(await page.evaluate(() => caches.keys())).not.toContain("aarti-v99.0");
    await page.reload();
    await page.waitForFunction(() => document.documentElement.hasAttribute("data-ready"));
    await page.locator("#aa").click();
    await settingsTab(page, "about");
    await expect(page.locator("#update-why code")).toHaveText("manifest.json: 404");
    // the file back: the next try installs it, and why is gone
    symlinkSync(join(repo, "manifest.json"), join(dir, "manifest.json"));
    const loaded = page.waitForEvent("load", { timeout: 30_000 });
    await page.locator("#upd").click();
    await loaded;
    await page.waitForFunction(() => document.documentElement.hasAttribute("data-ready"));
    expect(await page.evaluate(() => caches.keys())).not.toContain("update-failed");
    await page.locator("#aa").click();
    await settingsTab(page, "about");
    await expect(page.locator("#update-why")).toBeHidden();
  } finally {
    server.kill();
    rmSync(dir, { recursive: true, force: true });
  }
});

// The version is written twice on purpose: browsers install a new service worker when sw.js itself changes
// (not every browser re-checks the files it imports), so sw.js must carry it, and the page needs it at start-up.
test("version in index.html and sw.js match", async ({ request }) => {
  const html = await (await request.get("./")).text();
  const sw = await (await request.get("sw.js")).text();
  const a = /<meta name="version" content="(aarti-v[\d.]+)">/.exec(html)?.[1];
  const b = /const V\s*=\s*["'](aarti-v[\d.]+)["']/.exec(sw)?.[1];
  expect(a, '<meta name="version"> in index.html').toBeTruthy();
  expect(b, "sw.js").toBe(a);
});
