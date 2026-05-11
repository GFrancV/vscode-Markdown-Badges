export interface Badge {
  id: string;
  name: string;
  url: string;
  markdown: string;
  categories: string[];
}

export interface ApiResponse {
  total: number;
  count: number;
  data: Badge[];
}
