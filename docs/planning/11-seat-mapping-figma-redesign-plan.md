# Follow-up: Seat Mapping Redesign to Match Figma

The user shared two Figma screenshots directly (not the design tool itself — I don't have browser/Figma-API access in this environment, only these images) alongside two screenshots of the actual running app, specifically to compare. The Date/Showtime screen was already close to its Figma reference. The Seat Mapping screen (built in Feature 6 from a low-resolution decorative thumbnail, since no direct reference existed at the time) turned out to be substantially different from the real Figma design. This redesigns it to match.

## What changed and why

The Figma seat map is meaningfully more sophisticated than the original build:

| Aspect | Original (Feature 6) | Figma reference | Now |
|---|---|---|---|
| Row labels | Letters (A–H) | Numbers (1–10) | Numbers (1–10) |
| Seat layout | One continuous row of 10 | Three blocks per row (aisle gaps) | Three blocks (3 / 12 / 3) with visual gaps |
| Seat categories | available / selected / occupied only | Regular ($50) and VIP ($150) tiers, shown by color even when available | Same — `tier` field added to the `Seat` type |
| Selected color | Blue | Gold | Gold (`colors.accentGold` — already in the palette, unused until now) |
| Legend | 3 items, no prices | 2×2 grid with prices | 2×2 grid: Selected / Not available / VIP ($150) / Regular ($50) |
| Selection summary | Plain text | Removable per-seat chips ("4 / 3 row") | Same chip format, with an X to deselect |
| Bottom action | Full-width "Continue" | Split: "Total Price $X" + "Proceed to pay" | Same split layout |
| Header | Movie title only | Title + "{date} \| {time} {hall}" | Title + schedule label, passed from the new Showtime screen |
| Extras | — | Zoom (+/−) controls, a scroll-position indicator | Both added |

## Data model

`Seat` (`src/types/seat.ts`) gained `tier: 'regular' | 'vip'`. `seatLayout.ts` was rewritten: rows are now numeric strings `"1"`–`"10"`, `SEATS_PER_ROW` = `LEFT_BLOCK_SIZE(3) + CENTER_BLOCK_SIZE(12) + RIGHT_BLOCK_SIZE(3)` = 18, seat ids are `"{row}-{number}"`. The last row (`VIP_ROW`) is entirely VIP tier and never occupied (matching the reference, where the back row is shown fully available); every other row is regular tier with a fixed, deterministic set of occupied seats (`OCCUPIED_SEAT_IDS`, re-picked to fit the new 18-seat rows — still hand-picked/hardcoded, not random, per the "deterministic mock data" requirement carried over from Feature 6). `SEAT_PRICES = {regular: 50, vip: 150}` drives both the legend text and the total-price calculation.

## Seat coloring

`Seat` component now derives its fill from `status` first, `tier` second: occupied → gray regardless of tier; selected → gold regardless of tier; otherwise → the tier's color (blue for regular, purple for VIP). Both `colors.accentGold` and `colors.accentPurple` were already defined in the theme from Phase 0 but unused until now — this is a strong signal the original palette was chosen with exactly this tier system in mind.

## Header / schedule label

`SeatMapping`'s route params gained `scheduleLabel: string` (replacing nothing — it's additive). `ShowtimeSelectionScreen` now computes it at the moment "Select Seats" is pressed: `formatFullDate(selectedDateId)` (a new full "Month Day, Year" formatter, reusing the `Intl.DateTimeFormat` pattern already established for Movie Detail's release date) combined with the selected showtime's time and a shortened venue (`shortenVenue` strips the "Cinetech + " prefix down to just "Hall 1"/"Hall 2", matching the reference's shorter subtitle).

## Zoom and scroll indicator

Zoom: a `zoom` state (0.75–1.25, step 0.1) applied via `transform: [{scale}]` to the grid container. This is a real, known limitation: RN's `transform` is purely visual and doesn't affect the `ScrollView`'s measured content size, so scrolling to the very edges of a zoomed-in/out grid may not line up perfectly with the visual bounds. Implementing pixel-perfect zoom-aware scroll bounds would need dynamic width/height recalculation alongside the transform, which felt like disproportionate effort for a decorative control on a UI-only mock screen — documented here rather than silently shipped as if perfect.

Scroll indicator: a real computed progress bar (not a static decoration) — `onScroll` tracks `contentOffset`/`contentSize`/`layoutMeasurement` and renders a thumb sized to the viewport-to-content ratio, positioned by the actual scroll offset.

## Testing

`seatLayout.test.ts` and `SeatMappingScreen.test.tsx` were rewritten for the new model: row count/labels, unique ids in the new `{row}-{number}` format, VIP-row tier and never-occupied guarantee, regular-vs-VIP accessibility labels, select/deselect, occupied-seat rejection, mixed-tier total price calculation, chip-based deselection, Proceed-to-pay enable/disable and its action, back navigation, and zoom controls not throwing. `ShowtimeSelectionScreen`'s existing "navigates to Seat Mapping" test was loosened to check for the dynamic `scheduleLabel`'s content rather than an exact match, since it depends on "today's" date. Total suite: 120/120 passing.

## Trade-offs / known limitations

- Exact seat counts per block (3/12/3) and the specific occupied-seat pattern are reasonable approximations from the reference image, not pixel-measured values — I don't have Figma API/layer access in this environment, only the screenshots themselves.
- Zoom doesn't perfectly resize the scrollable bounds (see above).
- "Proceed to pay" behaves identically to the old "Continue" button (returns to the previous screen when enabled) — there is still no booking/payment API per the assessment's explicit constraints; only the label and layout changed to match the reference.
