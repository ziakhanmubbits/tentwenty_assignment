import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, spacing} from '../../theme';
import type {Movie} from '../../types/movie';

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
}

function MovieCardComponent({movie, onPress}: MovieCardProps) {
  return (
    <Pressable
      onPress={() => onPress(movie)}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${movie.title}`}
      style={({pressed}) => [styles.card, pressed && styles.pressed]}>
      {movie.backdropUrl ? (
        <Image
          source={{uri: movie.backdropUrl}}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.imageFallback]} />
      )}
      <View style={styles.overlay}>
        <Text style={styles.title} numberOfLines={1}>
          {movie.title}
        </Text>
      </View>
    </Pressable>
  );
}

export const MovieCard = React.memo(MovieCardComponent);

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 2,
  },
  imageFallback: {
    backgroundColor: colors.border,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(46, 39, 57, 0.45)',
  },
  title: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
});
