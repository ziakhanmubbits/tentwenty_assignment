export interface TMDbImage {
  file_path: string;
  iso_639_1: string | null;
  width: number;
  height: number;
}

export interface TMDbImagesResponse {
  id: number;
  backdrops: TMDbImage[];
  posters: TMDbImage[];
  logos: TMDbImage[];
}
