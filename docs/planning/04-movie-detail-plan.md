# Feature 3: Movie Detail

## Detail data flow

Screen (`MovieDetailScreen`) → `useMovieDetail(movieId)` → `fetchMovieDetail(movieId)` (`src/services/tmdb/endpoints/movieDetail.ts`) → TMDb. Same shape as Feature 1's list: raw TMDb response types stay inside `services/tmdb/types`, the service maps to the domain `MovieDetail` type (`src/types/movie.ts`, `Movie & {runtime, genres, logoUrl, trailerVideoKey}`), and the screen only ever sees the mapped domain object.

## API endpoints used

- `GET /movie/{id}` — required. If this fails, the whole screen shows the error state with retry.
- `GET /movie/{id}/videos` — optional enrichment, used to pick a trailer's YouTube key.
- `GET /movie/{id}/images` — optional enrichment, used to pick a logo image.

All three are requested together via `Promise.all`, but the videos and images calls are individually `.catch(() => null)`'d before being awaited — so a failure in either degrades to "not available" without rejecting the whole `fetchMovieDetail` call or triggering the hard error state. Trailer selection prefers a YouTube video with `type: 'Trailer'` marked `official: true`, falling back to the first YouTube trailer, then `null` if none exists. Logo selection prefers an English (`iso_639_1: 'en'`) logo, then a language-neutral one, then the first available, then `null`.

## Required vs optional data

Required (hard error if missing): core detail fields from `/movie/{id}` — title, overview, release date, genres, images.
Optional (soft-degrade): trailer key and logo image. Missing genres/overview render as an omitted section rather than empty headings; a missing backdrop falls back to the poster, then to a plain color block.

## Image strategy

Backdrop uses `w1280` (this is now the dominant hero element, unlike the list's smaller cards, so a higher size than Feature 1's `w780` is justified — still well short of `original`). Logo uses `w500`. The `tmdbImageUrl(path, size)` helper (`src/services/tmdb/client/tmdbImage.ts`) was extracted from Feature 1's inline template-string logic so both `upcomingMovies.ts` and `movieDetail.ts` share one implementation instead of duplicating the base CDN URL — a mechanical, behavior-preserving refactor of the one file Feature 1 touched.

## Missing-field handling

- No backdrop → falls back to poster, then to a solid color block.
- No logo → falls back to plain title text over the hero image.
- No genres → the Genres section is omitted entirely.
- No overview → the Overview section is omitted entirely.
- No release date / unparseable date → the "In Theaters ..." line is omitted.
- No trailer → `TrailerButton` renders in a disabled "Trailer unavailable" state.

None of these are treated as errors — the detail fetch succeeding is what gates the error state, not the completeness of its optional fields.

## Trailer availability (this feature only)

`movie.trailerVideoKey` is computed and available on the domain object, and `TrailerButton` reflects whether a trailer exists. Per the brief, actual playback is out of scope here: the button is rendered but inert (no `onPress` wired) when a trailer is available, so the next Trailer feature only needs to add a route/screen and wire the existing button's `onPress` — no new data plumbing required.

## Responsive layout

Portrait: hero image fixed at 340px height, full width, scrollable content below.
Landscape (`useWindowDimensions`, `width > height`): the container switches to `flexDirection: 'row'` — hero becomes a fixed 42%-width left column at full height, content scrolls independently in the remaining right column. This wasn't shown in the reference screenshot (portrait only), so it's a reasonable side-by-side adaptation rather than a screenshot-matched design.

## Other decisions

- "Get Tickets" renders per the screenshot but is inert — there's no ticket/booking feature in this assessment's scope, and Seat Mapping (the screen it would plausibly lead to) isn't built yet.
- `runtime` and `voteAverage` are fetched into the domain model (per the assessment's field list) but not rendered — neither appeared in the reference screenshot, and adding UI for them wasn't requested. Easy to surface later if needed.
- The custom back button ("< Watch", matching the reference) is shown in all three states (loading/error/success), not just success — otherwise a failed detail fetch would leave the user with no visible way back besides an OS-level gesture.
- The `MovieDetailPlaceholderScreen` from Feature 1 is deleted; `AppNavigator` now registers the real `MovieDetailScreen`.

## Trade-offs / known limitations

- Backdrop-header visual (image fading into the content section) uses a hard edge rather than a gradient mask, to avoid adding a gradient/masked-view dependency for one cosmetic effect — consistent with the flat-scrim approach already used for `MovieCard` in Feature 1.
- No detail-level caching (Feature 2's offline cache is Upcoming-Movies-specific by design, per this feature's explicit instruction not to expand it).
