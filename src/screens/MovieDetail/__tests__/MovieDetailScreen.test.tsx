import React from 'react';
import ReactTestRenderer, {act} from 'react-test-renderer';
import {Text} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MovieDetailScreen} from '../MovieDetailScreen';
import {fetchMovieDetail} from '../../../services/tmdb/endpoints/movieDetail';
import type {MovieDetail} from '../../../types/movie';
import type {RootStackParamList} from '../../../navigation/AppNavigator/types';

jest.mock('../../../services/tmdb/endpoints/movieDetail');

const mockFetchMovieDetail = fetchMovieDetail as jest.MockedFunction<
  typeof fetchMovieDetail
>;

type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetail'>;

const testSafeAreaMetrics = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 47, left: 0, right: 0, bottom: 34},
};

const fullMovie: MovieDetail = {
  id: 42,
  title: "The King's Man",
  releaseDate: '2021-12-22',
  overview: 'A secret origin story.',
  voteAverage: 7.2,
  posterUrl: 'https://image.tmdb.org/t/p/w342/poster.jpg',
  backdropUrl: 'https://image.tmdb.org/t/p/w1280/backdrop.jpg',
  runtime: 131,
  genres: ['Action', 'Thriller'],
  logoUrl: 'https://image.tmdb.org/t/p/w500/logo.png',
  trailerVideoKey: 'abc123',
};

function renderScreen(movieId = 42) {
  const goBack = jest.fn();
  const navigate = jest.fn();
  const navigation = {goBack, navigate} as unknown as Props['navigation'];
  const route = {params: {movieId}} as unknown as Props['route'];
  let renderer: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(
      <SafeAreaProvider initialMetrics={testSafeAreaMetrics}>
        <MovieDetailScreen navigation={navigation} route={route} />
      </SafeAreaProvider>,
    );
  });
  return {renderer: renderer!, goBack, navigate};
}

function flushMicrotasks() {
  return act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe('MovieDetailScreen', () => {
  afterEach(() => {
    mockFetchMovieDetail.mockReset();
  });

  it('shows a loading state before the request resolves', async () => {
    mockFetchMovieDetail.mockReturnValue(new Promise(() => {}));
    const {renderer} = renderScreen();
    await flushMicrotasks();
    expect(renderer.root.findByProps({accessibilityRole: 'progressbar'})).toBeTruthy();
  });

  it('fetches detail using the movie id from route params', () => {
    mockFetchMovieDetail.mockReturnValue(new Promise(() => {}));
    renderScreen(99);
    expect(mockFetchMovieDetail).toHaveBeenCalledWith(99);
  });

  it('renders movie title, overview and genres once loaded', async () => {
    mockFetchMovieDetail.mockResolvedValue(fullMovie);
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('A secret origin story.');
    expect(texts).toContain('Action');
    expect(texts).toContain('Thriller');
  });

  it('shows an error state with retry when the request fails', async () => {
    mockFetchMovieDetail.mockRejectedValue(new Error('down'));
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain("Couldn't load movie details.");
    expect(renderer.root.findByProps({accessibilityLabel: 'Try again'})).toBeTruthy();
  });

  it('retries the request when the retry action is pressed', async () => {
    mockFetchMovieDetail.mockRejectedValueOnce(new Error('down'));
    mockFetchMovieDetail.mockResolvedValueOnce(fullMovie);
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const retryButton = renderer.root.findByProps({accessibilityLabel: 'Try again'});
    await act(async () => {
      retryButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockFetchMovieDetail).toHaveBeenCalledTimes(2);
    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('A secret origin story.');
  });

  it('calls navigation.goBack when the back button is pressed', async () => {
    mockFetchMovieDetail.mockResolvedValue(fullMovie);
    const {renderer, goBack} = renderScreen();
    await flushMicrotasks();

    const backButton = renderer.root.findByProps({accessibilityLabel: 'Go back'});
    act(() => {
      backButton.props.onPress();
    });

    expect(goBack).toHaveBeenCalled();
  });

  it('navigates to Trailer with the movie id when Watch Trailer is pressed', async () => {
    mockFetchMovieDetail.mockResolvedValue(fullMovie);
    const {renderer, navigate} = renderScreen();
    await flushMicrotasks();

    const trailerButton = renderer.root.findByProps({accessibilityLabel: 'Watch Trailer'});
    act(() => {
      trailerButton.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('Trailer', {movieId: 42});
  });

  it('navigates to Seat Mapping with the movie id and title when Get Tickets is pressed', async () => {
    mockFetchMovieDetail.mockResolvedValue(fullMovie);
    const {renderer, navigate} = renderScreen();
    await flushMicrotasks();

    const ticketsButton = renderer.root.findByProps({accessibilityLabel: 'Get Tickets'});
    act(() => {
      ticketsButton.props.onPress();
    });

    expect(navigate).toHaveBeenCalledWith('SeatMapping', {
      movieId: 42,
      movieTitle: "The King's Man",
    });
  });

  it('shows the trailer as unavailable when no trailer key is present', async () => {
    mockFetchMovieDetail.mockResolvedValue({...fullMovie, trailerVideoKey: null});
    const {renderer} = renderScreen();
    await flushMicrotasks();

    expect(
      renderer.root.findByProps({accessibilityLabel: 'Trailer unavailable'}),
    ).toBeTruthy();
  });

  it('does not crash and falls back to the plain title when optional fields are missing', async () => {
    mockFetchMovieDetail.mockResolvedValue({
      id: 42,
      title: 'Mystery Movie',
      releaseDate: '',
      overview: '',
      voteAverage: 0,
      posterUrl: null,
      backdropUrl: null,
      runtime: null,
      genres: [],
      logoUrl: null,
      trailerVideoKey: null,
    });
    const {renderer} = renderScreen();
    await flushMicrotasks();

    const texts = renderer.root.findAllByType(Text).map(node => node.props.children);
    expect(texts).toContain('Mystery Movie');
    expect(
      renderer.root.findByProps({accessibilityLabel: 'Trailer unavailable'}),
    ).toBeTruthy();
  });
});
