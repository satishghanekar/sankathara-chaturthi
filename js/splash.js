// @ts-check
// The splash (#spl in index.html): from the very first paint until the site script has set up the page, the app's
// picture, as on Home, and the app's name. While it waits, the eight lamps around Ganesha light up one after another
// (css/02-core.css, "Splash"). It goes once js/main.js sets data-ready. As in Nitya Upasana, whose splash lights the
// seven weekday stars instead. The first opening of the day plays the launch animation instead (below).
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
  var found = document.getElementById("spl");
  if (!found) return;
  var sp = /** @type {HTMLElement} */ (found);
  // the version, small at the foot, on a line of its own under who made the site (from <meta name="version">, as Settings → About shows it)
  var ver = sp.querySelector(".spl-ver"),
    meta = document.querySelector('meta[name="version"]');
  if (ver && meta) ver.textContent = "Version " + (meta.getAttribute("content") || "").replace(/^aarti-v/, "");
  var box = /** @type {HTMLElement} */ (sp.querySelector(".splm")),
    img = sp.querySelector("img");
  if (!box || !img) return;
  img.src = "picture-360.webp";
  // The first opening of the day plays the launch animation instead (css/02-core.css, "The launch animation";
  // js/features/launch.js runs it once the page is ready): the next Chaturthi's date first, then the words written round
  // the picture, SANKATAHARA and CHATURTHI, lighting up letter by letter. Only on Home (not a link to a text or the
  // install page), never for a reader who asks for less motion, and once a day: the day is kept on this phone
  // (localStorage "sankathara-launch"). Every other time the app is opened (as in Nitya Upasana, Satish 2026-11-21) the
  // plain splash stays a moment, about 1.5 s, while the lamps light in turn (#spl.brief; js/features/launch.js ends it):
  // once a visit, not again when the page reloads (sessionStorage "sankathara-opened", gone when the app or tab closes).
  var now = new Date(),
    key = now.getFullYear() + "-" + (now.getMonth() + 1) + "-" + now.getDate(),
    full = false,
    brief = false;
  try {
    var home = window.top === window && !location.hash && !location.search && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    full = home && localStorage.getItem("sankathara-launch") !== key;
    brief = home && !full && !sessionStorage.getItem("sankathara-opened");
    if (full) localStorage.setItem("sankathara-launch", key);
    if (home) sessionStorage.setItem("sankathara-opened", "1");
  } catch (e) {
    full = brief = false;
  }
  // a tap or a key ends either (once the page is ready: css/02-core.css)
  if (full || brief) {
    sp.setAttribute("data-t0", String(Math.round(performance.now())));
    var skip = function () {
      sp.classList.add("skip");
    };
    sp.addEventListener("click", skip);
    document.addEventListener("keydown", skip, { once: true });
  }
  if (brief) sp.classList.add("brief");
  if (full) {
    sp.classList.add("launch");
    // The letters' centres, in % of the picture: SANKATAHARA on an arc over the top, CHATURTHI on one under the
    // bottom, both read left to right (measured off picture.webp)
    /** @param {number} cx @param {number} cy @param {number} r @param {number} a0 @param {number} a1 @param {number} n */
    var arc = function (cx, cy, r, a0, a1, n) {
      /** @type {number[][]} */
      var out = [];
      for (var i = 0; i < n; i++) {
        var a = ((a0 + ((a1 - a0) * i) / (n - 1)) * Math.PI) / 180;
        out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      return out;
    };
    // each letter seen through a small soft window onto a brighter copy of the picture, lit in turn (.go)
    arc(50, 49.5, 39.5, -141.7, -38.3, 11)
      .concat(arc(50, 47.9, 42.1, 128.1, 51.9, 9))
      .forEach(function (s, i) {
        var g = document.createElement("i");
        g.className = "splg";
        g.style.left = s[0] + "%";
        g.style.top = s[1] + "%";
        g.style.backgroundImage = "url(picture-360.webp)";
        // (the window is 12% of the picture: this puts the letter's centre in its middle)
        g.style.backgroundPosition = ((s[0] - 6) / 0.88).toFixed(2) + "% " + ((s[1] - 6) / 0.88).toFixed(2) + "%";
        g.style.animationDelay = (i * 0.08).toFixed(2) + "s";
        box.appendChild(g);
      });
    // and a warm light behind Ganesha once they are lit
    var halo = document.createElement("i");
    halo.className = "splo";
    box.appendChild(halo);
    // set up: its picture may show now (css/02-core.css)
    sp.setAttribute("data-set", "");
    return;
  }
  // a glow on each lamp, lit in turn
  LAMPS.forEach(function (s, i) {
    var glow = document.createElement("i");
    glow.className = "spls";
    glow.style.left = s[0] + "%";
    glow.style.top = s[1] + "%";
    glow.style.animationDelay = (i * 0.22).toFixed(2) + "s";
    box.appendChild(glow);
  });
  sp.setAttribute("data-set", "");
})();
