import {tmdbGet} from '../../client/tmdbClient';
import {fetchMovieDetail} from '../movieDetail';

jest.mock('../../client/tmdbClient');

const mockTmdbGet = tmdbGet as jest.MockedFunction<typeof tmdbGet>;

const baseDetail = {
  id: 1,
  title: "The King's Man",
  overview: 'A secret origin story.',
  release_date: '2021-12-22',
  vote_average: 7.2,
  runtime: 131,
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  genres: [
    {id: 1, name: 'Action'},
    {id: 2, name: 'Thriller'},
  ],
};

const videosWithOfficialTrailer = {
  id: 1,
  results: [
    {id: 'a', key: 'teaser-key', site: 'YouTube', type: 'Teaser', official: false},
    {id: 'b', key: 'official-key', site: 'YouTube', type: 'Trailer', official: true},
    {id: 'c', key: 'other-key', site: 'YouTube', type: 'Trailer', official: false},
  ],
};

const imagesWithLogos = {
  id: 1,
  backdrops: [],
  posters: [],
  logos: [
    {file_path: '/logo-fr.png', iso_639_1: 'fr', width: 500, height: 200},
    {file_path: '/logo-en.png', iso_639_1: 'en', width: 500, height: 200},
  ],
};

function mockEndpoints(overrides: {
  detail?: unknown;
  videos?: unknown;
  images?: unknown;
} = {}) {
  mockTmdbGet.mockImplementation((path: string) => {
    if (path.endsWith('/videos')) {
      return Promise.resolve(overrides.videos ?? {id: 1, results: []});
    }
    if (path.endsWith('/images')) {
      return Promise.resolve(overrides.images ?? {id: 1, backdrops: [], posters: [], logos: []});
    }
    return Promise.resolve(overrides.detail ?? baseDetail);
  });
}

describe('fetchMovieDetail', () => {
  afterEach(() => {
    mockTmdbGet.mockReset();
  });

  it('maps the required movie fields', async () => {
    mockEndpoints();
    const movie = await fetchMovieDetail(1);

    expect(movie.id).toBe(1);
    expect(movie.title).toBe("The King's Man");
    expect(movie.overview).toBe('A secret origin story.');
    expect(movie.releaseDate).toBe('2021-12-22');
    expect(movie.genres).toEqual(['Action', 'Thriller']);
    expect(movie.posterUrl).toBe('https://image.tmdb.org/t/p/w342/poster.jpg');
    expect(movie.backdropUrl).toBe('https://image.tmdb.org/t/p/w1280/backdrop.jpg');
  });

  it('prefers the official YouTube trailer', async () => {
    mockEndpoints({videos: videosWithOfficialTrailer});
    const movie = await fetchMovieDetail(1);
    expect(movie.trailerVideoKey).toBe('official-key');
  });

  it('falls back to the first YouTube trailer when none is marked official', async () => {
    mockEndpoints({
      videos: {
        id: 1,
        results: [
          {id: 'a', key: 'first-key', site: 'YouTube', type: 'Trailer', official: false},
          {id: 'b', key: 'second-key', site: 'YouTube', type: 'Trailer', official: false},
        ],
      },
    });
    const movie = await fetchMovieDetail(1);
    expect(movie.trailerVideoKey).toBe('first-key');
  });

  it('returns null trailer when no YouTube trailer exists', async () => {
    mockEndpoints({
      videos: {
        id: 1,
        results: [
          {id: 'a', key: 'clip-key', site: 'YouTube', type: 'Clip', official: false},
        ],
      },
    });
    const movie = await fetchMovieDetail(1);
    expect(movie.trailerVideoKey).toBeNull();
  });

  it('prefers an English logo over other languages', async () => {
    mockEndpoints({images: imagesWithLogos});
    const movie = await fetchMovieDetail(1);
    expect(movie.logoUrl).toBe('https://image.tmdb.org/t/p/w500/logo-en.png');
  });

  it('handles missing genres, overview, poster and backdrop safely', async () => {
    mockEndpoints({
      detail: {
        ...baseDetail,
        genres: undefined,
        overview: '',
        poster_path: null,
        backdrop_path: null,
      },
    });
    const movie = await fetchMovieDetail(1);

    expect(movie.genres).toEqual([]);
    expect(movie.overview).toBe('');
    expect(movie.posterUrl).toBeNull();
    expect(movie.backdropUrl).toBeNull();
  });

  it('does not fail the whole request when videos or images fail', async () => {
    mockTmdbGet.mockImplementation((path: string) => {
      if (path.endsWith('/videos') || path.endsWith('/images')) {
        return Promise.reject(new Error('optional endpoint down'));
      }
      return Promise.resolve(baseDetail);
    });

    const movie = await fetchMovieDetail(1);
    expect(movie.title).toBe("The King's Man");
    expect(movie.trailerVideoKey).toBeNull();
    expect(movie.logoUrl).toBeNull();
  });

  it('rejects when the required detail request fails', async () => {
    mockTmdbGet.mockImplementation((path: string) => {
      if (path === '/movie/1') {
        return Promise.reject(new Error('detail down'));
      }
      return Promise.resolve({id: 1, results: []});
    });

    await expect(fetchMovieDetail(1)).rejects.toThrow('detail down');
  });
});
