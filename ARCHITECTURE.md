# How the site is built

This is for anyone changing the code. To change a piece's text, see `README.md` instead.

The site is one page, `index.html`, plus plain CSS and JavaScript files. **There is no build step.** Cloudflare Pages serves the files exactly as they are in the repository, so an edit made on the GitHub website goes live as written.

## What happens when the page opens

1. **`<head>`** loads the 11 style files in `css/` in number order, then `js/parts.js`, the one list of the site's files. `modulepreload` links fetch the script parts in parallel.
2. **`<body>`** has the top bar, Settings, the home page and the dialogs, written in HTML. Help's text sits in a `<template>` and is only laid out when Help is first opened.
3. **At the end of `<main>`**, three plain scripts build the pieces:
   - `content/pieces.js` holds the text of every piece (`CONTENT`).
   - `js/render.js` turns it into HTML (`renderPieces`). When Kannada letters are chosen, it rewrites the Devanagari in place (`SCR`).
   - A short inline script puts the result into the page.

   The pieces are therefore in the page as it is parsed, as if they had been written in the HTML.
4. **`js/main.js`** (`<script type="module">`) starts the site script. It calls each part's `init()` in a fixed order (listed in `js/README.md`), then sets `data-ready` on `<html>`.
5. **Until `data-ready` is set, the page is hidden.** The reader's theme, languages and folds, the fitted text size and the date card all arrive in step 4. Showing the page before that made the home page jump down by about 90px on a phone (layout shift 0.13). If the script never runs, the page shows after 1.5 s anyway.
6. **After the page is shown:**
   - The service worker (`sw.js`) saves the site for offline use.
   - Fonts that arrive late trigger one refit of the text size.
   - The print view is warmed up in an idle moment.

## Where the state lives

- **`P`** (`js/core/state.js`) holds everything the reader chose: languages, theme, font, text size, folds, the highlighted line, and so on.
  - It is saved on the device only, in `localStorage["aarti2-prefs"]`. Nothing is ever sent anywhere.
  - `P.sv` is the settings version. The migrations below it in `state.js` upgrade settings saved by older versions of the site.
- **`apply()`** (`js/core/apply.js`) is the only place that turns `P` into the page.
  - It sets the `data-*` switches the styles react to: `data-lang` on each region, and `data-ref`, `data-cols`, `data-rail`, `data-font`, `data-pref` and `data-hc` on `<html>`.
  - It sets `--fs`, the text size.
  - Anything that changes a setting updates `P`, calls `save()`, then calls `apply()`.
- **Auto-fit** (`js/text/autofit.js`) works out the largest text size at which every verse line fits the screen on one row.
  - It measures all lines at once in a hidden copy, so the page is laid out only once.
  - It remembers each result per language, font, layout and window size.
  - It is skipped when the reader has chosen a size (`P.fsu`).
- **`shared`** (`js/core/state.js`) holds the seven values that more than one part changes. A JavaScript module can only change its own variables, so these live in one object everyone can write to.
- **The styles** read only those switches and variables. `css/README.md` lists them and explains the one rule for editing: a later rule for the same element wins, so change the last one.

## Printing

The Print button builds a separate print view (`#pv`, in `js/features/print.js`) for the chosen layout. Printing from the browser's own menu builds the same view.

- **Page planning:** the view measures every unbroken block (stanza, verse group) in a frame the size of the printed page, then packs the blocks onto pages. That is how no block is split across pages and the contents page gets real page numbers.
- **Paper size:** Letter in the US, Canada, Mexico and the Philippines, A4 elsewhere (`LTR`).
- **Safari and every iPhone or iPad browser** ignore CSS columns when printing, and they split table rows across pages. On them (class `wk` on `<html>`), two-column layouts are built from inline blocks, which cannot be split.
- **Safari on a Mac** prints about 16/15 larger than Chrome, and the page plan allows for that.
- **Tests:** `tests/print.spec.mjs` prints every layout × font × paper to PDF and checks where every block landed (see `tests/README.md`).

## Offline use and updates

- `sw.js` keeps the page, every file in `js/parts.js` and the main fonts in a cache named after the version (`aarti-v1.0`).
  - The page and its parts are always fetched fresh when possible, with a 3 s limit before the saved copy is used, so the page never mixes old and new parts.
  - Everything else comes from the saved copy and is refreshed in the background.
  - If the saved copy cannot be read within 2 s, the request goes to the network. Safari's storage can stall, and a Mac once sat on a blank page because of it.
- **The version is written twice on purpose:** in `sw.js` (`V`) and in `<meta name="version">` in `index.html`.
  - Browsers install a new service worker when `sw.js` itself changes. Not every browser re-checks the files it imports, so the version must sit in `sw.js`.
  - The page needs the version at start-up too.
  - `tests/offline.spec.mjs` fails if the two differ.
- **`_headers`** lets phones keep font files for a year and pictures for a week without asking again. The page, styles and scripts are always re-checked (`no-cache`), so an update reaches readers on their next visit.

## Oldest supported browsers, and the fallbacks they need

The floor is **iOS 15.4** (iPhone 6s / 7, iPad Air 2 / mini 4 run up to iOS 15.8). The list is in `tests/.browserslistrc`. `npm run lint` fails on any CSS or JavaScript feature those browsers lack, unless the code checks for it first.

| Fallback | Why |
|---|---|
| `css/99-fallbacks.css` | `color-mix()` needs iOS 16.2. Without these plain colours, buttons and cards on iOS 15 lose their colours. The file must stay last. |
| `vh` before `dvh` / `svh` | Older Safari has no dynamic viewport units. |
| `setTimeout` when there is no `requestIdleCallback` | Safari has no `requestIdleCallback`, so the print warm-up just waits a moment. |
| Class `wk` on `<html>` | WebKit's print layout (see Printing). |
| `meta[name="version"]` read with a default | The page still runs if the tag is missing. |
| 1.5 s reveal | The page shows even if the site script fails to start. It also works when the phone asks for reduced motion, which turns off every other animation. |

## Things tried and rejected

- **`content-visibility: auto`** on the pieces, to skip laying out pieces off screen. It changes how margins collapse, which moved pieces 10–22px, and text inside skipped content reads back empty.
- **Reordering the CSS by topic.** The cascade depends on the order rules were added, and moving rules caused about 12,000 conflicts. The CSS was split where it stood instead.
- **An SVG sprite for repeated icons.** The page has 41 icons, of which 28 are different. Compression already makes the repeats almost free, and `<use>` inside buttons behaves differently in older Safari.
- **Moving the version into `js/parts.js` only.** See *Offline use and updates*.

## Checking a change

- `cd tests && npm run lint && npm test` runs the checks on a computer.
- GitHub runs every browser on each pull request.
- `tests/README.md` says what each suite protects and how to refresh screenshots.
- `tests/MANUAL.md` is the short checklist for real phones and screen readers.
