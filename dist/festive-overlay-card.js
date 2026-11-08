/*
 * Festive Overlay Card for Home Assistant
 * Falling snow, a string of blinking lights and a warm glow over the whole
 * dashboard — pure CSS, no images, no animation loop in JavaScript.
 *
 * https://github.com/davidteles/ha-festive-panel
 * MIT License
 */

const CARD_VERSION = "0.1.0";

const SNOW_LEVELS = {
  light: { near: 0.55, far: 0.4, speedNear: 22, speedFar: 14 },
  normal: { near: 0.8, far: 0.6, speedNear: 17, speedFar: 10 },
  heavy: { near: 1, far: 0.85, speedNear: 12, speedFar: 7 },
};

const DEFAULTS = {
  effects: ["snow", "lights", "glow"],
  state: "on",
  snow: "normal",
  z_index: 3,
  respect_reduced_motion: true,
};

/** "MM-DD" → number MMDD, or null when invalid. */
function parseDay(value) {
  if (typeof value !== "string") return null;
  const m = value.trim().match(/^(\d{1,2})-(\d{1,2})$/);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return month * 100 + day;
}

/** True when today is inside the season window (the window may wrap the new year). */
function inSeason(season, now = new Date()) {
  if (!season) return true;
  const from = parseDay(season.from);
  const to = parseDay(season.to);
  if (from === null || to === null) return true;
  const today = (now.getMonth() + 1) * 100 + now.getDate();
  return from <= to ? today >= from && today <= to : today >= from || today <= to;
}

function buildStyles(cfg) {
  const snow = SNOW_LEVELS[cfg.snow] || SNOW_LEVELS.normal;
  const reduced = cfg.respect_reduced_motion
    ? `@media (prefers-reduced-motion: reduce) {
        .layer, .bulbs::before, .bulbs::after { animation: none !important; }
      }`
    : "";
  return `
    :host { display: block; }
    :host(:not([editing])) {
      position: fixed !important;
      inset: 0 !important;
      pointer-events: none !important;
      z-index: ${Number(cfg.z_index) || 0};
    }
    :host([hidden]) { display: none !important; }
    .root { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }

    /* Warm glow: soft gold from the top, deep red from the bottom. */
    .glow {
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse at 50% -10%, rgba(255, 200, 120, 0.10), transparent 55%),
        radial-gradient(ellipse at 50% 115%, rgba(180, 20, 30, 0.14), transparent 60%);
    }

    /* Snow: two tiled layers at different speeds give depth. */
    .layer {
      position: absolute; left: 0; right: 0; top: -300px; bottom: 0;
      background-repeat: repeat; will-change: transform;
      animation: festive-snow linear infinite;
    }
    .near {
      background-image:
        radial-gradient(circle at 20px 30px, rgba(255,255,255,.95) 1.5px, transparent 2.5px),
        radial-gradient(circle at 110px 140px, rgba(255,255,255,.85) 1.5px, transparent 2.5px),
        radial-gradient(circle at 205px 60px, rgba(255,255,255,.75) 1px, transparent 2px),
        radial-gradient(circle at 262px 222px, rgba(255,255,255,.9) 2px, transparent 3px),
        radial-gradient(circle at 150px 270px, rgba(255,255,255,.7) 1px, transparent 2px);
      background-size: 300px 300px;
      opacity: ${snow.near};
      animation-duration: ${snow.speedNear}s;
    }
    .far {
      background-image:
        radial-gradient(circle at 60px 90px, rgba(255,255,255,.9) 2.5px, transparent 3.5px),
        radial-gradient(circle at 185px 250px, rgba(255,255,255,.75) 2px, transparent 3px),
        radial-gradient(circle at 280px 20px, rgba(255,255,255,.8) 3px, transparent 4px);
      background-size: 300px 300px;
      background-position: 140px 0;
      opacity: ${snow.far};
      filter: blur(0.7px);
      animation-duration: ${snow.speedFar}s;
    }
    @keyframes festive-snow {
      from { transform: translate3d(0, 0, 0); }
      to { transform: translate3d(0, 300px, 0); }
    }

    /* String lights: a drooping wire with red, green and gold bulbs. */
    .wire {
      position: absolute; top: 0; left: 0; right: 0; height: 34px; z-index: 1;
      background:
        radial-gradient(circle at 40px 13px, #1d2e22 0 3.5px, transparent 4px) 0 0 / 160px 34px repeat-x,
        radial-gradient(circle at 80px 17px, #1d2e22 0 3.5px, transparent 4px) 0 0 / 160px 34px repeat-x,
        radial-gradient(circle at 120px 13px, #1d2e22 0 3.5px, transparent 4px) 0 0 / 160px 34px repeat-x,
        radial-gradient(80px 17px at 50% 0, transparent 91%, rgba(30,70,38,.95) 92.5%, rgba(30,70,38,.95) 100%, transparent 101%) 0 0 / 160px 34px repeat-x;
    }
    .bulbs { position: absolute; top: 0; left: 0; right: 0; height: 50px; z-index: 2; }
    .bulbs::before, .bulbs::after {
      content: ""; position: absolute; inset: 0;
      background-repeat: repeat-x; background-size: 160px 50px;
      animation: festive-blink 1.4s linear infinite, festive-hue 7s linear infinite;
    }
    .bulbs::before {
      background-image:
        radial-gradient(ellipse 6px 9px at 40px 24px, #fff 0 15%, #ff2d2d 40% 100%, transparent 101%),
        radial-gradient(circle at 40px 24px, rgba(255,45,45,.45) 0 8px, transparent 18px),
        radial-gradient(ellipse 6px 9px at 120px 24px, #fff 0 15%, #2dff6a 40% 100%, transparent 101%),
        radial-gradient(circle at 120px 24px, rgba(45,255,106,.45) 0 8px, transparent 18px);
    }
    .bulbs::after {
      background-image:
        radial-gradient(ellipse 6px 9px at 80px 28px, #fff 0 15%, #ffcc2d 40% 100%, transparent 101%),
        radial-gradient(circle at 80px 28px, rgba(255,204,45,.45) 0 8px, transparent 18px);
      animation-delay: -0.7s, -3.5s;
    }
    @keyframes festive-blink {
      0%, 45% { opacity: 1; } 50%, 95% { opacity: .25; } 100% { opacity: 1; }
    }
    @keyframes festive-hue {
      from { filter: hue-rotate(0deg) brightness(1.15); }
      to { filter: hue-rotate(360deg) brightness(1.15); }
    }

    /* Placeholder shown only while editing the dashboard. */
    .placeholder {
      padding: 12px 16px; border-radius: var(--ha-card-border-radius, 12px);
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #222);
      border: 1px dashed var(--divider-color, #ccc);
      font: 14px/1.4 var(--paper-font-body1_-_font-family, sans-serif);
    }
    ${reduced}
  `;
}

