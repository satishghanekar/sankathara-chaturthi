// Features held back for a later release
// One part of the site script; js/main.js runs each part's init() in order. See js/README.md.

export var FEAT_AS, FEAT_TL;

export function init() {
  // Autoscroll (the ▶ in the bottom bar, its Settings switch and its Help entry) is built and tested but not
  // released yet. With FEAT_AS false the switch and Help entry (data-feat="as") stay hidden, the ▶ never shows
  // and asStart() does nothing. A reader's saved choice (P.ason) is left as it is, so nothing is lost.
  // To release it: set FEAT_AS to true. Nothing else needs changing.
  FEAT_AS = false;
  if (FEAT_AS)
    [].forEach.call(document.querySelectorAll('[data-feat="as"]'), function (e) {
      e.hidden = false;
    });
  // Tilt to scroll (the tilted-phone button in the bottom bar and its Help entry, data-feat="tl") is built and
  // tested the same way. With FEAT_TL false the button never shows (data-tilt is not set), so it can't start.
  // To release it: set FEAT_TL to true. Nothing else needs changing.
  FEAT_TL = false;
  if (FEAT_TL)
    [].forEach.call(document.querySelectorAll('[data-feat="tl"]'), function (e) {
      e.hidden = false;
    });
}
