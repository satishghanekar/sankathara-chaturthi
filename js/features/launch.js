// @ts-check
// The launch animation: the first opening of the day (Satish chose it from the mockups, 2026-11-19, the date first so
// it is read at once). js/splash.js starts it as the page is read (the picture, larger); this part, once the page is
// set up, puts the next Chaturthi's lines under it (how many days, the heading, the date and month, the moonrise and
// the place: js/features/date-card.js launchLines()), then lights the words written round the picture, SANKATAHARA
// and CHATURTHI, letter by letter, with a warm light behind Ganesha (css/02-core.css, "The launch animation"); then the
// picture settles into the card's ring and Home shows. A tap or a key ends it at once. As in Nitya Upasana, whose
// stars come out of the night instead.
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

import { ui } from "../core/words.js";
import { menuWords } from "../core/strings.js";
// (as a whole, not by name: an iPhone keeps the scripts it has in memory until the app is closed, so after an update
// this new part can meet the last version's date card, which has no launchLines yet; a name that is missing breaks
// every script on the page, and Nitya Upasana stayed on its splash, 2026-11-19. A missing property only leaves the
// lines out.)
import * as dateCard from "./date-card.js";

// When each part comes (ms from the page being ready): the lines one after another, the letters (css/02-core.css
// staggers them, 80 ms apart, 20 letters), and the picture into the ring
const LINE_STEP = 150;
const LETTERS_AT = 700;
const FLY_AT = 3700;

export function init() {
  var found = document.getElementById("spl");
  if (!found || !found.classList.contains("launch")) return;
  var sp = /** @type {HTMLElement} */ (found),
    boxEl = /** @type {HTMLElement | null} */ (sp.querySelector(".splm"));
  /** It ends: the splash fades (css/02-core.css #spl.done) */
  var end = function () {
    sp.classList.add("done");
  };
  if (!boxEl) return end();
  var box = /** @type {HTMLElement} */ (boxEl);
  var lines = document.createElement("div");
  lines.className = "splh";
  try {
    if (typeof dateCard.launchLines === "function") lines.innerHTML = dateCard.launchLines();
  } catch (e) {
    // without its lines it still ends as it should
    console.warn(e);
  }
  sp.appendChild(lines);
  var skip = document.createElement("div");
  skip.className = "splskip";
  skip.lang = ui();
  // (the words in memory may be the last version's, without these: then none, as above)
  skip.textContent = (menuWords("launch") || { skip: "" }).skip;
  sp.appendChild(skip);
  // from now on a tap or a key ends it at once (js/splash.js marks one made before the page was ready: .skip)
  sp.addEventListener("click", end);
  document.addEventListener("keydown", end, { once: true });
  /** @type {HTMLElement[]} */ ([].slice.call(lines.children)).forEach(function (k, i) {
    setTimeout(function () {
      k.classList.add("on");
    }, i * LINE_STEP);
  });
  setTimeout(function () {
    sp.classList.add("go");
  }, LETTERS_AT);
  setTimeout(function () {
    if (sp.classList.contains("done") || sp.classList.contains("skip")) return;
    lines.classList.add("out");
    // the picture settles into the card's ring (when it is there), and Home shows under it
    var to = document.querySelector("#iconb img"),
      a = box.getBoundingClientRect(),
      b = to ? to.getBoundingClientRect() : null;
    // (an animation, not a changed style: browsers count a moved box as a layout shift, never an animated transform)
    if (b && b.width && a.width)
      box.animate(
        [
          { transform: "none" },
          {
            transform: "translate(" + (b.left - a.left) + "px," + (b.top - a.top) + "px) scale(" + b.width / a.width + ")",
          },
        ],
        {
          duration: 550,
          easing: "cubic-bezier(0.5, 0, 0.2, 1)",
          fill: "forwards",
        },
      );
    setTimeout(end, 380);
  }, FLY_AT);
}
