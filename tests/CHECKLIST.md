# Manual checklist

What the automated tests (`node tests/card.test.js`) can't see needs a real dashboard or a real tree. Run the relevant part before a release that touches it, and say in the pull request what you checked.

## Overlay card (any dashboard)

1. **Taps pass through:** with the overlay showing, tap a button and a tile under the snow and under the string lights. Both respond.
2. **Reduced motion:** turn on *Reduce motion* (iOS: Settings → Accessibility → Motion; Android: Remove animations; macOS: Accessibility → Display). The snow and the blinking stop; the glow stays. Turn it off: they start again.
3. **Edit mode:** open the dashboard editor. The overlay disappears and a small "❄️ Festive overlay — active/inactive now" card shows where you put it, so you can edit or delete it.
4. **Header:** the string lights hang just below the dashboard header, and at the very top when the header is hidden (kiosk mode).
5. **Removal:** delete the card from the view; nothing is left on screen after a reload.

## Tree schedule (blueprint)

Use a test light or the real tree; change the times in a copy of the automation so you don't wait for midnight.

1. **Before sunset, someone home:** the tree comes on. **Nobody home:** it stays off.
2. **Everyone leaves:** off. **With the Guest at home switch on:** stays on.
3. **Switch-off time on a normal night:** off. **On a late night** (e.g. set today's date as a late night): stays on.
4. **Arrival after midnight** (switch-off time later than midnight, e.g. 01:00): it does *not* come back on (documented).
5. **Unplugged tree** (`unavailable`): nothing happens and no errors in the log.
