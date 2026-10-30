# Scripts

There is no build step: the browser loads these files as they are.

- `parts.js`, `splash.js` and `render.js` are plain scripts. `splash.js` sets up the splash shown until the page is ready (`#spl`: the app's picture with its lamps lit in turn) and puts the reader's theme on `<html>` early. `render.js` turns a piece's data into HTML (`renderPiece`, called by `core/page.js` and by `print/compose.js`) and holds the Kannada-letters switch (`SCR`; `SCR.add` puts a piece just built into the chosen script).
- The texts are files (`../content/texts/`). `text/load.js` fetches them with `../content/library.json`, `../content/categories.json` (the reading page's sections) and `../content/routines.json` (the evening, into `loaded`), `text/content.js` turns them into the pieces' data (`CONTENT`, read with `text/format.js`), and `core/page.js` builds the pieces into the page with `render.js`. `main.js` waits for the texts before it starts the parts. These three are plain functions with no start-up work of their own; `text/format.js` and `text/content.js` touch no page at all, so the unit tests run them in Node.
- `main.js` is the site script. It is an ES module (`<script type="module">`), and it imports one part per topic from `core/`, `text/` and `features/` (and `store/`, the settings as data) (`features/overlays.js` is imported by the parts that use it).

## How the parts fit together

- Loading a part only defines its functions and variables. Each part's `init()` does its start-up work (reads the page, adds listeners), and `main.js` calls the `init()`s in a fixed order. That is the order the code ran in when it was one file (`app.js`), so a part can rely on everything above it in `main.js` being ready. Each `init()` runs on its own (`run()`): one that throws is reported in the console and the parts after it still start.
- A part imports what it uses from other parts by name, for example `import { P, change } from "../core/state.js"`. Functions can be imported in any order. A variable belongs to the part that sets it, and other parts only read it.
- A value several parts read belongs to the one part that sets it, and the others import it (an imported variable can be read, not changed), as in Nitya Upasana: `FSA` (the fitted text size) and `fontsNow()` in `text/autofit.js`, `rmkPop` (the open dhrupad bubble) in `text/dhrupad-markers.js`, `skCache` (the next Sankathara Chaturthi) in `features/date-card.js`, and `LEAD` (the leading language, set by `apply()` through `setLead()`) in `core/state.js`.
- The settings are `P` (`core/state.js`), saved on this device only (localStorage key `aarti2-prefs`). `apply()` (`features/bars.js`) turns `P` into the `data-*` switches on `<html>` that the styles react to (see `../css/README.md`).
- A new file must also be added to `parts.js`, so it is kept for offline use. `tests/site-files.spec.mjs` checks this.

## Parts, in start-up order

| File | What it does |
|---|---|
| `core/page.js` | Page basics: the <html> element, the short message (flash), and the pieces on the reading page, as in Nitya Upasana: Nitya Upasana's file: `pieceEl(id)` builds a piece the first time it is opened, `onPiece(fn)` is how a part adds its step for each piece built, `secs` the pieces built so far |
| `core/state.js` | Settings (P), loaded from this device; `change()`, the one way the parts write them; `LEAD`, the language read first (set by `apply()` through `setLead()`) |
| `core/words.js` | Helpers for writing words on the page, shared by the parts that build their own HTML: `esc`, Devanagari digits (`dv`, `num`), the menu language (`ui`), the reading languages (`lead`, `second`), Marathi in the chosen script (`scr`, `scrKey`, `mrLang`) and the month and weekday names (`MONTHS`, `DAYS`). Pure, unit-tested in `tests/unit/words.test.mjs`; no `init()`. Use these rather than writing a copy in a part (as in Nitya Upasana; `text/content.js` keeps its own `esc`, so the text parser does not depend on the settings) |
| `core/strings.js`, `strings/en.js`, `strings/mr.js`, `strings/kn.js`, `strings/te.js`, `strings/gu.js` | The menu words in every menu language (the catalog), as in Nitya Upasana: one file per language in `strings/`, each part's words under its name (`page` holds `index.html`'s, `language` the language's own name); `menuWords(part)` gives them in the menu language, a word a language lacks taken from English; `fillWords()` fills the page's `data-w` words; `LANGS` is the list Settings offers. A new menu language is a new file and a line in `LANGS` (`ARCHITECTURE.md`). Unit-tested in `tests/unit/strings.test.mjs`; no `init()` |
| `core/routine.js` | Which texts a session has (`textsFor`), as in Nitya Upasana's (the part this site uses: no routine builder); pure, unit-tested in `tests/unit/content.test.mjs`; no `init()` |
| `store/migrate.js` | The settings as plain data: defaults, the upgrade of settings saved by older versions, the tidy-up (pure, unit-tested in `tests/unit/migrate.test.mjs`; no `init()`) |
| `core/features.js` | Features held back for a later release |
| `text/iast.js` | IAST transliteration (Devanagari → Latin with diacritics, Vedic accents as marks), Nitya Upasana's file: each piece's English lines and titles in the chosen style as it is built (`onPiece`), `trSet()` to switch, `englishStyle()` for a copy out of the page, `titleText()` for a title as its heading shows it |
| `text/layout.js` | Layout helpers that run once |
| `features/astronomy.js` | Astronomy for the Next Sankathara Chaturthi card |
| `features/date-card.js` | Next Sankathara Chaturthi card (computed on this device; works offline) |
| `text/dhrupad-markers.js` | Tappable dhrupad markers (every text with refrain: every-verse) |
| `text/stanza-numbers.js` | Stanza numbers |
| `text/line-breaks.js` | Preferred line breaks |
| `text/autofit.js` | Auto-fit text size |
| `core/apply.js` | Nitya Upasana's file: the current piece (`cur()`), each piece's fold button (`foldSet()`, `unfold()` when it is gone to) and the menus |
| `features/bottom-bar.js` | Bottom bar (#asc): ‹ Prev, Home, Library, Aa, Next ›, as in Nitya Upasana |
| `features/bars.js` | Bars tuck away while reading (CSS: "Bars tuck away while reading"), and apply() |
| `features/settings-panel.js` | Settings panel: its rows, and its tabs Reading \| Screen \| More (`#spv`, `spTab()`; each `.sp-grp` says its tab), as in Nitya Upasana |
| `features/dhrupad-button.js` | Dhrupad: `refToggle()` switches once / after every stanza, keeping the reader's place (used by the Aa sheet and Settings; no `init()`) |
| `features/reading-sheet.js` | Reading sheet: Aa in the bottom bar slides up language, text size and dhrupad, within thumb reach |
| `features/wake-lock.js` | Keep the screen on (Wake Lock). Browsers drop the lock when the page is hidden, so it is re-requested. |
| `features/overlays.js` | Everything that opens over the page, listed once, as in Nitya Upasana (no `init()`): `LAYERS` (which keep Tab inside, which the phone's Back closes), and the two pages, Settings (`setP`) and the Library (`setJ`), opened and closed one way; read by `history.js` and `bottom-bar.js` |
| `features/history.js` | Back button, and where the page is, as in Nitya Upasana: `jumpTo()`, Home on its own (`homeView()`), and one text at a time (`solo()`) |
| `features/languages.js` | Settings page: languages |
| `features/session-card.js` | Home: the session's texts (`content/routines.json`; Morning \| Afternoon \| Evening once two or more have texts), as Nitya Upasana's Today card lists a session; a title reads the session from there (`data-run`, `sessionStep()` for ‹ Prev / Next ›) |
| `features/contents-list.js` | The Library (`#jump`), as in Nitya Upasana: its Back button, and its list, every text under वैदिक मंत्र and आरती in the book-index look (`.tocg`, numbered from 1 in each section, with the language), built from the texts (`CONTENT.categories`). `clearSearch()` empties the search when it closes; `textsForSearch()` and `categoryOfSection()` give search the texts and their sections (Nitya's `features/library.js` does this there); `libraryGroups()` builds the left menu (`text/layout.js`) |
| `features/more-menu.js` | ⋯ in the top bar (as in Nitya Upasana): App, Share, QR and Help in a small menu; `focusBack()` sends focus to ⋯ when a pop-up opened from it closes |
| `features/clicks.js` | Clicks: contents links (data-go) jump to a piece; tapping a verse line highlights it |
| `features/pinch.js` | Pinch with two fingers to change the text size (the page itself never zooms), Nitya Upasana's file: the letter between the fingers stays between them; here also Ctrl/⌘ + and − and a trackpad pinch keep the place under the pointer |
| `text/search-core.js` | Search rules and ranking, without the page (the same file as in Nitya Upasana; tests/unit/search.test.mjs): svara marks and punctuation ignored, forgiving spellings, a typo forgiven, Devanagari typed matched through its English letters |
| `text/search.js` | Search, Nitya Upasana's file: texts by title, id and section first (Texts), then every line (Lines); the index is built the first time something is searched, from a copy of every piece out of the page (rules in `search-core.js`). Recent (`#rcn`, `P.rc`): the last places gone to from search, × takes one away, Clear all. The box is at the foot of the Library on phones, kept above the keyboard (`--kb`) |
| `core/startup.js` | Start-up |
| `features/picture-viewer.js` | Full-screen picture (#pzv): pinch or double-tap to zoom (1x to 5x), drag to move |
| `features/help.js` | Help: opens over the page; the phone's Back button closes it |
| `features/print.js` | Print: the print builder (What, then How: language, dhrupad, page, font, preview, paper) and the print view (`#pv`) it writes, laid out by `../css/15-print.css` (see *Printing* in `../ARCHITECTURE.md`) |
| `print/compose.js` | Nitya Upasana's file: the texts to print, built afresh from the text files (with the script, English style, stanza numbers and line breaks) for each printout, whatever the reading page shows |
| `print/what.js` | The print builder's What step (as Nitya Upasana's, its Library tab): the texts under वैदिक मंत्र and आरती with ticks, search, Select all and Clear (no `init()`: `features/print.js` creates it) |
| `features/share.js` | Share, QR code and the Add to Home Screen buttons |
| `features/offline.js` | Offline use: home-screen app details and the service worker (sw.js) |

`npm run lint` in `tests/` checks every file for mistakes, and for browser features that the oldest supported browsers (iOS 15.4) lack.
