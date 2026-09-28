import {tmdbGet} from '../../client/tmdbClient';
import {searchMovies} from '../searchMovies';
import {resetGenreMapCacheForTests} from '../genres';

jest.mock('../../client/tmdbClient');

const mockTmdbGet = tmdbGet as jest.MockedFunction<typeof tmdbGet>;

const genreListResponse = {
  genres: [
    {id: 28, name: 'Action'},
    {id: 878, name: 'Science Fiction'},
  ],
};

function mockEndpoints(searchResponse: unknown, genresResponse: unknown = genreListResponse) {
  mockTmdbGet.mockImplementation((path: string) => {
    if (path === '/genre/movie/list') {
      return Promise.resolve(genresResponse);
    }
    return Promise.resolve(searchResponse);
  });
}

describe('searchMovies', () => {
  beforeEach(() => {
    resetGenreMapCacheForTests();
  });

  afterEach(() => {
    mockTmdbGet.mockReset();
  });

  it('maps results and resolves the first genre id to a name', async () => {
    mockEndpoints({
      page: 1,
      results: [
        {
          id: 1,
          title: 'In Time',
          overview: '',
          release_date: '2011-10-28',
          vote_average: 6.7,
          poster_path: '/poster.jpg',
          backdrop_path: '/backdrop.jpg',
          genre_ids: [878, 28],
        },
      ],
      total_pages: 1,
      total_results: 1,
    });

    const results = await searchMovies('in time');

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('In Time');
    expect(results[0].genreLabel).toBe('Science Fiction');
    expect(results[0].posterUrl).toBe('https://image.tmdb.org/t/p/w185/poster.jpg');
  });

  it('handles a movie with no genre ids safely', async () => {
    mockEndpoints({
      page: 1,
      results: [
        {
          id: 2,
          title: 'Mystery Movie',
          overview: '',
          release_date: '',
          vote_average: 0,
          poster_path: null,
          backdrop_path: null,
          genre_ids: [],
        },
      ],
      total_pages: 1,
      total_results: 1,
    });

    const results = await searchMovies('mystery');

    expect(results[0].genreLabel).toBeNull();
    expect(results[0].posterUrl).toBeNull();
  });

  it('still returns search results if the genre list request fails', async () => {
    mockTmdbGet.mockImplementation((path: string) => {
      if (path === '/genre/movie/list') {
        return Promise.reject(new Error('genres down'));
      }
      return Promise.resolve({
        page: 1,
        results: [
          {
            id: 3,
            title: 'Unlabeled',
            overview: '',
            release_date: '',
            vote_average: 0,
            poster_path: null,
            backdrop_path: null,
            genre_ids: [28],
          },
        ],
        total_pages: 1,
        total_results: 1,
      });
    });

    const results = await searchMovies('unlabeled');

    expect(results[0].title).toBe('Unlabeled');
    expect(results[0].genreLabel).toBeNull();
  });

  it('passes the query and abort signal through to the TMDb client', async () => {
    mockEndpoints({page: 1, results: [], total_pages: 0, total_results: 0});
    const controller = new AbortController();

    await searchMovies('batman', controller.signal);

    expect(mockTmdbGet).toHaveBeenCalledWith(
      '/search/movie',
      {query: 'batman'},
      controller.signal,
    );
  });
});
