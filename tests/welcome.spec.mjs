// Welcome (js/features/welcome.js; Satish, 2026-11-21, as in Nitya Upasana): once, on a new phone, two full-screen steps
// over Home: what the app is and the first reading language (English the second); then the town the moonrise is worked
// out for, the one guessed from the time zone, the phone's location or a city picked. Every other test opens a phone
// that has seen it (openSite's welcome option, tests/helpers.mjs). The tests run in New York's time zone, so the guess
// is Columbus, OH.
import { test, expect } from "@playwright/test";
import { openSite, settle, SETUPS, axeEveryTheme, noViolations } from "./helpers.mjs";

const card = (page) => page.locator("#wlc");
const prefs = (page) =>
  page.evaluate(() => import(new URL("js/core/state.js", document.baseURI).href).then((m) => ({ lead: m.P.lead, l2: m.P.l2, ind: m.P.ind, loc: m.P.loc })));

test("a new phone: what the app is, then the town guessed with its next date; Yes, start opens Home @mobile", async ({ page }) => {
  await openSite(page, SETUPS.english, { welcome: true });
  await expect(card(page)).toBeVisible();
  await expect(card(page)).toHaveAccessibleName("Welcome to Sankathara Chaturthi");
  await expect(page.locator("#welcome-place")).toBeHidden();
  await expect(page.locator("#welcome-title")).toHaveText("संकटहर चतुर्थीSankathara Chaturthi");
  await expect(page.locator("#welcome-points li")).toHaveCount(3);
  await expect(page.locator("#welcome-facts li")).toHaveText(["Works offline", "Stays on your phone", "No sign-up"]);
  // Home is under it, and out of reach: the welcome covers the screen
  const vp = page.viewportSize();
  expect(await card(page).boundingBox()).toEqual({ x: 0, y: 0, width: vp.width, height: vp.height });
  await page.locator("#welcome-next").click();
  await expect(page.locator("#welcome-place-title")).toBeFocused();
  await expect(page.locator("#welcome-place-title")).toHaveText("Is this your town?");
  await expect(page.locator("#welcome-town-name")).toHaveText("Columbus, OH");
  await expect(page.locator("#welcome-town-next")).toHaveText(/^Next Chaturthi: .+ · moonrise \d{1,2}:\d\d [ap]m/);
  await expect(page.locator("#welcome-city")).toHaveAccessibleName("Or choose a city");
  await expect(page.locator("#welcome-city option:checked")).toHaveText("Columbus, OH");
  await expect(page.locator("#welcome-change")).toContainText("Tap the town on the Chaturthi card");
  // Back, and on again
  await page.locator("#welcome-back").click();
  await expect(page.locator("#welcome-about")).toBeVisible();
  await expect(page.locator("#welcome-title")).toBeFocused();
  await page.locator("#welcome-next").click();
  await page.locator("#wlcs").click();
  await expect(card(page)).toBeHidden();
  await expect(page.locator("html")).not.toHaveAttribute("data-welcome", "1");
  await expect(page.locator("#skx")).toContainText("Columbus, OH");
  await page.reload();
  await settle(page);
  await expect(card(page)).toBeHidden();
});

test("a city picked: the town and its moonrise change at once, kept for the card @mobile", async ({ page }) => {
  await openSite(page, SETUPS.english, { welcome: true });
  await page.locator("#welcome-next").click();
  const before = await page.locator("#welcome-town-next").textContent();
  await page.locator("#welcome-city").selectOption({ label: "Chicago, IL" });
  await expect(page.locator("#welcome-town-name")).toHaveText("Chicago, IL");
  await expect(page.locator("#welcome-town-next")).not.toHaveText(before);
  expect((await prefs(page)).loc).toEqual({ lat: 41.88, lon: -87.63 });
  await page.locator("#wlcs").click();
  await expect(page.locator("#skx")).toContainText("Chicago, IL");
});

test("Use my exact location: the phone's location, named from the built-in list @mobile", async ({ page, context }) => {
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 40.1, longitude: -83.11 });
  await openSite(page, SETUPS.english, { welcome: true });
  await page.locator("#welcome-next").click();
  await page.locator("#welcome-mine").click();
  await expect(page.locator("#welcome-town-name")).toHaveText("Dublin, OH");
  expect((await prefs(page)).loc).toEqual({ lat: 40.1, lon: -83.11 });
});

test("the first reading language picked on step one, English staying the second @mobile", async ({ page }) => {
  await openSite(page, SETUPS.english, { welcome: true });
  await expect(page.locator("#welcome-lang-label")).toHaveText("Texts in");
  await expect(page.locator("#welcome-second")).toHaveText("and English");
  await expect(page.locator("#welcome-lang option")).toHaveCount(4);
  await expect(page.locator("#welcome-lang")).toHaveValue("mr");
  await page.locator("#welcome-lang").selectOption("te");
  await expect
    .poll(async () => {
      const p = await prefs(page);
      return [p.lead, p.l2, p.ind];
    })
    .toEqual(["mr", "en", "te"]);
  // the menus stay in English
  await expect(card(page)).toHaveAttribute("lang", "en");
});

test("Escape steps back, and on the first step closes it with the town as it is @mobile", async ({ page }) => {
  await openSite(page, SETUPS.english, { welcome: true });
  await page.locator("#welcome-next").click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#welcome-about")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(card(page)).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem("sankathara-welcome"))).toBe("2");
});

test("opened at a text (a shared link): no welcome, and the visit not counted @mobile", async ({ page }) => {
  await openSite(page, SETUPS.english, { welcome: true, hash: "#a1" });
  await expect(card(page)).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem("sankathara-welcome"))).toBeNull();
});

test("axe: both steps of the welcome, in every theme", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openSite(page, SETUPS.marathi, { welcome: true });
  expect(await axeEveryTheme(page, "#wlc")).toEqual(noViolations());
  await page.locator("#welcome-next").click();
  expect(await axeEveryTheme(page, "#wlc")).toEqual(noViolations());
});

for (const [name, size] of [
  ["a 320px phone", { width: 320, height: 568 }],
  ["a phone", { width: 390, height: 844 }],
  ["an upright iPad", { width: 820, height: 1180 }],
  ["a computer", { width: 1440, height: 900 }],
])
  test(`the welcome on ${name}: covers the screen, one column, 44px targets, Yes, start in reach`, async ({ page }) => {
    await page.setViewportSize(size);
    await openSite(page, SETUPS.marathi, { welcome: true });
    expect(await card(page).boundingBox()).toEqual({ x: 0, y: 0, width: size.width, height: size.height });
    const col = await page.locator("#welcome-about").boundingBox();
    expect(col.width).toBeLessThanOrEqual(440);
    expect(Math.abs(col.x + col.width / 2 - size.width / 2)).toBeLessThan(2);
    for (const sel of ["#welcome-lang", "#welcome-next"]) expect((await page.locator(sel).boundingBox()).height, sel).toBeGreaterThanOrEqual(44);
    await page.locator("#welcome-next").click();
    for (const sel of ["#welcome-back", "#welcome-mine", "#welcome-city", "#wlcs"])
      expect((await page.locator(sel).boundingBox()).height, sel).toBeGreaterThanOrEqual(44);
    await page.locator("#wlcs").scrollIntoViewIfNeeded();
    await expect(page.locator("#wlcs")).toBeInViewport();
    expect(await card(page).evaluate((e) => e.scrollWidth <= e.clientWidth)).toBe(true);
  });