class FestiveOverlayCard extends HTMLElement {
  static getStubConfig() {
    return { effects: ["snow", "lights", "glow"], season: { from: "12-01", to: "01-06" } };
  }

  static getConfigElement() {
    return undefined; // YAML only for now.
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._active = null;
    this._editing = false;
  }

  setConfig(config) {
    if (!config || typeof config !== "object") {
      throw new Error("Invalid configuration");
    }
    const cfg = { ...DEFAULTS, ...config };
    if (!Array.isArray(cfg.effects)) {
      throw new Error("'effects' must be a list, e.g. [snow, lights, glow]");
    }
    const unknown = cfg.effects.filter((e) => !["snow", "lights", "glow"].includes(e));
    if (unknown.length) {
      throw new Error(`Unknown effect(s): ${unknown.join(", ")}`);
    }
    if (cfg.snow && !SNOW_LEVELS[cfg.snow]) {
      throw new Error("'snow' must be light, normal or heavy");
    }
    if (cfg.season && (parseDay(cfg.season.from) === null || parseDay(cfg.season.to) === null)) {
      throw new Error("'season' needs from/to as MM-DD, e.g. from: 12-01, to: 01-06");
    }
    this._config = cfg;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._update();
  }

  // Home Assistant sets these while the dashboard is being edited.
  set editMode(value) {
    this._editing = Boolean(value);
    this._update(true);
  }

  set preview(value) {
    this._editing = Boolean(value);
    this._update(true);
  }

  getCardSize() {
    return this._editing ? 1 : 0;
  }

  getGridOptions() {
    return { columns: 12, rows: "auto" };
  }

  _isActive() {
    const cfg = this._config;
    if (!cfg) return false;
    if (!inSeason(cfg.season)) return false;
    if (!cfg.entity) return true;
    const stateObj = this._hass && this._hass.states[cfg.entity];
    if (!stateObj) return false;
    const wanted = Array.isArray(cfg.state) ? cfg.state.map(String) : [String(cfg.state)];
    return wanted.includes(stateObj.state);
  }

  _render() {
    const cfg = this._config;
    const fx = new Set(cfg.effects);
    this.shadowRoot.innerHTML = `
      <style>${buildStyles(cfg)}</style>
      <div class="root" part="overlay">
        ${fx.has("glow") ? '<div class="glow"></div>' : ""}
        ${fx.has("snow") ? '<div class="layer near"></div><div class="layer far"></div>' : ""}
        ${fx.has("lights") ? '<div class="wire"></div><div class="bulbs"></div>' : ""}
      </div>
      <div class="placeholder" hidden>
        ❄️ Festive overlay — <span class="status"></span>
      </div>`;
    this._active = null;
    this._update(true);
  }

  _update(force = false) {
    if (!this._config || !this.shadowRoot.firstElementChild) return;
    const active = this._isActive();
    if (!force && active === this._active) return;
    this._active = active;

    const root = this.shadowRoot.querySelector(".root");
    const placeholder = this.shadowRoot.querySelector(".placeholder");
    if (this._editing) {
      // While editing, stay in the layout as a small card so it can be found and removed.
      this.setAttribute("editing", "");
      this.removeAttribute("hidden");
      root.hidden = true;
      placeholder.hidden = false;
      placeholder.querySelector(".status").textContent = active ? "active now" : "inactive now";
      return;
    }
    this.removeAttribute("editing");
    placeholder.hidden = true;
    root.hidden = !active;
    this.toggleAttribute("hidden", !active);
  }
}

if (!customElements.get("festive-overlay-card")) {
  customElements.define("festive-overlay-card", FestiveOverlayCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: "festive-overlay-card",
    name: "Festive Overlay",
    description: "Falling snow, string lights and a warm glow over the whole dashboard.",
    preview: false,
    documentationURL: "https://github.com/davidteles/ha-festive-panel",
  });
  console.info(
    `%c FESTIVE-OVERLAY-CARD %c v${CARD_VERSION} `,
    "color:#fff;background:#b3122a;font-weight:700",
    "color:#b3122a;background:#fff"
  );
}
