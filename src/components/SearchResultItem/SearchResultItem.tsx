import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, spacing} from '../../theme';
import type {MovieSearchResult} from '../../types/movie';

interface SearchResultItemProps {
  movie: MovieSearchResult;
  onPress: (movie: MovieSearchResult) => void;
}

function SearchResultItemComponent({movie, onPress}: SearchResultItemProps) {
  return (
    <Pressable
      onPress={() => onPress(movie)}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${movie.title}`}
      style={styles.container}>
      {movie.posterUrl ? (
        <Image source={{uri: movie.posterUrl}} style={styles.thumbnail} resizeMode="cover" />
      ) : (
        <View style={[styles.thumbnail, styles.thumbnailFallback]} />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {movie.title}
        </Text>
        {movie.genreLabel && <Text style={styles.genre}>{movie.genreLabel}</Text>}
      </View>
      <Ionicons name="ellipsis-horizontal" size={20} color={colors.primary} />
    </Pressable>
  );
}

export const SearchResultItem = React.memo(SearchResultItemComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 8,
  },
  thumbnailFallback: {
    backgroundColor: colors.border,
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  genre: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
