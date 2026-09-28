import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import YoutubeIframe from 'react-native-youtube-iframe';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {TrailerScreen} from '../TrailerScreen';
import {fetchMovieTrailerVideo} from '../../../services/tmdb/endpoints/movieTrailer';
import type {RootStackParamList} from '../../../navigation/AppNavigator/types';

jest.mock('../../../services/tmdb/endpoints/movieTrailer', () => ({
  ...jest.requireActual('../../../services/tmdb/endpoints/movieTrailer'),
  fetchMovieTrailerVideo: jest.fn(),
}));

jest.mock('react-native-youtube-iframe', () => {
  const ReactModule = require('react');
  const MockYoutubeIframe = (props: Record<string, unknown>) =>
    ReactModule.createElement('MockYoutubeIframe', props);
  return {
    __esModule: true,
    default: MockYoutubeIframe,
    PLAYER_STATES: {
      ENDED: 'ended',
      PAUSED: 'paused',
      PLAYING: 'playing',
      UNSTARTED: 'unstarted',
      BUFFERING: 'buffering',
      VIDEO_CUED: 'video cued',
    },
  };
});

const mockFetchMovieTrailerVideo = fetchMovieTrailerVideo as jest.MockedFunction<
  typeof fetchMovieTrailerVideo
>;

type Props = NativeStackScreenProps<RootStackParamList, 'Trailer'>;

const testSafeAreaMetrics = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 47, left: 0, right: 0, bottom: 34},
};

function renderScreen(movieId = 42) {
  const goBack = jest.fn();
  const navigation = {goBack} as unknown as Props['navigation'];
  const route = {params: {movieId}} as unknown as Props['route'];
  let renderer: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={testSafeAreaMetrics}>
        <TrailerScreen navigation={navigation} route={route} />
      </SafeAreaProvider>,
    );
  });
  return {renderer: renderer!, goBack};
}

function flushMicrotasks() {
  return act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

const sampleTrailer = {
  id: 'a',
  key: 'abc123',
  site: 'YouTube',
  type: 'Trailer',
  official: true,
};

describe('TrailerScreen', () => {
  afterEach(() => {
    mockFetchMovieTrailerVideo.mockReset();
  });

  it('shows a loading state before the trailer request resolves', async () => {
    mockFetchMovieTrailerVideo.mockReturnValue(new Promise(() => {}));
    const {renderer} = renderScreen();
    await flushMicrotasks();
    expect(renderer.root.findByProps({accessibilityRole: 'progressbar'})).toBeTruthy();
  });

  it('fetches the trailer using the movie id from route params', () => {
    mockFetchMovieTrailerVideo.mockReturnValue(new Promise(() => {}));
    renderScreen(99);
    expect(mockFetchMovieTrailerVideo).toHaveBeenCalledWith(99);
  });

  it('passes the YouTube video id to the player and enables autoplay', async () => {
    mockFetchMovieTrailerVideo.mockResolvedValue(sampleTrailer);
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const player = renderer.root.findByType(YoutubeIframe);
    expect(player.props.videoId).toBe('abc123');
    expect(player.props.play).toBe(true);
  });

  it('shows a loading overlay until the player reports ready, then hides it', async () => {
    mockFetchMovieTrailerVideo.mockResolvedValue(sampleTrailer);
    const {renderer} = renderScreen();
    await flushMicrotasks();

    expect(
      renderer.root.findAllByProps({accessibilityRole: 'progressbar'}).length,
    ).toBeGreaterThan(0);

    const player = renderer.root.findByType(YoutubeIframe);
    act(() => {
      player.props.onReady();
    });

    expect(
      renderer.root.findAllByProps({accessibilityRole: 'progressbar'}).length,
    ).toBe(0);
  });

  it('shows an unavailable state when there is no suitable trailer', async () => {
    mockFetchMovieTrailerVideo.mockResolvedValue(null);
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Trailer not available for this movie.');
  });

  it('shows an error state with retry when the trailer request fails', async () => {
    mockFetchMovieTrailerVideo.mockRejectedValue(new Error('down'));
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain("Couldn't load trailer.");
    expect(renderer.root.findByProps({accessibilityLabel: 'Try again'})).toBeTruthy();
  });

  it('shows a playback error and a way back when the player reports an error', async () => {
    mockFetchMovieTrailerVideo.mockResolvedValue(sampleTrailer);
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const player = renderer.root.findByType(YoutubeIframe);
    act(() => {
      player.props.onError('embed_not_allowed');
    });

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain("Couldn't play this trailer.");
    expect(
      renderer.root.findByProps({accessibilityLabel: 'Back to Movie Details'}),
    ).toBeTruthy();
  });

  it('navigates back to Movie Detail exactly once when playback ends', async () => {
    mockFetchMovieTrailerVideo.mockResolvedValue(sampleTrailer);
    const {renderer, goBack} = renderScreen();
    await flushMicrotasks();

    const player = renderer.root.findByType(YoutubeIframe);
    act(() => {
      player.props.onChangeState('ended');
      player.props.onChangeState('ended');
    });

    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('does not navigate back for non-ended player state changes', async () => {
    mockFetchMovieTrailerVideo.mockResolvedValue(sampleTrailer);
    const {renderer, goBack} = renderScreen();
    await flushMicrotasks();

    const player = renderer.root.findByType(YoutubeIframe);
    act(() => {
      player.props.onChangeState('playing');
      player.props.onChangeState('paused');
    });

    expect(goBack).not.toHaveBeenCalled();
  });

  it('navigates back when the close button is pressed', async () => {
    mockFetchMovieTrailerVideo.mockResolvedValue(sampleTrailer);
    const {renderer, goBack} = renderScreen();
    await flushMicrotasks();

    const closeButton = renderer.root.findByProps({accessibilityLabel: 'Close trailer'});
    act(() => {
      closeButton.props.onPress();
    });

    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('does not crash when the resolved video has an empty key', async () => {
    mockFetchMovieTrailerVideo.mockResolvedValue({...sampleTrailer, key: ''});
    const {renderer} = renderScreen();
    await flushMicrotasks();

    expect(renderer.root.findByType(YoutubeIframe)).toBeTruthy();
  });
});
