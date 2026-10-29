// @ts-check
// Which texts a session has, as in Nitya Upasana's js/core/routine.js (the part of it this site uses: no routine
// builder, no week row). Pure functions only (no page), so the unit tests (tests/unit/content.test.mjs) run them in
// Node; js/features/session-card.js puts the answer on the home page.
//
// The routine comes from content/routines.json, written as in Nitya Upasana: for each session, either the same list
// every day ({ mode: "fixed", texts }) or one list per weekday ({ mode: "weekday", days: { mon: […], … } }). This site
// has one session, the evening of every Sankathara Chaturthi, with the same texts each time.

/**
 * @typedef {"morning" | "afternoon" | "evening"} Session
 * @typedef {"sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat"} DayKey
 * @typedef {{ mode: "fixed", texts: string[] } | { mode: "weekday", days: Partial<Record<DayKey, string[]>> }} SessionPlan
 * @typedef {Partial<Record<Session, SessionPlan>>} Routine
 * @typedef {{ to: string } | { end: true }} Step
 */

/** The sessions of a day, in order, as in Nitya Upasana @type {Session[]} */
export const SESSIONS = ["morning", "afternoon", "evening"];

/**
 * The session of the day at this moment (Nitya Upasana's sessionAt(), in its js/core/time-of-day.js): morning until
 * noon, afternoon until 5 pm, then evening
 * @param {Date} now
 * @returns {Session}
 */
export function sessionAt(now) {
  var h = now.getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

/**
 * Prev (dir -1) or Next (dir 1) from a text while reading a session (Nitya Upasana's): the text to go to,
 * { end: true } after the last one (back Home), or null when the text is not in the session or there is nothing
 * before it (then Prev and Next follow the library order).
 * @param {string[]} ids
 * @param {string} id
 * @param {1 | -1} dir
 * @returns {Step | null}
 */
export function stepInSession(ids, id, dir) {
  var i = ids.indexOf(id);
  if (i < 0) return null;
  var j = i + dir;
  if (j >= ids.length) return { end: true };
  return j < 0 ? null : { to: ids[j] };
}

/** Date.getDay() order: 0 Sunday … 6 Saturday @type {DayKey[]} */
export const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/**
 * The texts (ids from content/library.json) of one session on one weekday, each once, in order.
 * A missing or malformed plan is an empty session.
 * @param {Routine | null | undefined} routine
 * @param {number} day  0 Sunday … 6 Saturday
 * @param {Session} session
 * @returns {string[]}
 */
export function textsFor(routine, day, session) {
  var plan = routine && routine[session],
    list = /** @type {unknown} */ (null);
  if (plan && plan.mode === "fixed") list = plan.texts;
  else if (plan && plan.mode === "weekday" && plan.days) list = plan.days[DAY_KEYS[day]];
  if (!Array.isArray(list)) return [];
  /** @type {string[]} */
  var out = [];
  list.forEach(function (/** @type {unknown} */ id) {
    if (typeof id === "string" && out.indexOf(id) < 0) out.push(id);
  });
  return out;
}
