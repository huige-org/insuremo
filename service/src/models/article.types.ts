export interface Article {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  cover_url: string | null;
  category: string | null;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  like_count: number;
  share_count: number;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleDTO {
  title: string;
  summary?: string;
  content: string;
  cover_url?: string;
  category?: string;
  tags?: string[];
}

export interface UpdateArticleDTO {
  title?: string;
  summary?: string;
  content?: string;
  cover_url?: string;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}
