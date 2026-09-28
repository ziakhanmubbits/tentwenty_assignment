import {tmdbGet} from '../client/tmdbClient';
import {tmdbImageUrl} from '../client/tmdbImage';
import type {TMDbMovie, TMDbUpcomingMoviesResponse} from '../types/upcomingMovies';
import type {Movie} from '../../../types/movie';

function mapTMDbMovieToMovie(raw: TMDbMovie): Movie {
  return {
    id: raw.id,
    title: raw.title,
    releaseDate: raw.release_date,
    overview: raw.overview,
    voteAverage: raw.vote_average,
    posterUrl: tmdbImageUrl(raw.poster_path, 'w342'),
    backdropUrl: tmdbImageUrl(raw.backdrop_path, 'w780'),
  };
}

export async function fetchUpcomingMovies(page = 1): Promise<Movie[]> {
  const response = await tmdbGet<TMDbUpcomingMoviesResponse>('/movie/upcoming', {
    page,
  });
  return response.results.map(mapTMDbMovieToMovie);
}
