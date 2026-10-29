/* =====================================================================
   SITE SCRIPT: start-up order
   The behaviour is split into parts (ES modules), one per topic, in the
   folders core/ (settings and apply()), text/ (what happens to the
   verse text) and features/ (each menu, button and gesture).
   Settings live in P (core/state.js) and are saved on this device
   only (localStorage key "aarti2-prefs"); apply() (core/apply.js) turns
   P into the data-* switches on <html> that the styles react to.

   Loading a part only defines its functions. Its init() does what the
   part needs at start-up (reads the page, adds listeners), and the
   parts start in the order below, which is the order they ran in when
   they were one file. Moving a line changes which part is ready first.
   The pieces themselves are put into the page first: text/load.js
   fetches the text files (content/texts/) and has render.js (a plain
   script) build them, and only then do the parts start. The page is
   kept hidden until every part has started (data-ready, below), so it
   never jumps while settling.
   ===================================================================== */

import { load as loadTexts } from "./text/load.js";
import { init as startPage } from "./core/page.js";
import { init as startState } from "./core/state.js";
import { init as startFeatures } from "./core/features.js";
import { init as startIast } from "./text/iast.js";
import { init as startLayout } from "./text/layout.js";
import { init as startAstronomy } from "./features/astronomy.js";
import { init as startDateCard } from "./features/date-card.js";
import { init as startDhrupadMarkers } from "./text/dhrupad-markers.js";
import { init as startStanzaNumbers } from "./text/stanza-numbers.js";
import { init as startLineBreaks } from "./text/line-breaks.js";
import { init as startAutofit } from "./text/autofit.js";
import { init as startApply } from "./core/apply.js";
import { init as startBottomBar } from "./features/bottom-bar.js";
import { init as startBars } from "./features/bars.js";
import { init as startSettingsPanel } from "./features/settings-panel.js";
import { init as startReadingSheet } from "./features/reading-sheet.js";
import { init as startWakeLock } from "./features/wake-lock.js";
import { init as startHistory } from "./features/history.js";
import { init as startLanguages } from "./features/languages.js";
import { init as startSessionCard } from "./features/session-card.js";
import { init as startContentsList } from "./features/contents-list.js";
import { init as startClicks } from "./features/clicks.js";
import { init as startPinch } from "./features/pinch.js";
import { init as startSearch } from "./text/search.js";
import { init as startStartup } from "./core/startup.js";
import { init as startPictureViewer } from "./features/picture-viewer.js";
import { init as startHelp } from "./features/help.js";
import { init as startPrint } from "./features/print.js";
import { init as startShare } from "./features/share.js";
import { init as startMoreMenu } from "./features/more-menu.js";
import { init as startOffline } from "./features/offline.js";

// One part that fails to start is reported and passed over, so the parts after it still start (a part that needs
// it may then fail too, but no more than that)
/** @param {() => void} init */
function run(init) {
  try {
    init();
  } catch (e) {
    console.error(e);
  }
}

function start() {
  try {
    run(startPage); // Page basics: the <html> element, the language button icons, the short message (flash)
    run(startState); // Settings (P), loaded from this device
    run(startFeatures); // Features held back for a later release
    run(startIast); // IAST transliteration (Devanagari → Latin with diacritics, Vedic accents as marks)
    run(startLayout); // Layout helpers that run once
    run(startAstronomy); // Astronomy for the Next Sankathara Chaturthi card
    run(startDateCard); // Next Sankathara Chaturthi card (computed on this device; works offline)
    run(startDhrupadMarkers); // Tappable dhrupad markers (every text with refrain: every-verse)
    run(startStanzaNumbers); // Stanza numbers
    run(startLineBreaks); // Preferred line breaks
    run(startAutofit); // Auto-fit text size
    run(startApply); // Current piece, menus and apply()
    run(startBottomBar); // Bottom bar (#asc): ‹ Prev, Home, Library, Aa, Next ›
    run(startBars); // Bars tuck away while reading (CSS: "Bars tuck away while reading")
    run(startSettingsPanel); // Settings panel
    run(startReadingSheet); // Reading sheet: Aa in the bottom bar slides up language, text size and dhrupad
    run(startWakeLock); // Keep the screen on (Wake Lock). Browsers drop the lock when the page is hidden, so it is re-requested.
    run(startHistory); // Back button
    run(startLanguages); // Settings page: languages
    run(startSessionCard); // Home: the evening's texts (content/routines.json), as Nitya Upasana's Today card
    run(startContentsList); // Contents list inside the contents + search overlay (built from the home page contents)
    run(startClicks); // Clicks: contents links (data-go) jump to a piece; tapping a verse line highlights it
    run(startPinch); // Pinch with two fingers to change the text size (the page itself never zooms)
    run(startSearch); // Search: every Marathi line with its English line; matches ignore svara marks and punctuation
    run(startStartup); // Start-up
    run(startPictureViewer); // Full-screen picture (#pzv): pinch or double-tap to zoom (1x to 5x), drag to move
    run(startHelp); // Help: opens over the page; the phone's Back button closes it
    run(startPrint); // Print
    run(startShare); // Share, QR code and the Add to Home Screen buttons
    run(startMoreMenu); // More (⋯ in the top bar): App, Share, QR and Help in a small menu
    run(startOffline); // Offline use: home-screen app details and the service worker (sw.js)
  } finally {
    // Show the page (see "data-ready" in css/02-core.css), even if a part failed to start
    document.documentElement.setAttribute("data-ready", "");
  }
}

// The texts first (the parts read them from the page), then the parts. If the texts can't be loaded, the parts
// still start, so the home page, Settings and Help work.
loadTexts()
  .catch(function (e) {
    console.error(e);
  })
  .then(start);
