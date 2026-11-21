// Service worker: keeps a copy of the site on the phone so it opens without internet.
// V is the site's version (shown as "v1.2" in Settings → About). It must match <meta name="version"> in index.html; change both on a new release.
const V = "aarti-v1.24.1";
// The page's styles and scripts, the font files and the pictures to keep: one list for the page and this worker, in js/parts.js
importScripts("js/parts.js");
const PARTS = SITE_PARTS.all;
const FONTS = SITE_PARTS.fonts;
const IMAGES = SITE_PARTS.images;
// A new version (a new V) saves a whole fresh copy before it takes over. The font files never change in place, so they
// are copied from the previous version's saved copy instead of downloaded again. If any file can't be fetched (a weak
// connection), the install fails and the previous version stays in use until the next launch tries again, so the
// saved copy is never a mix of two versions and never missing a part; why it failed is kept (NOTE, below).
// Why a new version could not be saved, kept for Settings → About (js/features/offline.js) in a cache of its own: one
// entry, {v, why}, the version and what failed. An iPhone's home-screen app stayed on 1.73.0 after every update while
// the site said 1.74.0, and nothing showed why (Satish, 2026-11-18). The next version that installs removes it.
const NOTE = "update-failed";
self.addEventListener("install", (e) => {
  self.skipWaiting();
  // what the install is doing, for the note when it never finishes
  let step = "starting";
  const work = (async () => {
    step = "opening the saved copy";
    const c = await caches.open(V);
    const old = (await caches.keys()).filter((x) => x !== V && x !== NOTE);
    step = "copying the fonts";
    const fonts = [];
    for (const f of FONTS) {
      let m = null;
      for (const k of old) {
        m = await (await caches.open(k)).match(new URL(f, location.href).href);
        if (m) break;
      }
      if (m) await c.put(new URL(f, location.href).href, m);
      else fonts.push(f);
    }
    // every file fetched before any is saved (as addAll would), so that a failure names the file
    const files = ["./", "manifest.json", ...IMAGES, ...PARTS, ...fonts];
    let got = 0;
    step = `downloading 0 of ${files.length} files`;
    const res = await Promise.all(
      files.map((f) =>
        fetch(new Request(f, { cache: "reload" })).then(
          (r) => {
            step = `downloading ${++got} of ${files.length} files`;
            return r.ok && !r.redirected ? r : new Error(`${f}: ${r.redirected ? "redirected" : r.status}`);
          },
          (x) => new Error(`${f}: ${(x && x.message) || "no connection"}`),
        ),
      ),
    );
    const bad = res.filter((r) => r instanceof Error);
    // a first visit has no older copy to fall back on: it goes on without a file that failed, and the page saves it later
    // (js/features/offline.js)
    if (bad.length && old.length) throw new Error(bad.map((x) => x.message).join(", "));
    step = "saving the files";
    await Promise.all(res.map((r, i) => (r instanceof Error ? 0 : c.put(new URL(files[i], location.href).href, r))));
  })();
  // An install that never finishes (Safari's storage can stall) counts as failed after 3 minutes, with what it was doing
  const late = new Promise((_, no) => setTimeout(() => no(new Error(`still ${step} after 3 minutes`)), 180000));
  e.waitUntil(Promise.race([work, late]).catch((x) => failed(x).then(() => Promise.reject(x))));
});
// A failed install: the previous version stays in use (its copy untouched), this version's half-made copy goes, and the
// reason is kept and told to the open pages. Each step on its own: a full storage may refuse the note too.
/** @param {any} x */
async function failed(x) {
  const why = (x && x.name && !/^Error$/.test(x.name) ? x.name + ": " : "") + ((x && x.message) || String(x));
  await caches.delete(V).catch(() => {});
  await caches
    .open(NOTE)
    .then((c) => c.put("note", new Response(JSON.stringify({ v: V, why }), { headers: { "Content-Type": "application/json" } })))
    .catch(() => {});
  const all = await self.clients.matchAll({ includeUncontrolled: true, type: "window" }).catch(() => []);
  for (const w of all) w.postMessage({ updateFailed: V, why });
}
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((k) => Promise.all(k.filter((x) => x !== V).map((x) => caches.delete(x))))
      .then(() => self.clients.claim()),
  );
});
// Same-site files come from the saved copy of this version whenever it has them, at once and without asking the
// network: the page opens as fast as the phone can read it, with or without internet. Nothing is downloaded again
// until a new version is published (sw.js changes, and the install above saves the new copy; the page in use keeps
// running and the next launch opens the new version). A file not saved yet (a first visit still saving) is fetched
// and then kept.
// "Check for updates" (js/features/offline.js) marks its requests ?fresh (Safari's worker never sees a request's cache
// mode), and the page saving missing files asks with cache 'reload': those go straight to the network.
// Nothing here may leave the page waiting: if the saved copy can't be read within 2 s, or anything
// goes wrong, the request goes straight to the network as if there were no service worker.
// (Safari on a Mac sat on a blank page with the previous version; its storage can stall.)
const wait = (p, ms) => Promise.race([p, new Promise((res) => setTimeout(() => res(null), ms))]);
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  if (r.cache === "no-store" || r.cache === "reload" || u.searchParams.has("fresh")) return;
  // Saving a fetched file is handed to waitUntil now, while the event is still being dispatched
  // (Safari can refuse waitUntil once the handler has moved on).
  let done;
  const bg = new Promise((res) => (done = res));
  e.waitUntil(bg);
  const nav = r.mode === "navigate" || /\/(index\.html)?$/.test(u.pathname);
  const key = nav ? new URL("./", location.href).href : u.origin + u.pathname;
  const go = async () => {
    const c = await wait(caches.open(V), 2000);
    let m = c ? await wait(c.match(key), 2000) : null;
    if (m && m.redirected) m = null; // Safari refuses a redirected copy for a page
    if (m) return m;
    const net = () =>
      fetch(nav ? key : u.origin + u.pathname, { cache: "no-cache", credentials: "same-origin" })
        .then((x) => {
          if (c && x && x.ok && !x.redirected) done(c.put(key, x.clone()).catch(() => {}));
          return x;
        })
        .catch(() => null);
    const x = await net();
    if (x) return x;
    if (c && nav) {
      const h = await wait(c.match("./", { ignoreSearch: true }), 2000);
      if (h) return h;
    }
    return new Response("Offline", { status: 503 });
  };
  e.respondWith(
    go()
      .catch(() => fetch(r))
      .finally(() => setTimeout(done, 0)),
  );
});
