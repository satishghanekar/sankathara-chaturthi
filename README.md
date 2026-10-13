# संकष्टी चतुर्थी / Sankashti Chaturthi

The texts our group recites at Sankashti Chaturthi puja: Pooja, Bhajans (coming soon) and Aarti, in Marathi with English transliteration.

**Live site:** https://sankashti-chaturthi.pages.dev

## What is in this repository

| File | What it is |
|---|---|
| `index.html` | The whole site: page text, styles (`<style>`) and script (`<script>`) in one file. |
| `sw.js` | The service worker. It keeps a copy of the site on each phone so it opens without internet. |
| `manifest.json` | Name, colours and icons used when someone adds the site to their home screen. |
| `icon-180.png`, `icon-192.png`, `icon-512.png` | Home-screen icons. |

There is no build step. The files in this repository are exactly what the site serves.

## How publishing works

The site is hosted on **Cloudflare Pages**, connected to this repository. Every push (commit) to the `main` branch is published automatically, usually within a minute or two. Nothing else needs to be done.

To watch a publish: Cloudflare dashboard → **Workers & Pages** → **sankashti-chaturthi** → **Deployments**. The newest deployment should show *Success*.

## Making a change by hand

### Option A: on the GitHub website (no software needed)

1. Open https://github.com/satishghanekar/sankashti-chaturthi and click `index.html`.
2. Click the pencil icon (**Edit this file**).
3. Use the browser's find (Ctrl+F / ⌘F) to locate the text you want (see *Finding things in index.html* below), and make the change.
4. **Bump the cache version** (see below). This is a second small edit, in `index.html` and in `sw.js`.
5. Click **Commit changes…**, write a short message (for example *Fix typo in Devi Aarti verse 2*), keep **Commit directly to the `main` branch** selected, and click **Commit changes**.
6. Wait a minute or two, then check the live site (see *After publishing*).

When you edit two files (`index.html` and `sw.js`) on the website, each one is its own commit. That is fine; Cloudflare simply publishes twice.

### Option B: on your computer with git

One-time setup:

```sh
git clone https://github.com/satishghanekar/sankashti-chaturthi.git
cd sankashti-chaturthi
```

Every time:

```sh
git pull                      # get the latest version first
# edit index.html (and sw.js for the cache version) in any text editor
python3 -m http.server 8000   # optional: preview at http://localhost:8000, Ctrl+C to stop
git add -A
git commit -m "Describe the change"
git push                      # publishes to the live site
```

Use a plain-text editor that saves UTF-8 (VS Code, Sublime Text, TextEdit in plain-text mode, Notepad). Word processors will damage the file.

### Bump the cache version on every change

Phones keep a saved copy of the site. The cache version tells them a new copy exists. It appears in **two** places, and both must always have the **same** number:

1. `sw.js`, first line:
   ```js
   const V='aarti-v72';
   ```
2. `index.html`, near the end (search for `aarti-v`):
   ```js
   caches.open("aarti-v72")
   ```

Add one to the number in both places (for example `aarti-v72` → `aarti-v73`). If you forget, the change is still published, but phones that already have the site may keep showing the old version for longer.

### After publishing

- Computer: open the site and reload (Ctrl+Shift+R / ⌘⇧R).
- Phone: open the site, wait a few seconds, then close it fully and open it again. The first open fetches the new version; the second shows it.

### Undoing a change

On GitHub, open **Commits** (the clock icon above the file list) and click the commit you want to undo: it shows exactly what changed, red for removed and green for added. Edit the file back the same way and commit again; it publishes like any other change. With git on a computer, `git revert <commit id>` followed by `git push` does the same in one step.

## Finding things in index.html

`index.html` is laid out top to bottom as:

1. `<head>`: title, fonts.
2. `<style>`: all styling, in labelled sections (`/* ==== … ==== */`).
3. `<body>`: the top bar, the settings panel, then the home page and every piece.
4. `<script>`: all behaviour, in labelled sections (`// ---- … ----`).

Each piece is a `<section>` with an id. Search for the id to jump to it:

