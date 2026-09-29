# Follow-up: Custom SVG Icons for the Bottom Tab Bar

The user provided four SVG assets (from their Figma design) and asked for them to replace the Ionicons currently used in the bottom tab bar.

## Approach

Added `react-native-svg` (the standard, near-ubiquitous RN library for rendering vector graphics — no viable dependency-free way to render arbitrary SVG path data in React Native) and ported each of the four provided SVGs into a small, reusable component (`src/components/BottomTabBar/TabIcons.tsx`): `DashboardIcon`, `WatchIcon`, `MediaLibraryIcon`, `MoreIcon` — each taking `color` and `size` props.

**Why not use the exported files' baked-in colors as-is**: two of the four SVGs were exported gray (`#827D88`) and two white — almost certainly because whichever tab happened to be active/inactive in the specific Figma frame they were exported from. Baking those fixed colors in directly would mean losing the active/inactive visual distinction the tab bar already has (white icon when a tab is selected, gray otherwise). Instead, each icon component treats the SVG purely as *shape* data and accepts a `color` prop, so `BottomTabBar` recolors them exactly the way it already recolored the previous Ionicons — `colors.white` when active, `colors.textSecondary` when inactive. The "More" icon's source SVG had a fixed `opacity: 0.4` on its group; that was dropped so it renders at full opacity like the other three and stays visually consistent when active (a muted look baked into the icon would look wrong recolored to solid white).

## Icon-to-tab mapping

- Dashboard ← "Group 19625112.svg" (window/panel shape)
- Watch ← "Vector.svg" (play button — matches the tab's existing meaning)
- Media Library ← "Group 19625113.svg" (four-dot grid)
- More ← "List.svg" (list/menu rows)

The Watch↔play mapping is unambiguous. Dashboard vs. Media Library was a judgment call between two abstractly-similar "grid" icons with no naming to go on — easy to swap if wrong.

## Testing

No test changes were needed — `BottomTabBar`'s existing tests query by `accessibilityLabel`/`accessibilityState`, not by which icon renders, so they were unaffected by the icon swap. Confirmed `react-native-svg` needs no Jest mock (unlike `react-native-webview` in Feature 4, which did) — the existing test suite (121 tests) and the full `<App />` smoke test both pass without any test infrastructure changes.

## Trade-offs / known limitations

- iOS will need a `pod install` to link `react-native-svg`'s native module before it'll build on a device/simulator (Android autolinking needs no extra step). This project's CocoaPods setup couldn't be verified in this sandboxed environment (see Feature 3's planning note for the same pre-existing limitation) — same caveat applies to every native dependency added this session.
