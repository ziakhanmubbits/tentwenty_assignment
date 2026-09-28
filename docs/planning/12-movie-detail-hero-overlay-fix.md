# Follow-up: Movie Detail Hero Layout Fix (Match Figma)

Comparing a screenshot of the running app against its Figma reference directly (both showing a movie detail screen) surfaced one clear structural difference: the release date, "Get Tickets", and "Watch Trailer" were rendered in the white content section *below* the backdrop image, while Figma places all three *inside* the dark hero area, stacked below the movie's logo.

## Fix

`MovieDetailScreen`'s hero is now a `justifyContent: 'space-between'` overlay over the backdrop image: the back button pinned to the top, and a bottom content group (logo/title fallback, release date, Get Tickets, Watch Trailer) anchored to the bottom of the image. The hero's height is no longer a fixed `340`— it's now sized by that content (the image is absolutely positioned to fill whatever height the overlay ends up needing), so it adapts to font scaling and longer titles instead of risking clipped content at a hardcoded height.

The release date text changed from `colors.textSecondary` (for the old white-background placement) to `colors.white` (needed now that it sits on the dark image, matching Figma).

Both "Get Tickets" and "Watch Trailer" grew slightly — `minHeight` 44→52, `paddingVertical` 8→16 — to match the visibly chunkier pill buttons in the reference.

## Testing

No test changes were needed — the existing `MovieDetailScreen` tests query by `accessibilityLabel`/text content, not screen position, so they were unaffected by moving these elements into the hero. All 120 tests still pass.

## Trade-offs

- Auto-height hero means the exact hero height now varies slightly by device/font-scale/title length rather than being fixed — this is a deliberate trade for correctness over a hardcoded number, but means the hero's proportions won't be pixel-identical to Figma on every device size.
