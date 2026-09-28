import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing} from '../../theme';

const TABS = [
  {key: 'dashboard', label: 'Dashboard', icon: 'grid-outline'},
  {key: 'watch', label: 'Watch', icon: 'play-circle-outline'},
  {key: 'library', label: 'Media Library', icon: 'library-outline'},
  {key: 'more', label: 'More', icon: 'menu-outline'},
] as const;

export type BottomTabKey = (typeof TABS)[number]['key'];

interface BottomTabBarProps {
  activeTab: BottomTabKey;
  onTabPress: (tab: BottomTabKey) => void;
}

export function BottomTabBar({activeTab, onTabPress}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom || spacing.sm}]}>
      {TABS.map(tab => {
        const isActive = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{selected: isActive}}
            style={styles.tab}>
            <Ionicons
              name={tab.icon}
              size={24}
              color={isActive ? colors.white : colors.textSecondary}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.textPrimary,
    paddingTop: spacing.sm,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.white,
    fontWeight: '600',
  },
});
