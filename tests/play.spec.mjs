// Play mode (js/features/play.js; Satish, 2026-11-26): ▶ Play all plays the evening's recordings one after another,
// the ▶ on a Listen card from that text on; the player bar's ⏮ ❚❚ ⏭ and ■ Stop; texts with no recording passed over;
// the end of the list; Back stops it. YouTube's script is a stand-in here (STUB), so the tests never reach YouTube:
// it plays at once and lets a test end a video (__yt.end()) or fail one (__yt.fail(code)).
import { test, expect } from "@playwright/test";
import { openSite, SETUPS } from "./helpers.mjs";

const STUB = `
(function () {
  var all = [];
  function Player(el, o) {
    var me = this;
    me.o = o; me.state = -1; me.video = ""; me.start = 0; me.loads = 0;
    window.__yt = {
      player: me,
      end: function () { me.state = 0; me.o.events.onStateChange({ data: 0 }); },
      fail: function (code) { me.o.events.onError({ data: code }); },
    };
    all.push(me);
    setTimeout(function () { o.events.onReady({ target: me }); }, 10);
  }
  Player.prototype.emit = function (d) { this.state = d; this.o.events.onStateChange({ data: d }); };
  Player.prototype.loadVideoById = function (v) {
    var me = this;
    me.video = v.videoId; me.start = v.startSeconds || 0; me.loads++;
    me.emit(-1);
    setTimeout(function () { me.emit(1); }, 20);
  };
  Player.prototype.playVideo = function () { this.emit(1); };
  Player.prototype.pauseVideo = function () { this.emit(2); };
  Player.prototype.stopVideo = function () { this.emit(5); };
  Player.prototype.getPlayerState = function () { return this.state; };
  Player.prototype.getCurrentTime = function () { return this.start + 5; };
  Player.prototype.getDuration = function () { return 300; };
  window.YT = { Player: Player };
  if (window.onYouTubeIframeAPIReady) window.onYouTubeIframeAPIReady();
})();
`;

/** YouTube's script answered by the stand-in, anything else of YouTube's refused; the requests to YouTube counted */
async function stubYouTube(page) {
  const asked = [];
  await page.route(/youtube(-nocookie)?\.com|ytimg\.com/, (r) => {
    asked.push(r.request().url());
    if (r.request().url() === "https://www.youtube.com/iframe_api") return r.fulfill({ contentType: "application/javascript", body: STUB });
    return r.abort();
  });
  return asked;
}

const video = (page) => page.evaluate(() => window.__yt && window.__yt.player.video);
/** The video loaded is playing (only an end after it has played counts, js/features/youtube.js) */
const playing = (page) => expect.poll(() => page.evaluate(() => window.__yt && window.__yt.player.state)).toBe(1);
const shown = (loc) => loc.evaluate((e) => e.innerText.replace(/\s+/g, " ").trim());

test("Play all: the evening's recordings in turn, the texts with none passed over, ⏮ ❚❚ ⏭, and Stop @mobile", async ({ page }) => {
  const errors = [];
  const asked = await stubYouTube(page);
  await openSite(page, SETUPS.marathi, { errors });
  const all = page.locator("#play-all");
  await expect(all).toBeVisible();
  expect(await shown(all)).toBe("Play all 4 of 15 have a recording · the others are skipped");
  // nothing reaches YouTube before a tap
  expect(asked).toEqual([]);
  await all.click();
  const bar = page.locator("#play-bar");
  await expect(bar).toBeVisible();
  await expect(page.locator("#asc")).toBeHidden();
  await expect(page.locator("#play-video")).toBeVisible();
  await expect.poll(() => video(page)).toBe("OQhyYdoKW1k");
  await expect(page.locator("#play-count")).toHaveText("Playing 1 of 4");
  await expect(page.locator("#play-title")).toHaveText("Ganapati Atharvashirsha · next: Ganapati Bappa Morya");
  await expect(page.locator("#p1")).toBeVisible();
  await expect(page.locator("#play-toggle")).toHaveAttribute("aria-label", "Pause");
  // the video's place is YouTube's minimum at least
  const box = await page.locator("#play-video").boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(199);
  // it ends: the next with a recording starts by itself, Ganesha Pancharatnam (no recording) passed over and said so
  await playing(page);
  await page.evaluate(() => window.__yt.end());
  await expect.poll(() => video(page)).toBe("2zOJ9aZR-08");
  await expect(page.locator("#play-count")).toHaveText("Playing 2 of 4");
  await expect(page.locator("#fl")).toHaveText("Skipped, no recording: Ganesha Pancharatnam");
  await expect(page.locator("#bhajan-ganapati-bappa-morya")).toBeVisible();
  // ❚❚ pauses, ▶ carries on
  await playing(page);
  await page.locator("#play-toggle").click();
  await expect(page.locator("#play-toggle")).toHaveAttribute("aria-label", "Play");
  await expect(page.locator("#play-count")).toHaveText("Paused · 2 of 4");
  await page.locator("#play-toggle").click();
  await expect(page.locator("#play-toggle")).toHaveAttribute("aria-label", "Pause");
  // ⏭ and ⏮
  await page.locator("#play-next").click();
  await expect.poll(() => video(page)).toBe("mt-vSIgsaxU");
  await page.locator("#play-prev").click();
  await expect.poll(() => video(page)).toBe("2zOJ9aZR-08");
  // every button a whole target
  for (const b of await bar.locator("button").all()) expect((await b.boundingBox()).height).toBeGreaterThanOrEqual(44);
  // ■ Stop: the bar goes, the bottom bar comes back, the text stays
  await page.locator("#play-stop").click();
  await expect(bar).toBeHidden();
  await expect(page.locator("#play-video")).toBeHidden();
  await expect(page.locator("#fl")).toHaveText("Stopped · tap ▶ to carry on");
  await expect(page.locator("#bhajan-ganapati-bappa-morya")).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-playing", /.*/);
  expect(errors).toEqual([]);
});

