# Feature 2: Offline Movie Caching

## Cache format

A single versioned envelope stored under one AsyncStorage key (`@tentwenty/upcoming_movies_cache`):

```json
{
  "version": 1,
  "cachedAt": "2026-09-29T12:00:00.000Z",
  "movies": [ /* domain Movie[] */ ]
}
```

Serialization, deserialization, and shape validation live entirely inside `src/services/storage/upcomingMoviesCache.ts` — nothing outside that file touches AsyncStorage or the raw JSON shape. If the stored value is missing, fails to parse, or doesn't match the expected version/shape, `loadUpcomingMoviesCache()` returns `null` rather than throwing, and the rest of the app treats that identically to "no cache exists."

## Storage mechanism

`@react-native-async-storage/async-storage`, already installed in Phase 0. No new persistence dependency was added.

## TTL decision

**30 minutes** (`CACHE_TTL_MS` in `upcomingMoviesCache.ts`).

Upcoming-release data (titles, dates, artwork) changes on the order of hours to days, not minutes, so a 30-minute window is generous enough that a fresh cache basically never needs an "outdated" warning, while still being short enough that an offline user isn't told stale data is current. The TTL does **not** gate whether a network request is attempted — whenever the app is online, it always tries to fetch the latest data and overwrite the cache (stale-while-revalidate). The TTL only changes the offline banner's wording: within 30 minutes of `cachedAt`, the banner reads "You're offline. Showing saved movies."; past that, it adds "— they may be outdated." so a long-offline user isn't misled into thinking the list is current.

## Network detection

`@react-native-community/netinfo`, already installed in Phase 0. `NetInfo.fetch()` is checked once per load/retry cycle to decide whether to attempt the TMDb request at all (skipping a request we already know will fail). It is *not* treated as a guarantee — the actual `fetchUpcomingMovies()` call still has its own try/catch, since a device can report "connected" while the request itself fails (TMDb down, captive portal, DNS issues, etc.).

## Flow (`useUpcomingMovies`)

1. Read the cache first. If it exists, show it immediately (`status: 'success'`, `isOffline: true`) — no loading spinner flash when there's something useful to show. If it doesn't exist, fall back to `status: 'loading'`.
2. Check `NetInfo.fetch()`.
   - Not connected: stop here. If a cache was shown in step 1, that's the final state. If there was no cache, show the error state ("You're offline and no saved movies are available.").
   - Connected: attempt `fetchUpcomingMovies()`.
     - Success: replace the displayed movies with the fresh list, save it to cache, clear the offline flag (`isOffline: false`).
     - Failure: if a cache exists, fall back to it (`isOffline: true`); otherwise show the generic error state ("Couldn't load movies.").

This covers all five cases from the brief: fresh-fetch-with-existing-cache (update), fresh-fetch-no-cache (create), fetch-fails-with-cache (fall back, marked offline), fetch-fails-no-cache (error+retry), and corrupted cache (silently treated as no cache).

## Trade-offs / known limitations

- No pull-to-refresh or background re-check while a cached/offline view is being shown — the screen re-evaluates on next mount (e.g. navigating back to it). Adding a manual refresh affordance felt like UI scope beyond "the minimum necessary to communicate offline/cached state," so it was left out of this slice.
- Only the upcoming-movies list is cached (single cache key) — no per-page or per-query caching, consistent with "don't over-engineer a multi-level cache."
- The offline banner's copy is static English text, not localized (matches the rest of the app).
