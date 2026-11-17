/*
 * Tests for dist/festive-overlay-card.js, with a tiny fake DOM (no browser).
 *   node tests/card.test.js
 * Covers: the season window across the new year, taps passing through,
 * reduced motion, edit mode, entity states and config errors.
 * What needs a real dashboard is in tests/CHECKLIST.md.
 */
"use strict";

const readText = typeof require === "function"
  ? (p) => require("fs").readFileSync(require("path").join(__dirname, "..", p), "utf8")
  : globalThis.readText; // set by a runner without Node

// ---------------------------------------------------------------- fake DOM

class FakeNode {
  constructor() { this.hidden = false; this.textContent = ""; this.children = {}; }
  querySelector(sel) { return this.children[sel] || null; }
}

class FakeShadow {
  constructor() { this._html = ""; this.nodes = {}; this.firstElementChild = null; }
  set innerHTML(html) {
    this._html = html;
    const placeholder = new FakeNode();
    placeholder.children[".status"] = new FakeNode();
    this.nodes = { ".root": new FakeNode(), ".placeholder": placeholder };
    this.firstElementChild = this.nodes[".root"];
  }
  get innerHTML() { return this._html; }
  querySelector(sel) { return this.nodes[sel] || null; }
}

globalThis.HTMLElement = class {
  constructor() { this._attrs = new Set(); this.style = { setProperty() {} }; }
  attachShadow() { this.shadowRoot = new FakeShadow(); return this.shadowRoot; }
  setAttribute(n) { this._attrs.add(n); }
  removeAttribute(n) { this._attrs.delete(n); }
  toggleAttribute(n, on) { if (on) this._attrs.add(n); else this._attrs.delete(n); }
  hasAttribute(n) { return this._attrs.has(n); }
  getRootNode() { return globalThis.document; }
};
globalThis.document = {};
globalThis.window = { addEventListener() {}, removeEventListener() {} };
const registry = {};
globalThis.customElements = { get: (n) => registry[n], define: (n, c) => { registry[n] = c; } };
globalThis.console = globalThis.console || { info() {}, log() {} };

(0, eval)(readText("dist/festive-overlay-card.js"));
const Card = registry["festive-overlay-card"];

// ---------------------------------------------------------------- tiny runner

let passed = 0;
const failures = [];
function test(name, fn) {
  try { fn(); passed += 1; } catch (err) { failures.push(`${name}: ${err.message}`); }
}
function ok(value, message) { if (!value) throw new Error(message || "expected true"); }
function eq(a, b, message) { if (a !== b) throw new Error(`${message || ""} expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`); }
function throws(fn, text) {
  try { fn(); } catch (err) { if (!String(err.message).includes(text)) throw new Error(`wrong error: ${err.message}`); return; }
  throw new Error(`expected an error containing "${text}"`);
}
const day = (m, d) => new Date(2026, m - 1, d, 12);
function card(config, hass) {
  const c = new Card();
  c.setConfig(config);
  if (hass) c.hass = hass;
  return c;
}
const hassWith = (state) => ({ states: { "light.tree": { state } } });

// ---------------------------------------------------------------- season

const winter = { from: "12-01", to: "01-06" };
test("season across the new year: inside", () => {
  ok(inSeason(winter, day(12, 1)), "1 Dec");
  ok(inSeason(winter, day(12, 31)), "31 Dec");
  ok(inSeason(winter, day(1, 1)), "1 Jan");
  ok(inSeason(winter, day(1, 6)), "6 Jan");
});
test("season across the new year: outside", () => {
  ok(!inSeason(winter, day(11, 30)), "30 Nov");
  ok(!inSeason(winter, day(1, 7)), "7 Jan");
  ok(!inSeason(winter, day(7, 15)), "July");
});
test("season inside one year", () => {
  const nov = { from: "11-01", to: "11-30" };
  ok(inSeason(nov, day(11, 15)));
  ok(!inSeason(nov, day(12, 1)));
});
test("no season means always", () => ok(inSeason(undefined, day(7, 1))));

