import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback} from 'react';
import {FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {EmptyState} from '../../components/EmptyState';
import {ErrorState} from '../../components/ErrorState';
import {LoadingState} from '../../components/LoadingState';
import {SearchBar} from '../../components/SearchBar';
import {SearchResultItem} from '../../components/SearchResultItem';
import {useMovieSearch} from '../../hooks/useMovieSearch';
import type {RootStackParamList} from '../../navigation/AppNavigator/types';
import {colors, spacing} from '../../theme';
import type {MovieSearchResult} from '../../types/movie';

type Props = NativeStackScreenProps<RootStackParamList, 'MovieSearch'>;

export function MovieSearchScreen({navigation}: Props) {
  const {query, setQuery, status, results, error, retry} = useMovieSearch();

  const handleSelectMovie = useCallback(
    (movie: MovieSearchResult) => {
      navigation.navigate('MovieDetail', {movieId: movie.id});
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({item}: {item: MovieSearchResult}) => (
      <SearchResultItem movie={item} onPress={handleSelectMovie} />
    ),
    [handleSelectMovie],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.searchBarWrapper}>
          <SearchBar value={query} onChangeText={setQuery} onClear={() => setQuery('')} />
        </View>
      </View>

      <View style={styles.content}>
        {status === 'idle' && (
          <EmptyState message="Search for movies by title." />
        )}
        {status === 'loading' && <LoadingState />}
        {status === 'error' && (
          <ErrorState message={error ?? "Couldn't search movies."} onRetry={retry} />
        )}
        {status === 'empty' && (
          <EmptyState message={`No movies found for "${query.trim()}".`} />
        )}
        {status === 'success' && (
          <>
            <Text style={styles.resultsHeading}>
              {`${results.length} ${results.length === 1 ? 'Result' : 'Results'} Found`}
            </Text>
            <FlatList
              data={results}
              keyExtractor={item => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  backButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarWrapper: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  resultsHeading: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginVertical: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
});
