import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {MovieDetailScreen} from '../../screens/MovieDetail';
import {MovieListScreen} from '../../screens/MovieList';
import {TrailerScreen} from '../../screens/Trailer';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MovieList" component={MovieListScreen} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="Trailer" component={TrailerScreen} />
    </Stack.Navigator>
  );
}
