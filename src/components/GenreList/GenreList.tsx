import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, spacing} from '../../theme';

interface GenreListProps {
  genres: string[];
}

const PILL_COLORS = [
  colors.accentTeal,
  colors.accentPink,
  colors.accentPurple,
  colors.accentGold,
];

export function GenreList({genres}: GenreListProps) {
  if (genres.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {genres.map((genre, index) => (
        <View
          key={genre}
          style={[
            styles.pill,
            {backgroundColor: PILL_COLORS[index % PILL_COLORS.length]},
          ]}>
          <Text style={styles.text}>{genre}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  text: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
});
