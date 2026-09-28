import {tmdbGet} from '../../client/tmdbClient';
import {fetchMovieTrailerVideo} from '../movieTrailer';

jest.mock('../../client/tmdbClient');

const mockTmdbGet = tmdbGet as jest.MockedFunction<typeof tmdbGet>;

describe('fetchMovieTrailerVideo', () => {
  afterEach(() => {
    mockTmdbGet.mockReset();
  });

  it('requests videos for the given movie id and selects the best trailer', async () => {
    mockTmdbGet.mockResolvedValue({
      id: 7,
      results: [
        {id: 'a', key: 'teaser-key', site: 'YouTube', type: 'Teaser', official: false},
        {id: 'b', key: 'trailer-key', site: 'YouTube', type: 'Trailer', official: true},
      ],
    });

    const video = await fetchMovieTrailerVideo(7);

    expect(mockTmdbGet).toHaveBeenCalledWith('/movie/7/videos');
    expect(video?.key).toBe('trailer-key');
  });

  it('returns null when there is nothing suitable to play', async () => {
    mockTmdbGet.mockResolvedValue({id: 7, results: []});
    const video = await fetchMovieTrailerVideo(7);
    expect(video).toBeNull();
  });
});
