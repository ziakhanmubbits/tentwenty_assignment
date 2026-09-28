import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {CustomTabBar} from '../CustomTabBar';

const testSafeAreaMetrics = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 47, left: 0, right: 0, bottom: 34},
};

function buildProps(overrides: Partial<BottomTabBarProps['state']> = {}): {
  props: BottomTabBarProps;
  navigate: jest.Mock;
} {
  const navigate = jest.fn();
  const state = {
    index: 0,
    routes: [{key: 'watch-key', name: 'Watch'}],
    ...overrides,
  } as unknown as BottomTabBarProps['state'];

  const props = {
    state,
    descriptors: {} as BottomTabBarProps['descriptors'],
    navigation: {navigate} as unknown as BottomTabBarProps['navigation'],
    insets: {top: 0, left: 0, right: 0, bottom: 0},
  };

  return {props, navigate};
}

function render(props: BottomTabBarProps) {
  let renderer: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={testSafeAreaMetrics}>
        <CustomTabBar {...props} />
      </SafeAreaProvider>,
    );
  });
  return renderer!;
}

describe('CustomTabBar', () => {
  it('renders the bar with Watch active when the Watch tab is focused on its root screen', () => {
    const {props} = buildProps({
      routes: [
        {
          key: 'watch-key',
          name: 'Watch',
          state: {index: 0, routes: [{name: 'MovieList'}]},
        },
      ],
    });
    const renderer = render(props);

    const watchTab = renderer.root.findByProps({accessibilityLabel: 'Watch'});
    expect(watchTab.props.accessibilityState.selected).toBe(true);
  });

  it('hides the tab bar when the Watch stack is focused on a screen other than MovieList', () => {
    const {props} = buildProps({
      routes: [
        {
          key: 'watch-key',
          name: 'Watch',
          state: {index: 1, routes: [{name: 'MovieList'}, {name: 'MovieDetail'}]},
        },
      ],
    });
    const renderer = render(props);

    expect(renderer.root.findAllByProps({accessibilityLabel: 'Watch'}).length).toBe(0);
  });

  it('shows the tab bar again once back on MovieList', () => {
    const {props} = buildProps({
      routes: [
        {
          key: 'watch-key',
          name: 'Watch',
          state: {index: 0, routes: [{name: 'MovieList'}]},
        },
      ],
    });
    const renderer = render(props);
    expect(
      renderer.root.findAllByProps({accessibilityLabel: 'Watch'}).length,
    ).toBeGreaterThan(0);
  });

  it('navigates to the pressed tab', () => {
    const {props, navigate} = buildProps({
      index: 1,
      routes: [
        {key: 'watch-key', name: 'Watch', state: {index: 0, routes: [{name: 'MovieList'}]}},
        {key: 'dashboard-key', name: 'Dashboard'},
      ],
    });
    const renderer = render(props);

    const moreTab = renderer.root.findByProps({accessibilityLabel: 'More'});
    act(() => {
      moreTab.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('More');
  });

  it('does not navigate when the currently active tab is pressed again', () => {
    const {props, navigate} = buildProps({
      index: 1,
      routes: [
        {key: 'watch-key', name: 'Watch', state: {index: 0, routes: [{name: 'MovieList'}]}},
        {key: 'dashboard-key', name: 'Dashboard'},
      ],
    });
    const renderer = render(props);

    const dashboardTab = renderer.root.findByProps({accessibilityLabel: 'Dashboard'});
    act(() => {
      dashboardTab.props.onPress();
    });

    expect(navigate).not.toHaveBeenCalled();
  });
});
