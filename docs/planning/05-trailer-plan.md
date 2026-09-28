# Feature 4: Trailer Experience

## Player/dependency decision (read this first)

This revisits a decision made back in Phase 0. TMDb trailers are hosted on YouTube (`site: "YouTube"`, a `key`, not a direct media URL). `react-native-video` plays direct media sources (mp4/HLS/DASH); it cannot play a YouTube watch-page URL, and scraping YouTube's real stream URL client-side would violate YouTube's Terms of Service, so that was never on the table.

When this feature's instructions reopened the question ("if a genuinely necessary dependency is required, explain why before adding it"), I re-asked explicitly: add `react-native-youtube-iframe` now (the only way trailers actually play for real movies), or keep `react-native-video` only, as originally decided. The answer was to **keep `react-native-video` only**.

**Consequence, stated plainly**: the Trailer screen is fully built — loading, error, unavailable, autoplay wiring, completion-navigation, playback-error handling — but because `trailerVideoKey` is a YouTube key and `react-native-video` cannot play it, attempting real playback will reliably fail via the player's own `onError` callback for virtually every real movie. This is handled honestly (a "Couldn't play this trailer" state with a way back), not faked. The architecture, autoplay logic, and completion-navigation are all real and covered by tests with a mocked player; end-to-end playback of an actual trailer is not achievable with the current dependency choice.

## Trailer selection strategy

`selectTrailerVideo(videos)` (`src/services/tmdb/utils/selectTrailerVideo.ts`) — a pure, five-tier, fully testable function:

1. Official YouTube trailer
2. Any YouTube trailer
3. Official YouTube teaser
4. Any YouTube teaser
5. Any other YouTube video (last resort)
6. `null` if nothing on YouTube exists

This replaces Feature 3's narrower two-tier logic (official trailer → first trailer) and is now shared: `movieDetail.ts`'s trailer-availability check (for `TrailerButton`'s enabled/disabled state) and the new `movieTrailer.ts` endpoint (for actual playback selection) both call the same function, so Movie Detail and the Trailer screen can never disagree about whether a trailer exists.

## Data flow

`MovieDetailScreen` → `TrailerButton.onPress` → `navigation.navigate('Trailer', {movieId})` (only the id crosses the navigation boundary, per instruction) → `TrailerScreen` → `useTrailerVideo(movieId)` → `fetchMovieTrailerVideo(movieId)` (`src/services/tmdb/endpoints/movieTrailer.ts`, a focused single-endpoint call to `/movie/{id}/videos` — it does not re-fetch the full detail/images payload the Detail screen already has, since Trailer only needs the video list).

## Video playback approach

`react-native-video`'s `<Video source={{uri}} controls paused={false} onEnd={...} onError={...} />`, full-bleed on a dark background. The source URI is the standard YouTube watch URL (`https://www.youtube.com/watch?v={key}`, via `buildYoutubeWatchUrl`) — the most honest representation of "the video TMDb pointed us to," not a pretense that it's a playable direct URL. When the native player can't decode it, `onError` fires and the screen shows a friendly "Couldn't play this trailer." message with a "Back to Movie Details" action, instead of crashing or showing a raw error.

## Autoplay & completion navigation

`paused={false}` starts playback immediately on mount (autoplay). `onEnd` calls a `goToDetail` callback that navigates back via `navigation.goBack()`. A `hasNavigatedBackRef` guard ensures this fires at most once even if `onEnd` (or a user tap on the close button) fires more than once, and an unmount effect also sets that ref so no late-arriving callback can navigate after the screen is gone.

## Error handling

- API failure (videos request rejects): reuses `ErrorState` with retry.
- No suitable trailer (`selectTrailerVideo` returns `null`): reuses `EmptyState` ("Trailer not available for this movie."), with the same persistent close button as every other state.
- Playback failure (`onError`): `ErrorState` reused with a new optional `actionLabel` prop (default unchanged: `"Try again"`) set to `"Back to Movie Details"` here — labeling it "Try again" would have been misleading since retrying doesn't change anything about an inherently-unplayable YouTube source.

## Orientation

No orientation lock, and no new dependency for it. The screen's layout (full-bleed video/state content + an absolutely-positioned close button anchored to the safe-area inset) already adapts naturally to either orientation; forcing landscape would need a native orientation-lock library the project doesn't have, and given the player will rarely actually show a played video anyway (see above), that complexity wasn't justified for this slice.

## Other decisions

- `StatusBar hidden` while this screen is mounted, for a genuinely full-screen feel (native RN component, no dependency).
- Loading/error/unavailable states reuse `LoadingState`/`ErrorState`/`EmptyState` as-is on the screen's dark background, per "reuse existing architecture" — their text colors weren't tuned for a dark backdrop, which is a minor, accepted visual trade-off rather than a reason to fork new components.

## Trade-offs / known limitations

- Real trailer playback does not work end-to-end (see the dependency decision above) — this is a deliberate, explicitly-confirmed limitation, not a bug.
- No orientation lock/rotation on entering the Trailer screen.
