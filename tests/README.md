# Tests

Automated checks for the site. The site itself has no build step; everything here only **tests** the files at the repository root, served exactly as Cloudflare Pages serves them. All the tooling (including `package.json`) lives in this folder, so Cloudflare never installs or builds anything.

## Running

```sh
cd tests
npm ci                               # once
npx playwright install chromium      # once (add firefox webkit for the other engines)
npm run full                         # the full run, before every merge: lint, types, logic tests and every browser suite
npm test                             # Chromium only, the default on a computer
npm run lint                         # stylelint, eslint and the Prettier check, as CI runs it
npm run format                       # Prettier lays out the scripts, styles and tests (tests/prettier.config.mjs)
npm run unit                         # Vitest: the logic tests in unit/ (no browser, a second or two)
npm run types                        # TypeScript checks the JavaScript files that start with // @ts-check (nothing is compiled)
npm run engines                      # every engine, as CI runs it (PW_PROJECTS=chromium,firefox,webkit,iphone,ipad,pixel; install them first)
npx playwright test print.spec.mjs   # one suite
npx playwright test -g "kannada"     # tests whose name matches
SAVE_PDFS=1 npx playwright test print.spec.mjs   # also keep every printed PDF in tests/pdfs/ to look at
npm run lhci                         # Lighthouse CI: CLS and TBT (median of 3) fail the run; score and LCP warn
npm run sister                       # still in line with the sister app (Nitya Upasana, in the folder beside this one)?
```

`npm run sister` (`tools/sister-check.mjs`, the same file in both apps) compares every script, style and test the two apps share with `tools/sister-baseline.json`: how many lines differed when they were last brought in line. A file further apart than that has drifted, most often a fix made in one app only: bring it to the other, then `npm run sister -- --update` and copy the baseline to the other app.

`npm test` starts a small static server (`serve.mjs`, port 4173) by itself. On a failure, `npx playwright show-report` opens the details, with a trace of every step.

