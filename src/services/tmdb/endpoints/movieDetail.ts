import {tmdbGet} from '../client/tmdbClient';
import {tmdbImageUrl} from '../client/tmdbImage';
import type {TMDbMovieDetail} from '../types/movieDetail';
import type {TMDbImage, TMDbImagesResponse} from '../types/movieImages';
import type {TMDbVideosResponse} from '../types/movieVideos';
import {selectTrailerVideo} from '../utils/selectTrailerVideo';
import type {MovieDetail, MovieVideoSummary} from '../../../types/movie';

const MAX_GALLERY_IMAGES = 8;

function selectTrailerKey(response: TMDbVideosResponse | null): string | null {
  if (!response) {
    return null;
  }
  return selectTrailerVideo(response.results)?.key ?? null;
}

function selectLogoUrl(response: TMDbImagesResponse | null): string | null {
  if (!response || response.logos.length === 0) {
    return null;
  }
  const preferred: TMDbImage =
    response.logos.find(logo => logo.iso_639_1 === 'en') ??
    response.logos.find(logo => logo.iso_639_1 === null) ??
    response.logos[0];
  return tmdbImageUrl(preferred.file_path, 'w500');
}

function mapVideos(response: TMDbVideosResponse | null): MovieVideoSummary[] {
  if (!response) {
    return [];
  }
  return response.results
    .filter(video => video.site === 'YouTube')
    .map(video => ({
      key: video.key,
      name: video.name,
      type: video.type,
      thumbnailUrl: `https://img.youtube.com/vi/${video.key}/hqdefault.jpg`,
    }));
}

function mapGalleryImages(response: TMDbImagesResponse | null): string[] {
  if (!response) {
    return [];
  }
  return response.backdrops
    .slice(0, MAX_GALLERY_IMAGES)
    .map(image => tmdbImageUrl(image.file_path, 'w780'))
    .filter((url): url is string => url !== null);
}

export async function fetchMovieDetail(movieId: number): Promise<MovieDetail> {
  const [detail, videos, images] = await Promise.all([
    tmdbGet<TMDbMovieDetail>(`/movie/${movieId}`),
    tmdbGet<TMDbVideosResponse>(`/movie/${movieId}/videos`).catch(() => null),
    tmdbGet<TMDbImagesResponse>(`/movie/${movieId}/images`).catch(() => null),
  ]);

  return {
    id: detail.id,
    title: detail.title,
    releaseDate: detail.release_date,
    overview: detail.overview,
    voteAverage: detail.vote_average,
    posterUrl: tmdbImageUrl(detail.poster_path, 'w342'),
    backdropUrl: tmdbImageUrl(detail.backdrop_path, 'w1280'),
    runtime: detail.runtime,
    genres: detail.genres?.map(genre => genre.name) ?? [],
    trailerVideoKey: selectTrailerKey(videos),
    logoUrl: selectLogoUrl(images),
    videos: mapVideos(videos),
    galleryImages: mapGalleryImages(images),
  };
}
