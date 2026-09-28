import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BottomTabBar} from '../../components/BottomTabBar';
import {EmptyState} from '../../components/EmptyState';
import {ErrorState} from '../../components/ErrorState';
import {Header} from '../../components/Header';
import {LoadingState} from '../../components/LoadingState';
import {MovieCard} from '../../components/MovieCard';
import {OfflineBanner} from '../../components/OfflineBanner';
import {useUpcomingMovies} from '../../hooks/useUpcomingMovies';
import type {RootStackParamList} from '../../navigation/AppNavigator/types';
import {colors, spacing} from '../../theme';
import type {Movie} from '../../types/movie';

type Props = NativeStackScreenProps<RootStackParamList, 'MovieList'>;

export function MovieListScreen({navigation}: Props) {
  const {status, movies, error, isOffline, cachedAt, retry} = useUpcomingMovies();

  const handleSelectMovie = useCallback(
    (movie: Movie) => {
      navigation.navigate('MovieDetail', {movieId: movie.id});
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({item}: {item: Movie}) => (
      <MovieCard movie={item} onPress={handleSelectMovie} />
    ),
    [handleSelectMovie],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Watch" onSearchPress={() => navigation.navigate('MovieSearch')} />
      {status === 'success' && isOffline && cachedAt && (
        <OfflineBanner cachedAt={cachedAt} />
      )}
      <View style={styles.content}>
        {status === 'loading' && <LoadingState />}
        {status === 'error' && (
          <ErrorState message={error ?? "Couldn't load movies."} onRetry={retry} />
        )}
        {status === 'empty' && (
          <EmptyState message="No upcoming movies right now." />
        )}
        {status === 'success' && (
          <FlatList
            data={movies}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
      <BottomTabBar activeTab="watch" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
});
