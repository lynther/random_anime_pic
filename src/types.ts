export type Rating = 'safe' | 'suggestive' | 'borderline' | 'explicit';

export interface CommandOptionsValues {
  total: number;
  concurrency: number;
  downloadDir: string;
  rating: Rating;
}

export interface NekosapiResponse {
  id: number;
  url: string;
  rating: Rating;
  color_dominant: number[];
  color_palette: Array<number[]>;
  artist_name: null;
  tags: string[];
  source_url: null;
}
