import {tmdbGet} from '../../client/tmdbClient';
import {fetchGenreMap, resetGenreMapCacheForTests} from '../genres';

jest.mock('../../client/tmdbClient');

const mockTmdbGet = tmdbGet as jest.MockedFunction<typeof tmdbGet>;

describe('fetchGenreMap', () => {
  beforeEach(() => {
    resetGenreMapCacheForTests();
  });

  afterEach(() => {
    mockTmdbGet.mockReset();
  });

  it('builds an id-to-name map from the genre list', async () => {
    mockTmdbGet.mockResolvedValue({
      genres: [
        {id: 28, name: 'Action'},
        {id: 35, name: 'Comedy'},
      ],
    });

    const map = await fetchGenreMap();

    expect(map).toEqual({28: 'Action', 35: 'Comedy'});
  });

  it('only requests the genre list once and reuses the cached result', async () => {
    mockTmdbGet.mockResolvedValue({genres: [{id: 28, name: 'Action'}]});

    await fetchGenreMap();
    await fetchGenreMap();

    expect(mockTmdbGet).toHaveBeenCalledTimes(1);
  });
});