| Search for | Piece |
|---|---|
| `id="p1"` | Pooja 1. गणपत्यथर्वशीर्षोपनिषत् (Ganapati Atharvashirsha) |
| `id="a1"` | Aarti 1. गणपतीची आरती |
| `id="a2"` | Aarti 2. गणपतीची आरती (हिंदी) |
| `id="a3"` | Aarti 3. देवीची आरती |
| `id="a4"` | Aarti 4. शंकराची आरती |
| `id="a5"` | Aarti 5. दत्ताची आरती |
| `id="a6"` | Aarti 6. ज्ञानेश्वरांची आरती |
| `id="a7"` | Aarti 7. विठ्ठलाची आरती |
| `id="a8"` | Aarti 8. घालीन लोटांगण |
| `id="a9"` | Aarti 9. आरती जय गणेश देवा |
| `id="a10"` | Aarti 10. आरती जय जगदीश हरे |

Or search for a few words of the line itself.

### How a piece is written

```html
<section id="a1" class="ash">
  <header>
    <h2><span class="no"><span class="nm">१.</span><span class="ne">1.</span></span> <span class="mr">गणपतीची आरती</span><span class="en" lang="en">Ganapati Aarti</span></h2>
    <div class="tag"><span class="mr">मराठी</span><span class="en" lang="en">Marathi</span></div>
  </header>
  <div class="rftop">                     <!-- the dhrupad shown once at the top -->
    <div class="lab">…</div>
    <div class="verse">
      <div class="mr"> <p>…Marathi line…</p> … </div>
      <div class="en" lang="en"> <p>…English line…</p> … </div>
    </div>
  </div>
  <div class="items">
    <div class="item">                    <!-- one stanza -->
      <div class="verse">
        <div class="mr">
          <p data-l="s1l1">सुखकर्ता दुःखहर्ता, वार्ता विघ्नाची ।</p>
          …
        </div>
        <div class="en" lang="en">
          <p data-l="s1l1">Sukhkarta Dukhharta, Varta Vighnachi |</p>
          …
        </div>
      </div>
    </div>
    <div class="rmk">…↻ ध्रुपद…</div>      <!-- marker where the dhrupad is sung -->
    <div class="item rf">…</div>          <!-- the dhrupad repeated (shown when "after every stanza" is chosen) -->
    …
  </div>
  …
</section>
```

### Rules when editing text

- **One `<p>` per line.** The Marathi `<p>` lines and the English `<p>` lines of a stanza are paired by position: the 1st Marathi line goes with the 1st English line, and so on. Keep the same number of lines in both.
- **`data-l`** is the line's id (used by search and by tapping a line to highlight it). The Marathi and English versions of a line share the same id. A new line needs an id not used anywhere else on the page.
- **Stanza numbers (॥ १ ॥) are added automatically** at the end of each Aarti stanza. Do not type them. The Atharvashirsha keeps its own numbers, which are part of its text.
- **Piece numbers** (`<span class="nm">१.</span><span class="ne">1.</span>`) are typed in two places: the piece's `<h2>` and its line in the home-page contents (search for `class="toc"`). The left-hand menu and the search list build themselves from the home-page contents.
- **Vedic svara marks** (॑ ॒ ᳚) in the Atharvashirsha must be kept exactly. A mark that belongs with a visarga goes **after** the ः, otherwise it shows as a dotted circle.
- `<br>` inside a line forces a break at that point. An invisible zero-width space (written `&#8203;` if you need to type one) marks a place where a long line may break on a narrow phone.
- Keep `&` written as `&amp;` and `<` as `&lt;` if they ever appear in text.

### Adding a new Aarti

1. Copy a whole `<section id="…" class="ash"> … </section>` block of a similar piece and paste it where the new one should appear.
2. Give it a new `id` (for example `a11`), the next number in its `<h2>`, its title in both languages, and the language tag.
3. Replace the lines, giving every new line a new `data-l` id (for example `s11l1`, `s11l2`, …).
4. Fix the *Previous / Next* links (`<nav class="pn">`) of the new piece and of its neighbours.
5. Add a line for it in the home-page contents (`<ol class="toc">` under आरती).
6. Bump the cache version, commit and push.

## Checking a change

The texts are the point of the site, so after any edit:

- Open the changed piece on the live site in Marathi, English and Both (the language button in the top bar).
- Check it on a phone and on a computer, and try **Print** if the layout changed.
- If a line or a mark looks wrong, compare it with the source booklet before changing anything.
