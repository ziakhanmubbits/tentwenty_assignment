export interface Movie {
  id: number;
  title: string;
  releaseDate: string;
  overview: string;
  voteAverage: number;
  posterUrl: string | null;
  backdropUrl: string | null;
}

export interface MovieVideoSummary {
  key: string;
  name: string;
  type: string;
  thumbnailUrl: string;
}

export interface MovieDetail extends Movie {
  runtime: number | null;
  genres: string[];
  logoUrl: string | null;
  trailerVideoKey: string | null;
  videos: MovieVideoSummary[];
  galleryImages: string[];
}

export interface MovieSearchResult extends Movie {
  genreLabel: string | null;
}
