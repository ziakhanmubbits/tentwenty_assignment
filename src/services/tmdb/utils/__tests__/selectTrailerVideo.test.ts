import {selectTrailerVideo} from '../selectTrailerVideo';
import type {TMDbVideo} from '../../types/movieVideos';

function video(overrides: Partial<TMDbVideo>): TMDbVideo {
  return {
    id: 'id',
    key: 'key',
    name: 'Video',
    site: 'YouTube',
    type: 'Trailer',
    official: false,
    ...overrides,
  };
}

describe('selectTrailerVideo', () => {
  it('prefers an official YouTube trailer over everything else', () => {
    const videos = [
      video({key: 'teaser', type: 'Teaser', official: true}),
      video({key: 'unofficial-trailer', type: 'Trailer', official: false}),
      video({key: 'official-trailer', type: 'Trailer', official: true}),
    ];
    expect(selectTrailerVideo(videos)?.key).toBe('official-trailer');
  });

  it('falls back to any YouTube trailer when no official one exists', () => {
    const videos = [
      video({key: 'first-trailer', type: 'Trailer', official: false}),
      video({key: 'second-trailer', type: 'Trailer', official: false}),
    ];
    expect(selectTrailerVideo(videos)?.key).toBe('first-trailer');
  });

  it('falls back to an official teaser when there is no trailer at all', () => {
    const videos = [
      video({key: 'clip', type: 'Clip', official: false}),
      video({key: 'official-teaser', type: 'Teaser', official: true}),
    ];
    expect(selectTrailerVideo(videos)?.key).toBe('official-teaser');
  });

  it('falls back to any teaser when there is no trailer or official teaser', () => {
    const videos = [
      video({key: 'featurette', type: 'Featurette', official: false}),
      video({key: 'teaser', type: 'Teaser', official: false}),
    ];
    expect(selectTrailerVideo(videos)?.key).toBe('teaser');
  });

  it('falls back to any other YouTube video as a last resort', () => {
    const videos = [video({key: 'clip', type: 'Clip', official: false})];
    expect(selectTrailerVideo(videos)?.key).toBe('clip');
  });

  it('ignores non-YouTube videos entirely', () => {
    const videos = [
      video({key: 'vimeo-trailer', type: 'Trailer', official: true, site: 'Vimeo'}),
    ];
    expect(selectTrailerVideo(videos)).toBeNull();
  });

  it('returns null when there are no videos at all', () => {
    expect(selectTrailerVideo([])).toBeNull();
  });

  it('does not blindly pick the first video in the list when a better match exists later', () => {
    const videos = [
      video({key: 'behind-the-scenes', type: 'Featurette', official: false}),
      video({key: 'the-real-trailer', type: 'Trailer', official: true}),
    ];
    expect(selectTrailerVideo(videos)?.key).toBe('the-real-trailer');
  });
});
