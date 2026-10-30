// The month line on the date card (js/features/date-card.js): each Sankashti's amanta month, अधिक when so, from
// js/core/panchang.js (Nitya Upasana's, unit-tested there against the Swiss Ephemeris). Columbus, 2026–2027, as
// Kalnirnay names them.
import { describe, expect, test } from "vitest";
import { masaOf } from "../../js/core/panchang.js";
import { init, SK } from "../../js/features/astronomy.js";

init();
const COLUMBUS = { lat: 39.96, lon: -83.0 };
const month = (o) => {
  const m = masaOf(new Date(o.start));
  return (m.adhikaName ? m.adhikaName.mr + " " : "") + m.name.mr;
};

describe("the month of each Sankashti", () => {
  const list = SK.upcoming(new Date(2026, 0, 1).getTime(), COLUMBUS.lat, COLUMBUS.lon, 25);
  const byDate = Object.fromEntries(list.map((o) => [new Date(o.day).toDateString(), month(o)]));

  test("Kartik for 27 November 2026, Ashvin for 28 October 2026", () => {
    expect(byDate["Fri Nov 27 2026"]).toBe("कार्तिक");
    expect(byDate["Wed Oct 28 2026"]).toBe("आश्विन");
  });
  test("2026's adhika month: Adhika Jyeshtha on 3 June, then Jyeshtha itself on 3 July", () => {
    expect(byDate["Wed Jun 03 2026"]).toBe("अधिक ज्येष्ठ");
    expect(byDate["Fri Jul 03 2026"]).toBe("ज्येष्ठ");
  });
  test("one month after another, Paush 2026 to Margashirsha 2027, the adhika month aside", () => {
    const names = list.map(month).filter((m) => !m.startsWith("अधिक"));
    const order = ["चैत्र", "वैशाख", "ज्येष्ठ", "आषाढ", "श्रावण", "भाद्रपद", "आश्विन", "कार्तिक", "मार्गशीर्ष", "पौष", "माघ", "फाल्गुन"];
    expect(names[0]).toBe("पौष");
    for (let i = 1; i < names.length; i++) expect(order.indexOf(names[i])).toBe((order.indexOf(names[i - 1]) + 1) % 12);
  });
});
