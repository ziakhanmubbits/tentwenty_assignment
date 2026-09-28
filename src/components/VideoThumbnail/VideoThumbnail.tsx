import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import React from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, spacing} from '../../theme';
import type {MovieVideoSummary} from '../../types/movie';

interface VideoThumbnailProps {
  video: MovieVideoSummary;
  onPress: (video: MovieVideoSummary) => void;
}

function VideoThumbnailComponent({video, onPress}: VideoThumbnailProps) {
  const label = video.name || video.type;

  return (
    <Pressable
      onPress={() => onPress(video)}
      accessibilityRole="button"
      accessibilityLabel={`Play ${label}`}
      style={styles.container}>
      <View style={styles.thumbnailWrapper}>
        <Image source={{uri: video.thumbnailUrl}} style={styles.thumbnail} resizeMode="cover" />
        <View style={styles.playOverlay}>
          <Ionicons name="play" size={18} color={colors.white} />
        </View>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.type}>{video.type}</Text>
    </Pressable>
  );
}

export const VideoThumbnail = React.memo(VideoThumbnailComponent);

const styles = StyleSheet.create({
  container: {
    width: 170,
    gap: spacing.xs,
  },
  thumbnailWrapper: {
    width: 170,
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46, 39, 57, 0.35)',
  },
  name: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  type: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
