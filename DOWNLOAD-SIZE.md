# Download size

How much a phone downloads for Sankathara Chaturthi. Written by `cd tests && npm run sizes` (tests/tools/download-size.mjs); the
tests check it is still true (within 5%), and Help (About, "Works without internet") gives the total.

## The first time: about 2.3 MB

Opening the site the first time downloads the page, and the service worker (sw.js) then saves every file in
js/parts.js on the phone, so it works without internet. Sizes are as the server sends them: scripts, styles, words and
texts compressed with gzip (Cloudflare Pages does this by itself); fonts (woff2) and pictures (webp) are compressed
formats already and are sent as they are.

| What | Files | Sent |
| --- | ---: | ---: |
| Fonts | 22 | 1.6 MB |
| Pictures | 6 | 358 KB |
| Code | 58 | 205 KB |
| Styles | 15 | 70 KB |
| Menu words (every menu language) | 5 | 37 KB |
| The page | 2 | 23 KB |
| Texts and calendar data | 15 | 17 KB |
| **All** | 123 | **2.3 MB** |

Opening the app again downloads nothing: it opens from the saved copy.

## A new version

A new version (a new version number in sw.js and index.html) saves a whole fresh copy, every file again except the
fonts, which never change in place and are copied from the old copy: about 0.7 MB.

Nothing else is downloaded later: every part of the site is in the first download.

## Making it smaller

The text files are compressed in transit already, so zipping them again saves nothing. The largest part is the fonts
(1.6 MB): each holds whole alphabets, and cutting them down to the letters the texts and menus use
(subsetting) would save most of that, at the cost of redoing it whenever a text brings a letter not yet in them.
