type Rating = 'safe' | 'suggestive' | 'borderline' | 'explicit';

interface CommandOptionsValues {
  total: number;
  concurrency: number;
  downloadDir: string;
  rating: Rating;
}

interface NekosapiResponse {
  id: number;
  url: string;
  rating: Rating;
  color_dominant: number[];
  color_palette: Array<number[]>;
  artist_name: null;
  tags: string[];
  source_url: null;
}
