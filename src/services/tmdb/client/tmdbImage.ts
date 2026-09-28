const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export function tmdbImageUrl(path: string | null, size: string): string | null {
  return path ? `${IMAGE_BASE_URL}/${size}${path}` : null;
}
