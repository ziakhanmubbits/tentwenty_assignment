import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {ShowtimeSelectionScreen} from '../ShowtimeSelectionScreen';
import type {RootStackParamList} from '../../../navigation/AppNavigator/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ShowtimeSelection'>;

const testSafeAreaMetrics = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 47, left: 0, right: 0, bottom: 34},
};

function renderScreen() {
  const navigate = jest.fn();
  const goBack = jest.fn();
  const navigation = {navigate, goBack} as unknown as Props['navigation'];
  const route = {
    params: {
      movieId: 42,
      movieTitle: "The King's Man",
      releaseDateLabel: 'December 22, 2021',
    },
  } as unknown as Props['route'];

  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={testSafeAreaMetrics}>
        <ShowtimeSelectionScreen navigation={navigation} route={route} />
      </SafeAreaProvider>,
    );
  });
  return {renderer: renderer!, navigate, goBack};
}

describe('ShowtimeSelectionScreen', () => {
  it('renders the movie title and release date', () => {
    const {renderer} = renderScreen();
    expect(
      renderer.root.findAllByProps({children: "The King's Man"}).length,
    ).toBeGreaterThan(0);
    expect(
      renderer.root.findAllByProps({children: 'In Theaters December 22, 2021'}).length,
    ).toBeGreaterThan(0);
  });

  it('selects the first date and first showtime by default', () => {
    const {renderer} = renderScreen();

    const firstShowtime = renderer.root.findByProps({
      accessibilityLabel: 'Showtime 12:30 at Cinetech + Hall 1',
    });
    expect(firstShowtime.props.accessibilityState.selected).toBe(true);
  });

  it('selects a different showtime when pressed', () => {
    const {renderer} = renderScreen();

    const secondShowtime = renderer.root.findByProps({
      accessibilityLabel: 'Showtime 13:30 at Cinetech + Hall 2',
    });
    act(() => {
      secondShowtime.props.onPress();
    });

    const firstShowtime = renderer.root.findByProps({
      accessibilityLabel: 'Showtime 12:30 at Cinetech + Hall 1',
    });
    expect(secondShowtime.props.accessibilityState.selected).toBe(true);
    expect(firstShowtime.props.accessibilityState.selected).toBe(false);
  });

  function findDatePills(renderer: ReactTestRenderer.ReactTestRenderer) {
    const seenLabels = new Set<string>();
    return renderer.root
      .findAllByProps({accessibilityRole: 'button'})
      .filter(
        node =>
          typeof node.props.accessibilityLabel === 'string' &&
          !node.props.accessibilityLabel.startsWith('Showtime') &&
          node.props.accessibilityLabel !== 'Go back' &&
          node.props.accessibilityLabel !== 'Select Seats',
      )
      .filter(node => {
        if (seenLabels.has(node.props.accessibilityLabel)) {
          return false;
        }
        seenLabels.add(node.props.accessibilityLabel);
        return true;
      });
  }

  it('selects a different date when pressed', () => {
    const {renderer} = renderScreen();

    const datePills = findDatePills(renderer);
    expect(datePills[0].props.accessibilityState.selected).toBe(true);
    expect(datePills[1].props.accessibilityState.selected).toBe(false);

    act(() => {
      datePills[1].props.onPress();
    });

    const updatedDatePills = findDatePills(renderer);
    expect(updatedDatePills[0].props.accessibilityState.selected).toBe(false);
    expect(updatedDatePills[1].props.accessibilityState.selected).toBe(true);
  });

  it('navigates to Seat Mapping with the movie id, title and a schedule label when Select Seats is pressed', () => {
    const {renderer, navigate} = renderScreen();

    const selectSeatsButton = renderer.root.findByProps({accessibilityLabel: 'Select Seats'});
    act(() => {
      selectSeatsButton.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith(
      'SeatMapping',
      expect.objectContaining({
        movieId: 42,
        movieTitle: "The King's Man",
        scheduleLabel: expect.stringContaining('12:30 Hall 1'),
      }),
    );
  });

  it('navigates back when the back button is pressed', () => {
    const {renderer, goBack} = renderScreen();

    const backButton = renderer.root.findByProps({accessibilityLabel: 'Go back'});
    act(() => {
      backButton.props.onPress();
    });

    expect(goBack).toHaveBeenCalled();
  });
});
