import {Ionicons} from '@react-native-vector-icons/ionicons/static';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useCallback, useMemo, useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ShowtimeCard} from '../../components/ShowtimeCard';
import type {RootStackParamList} from '../../navigation/AppNavigator/types';
import {colors, spacing} from '../../theme';
import {MOCK_SHOWTIMES, formatFullDate, generateDateOptions, shortenVenue} from './showtimeData';

type Props = NativeStackScreenProps<RootStackParamList, 'ShowtimeSelection'>;

export function ShowtimeSelectionScreen({navigation, route}: Props) {
  const {movieId, movieTitle, releaseDateLabel} = route.params;
  const dateOptions = useMemo(() => generateDateOptions(new Date(), 5), []);
  const [selectedDateId, setSelectedDateId] = useState(dateOptions[0].id);
  const [selectedShowtimeId, setSelectedShowtimeId] = useState(MOCK_SHOWTIMES[0].id);

  const handleSelectShowtime = useCallback((showtimeId: string) => {
    setSelectedShowtimeId(showtimeId);
  }, []);

  const handleSelectSeats = useCallback(() => {
    const showtime =
      MOCK_SHOWTIMES.find(item => item.id === selectedShowtimeId) ?? MOCK_SHOWTIMES[0];
    const scheduleLabel = `${formatFullDate(selectedDateId)} | ${showtime.time} ${shortenVenue(
      showtime.venue,
    )}`;
    navigation.navigate('SeatMapping', {movieId, movieTitle, scheduleLabel});
  }, [movieId, movieTitle, navigation, selectedDateId, selectedShowtimeId]);

  return (
    <View style={styles.container}>
      {/* White header (status bar area included) */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={styles.backButton}>
            <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
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
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalContent}
          style={styles.dateScroll}>
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
                  <Text style={[styles.datePillText, isSelected && styles.datePillTextSelected]}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalContent}
          style={styles.showtimeScroll}>
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

      <SafeAreaView edges={['bottom']}>
        <Pressable
          onPress={handleSelectSeats}
          accessibilityRole="button"
          accessibilityLabel="Select Seats"
          style={styles.selectSeatsButton}>
          <Text style={styles.selectSeatsButtonText}>Select Seats</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerSafeArea: {
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
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
    gap: 2,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '500',
  },
  headerSubtitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '400',
  },
  content: {
    paddingTop: 88, 
    paddingBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 20,
  },
  horizontalContent: {
    paddingHorizontal: 20,
  },
  dateScroll: {
    marginTop: 16,
    overflow: 'visible',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8, 
  },
  datePill: {
    width: 67,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFEFF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePillSelected: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  datePillText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  datePillTextSelected: {
    color: colors.white,
  },
  showtimeScroll: {
    marginTop: 32,
  },
  showtimeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  selectSeatsButton: {
    marginHorizontal: 26,
    marginBottom: 26,
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectSeatsButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});