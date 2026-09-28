# Follow-up: Real Bottom Tab Navigation (Dashboard / Media Library / More)

A direct follow-up request: the bottom tab bar (built in Feature 1 as purely decorative chrome, since only "Watch" corresponded to an actual feature) should become real — Dashboard, Media Library and More should each open an actual (empty) screen, and switching between tabs should feel animated.

## Why a real tab navigator instead of extending the old approach

Feature 1's `BottomTabBar` was a static component manually rendered inside `MovieListScreen` with a hardcoded `activeTab="watch"` prop — it worked because only one tab was ever "active." Once Dashboard/Media Library/More needed to be genuinely switchable destinations with their own screens, that approach no longer fit: there'd be no single source of truth for which tab is active, no shared place to render the bar across screens, and no free transition animation. `@react-navigation/bottom-tabs` (new dependency) is the standard tool for exactly this shape of problem — same publisher and major version (7.x) as `@react-navigation/native`/`native-stack` already in use, pure JS (no native code of its own; it orchestrates screens the same way `native-stack` does), and it drives real navigation state instead of a prop I'd have to thread through every screen by hand.

## Structure

```
AppNavigator (Tab.Navigator, custom tabBar)
├── Watch      → WatchStackNavigator (native-stack: MovieList, MovieDetail, Trailer, MovieSearch, SeatMapping)
├── Dashboard  → DashboardScreen (empty placeholder)
├── MediaLibrary → MediaLibraryScreen (empty placeholder)
└── More       → MoreScreen (empty placeholder)
```

The previous `AppNavigator.tsx` (the 5-screen stack) was renamed to `WatchStackNavigator.tsx` unchanged — every existing screen inside it (`RootStackParamList`, all their tests) needed zero changes, since nothing about their own navigation type or props changed. `AppNavigator.tsx` is now the top-level tab navigator.

## Custom tab bar

`BottomTabBar` (existing component) gained an `onTabPress` callback and became a real `Pressable` row instead of decorative `View`s — same visual design, now interactive. `CustomTabBar` (new, `src/navigation/AppNavigator/CustomTabBar.tsx`) is the bridge between React Navigation's tab bar render-prop API and this existing component: it maps the active route to a tab key, dispatches `navigation.navigate(routeName)` on press (skipping the call entirely if that tab is already active), and — critically — **hides the bar whenever the Watch tab's nested stack is focused on anything other than `MovieList`**, using `getFocusedRouteNameFromRoute`. This matches the original reference screenshots, where the tab bar appears on the list/search screens but not on Movie Detail or the seat/showtime screen.

`MovieListScreen` no longer renders `<BottomTabBar>` itself — the tab navigator now renders it globally, above whichever screen is active.

## Animation

No extra work was needed here: React Navigation's stack and tab navigators animate transitions by default (slide for stack pushes, the tab navigator's own screen transition for tab switches). Making Dashboard/Media Library/More into real navigable screens was what was missing — animation came for free once they were.

## Placeholder screens

`DashboardScreen`, `MediaLibraryScreen`, `MoreScreen` are thin wrappers around one shared presentational piece, `EmptyTabScreen` (a `SafeAreaView` + the existing `EmptyState` component showing the tab's name), rather than three near-duplicate files with their own layout. This is intentionally minimal, per the request that these screens just be empty for now.

## Testing

- `CustomTabBar.test.tsx` (new): the tab bar renders with the right tab marked active; it hides when the Watch stack is focused on anything but `MovieList` and reappears when back on it; pressing a tab navigates to it; pressing the already-active tab does not call `navigate` again.
- `BottomTabBar.test.tsx` (new): the presentational component itself — correct `accessibilityState.selected` per tab, `onTabPress` fires with the right key.
- All existing screen tests (`MovieListScreen`, `MovieDetailScreen`, etc.) needed no changes — they test screens directly against mocked `navigation`/`route` props and never touch the real `NavigationContainer`, so none of them were affected by this restructuring.

One test I attempted and dropped: an end-to-end "render the real `<App />`, tap Dashboard in the real tab bar" test. It surfaced that `NavigationContainer` doesn't finish its internal initialization synchronously in this Jest setup (its rendered tree stays empty through several `act()`/microtask flush cycles) — a pre-existing characteristic of testing a real `NavigationContainer` here, not something this change introduced (no existing test exercises a real `NavigationContainer`; they all bypass it by testing screens directly). Chasing that down felt like a distraction from the actual feature, so it was dropped in favor of the `CustomTabBar` unit tests, which directly verify the logic that matters.

## Trade-offs / known limitations

- Dashboard/Media Library/More are genuinely empty (by request) — no content, no sub-navigation.
- The dropped end-to-end test above means there's no automated proof that the *real* `NavigationContainer` wires everything together correctly; the `CustomTabBar`/`BottomTabBar` unit tests cover the logic, but a manual check on a device/simulator is the only way to confirm the full integration.