// ---------------------------------------------------------------- taps and motion

test("taps pass through outside edit mode", () => {
  const css = buildStyles({ ...{ snow: "normal", z_index: 3, respect_reduced_motion: true } });
  ok(/:host\(:not\(\[editing\]\)\)\s*\{[^}]*pointer-events:\s*none !important/.test(css), "host must not catch taps");
  ok(/\.root\s*\{[^}]*pointer-events:\s*none/.test(css), "overlay must not catch taps");
});
test("reduced motion stops the animations (default)", () => {
  const css = buildStyles({ snow: "normal", z_index: 3, respect_reduced_motion: true });
  ok(css.includes("prefers-reduced-motion: reduce"), "media query present");
  ok(/animation:\s*none !important/.test(css), "animations switched off");
});
test("reduced motion can be ignored when asked", () => {
  const css = buildStyles({ snow: "normal", z_index: 3, respect_reduced_motion: false });
  ok(!css.includes("prefers-reduced-motion"));
});

// ---------------------------------------------------------------- states and edit mode

test("shows while the entity is on, hides when off", () => {
  const c = card({ entity: "light.tree" }, hassWith("on"));
  ok(!c.hasAttribute("hidden"), "visible when on");
  c.hass = hassWith("off");
  ok(c.hasAttribute("hidden"), "hidden when off");
  eq(c.getCardSize(), 0, "takes no space");
});
test("a list of states", () => {
  const c = card({ entity: "light.tree", state: ["on", "playlist"] }, hassWith("playlist"));
  ok(!c.hasAttribute("hidden"));
});
test("unplugged tree (missing or unavailable) shows nothing", () => {
  ok(card({ entity: "light.tree" }, { states: {} }).hasAttribute("hidden"), "missing");
  ok(card({ entity: "light.tree" }, hassWith("unavailable")).hasAttribute("hidden"), "unavailable");
});
test("edit mode: a small card you can find, overlay off", () => {
  const c = card({ entity: "light.tree" }, hassWith("on"));
  c.editMode = true;
  ok(c.hasAttribute("editing"), "editing attribute");
  ok(!c.hasAttribute("hidden"), "visible in the editor");
  ok(c.shadowRoot.querySelector(".root").hidden, "overlay hidden while editing");
  ok(!c.shadowRoot.querySelector(".placeholder").hidden, "placeholder shown");
  eq(c.shadowRoot.querySelector(".placeholder").querySelector(".status").textContent, "active now");
  eq(c.getCardSize(), 1);
  c.editMode = false;
  ok(!c.hasAttribute("editing"), "back to overlay");
});
test("only the chosen effects are drawn", () => {
  const html = card({ effects: ["snow"] }).shadowRoot.innerHTML.split("</style>")[1]; // elements, not CSS
  ok(html.includes("layer near"), "snow drawn");
  ok(!html.includes('class="bulbs"') && !html.includes('class="glow"'), "lights and glow not drawn");
});

// ---------------------------------------------------------------- config errors

test("config errors say what to fix", () => {
  throws(() => card({ effects: ["snow", "fireworks"] }), "Unknown effect(s): fireworks");
  throws(() => card({ effects: "snow" }), "'effects' must be a list");
  throws(() => card({ snow: "blizzard" }), "'snow' must be light, normal or heavy");
  throws(() => card({ season: { from: "1 Dec", to: "01-06" } }), "'season' needs from/to as MM-DD");
  throws(() => card({ lights_top: "high" }), "'lights_top' must be a number");
});

// ---------------------------------------------------------------- result

const summary = `${passed} passed, ${failures.length} failed`;
if (failures.length) {
  const text = failures.map((f) => `FAIL ${f}`).join("\n") + "\n" + summary;
  if (typeof process !== "undefined") { console.log(text); process.exit(1); }
  throw new Error(text);
}
if (typeof process !== "undefined") console.log(summary);
globalThis.TEST_SUMMARY = summary;
