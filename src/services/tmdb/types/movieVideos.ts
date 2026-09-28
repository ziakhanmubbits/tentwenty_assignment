export interface TMDbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TMDbVideosResponse {
  id: number;
  results: TMDbVideo[];
}
