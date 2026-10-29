# संकटहर चतुर्थी / Sankathara Chaturthi

The texts our group recites at Sankathara (Sankashti) Chaturthi puja: Pooja, Bhajans (coming soon) and Aarti, in Marathi with English transliteration.

**Live site:** https://sankathara-chaturthi.pages.dev (the earlier site, https://sankashti-chaturthi.pages.dev, stays as it was)

**Version:** 1.2 (shown as *v1.2* in Settings → More → About, on the line that checks for updates)

## What the site does

Everything runs on the phone or computer. Nothing is sent anywhere, and the site works offline once opened.

- **Texts:** the Ganapati Atharvashirsha (with Vedic swara marks) and ten aartis, in Marathi, English, or both side by side (Language under Aa, or Show in Settings).
- **English style** (Settings): the everyday spelling (*Sukhkarta*) or the scholarly spelling, IAST (*sukhakartā*, *bha̱draṃ*). The scholarly lines are not typed. The script builds them from the Marathi/Sanskrit lines, along with the piece titles, the first time they are needed; switching style happens in place, without reloading (see *How the scholarly English is made*). In Settings the spelling is picked with the language: English is listed twice, *English · Sukhkarta* and *English · sukhakartā*.
- **Languages** (Settings, option A of the redesign, 2026-10-15): a **main language** (large text) and a **second language** (smaller, under each line, or *None*), each picked from the phone's own dropdown on the Settings page (an invisible `<select>` over the row), with every language named in its own script (`LANGS` in `js/core/apply.js`; today मराठी, English and ಕನ್ನಡ). English is listed twice, once per spelling (*English · Sukhkarta*, *English · sukhakartā*), so the English spelling is picked with it. The अ/A button cycles main → second → both; with no second language it opens Settings at the second list. **Menus and buttons** are in English or the main language (`P.ui`); with English as the main language they are English. Settings are saved as `lead` (main), `l2` (second) and `lang` (shown now); settings version 6 turned the old "In Both, show first" into the main language. The fold rows (अनुक्रमणिका / Contents, पूजा, आरती) follow the text language. **Kannada** (2026-10-15) is the same words in Kannada letters, not a translation: the page has two places for text, the original (`.mr`) and English (`.en`), and `P.ind` says whether the original shows Marathi (`mr`, as written) or Kannada (`kn`). `SCR` in `js/render.js` rewrites the Devanagari into Kannada letters while the page loads (each letter is 0x380 further on in Unicode; dandas and Vedic accent marks stay, ॐ becomes ಓಂ), and switches back and forth in place (`SCR.set`, which keeps what it changed and puts it back exactly), with no reload; `SCR.from` turns it back for the English spelling (IAST) and search, which also finds lines typed in Kannada letters. The Kannada text uses Noto Sans Kannada (`fonts/`); with the other text fonts it uses Noto Serif Kannada (Classic) or Hubballi (Handwritten), and the Atharvashirsha keeps a font with the Vedic marks. In Kannada the poet links go to Kannada Wikipedia when it has a page (`wiki` in `content/library.json`), else to English. For now Kannada pairs only with English (it can't sit beside Marathi, which shares its place) and its menus are English. Another script would be one more entry in `SCRIPTS` (`js/render.js`) and `LANGS` (`js/core/apply.js`).
- **Dhrupad:** shown once at the top or after every stanza (the धृ button); in "once" mode, ↻ ध्रुपद under a stanza shows it until the next tap. The Print pop-up has its own Once / Every verse choice for the printout; it starts as the page shows it and leaves the page as it is.
- **Ganesha:** the folded home card shows the round picture (`picture-360.webp`) small at its left, and the home buttons (top bar, the Library's Home, bottom bar) are a small line drawing of Ganesha.
- **Piece folds:** a tap anywhere on a piece's heading (or its round ⌃ button) folds that piece to its heading, for one-hand use; remembered on the phone, and going to a folded piece from the Library or search opens it (a reload keeps it folded). Printing always includes everything.
- **Section rows and folds (पूजा / वैदिक मंत्र, आरती):** removed from the reading page on 2026-10-29, as Nitya Upasana has none; a section folded before then no longer hides its texts (`tidy()` clears `pf` and `xf`). Every piece heading, open or folded, is one left-aligned row (number and name, ⌃/⌄ on the right), so folding never makes the heading jump; the language tag (मराठी, हिंदी) shows only in print.
- **Autoscroll and Tilt to scroll:** never released here, removed on 2026-10-29 as in Nitya Upasana (they are in git history up to v1.7.3). The saved settings they used (`as`, `ason`, `asp`) are kept, as Nitya keeps them.
- **Text font** (Settings, Satish's pick, 2026-10-14; Bold (Sura) dropped 2026-10-25, as it looked almost the same as Standard): Standard (default: Noto Sans Devanagari + Inter), Classic (Noto Serif Devanagari + Noto Serif) or Handwritten (Kalam). Set as `data-font` on the root from `P.fnt`; the `SC Classic` / `SC Hand` families join each font's Devanagari and Latin files, which the service worker saves on the first visit with the default ones (`js/parts.js`), so a font picked later shows at once, even offline. Applies to the texts (`.items`, `.rftop`), the piece title rows (`.ash header`) and the home page's Contents list; the home card, the section rows (पूजा, आरती, Contents), the menus and every control keep the standard fonts (2026-10-25). English uses `--tfl`, which is the chosen font except with the scholarly spelling (`data-tr="iast"` on the root): Handwritten (Kalam) lacks letters like ṃ ṇ ḥ, so its English lines then use Standard (Inter), which has them all, rather than mixing fonts within a word. the Atharvashirsha's Marathi lines keep Tiro Devanagari Sanskrit. Printing uses the font picked in the Print pop-up (`P.pfn`; to begin with, the text font), and picking one there leaves the reading page as it is (`#pv .pvs` rules; headings keep theirs), and `pages()` lays out the contents page numbers with it (frame 16px narrower than the page for the optional fonts, 12px for Standard: tuned so all 32 font × language × layout PDFs give the right numbers). The print view is cached per font (`pkey`). Decorative fonts Martel, Amita and Yatra One were tried and rejected: they drew the reph wrongly (दर्शन as दरशन).
- **App picture** (Satish's round Sankathara medallion): `picture-360.webp` is shown small (72 px, the size the card always had) at the top of the open home card; a tap opens the full-resolution `picture.webp` (945 px) full screen (`#pzv`) where pinch, double-tap or the mouse wheel zooms 1x to 5x and a drag moves it. Back, ✕, Escape or a tap outside closes it. The text-size pinch is off while it is open.
- **Home card colour** (Satish picked option B, 2026-10-14): a soft gold glow behind the picture, a warm tint and gold edge on the date box, the shown date in the accent colour with an "in N days" badge (from 2 days ahead; today and tomorrow are in the heading), a gold ring on the chosen date chip and dimmed past dates.
- **App icon and share image** come from Satish's square picture: `icon-32/192/512.png` keep its rounded gold-bordered shape (white corners removed), `icon-180.png` and the `apple-touch-icon` files are the full-bleed inside of the border (iPhone rounds them itself), the maskable icons keep everything inside Android's safe circle, and `share.jpg` (1024 px) is the link-preview picture (`og:image`).
- **Originals:** the pictures exactly as Satish supplied them are kept untouched in `originals/` (the Sankathara square and round ones from 2026-10-15 are `sankathara-*.jpg`; the current SANKATAHARA CHATURTHI ones from 2026-10-27, which the icons and pictures are made from, are `sankatahara-*.jpg`) (not loaded by the site). The cleaned versions are made from them by trimming the white background.
- **Next Sankathara Chaturthi card** (home page): a round button, or a tap beside the picture, folds it to one line (Ganesha, next date, moonrise), hiding the buttons until it is opened (tap the line or ⌄ to open); on the home page the Home buttons (top-bar title, bottom-bar Ganesha, the rail's Home) toggle it too (from a piece they just go home); the phone remembers it, and on Sankashti day it opens by itself. today's date, the next Sankashti and its moonrise for the reader's location (worked out from a built-in list of cities and Columbus suburbs), a strip of past and future dates, an on-the-day countdown, and calendar buttons. The calendar event is the group's 7:00–8:30 pm program at Bharatiya Hindu Temple, Powell (within 120 km of it), with moonrise in the notes and a 2-hour reminder; "Add all upcoming dates to calendar" adds every coming date.
- **Share / QR / Print:** a ready reminder message for WhatsApp, a QR code of the site, and a printout or PDF in the chosen language and English style, printed as Nitya Upasana prints (see *Printing* in `ARCHITECTURE.md`). The Print pop-up is Nitya Upasana's print builder: **What to print** (a tick for each text under पूजा and आरती, search, Select all and Clear; remembered), then **How to print**: the language, the dhrupad and the font for the printout only (each font a tile with a word in it), a preview of the first page, the paper (Use A4 / Use Letter), and the page: Portrait or Landscape for one language (one column; the Atharvashirsha as running paragraphs), and with both languages side by side, on Landscape only. Every text starts on a new page and no stanza is split; the contents list the texts chosen, without page numbers, and no page has a border. On an iPhone, if the print window does not open, the pop-up offers *Print now*, then Share → Print or *Open in Safari* (with *Copy link*), carrying the choices across; the Home Screen app goes straight to *Open in Safari*. Paper: Letter in the US, Canada, Mexico and the Philippines, A4 elsewhere, until changed under How to print.
- **Wide screens (iPad landscape, desktop):** in the side menu the वैदिक मंत्र and आरती headings go to the first text of their section. stanzas sit in pairs across two columns; a stanza much longer or shorter than its neighbour (Atharvashirsha verse 1 beside verse 2) spans both columns on its own instead. The page sits right beside the side menu and uses its whole width (up to 60rem): the home card, section rows and piece headings all span it. The home card frames itself the same as on phones, and pieces are separated by their boxed heading rows and end ornament (no extra rule line).
- **Offline:** a small cloud with a line through it shows in the top bar (`#ofb`) only while there is no internet; it is not coloured, because everything still works from the saved copy. A short "Ready to use offline" note shows once, when the first visit has saved the site. Settings → More → About has one line with the version and the offline state (Offline ready / Saving for offline… / Saved copy in use); a tap on it checks for updates, loading a newer version or saying "Up to date".
- **Settings:** a page of its own under the top bar (`#panel.sp`; ‹ or the phone's Back closes it), with the tabs **Reading | Screen | More** beside ‹, one tab at a time, as in Nitya Upasana (`spTab()` in `js/features/settings-panel.js`; each `.sp-grp` says its tab). Reading: a preview of the Ganapati aarti in your text size, font and spelling, with two verses and the dhrupad (tinted) where the Dhrupad setting puts it (on top with ↻ ध्रुपद under each verse for Once, after each verse for Every verse; it slides in and out when the setting changes), then Language and text (main, second, Show: main / second / both, text size, font) and Verses (dhrupad, layout on wide screens). Screen: menus, theme, high contrast, keep screen on. More: About (Help, Add to Home Screen, one version line that checks for updates when tapped). Who made the site is under every tab. It opens on Reading each time. From 760px a tab's groups sit in two columns, the preview beside the choices. Its styles are the "Settings page" block in `css/09-settings-page.css`.
- **Top bar** (as in Nitya Upasana, 2026-10-29): the home link and title, then **Print**, **⋯** (More: App, Share, QR and Help, `js/features/more-menu.js`) and **Settings**. The language and the dhrupad are under Aa and in Settings, not in the top bar.
- **Library** (the book in the bottom bar and at the end of each piece, as in Nitya Upasana): every text under वैदिक मंत्र and आरती, by category as in Nitya Upasana, and search.
- **The evening** (home, under the date card, as Nitya Upasana's Today card lists a session; 2026-10-29): संध्याकाळ · Evening, the texts recited on every Sankathara Chaturthi evening, from `content/routines.json` (one session, the same every time; `js/features/session-card.js`). A title reads the evening from that text, its texts one after another in one scroll, as in Nitya Upasana (`data-run`); Next › goes on through it, and after the last text goes back Home. A text opened from the Library or search shows on its own (`.solo`). The Morning | Afternoon | Evening switch shows once two or more sessions have texts in `content/routines.json` (today only the evening); no other days and no routine builder. Home is on its own, as in Nitya Upasana (`data-hv`, `homeView()` in `js/features/history.js`): the page ends after the evening's list, and while reading Home is not shown above the texts.
- **Getting around:** the top bar shows the piece being read; the Library and search (forgiving spelling and a typo forgiven, as in Nitya Upasana's `js/text/search-core.js`; matching words in bold; ↑ ↓ Enter on a computer); a bottom bar on every page, home included (‹ Prev, Ganesha home, Library, Aa, Next ›; the smallest phones show only the arrows of Prev and Next; fixed pixel sizes like the top bar, so text size and pinch leave it alone; hidden while Settings or the Library is open; the old Previous/Next cards stay in the HTML, hidden on screen, and the bar's buttons use their links); the phone's Back button closes menus and returns to where you were before a jump, and the address (#a5) follows the piece on screen.
- **Reading sheet (Aa in the bottom bar):** slides up over the bar with Language (main, second, both; the same as Show in Settings), Text size (A− / A+ and ↺, as in Settings) and Dhrupad (once, every verse), plus All settings, so these are within thumb reach; the reader's place is kept. A tap outside, ✕, Escape or Back closes it (`js/features/reading-sheet.js`).
- **Next Chaturthi date first:** every day the home card leads with the next date and its moonrise; the date strip, calendar links and "Add all" wait under More dates (`#home.skn`, `.pmore` when opened). On Sankashti day itself the moonrise is in large type with the countdown and (central Ohio) the pooja time, the contents are larger, and the App/Share/QR/Print/Help row also goes under More dates (`#home.pday`, set by `js/features/date-card.js`).
- **Screen readers:** the page is marked as Marathi, and English parts as English, so VoiceOver and TalkBack read each in the right voice whatever the menu language.
- **Keyboard:** the first Tab shows "Skip to the texts". Settings, the Library and ⋯ take focus when opened; Escape or tabbing out closes them and returns focus to their button (to ⋯ for what opened from its menu). Picking a piece moves focus to its heading. The page has banner, navigation and main landmarks. High contrast is black whichever theme is picked (2026-10-14 accessibility review).
- **Tap areas:** small controls (dhrupad markers, Settings segments and ✕, calendar and location links, the offline line, the top-bar title) have an invisible touch area of about 44 px, so they keep their look but are easier to hit ("Bigger tap areas" block at the end of the CSS).
- **Reading:** tap a line to highlight it, pinch or A−/A+ for text size (on phones the default, shown as 100%, is 110% of the size at which every line fits on one row; the home page keeps its normal size; a pinch keeps the line between the fingers in place on screen, a trackpad pinch the one under the pointer, Ctrl +/− the one mid-screen: `spotAt`/`keepSpot` in `js/features/pinch.js`), themes (light, sepia, dark), high contrast, keep the screen on (on by default on phones and tablets, off on computers), and it reopens where you were reading (within 12 hours).
- **Help** (English): opened from the home page and from Settings. Update it when a feature changes (search for `id="hlpc"`, the `<template>` that holds its text until it is first opened).

## What is in this repository

| File | What it is |
|---|---|
| `index.html` | The page: top bar, Settings, home page and Help. |
| `css/` | All the styles, in numbered parts loaded in order (see `css/README.md`). |
| `js/parts.js` | The list of the site's style, script and font files, shared by the page and the service worker. |
| `js/main.js` and `js/core/`, `js/text/`, `js/features/` | All the behaviour (settings, dates, search, print, offline…), one file per topic (see `js/README.md`). |
| `content/texts/` | The texts, one plain-text file each (`aarti-sukhkarta.txt`, …): each line in Marathi/Hindi/Sanskrit with its everyday English line under it, the title and the author line. **Edit the texts here** (see *How to add a text*). |
| `content/library.json`, `content/categories.json` | The list of texts, with the few words the app adds (language tags, the dhrupad label); the categories (Vedic Chant, Aarti, Stotra, Ashtak). Written exactly as in Nitya Upasana, so texts move between the two sites (see *Taking a text from Nitya Upasana*). |
| `content/routines.json` | The evening routine, written as in Nitya Upasana: `{"evening": {"mode": "fixed", "texts": […]}}`, every text in the reading page's order (the checks hold it to that). The reading page's sections (वैदिक मंत्र, आरती), their order and the piece numbers come from `content/categories.json` and `library.json`, as in Nitya Upasana. |
| `js/text/format.js`, `js/text/content.js`, `js/text/load.js` | Read the text files, turn them into the pieces' data and put them into the page when it opens. |
| `js/render.js` | Builds each piece's HTML from that data. |
| `sw.js` | The service worker. It keeps a copy of the site on each phone so it opens without internet. |
| `manifest.json` | Name, colours and icons used when someone adds the site to their home screen. |
| `icon-180.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-192.png`, `icon-maskable-512.png`, `icon-32.png`, `apple-touch-icon.png`, `apple-touch-icon-precomposed.png` | App icons (Ganesha artwork): 180 for iPhone, 192/512 rounded tile, maskable versions with extra margin for Android, 32 for the browser tab. The two `apple-touch-icon` files are copies of `icon-180.png` at the site root, where iPhone also looks when it adds the site to the Home Screen. |
| `tests/` | The automated tests (see *Checking a change*). Not part of the site, though Cloudflare serves the folder too. |
| `.github/workflows/` | The test run GitHub does on every pull request and every push to `main`, and the job that refreshes its screenshots. |
| `_headers` | How long phones may keep each kind of file before asking again (Cloudflare Pages reads it). |
| `ARCHITECTURE.md` | How the page, styles and scripts fit together, for anyone changing the code. |
| `fonts/` | The site's fonts (the default ones, the optional text fonts and the Kannada ones), served from the site itself so nothing is fetched from Google and they work offline (see `fonts/README.md`). |

There is no build step. The files in this repository are exactly what the site serves.

## How publishing works

The site is hosted on **Cloudflare Pages**, connected to this repository. Every push (commit) to the `main` branch is published automatically, usually within a minute or two. Nothing else needs to be done.

To watch a publish: Cloudflare dashboard → **Workers & Pages** → **sankathara-chaturthi** → **Deployments**. The newest deployment should show *Success*.

## Making a change by hand

### Option A: on the GitHub website (no software needed)

1. Open https://github.com/satishghanekar/sankathara-chaturthi and open `content/texts/` and click a text's file to change its text, `css/` for styles (see `css/README.md` for which file), `js/` for behaviour (see `js/README.md` for which file), or `index.html` for the page itself.
2. Click the pencil icon (**Edit this file**).
3. Use the browser's find (Ctrl+F / ⌘F) to locate the text you want (see *Finding things in the files* below), and make the change.
4. If this is a new release, **change the version** (see below). This is a second small edit, in `index.html` and in `sw.js`.
5. Click **Commit changes…**, write a short message (for example *Fix typo in Devi Aarti verse 2*), keep **Commit directly to the `main` branch** selected, and click **Commit changes**.
6. Wait a minute or two, then check the live site (see *After publishing*).

When you edit two files (`index.html` and `sw.js`) on the website, each one is its own commit. That is fine; Cloudflare simply publishes twice.

### Option B: on your computer with git

One-time setup:

```sh
git clone https://github.com/satishghanekar/sankathara-chaturthi.git
cd sankathara-chaturthi
```

Every time:

```sh
git pull                      # get the latest version first
# edit index.html (and sw.js when the version changes) in any text editor
python3 -m http.server 8000   # optional: preview at http://localhost:8000, Ctrl+C to stop
git add -A
git commit -m "Describe the change"
git push                      # publishes to the live site
```

Use a plain-text editor that saves UTF-8 (VS Code, Sublime Text, TextEdit in plain-text mode, Notepad). Word processors will damage the file.

### The version

Phones keep a saved copy of the site and always open from it, without asking the network, so the site starts quickly even on a weak connection. Phones download files again only when the version changes: opening the site online notices the new `sw.js`, which saves a whole new copy in the background (the fonts are carried over), and the next launch opens the new version. So a change reaches phones only with a new version. **Check for updates** (a tap on the version line in Settings → More → About) compares each of those files on the phone with the live one, so it finds changes even when the version stays the same.

The version is what Settings → More → About shows (v1.2). It appears in **two** places, and both must always be the **same**:

1. `sw.js`, near the top:
   ```js
   const V='aarti-v1.2';
   ```
2. `index.html`, near the top:
   ```html
   <meta name="version" content="aarti-v1.2">
   ```

Change it only for a new release, and change both together, using digits and dots only: `1.0` → `1.0.1` for fixes, `1.1` for new features, `2.0` for a redesign. Changing it also makes phones refresh the saved icons and fonts.

### After publishing

- Computer: open the site and reload (Ctrl+Shift+R / ⌘⇧R).
- Phone: open the site, wait a few seconds, then close it fully and open it again. The first open fetches the new version; the second shows it.

### Undoing a change

On GitHub, open **Commits** (the clock icon above the file list) and click the commit you want to undo: it shows exactly what changed, red for removed and green for added. Edit the file back the same way and commit again; it publishes like any other change. With git on a computer, `git revert <commit id>` followed by `git push` does the same in one step.

## Finding things in the files

`index.html` is laid out top to bottom as:

1. `<head>`: title, and preloading of the main font files.
2. Links to the style files in `css/`, in order (see `css/README.md`): labelled sections (`/* ==== … ==== */`), starting with the `@font-face` rules for `fonts/`. Then `js/parts.js`, the list of the site's files, and `modulepreload` links for the script parts.
3. `<body>`: the top bar, the settings panel, then the home page. The pieces themselves are in `content/texts/`; at the end of `<main>`, `#pieces` marks their place, and when the page opens `js/text/load.js` fetches the text files and has `js/render.js` build the pieces there before anything else starts, so the page is exactly as if they were written there.
4. `<script type="module" src="js/main.js">`: all behaviour. `main.js` starts each part in `js/core/`, `js/text/` and `js/features/` in order (see `js/README.md`).

Each piece is one file in `content/texts/`. Its `legacy-id` is the id of its `<section>` on the page (and the `#a5` in links):

| File in `content/texts/` | legacy-id | Piece |
|---|---|---|
| `vedic-chant-atharvashirsha.txt` | `p1` | Pooja 1. गणपत्यथर्वशीर्षोपनिषत् (Ganapati Atharvashirsha) |
| `aarti-sukhkarta.txt` | `a1` | Aarti 1. सुखकर्ता दुःखहर्ता |
| `aarti-shendur-lal-chadhayo.txt` | `a2` | Aarti 2. शेंदुर लाल चढ़ायो |
| `aarti-durge-durghat-bhari.txt` | `a3` | Aarti 3. देवीची आरती |
| `aarti-lavathavati-vikrala.txt` | `a4` | Aarti 4. शंकराची आरती |
| `aarti-trigunatmak-traimurti.txt` | `a5` | Aarti 5. दत्ताची आरती |
| `aarti-dnyanaraja.txt` | `a6` | Aarti 6. ज्ञानेश्वरांची आरती |
| `aarti-yei-o-vitthale.txt` | `a7` | Aarti 7. विठ्ठलाची आरती |
| `aarti-ghalin-lotangan.txt` | `a8` | Aarti 8. घालीन लोटांगण |
| `aarti-jai-ganesh-deva.txt` | `a9` | Aarti 9. आरती जय गणेश देवा |
| `aarti-jai-jagdish-hare.txt` | `a10` | Aarti 10. आरती जय जगदीश हरे |

Or search for a few words of the line itself.

## How to add a text

A text is one plain-text file in `content/texts/`, named after its id (`aarti-sukhkarta.txt`). Use a plain-text editor that saves UTF-8 (see *Option B*) and never one that "fixes" spelling or Unicode: the words are kept exactly as typed, svara marks and all. The easiest start is a copy of a similar text.

### The file

```
id: aarti-sukhkarta
title: सुखकर्ता दुःखहर्ता
title-en: Sukhkarta Dukhharta
category: aarti
language: mr
legacy-id: a1
line-ids: s1l
refrain: every-verse
credit: रचना : [समर्थ रामदास](https://mr.wikipedia.org/wiki/सुखकर्ता_दुःखहर्ता) (१६०८–१६८२)
credit-en: By [Samarth Ramdas](https://en.wikipedia.org/wiki/Sukhakarta_Dukhaharta) (1608–1682)
---
[dhrupad]
जय देव जय देव, जय मंगल मूर्ती ।
Jai Dev Jai Dev, Jai Mangal Murti |
…

[1]
सुखकर्ता दुःखहर्ता, वार्ता विघ्नाची ।
Sukhkarta Dukhharta, Varta Vighnachi |
…
```

**The header** (one `name: value` per line, then a line `---`):

| Field | |
|---|---|
| `id` | Required. Lower case and hyphens, the same as the file name, starting with the category (`aarti-sukhkarta`). |
| `title`, `title-en` | Required. The title in the original language and in English. |
| `category` | Required. One of the ids in `content/categories.json`: `vedic-chant`, `aarti`, `stotra`, `ashtak`. |
| `language` | Required. `mr` (Marathi), `hi` (Hindi), `sa` (Sanskrit); `te`, `kn`, `ta` later. The page shows the language name from `content/library.json`. |
| `legacy-id` | The piece's id on the page (`a1`) and in links. Without it, the `id`. |
| `line-ids` | What each line's id starts with (`s1l`: the lines are `s1l1`, `s1l2`, …, counted as the page shows them, repeated dhrupads included). Without it, the `id` and a dot (`aarti-sukhkarta.1`). |
| `line-id-exceptions` | Only for the old Vitthal Aarti, whose 4th line has always been `s7l4r`: `s7l4=s7l4r`. |
| `refrain` | `every-verse`: the `[dhrupad]` is shown once at the top, and after every stanza the app adds the "↻ ध्रुपद" note and the dhrupad again (for the धृ button). `always`: the refrain lines are written inside the stanzas and always shown (today's Dnyaneshwar Aarti). Leave it out for none. |
| `refrain-before-first` | `yes` when the dhrupad is also sung before the first stanza (Vitthal Aarti, Jai Ganesh Deva). |
| `layout` | `prose` prints the text as running paragraphs, like a booklet (the Atharvashirsha). |
| `credit`, `credit-en` | The author line in each language. `[name](address)` becomes a Wikipedia link that opens in a new tab, with its ↗. |
| `credit-note`, `credit-note-en` | A second, smaller author line (Vitthal Aarti: "also credited to Sant Namdev"). |

**The blocks**, after `---`, separated by one blank line. Each starts with its name in brackets, then its lines, **always in pairs: the original line, then its everyday English line**. An English line where the original belongs (or the other way round) stops the text from loading, and the test names the file and line.

| Block | |
|---|---|
| `[1]`, `[2]`, … | A stanza, numbered in order. In an aarti the app adds ॥ १ ॥ at its end; do not type it (unless the header says `stanza-numbers: as-written`). (The Atharvashirsha's numbers are part of its text, and its blocks are simply counted.) |
| `[para 3]` | A stanza that starts a new paragraph when printed as prose. |
| `[dhrupad]` | With `refrain: every-verse`: the dhrupad, first in the file (only `[once]` lines and `[note]`s may come before it). Otherwise: lines said once, where they stand. |
| `[once]` | Lines said once, where they stand, never followed by the dhrupad (an invocation such as ॥ श्री गणेशाय नमः ॥, or a closing इति … सम्पूर्णम्). At the top of the text they are shown centred above it (and above the dhrupad). |
| `[dhrupad bold]` | The same, shown in bold (Ghalin Lotangan's closing mantra). |
| `[dhrupad repeated]` | Right after `[dhrupad]`, only when the repeats are written differently from the top (Vitthal Aarti breaks its repeated dhrupad in two). |
| `[refrain]` | Inside a block: the lines after it are refrain lines (shown as the refrain, or hidden with the dhrupad set to once). |
| `[note: ↻ ३ वेळा \| 3 times]` | The small note between blocks, in both languages; part of the text, so shown whatever the dhrupad setting. |

**Inside a line:**

- `¦` marks a place where a long line may break on a narrow phone (it shows as nothing). Put it after the space: `निढळावरी कर, ¦निढळावरी कर`, so the words keep their space when the line fits on one row. English lines need none: on a phone they break after a single `|` or a comma by themselves.
- ` // ` (a space, two slashes, a space) always breaks the line there. The spaces belong to the mark: `|  // ` (two spaces) keeps one real space before the break, as in Ghalin Lotangan's English.
- **Vedic svara marks** (॑ ॒ ᳚) must be kept exactly. A mark that belongs with a visarga goes **after** the ः, otherwise it shows as a dotted circle.
- **Only the original line and the everyday English line are typed.** The scholarly English (IAST) is made from the original line, so a spelling fix there fixes the scholarly English too.

### Adding it to the site

1. Write the file in `content/texts/`.
2. In `content/library.json`, add it to `"texts"` (its `id`, `file`, `title`, `titleEn`, `category`, `language` and `lines`, the number of line pairs in the file), after the texts of its category (Vedic Chant or Aarti), and add its `id` at the same place in `content/routines.json`'s evening list. The piece number (१. 1.) and Previous / Next come from that order.
3. In `js/parts.js`, add `texts/<id>.txt` to the `content` list, so the text is kept for offline use.
4. Run the checks (`cd tests && npm run unit`): they read every text, check `library.json` and `js/parts.js` against the files and name any mistake with its line number. Then look at it on the site (see *Checking a change*), commit and push (change the version if this is a new release).

### Taking a text from Nitya Upasana

The text files, `content/library.json` and `content/categories.json` are written exactly as in Nitya Upasana (https://github.com/satishghanekar/nitya-upasana), and the checks hold both sites to it. To take a text from there: copy its file from Nitya's `content/texts/` into this site's, copy its entry from Nitya's `content/library.json` into this one's `"texts"` as it is, then do steps 2–4 above for `routines.json` and `js/parts.js`. A text from here goes to Nitya the same way (there, a place in a routine of its own).

When **editing** a text, only the file changes, unless a title or the number of lines changes (then update `content/library.json` too; the checks say so). Line ids follow the order of the lines, so a fix within a line keeps them; adding or removing a line renumbers the lines after it (a highlighted line saved on a phone may then point at its neighbour).

## How the scholarly English is made

When English style is set to *sukhakartā*, `js/text/iast.js` (function `IA`) rewrites each English line from the Marathi/Sanskrit line beside it (function `trSet`, which keeps both spellings so the switch is instant). The rules:

- Standard IAST letters: ā ī ū ṛ, ṭ ṭh ḍ ḍh ṇ, ś ṣ, ṅ ñ, ḷ for ळ, ḥ for the visarga, `'` for ऽ, om̐ for ॐ.
- The inherent "a" is always written (*jaya deva*, *suravaravandanā*), as in strict IAST.
- Anusvara (ं): before k/g it is ṅ, before c/j ñ, before ṭ/ḍ ṇ, before t/d/n n, before p/b/m m (*sarvāṅgī*, *sundara*, *vakratuṇḍa*, *lambodara*). Otherwise, and in Marathi plural endings and nasal vowels, it stays ṃ (*muktāphaḷāṃcī*, *sumanāṃcyā*, *kaiṃcā*). Chandrabindu (ँ) is m̐.
- Swara marks in the Atharvashirsha: ॒ (anudatta) becomes a line under the vowel, ॑ (svarita) a tick above, ᳚ a double tick, matching the group's printed śivāñjali booklet.
- Hindi nukta letters: ड़ ṛ, ढ़ ṛh.

To change a rule, edit `IA` in `js/text/iast.js` and check the Atharvashirsha and Sukhkarta Dukhharta against the printed booklet afterwards.

## Checking a change

The texts are the point of the site, so after any edit:

- Open the changed piece on the live site in Marathi, English and Both (Language under Aa), and in both English styles (Settings).
- Check it on a phone and on a computer, and try **Print** if the layout changed.
- If a line or a mark looks wrong, compare it with the source booklet before changing anything.

For larger changes there is an automated test suite in `tests/` (see `tests/README.md`). It checks every line of text, search, 42 screenshots, layouts from a small phone to a wide monitor, the main interactions, accessibility, every print layout as a PDF, offline use, and how much work the page does on load. It runs by itself on GitHub for every pull request and every push to `main`, in Chromium, Firefox, Safari's engine and phone emulation. Merge a pull request only when its checks are green.

How the code fits together is in `ARCHITECTURE.md`.
