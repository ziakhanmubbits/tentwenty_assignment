import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, spacing} from '../../theme';
import type {Showtime} from '../../types/showtime';

interface ShowtimeCardProps {
  showtime: Showtime;
  isSelected: boolean;
  onPress: (showtimeId: string) => void;
}

const PREVIEW_ROWS = 5;
const PREVIEW_COLS = 8;
const HIGHLIGHT_CELLS = new Set(['2-3', '2-4']);

function ShowtimeCardComponent({showtime, isSelected, onPress}: ShowtimeCardProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.timeRow}>
        <Text style={styles.time}>{showtime.time}</Text>
        <Text style={styles.venue}>{showtime.venue}</Text>
      </View>
      <Pressable
        onPress={() => onPress(showtime.id)}
        accessibilityRole="button"
        accessibilityLabel={`Showtime ${showtime.time} at ${showtime.venue}`}
        accessibilityState={{selected: isSelected}}
        style={[styles.card, isSelected && styles.cardSelected]}>
        <View style={styles.screenIndicator} />
        <View style={styles.previewGrid}>
          {Array.from({length: PREVIEW_ROWS}).map((__, row) => (
            <View key={row} style={styles.previewRow}>
              {Array.from({length: PREVIEW_COLS}).map((_, col) => (
                <View
                  key={col}
                  style={[
                    styles.previewDot,
                    HIGHLIGHT_CELLS.has(`${row}-${col}`) && styles.previewDotHighlight,
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </Pressable>
      <Text style={styles.price}>{showtime.priceLabel}</Text>
    </View>
  );
}

export const ShowtimeCard = React.memo(ShowtimeCardComponent);

const styles = StyleSheet.create({
  wrapper: {
    width: 220,
    gap: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  time: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  venue: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.sm,
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  screenIndicator: {
    width: '60%',
    height: 4,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  previewGrid: {
    gap: 3,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 3,
  },
  previewDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  previewDotHighlight: {
    backgroundColor: colors.accentPurple,
  },
  price: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
