import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, spacing} from '../../theme';

interface HeaderProps {
  title: string;
  onSearchPress?: () => void;
}

export function Header({title, onSearchPress}: HeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Pressable
        onPress={onSearchPress}
        accessibilityRole="button"
        accessibilityLabel="Search"
        hitSlop={8}
        style={styles.searchButton}>
        <Ionicons name="search-outline" size={24} color={colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  searchButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
