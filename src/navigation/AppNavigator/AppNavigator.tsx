import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {MovieListScreen} from '../../screens/MovieList';
import {MovieDetailPlaceholderScreen} from './MovieDetailPlaceholderScreen';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MovieList" component={MovieListScreen} />
      <Stack.Screen name="MovieDetail" component={MovieDetailPlaceholderScreen} />
    </Stack.Navigator>
  );
}
