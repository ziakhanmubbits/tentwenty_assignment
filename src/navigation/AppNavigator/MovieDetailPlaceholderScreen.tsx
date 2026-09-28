import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../../theme';
import type {RootStackParamList} from './types';

type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

export function MovieDetailPlaceholderScreen({route}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Movie Detail coming soon (id: {route.params.movieId})</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  text: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
