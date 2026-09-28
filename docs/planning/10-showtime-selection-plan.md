# Follow-up: Date & Showtime Selection Screen ("ticket ka UI")

A concrete gap identified from the reference screenshots: Movie Detail's "Get Tickets" button was jumping straight to the seat grid (Feature 6), skipping the date/showtime picker step shown in the reference (date pills, showtime cards with a seat-availability preview, pricing, a "Select Seats" button). This adds that missing screen.

## Data

Same "UI-only, no backend" principle as Seat Mapping (Feature 6) — this is explicitly a booking-adjacent UI with no real backend per the assessment's constraints.

- `generateDateOptions(startDate, count)` (`src/screens/ShowtimeSelection/showtimeData.ts`) — a pure, testable function producing `count` consecutive dates starting from `startDate` (`{id, label}}`, e.g. "5 Mar"). The screen calls it with `new Date()` at mount; the function itself takes an explicit start date so it's deterministic and unit-testable without mocking the system clock.
- `MOCK_SHOWTIMES` — a small fixed array of `{id, time, venue, priceLabel}`, not derived from any API (there is no showtime data in TMDb or anywhere else in this app — it's inherently mock, same as Seat Mapping's occupied-seat set).

## UI

`ShowtimeCard` (`src/components/ShowtimeCard/`) — time + venue label above a bordered card containing a decorative "screen" indicator bar and a small dot grid (a stylized, simplified stand-in for the tiny seat-availability preview visible in the reference screenshot's showtime cards — I did not attempt to reproduce that thumbnail's exact dot pattern/colors, since it's a low-resolution decorative image I can't extract precise values from; this is a reasonable approximation using the existing color palette, not a literal seat map), then the price label below. Tapping a card selects it (blue border, `accessibilityState.selected`).

The screen itself: back button + centered movie title/release-date header (matching Movie Detail's data, passed through navigation rather than re-fetched), a horizontally-scrolling row of date pills, a horizontally-scrolling row of `ShowtimeCard`s, and a full-width "Select Seats" button. The first date and first showtime are selected by default (matching the reference, where a showtime is already shown as selected), so "Select Seats" is always immediately usable — no artificial disabled state was needed here, unlike Seat Mapping's Continue button (which starts genuinely empty and can only be enabled by an actual selection).

## Navigation

`MovieList → MovieDetail → ShowtimeSelection → SeatMapping`. `RootStackParamList` gained `ShowtimeSelection: {movieId, movieTitle, releaseDateLabel}`. Movie Detail's "Get Tickets" now targets `ShowtimeSelection` instead of `SeatMapping` directly; `ShowtimeSelection`'s "Select Seats" button forwards to the existing, unchanged `SeatMapping` screen with the same params it always took. Back navigation is unaffected — `SeatMapping`'s existing `goBack()` now naturally returns to `ShowtimeSelection` instead of `MovieDetail`, since it's a normal stack push, no code change needed there.

## Testing

Pure-function tests for `generateDateOptions` (correct count/labels, unique ids, month rollover). Screen tests: header content, default date/showtime selection, selecting a different date, selecting a different showtime, navigating to Seat Mapping with the right params, back navigation. Updated `MovieDetailScreen`'s existing Get Tickets test to expect the new destination/params. Total suite: 115/115 passing.

## Trade-offs / known limitations

- The showtime cards' seat-preview thumbnail is a stylized approximation, not a reproduction of the reference's exact dot pattern (see above).
- Dates are generated from "today" at render time, not a fixed reference date — reasonable for a UI-only mock, but means the exact dates shown will differ depending on when the app is opened (the reference screenshot's specific dates, e.g. "5 Mar", were never going to be meaningfully reproducible anyway, since they're relative to whenever the design was made).
- Selecting a date doesn't currently change which showtimes are shown (there's only one fixed showtime list regardless of date) — there's no data source that would make per-date showtimes meaningful here, and the reference didn't clearly imply they should differ.
