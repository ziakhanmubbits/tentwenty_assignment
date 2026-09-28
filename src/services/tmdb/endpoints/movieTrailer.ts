import {tmdbGet} from '../client/tmdbClient';
import type {TMDbVideo, TMDbVideosResponse} from '../types/movieVideos';
import {selectTrailerVideo} from '../utils/selectTrailerVideo';

export async function fetchMovieTrailerVideo(movieId: number): Promise<TMDbVideo | null> {
  const response = await tmdbGet<TMDbVideosResponse>(`/movie/${movieId}/videos`);
  return selectTrailerVideo(response.results);
}
