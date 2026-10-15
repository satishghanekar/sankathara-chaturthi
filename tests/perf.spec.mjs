// Performance on a slowed-down phone (Chromium, CPU 4× slower, iPhone-size screen).
// Measures the browser's own counters for the page load and for the two most common taps
// (language button, text size), and checks them against the budgets in section 5 of the plan.
// Lighthouse CI (lighthouserc.json) checks the Core Web Vitals on top of this.
import { test, expect } from "@playwright/test";
import { openSite, SETUPS } from "./helpers.mjs";

// Budgets (milliseconds of main-thread work on a 4× slowed CPU)
export const BUDGET = {
  loadStyleLayout: 1500, // style recalculation + layout during load
  loadTask: 3000, // all main-thread work during load
  tap: 200, // one language switch or text-size change (Interaction to Next Paint target)
};

async function metrics(cdp) {
  const { metrics } = await cdp.send("Performance.getMetrics");
  const m = Object.fromEntries(metrics.map((x) => [x.name, x.value]));
  return { layout: m.LayoutDuration * 1000, style: m.RecalcStyleDuration * 1000, script: m.ScriptDuration * 1000, task: m.TaskDuration * 1000, nodes: m.Nodes };
}
const diff = (a, b) => Object.fromEntries(Object.keys(a).map((k) => [k, Math.round(b[k] - a[k])]));

test("load and taps stay within budget on a slow phone @chromium-only", async ({ browser }) => {
  // Recorded before the refactor: load style+layout 2.7 s, load work 4.5 s, language switch 1.5 s
  test.fail(true, "over budget before the performance work (audit P1–P4)");
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: "block" });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Performance.enable");
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  const t0 = await metrics(cdp);
  await openSite(page, SETUPS.marathi);
  await page.waitForTimeout(1500);
  const load = diff(t0, await metrics(cdp));

  const t1 = await metrics(cdp);
  await page.locator("#home-btn").click();
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0))));
  const lang = diff(t1, await metrics(cdp));

  await page.locator("#aa").click();
  await page.locator("#lg").click();
  await page.waitForTimeout(800); // the page under Settings is re-laid out once the taps stop
  const t2 = await metrics(cdp);
  await page.locator("#xc").click();
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0))));
  const size = diff(t2, await metrics(cdp));

  const report = { load, lang, size, domNodes: Math.round((await metrics(cdp)).nodes) };
  console.log(JSON.stringify(report));
  test.info().annotations.push({ type: "metrics", description: JSON.stringify(report) });
  expect(load.style + load.layout, "style + layout during load").toBeLessThan(BUDGET.loadStyleLayout);
  expect(load.task, "main-thread work during load").toBeLessThan(BUDGET.loadTask);
  expect(lang.task, "language switch").toBeLessThan(BUDGET.tap);
  expect(size.task, "closing Settings after a text-size change").toBeLessThan(BUDGET.tap * 2);
  await context.close();
});
