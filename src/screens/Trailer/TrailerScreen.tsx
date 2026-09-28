import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Pressable, StatusBar, StyleSheet, View, useWindowDimensions} from 'react-native';
import YoutubeIframe, {PLAYER_STATES} from 'react-native-youtube-iframe';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {EmptyState} from '../../components/EmptyState';
import {ErrorState} from '../../components/ErrorState';
import {LoadingState} from '../../components/LoadingState';
import {useTrailerVideo} from '../../hooks/useTrailerVideo';
import type {RootStackParamList} from '../../navigation/AppNavigator/types';
import {colors, spacing} from '../../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Trailer'>;

export function TrailerScreen({navigation, route}: Props) {
  const {status, video, error, retry} = useTrailerVideo(
    route.params.movieId,
    route.params.videoKey,
  );
  const [playbackFailed, setPlaybackFailed] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const insets = useSafeAreaInsets();
  const {width, height} = useWindowDimensions();
  const hasNavigatedBackRef = useRef(false);

  const goToDetail = useCallback(() => {
    if (hasNavigatedBackRef.current) {
      return;
    }
    hasNavigatedBackRef.current = true;
    navigation.goBack();
  }, [navigation]);

  useEffect(() => {
    return () => {
      hasNavigatedBackRef.current = true;
    };
  }, []);

  const handleChangeState = useCallback(
    (state: PLAYER_STATES) => {
      if (state === PLAYER_STATES.ENDED) {
        goToDetail();
      }
    },
    [goToDetail],
  );

  const closeButton = (
    <Pressable
      onPress={goToDetail}
      accessibilityRole="button"
      accessibilityLabel="Close trailer"
      hitSlop={8}
      style={[styles.closeButton, {top: insets.top + spacing.sm}]}>
      <Ionicons name="close" size={28} color={colors.white} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      {status === 'loading' && <LoadingState />}
      {status === 'error' && (
        <ErrorState message={error ?? "Couldn't load trailer."} onRetry={retry} />
      )}
      {status === 'unavailable' && (
        <EmptyState message="Trailer not available for this movie." />
      )}
      {status === 'success' && video && !playbackFailed && (
        <>
          <YoutubeIframe
            videoId={video.key}
            play
            height={height}
            width={width}
            onReady={() => setIsPlayerReady(true)}
            onChangeState={handleChangeState}
            onError={() => setPlaybackFailed(true)}
          />
          {!isPlayerReady && (
            <View style={styles.loadingOverlay}>
              <LoadingState />
            </View>
          )}
        </>
      )}
      {status === 'success' && playbackFailed && (
        <ErrorState
          message="Couldn't play this trailer."
          onRetry={goToDetail}
          actionLabel="Back to Movie Details"
        />
      )}
      {closeButton}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.textPrimary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  closeButton: {
    position: 'absolute',
    left: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
