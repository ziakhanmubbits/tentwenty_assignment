import {tmdbGet} from '../client/tmdbClient';
import type {TMDbGenre} from '../types/movieDetail';

interface TMDbGenreListResponse {
  genres: TMDbGenre[];
}

let cachedGenreMap: Record<number, string> | null = null;

export async function fetchGenreMap(): Promise<Record<number, string>> {
  if (cachedGenreMap) {
    return cachedGenreMap;
  }

  const response = await tmdbGet<TMDbGenreListResponse>('/genre/movie/list');
  const map: Record<number, string> = {};
  response.genres.forEach(genre => {
    map[genre.id] = genre.name;
  });

  cachedGenreMap = map;
  return map;
}

export function resetGenreMapCacheForTests(): void {
  cachedGenreMap = null;
}
