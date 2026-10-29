# Scripts

There is no build step: the browser loads these files as they are.

- `parts.js` and `render.js` are plain scripts. `render.js` turns the pieces' data into HTML (`renderPieces`) and holds the Kannada-letters switch (`SCR`).
- The texts are files (`../content/texts/`). `text/load.js` fetches them with `../content/library.json` and `../content/groups.json` (the reading page's groups), `text/content.js` turns them into the pieces' data (`CONTENT`, read with `text/format.js`), and `render.js` puts the pieces into the page. `main.js` waits for this before it starts the parts, so they find the page as if the pieces were written into it. These three are plain functions with no start-up work of their own; `text/format.js` and `text/content.js` touch no page at all, so the unit tests run them in Node.
- `main.js` is the site script. It is an ES module (`<script type="module">`), and it imports one part per topic from `core/`, `text/` and `features/` (and `store/`, the settings as data) (`features/overlays.js` is imported by the parts that use it).

## How the parts fit together

- Loading a part only defines its functions and variables. Each part's `init()` does its start-up work (reads the page, adds listeners), and `main.js` calls the `init()`s in a fixed order. That is the order the code ran in when it was one file (`app.js`), so a part can rely on everything above it in `main.js` being ready.
- A part imports what it uses from other parts by name, for example `import { P, change } from "../core/state.js"`. Functions can be imported in any order. A variable belongs to the part that sets it, and other parts only read it.
- `shared` (in `core/state.js`) holds the few values that several parts change: `skCache`, `skKey`, `rmkPop`, `FSA`, `fontN`, `LEAD` and `wl`. They are read and written as `shared.LEAD` and so on.
- The settings are `P` (`core/state.js`), saved on this device only (localStorage key `aarti2-prefs`). `apply()` (`features/bars.js`) turns `P` into the `data-*` switches on `<html>` that the styles react to (see `../css/README.md`).
- A new file must also be added to `parts.js`, so it is kept for offline use. `tests/site-files.spec.mjs` checks this.

## Parts, in start-up order

| File | What it does |
|---|---|
| `core/page.js` | Page basics: the <html> element, the short message (flash) |
| `core/state.js` | Settings (P), loaded from this device; `change()`, the one way the parts write them |
| `core/words.js` | Helpers for writing words on the page, shared by the parts that build their own HTML: `esc`, Devanagari digits (`dv`, `num`), the menu language (`ui`), the reading languages (`lead`, `second`), Marathi in the chosen script (`scr`, `scrKey`, `mrLang`) and the month and weekday names (`MONTHS`, `DAYS`). Pure, unit-tested in `tests/unit/words.test.mjs`; no `init()`. Use these rather than writing a copy in a part (as in Nitya Upasana; `text/content.js` keeps its own `esc`, so the text parser does not depend on the settings) |
| `store/migrate.js` | The settings as plain data: defaults, the upgrade of settings saved by older versions, the tidy-up (pure, unit-tested in `tests/unit/migrate.test.mjs`; no `init()`) |
| `core/features.js` | Features held back for a later release |
| `text/iast.js` | IAST transliteration (Devanagari → Latin with diacritics, Vedic accents as marks) |
| `text/layout.js` | Layout helpers that run once |
| `features/astronomy.js` | Astronomy for the Next Sankathara Chaturthi card |
| `features/date-card.js` | Next Sankathara Chaturthi card (computed on this device; works offline) |
| `text/dhrupad-markers.js` | Tappable dhrupad markers (every text with refrain: every-verse) |
| `text/stanza-numbers.js` | Stanza numbers |
| `text/line-breaks.js` | Preferred line breaks |
| `text/autofit.js` | Auto-fit text size |
| `core/apply.js` | Current piece, folds and menus |
| `features/bottom-bar.js` | Bottom bar (#asc) and autoscroll |
| `features/tilt.js` | Tilt to scroll (bottom bar, phones and tablets) |
| `features/bars.js` | Bars tuck away while reading (CSS: "Bars tuck away while reading"), and apply() |
| `features/settings-panel.js` | Settings panel: its rows, and its tabs Reading \| Screen \| More (`#spv`, `spTab()`; each `.sp-grp` says its tab), as in Nitya Upasana |
| `features/dhrupad-button.js` | Dhrupad: `refToggle()` switches once / after every stanza, keeping the reader's place (used by the Aa sheet and Settings; no `init()`) |
| `features/reading-sheet.js` | Reading sheet: Aa in the bottom bar slides up language, text size and dhrupad, within thumb reach |
| `features/wake-lock.js` | Keep the screen on (Wake Lock). Browsers drop the lock when the page is hidden, so it is re-requested. |
| `features/overlays.js` | Overlays: settings panel (setP, under the top bar) and the Library (setJ); opening one closes the other (no `init()`: used by bars, clicks, pinch, help and history) |
| `features/history.js` | Back button |
| `features/languages.js` | Settings page: languages |
| `features/contents-list.js` | The Library's list: every text under पूजा and आरती, built from the texts (`CONTENT.groups`); `libraryGroups()` also builds the left menu (`text/layout.js`) |
| `features/more-menu.js` | ⋯ in the top bar (as in Nitya Upasana): App, Share, QR and Help in a small menu; `focusBack()` sends focus to ⋯ when a pop-up opened from it closes |
| `features/clicks.js` | Clicks: contents links (data-go) jump to a piece; tapping a verse line highlights it |
| `features/pinch.js` | Pinch with two fingers to change the text size (the page itself never zooms) |
| `text/search-core.js` | Search rules and ranking, without the page (the same file as in Nitya Upasana; tests/unit/search.test.mjs): svara marks and punctuation ignored, forgiving spellings, a typo forgiven, Devanagari typed matched through its English letters |
| `text/search.js` | Search: builds the index from every Marathi line with its English line, and shows the results (rules in `search-core.js`) |
| `core/startup.js` | Start-up |
| `features/picture-viewer.js` | Full-screen picture (#pzv): pinch or double-tap to zoom (1x to 5x), drag to move |
| `features/help.js` | Help: opens over the page; the phone's Back button closes it |
| `features/print.js` | Print: the print builder (What, then How: language, dhrupad, page, font, preview, paper) and the print view (`#pv`) it writes, laid out by `../css/15-print.css` (see *Printing* in `../ARCHITECTURE.md`) |
| `print/what.js` | The print builder's What step (as Nitya Upasana's, its Library tab): the texts under पूजा and आरती with ticks, search, Select all and Clear (no `init()`: `features/print.js` creates it) |
| `features/share.js` | Share, QR code and the Add to Home Screen buttons |
| `features/offline.js` | Offline use: home-screen app details and the service worker (sw.js) |

`npm run lint` in `tests/` checks every file for mistakes, and for browser features that the oldest supported browsers (iOS 15.4) lack.