On GitHub every pull request and every push to `main` runs everything (`.github/workflows/tests.yml`, in the `mcr.microsoft.com/playwright:v1.64.1-noble` image, kept in step with `@playwright/test` in `package.json`): lint, Chromium, Firefox, WebKit (Safari's engine), iPhone, iPad and Pixel emulation, and Lighthouse. **Not every suite runs in every engine** (`playwright.config.mjs`, as in Nitya Upasana, 2026-11-11): Chromium runs them all, in two jobs; the suites where engines differ, how the page is drawn and printed (smoke, layout, text size, edge cases, compatibility, print view, fonts), run in every engine; interactions, accessibility and offline in WebKit too, as most readers are on iPhones; the iPhone runs every `@mobile` test; the Library's list, the texts' words and the site's files, plain JavaScript, run once. A new suite goes into `ENGINE` or `FLOWS` there if an engine could change what it checks. That is 803 runs a pass, from 961.

## The suites

| File | What it protects |
|---|---|
| `fonts.spec.mjs` | The text fonts as drawn: Chrome's own report of the fonts each element is drawn in, for every text font (Modern, Traditional, Bold), every script, with the English in IAST, on screen and in print: each column mostly in its font, Traditional's bold dhrupad in its own bold, nothing from the phone's fonts (as in Nitya Upasana). |
| `smoke.spec.mjs` | The site opens with no script errors in every language set-up. |
| `content.spec.mjs` | Every line of every piece, exactly, in Marathi, English (both spellings), Kannada and Both; the home page text; every line has a unique id and a partner in the other language. |
| `print.spec.mjs` | **Print and PDF** (see below). Chromium only: no other engine makes a PDF. |
| `print-view.spec.mjs` | The printout in every engine (Firefox and WebKit too): after Print, in print media only the print view shows, with every text and its contents, each text on a new page and no block left splittable. |
| `layout.spec.mjs` | 13 screens from a 320 px phone to a 2560 px monitor, portrait and landscape, × 3 language set-ups: no sideways scroll, bars on screen, readable text, no line wider than the screen; 44 px tap targets; the bars' words keep their contrast on the pills in every theme. |
| `visual.spec.mjs` | 42 screenshots compared pixel by pixel: home, pieces, two columns on wide screens, side menu, Settings, search, Help, dialogs, every theme, font and language arrangement, and the print layouts. |
| `interactions.spec.mjs` | The top bar (Share, Settings), the Share menu (Print is in it), Settings' tabs and Show / Dhrupad, the Library, search (Marathi and English letters, forgiving spelling), Settings (theme, contrast, font, size, languages, IAST), folds remembered, line highlight, Prev / Next, dialogs, picture viewer, date card, reopening where you were. The version line: its state under the version and the 44px round button beside them. |
| `a11y.spec.mjs` | axe-core (WCAG 2.2 A/AA + best practice) on 16 screen states; every dialog fully usable with Tab and Escape; skip link; accessible names contain the visible label (WCAG 2.5.3, by our own test; axe's rule is off because it counts letters drawn inside icons); reduced motion; languages marked for screen readers. |
| `offline.spec.mjs` | The site works with no internet after one visit; "Offline ready" only once every file is saved; a repeat launch comes wholly from the saved copy without asking the network; Check for updates saves a changed file and reloads with it (on WebKit, asks to close and reopen the app instead, and How? opens the steps over Settings: this device's first, Escape closing only them); the splash shows until the page is ready; the version in `index.html` and `sw.js` match. |
| `text-size.spec.mjs` | The text's size, as in Nitya Upasana: the default on a small phone, an iPhone, an iPad, a computer and a large screen; every text at the same size whichever opens first (100% that size); a chosen size kept; the reader's own larger text size enlarging the text and the menus alike; a long line wrapping with its rows closer than two lines. |
| `edge.spec.mjs` | The Phase 3 audit's edge cases: the menus' sizes only from the six in `css/01-theme.css`; an iPhone 16 Pro notch upright and sideways; pressed and hovered text readable in all 5 themes; keyboard focus never hidden behind the bars; layout shift after the page appears; 360 to 7680 px wide; what screen readers are told (size, search results, notes); Windows High Contrast focus rings; WCAG text spacing; printing with the keyboard alone; limits on `!important` and breakpoints. |
| `compat.spec.mjs` | The oldest supported browsers (iOS 15.4): fallbacks for `color-mix()` and what a linter can't check. |
| `site-files.spec.mjs` | `js/parts.js` matches the page's own `<link>` and `<script>` tags, and every listed file exists, so the offline copy is never missing a file; and the size budget: the scripts, styles and `index.html`, gzipped, under their limits (raise one only in the change that needs it); and every script starts with `// @ts-check`, so `npm run types` checks it. |
| `library.spec.mjs` | The Library, as in Nitya Upasana (its tests): the search box at the foot of the screen on phones and tablets with no scroll between them (at the top on wide screens), each search's best results at the top and above the keyboard, and Recent (a text, then a line, × and Clear, kept after a reload). |
| `perf.spec.mjs` | How many times the page is laid out during load, for each language-button tap and when Settings closes (4× slowed CPU). Layout counts are the same on every machine, so this never fails because a computer was busy; the milliseconds and the tap response time are attached to the result for comparison. |

### Print tests

Printing is checked the way a reader does it: the site's own Print button, then a choice in the pop-up. The test stops the real print dialog, prints the page to PDF in Chromium at the reader's paper size (Letter in the US, Canada, Mexico and the Philippines, A4 elsewhere), and reads the PDF back. Before printing it adds invisible markers at the start and end of every unbroken block, so it can see exactly where each piece and block landed.

The grid is every **Portrait** printout (Marathi, English) × every **text font** (Traditional, Modern, Bold) × **Letter and A4**: 12 PDFs. **Landscape** (Marathi, English, Marathi and English side by side, Kannada and English side by side) × every text font, on Letter or A4 by turns, with the same checks. On top of that: the scholarly spelling (IAST), English as the main language, Kannada (single column, also on A4 and sideways), dhrupad after every verse, Marathi menus, everything folded on screen, printing from the browser's own menu (Ctrl/⌘ P), and Safari's page plan. In each PDF:

- every text chosen is printed, in reading order, listed in the contents and starting on a new page, even when folded on screen;
- no block (a heading with its dhrupad and first stanza, a stanza with its marker or repeat) is split across pages; a Vedic paragraph may run on between lines;
- every block of every text is printed;
- every page has its "N / total" footer;
- screen-only controls (Open all, Settings, …) never print;
- every English line is in the PDF, read against the texts themselves (Devanagari and Kannada text can't be read back reliably from a PDF, so for those the block markers show nothing was lost);
- the page count matches the recorded baseline;
- the print builder (as in Nitya Upasana): What then How on a phone, side by side on a wide screen; only the texts ticked print, one alone without contents, none ticked waits; a group's Select all and Clear; Marathi menus; the printout's language; the preview and the paper; the star on the recommended choices, the hints under Dhrupad and Page, and "about N pages", which must be the pages of the PDF (the count's rules are unit-tested in `unit/pages.test.mjs`); Open in Safari carries the texts ticked.

## Baselines

Text, screenshots and print summaries are kept in `__snapshots__/`. They are the accepted look of the site (first recorded before the 2026-10 refactor, to prove it changed nothing a reader can see). When you change something on purpose (a new line, a new colour), update them and check the diff in the pull request. The text snapshots can be updated on your computer; on a Mac the pictures and print summaries are skipped, so this leaves them alone (they come from CI, below):

```sh
npx playwright test --update-snapshots
```

Screenshots and print summaries depend a little on the machine (font smoothing, and the odd line that lands one page later in a PDF), so they are kept for one machine type: `ci/`, in `__snapshots__/visual.spec.mjs/chromium/` and `__snapshots__/print.spec.mjs/chromium/`. The text snapshots are the same everywhere and are shared.

- **`ci/`** is used by the GitHub test run, which runs in Playwright's Docker image, and by any other Linux machine (a Claude session in the cloud). To refresh it, push a commit to a branch with `[update-snapshots]` in its message. The *Update CI snapshots* workflow (`.github/workflows/update-snapshots.yml`) then takes new screenshots on GitHub and commits them to that branch. Look at the changed pictures in the pull request before merging. Never run `--update-snapshots` on your own machine: its pictures would replace CI's.
- **On a Mac** the screenshots are skipped and the print summaries are not compared (`MAC_SKIPS_PIXELS` in `helpers.mjs`): a Mac's text is drawn a little differently, so they could never match. Everything else in those tests still runs, and CI compares them on every push. (A Mac's own set, `local/`, was kept until 2026-11-02; nothing used it, so it went out of date and was removed.)
- The print tests check where every text starts and that no block is split, against the PDF on every machine, so a summary that differs between machines is still a correct printout.
- `SNAPSHOT_ENV=ci` compares on a Mac anyway (expect differences).

## What automation can't cover

Real devices and screen readers: see [MANUAL.md](MANUAL.md), a short checklist for each release.
