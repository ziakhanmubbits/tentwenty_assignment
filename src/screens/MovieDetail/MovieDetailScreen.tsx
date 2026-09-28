import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ErrorState} from '../../components/ErrorState';
import {GenreList} from '../../components/GenreList';
import {LoadingState} from '../../components/LoadingState';
import {TrailerButton} from '../../components/TrailerButton';
import {VideoThumbnail} from '../../components/VideoThumbnail';
import {useMovieDetail} from '../../hooks/useMovieDetail';
import type {RootStackParamList} from '../../navigation/AppNavigator/types';
import {colors, spacing} from '../../theme';
import type {MovieVideoSummary} from '../../types/movie';

type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

function formatReleaseDate(releaseDate: string): string | null {
  if (!releaseDate) {
    return null;
  }
  const date = new Date(releaseDate);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function MovieDetailScreen({navigation, route}: Props) {
  const {status, movie, error, retry} = useMovieDetail(route.params.movieId);
  const insets = useSafeAreaInsets();
  const {width, height} = useWindowDimensions();
  const isLandscape = width > height;

  const staticBackButton = (
    <Pressable
      onPress={() => navigation.goBack()}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      hitSlop={8}
      style={[styles.backButton, {top: insets.top + spacing.sm}]}>
      <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      <Text style={styles.backButtonTextStatic}>Watch</Text>
    </Pressable>
  );

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        {staticBackButton}
        <LoadingState />
      </View>
    );
  }

  if (status === 'error' || !movie) {
    return (
      <View style={styles.container}>
        {staticBackButton}
        <ErrorState
          message={error ?? "Couldn't load movie details."}
          onRetry={retry}
        />
      </View>
    );
  }

  const heroImageUrl = movie.backdropUrl ?? movie.posterUrl;
  const releaseDateLabel = formatReleaseDate(movie.releaseDate);

  const handleSelectVideo = (video: MovieVideoSummary) => {
    navigation.navigate('Trailer', {movieId: movie.id, videoKey: video.key});
  };

  return (
    <View style={[styles.container, isLandscape && styles.containerLandscape]}>
      <View
        style={[
          styles.hero,
          isLandscape ? styles.heroLandscape : styles.heroPortrait,
        ]}>
        {heroImageUrl ? (
          <Image source={{uri: heroImageUrl}} style={styles.heroImage} resizeMode="cover" />
        ) : (
          <View style={[styles.heroImage, styles.heroImageFallback]} />
        )}
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={8}
          style={[styles.backButton, {top: insets.top + spacing.sm}]}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
          <Text style={styles.backButtonText}>Watch</Text>
        </Pressable>
        {movie.logoUrl ? (
          <Image
            source={{uri: movie.logoUrl}}
            style={styles.logo}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.titleFallback} numberOfLines={2}>
            {movie.title}
          </Text>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          {paddingBottom: insets.bottom + spacing.lg},
        ]}>
        {releaseDateLabel && (
          <Text style={styles.releaseDate}>In Theaters {releaseDateLabel}</Text>
        )}

        <Pressable
          onPress={() =>
            navigation.navigate('ShowtimeSelection', {
              movieId: movie.id,
              movieTitle: movie.title,
              releaseDateLabel,
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Get Tickets"
          style={styles.ticketsButton}>
          <Text style={styles.ticketsButtonText}>Get Tickets</Text>
        </Pressable>

        <TrailerButton
          available={Boolean(movie.trailerVideoKey)}
          onPress={() => navigation.navigate('Trailer', {movieId: movie.id})}
        />

        {movie.genres.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genres</Text>
            <GenreList genres={movie.genres} />
          </View>
        )}

        <View style={styles.divider} />

        {movie.overview.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overview}>{movie.overview}</Text>
          </View>
        )}

        {movie.videos.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Videos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.galleryRow}>
                {movie.videos.map(video => (
                  <VideoThumbnail key={video.key} video={video} onPress={handleSelectVideo} />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {movie.galleryImages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.galleryRow}>
                {movie.galleryImages.map(imageUrl => (
                  <Image
                    key={imageUrl}
                    source={{uri: imageUrl}}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  containerLandscape: {
    flexDirection: 'row',
  },
  hero: {
    backgroundColor: colors.textPrimary,
  },
  heroPortrait: {
    width: '100%',
    height: 340,
  },
  heroLandscape: {
    width: '42%',
    height: '100%',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroImageFallback: {
    backgroundColor: colors.border,
  },
  backButton: {
    position: 'absolute',
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '500',
  },
  backButtonTextStatic: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '500',
  },
  logo: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    height: 64,
  },
  titleFallback: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    color: colors.white,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  releaseDate: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  ticketsButton: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: spacing.sm,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketsButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  overview: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  galleryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  galleryImage: {
    width: 220,
    height: 124,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
});
