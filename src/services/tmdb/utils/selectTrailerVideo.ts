import type {TMDbVideo} from '../types/movieVideos';

export function selectTrailerVideo(videos: TMDbVideo[]): TMDbVideo | null {
  const youtubeVideos = videos.filter(video => video.site === 'YouTube');

  const officialTrailer = youtubeVideos.find(
    video => video.type === 'Trailer' && video.official,
  );
  if (officialTrailer) {
    return officialTrailer;
  }

  const trailer = youtubeVideos.find(video => video.type === 'Trailer');
  if (trailer) {
    return trailer;
  }

  const officialTeaser = youtubeVideos.find(
    video => video.type === 'Teaser' && video.official,
  );
  if (officialTeaser) {
    return officialTeaser;
  }

  const teaser = youtubeVideos.find(video => video.type === 'Teaser');
  if (teaser) {
    return teaser;
  }

  return youtubeVideos[0] ?? null;
}
