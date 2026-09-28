import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ShowtimeCard} from '../../components/ShowtimeCard';
import type {RootStackParamList} from '../../navigation/AppNavigator/types';
import {colors, spacing} from '../../theme';
import {MOCK_SHOWTIMES, generateDateOptions} from './showtimeData';

type Props = NativeStackScreenProps<RootStackParamList, 'ShowtimeSelection'>;

export function ShowtimeSelectionScreen({navigation, route}: Props) {
  const {movieId, movieTitle, releaseDateLabel} = route.params;
  const dateOptions = useMemo(() => generateDateOptions(new Date(), 5), []);
  const [selectedDateId, setSelectedDateId] = useState(dateOptions[0].id);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(MOCK_SHOWTIMES[0].id);

  const handleSelectShowtime = useCallback((showtimeId: string) => {
    setSelectedShowtimeId(showtimeId);
  }, []);

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
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {movieTitle}
          </Text>
          {releaseDateLabel && (
            <Text style={styles.headerSubtitle}>{`In Theaters ${releaseDateLabel}`}</Text>
          )}
        </View>
        <View style={styles.backButtonSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.dateRow}>
            {dateOptions.map(option => {
              const isSelected = option.id === selectedDateId;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSelectedDateId(option.id)}
                  accessibilityRole="button"
                  accessibilityLabel={option.label}
                  accessibilityState={{selected: isSelected}}
                  style={[styles.datePill, isSelected && styles.datePillSelected]}>
                  <Text
                    style={[styles.datePillText, isSelected && styles.datePillTextSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.showtimeRow}>
            {MOCK_SHOWTIMES.map(showtime => (
              <ShowtimeCard
                key={showtime.id}
                showtime={showtime}
                isSelected={showtime.id === selectedShowtimeId}
                onPress={handleSelectShowtime}
              />
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      <Pressable
        onPress={() => navigation.navigate('SeatMapping', {movieId, movieTitle})}
        accessibilityRole="button"
        accessibilityLabel="Select Seats"
        style={styles.selectSeatsButton}>
        <Text style={styles.selectSeatsButtonText}>Select Seats</Text>
      </Pressable>
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
    backgroundColor: colors.background,
  },
  backButton: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonSpacer: {
    width: 44,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  datePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.border,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePillSelected: {
    backgroundColor: colors.primary,
  },
  datePillText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  datePillTextSelected: {
    color: colors.white,
  },
  showtimeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  selectSeatsButton: {
    margin: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: spacing.sm,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectSeatsButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
