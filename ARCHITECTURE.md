# How the site is built

This is for anyone changing the code. To change a piece's text, see `README.md` instead.

The site is one page, `index.html`, plus plain CSS and JavaScript files. **There is no build step.** Cloudflare Pages serves the files exactly as they are in the repository, so an edit made on the GitHub website goes live as written.

## What happens when the page opens

1. **`<head>`** loads the 11 style files in `css/` in number order, then `js/parts.js`, the one list of the site's files. `modulepreload` links fetch the script parts in parallel.
2. **`<body>`** has the top bar, Settings, the home page and the dialogs, written in HTML. Help's text sits in a `<template>` and is only laid out when Help is first opened.
3. **At the end of `<main>`**, `#pieces` marks where the pieces go, and the plain script `js/render.js` defines `renderPieces` (the pieces' HTML) and `SCR` (Kannada letters).
4. **`js/main.js`** (`<script type="module">`) starts the site script. First `js/text/load.js` fetches `content/library.json`, `content/groups.json` (which texts the page shows under पूजा and आरती) and the text files in `content/texts/`, `js/text/content.js` builds `CONTENT` from them (reading each file with `js/text/format.js`), and `renderPieces` puts the pieces in place of `#pieces` (rewritten in Kannada letters when chosen). Only then does it call each part's `init()` in a fixed order (listed in `js/README.md`), and set `data-ready` on `<html>`. So every part finds the pieces in the page, as if they had been written in the HTML. If the texts can't be loaded, the parts start anyway.
5. **Until `data-ready` is set, the page is hidden.** The reader's theme, languages and folds, the fitted text size and the date card all arrive in step 4. Showing the page before that made the home page jump down by about 90px on a phone (layout shift 0.13). If the script never runs, the page shows after 1.5 s anyway.
6. **After the page is shown:**
   - The service worker (`sw.js`) saves the site for offline use.
   - Fonts that arrive late trigger one refit of the text size.
   - The print view is warmed up in an idle moment.

## Where the state lives

- **`P`** (`js/core/state.js`) holds everything the reader chose: languages, theme, font, text size, folds, the highlighted line, and so on.
  - It is saved on the device only, in `localStorage["aarti2-prefs"]`. Nothing is ever sent anywhere.
  - `P.sv` is the settings version. `js/store/migrate.js` (as in Nitya Upasana, without its profiles) has the defaults, the steps that upgrade settings saved by older versions of the site, and the tidy-up; a saved value of the wrong kind is never trusted. It is pure, so `tests/unit/migrate.test.mjs` checks it against the settings every older version saved.
- **`apply()`** (`js/features/bars.js`) is the only place that turns `P` into the page.
  - It sets the `data-*` switches the styles react to: `data-lang` on each region, and `data-ref`, `data-cols`, `data-rail`, `data-font`, `data-pref` and `data-hc` on `<html>`.
  - It sets `--fs`, the text size.
  - Anything that changes a setting calls `change({ … }, then)` (`js/core/state.js`, as in Nitya Upasana): the values go into `P`, `then` (usually `apply()`) brings the page up to date, and everything is saved. Only the size while a pinch is under way, the auto-fit's size and start-up repairs write `P` directly.
- **Auto-fit** (`js/text/autofit.js`) works out the largest text size at which every verse line fits the screen on one row. On phones the default is 110% of that (`phoneBoost()` in `js/core/state.js`, 2026-10-25), so a few long lines wrap; it still shows as 100%.
  - It measures all lines at once in a hidden copy, so the page is laid out only once.
  - It remembers each result per language, font, layout and window size.
  - It is skipped when the reader has chosen a size (`P.fsu`).
- **`shared`** (`js/core/state.js`) holds the seven values that more than one part changes. A JavaScript module can only change its own variables, so these live in one object everyone can write to.
- **The styles** read only those switches and variables. `css/README.md` lists them and explains the one rule for editing: a later rule for the same element wins, so change the last one.

## Printing

The Print button opens the Print pop-up (`#prm`, `js/features/print.js`). It writes a separate print view (`#pv`) of the texts ticked, laid out as chosen, and prints it. The browser's own Print menu prints every text the same way. Nothing is measured or laid out ahead: the browser breaks the pages, by fixed rules, as in Nitya Upasana, which this follows (Satish, 2026-10-28: the page planner, the line fitting, the page numbers in the contents and the page border were taken out as too complicated).

### The rules every printout follows

These hold for every text, so a new text prints correctly as soon as its file exists; nothing in the print code names a text.

1. **What prints comes from what each part of a text is, never from what the reading page shows.** Every piece is in the page, folded or not; `parts()` gives each part a role: the dhrupad at the top, a stanza, a line said once, a closing line (`[dhrupad bold]`), the dhrupad's ↻ marker or its repeat after a stanza, and a note of the text's own (`[note: …]`). The printout's dhrupad choice decides: *Once* prints the dhrupad at the top and the markers, *Every verse* the repeats instead. Notes always print.
2. **Markup of its own.** The print view is written in `pv…` classes only (`write()`), so nothing of the reading page's look reaches the paper: its whole look is `css/15-print.css`, with fixed sizes.
3. **Blocks.** The parts are grouped into blocks (`.pvk`), each never split between pages: a heading note with what follows it; a marker, a repeat or a "↻ 3 times" with the stanza before it; the dhrupad at the top with the first stanza. A Vedic paragraph (`.pvflow`, the Atharvashirsha), or its rows side by side, runs on from page to page between lines, never leaving one line alone (`orphans`, `widows`).
4. **Pages.** Every text, and the contents, starts on a new page; within a text the browser breaks the pages, keeping each block whole and each side-by-side row whole.
5. **Layouts.** One language, an aarti: the stanzas in one column centred on the page, every line centred as on the reading page (`.pvcol`); the dhrupad at the top with a line beside it, the repeats lighter, the credit inside the last block. One language, the Atharvashirsha (`layout: prose`): running paragraphs with room for the svara marks (`.pvpr`). Both languages: Landscape, side by side, each line beside its English (`.pvt`).
6. **The contents** list the texts chosen under पूजा and आरती, two to a row, each row one box that never splits between pages, without page numbers (a browser cannot say where its pages break). One text on its own prints without contents.
7. **No spans around spaces.** Safari prints a space beside an element's edge so narrow that two words run together: a danda is kept with its word by no-break spaces in the text (`glue()`).
8. **No ↻ in the original language.** Safari draws ↻ from a Devanagari font as a mark that reads as ७, so a marker prints as just "ध्रुपद" (English keeps "↻ Refrain").
9. **No page frame.** Safari cannot repeat anything on every printed page, so no browser gets a frame round the page. Each page has its "N / total" footer (Chrome, Edge, Firefox).
10. **No made-up bold.** `#pv` has `font-synthesis: none`; the printout's fonts are asked for ahead (`fontsAhead()`), as a browser prints only the faces it has loaded.

- **The pop-up:** What to print (a tick for each text under पूजा and आरती, Select all and Clear; `P.pskip` keeps the texts left out, so a new text prints), Dhrupad (Once or Every verse, for the printout only: `P.pref`), Page (for one language Portrait or Landscape, `P.por`; both languages: Landscape, side by side) and Print font (`P.pfn`, with a sample line). Nothing ticked: Print says "Pick at least one text".
- **Portrait or Landscape:** `@page { size: landscape }` is set for each printout (`setPage()`) for Chrome, Edge and Firefox. Safari keeps the sheet picked in its own dialog, so when Landscape is chosen the pop-up tells Safari readers to pick it there too.
- **Printing on an iPhone:** Safari opens the print dialog only in answer to a tap. The print view is written at once, so Print prints from that tap; should a browser still ignore it, the pop-up asks for one more tap (Ready: Print now). The Home Screen app cannot print at all, so Print there goes to Open in Safari, with the print choices (the texts ticked too) in the address (read by `js/render.js`).
- **Paper size:** Letter in the US, Canada, Mexico and the Philippines, A4 elsewhere (`LTR`); the pop-up names it.
- **Print font:** the pop-up's font picker sets `P.pfn`, the printout's font only (empty: the text font). The page takes it as `data-font` just while it prints (`pon()`/`poff()`), and `css/15-print.css` sets each language's face from it. Print dhrupad: `P.pref` works the same way, through `data-ref`.
- **Tests:** `tests/print.spec.mjs` prints every layout × font to PDF (Portrait on Letter and A4, Landscape on Letter or A4 by turns) and checks the PDF: every text printed, listed in the contents and starting on a new page; no block split; every English line of every text on paper, read against the texts themselves (`sourceLines`); the footers; nothing screen-only. It also checks What to print, the pop-up and the iPhone paths.

## Offline use and updates

- `sw.js` keeps the page, every file in `js/parts.js` and every font file in a cache named after the version (`aarti-v1.2`).
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
