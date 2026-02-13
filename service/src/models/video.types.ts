export interface Video {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  video_url: string;
  duration: number | null;
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

export interface CreateVideoDTO {
  title: string;
  description?: string;
  cover_url?: string;
  video_url: string;
  duration?: number;
  category?: string;
  tags?: string[];
}

export interface UpdateVideoDTO {
  title?: string;
  description?: string;
  cover_url?: string;
  video_url?: string;
  duration?: number;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}
