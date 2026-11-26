# Changelog

All notable changes to this project. Versions follow [semantic versioning](https://semver.org/); each entry links to its full release notes on GitHub, which also say how each change was tested.

## [0.3.1] — 2026-11-17

Overlay first, tested card.

- **README starts with the 2-minute quick win:** install the card, paste one line, done (no Mushroom, card-mod or helpers). The optional extras follow, each with what it needs, and a **Remove it** section shows how to take each piece off on its own.
- The card's own version string now matches the release (it said 0.1.1).

## [0.3.0] — 2026-11-17

Guest at home.

- **Tree schedule: Guest at home** (optional switch). With a guest staying without you, the house counts as occupied: the tree still comes on before sunset and isn't switched off when you all leave.

## [0.2.0] — 2026-11-16

Festive mode Auto / On / Off.

- **Festive mode switch:** `examples/festive-mode-package.yaml` adds a selector (**Auto** follows the tree light, **On**, **Off**) and a `binary_sensor.festive_mode_active` for the overlay card's `entity`. See *Auto / On / Off switch* in the README.

## [0.1.1] — 2026-11-09

First public release.

- Falling snow (light, normal or heavy), string lights along the top and a warm glow, all in pure CSS. Clicks pass through, and it respects Reduce motion.
- Show it only while an entity is on (your tree), during a season window such as `12-01` → `01-06`, or both.
- String lights hang just below the dashboard header, or at the top when the header is hidden (`lights_top` to override).
- Festive tree schedule blueprint: on before sunset when someone is home, off when everyone leaves and at night, with late nights for Christmas Eve and New Year's Eve.
- Christmas countdown card example (Mushroom + card-mod).
- Festive theme.

[0.3.1]: https://github.com/davidteles/ha-festive-panel/releases/tag/v0.3.1
[0.3.0]: https://github.com/davidteles/ha-festive-panel/releases/tag/v0.3.0
[0.2.0]: https://github.com/davidteles/ha-festive-panel/releases/tag/v0.2.0
[0.1.1]: https://github.com/davidteles/ha-festive-panel/releases/tag/v0.1.1
