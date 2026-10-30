# Styles

The site's styles are plain CSS files, with no build step. `index.html` loads them with one `<link>` tag each, in number order. The same list is in `js/parts.js`, which is used for the offline copy and for Check for updates. A test (`tests/site-files.spec.mjs`) checks that the two lists match.

## The one rule to know: order matters

Rules are in the order they were added, and a later rule for the same element refines an earlier one. To change a look:

1. Search all of `css/` for the selector, for example `.rftop` or `#home`.
2. Edit the **last** rule that sets the property. That is the match in the highest-numbered file, and the lowest one in that file.

The files are cut from what used to be one `site.css`, at its section boundaries and without reordering anything. Moving rules between files changes which one wins, so new rules go at the end of the file that fits them, or in a new numbered file.

Each file starts with a comment that lists its sections. Every section begins with `/* ==== Title ==== */`.

| File | What is in it |
|---|---|
| `00-fonts.css` | `@font-face` rules for `fonts/`. `unicode-range` makes the browser download only the parts a page uses. |
| `01-theme.css` | Colour and font variables on `:root` for the light, sepia and dark themes and high contrast. |
| `02-core.css` | The first full set of rules for the reading page: page, top bar, contents, pieces, language switching, search, phones held sideways, section headings, and the splash shown while the page starts (`#spl`). Also the first print rules. |
| `03-menus-print-view.css` | Top-bar title, the ⋯ More menu (App, Share, QR, Help), the Print pop-up (`#prm`), Add to Home Screen, the piece header card, and the dhrupad at the top of a piece. |
| `04-columns-rail.css` | Wide screens: two stanza columns, piece and stanza numbers, both languages side by side, and the left contents menu (`#rail`). |
| `05-home-card.css` | The home page "paper sheet", the next Sankashti card, the offline cloud, the lotus ornament, fade-in, and the dhrupad markers. |
| `06-help-polish.css` | Help, the review rounds after 1.0, folding the Ganesha card, and folding the Pooja / Aarti sections. |
| `07-bottom-bar-folds.css` | Bottom bar, bars tucking away while reading, folding each piece, fold headings, bigger tap areas, the home card in one piece (the picture in its countdown ring; beside it the date, the month line, the moonrise and the place; the foot with Add all while More dates is open; the dates in a strip on phones, a row a year from 600px and beside the card from 1100px; its last rules) and the reading sheet (Aa). |
| `08-contents-book.css` | Author lines, and Both languages with English first. |
| `09-settings-page.css` | The Settings page and Kannada, Telugu and Gujarati letters (each script's faces as `--ks`, `--kc`, `--kh`). |
| `10-today.css` | As in Nitya Upasana's file of the same name, the parts this site has: Home's Morning \| Afternoon \| Evening switch (`#tss`), a session being read (`data-run`) and one text at a time (`.solo`), the bottom bar on Home (`data-home`), and the Library page (`#jump`). |
| `13-library.css` | As in Nitya Upasana's: the search results' groups, the search box at the foot of the Library on phones (`#qbar`), Recent, and the list following the text size. The rest of the Library's look sits in the same files as Nitya's (02, 03, 06, 07, 08, 10, 99). |
| `15-print.css` | The printout: the whole look of the print view (`#pv`) and the rules by which the browser breaks its pages (from Nitya Upasana). |
| `99-fallbacks.css` | Plain colours for browsers without `color-mix()` (iOS 15). **Keep it last**, because it replaces colours set in every file above. |

## Switches the styles read

- **Themes** are sets of colour variables (`--bg`, `--ink`, `--accent`, …) on `:root`. Light is the default. Dark follows the device unless a theme is picked in Settings (`data-pref="light|sepia|dark"`). `data-hc="1"` turns on high contrast.
- **`data-lang`** (`mr|en|both`) is set on each region, not on `<html>`:
  - The pieces, section headings, printout and contents lists carry the text language.
  - The bar, Settings, date card, buttons and dialogs carry the menu language (`en|mr`).
- **Other switches on `<html>`:**
  - `data-ref`: the dhrupad, `1` = once, `0` = after every stanza.
  - `data-cols`: `1` or `2` columns.
  - `data-rail`: the left menu is shown.
  - `data-print`: `one` or `side`, only while printing; then `data-font` and `data-ref` take the Print pop-up's font and dhrupad.
  - `data-font`: the text font.
  - `data-tuck`: the bars are tucked away.
  - `data-hv`: Home on its own (no text open); the texts below it are not shown.
  - `data-home`: Home is on screen: the bottom bar keeps only the Library and Aa, and the bars never tuck away.
  - `data-run`: a session from Home is being read: only its texts (`.inrun`), in session order, in one scroll. Otherwise one text at a time (`.solo`), as in Nitya Upasana.
  - `data-lead="en"`: English is the main language; `data-scr`: Kannada, Telugu or Gujarati letters (`kn`, `te`, `gu`).
  - `data-ready`: the site script has started. Until then the page is hidden, so it never shows half set up.

## Breakpoints

These are the only screen sizes the styles switch at. A test (`tests/edge.spec.mjs`) fails on any other, so a new one is added here first.

| Query | What changes |
|---|---|
| `(max-width: 359px)` | The smallest phones: Settings tightens |
| `(max-width: 399px)` | Phones up to 399px: the bottom bar shows only the arrows of Prev and Next (as in Nitya Upasana) |
| `(max-width: 439px)` | Phones: the bottom bar's five buttons (Prev, Home, Library, Reading, Next) close their gaps and slim the icon buttons (as in Nitya Upasana) |
| `(max-width: 420px)` | Phones: Prev / Next at the end of a piece take a narrower middle column |
| `(min-width: 600px)` | Large phones and tablets: a larger home-page text limit |
| `(min-width: 760px) and (min-height: 521px)`, `(max-width: 759.98px)` | The print builder (as in Nitya Upasana): below, What and How one step at a time (Next and back); from 760px (iPads upright too) side by side, the list scrolling on its own. Settings: below, the tabs; from 760px (iPads upright and sideways, desktops) no tabs: the title beside Back and every group at once, in two columns (`.sp-c1`: the preview and the reading choices; `.sp-c2`: screen and about). A phone held sideways (at most 520px high) keeps the tabs (the 521px height) |
| `(min-width: 820px)` | Tablets and up: two-column contents, wider spacing |
| `(min-width: 600px) and (max-width: 1023px) and (orientation: portrait)` | Tablets held upright: the Library in two columns (`13-library.css`, as in Nitya Upasana) |
| `(min-width: 1024px)` | With the wide layout on (`data-rail`, 1100px and wider here): the Library's search box at the top, not the foot (`13-library.css`, as in Nitya Upasana) |
| `(min-width: 1100px)` | Desktop: the left contents menu (`#rail`) |
| `(orientation: landscape) and (max-height: 520px)` | Phones held sideways: tighter line spacing and headers; Settings keeps the phone's tabs, with Reading's preview on the left beside its choices |

The same test keeps the number of `!important` (47) and `:root:root` (11) from growing: they only win over earlier rules, and each new one makes the next change harder.

Hover colours go inside `@media (hover: hover)`, so they show with a mouse and never stick after a tap on a phone or iPad.

## Checks

- `npm run lint` in `tests/` runs stylelint. It flags any CSS feature that the oldest supported browsers (`tests/.browserslistrc`, iOS 15.4 and up) lack.
- The screenshot and print tests catch visual changes.
- When files were split, every element's computed style was compared before and after the split in 34 page, dialog and print states.
