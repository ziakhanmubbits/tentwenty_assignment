import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SeatMappingScreen} from '../SeatMappingScreen';
import type {RootStackParamList} from '../../../navigation/AppNavigator/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SeatMapping'>;

const testSafeAreaMetrics = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 47, left: 0, right: 0, bottom: 34},
};

function renderScreen() {
  const goBack = jest.fn();
  const navigation = {goBack} as unknown as Props['navigation'];
  const route = {
    params: {movieId: 42, movieTitle: "The King's Man"},
  } as unknown as Props['route'];
  let renderer: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={testSafeAreaMetrics}>
        <SeatMappingScreen navigation={navigation} route={route} />
      </SafeAreaProvider>,
    );
  });
  return {renderer: renderer!, goBack};
}

describe('SeatMappingScreen', () => {
  it('renders the movie title and an initial "no seats selected" summary', () => {
    const {renderer} = renderScreen();
    expect(
      renderer.root.findAllByProps({children: "The King's Man"}).length,
    ).toBeGreaterThan(0);
    expect(
      renderer.root.findAllByProps({children: 'No seats selected'}).length,
    ).toBeGreaterThan(0);
  });

  it('renders an available seat with the correct accessibility label', () => {
    const {renderer} = renderScreen();
    const seatA1 = renderer.root.findByProps({accessibilityLabel: 'Seat A1, available'});
    expect(seatA1).toBeTruthy();
  });

  it('renders an occupied seat as disabled with the correct accessibility label', () => {
    const {renderer} = renderScreen();
    const seatA3 = renderer.root.findByProps({accessibilityLabel: 'Seat A3, occupied'});
    expect(seatA3.props.accessibilityState.disabled).toBe(true);
  });

  it('selects an available seat when pressed', () => {
    const {renderer} = renderScreen();
    const seatA1 = renderer.root.findByProps({accessibilityLabel: 'Seat A1, available'});

    act(() => {
      seatA1.props.onPress();
    });

    expect(
      renderer.root.findByProps({accessibilityLabel: 'Seat A1, selected'}),
    ).toBeTruthy();
  });

  it('deselects a selected seat when pressed again', () => {
    const {renderer} = renderScreen();
    const seatA1 = renderer.root.findByProps({accessibilityLabel: 'Seat A1, available'});

    act(() => {
      seatA1.props.onPress();
    });
    const selectedA1 = renderer.root.findByProps({accessibilityLabel: 'Seat A1, selected'});
    act(() => {
      selectedA1.props.onPress();
    });

    expect(
      renderer.root.findByProps({accessibilityLabel: 'Seat A1, available'}),
    ).toBeTruthy();
  });

  it('does not select an occupied seat when pressed', () => {
    const {renderer} = renderScreen();
    const seatA3 = renderer.root.findByProps({accessibilityLabel: 'Seat A3, occupied'});

    act(() => {
      seatA3.props.onPress();
    });

    expect(
      renderer.root.findAllByProps({accessibilityLabel: 'Seat A3, selected'}).length,
    ).toBe(0);
    expect(
      renderer.root.findAllByProps({children: 'No seats selected'}).length,
    ).toBeGreaterThan(0);
  });

  it('updates the summary when multiple seats are selected', () => {
    const {renderer} = renderScreen();
    const seatA1 = renderer.root.findByProps({accessibilityLabel: 'Seat A1, available'});
    const seatB2 = renderer.root.findByProps({accessibilityLabel: 'Seat B2, available'});

    act(() => {
      seatA1.props.onPress();
      seatB2.props.onPress();
    });

    expect(
      renderer.root.findAllByProps({children: '2 Seats: A1, B2'}).length,
    ).toBeGreaterThan(0);
  });

  it('disables Continue when no seats are selected and enables it once a seat is picked', () => {
    const {renderer} = renderScreen();
    const continueButtonBefore = renderer.root.findByProps({accessibilityLabel: 'Continue'});
    expect(continueButtonBefore.props.accessibilityState.disabled).toBe(true);

    const seatA1 = renderer.root.findByProps({accessibilityLabel: 'Seat A1, available'});
    act(() => {
      seatA1.props.onPress();
    });

    const continueButtonAfter = renderer.root.findByProps({accessibilityLabel: 'Continue'});
    expect(continueButtonAfter.props.accessibilityState.disabled).toBe(false);
  });

  it('returns to Movie Detail when Continue is pressed with seats selected', () => {
    const {renderer, goBack} = renderScreen();
    const seatA1 = renderer.root.findByProps({accessibilityLabel: 'Seat A1, available'});
    act(() => {
      seatA1.props.onPress();
    });

    const continueButton = renderer.root.findByProps({accessibilityLabel: 'Continue'});
    act(() => {
      continueButton.props.onPress();
    });

    expect(goBack).toHaveBeenCalled();
  });

  it('returns to Movie Detail when the back button is pressed', () => {
    const {renderer, goBack} = renderScreen();
    const backButton = renderer.root.findByProps({accessibilityLabel: 'Go back'});
    act(() => {
      backButton.props.onPress();
    });
    expect(goBack).toHaveBeenCalled();
  });
});
