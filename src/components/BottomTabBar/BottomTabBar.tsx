import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing} from '../../theme';

const TABS = [
  {key: 'dashboard', label: 'Dashboard', icon: 'grid-outline'},
  {key: 'watch', label: 'Watch', icon: 'play-circle-outline'},
  {key: 'library', label: 'Media Library', icon: 'library-outline'},
  {key: 'more', label: 'More', icon: 'menu-outline'},
] as const;

interface BottomTabBarProps {
  activeTab: (typeof TABS)[number]['key'];
}

export function BottomTabBar({activeTab}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingBottom: insets.bottom || spacing.sm}]}>
      {TABS.map(tab => {
        const isActive = tab.key === activeTab;
        return (
          <View key={tab.key} style={styles.tab}>
            <Ionicons
              name={tab.icon}
              size={24}
              color={isActive ? colors.white : colors.textSecondary}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </View>
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
