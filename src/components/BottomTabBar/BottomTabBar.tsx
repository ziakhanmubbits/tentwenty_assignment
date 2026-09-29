import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing} from '../../theme';
import {DashboardIcon, MediaLibraryIcon, MoreIcon, WatchIcon} from './TabIcons';

const TABS = [
  {key: 'dashboard', label: 'Dashboard', Icon: MediaLibraryIcon, size: 28},
  {key: 'watch', label: 'Watch', Icon: WatchIcon, size: 26},
  {key: 'library', label: 'Media Library', Icon: DashboardIcon, size: 26},
  {key: 'more', label: 'More', Icon: MoreIcon, size: 26},
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
        const iconColor = isActive ? colors.white : colors.textSecondary;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            accessibilityState={{selected: isActive}}
            style={styles.tab}>
            <View style={styles.iconSlot}>
              <tab.Icon color={iconColor} size={tab.size} />
            </View>
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
  iconSlot: {
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
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
