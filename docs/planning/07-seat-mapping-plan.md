# Feature 6: Seat Mapping UI

## Reference used

No new screenshot was attached for this feature. The only seat-related visual across the six original reference screenshots is a small, non-interactive seat-availability *preview thumbnail* embedded in each showtime card on the date/showtime picker screen — a curved line suggesting a screen, and a dense dot grid in a few colors. That screen (date selection, showtime cards, pricing) is not what this feature's own spec describes; the spec asks specifically for a seat grid, selection/deselection, an occupied state, and a selection summary — so I built exactly that, reconstructing only the general visual vocabulary (a "screen" indicator above the grid, a color legend) from the tiny preview rather than treating it as a pixel-accurate reference. I did not build the date/showtime picker screen — it isn't mentioned anywhere in this feature's requirements.

## Seat data model

`src/types/seat.ts`: `Seat = {id, row, number, status}`, `SeatStatus = 'available' | 'selected' | 'occupied'` — exactly the three statuses the brief asked for, since nothing in the (limited) visual reference clearly demanded a fourth (e.g. a "reserved"/"VIP" tier) and the brief explicitly said only add one if the screenshot genuinely requires it.

`src/screens/SeatMapping/seatLayout.ts`: `createInitialSeatLayout()` generates a deterministic 8-row (A–H) × 10-seat grid, with a fixed, hardcoded `Set` of occupied seat ids (`OCCUPIED_SEAT_IDS`) — not randomized, so the same seats are occupied on every screen visit/app run, as required ("deterministic local/mock seat data"). This is pure and unit-tested directly (shape, uniqueness, occupied/available assignment, determinism across calls).

## Interaction behavior

Selection state lives in the screen itself (`useState(createInitialSeatLayout)` + a `toggleSeat` updater), not a separate hook or global store — there's no async/API work involved, so a dedicated hook would have been an unnecessary layer for what's a single `setState` call. `toggleSeat` maps over the grid, flips the single matching seat between `available`/`selected`, and explicitly no-ops on any seat whose status is `occupied` — this guard lives in the state-update logic itself, not just in the UI's `disabled` prop, so pressing an occupied seat cannot mutate state through any path. Selected seats for the summary are derived via `useMemo(() => seatLayout.flat().filter(...))`, not tracked as separate duplicate state.

## Occupied-seat behavior

Rendered with a filled `colors.border` background and `disabled` on the underlying `Pressable`; `Seat`'s own `onPress` handler additionally checks `status !== 'occupied'` before calling the parent's `toggleSeat`, so the "cannot be selected" guarantee holds even when a test (or any other code) calls `onPress` directly rather than through a real touch event.

## Selected-seat summary

A bottom bar showing either "No seats selected" or "`N` Seat(s): `A1, B2, ...`", plus a "Continue" button. No pricing or booking logic was added — nothing in this feature's data model includes a price, and inventing one wasn't asked for. "Continue" is disabled (and visually muted) with zero seats selected; with at least one selected, it calls `navigation.goBack()` — returning to Movie Detail. This was the safest interpretation of "if navigation is needed, navigate only to an appropriate existing/local screen without pretending a booking was completed": there's no booking-confirmation screen to send the user to, and there shouldn't be one, so "done selecting, return" is the only honest action.

## Responsive layout

The seat grid sits inside a horizontal `ScrollView`, so it never gets forced into unusably small seats on a narrow device — it simply scrolls if the 10-column grid doesn't fit. No fixed device widths are used anywhere; the screen adapts to whatever width is available in both orientations.

## Accessibility

Every `Seat` carries `accessibilityRole="button"`, `accessibilityLabel="Seat {id}, {status}"` (e.g. "Seat A5, available", "Seat B4, occupied"), and `accessibilityState={{disabled, selected}}` — so a screen reader user gets the seat's identity and status without relying on color. The legend row (colored swatch + text label for each status) is a visual supplement for sighted users, not the only way status is communicated.

## Touch target trade-off

Seats are rendered at 32×32px with a `hitSlop={4}` rather than the platform's usual 44×44px minimum. At 10 seats per row, 44px seats would force horizontal scrolling on virtually every phone for every single row, which felt like a worse trade than a slightly smaller (but still comfortably tappable, with the hit-slop) target. This is a deliberate, documented compromise, not an oversight.

## Navigation

Movie Detail's "Get Tickets" button (inert since Feature 3) now navigates to `SeatMapping` with `{movieId, movieTitle}` — the title is passed alongside the id purely so the Seat Mapping header can show it without an otherwise-unnecessary re-fetch of movie detail data just for a label. Back (both the explicit back button and "Continue") returns to Movie Detail via `goBack()`; the navigation stack is never reset.

## Testing approach

Pure-function tests for `createInitialSeatLayout` (shape, ids, occupied/available assignment, determinism) plus screen-level interaction tests covering: rendering, correct accessibility labels for available/occupied seats, select → deselect, occupied seat rejecting a press, multi-seat selection updating the summary text, Continue's disabled/enabled state, Continue and the back button both returning to Movie Detail — plus one new test on `MovieDetailScreen` confirming Get Tickets navigates with the right params. Total suite: 93/93 passing.

## Trade-offs / known limitations

- No date/showtime selection screen (not requested by this feature; see "Reference used" above).
- No pricing, seat categories/tiers, or "VIP" styling — the data model only has the three statuses this feature's own spec asked for.
- 32px touch targets are smaller than the 44px platform guideline (see above) — a deliberate density/usability trade-off for a 10-column grid.
