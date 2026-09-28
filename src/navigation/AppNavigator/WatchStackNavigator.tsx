import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {MovieDetailScreen} from '../../screens/MovieDetail';
import {MovieListScreen} from '../../screens/MovieList';
import {MovieSearchScreen} from '../../screens/MovieSearch';
import {SeatMappingScreen} from '../../screens/SeatMapping';
import {ShowtimeSelectionScreen} from '../../screens/ShowtimeSelection';
import {TrailerScreen} from '../../screens/Trailer';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function WatchStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="MovieList" component={MovieListScreen} />
      <Stack.Screen name="MovieDetail" component={MovieDetailScreen} />
      <Stack.Screen name="Trailer" component={TrailerScreen} />
      <Stack.Screen name="MovieSearch" component={MovieSearchScreen} />
      <Stack.Screen name="ShowtimeSelection" component={ShowtimeSelectionScreen} />
      <Stack.Screen name="SeatMapping" component={SeatMappingScreen} />
    </Stack.Navigator>
  );
}
