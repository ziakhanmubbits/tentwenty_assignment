import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {isCacheStale} from '../../services/storage';
import {colors, spacing} from '../../theme';

interface OfflineBannerProps {
  cachedAt: string;
}

export function OfflineBanner({cachedAt}: OfflineBannerProps) {
  const message = isCacheStale(cachedAt)
    ? "You're offline. Showing saved movies — they may be outdated."
    : "You're offline. Showing saved movies.";

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.accentGold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
