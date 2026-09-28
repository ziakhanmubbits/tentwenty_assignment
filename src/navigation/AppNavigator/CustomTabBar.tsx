import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import React from 'react';
import {BottomTabBar} from '../../components/BottomTabBar';
import type {BottomTabKey} from '../../components/BottomTabBar';
import type {RootTabParamList} from './types';

const ROUTE_TO_TAB_KEY: Record<keyof RootTabParamList, BottomTabKey> = {
  Watch: 'watch',
  Dashboard: 'dashboard',
  MediaLibrary: 'library',
  More: 'more',
};

const TAB_KEY_TO_ROUTE: Record<BottomTabKey, keyof RootTabParamList> = {
  watch: 'Watch',
  dashboard: 'Dashboard',
  library: 'MediaLibrary',
  more: 'More',
};

export function CustomTabBar({state, navigation}: BottomTabBarProps) {
  const activeRoute = state.routes[state.index];
  const activeRouteName = activeRoute.name as keyof RootTabParamList;

  if (activeRouteName === 'Watch') {
    const focusedRouteName = getFocusedRouteNameFromRoute(activeRoute) ?? 'MovieList';
    if (focusedRouteName !== 'MovieList') {
      return null;
    }
  }

  return (
    <BottomTabBar
      activeTab={ROUTE_TO_TAB_KEY[activeRouteName]}
      onTabPress={tabKey => {
        const routeName = TAB_KEY_TO_ROUTE[tabKey];
        if (routeName !== activeRouteName) {
          navigation.navigate(routeName);
        }
      }}
    />
  );
}
