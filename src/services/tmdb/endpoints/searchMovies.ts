import {tmdbGet} from '../client/tmdbClient';
import {tmdbImageUrl} from '../client/tmdbImage';
import {fetchGenreMap} from './genres';
import type {TMDbSearchMovie, TMDbSearchMoviesResponse} from '../types/searchMovies';
import type {MovieSearchResult} from '../../../types/movie';

function mapToSearchResult(
  raw: TMDbSearchMovie,
  genreMap: Record<number, string>,
): MovieSearchResult {
  const firstGenreId = raw.genre_ids?.[0];
  return {
    id: raw.id,
    title: raw.title,
    releaseDate: raw.release_date,
    overview: raw.overview,
    voteAverage: raw.vote_average,
    posterUrl: tmdbImageUrl(raw.poster_path, 'w185'),
    backdropUrl: tmdbImageUrl(raw.backdrop_path, 'w780'),
    genreLabel: firstGenreId !== undefined ? genreMap[firstGenreId] ?? null : null,
  };
}

export async function searchMovies(
  query: string,
  signal?: AbortSignal,
): Promise<MovieSearchResult[]> {
  const [response, genreMap] = await Promise.all([
    tmdbGet<TMDbSearchMoviesResponse>('/search/movie', {query}, signal),
    fetchGenreMap().catch(() => ({})),
  ]);

  return response.results.map(raw => mapToSearchResult(raw, genreMap));
}
