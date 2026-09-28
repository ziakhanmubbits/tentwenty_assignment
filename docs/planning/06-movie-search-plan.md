# Feature 5: Movie Search

## UI interpretation and deliberate simplifications

The reference screenshots show what looks like two visual states of a search flow: a search bar with a genre-photo browse grid when empty, a "Top Results" live preview while typing, and a separate "N Results Found" page (plain header, no visible search input) reached after submitting. I implemented this as **one continuous screen** rather than two navigator routes or a two-mode state machine — the search bar stays visible at all times, and the body below it switches between prompt / loading / results / empty / error based on the current query and request status. This was a judgment call to avoid an ambiguous two-stage transition I couldn't verify pixel-for-pixel; the search bar never disappearing is arguably more usable (the user can keep refining their query while looking at results) and satisfies every functional requirement (debounce, freshness, states) without inventing an interaction model I wasn't certain about.

Two other deliberate departures from the screenshots, both because they'd otherwise require fabricating data:

- The empty-query state shows a plain "Search for movies by title." prompt instead of the genre-photo grid (Comedies, Crime, Family, etc. with movie-still backgrounds) — there's no TMDb endpoint in this assessment's scope that provides curated images per genre, so replicating that grid would mean inventing genre-to-image pairings.
- Each result row shows a genre label ("Action", "Sci-Fi") under the title, matching the screenshots. `/search/movie` only returns `genre_ids` (numbers), not names, so this required one additional call to `/genre/movie/list` (fetched once, cached in memory for the session — genres essentially never change) to resolve ids to names. This is a small, targeted addition beyond the literal "use `/search/movie`" instruction, made to avoid either showing raw numeric ids or omitting a detail the screenshot clearly includes.
- Each row's "..." icon renders (matches the screenshot) but is inert — no action is defined for it anywhere in this assessment's scope, consistent with how similarly-decorative elements (Get Tickets, the non-Watch tab bar items) were handled in earlier features.

## Search API approach

`GET /search/movie` via the existing `tmdbGet` client (`src/services/tmdb/endpoints/searchMovies.ts`). The client itself gained one small extension: `tmdbGet` now accepts an optional `AbortSignal` third parameter, threaded straight into the underlying `fetch` call — needed for real request cancellation, not a rewrite of anything existing. Raw TMDb shapes (`TMDbSearchMovie`, `TMDbGenre`) stay inside `services/tmdb/types`; the screen only ever sees the mapped `MovieSearchResult` domain type (`Movie & {genreLabel: string | null}`).

## Debounce strategy

400ms, implemented with a plain `setTimeout` inside a `useEffect` keyed on the query — no debounce library added. Each keystroke's effect cleanup clears the previous timer before scheduling a new one, so rapid typing collapses into a single request once the user pauses (verified by a test that types "b" → "ba" → "bat" and asserts exactly one call, for "bat").

## Latest-request-wins strategy (the critical requirement)

Three mechanisms working together in `useMovieSearch` (`src/hooks/useMovieSearch.ts`):

1. **Debounce** (above) — reduces how often a request is even attempted.
2. **Request identity** — a `useRef` sequence counter incremented every time the query changes. Each in-flight request closes over the id it was issued with; its `.then()`/`.catch()` handlers check `latestRequestIdRef.current !== requestId` and silently discard the response (success *or* error) if a newer query has since taken over. This is the mechanism that actually guarantees correctness — it doesn't depend on cancellation succeeding.
3. **AbortController** — each request gets its own controller; starting a new query aborts whatever was previously in flight, and an `AbortError` is treated as a silent no-op rather than a user-facing error. This is a courtesy (saves bandwidth, lets the server drop the wasted work) layered on top of the request-id guard, not a substitute for it.

This combination directly satisfies "only the response belonging to the latest active query may update the UI," and was chosen over abort-only or id-only because either alone has a gap: abort-only breaks if the underlying transport doesn't honor cancellation reliably (untestable in Jest with a mocked service anyway), and id-only alone still wastes a real network request. Together, the guarantee holds regardless of resolution order — verified by two tests: an older request resolving *after* a newer one (its results must not appear), and an older request *failing* after a newer one *succeeded* (the failure must not replace the success).

## Search states

`idle` (no query — has never searched) → `loading` (debounce fired, request in flight) → `success` (results found, shown with a "N Results Found" heading) / `empty` (`0` results, shown as "No movies found for \"{query}\"") / `error` ("Couldn't search movies." with retry). Whitespace-only queries are trimmed and treated as empty (no request).

## Offline behavior

No new offline architecture — Feature 2's cache stays Upcoming-Movies-specific, per instruction. Search has no cache of its own: offline or failed requests surface through the existing `error` status with a retry action ("Couldn't search movies."), which is honest about needing a network request rather than pretending stale/cached data is a fresh search result.

## Navigation

`MovieList`'s header search icon (inert since Feature 1) now navigates to `MovieSearch` (a new, argument-less route). Tapping a result navigates to the existing `MovieDetail` route with only `{movieId}`, reusing that screen entirely rather than duplicating its logic. The screen's own back button pops back to `MovieList`.

## Testing approach

Unit tests for the pure mapping/caching logic (`searchMovies.test.ts`, `genres.test.ts` — genre resolution, missing-data safety, in-memory cache reuse, soft-fail when the genre list request fails). Screen-level integration tests (`MovieSearchScreen.test.tsx`) using `jest.useFakeTimers()` to control the debounce deterministically and hand-rolled deferred promises to control exactly when each mocked `searchMovies` call resolves — this is what makes the two freshness tests (out-of-order resolution, and error-after-success) actually exercise real race conditions rather than just asserting on code structure.

## Trade-offs / known limitations

- No pagination — only the first page of `/search/movie` results is shown, consistent with "don't add pagination unless needed."
- The search bar never disappears into the "results found" plain-header treatment shown in one of the reference screenshots (see the UI interpretation note above).
- The genre-photo browse grid from the reference screenshots isn't implemented (see above) — replaced with a text prompt.
