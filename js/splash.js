// @ts-check
// The splash (#spl in index.html): from the very first paint until the site script has set up the page, the app's
// picture, as on Home, and the app's name. While it waits, the eight lamps around Ganesha light up one after another
// (css/02-core.css, "Splash"). It goes once js/main.js sets data-ready. As in Nitya Upasana, whose splash lights the
// seven weekday stars instead.
// A plain script, run as the page is read, so it needs no module and nothing else to load first. It also puts the
// reader's theme on the page now (from the boot copy of the settings), so the splash is light, sepia or dark to match.
(function () {
  // The lamps' flames in picture.webp, in % of its size, lit in turn round the picture: from the lower left, up and over
  // to the lower right
  var LAMPS = [
    [29.4, 71.2],
    [21.0, 54.5],
    [19.4, 32.2],
    [33.6, 31.6],
    [66.2, 31.6],
    [80.1, 32.2],
    [78.8, 54.5],
    [69.6, 71.2],
  ];
  try {
    var th = JSON.parse(localStorage.getItem("aarti2-prefs") || "{}").th;
    if (th === "light" || th === "dark" || th === "sepia") document.documentElement.setAttribute("data-pref", th);
  } catch (e) {}
  var sp = document.getElementById("spl");
  if (!sp) return;
  var box = /** @type {HTMLElement} */ (sp.querySelector(".splm")),
    img = sp.querySelector("img");
  if (!box || !img) return;
  img.src = "picture-360.webp";
  // a glow on each lamp, lit in turn
  LAMPS.forEach(function (s, i) {
    var glow = document.createElement("i");
    glow.className = "spls";
    glow.style.left = s[0] + "%";
    glow.style.top = s[1] + "%";
    glow.style.animationDelay = (i * 0.22).toFixed(2) + "s";
    box.appendChild(glow);
  });
})();
