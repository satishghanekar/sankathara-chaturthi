# संकटहर चतुर्थी / Sankathara Chaturthi

The texts our group recites at Sankathara (Sankashti) Chaturthi puja: the Ganapati Atharvashirsha and the aartis, in Marathi with English transliteration.

**Live site:** https://sankathara-chaturthi.pages.dev (the earlier site, https://sankashti-chaturthi.pages.dev, stays as it was)

**Version:** shown in Settings → More → About, on the line that checks for updates (see *The version*).

## What the site does

Everything runs on the phone or computer. Nothing is sent anywhere, and the site works offline once opened.

What a reader sees and can do is described in the site's own **Help** (Share in the top bar → Help, or Settings → More → About). Its text is in `index.html`, in the `<template id="hlpc">`; keep it up to date with every change a reader can see. Most of the site is Nitya Upasana's code (see *Taking a text from Nitya Upasana* and `npm run sister`); what differs is the card and the evening. In short:

- **The card** (`js/features/date-card.js`): the next Sankathara Chaturthi and its moonrise for the reader's place (a built-in list of cities and Columbus suburbs, or the phone's location, worked out on the phone), beside the app's picture in a ring that fills as the day comes nearer. Under the date its month (कार्तिक वद्य चतुर्थी, from Nitya's `js/core/panchang.js`), the moonrise and the place. The foot has **Add to calendar** (an `.ics` event for the group's 7:00–8:30 pm pooja at Bharatiya Hindu Temple, Powell, when within 120 km of it, with moonrise in the notes and a 2-hour reminder) and **More dates**: today's date and every date of this year and next (a strip on phones, a row a year from 600px, always beside the card from 1100px), where Add to calendar becomes **Add all**. On the day itself (`#home.pday`) the moonrise and the place are lit, with the time left. The card folds to one line, remembered, and opens by itself on the day.
- **The evening** (`js/features/session-card.js`, `content/routines.json`): the texts recited every Sankathara Chaturthi evening, listed under the card. A title reads the evening from there in one scroll (`data-run`), Next › going on through it and Home after the last; a text opened from the Library or search shows on its own (`.solo`).
- **Reading**, as in Nitya Upasana: a main and a second language (Marathi, English, or the same words in Kannada, Telugu or Gujarati letters), everyday English (*Sukhkarta*) or IAST (*sukhakartā*, made by the script, see *How the scholarly English is made*), dhrupad once or after every verse, text size and pinch, themes, high contrast, Keep screen on (minutes after the last touch), folds, a highlighted line, and the reading sheet under **Aa**. Menus are in English or the language the texts are shown in (`js/strings/`).
- **Text font:** Traditional (Tiro Devanagari, the book-style face; the default), Modern (Noto Sans) or Bold (Noto Serif SemiBold), the same three as Nitya Upasana, each with matching Kannada, Telugu and Gujarati faces and the Vedic svara marks in every script and in IAST (`fonts/README.md`). All are saved for offline on the first visit.
- **Library and search, Settings, the bars, Print, offline and updates:** Nitya Upasana's, described in `ARCHITECTURE.md`. The top bar has Print, Share (App, Share, QR, Help) and Settings; the bottom bar ‹ Prev, Ganesha (Home), Library, Aa and Next › (on Home just Library and Aa).
- **Pictures:** `picture-360.webp` in the card's ring, `picture.webp` (945 px) full screen on a tap; the icons and `share.jpg` come from Satish's square picture. The pictures as supplied are kept untouched in `originals/` (not loaded by the site).

## What is in this repository

| File | What it is |
|---|---|
| `index.html` | The page: top bar, Settings, home page and Help. |
| `css/` | All the styles, in numbered parts loaded in order (see `css/README.md`). |
| `js/parts.js` | The list of the site's style, script and font files, shared by the page and the service worker. |
| `js/main.js` and `js/core/`, `js/text/`, `js/features/` | All the behaviour (settings, dates, search, print, offline…), one file per topic (see `js/README.md`). |
| `content/texts/` | The texts, one plain-text file each (`aarti-sukhkarta.txt`, …): each line in Marathi/Hindi/Sanskrit with its everyday English line under it, the title and the author line. **Edit the texts here** (see *How to add a text*). |
| `content/library.json`, `content/categories.json` | The list of texts, with the few words the app adds (language tags, the dhrupad label); the categories (Vedic Chant, Aarti, Stotra, Ashtak). Written exactly as in Nitya Upasana, so texts move between the two sites (see *Taking a text from Nitya Upasana*). |
| `content/routines.json` | The routine Home lists, written as in Nitya Upasana: `{"evening": {"mode": "fixed", "texts": […]}}` (and `morning`, `afternoon` when they have texts; a session with none is not shown). A session is read in the order it lists its texts, which may differ from the Library's (the checks hold it to texts of the Library, each once). The reading page's sections (वैदिक मंत्र, आरती), their order and the piece numbers come from `content/categories.json` and `library.json`, as in Nitya Upasana. |
| `js/text/format.js`, `js/text/content.js`, `js/text/load.js` | Read the text files, turn them into the pieces' data and put them into the page when it opens. |
| `js/render.js` | Builds each piece's HTML from that data. |
| `sw.js` | The service worker. It keeps a copy of the site on each phone so it opens without internet. |
| `manifest.json` | Name, colours and icons used when someone adds the site to their home screen. |
| `icon-180.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-192.png`, `icon-maskable-512.png`, `icon-32.png`, `apple-touch-icon.png`, `apple-touch-icon-precomposed.png` | App icons (Ganesha artwork): 180 for iPhone, 192/512 rounded tile, maskable versions with extra margin for Android, 32 for the browser tab. The two `apple-touch-icon` files are copies of `icon-180.png` at the site root, where iPhone also looks when it adds the site to the Home Screen. |
| `tests/` | The automated tests (see *Checking a change*). Not part of the site, though Cloudflare serves the folder too. |
| `.github/workflows/` | The test run GitHub does on every pull request and every push to `main`, and the job that refreshes its screenshots. |
| `_headers` | How long phones may keep each kind of file before asking again (Cloudflare Pages reads it). |
| `ARCHITECTURE.md` | How the page, styles and scripts fit together, for anyone changing the code. |
| `CLAUDE.md`, `.cursorrules` | The short list of rules for changing the site, for people and AI assistants (`.cursorrules` points Cursor to `CLAUDE.md`). |
| `fonts/` | The site's fonts (the three text fonts, the menus' and the Kannada ones), served from the site itself so nothing is fetched from Google and they work offline (see `fonts/README.md`). |

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

Phones keep a saved copy of the site and always open from it, without asking the network, so the site starts quickly even on a weak connection. Phones download files again only when the version changes: opening the site online notices the new `sw.js`, which saves a whole new copy in the background (the fonts are carried over), and the next launch opens the new version. So a change reaches phones only with a new version. **Check for updates** (the round button beside the version in Settings → More → About) compares each of those files on the phone with the live one, so it finds changes even when the version stays the same.

The version is what Settings → More → About shows. It appears in **two** places, and both must always be the **same**:

1. `sw.js`, near the top:
   ```js
   const V = "aarti-v1.2";
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

For larger changes there is an automated test suite in `tests/` (see `tests/README.md`). It checks every line of text, search, 44 screenshots, layouts from a small phone to a wide monitor, the main interactions, accessibility, every print layout as a PDF, offline use, and how much work the page does on load. It runs by itself on GitHub for every pull request and every push to `main`, in Chromium, Firefox, Safari's engine and phone emulation. Merge a pull request only when its checks are green.

How the code fits together is in `ARCHITECTURE.md`.