test("the last one ends: all played, and Play mode stops @mobile", async ({ page }) => {
  await stubYouTube(page);
  await openSite(page, SETUPS.marathi);
  await page.locator("#text-kind-bhajan").click();
  await expect(page.locator("#play-all-note")).toHaveText("3 of 3 have a recording · the others are skipped");
  await page.locator("#play-all").click();
  for (const v of ["2zOJ9aZR-08", "mt-vSIgsaxU", "aASYnk-eaXI"]) {
    await expect.poll(() => video(page)).toBe(v);
    await playing(page);
    await page.evaluate(() => window.__yt.end());
  }
  await expect(page.locator("#play-bar")).toBeHidden();
  await expect(page.locator("#fl")).toHaveText("All 3 recordings played");
});

test("a Listen card's ▶ plays from that text on; its link still opens YouTube; Back stops it @mobile", async ({ page }) => {
  await stubYouTube(page);
  await openSite(page, SETUPS.marathi, { hash: "#bhajan-gaiye-ganapati-jagvandan" });
  const sec = page.locator("#bhajan-gaiye-ganapati-jagvandan");
  const play = sec.locator(".listen-play");
  await expect(play).toBeVisible();
  await expect(play).toHaveAccessibleName("Play here: Jagjit Singh");
  await expect(sec.locator(".listen-card")).toHaveAttribute("href", "https://www.youtube.com/watch?v=aASYnk-eaXI&t=15");
  expect((await play.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await play.click();
  await expect.poll(() => video(page)).toBe("aASYnk-eaXI");
  await expect(page.locator("#play-count")).toHaveText("Playing 4 of 4");
  await expect(page.locator("#play-title")).toHaveText("Gaiye Ganapati Jagavandan · the last one");
  await expect(page.locator("#play-next")).toBeDisabled();
  await page.goBack();
  await expect(page.locator("#play-bar")).toBeHidden();
});

test("a video that can't be played is said, and the next one follows @mobile", async ({ page }) => {
  await stubYouTube(page);
  await openSite(page, SETUPS.marathi);
  await page.locator("#play-all").click();
  await expect.poll(() => video(page)).toBe("OQhyYdoKW1k");
  await page.evaluate(() => window.__yt.fail(150));
  await expect(page.locator("#fl")).toHaveText("Can’t play Ganapati Atharvashirsha now: going on to the next");
  await expect.poll(() => video(page), { timeout: 9000 }).toBe("2zOJ9aZR-08");
});

test("Play mode's words in Marathi menus @mobile", async ({ page }) => {
  await stubYouTube(page);
  await openSite(page, SETUPS["marathi-menus"]);
  expect(await shown(page.locator("#play-all"))).toBe("सर्व ऐका १५ पैकी ४ रचनांचे रेकॉर्डिंग आहे · बाकीच्या वगळल्या जातील");
  await page.locator("#play-all").click();
  await expect(page.locator("#play-count")).toHaveText("४ पैकी १ वाजत आहे");
});

test("no ▶ Play all where no text has a recording; no YouTube without a tap @mobile", async ({ page }) => {
  const asked = await stubYouTube(page);
  await openSite(page, SETUPS.marathi);
  await page.locator("#text-kind-aarti").click();
  await expect(page.locator("#play-all")).toBeHidden();
  await page.locator("#text-kind-all").click();
  await expect(page.locator("#play-all")).toBeVisible();
  expect(asked).toEqual([]);
});
