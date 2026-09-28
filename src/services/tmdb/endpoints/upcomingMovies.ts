import {tmdbGet} from '../client/tmdbClient';
import type {TMDbMovie, TMDbUpcomingMoviesResponse} from '../types/upcomingMovies';
import type {Movie} from '../../../types/movie';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

function mapTMDbMovieToMovie(raw: TMDbMovie): Movie {
  return {
    id: raw.id,
    title: raw.title,
    releaseDate: raw.release_date,
    overview: raw.overview,
    voteAverage: raw.vote_average,
    posterUrl: raw.poster_path ? `${IMAGE_BASE_URL}/w342${raw.poster_path}` : null,
    backdropUrl: raw.backdrop_path ? `${IMAGE_BASE_URL}/w780${raw.backdrop_path}` : null,
  };
}

export async function fetchUpcomingMovies(page = 1): Promise<Movie[]> {
  const response = await tmdbGet<TMDbUpcomingMoviesResponse>('/movie/upcoming', {
    page,
  });
  return response.results.map(mapTMDbMovieToMovie);
}
