# Feature 4: Trailer Experience

## Player/dependency decision — history and final answer

This went through three stages, worth recording because each one changed real code.

**Phase 0**: TMDb trailers are hosted on YouTube (`site: "YouTube"`, a `key`, not a direct media URL). `react-native-video` plays direct media sources (mp4/HLS/DASH) and cannot play a YouTube watch-page URL; scraping YouTube's real stream URL client-side would violate its Terms of Service, so that was never on the table. Asked to choose between `react-native-video` (accepting no real playback) and `react-native-youtube-iframe` (real playback, WebView-based), the decision was `react-native-video`.

**Feature 4 (first pass)**: built the full Trailer screen — loading, error, unavailable, autoplay, completion-navigation — on top of `react-native-video`, with the source URL set to the standard YouTube watch URL. As expected, this reliably fails via the player's own `onError` for real movies, since the native player still can't decode a YouTube page as media. This was implemented honestly (a "Couldn't play this trailer" state, not a fake success), and the trade-off was re-confirmed explicitly when raised a second time.

**Feature 4 fix (this change)**: the requirement for *actual* autoplay-with-completion-navigation meant the trade-off was no longer acceptable. Switched to `react-native-youtube-iframe` (a WebView-based wrapper around YouTube's official IFrame Player API) plus its peer dependency `react-native-webview`. `react-native-video` was removed — nothing else in the app used it.

**Why this dependency and not another**: `react-native-youtube-iframe` takes a YouTube video ID directly (`videoId` prop — exactly what `selectTrailerVideo` already produces, no URL-building needed), exposes a real `onChangeState` callback with an `'ended'` state for reliable completion detection, and is built on `react-native-webview`, which is the standard, actively-maintained (v14.x) WebView implementation for RN and supports the New Architecture. It ships its own TypeScript types. No native code of its own (verified: no `ios`/`android` folders, no podspec) — only its `react-native-webview` peer needs native linking. This is the smallest dependency that makes real playback possible without touching YouTube's terms of service.

## Trailer selection strategy (unchanged)

`selectTrailerVideo(videos)` (`src/services/tmdb/utils/selectTrailerVideo.ts`) — a pure, five-tier, fully testable function, untouched by this fix:

1. Official YouTube trailer
2. Any YouTube trailer
3. Official YouTube teaser
4. Any YouTube teaser
5. Any other YouTube video (last resort)
6. `null` if nothing on YouTube exists

Still shared between `movieDetail.ts`'s trailer-availability check and `movieTrailer.ts`'s playback selection, so Movie Detail and the Trailer screen can never disagree about whether a trailer exists.

## Data flow (unchanged)

`MovieDetailScreen` → `TrailerButton.onPress` → `navigation.navigate('Trailer', {movieId})` → `TrailerScreen` → `useTrailerVideo(movieId)` → `fetchMovieTrailerVideo(movieId)`. The now-unused `buildYoutubeWatchUrl` helper (built for the `react-native-video` source URL) was deleted along with its test, since `YoutubeIframe` takes the raw video key.

## Video playback approach (updated)

`<YoutubeIframe videoId={video.key} play height={height} width={width} onReady={...} onChangeState={...} onError={...} />`, sized to the full window via `useWindowDimensions()` (which also means it re-sizes correctly on rotation, for free). YouTube's own player controls render inside the iframe — no custom playback controls were built. A `LoadingState` overlay is shown on top of the (already-mounting) player until `onReady` fires, so the WebView's own load flash isn't visible to the user — this is "the video is preparing," distinct from "we're still fetching which video to play" (the earlier `status === 'loading'`).

## Autoplay & completion navigation (unchanged behavior, new trigger)

`play` prop set to `true` autoplays on mount. Completion is now detected via `onChangeState(state)` checking `state === PLAYER_STATES.ENDED` (a real signal from YouTube's player, not a guess). The same `hasNavigatedBackRef`-guarded `goToDetail` callback from the first pass is reused unchanged — fires at most once, and an unmount effect blocks any late callback from navigating after the screen is gone.

## Error handling (unchanged shape, real trigger now)

- API failure (videos request rejects): `ErrorState` with retry.
- No suitable trailer: `EmptyState` ("Trailer not available for this movie.").
- Playback failure (`onError`, now a real YouTube player error — e.g. embed disabled, video removed — rather than an inevitable "can't decode this URL" failure): `ErrorState` with `actionLabel="Back to Movie Details"`.

## Orientation (unchanged)

No orientation lock, no new dependency for it — `useWindowDimensions()` already makes the player and layout adapt to whichever orientation the device is in.

## Setup

No README changes: the project's existing generic "run `bundle exec pod install` after updating native dependencies" instructions already cover linking the new `react-native-webview` native module; nothing TMDb/trailer-specific needed adding. Verified locally that `tsc`/`eslint`/`jest` all pass; `pod install` itself couldn't be exercised in this environment (pre-existing local Ruby/bundler gem mismatch unrelated to this change — see Feature 3's planning note), so iOS native linking should be verified after a `bundle install` on a machine with the right gems.

## Trade-offs / known limitations

- `react-native-webview`'s native module isn't mockable via NetInfo/AsyncStorage-style official jest mocks (it ships none), so a manual mock was added at `__mocks__/react-native-webview.js` (Jest auto-applies this to any node_modules import of that package). `TrailerScreen`'s own test mocks `react-native-youtube-iframe` directly instead, for full control over triggering `onReady`/`onChangeState`/`onError`.
- Playback correctness (does it actually look/feel right on a real device, does autoplay reliably start without a tap on iOS) could not be verified in this environment — no simulator/device access here. Worth a manual check.
- No orientation lock/rotation on entering the Trailer screen (unchanged from the first pass).
