import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import React from 'react';
import {DashboardScreen} from '../../screens/Dashboard';
import {MediaLibraryScreen} from '../../screens/MediaLibrary';
import {MoreScreen} from '../../screens/More';
import {CustomTabBar} from './CustomTabBar';
import type {RootTabParamList} from './types';
import {WatchStackNavigator} from './WatchStackNavigator';

const Tab = createBottomTabNavigator<RootTabParamList>();

function renderTabBar(props: BottomTabBarProps) {
  return <CustomTabBar {...props} />;
}

export function AppNavigator() {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}} tabBar={renderTabBar}>
      <Tab.Screen name="Watch" component={WatchStackNavigator} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="MediaLibrary" component={MediaLibraryScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}
