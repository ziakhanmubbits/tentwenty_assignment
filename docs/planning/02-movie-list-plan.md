# Feature 1: Upcoming Movies List

## API / service approach

`GET /movie/upcoming` is called through a thin `tmdbGet<T>` helper (`src/services/tmdb/client/tmdbClient.ts`) that owns the base URL and API key query param. `src/services/tmdb/endpoints/upcomingMovies.ts` calls it and maps the raw `TMDbMovie[]` response into the app's domain `Movie` type before returning — the raw TMDb shape never leaves the `services/tmdb` layer. The API key comes from `@env` (`react-native-dotenv`, decided in Phase 0).

## List approach

`FlatList` with `keyExtractor` on movie id, a `useCallback`-stabilized `renderItem`, and `MovieCard` wrapped in `React.memo`. Both memoizations are used because they're passed as props into the virtualized list (stable `renderItem`) and re-rendered per row (`MovieCard`), which is the case `FlatList` performance guidance calls out — not applied elsewhere.

## UI / component approach

Cards use `backdrop_path` (16:9 image) with a semi-transparent dark scrim and the title overlaid bottom-left, matching the screenshot's proportions — the list screen shows no release date or rating, so none is rendered on the card (`Movie` still carries `releaseDate`/`voteAverage` for the detail screen to use later). The header ("Watch" + search icon) and bottom tab bar are built as small presentational components (`Header`, `BottomTabBar`). The bottom tab bar is **visual chrome only**: only "Watch" is active/highlighted, the other three tabs (Dashboard, Media Library, More) render but do nothing, since those screens aren't part of this assessment's feature set.

Icons use `@react-native-vector-icons/ionicons` (the maintained scoped package — the classic `react-native-vector-icons` is now deprecated upstream).

## Loading / error / empty strategy

`useUpcomingMovies` hook owns a single `status: 'loading' | 'success' | 'empty' | 'error'` state machine plus a `retry()` function, so `MovieListScreen` just switches on `status`. Errors are surfaced as the fixed message "Couldn't load movies." with a "Try again" button — the raw fetch error is never shown to the user.

## Navigation

`AppNavigator` is a native-stack navigator with two routes: `MovieList` (real) and `MovieDetail` (a deliberately minimal placeholder screen, `MovieDetailPlaceholderScreen`, that only echoes the selected movie id). This exists so tapping a card has somewhere real to navigate to without building actual Detail UI ahead of schedule; it will be replaced wholesale when the Movie Detail feature is implemented.

## Trade-offs / known limitations

- No pagination — only the first page of `/movie/upcoming` is fetched. Not required by this slice.
- No offline caching yet (explicitly out of scope for this feature).
- The search icon in the header renders but isn't wired to navigation (Search is a separate feature).
- iOS CocoaPods aren't linked in this environment (`bundle install` fails locally — missing gems, a machine/environment issue, not a code issue); Android autolinking is unaffected. Needs `bundle install && cd ios && bundle exec pod install` before an iOS build will pick up the newly added native modules (navigation, async-storage, netinfo, react-native-video, vector-icons).
